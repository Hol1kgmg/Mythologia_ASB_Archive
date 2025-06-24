import type { MiddlewareHandler } from 'hono';
import { logger } from '../../../utils/logger.js';

interface AdminSecretURLOptions {
  secretPath?: string;
  enableAccessLogging?: boolean;
  suspiciousAccessThreshold?: number;
}

interface AccessAttempt {
  ip: string;
  userAgent: string;
  timestamp: number;
  path: string;
  isValid: boolean;
}

// In-memory store for access attempts (in production, use Redis)
const accessAttempts: AccessAttempt[] = [];
const suspiciousIPs = new Set<string>();

/**
 * 管理者用秘匿URL検証ミドルウェア
 * 正しい秘匿URLでない場合は404を返して管理画面の存在を隠蔽
 */
export function adminSecretURL(options: AdminSecretURLOptions = {}): MiddlewareHandler {
  return async (c, next) => {
    const {
      secretPath = process.env.ADMIN_SECRET_PATH,
      enableAccessLogging = process.env.NODE_ENV === 'production',
      suspiciousAccessThreshold = 5,
    } = options;

    const requestPath = c.req.path;
    const clientIP = getClientIP(c);
    const userAgent = c.req.header('User-Agent') || 'Unknown';

    // 秘匿URLの検証
    const isValidSecretURL = validateSecretURL(c, requestPath, secretPath);

    // アクセス試行をログに記録
    if (enableAccessLogging) {
      logAccessAttempt({
        ip: clientIP,
        userAgent,
        timestamp: Date.now(),
        path: requestPath,
        isValid: isValidSecretURL,
      });
    }

    // 不正なアクセスの場合
    if (!isValidSecretURL) {
      // 疑わしいアクセスパターンの検知
      const recentAttempts = getRecentAttempts(clientIP, 300000); // 5分以内
      const invalidAttempts = recentAttempts.filter((attempt) => !attempt.isValid);

      if (invalidAttempts.length >= suspiciousAccessThreshold) {
        if (!suspiciousIPs.has(clientIP)) {
          suspiciousIPs.add(clientIP);
          logger.warn('Suspicious admin access pattern detected', {
            ip: clientIP,
            userAgent,
            invalidAttempts: invalidAttempts.length,
            recentPaths: invalidAttempts.map((a) => a.path).slice(-3),
          });

          // 異常検知アラート（ログ監視システムで対応）
          logger.warn('SECURITY_ALERT: Suspicious admin access pattern detected', {
            alertType: 'suspicious_access_pattern',
            ip: clientIP,
            userAgent,
            invalidAttempts: invalidAttempts.length,
            recentPaths: invalidAttempts.map((a) => a.path).slice(-3),
            threshold: suspiciousAccessThreshold,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Bot/自動化ツール検知
      if (isSuspiciousUserAgent(userAgent)) {
        logger.warn('Bot/automated tool detected attempting admin access', {
          ip: clientIP,
          userAgent,
          path: requestPath,
        });

        // Bot検知アラート（ログ監視システムで対応）
        logger.warn('SECURITY_ALERT: Bot/automated tool detected', {
          alertType: 'bot_detected',
          ip: clientIP,
          userAgent,
          path: requestPath,
          timestamp: new Date().toISOString(),
        });
      }

      // 404偽装レスポンス（管理画面の存在を隠蔽）
      logger.info('Admin access denied - invalid secret URL', {
        ip: clientIP,
        attemptedPath: requestPath,
        userAgent: userAgent.substring(0, 100), // ログサイズ制限
      });

      return c.json(
        {
          error: 'Not Found',
          message: 'The requested resource could not be found.',
        },
        404
      );
    }

    // 正常なアクセスの場合
    logger.info('Admin secret URL validated successfully', {
      ip: clientIP,
      path: requestPath,
    });

    await next();
  };
}

/**
 * 秘匿URLの検証
 */
function validateSecretURL(c: any, requestPath: string, secretPath?: string): boolean {
  if (!secretPath) {
    logger.warn('ADMIN_SECRET_PATH not configured - allowing access for development');
    return true; // 設定なしの場合は開発環境として扱う
  }

  // 現在の秘匿パスまたは次期パス（移行期間対応）
  const currentPath = secretPath;
  const nextPath = process.env.ADMIN_SECRET_PATH_NEXT;

  // 管理関連パスの検証パターン
  const adminAPIPattern = /^\/api\/admin\//; // 管理APIパス
  const adminPathPattern = /^\/admin-[a-zA-Z0-9]+\//; // 管理画面パス

  const isAdminAPIPath = adminAPIPattern.test(requestPath);
  const isAdminPath = adminPathPattern.test(requestPath);

  // 管理関連パス（API + 画面）以外はスルー
  if (!isAdminAPIPath && !isAdminPath) {
    return true;
  }

  // 管理APIパスの場合は特別な検証ロジック
  if (isAdminAPIPath) {
    return validateAdminAPIAccess(c, currentPath, nextPath);
  }

  // 管理画面パスの場合は従来の検証
  const expectedPaths: string[] = [
    `/admin-${currentPath}/`,
    ...(nextPath ? [`/admin-${nextPath}/`] : []),
  ];

  return expectedPaths.some((path) => requestPath.startsWith(path));
}

/**
 * 管理APIアクセス時の秘匿URL検証
 * ReferrerヘッダーまたはX-Admin-Secret-Pathヘッダーで検証
 */
function validateAdminAPIAccess(c: any, currentPath?: string, nextPath?: string): boolean {
  if (!currentPath) {
    logger.warn('ADMIN_SECRET_PATH not configured for API access - allowing for development');
    return true;
  }

  // 方法1: Referrerヘッダーによる検証
  const referer = c.req.header('referer') || c.req.header('referrer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererPath = refererUrl.pathname;

      const validSecretPaths = [
        `/admin-${currentPath}/`,
        ...(nextPath ? [`/admin-${nextPath}/`] : []),
      ];

      if (validSecretPaths.some((path) => refererPath.startsWith(path))) {
        logger.info('Admin API access validated via Referer header');
        return true;
      }
    } catch (_error) {
      logger.warn('Invalid Referer header format:', referer);
    }
  }

  // 方法2: 専用ヘッダーによる検証
  const adminSecretHeader = c.req.header('X-Admin-Secret-Path');
  if (adminSecretHeader) {
    const validSecrets = [currentPath, ...(nextPath ? [nextPath] : [])];
    if (validSecrets.includes(adminSecretHeader)) {
      logger.info('Admin API access validated via X-Admin-Secret-Path header');
      return true;
    }
  }

  // 全ての検証に失敗
  logger.warn('Admin API access denied: No valid secret URL context found');
  return false;
}

/**
 * クライアントIPの取得
 */
function getClientIP(c: any): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    c.req.header('X-Real-IP') ||
    c.req.header('Remote-Addr') ||
    'unknown'
  );
}

/**
 * アクセス試行のログ記録
 */
function logAccessAttempt(attempt: AccessAttempt): void {
  accessAttempts.push(attempt);

  // メモリ使用量制限（最新1000件のみ保持）
  if (accessAttempts.length > 1000) {
    accessAttempts.splice(0, accessAttempts.length - 1000);
  }
}

/**
 * 特定IPの最近のアクセス試行を取得
 */
function getRecentAttempts(ip: string, timeWindow: number): AccessAttempt[] {
  const now = Date.now();
  return accessAttempts.filter(
    (attempt) => attempt.ip === ip && now - attempt.timestamp <= timeWindow
  );
}

/**
 * 疑わしいUser-Agentの検知
 */
function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /scanner/i,
    /automated/i,
    /test/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * アクセス統計の取得（デバッグ・監視用）
 */
export function getAdminAccessStats() {
  const now = Date.now();
  const last24h = accessAttempts.filter((a) => now - a.timestamp <= 86400000);

  return {
    total24h: last24h.length,
    valid24h: last24h.filter((a) => a.isValid).length,
    invalid24h: last24h.filter((a) => !a.isValid).length,
    suspiciousIPs: Array.from(suspiciousIPs),
    recentInvalidPaths: last24h
      .filter((a) => !a.isValid)
      .map((a) => a.path)
      .slice(-10),
  };
}
