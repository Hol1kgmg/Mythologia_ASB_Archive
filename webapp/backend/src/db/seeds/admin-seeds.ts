/**
 * 管理者テーブル用シードデータ生成
 */

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { admins, type NewAdmin } from '../schema/admin';
import { logger } from '../../utils/logger';

// ダミーデータ生成用の定数
const ADMIN_ROLES = ['super_admin', 'admin', 'viewer'] as const;
const DEMO_PASSWORD = 'Demo123!@#'; // 開発環境用の共通パスワード

// 権限のテンプレート
const PERMISSION_TEMPLATES = {
  super_admin: ['*'], // すべての権限
  admin: [
    'users:read',
    'users:write',
    'content:read',
    'content:write',
    'reports:read',
  ],
  viewer: [
    'users:read',
    'content:read',
    'reports:read',
  ],
};

interface AdminSeedOptions {
  clearExisting?: boolean;
  count?: number;
}

/**
 * 管理者ダミーデータを生成
 */
export async function seedAdmins(
  db: PostgresJsDatabase<any>,
  options: AdminSeedOptions = {}
): Promise<void> {
  const { clearExisting = false, count = 5 } = options;

  try {
    // パスワードハッシュを事前に生成（同じハッシュを使い回す）
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // 既存データのクリア（オプション）
    if (clearExisting) {
      logger.warn('Clearing existing admin data...');
      await db.delete(admins);
    }

    // 既存のスーパー管理者をチェック
    const existingSuperAdmin = await db.select().from(admins).where(eq(admins.username, 'super_admin'));
    
    let superAdmin;
    if (existingSuperAdmin.length > 0) {
      logger.info('Super admin already exists, skipping creation');
      superAdmin = existingSuperAdmin;
    } else {
      // スーパー管理者を新規作成
      const superAdminData: NewAdmin = {
        username: 'super_admin',
        email: 'super@mythologia.test',
        passwordHash,
        role: 'super_admin',
        permissions: PERMISSION_TEMPLATES.super_admin,
        isActive: true,
        isSuperAdmin: true,
        createdBy: null,
        lastLoginAt: null,
      };

      superAdmin = await db.insert(admins).values(superAdminData).returning();
      logger.info(`Created super admin: ${superAdmin[0].username}`);
    }

    // 追加の管理者を生成
    const additionalAdmins: NewAdmin[] = [];
    let createdCount = 0;
    
    for (let i = 1; i < count; i++) {
      const username = `admin_${i}`;
      const email = `admin${i}@mythologia.test`;
      
      // 既存の管理者をチェック
      const existingAdmin = await db.select().from(admins).where(eq(admins.username, username));
      
      if (existingAdmin.length > 0) {
        logger.info(`Admin ${username} already exists, skipping`);
        continue;
      }
      
      const role = ADMIN_ROLES[i % ADMIN_ROLES.length];
      const adminData: NewAdmin = {
        username,
        email,
        passwordHash,
        role,
        permissions: PERMISSION_TEMPLATES[role],
        isActive: i % 5 !== 0, // 5人に1人は非アクティブ
        isSuperAdmin: false,
        createdBy: superAdmin[0].id,
        lastLoginAt: i % 3 === 0 ? new Date() : null, // 3人に1人は最近ログイン
      };
      
      try {
        const created = await db.insert(admins).values(adminData).returning();
        logger.info(`Created admin: ${created[0].username}`);
        createdCount++;
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          logger.warn(`Admin ${username} already exists (race condition), skipping`);
        } else {
          throw error;
        }
      }
    }

    if (createdCount > 0) {
      logger.info(`Created ${createdCount} additional admins`);
    }

    // 作成したデータのサマリーを表示
    const adminCount = await db.select({ count: admins.id }).from(admins);
    logger.info(`Total admins in database: ${adminCount.length}`);
    
    // 開発環境での認証情報を表示
    logger.info('='.repeat(60));
    logger.info('🔐 Demo Admin Credentials (Development Only):');
    logger.info('='.repeat(60));
    logger.info('Super Admin:');
    logger.info('  Username: super_admin');
    logger.info('  Email: super@mythologia.test');
    logger.info(`  Password: ${DEMO_PASSWORD}`);
    logger.info('-'.repeat(60));
    logger.info('Regular Admins:');
    logger.info('  Username: admin_1, admin_2, ...');
    logger.info('  Email: admin1@mythologia.test, admin2@mythologia.test, ...');
    logger.info(`  Password: ${DEMO_PASSWORD}`);
    logger.info('='.repeat(60));

  } catch (error) {
    logger.error('Failed to seed admins:', error);
    throw error;
  }
}

/**
 * 特定の管理者を作成（テスト用）
 */
export async function createTestAdmin(
  db: PostgresJsDatabase<any>,
  data: {
    username: string;
    email: string;
    password?: string;
    role?: typeof ADMIN_ROLES[number];
    permissions?: string[];
  }
) {
  const passwordHash = await bcrypt.hash(data.password || DEMO_PASSWORD, 10);
  
  const adminData: NewAdmin = {
    username: data.username,
    email: data.email,
    passwordHash,
    role: data.role || 'admin',
    permissions: data.permissions || PERMISSION_TEMPLATES[data.role || 'admin'],
    isActive: true,
    isSuperAdmin: data.role === 'super_admin',
    createdBy: null,
    lastLoginAt: null,
  };
  
  const admin = await db.insert(admins).values(adminData).returning();

  logger.info(`Created test admin: ${admin[0].username}`);
  return admin[0];
}

/**
 * デモ用のログイン履歴を生成
 */
export async function generateLoginHistory(
  db: PostgresJsDatabase<any>,
  adminId: string,
  count: number = 10
) {
  const loginDates = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30); // 過去30日間
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    loginDates.push(date);
  }

  // 最新のログイン日時で更新
  await db.update(admins)
    .set({ lastLoginAt: loginDates[0] })
    .where(eq(admins.id, adminId));

  logger.info(`Generated ${count} login history entries for admin ${adminId}`);
}