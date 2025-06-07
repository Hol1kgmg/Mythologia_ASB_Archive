/**
 * セキュリティユーティリティ
 * パスワードハッシュ化、JWT生成・検証など
 * マイルストーン1: システム管理者認証基盤
 */

import type { Admin } from '../domain/models/Admin';

// パスワードハッシュ化インターface
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

// JWT管理インターフェース  
export interface JWTManager {
  generateAccessToken(admin: Admin): Promise<string>;
  generateRefreshToken(adminId: string, sessionId: string): Promise<string>;
  verifyAccessToken(token: string): Promise<{ adminId: string; sessionId?: string }>;
  verifyRefreshToken(token: string): Promise<{ adminId: string; sessionId: string }>;
}

// bcrypt互換のパスワードハッシュ化実装
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    // Node.js環境でのbcrypt使用
    if (typeof require !== 'undefined') {
      try {
        const bcrypt = require('bcrypt');
        return await bcrypt.hash(password, this.saltRounds);
      } catch (error) {
        console.error('bcrypt not available, falling back to simple hash');
      }
    }

    // フォールバック: 簡易ハッシュ（開発用のみ）
    return this.simpleHash(password);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    // Node.js環境でのbcrypt使用
    if (typeof require !== 'undefined') {
      try {
        const bcrypt = require('bcrypt');
        return await bcrypt.compare(password, hash);
      } catch (error) {
        console.error('bcrypt not available, falling back to simple hash comparison');
      }
    }

    // フォールバック: 簡易ハッシュ比較
    return hash === this.simpleHash(password);
  }

  private simpleHash(password: string): string {
    // 開発用の簡易ハッシュ（本番環境では使用しない）
    let hash = 0;
    if (password.length === 0) return hash.toString();
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return `simple_hash_${Math.abs(hash)}_${password.length}`;
  }
}

// Hono JWT マネージャー実装
export class HonoJWTManager implements JWTManager {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'default-access-secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  async generateAccessToken(admin: Admin): Promise<string> {
    try {
      // @hono/jwt を使用する場合
      const payload = {
        sub: admin.id,
        username: admin.username,
        role: admin.role,
        isSuperAdmin: admin.isSuperAdmin,
        permissions: admin.permissions,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.parseExpiry(this.accessTokenExpiry)
      };

      // 実際の実装では @hono/jwt を使用
      // const { sign } = await import('@hono/jwt');
      // return await sign(payload, this.accessTokenSecret);

      // モック実装
      return `mock.jwt.token.${admin.id}.${Date.now()}`;
    } catch (error) {
      console.error('Access token generation failed:', error);
      throw new Error('Failed to generate access token');
    }
  }

  async generateRefreshToken(adminId: string, sessionId: string): Promise<string> {
    try {
      const payload = {
        sub: adminId,
        sessionId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.parseExpiry(this.refreshTokenExpiry)
      };

      // 実際の実装では @hono/jwt を使用
      // const { sign } = await import('@hono/jwt');
      // return await sign(payload, this.refreshTokenSecret);

      // モック実装
      return `mock.refresh.token.${adminId}.${sessionId}.${Date.now()}`;
    } catch (error) {
      console.error('Refresh token generation failed:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  async verifyAccessToken(token: string): Promise<{ adminId: string; sessionId?: string }> {
    try {
      // 実際の実装では @hono/jwt を使用
      // const { verify } = await import('@hono/jwt');
      // const payload = await verify(token, this.accessTokenSecret);
      // return { adminId: payload.sub, sessionId: payload.sessionId };

      // モック実装
      const parts = token.split('.');
      if (parts.length >= 4 && parts[0] === 'mock' && parts[1] === 'jwt') {
        return { adminId: parts[3] };
      }
      throw new Error('Invalid token format');
    } catch (error) {
      console.error('Access token verification failed:', error);
      throw new Error('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<{ adminId: string; sessionId: string }> {
    try {
      // 実際の実装では @hono/jwt を使用
      // const { verify } = await import('@hono/jwt');
      // const payload = await verify(token, this.refreshTokenSecret);
      // return { adminId: payload.sub, sessionId: payload.sessionId };

      // モック実装
      const parts = token.split('.');
      if (parts.length >= 5 && parts[0] === 'mock' && parts[1] === 'refresh') {
        return { adminId: parts[3], sessionId: parts[4] };
      }
      throw new Error('Invalid refresh token format');
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      throw new Error('Invalid refresh token');
    }
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900; // デフォルト15分
    }
  }
}

// レート制限用のインメモリストア（本番環境ではRedisなどを使用）
export class InMemoryRateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 15分
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isBlocked(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetAt) {
      return false;
    }

    return attempt.count >= this.maxAttempts;
  }

  recordAttempt(identifier: string): { blocked: boolean; remainingAttempts: number; resetAt: number } {
    const now = Date.now();
    const resetAt = now + this.windowMs;
    const existing = this.attempts.get(identifier);

    if (!existing || now > existing.resetAt) {
      // 新しいウィンドウ
      this.attempts.set(identifier, { count: 1, resetAt });
      return { blocked: false, remainingAttempts: this.maxAttempts - 1, resetAt };
    }

    // 既存のウィンドウ内
    existing.count += 1;
    const blocked = existing.count >= this.maxAttempts;
    const remainingAttempts = Math.max(0, this.maxAttempts - existing.count);

    return { blocked, remainingAttempts, resetAt: existing.resetAt };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.attempts.entries()) {
      if (now > value.resetAt) {
        this.attempts.delete(key);
      }
    }
  }
}

// IP アドレス取得ユーティリティ
export function getClientIP(request: Request, headers?: Record<string, string>): string {
  // Cloudflare Workers
  const cfConnectingIP = headers?.['cf-connecting-ip'];
  if (cfConnectingIP) return cfConnectingIP;

  // 一般的なプロキシヘッダー
  const xForwardedFor = headers?.['x-forwarded-for'];
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = headers?.['x-real-ip'];
  if (xRealIP) return xRealIP;

  // フォールバック
  return 'unknown';
}

// UUIDv4生成（crypto.randomUUID が利用できない環境用）
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // フォールバック実装
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// セキュリティユーティリティのファクトリー
export class SecurityFactory {
  static createPasswordHasher(): PasswordHasher {
    return new BcryptPasswordHasher();
  }

  static createJWTManager(): JWTManager {
    return new HonoJWTManager();
  }

  static createRateLimiter(maxAttempts?: number, windowMs?: number): InMemoryRateLimiter {
    return new InMemoryRateLimiter(maxAttempts, windowMs);
  }
}