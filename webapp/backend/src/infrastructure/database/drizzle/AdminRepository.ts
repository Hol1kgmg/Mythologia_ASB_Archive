/**
 * DrizzleAdminRepository実装
 * 既存のAdminRepositoryインターフェースを実装
 */

import { eq, and, like, desc, count } from 'drizzle-orm';
import type { 
  AdminRepository, 
  CreateAdminParams, 
  UpdateAdminParams, 
  AdminFilters,
  CreateSessionParams,
  LogActivityParams
} from '../../../domain/repositories/AdminRepository';
import type { Admin, AdminSession, AdminActivityLog } from '../../../domain/models/Admin';
import { AdminMapper } from '../../../domain/mappers/AdminMapper';
import type { DrizzleClient, PostgreSQLDB, D1DB } from './client';
import {
  adminsTablePg,
  adminSessionsTablePg,
  adminActivityLogsTablePg,
  adminsTableSqlite,
  adminSessionsTableSqlite,
  adminActivityLogsTableSqlite,
  type AdminInsertPg,
  type AdminInsertSqlite
} from '../../../../drizzle/schema/admin';

export class DrizzleAdminRepository implements AdminRepository {
  constructor(private client: DrizzleClient) {}

  // 型安全なクエリヘルパー
  private get pgDb() {
    return this.client.db as PostgreSQLDB;
  }

  private get d1Db() {
    return this.client.db as D1DB;
  }

  async findById(id: string): Promise<Admin | null> {
    try {
      const results = this.client.type === 'postgresql'
        ? await this.pgDb.select().from(adminsTablePg).where(eq(adminsTablePg.id, id)).limit(1)
        : await this.d1Db.select().from(adminsTableSqlite).where(eq(adminsTableSqlite.id, id)).limit(1);

      if (results.length === 0) {
        return null;
      }

      return AdminMapper.toDomain(results[0]);
    } catch (error) {
      console.error('Error finding admin by ID:', error);
      throw new Error('Failed to find admin');
    }
  }

  async findByUsername(username: string): Promise<Admin | null> {
    try {
      const results = this.client.type === 'postgresql'
        ? await this.pgDb.select().from(adminsTablePg).where(eq(adminsTablePg.username, username)).limit(1)
        : await this.d1Db.select().from(adminsTableSqlite).where(eq(adminsTableSqlite.username, username)).limit(1);

      if (results.length === 0) {
        return null;
      }

      return AdminMapper.toDomain(results[0]);
    } catch (error) {
      console.error('Error finding admin by username:', error);
      throw new Error('Failed to find admin');
    }
  }

  async findByEmail(email: string): Promise<Admin | null> {
    try {
      const results = this.client.type === 'postgresql'
        ? await this.pgDb.select().from(adminsTablePg).where(eq(adminsTablePg.email, email)).limit(1)
        : await this.d1Db.select().from(adminsTableSqlite).where(eq(adminsTableSqlite.email, email)).limit(1);

      if (results.length === 0) {
        return null;
      }

      return AdminMapper.toDomain(results[0]);
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw new Error('Failed to find admin');
    }
  }

  async findMany(filters: AdminFilters): Promise<{ admins: Admin[]; total: number }> {
    try {
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;

      // 条件構築
      const conditions = [];
      if (filters.role) {
        const roleCondition = this.client.type === 'postgresql'
          ? eq(adminsTablePg.role, filters.role)
          : eq(adminsTableSqlite.role, filters.role);
        conditions.push(roleCondition);
      }
      if (filters.isActive !== undefined) {
        const activeCondition = this.client.type === 'postgresql'
          ? eq(adminsTablePg.isActive, filters.isActive)
          : eq(adminsTableSqlite.isActive, filters.isActive);
        conditions.push(activeCondition);
      }
      if (filters.createdBy) {
        const createdByCondition = this.client.type === 'postgresql'
          ? eq(adminsTablePg.createdBy, filters.createdBy)
          : eq(adminsTableSqlite.createdBy, filters.createdBy);
        conditions.push(createdByCondition);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // データ取得
      const [results, totalResults] = await Promise.all([
        this.client.type === 'postgresql'
          ? this.pgDb
              .select()
              .from(adminsTablePg)
              .where(whereClause)
              .orderBy(desc(adminsTablePg.createdAt))
              .limit(limit)
              .offset(offset)
          : this.d1Db
              .select()
              .from(adminsTableSqlite)
              .where(whereClause)
              .orderBy(desc(adminsTableSqlite.createdAt))
              .limit(limit)
              .offset(offset),
        
        this.client.type === 'postgresql'
          ? this.pgDb.select({ count: count() }).from(adminsTablePg).where(whereClause)
          : this.d1Db.select({ count: count() }).from(adminsTableSqlite).where(whereClause)
      ]);

      const admins = results.map((result: any) => AdminMapper.toDomain(result));
      const total = totalResults[0]?.count || 0;

      return {
        admins,
        total
      };
    } catch (error) {
      console.error('Error finding many admins:', error);
      throw new Error('Failed to find admins');
    }
  }

  async create(params: CreateAdminParams): Promise<Admin> {
    try {
      const id = crypto.randomUUID();
      const now = new Date();
      const isActive = true; // デフォルトでアクティブ

      const insertData = this.client.type === 'postgresql'
        ? {
            id,
            username: params.username,
            email: params.email,
            passwordHash: params.passwordHash,
            role: params.role,
            permissions: JSON.parse(params.permissions), // JSON stringをオブジェクトに
            isActive,
            isSuperAdmin: params.isSuperAdmin,
            createdBy: params.createdBy,
            lastLoginAt: null,
            createdAt: now,
            updatedAt: now
          } satisfies AdminInsertPg
        : {
            id,
            username: params.username,
            email: params.email,
            passwordHash: params.passwordHash,
            role: params.role,
            permissions: JSON.parse(params.permissions), // JSON stringをオブジェクトに
            isActive,
            isSuperAdmin: params.isSuperAdmin,
            createdBy: params.createdBy,
            lastLoginAt: null,
            createdAt: now,
            updatedAt: now
          } satisfies AdminInsertSqlite;

      const results = this.client.type === 'postgresql'
        ? await this.pgDb.insert(adminsTablePg).values(insertData).returning()
        : await this.d1Db.insert(adminsTableSqlite).values(insertData).returning();

      return AdminMapper.toDomain(results[0]);
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error('Failed to create admin');
    }
  }

  async update(id: string, params: UpdateAdminParams): Promise<Admin> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      };

      // permissionsの処理
      if (params.permissions !== undefined) {
        updateData.permissions = JSON.parse(params.permissions);
      }

      // その他のフィールド
      Object.keys(params).forEach(key => {
        if (key !== 'permissions' && params[key as keyof UpdateAdminParams] !== undefined) {
          updateData[key] = params[key as keyof UpdateAdminParams];
        }
      });

      const results = this.client.type === 'postgresql'
        ? await this.pgDb
            .update(adminsTablePg)
            .set(updateData)
            .where(eq(adminsTablePg.id, id))
            .returning()
        : await this.d1Db
            .update(adminsTableSqlite)
            .set(updateData)
            .where(eq(adminsTableSqlite.id, id))
            .returning();

      if (results.length === 0) {
        throw new Error('Admin not found');
      }

      return AdminMapper.toDomain(results[0]);
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new Error('Failed to update admin');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // 論理削除（isActiveをfalseに設定）
      await this.update(id, { isActive: false });
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw new Error('Failed to delete admin');
    }
  }

  // セッション管理メソッド
  async createSession(params: CreateSessionParams): Promise<AdminSession> {
    // TODO: 実装予定
    throw new Error('Session creation not implemented yet');
  }

  async findSessionByToken(refreshToken: string): Promise<AdminSession | null> {
    // TODO: 実装予定
    throw new Error('Session find not implemented yet');
  }

  async deleteSession(sessionId: string): Promise<void> {
    // TODO: 実装予定
    throw new Error('Session deletion not implemented yet');
  }

  async deleteAdminSessions(adminId: string): Promise<void> {
    // TODO: 実装予定
    throw new Error('Delete admin sessions not implemented yet');
  }

  async cleanupExpiredSessions(): Promise<number> {
    // TODO: 実装予定
    throw new Error('Cleanup expired sessions not implemented yet');
  }

  // アクティビティログメソッド
  async logActivity(params: LogActivityParams): Promise<AdminActivityLog> {
    // TODO: 実装予定
    throw new Error('Activity log creation not implemented yet');
  }

  async getAdminActivity(adminId: string, limit?: number, offset?: number): Promise<{
    logs: AdminActivityLog[];
    total: number;
  }> {
    // TODO: 実装予定
    throw new Error('Activity log search not implemented yet');
  }

  async getSystemActivity(limit?: number, offset?: number): Promise<{
    logs: AdminActivityLog[];
    total: number;
  }> {
    // TODO: 実装予定
    throw new Error('System activity search not implemented yet');
  }

  // 統計・ダッシュボードメソッド
  async getAdminCount(): Promise<number> {
    try {
      const results = this.client.type === 'postgresql'
        ? await this.pgDb.select({ count: count() }).from(adminsTablePg)
        : await this.d1Db.select({ count: count() }).from(adminsTableSqlite);
      
      return results[0]?.count || 0;
    } catch (error) {
      console.error('Error getting admin count:', error);
      throw new Error('Failed to get admin count');
    }
  }

  async getActiveAdminCount(): Promise<number> {
    try {
      const results = this.client.type === 'postgresql'
        ? await this.pgDb
            .select({ count: count() })
            .from(adminsTablePg)
            .where(eq(adminsTablePg.isActive, true))
        : await this.d1Db
            .select({ count: count() })
            .from(adminsTableSqlite)
            .where(eq(adminsTableSqlite.isActive, true));
      
      return results[0]?.count || 0;
    } catch (error) {
      console.error('Error getting active admin count:', error);
      throw new Error('Failed to get active admin count');
    }
  }

  async getRecentLoginCount(hours: number): Promise<number> {
    // TODO: 実装予定
    throw new Error('Recent login count not implemented yet');
  }
}