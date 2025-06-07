# アカウント管理システム - セキュリティ設計

## 概要

神託のメソロギア（Mythologia）非公式Webアプリケーションのアカウント管理システムにおけるセキュリティ設計です。
認証・認可・セッション管理・監査ログなど、管理者アカウントのセキュリティ要件を包括的に設計しています。

## 認証（Authentication）設計

### 1. パスワード認証

#### パスワード強度要件
```typescript
class AdminPassword {
  private validate(): void {
    // 最小8文字
    if (this.value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // 大文字・小文字・数字を各1文字以上
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.value)) {
      throw new Error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
    }
  }
}
```

**パスワード要件:**
- **最小長**: 8文字以上
- **複雑性**: 大文字・小文字・数字を各1文字以上含む
- **推奨**: 特殊文字の使用
- **禁止**: 辞書単語、連続文字、繰り返し文字

#### パスワードハッシュ化

```typescript
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    // Node.js環境でのbcrypt使用
    if (typeof require !== 'undefined') {
      const bcrypt = require('bcrypt');
      return await bcrypt.hash(password, this.saltRounds);
    }
    // フォールバック: 簡易ハッシュ（開発用のみ）
    return this.simpleHash(password);
  }
}
```

**ハッシュ化仕様:**
- **アルゴリズム**: bcrypt
- **コスト係数**: 12（2024年推奨値）
- **ソルト**: bcryptが自動生成
- **フォールバック**: 開発環境用の簡易ハッシュ
- **セキュリティ**: 平文パスワードは一切保存しない

### 2. JWT（JSON Web Token）認証

#### トークン種別

```typescript
// アクセストークン（短期間有効）
interface AccessTokenPayload {
  sub: string;           // 管理者ID
  username: string;      // ユーザー名
  role: AdminRole;       // ロール
  isSuperAdmin: boolean; // スーパー管理者フラグ
  permissions: AdminPermissionDTO[]; // 権限配列
  iat: number;          // 発行時刻
  exp: number;          // 有効期限
}

// リフレッシュトークン（長期間有効）
interface RefreshTokenPayload {
  sub: string;      // 管理者ID
  sessionId: string; // セッションID
  type: 'refresh';   // トークン種別
  iat: number;      // 発行時刻
  exp: number;      // 有効期限
}
```

#### トークン設定

| トークン種別 | 有効期限 | 用途 | 保存場所 |
|-------------|----------|------|----------|
| アクセストークン | 15分 | API認証 | メモリ/LocalStorage |
| リフレッシュトークン | 7日 | トークン更新 | HttpOnly Cookie推奨 |

#### JWT実装

```typescript
export class HonoJWTManager implements JWTManager {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  async generateAccessToken(admin: Admin): Promise<string> {
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      isSuperAdmin: admin.isSuperAdmin,
      permissions: admin.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry('15m')
    };
    
    // @hono/jwt を使用
    const { sign } = await import('@hono/jwt');
    return await sign(payload, this.accessTokenSecret);
  }
}
```

**セキュリティ設定:**
- **シークレット**: 環境変数で管理
- **アルゴリズム**: HS256（HMAC with SHA-256）
- **検証**: 署名・有効期限・発行者の検証
- **更新**: リフレッシュトークンによる自動更新

### 3. セッション管理

#### セッション情報

```typescript
export interface AdminSession {
  id: string;           // セッションID
  adminId: string;      // 管理者ID
  refreshToken: string; // リフレッシュトークン
  expiresAt: Date;      // 有効期限
  ipAddress: string | null;   // ログイン元IP
  userAgent: string | null;   // ユーザーエージェント
  isActive: boolean;    // アクティブフラグ
  createdAt: Date;      // 作成日時
}
```

#### セッション制御

```sql
-- セッションテーブル設計
CREATE TABLE admin_sessions (
  id VARCHAR(36) PRIMARY KEY,
  admin_id VARCHAR(36) NOT NULL,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**セッション管理方針:**
- **同時セッション数**: 制限なし（監視は実施）
- **有効期限**: 7日間（延長なし）
- **自動無効化**: 有効期限切れ・明示的ログアウト
- **デバイス識別**: IP・User-Agentによる識別

### 4. レート制限（Rate Limiting）

#### ログイン試行制限

```typescript
export class InMemoryRateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly maxAttempts = 5;      // 最大試行回数
  private readonly windowMs = 15 * 60 * 1000; // 15分のウィンドウ

  recordAttempt(identifier: string): { 
    blocked: boolean; 
    remainingAttempts: number; 
    resetAt: number 
  } {
    // 試行回数の記録と制限チェック
  }
}
```

**制限設定:**
- **最大試行回数**: 5回/15分間
- **識別子**: IPアドレス + ユーザー名
- **ブロック期間**: 15分間
- **実装**: インメモリ（本番ではRedis推奨）

## 認可（Authorization）設計

### 1. ロールベースアクセス制御（RBAC）

#### ロール階層

```
super_admin (スーパー管理者)
    ├── 全ての権限を持つ
    ├── 他の管理者を管理できる
    └── システム設定を変更できる
    
admin (一般管理者)
    ├── 権限設定に基づく制限付きアクセス
    ├── 自分のプロフィールは変更可能
    └── 他の管理者は管理できない
```

#### 権限設計

```typescript
interface AdminPermissionDTO {
  resource: 'cards' | 'users' | 'admins' | 'system';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

**リソース定義:**
- **cards**: カード管理（カード情報の CRUD）
- **users**: ユーザー管理（エンドユーザーの管理）
- **admins**: 管理者管理（管理者アカウントの CRUD）
- **system**: システム管理（設定・ログ・統計）

**アクション定義:**
- **create**: 新規作成権限
- **read**: 閲覧権限
- **update**: 更新権限
- **delete**: 削除権限

### 2. 権限チェック実装

```typescript
export class AdminPermissionChecker {
  // スーパー管理者チェック
  static canManageAdmins(admin: Admin): boolean {
    return admin.isSuperAdmin;
  }

  // リソース別権限チェック
  static canViewResource(admin: Admin, resource: AdminPermissionDTO['resource']): boolean {
    return admin.isSuperAdmin ||
           admin.permissions.some(p => 
             p.resource === resource && 
             p.actions.includes('read')
           );
  }

  // アクション別権限チェック
  static canPerformAction(
    admin: Admin, 
    resource: AdminPermissionDTO['resource'], 
    action: AdminPermissionDTO['actions'][number]
  ): boolean {
    return admin.isSuperAdmin ||
           admin.permissions.some(p => 
             p.resource === resource && 
             p.actions.includes(action)
           );
  }
}
```

### 3. 認可ミドルウェア（実装予定）

```typescript
// 認証必須ミドルウェア
export const requireAuth = async (c: Context, next: Next) => {
  const token = extractToken(c.req.header('Authorization'));
  const { adminId } = await jwtManager.verifyAccessToken(token);
  
  // 管理者情報をコンテキストに設定
  c.set('adminId', adminId);
  await next();
};

// 権限チェックミドルウェア
export const requirePermission = (resource: string, action: string) => {
  return async (c: Context, next: Next) => {
    const adminId = c.get('adminId');
    const admin = await adminRepository.findById(adminId);
    
    if (!AdminPermissionChecker.canPerformAction(admin, resource, action)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    await next();
  };
};
```

## セキュリティ脅威と対策

### 1. 認証関連脅威

#### ブルートフォース攻撃
**脅威**: パスワード総当たり攻撃
**対策**:
- レート制限（5回/15分）
- アカウントロック機能
- CAPTCHA導入（将来実装）
- 強力なパスワード要件

#### パスワード漏洩
**脅威**: データベース漏洩によるパスワード露出
**対策**:
- bcryptによる強力なハッシュ化
- ソルトの自動生成
- 平文パスワードの完全排除
- 定期的なパスワード変更推奨

#### セッションハイジャック
**脅威**: セッショントークンの盗取・悪用
**対策**:
- HTTPS通信必須
- HttpOnly Cookie使用
- セッションローテーション
- IP・User-Agent検証

### 2. 認可関連脅威

#### 権限エスカレーション
**脅威**: 権限の不正な昇格
**対策**:
- 厳密な権限チェック
- スーパー管理者権限の制限
- 監査ログによる操作追跡
- 最小権限の原則

#### 水平権限移動
**脅威**: 同レベル他ユーザーのリソースアクセス
**対策**:
- リソース所有者チェック
- 明示的な権限検証
- オブジェクトレベル認可

### 3. アプリケーション脅威

#### SQLインジェクション
**脅威**: 不正なSQL実行
**対策**:
- パラメータ化クエリ使用
- ORM/クエリビルダー活用
- 入力値検証・エスケープ

#### XSS（Cross-Site Scripting）
**脅威**: 悪意のあるスクリプト実行
**対策**:
- 出力時のエスケープ処理
- Content Security Policy設定
- HTTPヘッダーによる保護

#### CSRF（Cross-Site Request Forgery）
**脅威**: 意図しないリクエスト実行
**対策**:
- CSRFトークン実装
- SameSite Cookie設定
- Referrerヘッダー検証

## 監査・ログ設計

### 1. アクティビティログ

#### ログ記録対象

```typescript
export interface AdminActivityLog {
  id: string;           // ログID
  adminId: string;      // 実行者
  action: string;       // アクション
  targetType: string | null;  // 対象タイプ
  targetId: string | null;    // 対象ID
  details: Record<string, any> | null; // 詳細情報
  ipAddress: string | null;   // 実行元IP
  userAgent: string | null;   // User-Agent
  createdAt: Date;      // 実行日時
}
```

#### ログ記録項目

**認証関連:**
- ログイン成功・失敗
- ログアウト
- パスワード変更
- セッション作成・削除

**管理操作:**
- 管理者作成・更新・削除
- 権限変更
- システム設定変更
- データ操作（CRUD）

**セキュリティイベント:**
- 不正ログイン試行
- 権限エラー
- 異常なアクセスパターン

### 2. ログ分析・監視

#### セキュリティ監視項目
- 短時間での大量ログイン失敗
- 通常と異なるIPからのアクセス
- 大量のデータアクセス
- 権限エラーの連続発生
- 深夜・休日のアクセス

#### 自動アラート条件
- 15分以内に5回以上のログイン失敗
- 新しいIPからのスーパー管理者ログイン
- 大量のデータエクスポート
- システム設定の変更

## セキュリティヘッダー

### 1. HTTP セキュリティヘッダー

```typescript
// セキュリティヘッダー設定
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
};
```

### 2. CORS設定

```typescript
// CORS設定（管理者APIは制限的）
export const corsSettings = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 暗号化・データ保護

### 1. 保存データ暗号化

**暗号化対象:**
- パスワードハッシュ（bcrypt）
- セッショントークン（推奨）
- 個人情報（将来実装）

**暗号化方式:**
- **対称暗号**: AES-256-GCM
- **鍵管理**: 環境変数・KMS
- **ソルト**: ランダム生成

### 2. 通信暗号化

**要件:**
- **本番環境**: HTTPS必須
- **開発環境**: HTTP許可
- **API通信**: TLS 1.2以上
- **証明書**: 有効な SSL証明書

## セキュリティテスト

### 1. 脆弱性テスト項目

**認証テスト:**
- [ ] パスワード強度チェック
- [ ] ブルートフォース攻撃耐性
- [ ] セッション管理の安全性
- [ ] トークン検証の正確性

**認可テスト:**
- [ ] 権限エスカレーション防止
- [ ] 水平権限移動防止
- [ ] リソースアクセス制御
- [ ] API エンドポイント保護

**入力検証テスト:**
- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策
- [ ] ファイルアップロード制限

### 2. セキュリティ監査

**定期監査項目:**
- アクセスログ分析
- 権限設定レビュー
- パスワードポリシー遵守確認
- 脆弱性スキャン実行

## コンプライアンス・規制対応

### 1. データ保護規制

**GDPR対応（将来）:**
- データ最小化原則
- 利用目的の明確化
- データ削除権（忘れられる権利）
- データポータビリティ

**個人情報保護法対応:**
- 適切な管理措置
- 本人同意の取得
- 第三者提供の制限
- 漏洩時の報告義務

### 2. セキュリティ標準

**参考規格:**
- ISO 27001（情報セキュリティ管理）
- NIST Cybersecurity Framework
- OWASP Top 10
- JIS Q 27001

## 運用セキュリティ

### 1. セキュリティ運用手順

**インシデント対応:**
1. 異常検知・報告
2. 影響範囲の特定
3. 緊急対応の実施
4. 根本原因の分析
5. 再発防止策の実装

**定期作業:**
- セキュリティパッチ適用
- ログ監視・分析
- アクセス権限レビュー
- 脆弱性スキャン

### 2. セキュリティ教育

**管理者向け教育:**
- パスワード管理
- フィッシング対策
- ソーシャルエンジニアリング対策
- セキュリティインシデント報告

## 将来の拡張予定

### 1. 多要素認証（MFA）
- SMS認証
- TOTPアプリ（Google Authenticator等）
- ハードウェアトークン
- 生体認証

### 2. 高度なセキュリティ機能
- 異常行動検知
- 機械学習ベースの脅威検知
- ゼロトラスト アーキテクチャ
- 特権アクセス管理（PAM）

### 3. 外部認証連携
- SAML SSO
- OAuth 2.0 / OpenID Connect
- LDAP / Active Directory
- 企業 IdP 連携

この包括的なセキュリティ設計により、管理者アカウントシステムの安全性を確保し、継続的なセキュリティ改善を実現します。