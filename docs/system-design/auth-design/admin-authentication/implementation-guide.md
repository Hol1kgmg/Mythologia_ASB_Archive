# 管理者認証実装ガイド

## 概要

このドキュメントは、管理者認証システムの実装手順とベストプラクティスを提供します。

## 実装順序

### Phase 1: 基礎実装
1. パスワードハッシュユーティリティ
2. JWT管理ユーティリティ
3. 認証ミドルウェア
4. ログインAPI

### Phase 2: セキュリティ強化
1. レート制限
2. セッション管理
3. アクティビティログ
4. リフレッシュトークン

### Phase 3: 高度な機能
1. ロールベースアクセス制御
2. アカウントロック機能
3. 監査ログ
4. セキュリティヘッダー

## 詳細実装手順

### 1. 環境設定

#### 環境変数の追加
```bash
# .env.local
# JWT設定
ADMIN_JWT_SECRET=your-super-secret-key-minimum-32-characters
ADMIN_JWT_EXPIRES_IN=1h
ADMIN_REFRESH_TOKEN_SECRET=another-super-secret-key-minimum-32-characters
ADMIN_REFRESH_TOKEN_EXPIRES_IN=7d

# セキュリティ設定
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
SESSION_TIMEOUT_MINUTES=30

# レート制限
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW_MS=60000
RATE_LIMIT_API_MAX=60
RATE_LIMIT_API_WINDOW_MS=60000
```

#### 依存関係のインストール
```bash
cd webapp/backend
npm install bcrypt jose rate-limiter-flexible
npm install -D @types/bcrypt
```

### 2. パスワードハッシュ実装

#### `src/infrastructure/auth/utils/password.ts`
```typescript
import bcrypt from 'bcrypt';

export class PasswordManager {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('パスワードは8文字以上必要です');
    }

    if (password.length > 128) {
      errors.push('パスワードは128文字以下にしてください');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('大文字を含む必要があります');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('小文字を含む必要があります');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('数字を含む必要があります');
    }

    return { valid: errors.length === 0, errors };
  }
}
```

### 3. JWT管理実装

#### `src/infrastructure/auth/utils/adminJwt.ts`
```typescript
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { v4 as uuidv4 } from 'uuid';

export interface AdminTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId?: string;
}

export class AdminJWTManager {
  private readonly accessTokenSecret: Uint8Array;
  private readonly refreshTokenSecret: Uint8Array;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly issuer = 'mythologia-admin';
  private readonly audience = 'mythologia-admin-api';

  constructor(config: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  }) {
    this.accessTokenSecret = new TextEncoder().encode(config.accessTokenSecret);
    this.refreshTokenSecret = new TextEncoder().encode(config.refreshTokenSecret);
    this.accessTokenExpiry = config.accessTokenExpiry;
    this.refreshTokenExpiry = config.refreshTokenExpiry;
  }

  async generateTokenPair(payload: Omit<AdminTokenPayload, 'iat' | 'exp' | 'jti'>) {
    const jti = uuidv4();
    const sessionId = uuidv4();

    const accessToken = await new SignJWT({ ...payload, sessionId })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(jti)
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.accessTokenExpiry)
      .sign(this.accessTokenSecret);

    const refreshToken = await new SignJWT({ sub: payload.sub, sessionId })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(uuidv4())
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.refreshTokenExpiry)
      .sign(this.refreshTokenSecret);

    return { accessToken, refreshToken, sessionId };
  }

  async verifyAccessToken(token: string): Promise<AdminTokenPayload> {
    const { payload } = await jwtVerify(token, this.accessTokenSecret, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return payload as AdminTokenPayload;
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string; sessionId: string }> {
    const { payload } = await jwtVerify(token, this.refreshTokenSecret, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return payload as { sub: string; sessionId: string };
  }
}
```

### 4. 認証ミドルウェア実装

#### `src/infrastructure/auth/middleware/adminAuth.ts`
```typescript
import { Context, Next } from 'hono';
import { AdminJWTManager } from '../utils/adminJwt';
import { AdminRepository } from '../../database/AdminRepository';

export interface AuthenticatedContext extends Context {
  admin: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export function createAdminAuthMiddleware(
  jwtManager: AdminJWTManager,
  adminRepo: AdminRepository
) {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const token = authHeader.substring(7);
      const payload = await jwtManager.verifyAccessToken(token);

      // トークンのブラックリストチェック（実装が必要）
      // if (await isTokenBlacklisted(payload.jti)) {
      //   return c.json({ error: 'Token revoked' }, 401);
      // }

      // 管理者の存在確認
      const admin = await adminRepo.findById(payload.sub);
      if (!admin || !admin.isActive) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // コンテキストに管理者情報を追加
      (c as AuthenticatedContext).admin = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      };

      await next();
    } catch (error) {
      return c.json({ error: 'Invalid token' }, 401);
    }
  };
}
```

### 5. ログインユースケース実装

#### `src/application/usecases/admin/LoginUseCase.ts`
```typescript
import { z } from 'zod';
import { AdminRepository } from '../../../infrastructure/database/AdminRepository';
import { SessionRepository } from '../../../infrastructure/database/SessionRepository';
import { PasswordManager } from '../../../infrastructure/auth/utils/password';
import { AdminJWTManager } from '../../../infrastructure/auth/utils/adminJwt';
import { ActivityLogger } from '../../../infrastructure/logging/ActivityLogger';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
  ipAddress: z.string(),
  userAgent: z.string(),
});

export class LoginUseCase {
  constructor(
    private adminRepo: AdminRepository,
    private sessionRepo: SessionRepository,
    private passwordManager: PasswordManager,
    private jwtManager: AdminJWTManager,
    private activityLogger: ActivityLogger
  ) {}

  async execute(input: unknown) {
    const data = LoginSchema.parse(input);

    // 管理者を取得
    const admin = await this.adminRepo.findByEmail(data.email);
    if (!admin) {
      await this.logFailedAttempt(data.email, data.ipAddress, data.userAgent);
      throw new Error('Invalid credentials');
    }

    // アカウントロックチェック
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new Error('Account is locked');
    }

    // パスワード検証
    const isValidPassword = await this.passwordManager.verify(
      data.password,
      admin.passwordHash
    );

    if (!isValidPassword) {
      await this.handleFailedLogin(admin, data.ipAddress, data.userAgent);
      throw new Error('Invalid credentials');
    }

    // アカウントアクティブチェック
    if (!admin.isActive) {
      throw new Error('Account is disabled');
    }

    // ログイン成功処理
    await this.adminRepo.updateLastLogin(admin.id);
    await this.adminRepo.resetFailedAttempts(admin.id);

    // トークン生成
    const { accessToken, refreshToken, sessionId } = await this.jwtManager.generateTokenPair({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    });

    // セッション保存
    const expiresAt = data.rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7日

    await this.sessionRepo.create({
      id: sessionId,
      adminId: admin.id,
      refreshToken,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      expiresAt,
    });

    // アクティビティログ記録
    await this.activityLogger.log({
      adminId: admin.id,
      action: 'LOGIN_SUCCESS',
      details: {
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1時間
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  private async handleFailedLogin(admin: any, ipAddress: string, userAgent: string) {
    const attempts = admin.failedLoginAttempts + 1;
    const shouldLock = attempts >= 5;

    await this.adminRepo.incrementFailedAttempts(admin.id, shouldLock);

    await this.activityLogger.log({
      adminId: admin.id,
      action: shouldLock ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILURE',
      details: {
        ipAddress,
        userAgent,
        attempts,
      },
    });
  }

  private async logFailedAttempt(email: string, ipAddress: string, userAgent: string) {
    await this.activityLogger.log({
      adminId: 'unknown',
      action: 'LOGIN_FAILURE',
      details: {
        email,
        ipAddress,
        userAgent,
      },
    });
  }
}
```

### 6. ルート実装

#### `src/routes/admin/auth.ts`
```typescript
import { Hono } from 'hono';
import { LoginUseCase } from '../../application/usecases/admin/LoginUseCase';
import { createRateLimiter } from '../../infrastructure/security/rateLimiter';

export function createAdminAuthRoutes(dependencies: {
  loginUseCase: LoginUseCase;
  // 他のユースケース
}) {
  const app = new Hono();
  const loginLimiter = createRateLimiter('login');

  // ログイン
  app.post('/login', loginLimiter, async (c) => {
    try {
      const body = await c.req.json();
      const result = await dependencies.loginUseCase.execute({
        ...body,
        ipAddress: c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown',
      });

      return c.json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return c.json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        }, 401);
      }

      if (error.message === 'Account is locked') {
        return c.json({
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account is temporarily locked',
          },
        }, 423);
      }

      throw error;
    }
  });

  // 他のエンドポイント...

  return app;
}
```

### 7. 依存性注入設定

#### `src/infrastructure/container/auth.ts`
```typescript
import { PasswordManager } from '../auth/utils/password';
import { AdminJWTManager } from '../auth/utils/adminJwt';
import { LoginUseCase } from '../../application/usecases/admin/LoginUseCase';
import { AdminRepository } from '../database/AdminRepository';
import { SessionRepository } from '../database/SessionRepository';
import { ActivityLogger } from '../logging/ActivityLogger';
import { db } from '../database/connection';

export function createAuthContainer() {
  const passwordManager = new PasswordManager(
    Number(process.env.BCRYPT_ROUNDS) || 12
  );

  const jwtManager = new AdminJWTManager({
    accessTokenSecret: process.env.ADMIN_JWT_SECRET!,
    refreshTokenSecret: process.env.ADMIN_REFRESH_TOKEN_SECRET!,
    accessTokenExpiry: process.env.ADMIN_JWT_EXPIRES_IN || '1h',
    refreshTokenExpiry: process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN || '7d',
  });

  const adminRepo = new AdminRepository(db);
  const sessionRepo = new SessionRepository(db);
  const activityLogger = new ActivityLogger(db);

  const loginUseCase = new LoginUseCase(
    adminRepo,
    sessionRepo,
    passwordManager,
    jwtManager,
    activityLogger
  );

  return {
    passwordManager,
    jwtManager,
    loginUseCase,
    // 他のユースケース...
  };
}
```

## テスト実装

### ユニットテスト例

#### `src/__tests__/auth/password.test.ts`
```typescript
import { PasswordManager } from '../../infrastructure/auth/utils/password';

describe('PasswordManager', () => {
  const passwordManager = new PasswordManager(10); // テスト用に低いラウンド数

  describe('hash', () => {
    it('should hash password', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordManager.hash(password);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await passwordManager.hash(password);
      const hash2 = await passwordManager.hash(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordManager.hash(password);
      
      const isValid = await passwordManager.verify(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordManager.hash(password);
      
      const isValid = await passwordManager.verify('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate strong password', () => {
      const result = passwordManager.validate('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = passwordManager.validate('weak');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('パスワードは8文字以上必要です');
    });
  });
});
```

## トラブルシューティング

### よくある問題

1. **JWT検証エラー**
   - 環境変数が正しく設定されているか確認
   - トークンの有効期限を確認
   - シークレットキーの一致を確認

2. **パスワードハッシュエラー**
   - bcryptのインストールを確認
   - Node.jsのバージョン互換性を確認

3. **レート制限エラー**
   - Redisの接続を確認
   - レート制限の設定値を確認

### デバッグ方法

```typescript
// 詳細ログを有効化
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
};
```

## パフォーマンス最適化

1. **パスワードハッシュ**
   - 適切なbcryptラウンド数の設定（本番: 12-14）
   - 非同期処理の活用

2. **JWT検証**
   - トークンのキャッシュ
   - 署名アルゴリズムの選択

3. **データベースクエリ**
   - インデックスの適切な設定
   - N+1問題の回避

## セキュリティチェックリスト

- [ ] 環境変数が.gitignoreに含まれている
- [ ] 本番環境のシークレットキーが十分に強力
- [ ] エラーメッセージが機密情報を含まない
- [ ] すべての入力がバリデーションされている
- [ ] レート制限が設定されている
- [ ] HTTPSが強制されている
- [ ] セキュリティヘッダーが設定されている
- [ ] ログに機密情報が含まれていない