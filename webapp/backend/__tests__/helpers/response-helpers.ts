/**
 * テスト用レスポンスヘルパー関数
 * 型安全なレスポンス処理
 */

// import type { Response } from 'hono'; // 将来的に使用予定
import type {
  AdminListResponse,
  AdminDetailResponse,
  AuthResponse,
  TokenRefreshResponse,
  ProfileResponse,
  SessionListResponse,
  ActivityLogResponse,
  ApiSuccessResponse,
  ApiErrorResponse
} from '../types/api-responses';

/**
 * 型安全なJSON解析ヘルパー
 */
export class ResponseHelpers {
  
  static parseAdminList(data: unknown): AdminListResponse {
    if (!this.isAdminListResponse(data)) {
      throw new Error('Invalid AdminListResponse format');
    }
    return data;
  }

  static parseAdminDetail(data: unknown): AdminDetailResponse {
    if (!this.isAdminDetailResponse(data)) {
      throw new Error('Invalid AdminDetailResponse format');
    }
    return data;
  }

  static parseAuthResult(data: unknown): AuthResponse {
    if (!this.isAuthResponse(data)) {
      throw new Error('Invalid AuthResponse format');
    }
    return data;
  }

  static parseTokenRefresh(data: unknown): TokenRefreshResponse {
    if (!this.isTokenRefreshResponse(data)) {
      throw new Error('Invalid TokenRefreshResponse format');
    }
    return data;
  }

  static parseProfile(data: unknown): ProfileResponse {
    if (!this.isProfileResponse(data)) {
      throw new Error('Invalid ProfileResponse format');
    }
    return data;
  }

  static parseSuccess(data: unknown): ApiSuccessResponse {
    if (!this.isSuccessResponse(data)) {
      throw new Error('Invalid SuccessResponse format');
    }
    return data;
  }

  static parseError(data: unknown): ApiErrorResponse {
    if (!this.isErrorResponse(data)) {
      throw new Error('Invalid ErrorResponse format');
    }
    return data;
  }

  static parseActivityLog(data: unknown): ActivityLogResponse {
    if (!this.isActivityLogResponse(data)) {
      throw new Error('Invalid ActivityLogResponse format');
    }
    return data;
  }

  // 型ガード関数
  private static isAdminListResponse(data: unknown): data is AdminListResponse {
    return typeof data === 'object' && data !== null &&
           'admins' in data && Array.isArray((data as any).admins) &&
           'total' in data && typeof (data as any).total === 'number' &&
           'page' in data && typeof (data as any).page === 'number' &&
           'limit' in data && typeof (data as any).limit === 'number';
  }

  private static isAdminDetailResponse(data: unknown): data is AdminDetailResponse {
    return typeof data === 'object' && data !== null &&
           'admin' in data && typeof (data as any).admin === 'object';
  }

  private static isAuthResponse(data: unknown): data is AuthResponse {
    return typeof data === 'object' && data !== null &&
           'admin' in data && 'accessToken' in data && 'refreshToken' in data;
  }

  private static isTokenRefreshResponse(data: unknown): data is TokenRefreshResponse {
    return typeof data === 'object' && data !== null &&
           'accessToken' in data && 'expiresIn' in data;
  }

  private static isProfileResponse(data: unknown): data is ProfileResponse {
    return typeof data === 'object' && data !== null &&
           'admin' in data && typeof (data as any).admin === 'object';
  }

  private static isSuccessResponse(data: unknown): data is ApiSuccessResponse {
    return typeof data === 'object' && data !== null &&
           'success' in data && typeof (data as any).success === 'boolean';
  }

  private static isErrorResponse(data: unknown): data is ApiErrorResponse {
    return typeof data === 'object' && data !== null &&
           'error' in data && typeof (data as any).error === 'string';
  }

  private static isActivityLogResponse(data: unknown): data is ActivityLogResponse {
    return typeof data === 'object' && data !== null &&
           'activities' in data && Array.isArray((data as any).activities) &&
           'total' in data && typeof (data as any).total === 'number';
  }
}