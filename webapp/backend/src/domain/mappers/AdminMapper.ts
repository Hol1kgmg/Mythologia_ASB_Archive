/**
 * 管理者マッパー
 * ドメインエンティティとDTO間の変換
 */

import type {
  AdminDTO,
  AdminDetailDTO,
  AdminSessionDTO,
  AdminActivityLogDTO,
  AuthResultDTO
} from '@mythologia/shared';
import type { Admin, AdminSession, AdminActivityLog, AdminAuthResult } from '../models/Admin';

export class AdminMapper {
  /**
   * ドメインエンティティからDTOへ変換
   */
  static toDTO(admin: Admin): AdminDTO {
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      isSuperAdmin: admin.isSuperAdmin,
      lastLoginAt: admin.lastLoginAt?.toISOString() || null,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString()
    };
  }

  /**
   * ドメインエンティティから詳細DTOへ変換
   */
  static toDetailDTO(admin: Admin, createdByName?: string | null): AdminDetailDTO {
    return {
      ...AdminMapper.toDTO(admin),
      createdBy: admin.createdBy,
      createdByName
    };
  }

  /**
   * データベース行からドメインエンティティへ変換
   */
  static toDomain(row: any): Admin {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash || row.passwordHash,
      role: row.role,
      permissions: typeof row.permissions === 'string' 
        ? JSON.parse(row.permissions) 
        : row.permissions,
      isActive: Boolean(row.is_active ?? row.isActive),
      isSuperAdmin: Boolean(row.is_super_admin ?? row.isSuperAdmin),
      createdBy: row.created_by || row.createdBy,
      lastLoginAt: row.last_login_at || row.lastLoginAt 
        ? new Date(row.last_login_at || row.lastLoginAt) 
        : null,
      createdAt: new Date(row.created_at || row.createdAt),
      updatedAt: new Date(row.updated_at || row.updatedAt)
    };
  }

  /**
   * セッションエンティティからDTOへ変換
   */
  static sessionToDTO(session: AdminSession, isCurrent: boolean = false): AdminSessionDTO {
    return {
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isCurrent,
      createdAt: session.createdAt.toISOString(),
      lastUsedAt: session.createdAt.toISOString() // TODO: 実際の最終使用時刻を追跡
    };
  }

  /**
   * データベース行からセッションエンティティへ変換
   */
  static sessionToDomain(row: any): AdminSession {
    return {
      id: row.id,
      adminId: row.admin_id || row.adminId,
      refreshToken: row.refresh_token || row.refreshToken,
      expiresAt: new Date(row.expires_at || row.expiresAt),
      ipAddress: row.ip_address || row.ipAddress,
      userAgent: row.user_agent || row.userAgent,
      isActive: Boolean(row.is_active ?? row.isActive),
      createdAt: new Date(row.created_at || row.createdAt)
    };
  }

  /**
   * アクティビティログエンティティからDTOへ変換
   */
  static activityLogToDTO(log: AdminActivityLog, adminName?: string): AdminActivityLogDTO {
    return {
      id: log.id,
      adminId: log.adminId,
      adminName,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString()
    };
  }

  /**
   * データベース行からアクティビティログエンティティへ変換
   */
  static activityLogToDomain(row: any): AdminActivityLog {
    return {
      id: row.id,
      adminId: row.admin_id || row.adminId,
      action: row.action,
      targetType: row.target_type || row.targetType,
      targetId: row.target_id || row.targetId,
      details: typeof row.details === 'string' 
        ? JSON.parse(row.details) 
        : row.details,
      ipAddress: row.ip_address || row.ipAddress,
      userAgent: row.user_agent || row.userAgent,
      createdAt: new Date(row.created_at || row.createdAt)
    };
  }

  /**
   * 認証結果からDTOへ変換
   */
  static authResultToDTO(authResult: AdminAuthResult): AuthResultDTO {
    return {
      admin: AdminMapper.toDTO(authResult.admin),
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn
    };
  }
}