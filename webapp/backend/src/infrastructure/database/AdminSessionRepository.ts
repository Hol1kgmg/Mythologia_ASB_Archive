import { eq, and, gt, lt, count } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { adminSessions, type AdminSession, type NewAdminSession } from '../../db/schema/admin.js';

export class AdminSessionRepository {
  /**
   * セッションを作成
   */
  async create(sessionData: NewAdminSession): Promise<AdminSession> {
    const [session] = await db
      .insert(adminSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  /**
   * トークンでセッションを取得
   */
  async findByToken(token: string): Promise<AdminSession | null> {
    const sessions = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token))
      .limit(1);
    
    return sessions[0] || null;
  }

  /**
   * 有効なセッションを取得（有効期限チェック付き）
   */
  async findValidByToken(token: string): Promise<AdminSession | null> {
    const sessions = await db
      .select()
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.token, token),
          gt(adminSessions.expiresAt, new Date())
        )
      )
      .limit(1);
    
    return sessions[0] || null;
  }

  /**
   * 管理者IDで全セッションを取得
   */
  async findByAdminId(adminId: string): Promise<AdminSession[]> {
    return await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.adminId, adminId))
      .orderBy(adminSessions.createdAt);
  }

  /**
   * 管理者の有効なセッションを取得
   */
  async findValidByAdminId(adminId: string): Promise<AdminSession[]> {
    return await db
      .select()
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.adminId, adminId),
          gt(adminSessions.expiresAt, new Date())
        )
      )
      .orderBy(adminSessions.createdAt);
  }

  /**
   * セッションを削除
   */
  async delete(sessionId: string): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.id, sessionId));
  }

  /**
   * トークンでセッションを削除
   */
  async deleteByToken(token: string): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.token, token));
  }

  /**
   * 管理者の全セッションを削除
   */
  async deleteByAdminId(adminId: string): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.adminId, adminId));
  }

  /**
   * 期限切れセッションを削除
   */
  async deleteExpired(): Promise<number> {
    // 削除前にカウントを取得
    const countResult = await db
      .select({ count: count() })
      .from(adminSessions)
      .where(lt(adminSessions.expiresAt, new Date()));
    
    const expiredCount = countResult[0]?.count || 0;
    
    if (expiredCount > 0) {
      await db
        .delete(adminSessions)
        .where(lt(adminSessions.expiresAt, new Date()));
    }
    
    return expiredCount;
  }

  /**
   * 全セッションを取得（管理用）
   */
  async findAll(): Promise<AdminSession[]> {
    return await db
      .select()
      .from(adminSessions)
      .orderBy(adminSessions.createdAt);
  }

  /**
   * 有効なセッション数を取得
   */
  async countValid(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(adminSessions)
      .where(gt(adminSessions.expiresAt, new Date()));
    
    return result[0]?.count || 0;
  }

  /**
   * 管理者の有効なセッション数を取得
   */
  async countValidByAdminId(adminId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.adminId, adminId),
          gt(adminSessions.expiresAt, new Date())
        )
      );
    
    return result[0]?.count || 0;
  }
}

export const adminSessionRepository = new AdminSessionRepository();