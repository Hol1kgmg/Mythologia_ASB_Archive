# 認証システムセキュリティ設計

## 概要

このドキュメントは、管理者認証システムのセキュリティ要件と実装方針を定義します。

## セキュリティ原則

### 1. Defense in Depth（多層防御）
複数のセキュリティ層を設けることで、単一の防御が破られても他の層で保護します。

### 2. Principle of Least Privilege（最小権限の原則）
各ユーザーには必要最小限の権限のみを付与します。

### 3. Zero Trust Security（ゼロトラスト）
すべてのリクエストを検証し、信頼しません。

## 脅威モデル

### 想定される攻撃

1. **認証情報の窃取**
   - パスワードリスト攻撃
   - フィッシング攻撃
   - 中間者攻撃（MITM）

2. **不正アクセス**
   - ブルートフォース攻撃
   - セッションハイジャック
   - トークン偽造

3. **情報漏洩**
   - SQLインジェクション
   - ログからの情報漏洩
   - エラーメッセージからの情報推測

4. **サービス妨害**
   - DDoS攻撃
   - リソース枯渇攻撃

## セキュリティ対策

### 1. パスワード保護

#### ハッシュアルゴリズム
```typescript
// bcryptを使用（推奨）
const saltRounds = 12;  // コスト係数
const hashedPassword = await bcrypt.hash(password, saltRounds);

// またはargon2を使用
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
});
```

#### パスワードポリシー
```typescript
interface PasswordPolicy {
  minLength: 8;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: true;
  maxLength: 128;
  preventCommonPasswords: true;
  preventUserInfoInPassword: true;
}
```

#### パスワード検証
```typescript
function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("パスワードは8文字以上必要です");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("大文字を含む必要があります");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("小文字を含む必要があります");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("数字を含む必要があります");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("特殊文字を含むことを推奨します");
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 2. トークン管理

#### JWT設定
```typescript
interface JWTConfig {
  // アクセストークン
  accessToken: {
    secret: process.env.ADMIN_JWT_SECRET;  // 最低256ビット
    algorithm: 'HS256' | 'RS256';          // 本番環境ではRS256推奨
    expiresIn: '1h';                       // 短い有効期限
    issuer: 'mythologia-admin';
    audience: 'mythologia-admin-api';
  };
  
  // リフレッシュトークン
  refreshToken: {
    secret: process.env.ADMIN_REFRESH_SECRET;  // アクセストークンとは別
    expiresIn: '7d';
    maxSessions: 5;  // デバイスあたりの最大セッション数
  };
}
```

#### トークン無効化（ブラックリスト）
```typescript
interface TokenBlacklist {
  addToken(jti: string, expiresAt: Date): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
  cleanup(): Promise<void>;  // 期限切れトークンの削除
}
```

### 3. セッション管理

#### セッション制御
```typescript
interface SessionControl {
  // 同時ログイン制限
  maxConcurrentSessions: 3;
  
  // セッションタイムアウト
  absoluteTimeout: '8h';      // 絶対的タイムアウト
  idleTimeout: '30m';         // アイドルタイムアウト
  
  // デバイス管理
  trackDevices: true;
  requireReauthForNewDevice: true;
}
```

#### セッション検証
```typescript
async function validateSession(sessionId: string): Promise<boolean> {
  const session = await getSession(sessionId);
  
  if (!session) return false;
  
  // 有効期限チェック
  if (session.expiresAt < new Date()) return false;
  
  // アイドルタイムアウトチェック
  if (session.lastActivityAt < subMinutes(new Date(), 30)) return false;
  
  // IPアドレス変更チェック（オプション）
  if (session.ipAddress !== getCurrentIpAddress()) {
    await logSecurityEvent('IP_ADDRESS_CHANGED', session);
    return false;
  }
  
  return true;
}
```

### 4. ブルートフォース対策

#### レート制限
```typescript
interface RateLimitConfig {
  login: {
    points: 5,          // 試行回数
    duration: 60,       // 期間（秒）
    blockDuration: 900, // ブロック期間（秒）
  };
  
  api: {
    points: 60,
    duration: 60,
    blockDuration: 60,
  };
}
```

#### アカウントロック
```typescript
interface AccountLockPolicy {
  maxFailedAttempts: 5;
  lockoutDuration: '15m';
  resetAttemptsAfter: '1h';
  notifyOnLockout: true;
}

async function handleFailedLogin(email: string): Promise<void> {
  const admin = await getAdminByEmail(email);
  if (!admin) return;
  
  admin.failedLoginAttempts += 1;
  
  if (admin.failedLoginAttempts >= 5) {
    admin.lockedUntil = addMinutes(new Date(), 15);
    await notifyAccountLocked(admin);
  }
  
  await updateAdmin(admin);
}
```

### 5. 監査とロギング

#### アクティビティログ
```typescript
interface ActivityLog {
  adminId: string;
  action: SecurityAction;
  details: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    deviceId?: string;
  };
  result: 'SUCCESS' | 'FAILURE';
  timestamp: Date;
}

enum SecurityAction {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}
```

#### ログの保護
- ログにパスワードや機密情報を含めない
- ログファイルへのアクセス制限
- ログの暗号化（保存時）
- ログの定期的なローテーション

### 6. 通信の保護

#### HTTPS必須
```typescript
// HTTPSリダイレクト
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});
```

#### セキュリティヘッダー
```typescript
app.use((req, res, next) => {
  // XSS対策
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HTTPS強制
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // コンテンツセキュリティポリシー
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
});
```

### 7. エラーハンドリング

#### セキュアなエラーメッセージ
```typescript
// 悪い例
if (!user) {
  throw new Error('User admin@example.com not found');
}

// 良い例
if (!user || !await verifyPassword(password, user.passwordHash)) {
  throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
}
```

#### エラーレスポンス
```typescript
function sanitizeError(error: Error): ErrorResponse {
  // 本番環境では詳細を隠す
  if (process.env.NODE_ENV === 'production') {
    return {
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: 'An error occurred',
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  // 開発環境では詳細を含める
  return {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message,
      stack: error.stack,
    },
    timestamp: new Date().toISOString(),
  };
}
```

## セキュリティテスト

### 1. 脆弱性スキャン
- 依存関係の脆弱性チェック（npm audit）
- OWASP ZAPによる動的スキャン
- SonarQubeによる静的解析

### 2. ペネトレーションテスト
- 認証バイパステスト
- SQLインジェクションテスト
- XSSテスト
- CSRFテスト

### 3. 負荷テスト
- ブルートフォース耐性テスト
- レート制限の動作確認
- 同時接続数の上限テスト

## インシデント対応

### 1. 検知
- 異常なログイン試行の監視
- 権限昇格の検知
- 異常なAPIアクセスパターンの検知

### 2. 対応手順
1. インシデントの確認と影響範囲の特定
2. 該当アカウントの一時停止
3. ログの保全と分析
4. 脆弱性の修正
5. 影響を受けたユーザーへの通知
6. 再発防止策の実施

### 3. 報告
- インシデントレポートの作成
- 関係者への報告
- 必要に応じて外部機関への報告

## コンプライアンス

### 1. データ保護
- 個人情報の暗号化
- アクセスログの適切な管理
- データ保持期間の設定

### 2. 監査要件
- 定期的なセキュリティ監査
- コンプライアンスチェック
- 脆弱性診断

## 継続的改善

### 1. セキュリティアップデート
- 依存関係の定期的な更新
- セキュリティパッチの適用
- 新しい脅威への対応

### 2. セキュリティ教育
- 開発者向けセキュアコーディング研修
- セキュリティベストプラクティスの共有
- インシデント対応訓練