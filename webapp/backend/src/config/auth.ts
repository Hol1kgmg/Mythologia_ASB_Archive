/**
 * 認証関連の設定管理
 * アプリケーション起動時に環境変数を検証し、設定を提供
 */

export interface AuthConfig {
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  accessTokenExpiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
  bcryptSaltRounds: number;
  adminRateLimit: {
    loginWindow: number; // milliseconds
    loginMaxAttempts: number;
    generalWindow: number; // milliseconds
    generalMaxRequests: number;
    refreshWindow: number; // milliseconds
    refreshMaxAttempts: number;
  };
}

/**
 * 認証設定の作成と検証
 */
function createAuthConfig(): AuthConfig {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return {
    jwtSecret,
    jwtIssuer: 'mythologia-admin-api',
    jwtAudience: 'mythologia-admin',
    accessTokenExpiresIn: 60 * 60, // 1 hour
    refreshTokenExpiresIn: 7 * 24 * 60 * 60, // 7 days
    bcryptSaltRounds: 12,
    adminRateLimit: {
      loginWindow: 15 * 60 * 1000, // 15 minutes
      loginMaxAttempts: 5,
      generalWindow: 1 * 60 * 1000, // 1 minute
      generalMaxRequests: 30,
      refreshWindow: 5 * 60 * 1000, // 5 minutes
      refreshMaxAttempts: 10,
    },
  };
}

/**
 * グローバル認証設定インスタンス
 * アプリケーション起動時に一度だけ作成される
 */
export const authConfig: AuthConfig = createAuthConfig();

/**
 * 環境変数の検証（アプリケーション起動時に呼び出し）
 */
export function validateAuthEnvironment(): void {
  try {
    createAuthConfig();
    console.log('✅ Auth configuration validated successfully');
  } catch (error) {
    console.error('❌ Auth configuration validation failed:', error);
    process.exit(1);
  }
}
