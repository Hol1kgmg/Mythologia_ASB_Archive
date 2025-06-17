/**
 * 管理者テーブル用シードデータ生成
 */

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { admins } from '../schema/admin';
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
  db: PostgresJsDatabase,
  options: AdminSeedOptions = {}
): Promise<void> {
  const { clearExisting = false, count = 5 } = options;

  try {
    // 既存データのクリア（オプション）
    if (clearExisting) {
      logger.warn('Clearing existing admin data...');
      await db.delete(admins);
    }

    // パスワードハッシュを事前に生成（同じハッシュを使い回す）
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // スーパー管理者を最初に作成
    const superAdmin = await db.insert(admins).values({
      username: 'super_admin',
      email: 'super@mythologia.test',
      passwordHash,
      role: 'super_admin',
      permissions: PERMISSION_TEMPLATES.super_admin,
      isActive: true,
      isSuperAdmin: true,
    }).returning();

    logger.info(`Created super admin: ${superAdmin[0].username}`);

    // 追加の管理者を生成
    const additionalAdmins = [];
    for (let i = 1; i < count; i++) {
      const role = ADMIN_ROLES[i % ADMIN_ROLES.length];
      const adminData = {
        username: `admin_${i}`,
        email: `admin${i}@mythologia.test`,
        passwordHash,
        role,
        permissions: PERMISSION_TEMPLATES[role],
        isActive: i % 5 !== 0, // 5人に1人は非アクティブ
        isSuperAdmin: false,
        createdBy: superAdmin[0].id,
        lastLoginAt: i % 3 === 0 ? new Date() : null, // 3人に1人は最近ログイン
      };
      additionalAdmins.push(adminData);
    }

    if (additionalAdmins.length > 0) {
      const created = await db.insert(admins).values(additionalAdmins).returning();
      logger.info(`Created ${created.length} additional admins`);
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
  db: PostgresJsDatabase,
  data: {
    username: string;
    email: string;
    password?: string;
    role?: typeof ADMIN_ROLES[number];
    permissions?: string[];
  }
) {
  const passwordHash = await bcrypt.hash(data.password || DEMO_PASSWORD, 10);
  
  const admin = await db.insert(admins).values({
    username: data.username,
    email: data.email,
    passwordHash,
    role: data.role || 'admin',
    permissions: data.permissions || PERMISSION_TEMPLATES[data.role || 'admin'],
    isActive: true,
    isSuperAdmin: data.role === 'super_admin',
  }).returning();

  logger.info(`Created test admin: ${admin[0].username}`);
  return admin[0];
}

/**
 * デモ用のログイン履歴を生成
 */
export async function generateLoginHistory(
  db: PostgresJsDatabase,
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