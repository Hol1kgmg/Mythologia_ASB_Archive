import { eq, and, or, like, desc, ne, count } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { admins, type Admin, type NewAdmin } from '../../db/schema/admin.js';

export interface AdminSearchParams {
  username?: string;
  email?: string;
  role?: 'super_admin' | 'admin' | 'viewer';
  isActive?: boolean;
  isSuperAdmin?: boolean;
  limit?: number;
  offset?: number;
}

export class AdminRepository {
  /**
   * 管理者を作成
   */
  async create(adminData: NewAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(adminData)
      .returning();
    return admin;
  }

  /**
   * IDで管理者を取得
   */
  async findById(id: string): Promise<Admin | null> {
    const adminList = await db
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);
    
    return adminList[0] || null;
  }

  /**
   * ユーザー名で管理者を取得
   */
  async findByUsername(username: string): Promise<Admin | null> {
    const adminList = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);
    
    return adminList[0] || null;
  }

  /**
   * メールアドレスで管理者を取得
   */
  async findByEmail(email: string): Promise<Admin | null> {
    const adminList = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    
    return adminList[0] || null;
  }

  /**
   * ユーザー名またはメールアドレスで管理者を取得
   */
  async findByUsernameOrEmail(usernameOrEmail: string): Promise<Admin | null> {
    const adminList = await db
      .select()
      .from(admins)
      .where(
        or(
          eq(admins.username, usernameOrEmail),
          eq(admins.email, usernameOrEmail)
        )
      )
      .limit(1);
    
    return adminList[0] || null;
  }

  /**
   * 管理者を更新
   */
  async update(id: string, updateData: Partial<NewAdmin>): Promise<Admin | null> {
    const updatedData = {
      ...updateData,
      updatedAt: new Date()
    };

    const [admin] = await db
      .update(admins)
      .set(updatedData)
      .where(eq(admins.id, id))
      .returning();
    
    return admin || null;
  }

  /**
   * 管理者を削除（論理削除）
   */
  async softDelete(id: string): Promise<Admin | null> {
    const [admin] = await db
      .update(admins)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(admins.id, id))
      .returning();
    
    return admin || null;
  }

  /**
   * 管理者を完全削除
   */
  async delete(id: string): Promise<void> {
    await db
      .delete(admins)
      .where(eq(admins.id, id));
  }

  /**
   * 全管理者を取得
   */
  async findAll(): Promise<Admin[]> {
    return await db
      .select()
      .from(admins)
      .orderBy(desc(admins.createdAt));
  }

  /**
   * アクティブな管理者を取得
   */
  async findActive(): Promise<Admin[]> {
    return await db
      .select()
      .from(admins)
      .where(eq(admins.isActive, true))
      .orderBy(desc(admins.createdAt));
  }

  /**
   * スーパー管理者を取得
   */
  async findSuperAdmins(): Promise<Admin[]> {
    return await db
      .select()
      .from(admins)
      .where(
        and(
          eq(admins.isSuperAdmin, true),
          eq(admins.isActive, true)
        )
      )
      .orderBy(desc(admins.createdAt));
  }

  /**
   * 検索条件で管理者を取得
   */
  async search(params: AdminSearchParams): Promise<Admin[]> {
    const conditions = [];
    
    if (params.username) {
      conditions.push(like(admins.username, `%${params.username}%`));
    }
    
    if (params.email) {
      conditions.push(like(admins.email, `%${params.email}%`));
    }
    
    if (params.role) {
      conditions.push(eq(admins.role, params.role));
    }
    
    if (params.isActive !== undefined) {
      conditions.push(eq(admins.isActive, params.isActive));
    }
    
    if (params.isSuperAdmin !== undefined) {
      conditions.push(eq(admins.isSuperAdmin, params.isSuperAdmin));
    }

    if (conditions.length > 0) {
      if (params.limit && params.offset) {
        return await db
          .select()
          .from(admins)
          .where(and(...conditions))
          .orderBy(desc(admins.createdAt))
          .limit(params.limit)
          .offset(params.offset);
      } else if (params.limit) {
        return await db
          .select()
          .from(admins)
          .where(and(...conditions))
          .orderBy(desc(admins.createdAt))
          .limit(params.limit);
      } else {
        return await db
          .select()
          .from(admins)
          .where(and(...conditions))
          .orderBy(desc(admins.createdAt));
      }
    } else {
      if (params.limit && params.offset) {
        return await db
          .select()
          .from(admins)
          .orderBy(desc(admins.createdAt))
          .limit(params.limit)
          .offset(params.offset);
      } else if (params.limit) {
        return await db
          .select()
          .from(admins)
          .orderBy(desc(admins.createdAt))
          .limit(params.limit);
      } else {
        return await db
          .select()
          .from(admins)
          .orderBy(desc(admins.createdAt));
      }
    }
  }

  /**
   * 管理者数をカウント
   */
  async count(params?: AdminSearchParams): Promise<number> {
    if (!params) {
      const result = await db
        .select({ count: count() })
        .from(admins);
      return result[0]?.count || 0;
    }

    const conditions = [];
    
    if (params.username) {
      conditions.push(like(admins.username, `%${params.username}%`));
    }
    
    if (params.email) {
      conditions.push(like(admins.email, `%${params.email}%`));
    }
    
    if (params.role) {
      conditions.push(eq(admins.role, params.role));
    }
    
    if (params.isActive !== undefined) {
      conditions.push(eq(admins.isActive, params.isActive));
    }
    
    if (params.isSuperAdmin !== undefined) {
      conditions.push(eq(admins.isSuperAdmin, params.isSuperAdmin));
    }

    if (conditions.length > 0) {
      const result = await db
        .select({ count: count() })
        .from(admins)
        .where(and(...conditions));
      return result[0]?.count || 0;
    } else {
      const result = await db
        .select({ count: count() })
        .from(admins);
      return result[0]?.count || 0;
    }
  }

  /**
   * 最終ログイン時刻を更新
   */
  async updateLastLogin(id: string): Promise<Admin | null> {
    const [admin] = await db
      .update(admins)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(admins.id, id))
      .returning();
    
    return admin || null;
  }

  /**
   * パスワードハッシュを更新
   */
  async updatePassword(id: string, passwordHash: string): Promise<Admin | null> {
    const [admin] = await db
      .update(admins)
      .set({ 
        passwordHash,
        updatedAt: new Date()
      })
      .where(eq(admins.id, id))
      .returning();
    
    return admin || null;
  }

  /**
   * 権限を更新
   */
  async updatePermissions(id: string, permissions: string[]): Promise<Admin | null> {
    const [admin] = await db
      .update(admins)
      .set({ 
        permissions,
        updatedAt: new Date()
      })
      .where(eq(admins.id, id))
      .returning();
    
    return admin || null;
  }

  /**
   * ロールを更新
   */
  async updateRole(id: string, role: 'super_admin' | 'admin' | 'viewer'): Promise<Admin | null> {
    const [admin] = await db
      .update(admins)
      .set({ 
        role,
        updatedAt: new Date()
      })
      .where(eq(admins.id, id))
      .returning();
    
    return admin || null;
  }

  /**
   * ユーザー名の重複チェック
   */
  async isUsernameExists(username: string, excludeId?: string): Promise<boolean> {
    if (excludeId) {
      const result = await db
        .select({ id: admins.id })
        .from(admins)
        .where(and(eq(admins.username, username), ne(admins.id, excludeId)))
        .limit(1);
      return result.length > 0;
    } else {
      const result = await db
        .select({ id: admins.id })
        .from(admins)
        .where(eq(admins.username, username))
        .limit(1);
      return result.length > 0;
    }
  }

  /**
   * メールアドレスの重複チェック
   */
  async isEmailExists(email: string, excludeId?: string): Promise<boolean> {
    if (excludeId) {
      const result = await db
        .select({ id: admins.id })
        .from(admins)
        .where(and(eq(admins.email, email), ne(admins.id, excludeId)))
        .limit(1);
      return result.length > 0;
    } else {
      const result = await db
        .select({ id: admins.id })
        .from(admins)
        .where(eq(admins.email, email))
        .limit(1);
      return result.length > 0;
    }
  }
}

export const adminRepository = new AdminRepository();