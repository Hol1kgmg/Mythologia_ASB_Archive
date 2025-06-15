import { eq, and, desc, asc, gte, lte, like, or, count } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { adminActivityLogs, type AdminActivityLog, type NewAdminActivityLog } from '../../db/schema/index.js';

export interface ActivityLogSearchParams {
  adminId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityLogStats {
  totalLogs: number;
  actionCounts: Record<string, number>;
  adminCounts: Record<string, number>;
  recentActivity: AdminActivityLog[];
}

export class AdminActivityLogRepository {
  /**
   * 活動ログを作成
   */
  async create(logData: NewAdminActivityLog): Promise<AdminActivityLog> {
    const [log] = await db
      .insert(adminActivityLogs)
      .values(logData)
      .returning();
    return log;
  }

  /**
   * IDでログを取得
   */
  async findById(id: string): Promise<AdminActivityLog | null> {
    const logs = await db
      .select()
      .from(adminActivityLogs)
      .where(eq(adminActivityLogs.id, id))
      .limit(1);
    
    return logs[0] || null;
  }

  /**
   * 管理者IDでログを取得
   */
  async findByAdminId(adminId: string, limit: number = 100): Promise<AdminActivityLog[]> {
    return await db
      .select()
      .from(adminActivityLogs)
      .where(eq(adminActivityLogs.adminId, adminId))
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(limit);
  }

  /**
   * 検索条件でログを取得
   */
  async search(params: ActivityLogSearchParams): Promise<AdminActivityLog[]> {
    const conditions = [];
    
    if (params.adminId) {
      conditions.push(eq(adminActivityLogs.adminId, params.adminId));
    }
    
    if (params.action) {
      conditions.push(like(adminActivityLogs.action, `%${params.action}%`));
    }
    
    if (params.targetType) {
      conditions.push(eq(adminActivityLogs.targetType, params.targetType));
    }
    
    if (params.targetId) {
      conditions.push(eq(adminActivityLogs.targetId, params.targetId));
    }
    
    if (params.startDate) {
      conditions.push(gte(adminActivityLogs.createdAt, params.startDate));
    }
    
    if (params.endDate) {
      conditions.push(lte(adminActivityLogs.createdAt, params.endDate));
    }
    
    if (params.ipAddress) {
      conditions.push(eq(adminActivityLogs.ipAddress, params.ipAddress));
    }

    if (conditions.length > 0) {
      if (params.limit && params.offset) {
        return await db
          .select()
          .from(adminActivityLogs)
          .where(and(...conditions))
          .orderBy(desc(adminActivityLogs.createdAt))
          .limit(params.limit)
          .offset(params.offset);
      } else if (params.limit) {
        return await db
          .select()
          .from(adminActivityLogs)
          .where(and(...conditions))
          .orderBy(desc(adminActivityLogs.createdAt))
          .limit(params.limit);
      } else {
        return await db
          .select()
          .from(adminActivityLogs)
          .where(and(...conditions))
          .orderBy(desc(adminActivityLogs.createdAt));
      }
    } else {
      if (params.limit && params.offset) {
        return await db
          .select()
          .from(adminActivityLogs)
          .orderBy(desc(adminActivityLogs.createdAt))
          .limit(params.limit)
          .offset(params.offset);
      } else if (params.limit) {
        return await db
          .select()
          .from(adminActivityLogs)
          .orderBy(desc(adminActivityLogs.createdAt))
          .limit(params.limit);
      } else {
        return await db
          .select()
          .from(adminActivityLogs)
          .orderBy(desc(adminActivityLogs.createdAt));
      }
    }
  }

  /**
   * 特定のターゲットに関する全ログを取得
   */
  async findByTarget(targetType: string, targetId: string): Promise<AdminActivityLog[]> {
    return await db
      .select()
      .from(adminActivityLogs)
      .where(
        and(
          eq(adminActivityLogs.targetType, targetType),
          eq(adminActivityLogs.targetId, targetId)
        )
      )
      .orderBy(desc(adminActivityLogs.createdAt));
  }

  /**
   * 特定のアクションのログを取得
   */
  async findByAction(action: string, limit: number = 100): Promise<AdminActivityLog[]> {
    return await db
      .select()
      .from(adminActivityLogs)
      .where(eq(adminActivityLogs.action, action))
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(limit);
  }

  /**
   * 期間指定でログを取得
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<AdminActivityLog[]> {
    return await db
      .select()
      .from(adminActivityLogs)
      .where(
        and(
          gte(adminActivityLogs.createdAt, startDate),
          lte(adminActivityLogs.createdAt, endDate)
        )
      )
      .orderBy(desc(adminActivityLogs.createdAt));
  }

  /**
   * 最新のログを取得
   */
  async findRecent(limit: number = 50): Promise<AdminActivityLog[]> {
    return await db
      .select()
      .from(adminActivityLogs)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(limit);
  }

  /**
   * IPアドレスでログを取得
   */
  async findByIpAddress(ipAddress: string): Promise<AdminActivityLog[]> {
    return await db
      .select()
      .from(adminActivityLogs)
      .where(eq(adminActivityLogs.ipAddress, ipAddress))
      .orderBy(desc(adminActivityLogs.createdAt));
  }

  /**
   * 疑わしい活動を検出（例：短時間での大量操作）
   */
  async findSuspiciousActivity(
    timeWindowMinutes: number = 10,
    actionThreshold: number = 20
  ): Promise<AdminActivityLog[]> {
    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    return await db
      .select()
      .from(adminActivityLogs)
      .where(gte(adminActivityLogs.createdAt, timeWindow))
      .orderBy(desc(adminActivityLogs.createdAt));
  }

  /**
   * 統計情報を取得
   */
  async getStats(days: number = 30): Promise<ActivityLogStats> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const logs = await db
      .select()
      .from(adminActivityLogs)
      .where(gte(adminActivityLogs.createdAt, startDate))
      .orderBy(desc(adminActivityLogs.createdAt));

    const recentActivity = logs.slice(0, 10);
    
    const actionCounts: Record<string, number> = {};
    const adminCounts: Record<string, number> = {};
    
    logs.forEach((log: AdminActivityLog) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      adminCounts[log.adminId] = (adminCounts[log.adminId] || 0) + 1;
    });

    return {
      totalLogs: logs.length,
      actionCounts,
      adminCounts,
      recentActivity
    };
  }

  /**
   * 古いログを削除（保持期間管理）
   */
  async deleteOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    // 削除前にカウントを取得
    const countResult = await db
      .select({ count: count() })
      .from(adminActivityLogs)
      .where(lte(adminActivityLogs.createdAt, cutoffDate));
    
    const oldLogsCount = countResult[0]?.count || 0;
    
    if (oldLogsCount > 0) {
      await db
        .delete(adminActivityLogs)
        .where(lte(adminActivityLogs.createdAt, cutoffDate));
    }
    
    return oldLogsCount;
  }

  /**
   * ログ数をカウント
   */
  async count(params?: ActivityLogSearchParams): Promise<number> {
    if (!params) {
      const result = await db
        .select({ count: count() })
        .from(adminActivityLogs);
      return result[0]?.count || 0;
    }

    const conditions = [];
    
    if (params.adminId) {
      conditions.push(eq(adminActivityLogs.adminId, params.adminId));
    }
    
    if (params.action) {
      conditions.push(like(adminActivityLogs.action, `%${params.action}%`));
    }
    
    if (params.startDate) {
      conditions.push(gte(adminActivityLogs.createdAt, params.startDate));
    }
    
    if (params.endDate) {
      conditions.push(lte(adminActivityLogs.createdAt, params.endDate));
    }

    if (conditions.length > 0) {
      const result = await db
        .select({ count: count() })
        .from(adminActivityLogs)
        .where(and(...conditions));
      return result[0]?.count || 0;
    } else {
      const result = await db
        .select({ count: count() })
        .from(adminActivityLogs);
      return result[0]?.count || 0;
    }
  }

  /**
   * ログをエクスポート（CSV形式用データ）
   */
  async exportLogs(params?: ActivityLogSearchParams): Promise<AdminActivityLog[]> {
    return await this.search({
      ...params,
      limit: undefined, // 全件取得
      offset: undefined
    });
  }
}

export const adminActivityLogRepository = new AdminActivityLogRepository();