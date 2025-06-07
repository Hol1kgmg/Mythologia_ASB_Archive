/**
 * DrizzleAdminRepository実装
 * 既存のAdminRepositoryインターフェースを実装
 */

import { eq, and, like, desc, count } from 'drizzle-orm';
import type { AdminRepository } from '../../../domain/repositories/AdminRepository';
import type { Admin, AdminSession, AdminActivityLog } from '../../../domain/models/Admin';
import { AdminMapper } from '../../../domain/mappers/AdminMapper';
import type { DrizzleClient } from './client';
import {
  adminsTablePg,
  adminSessionsTablePg,
  adminActivityLogsTablePg,
  adminsTableSqlite,
  adminSessionsTableSqlite,
  adminActivityLogsTableSqlite,
  type AdminSelectPg,
  type AdminInsertPg,
  type AdminSelectSqlite,
  type AdminInsertSqlite
} from '../../../../drizzle/schema/admin';

export class DrizzleAdminRepository implements AdminRepository {
  constructor(private client: DrizzleClient) {}

  async findById(id: string): Promise<Admin | null> {
    try {
      const results = this.client.type === 'postgresql'
        ? await this.client.db.select().from(adminsTablePg).where(eq(adminsTablePg.id, id)).limit(1)
        : await this.client.db.select().from(adminsTableSqlite).where(eq(adminsTableSqlite.id, id)).limit(1);

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
        ? await this.client.db.select().from(adminsTablePg).where(eq(adminsTablePg.username, username)).limit(1)
        : await this.client.db.select().from(adminsTableSqlite).where(eq(adminsTableSqlite.username, username)).limit(1);

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
        ? await this.client.db.select().from(adminsTablePg).where(eq(adminsTablePg.email, email)).limit(1)
        : await this.client.db.select().from(adminsTableSqlite).where(eq(adminsTableSqlite.email, email)).limit(1);

      if (results.length === 0) {
        return null;
      }

      return AdminMapper.toDomain(results[0]);
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw new Error('Failed to find admin');
    }
  }

  async findAll(filters?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<{ admins: Admin[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;

      // 条件構築
      const conditions = [];
      if (filters?.role) {
        const roleCondition = this.client.type === 'postgresql'
          ? eq(adminsTablePg.role, filters.role as any)
          : eq(adminsTableSqlite.role, filters.role as any);
        conditions.push(roleCondition);
      }
      if (filters?.isActive !== undefined) {
        const activeCondition = this.client.type === 'postgresql'
          ? eq(adminsTablePg.isActive, filters.isActive)
          : eq(adminsTableSqlite.isActive, filters.isActive);
        conditions.push(activeCondition);
      }
      if (filters?.search) {
        const searchCondition = this.client.type === 'postgresql'
          ? like(adminsTablePg.username, `%${filters.search}%`)
          : like(adminsTableSqlite.username, `%${filters.search}%`);
        conditions.push(searchCondition);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // データ取得
      const [results, totalResults] = await Promise.all([
        this.client.type === 'postgresql'
          ? this.client.db
              .select()
              .from(adminsTablePg)
              .where(whereClause)
              .orderBy(desc(adminsTablePg.createdAt))
              .limit(limit)
              .offset(offset)
          : this.client.db
              .select()
              .from(adminsTableSqlite)
              .where(whereClause)
              .orderBy(desc(adminsTableSqlite.createdAt))
              .limit(limit)
              .offset(offset),
        
        this.client.type === 'postgresql'
          ? this.client.db.select({ count: count() }).from(adminsTablePg).where(whereClause)
          : this.client.db.select({ count: count() }).from(adminsTableSqlite).where(whereClause)
      ]);

      const admins = results.map(result => AdminMapper.toDomain(result));
      const total = totalResults[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        admins,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error finding all admins:', error);
      throw new Error('Failed to find admins');
    }
  }

  async create(admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Promise<Admin> {
    try {
      const id = crypto.randomUUID();
      const now = new Date();

      const insertData = this.client.type === 'postgresql'
        ? {
            id,
            username: admin.username,
            email: admin.email,
            passwordHash: admin.passwordHash,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
            isSuperAdmin: admin.isSuperAdmin,
            createdBy: admin.createdBy,
            lastLoginAt: admin.lastLoginAt,
            createdAt: now,
            updatedAt: now
          } satisfies AdminInsertPg
        : {
            id,
            username: admin.username,
            email: admin.email,
            passwordHash: admin.passwordHash,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
            isSuperAdmin: admin.isSuperAdmin,
            createdBy: admin.createdBy,
            lastLoginAt: admin.lastLoginAt,
            createdAt: now,
            updatedAt: now
          } satisfies AdminInsertSqlite;

      const results = this.client.type === 'postgresql'
        ? await this.client.db.insert(adminsTablePg).values(insertData).returning()
        : await this.client.db.insert(adminsTableSqlite).values(insertData).returning();

      return AdminMapper.toDomain(results[0]);
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error('Failed to create admin');
    }
  }

  async update(id: string, updates: Partial<Omit<Admin, 'id' | 'createdAt'>>): Promise<Admin> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      const results = this.client.type === 'postgresql'
        ? await this.client.db
            .update(adminsTablePg)
            .set(updateData)
            .where(eq(adminsTablePg.id, id))
            .returning()
        : await this.client.db
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

  // セッション管理メソッド（将来実装予定）
  async createSession(session: Omit<AdminSession, 'id' | 'createdAt'>): Promise<AdminSession> {
    // TODO: セッション作成実装
    throw new Error('Session creation not implemented yet');
  }

  async findSessionById(sessionId: string): Promise<AdminSession | null> {
    // TODO: セッション検索実装
    throw new Error('Session find not implemented yet');
  }

  async deleteSession(sessionId: string): Promise<void> {
    // TODO: セッション削除実装
    throw new Error('Session deletion not implemented yet');
  }

  // アクティビティログメソッド（将来実装予定）
  async createActivityLog(log: Omit<AdminActivityLog, 'id' | 'createdAt'>): Promise<AdminActivityLog> {
    // TODO: アクティビティログ作成実装
    throw new Error('Activity log creation not implemented yet');
  }

  async findActivityLogs(adminId: string, filters?: {
    page?: number;
    limit?: number;
  }): Promise<{ logs: AdminActivityLog[]; total: number; page: number; limit: number; totalPages: number }> {
    // TODO: アクティビティログ検索実装
    throw new Error('Activity log search not implemented yet');
  }
}