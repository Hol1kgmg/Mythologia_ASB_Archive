# セキュリティガイドライン

## セキュリティ設計原則

### 1. 基本原則
- **最小権限の原則**: 必要最小限の権限のみ付与
- **多層防御**: 単一の対策に依存しない
- **ゼロトラスト**: すべての入力を信頼しない
- **セキュアバイデフォルト**: 安全な初期設定

### 2. 脅威モデリング
```
主要な脅威:
├── 認証・認可の脆弱性
├── インジェクション攻撃
├── データ露出
├── セッション管理の不備
└── 設定ミス
```

## 認証・認可

### 1. ユーザー認証（OAuth 2.0）

```typescript
// Google OAuth実装
export class GoogleAuthService {
  private validateIdToken(token: string): Promise<GoogleUser> {
    // 1. トークンの署名検証
    // 2. 発行者（iss）の確認
    // 3. 対象者（aud）の確認
    // 4. 有効期限（exp）の確認
    return verifyIdToken(token, {
      issuer: 'https://accounts.google.com',
      audience: process.env.GOOGLE_CLIENT_ID,
      maxAge: 3600
    });
  }
}
```

### 2. 管理者認証（JWT + MFA）

```typescript
// 多要素認証の実装
export class AdminAuthService {
  async login(credentials: AdminCredentials): Promise<AuthResult> {
    // Step 1: パスワード検証
    const admin = await this.verifyPassword(credentials);
    
    // Step 2: IP制限チェック
    if (!this.isAllowedIP(credentials.ipAddress, admin.allowedIPs)) {
      throw new SecurityError('ACCESS_DENIED_IP');
    }
    
    // Step 3: MFAコード要求
    return { requiresMFA: true, sessionId: generateSessionId() };
  }
  
  async verifyMFA(sessionId: string, mfaCode: string): Promise<TokenPair> {
    // TOTP検証
    const isValid = verifyTOTP(mfaCode, admin.mfaSecret);
    if (!isValid) {
      await this.recordFailedAttempt(admin.id);
      throw new SecurityError('INVALID_MFA_CODE');
    }
    
    return this.generateTokens(admin);
  }
}
```

### 3. JWT実装

```typescript
// セキュアなJWT設定
const jwtConfig = {
  // 署名アルゴリズム
  algorithm: 'RS256',  // 非対称鍵を使用
  
  // トークン有効期限
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  
  // クレーム
  standardClaims: {
    iss: 'mythologia-app',
    aud: 'mythologia-users'
  }
};

// トークン生成
function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      permissions: user.permissions
    },
    privateKey,
    {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.accessTokenExpiry,
      issuer: jwtConfig.standardClaims.iss,
      audience: jwtConfig.standardClaims.aud
    }
  );
}
```

## 入力検証とサニタイゼーション

### 1. Zodによる入力検証

```typescript
// 厳密な入力スキーマ定義
const cardInputSchema = z.object({
  name: z.string()
    .min(1, 'カード名は必須です')
    .max(50, 'カード名は50文字以内で入力してください')
    .regex(/^[a-zA-Z0-9\s\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+$/, '使用できない文字が含まれています'),
  
  cost: z.number()
    .int('コストは整数で入力してください')
    .min(0, 'コストは0以上で入力してください')
    .max(10, 'コストは10以下で入力してください'),
  
  effects: z.array(
    z.object({
      type: z.enum(['damage', 'heal', 'draw', 'buff', 'debuff']),
      value: z.number().int().min(0).max(999)
    })
  ).max(5, '効果は最大5個までです')
});

// 使用例
export async function createCard(rawInput: unknown) {
  try {
    // 入力検証
    const validatedInput = cardInputSchema.parse(rawInput);
    
    // ビジネスロジック
    return await cardService.create(validatedInput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('入力エラー', error.errors);
    }
    throw error;
  }
}
```

### 2. SQLインジェクション対策

```typescript
// ❌ 脆弱な実装
const query = `SELECT * FROM cards WHERE name = '${userInput}'`;

// ✅ 安全な実装（パラメータ化クエリ）
const query = 'SELECT * FROM cards WHERE name = $1';
const result = await db.query(query, [userInput]);

// ✅ クエリビルダー使用
const result = await db
  .select('*')
  .from('cards')
  .where('name', '=', userInput);
```

### 3. XSS対策

```typescript
// HTMLエスケープ関数
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// React使用時の安全な実装
function CardDisplay({ card }: { card: Card }) {
  // Reactは自動的にエスケープする
  return <div>{card.name}</div>;
  
  // dangerouslySetInnerHTMLは避ける
  // もし必要な場合はDOMPurifyでサニタイズ
  const sanitizedHtml = DOMPurify.sanitize(card.description);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
```

## データ保護

### 1. 暗号化

```typescript
// パスワードハッシュ化
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// センシティブデータの暗号化
import crypto from 'crypto';

class DataEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    // 環境変数から暗号化キーを取得
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
}
```

### 2. 通信の保護

```typescript
// HTTPS強制
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// セキュリティヘッダー
app.use((req, res, next) => {
  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // XSS保護
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CSP
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://accounts.google.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.mythologia.example.com"
  );
  
  next();
});
```

## セッション管理

### 1. セキュアなセッション設定

```typescript
// セッション設定
const sessionConfig = {
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS必須
    httpOnly: true,      // XSS対策
    sameSite: 'strict',  // CSRF対策
    maxAge: 1000 * 60 * 15  // 15分
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 900  // 15分
  })
};
```

### 2. CSRF対策

```typescript
// CSRFトークン生成と検証
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// 状態変更を伴うエンドポイントで使用
app.post('/api/cards', csrfProtection, async (req, res) => {
  // CSRFトークンは自動的に検証される
  const card = await createCard(req.body);
  res.json(card);
});
```

## エラーハンドリング

### 1. セキュアなエラーレスポンス

```typescript
// エラーハンドリングミドルウェア
export function errorHandler(err: Error, req: Request, res: Response, next: Next) {
  // ログには詳細を記録
  logger.error({
    error: err,
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?.id
    }
  });
  
  // クライアントには最小限の情報のみ
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined
    });
  }
  
  // 一般的なエラー
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'エラーが発生しました。しばらくしてから再度お試しください。'
  });
}
```

## 監査とログ

### 1. セキュリティイベントログ

```typescript
// セキュリティイベントの記録
export class SecurityLogger {
  logAuthAttempt(event: AuthEvent) {
    logger.info({
      type: 'AUTH_ATTEMPT',
      timestamp: new Date().toISOString(),
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      success: event.success,
      reason: event.reason
    });
  }
  
  logAccessDenied(event: AccessEvent) {
    logger.warn({
      type: 'ACCESS_DENIED',
      timestamp: new Date().toISOString(),
      userId: event.userId,
      resource: event.resource,
      action: event.action,
      ip: event.ip
    });
  }
  
  logDataAccess(event: DataAccessEvent) {
    // GDPRコンプライアンスのため
    logger.info({
      type: 'DATA_ACCESS',
      timestamp: new Date().toISOString(),
      adminId: event.adminId,
      targetUserId: event.targetUserId,
      dataType: event.dataType,
      purpose: event.purpose
    });
  }
}
```

### 2. 監査ログの保護

```typescript
// 監査ログの改ざん防止
export class AuditLogger {
  async log(event: AuditEvent) {
    // イベントのハッシュ化
    const eventHash = this.hashEvent(event);
    
    // チェーン形式で保存
    const previousHash = await this.getLastEventHash();
    const chainedHash = this.hash(previousHash + eventHash);
    
    await db.auditLogs.create({
      ...event,
      eventHash,
      chainedHash,
      timestamp: new Date()
    });
  }
  
  private hashEvent(event: AuditEvent): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(event))
      .digest('hex');
  }
}
```

## 依存関係管理

### 1. 脆弱性スキャン

```bash
# package.jsonのスクリプト
{
  "scripts": {
    "security:check": "npm audit --production",
    "security:fix": "npm audit fix",
    "security:report": "npm audit --json > security-report.json"
  }
}
```

### 2. 依存関係の更新ポリシー

```yaml
# renovate.json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchPackagePatterns": ["*"],
      "matchUpdateTypes": ["patch"],
      "groupName": "all patch dependencies",
      "automerge": true
    },
    {
      "matchPackagePatterns": ["*"],
      "matchUpdateTypes": ["minor"],
      "groupName": "all minor dependencies",
      "automerge": false
    }
  ],
  "vulnerabilityAlerts": {
    "labels": ["security"],
    "assignees": ["@security-team"]
  }
}
```

## インシデント対応

### 1. 対応フロー

```
1. 検知
   ├── 自動アラート
   ├── ユーザー報告
   └── 定期監査

2. 評価
   ├── 影響範囲の特定
   ├── 重要度判定
   └── 対応優先度決定

3. 封じ込め
   ├── 影響システムの隔離
   ├── アクセス制限
   └── 証拠保全

4. 根絶
   ├── 脆弱性の修正
   ├── パッチ適用
   └── 設定変更

5. 復旧
   ├── システム復旧
   ├── 監視強化
   └── 正常性確認

6. 事後対応
   ├── インシデントレポート
   ├── 再発防止策
   └── ユーザー通知
```

## まとめ

セキュリティは継続的な取り組みが必要です。これらのガイドラインは最低限の基準であり、新たな脅威に対応するため定期的な見直しが必要です。全員がセキュリティ意識を持ち、日々の開発で実践することが重要です。