import type { MiddlewareHandler } from 'hono';
import { validateHMACSignature } from '../utils/hmac.js';
import { logger } from '../../../utils/logger.js';

interface AdminAPISecurityOptions {
  hmacSecret?: string;
  apiKey?: string;
  allowedOrigins?: string[];
  bypassForDevelopment?: boolean;
}

/**
 * Admin API専用セキュリティミドルウェア
 * CORS偽装対策とHMAC署名認証を組み合わせた防御機能
 */
export function adminAPISecurity(options: AdminAPISecurityOptions = {}): MiddlewareHandler {
  return async (c, next) => {
    const {
      hmacSecret = process.env.ADMIN_HMAC_SECRET,
      apiKey = process.env.VERCEL_API_KEY,
      allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [],
      bypassForDevelopment = process.env.NODE_ENV === 'development'
    } = options;

    // 開発環境では一部の制限をバイパス（ローカル開発用）
    if (bypassForDevelopment && process.env.NODE_ENV === 'development') {
      logger.info('Admin API security bypassed for development environment');
      await next();
      return;
    }

    try {
      // 1. API Key検証
      if (apiKey) {
        const requestApiKey = c.req.header('X-API-Key');
        if (!requestApiKey || requestApiKey !== apiKey) {
          logger.warn('Admin API access denied: Invalid API key', {
            origin: c.req.header('Origin'),
            userAgent: c.req.header('User-Agent'),
            ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')
          });
          return c.json({ error: 'Unauthorized' }, 404); // 404で隠蔽
        }
      }

      // 2. HMAC署名検証（必須）
      if (hmacSecret) {
        const signature = c.req.header('X-HMAC-Signature');
        const timestamp = c.req.header('X-Timestamp');

        if (!signature || !timestamp) {
          logger.warn('Admin API access denied: Missing HMAC signature or timestamp', {
            origin: c.req.header('Origin'),
            hasSignature: !!signature,
            hasTimestamp: !!timestamp
          });
          return c.json({ error: 'Unauthorized' }, 404);
        }

        // リクエストボディの取得（HMACに必要）
        const body = c.req.method !== 'GET' && c.req.method !== 'HEAD' 
          ? await c.req.text() 
          : undefined;

        try {
          validateHMACSignature({
            method: c.req.method,
            path: c.req.path,
            timestamp,
            body,
            signature,
            secret: hmacSecret,
            maxAge: 300000 // 5分
          });
        } catch (error) {
          logger.warn('Admin API access denied: Invalid HMAC signature', {
            origin: c.req.header('Origin'),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return c.json({ error: 'Unauthorized' }, 404);
        }
      }

      // 3. Origin検証（追加の防御層）
      if (allowedOrigins.length > 0) {
        const origin = c.req.header('Origin');
        const referer = c.req.header('Referer');
        
        // OriginまたはRefererのいずれかが許可リストに含まれていること
        const isAllowedOrigin = origin && allowedOrigins.includes(origin);
        const isAllowedReferer = referer && allowedOrigins.some(allowed => 
          referer.startsWith(allowed)
        );

        if (!isAllowedOrigin && !isAllowedReferer) {
          logger.warn('Admin API access denied: Invalid origin', {
            origin,
            referer,
            allowedOrigins,
            userAgent: c.req.header('User-Agent')
          });
          return c.json({ error: 'Unauthorized' }, 404);
        }
      }

      // セキュリティチェック通過
      logger.info('Admin API security check passed', {
        origin: c.req.header('Origin'),
        path: c.req.path,
        method: c.req.method
      });

      await next();

    } catch (error) {
      logger.error('Admin API security middleware error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };
}

/**
 * 開発・テスト用の緩いセキュリティミドルウェア
 * ローカル開発時にのみ使用
 */
export function adminAPISecurityDevelopment(): MiddlewareHandler {
  return adminAPISecurity({
    bypassForDevelopment: true
  });
}

/**
 * 本番環境用の厳格なセキュリティミドルウェア
 */
export function adminAPISecurityProduction(): MiddlewareHandler {
  return adminAPISecurity({
    bypassForDevelopment: false
  });
}