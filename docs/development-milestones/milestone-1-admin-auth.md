# マイルストーン 1: システム管理者認証基盤

## ステータス: 🔴 未開始

## 概要
システム管理者専用の認証システムと管理者アカウント管理機能を構築します。スーパー管理者による他の管理者アカウントのCRUD機能を含み、カードマスターデータを管理するための基盤を整備します。

## 期間
- **開始予定**: 2025年6月第1週
- **終了予定**: 2025年6月第2週
- **期間**: 2週間

## 目標
- セキュアな管理者認証システムの実装
- 管理者専用APIエンドポイントの保護
- 基本的な管理者ダッシュボード
- ロール別アクセス制御の基礎
- 管理者アカウントのCRUD機能（スーパー管理者権限）
- 管理者の権限管理とアクティビティ監視

## タスクリスト

### Week 1: プロジェクト基盤と認証バックエンド

#### Day 1-2: プロジェクト初期設定
- [ ] package.jsonの作成と依存関係の定義
  - TypeScript, Hono, Zod
  - bcrypt, jsonwebtoken
  - PostgreSQL/D1ドライバー
- [ ] TypeScript設定（tsconfig.json）
- [ ] プロジェクト基本構造の作成
- [ ] 環境変数設定（.env.example）

#### Day 3-4: データベースと認証テーブル
- [ ] データベース接続設定（PostgreSQL/D1）
- [ ] 管理者テーブルの作成
  ```sql
  CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    permissions JSON DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(36),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] セッションテーブルの作成
- [ ] 管理者アクティビティログテーブルの作成
  ```sql
  CREATE TABLE admin_activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
  );
  ```
- [ ] 初期スーパー管理者アカウントのシーダー作成

#### Day 5: 認証API実装
- [ ] `/api/admin/auth/login` エンドポイント
- [ ] `/api/admin/auth/logout` エンドポイント
- [ ] `/api/admin/auth/refresh` エンドポイント
- [ ] JWT トークン生成・検証ロジック
- [ ] パスワードハッシュ化処理

### Week 2: 認証ミドルウェアと管理画面基礎

#### Day 6-7: 認証ミドルウェアとセキュリティ
- [ ] 認証ミドルウェアの実装
- [ ] ロールベースアクセス制御（RBAC）
- [ ] Rate Limiting実装
- [ ] CORS設定（管理画面専用）
- [ ] セキュリティヘッダー設定

#### Day 8-9: 管理者アカウント管理API
- [ ] `/api/admin/admins` - 管理者一覧取得（スーパー管理者のみ）
- [ ] `/api/admin/admins/:id` - 管理者詳細取得
- [ ] POST `/api/admin/admins` - 新規管理者作成（スーパー管理者のみ）
- [ ] PUT `/api/admin/admins/:id` - 管理者情報更新
- [ ] DELETE `/api/admin/admins/:id` - 管理者無効化（スーパー管理者のみ）
- [ ] PUT `/api/admin/admins/:id/permissions` - 権限更新（スーパー管理者のみ）
- [ ] GET `/api/admin/admins/:id/activity` - アクティビティ履歴
- [ ] POST `/api/admin/admins/:id/reset-password` - パスワードリセット

#### Day 10: テストとドキュメント
- [ ] 認証フローの統合テスト
- [ ] セキュリティテスト（不正アクセス試行）
- [ ] API仕様書作成（管理者認証部分）
- [ ] 管理者向け操作マニュアル

## 成果物

### API エンドポイント
```
# 認証
POST   /api/admin/auth/login      # 管理者ログイン
POST   /api/admin/auth/logout     # ログアウト
POST   /api/admin/auth/refresh    # トークン更新
GET    /api/admin/profile         # 自身のプロフィール取得
PUT    /api/admin/profile         # 自身のプロフィール更新

# 管理者アカウント管理（スーパー管理者権限）
GET    /api/admin/admins          # 管理者一覧
GET    /api/admin/admins/:id      # 管理者詳細
POST   /api/admin/admins          # 管理者作成
PUT    /api/admin/admins/:id      # 管理者更新
DELETE /api/admin/admins/:id      # 管理者無効化
PUT    /api/admin/admins/:id/permissions      # 権限更新
GET    /api/admin/admins/:id/activity         # アクティビティ履歴 (TODO: 後で実装)
POST   /api/admin/admins/:id/reset-password   # パスワードリセット

# ダッシュボード
GET    /api/admin/dashboard       # ダッシュボード統計
GET    /api/admin/activity-logs   # システム全体のアクティビティログ (TODO: 後で実装)
```

### ミドルウェア構成
```typescript
// 認証ミドルウェア
export const authMiddleware = async (c: Context, next: Next) => {
  // JWT検証ロジック
};

// 管理者権限チェック
export const adminOnly = async (c: Context, next: Next) => {
  // ロール検証ロジック
};

// スーパー管理者権限チェック
export const superAdminOnly = async (c: Context, next: Next) => {
  // スーパー管理者権限の検証
};

// アクティビティログ記録 (TODO: 後で実装)
export const activityLogger = async (c: Context, next: Next) => {
  // 管理者アクションの記録
};

// Rate Limiting
export const rateLimiter = async (c: Context, next: Next) => {
  // アクセス頻度制限
};
```

### セキュリティ設定
- JWT有効期限: 15分（アクセストークン）
- リフレッシュトークン: 7日間
- パスワード要件: 最低8文字、英数字混在
- ログイン試行制限: 5回失敗で15分ロック

## 成功基準

### 必須要件
- ✅ 管理者がログインできる
- ✅ 不正なトークンでのアクセスが拒否される
- ✅ トークンの自動更新が機能する
- ✅ ログアウトが正常に機能する
- ✅ Rate Limitingが機能する
- ✅ スーパー管理者が他の管理者アカウントを作成できる
- ✅ スーパー管理者が管理者の権限を管理できる
- ✅ 管理者のアクティビティが記録される
- ✅ 非スーパー管理者は他の管理者情報にアクセスできない

### セキュリティ要件
- パスワードが適切にハッシュ化される
- SQLインジェクション対策済み
- XSS対策済み
- CSRF対策済み
- セキュアなセッション管理

## 技術詳細

### 使用ライブラリ
```json
{
  "dependencies": {
    "hono": "^3.x",
    "@hono/jwt": "^1.x",
    "bcrypt": "^5.x",
    "zod": "^3.x",
    "@neondatabase/serverless": "^0.x",
    "@cloudflare/d1": "^1.x"
  }
}
```

### 環境変数
```env
# 認証設定
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# データベース
DATABASE_URL=postgresql://...
D1_DATABASE_ID=...

# 初期スーパー管理者設定
SUPER_ADMIN_EMAIL=super@example.com
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=change-me-immediately

# セキュリティ設定
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15m
PASSWORD_MIN_LENGTH=8
```

## リスクと対策

### リスク1: セキュリティ脆弱性
- **影響**: 不正アクセスによるデータ漏洩
- **対策**: セキュリティテストの徹底、定期的な依存関係更新

### リスク2: パフォーマンス問題
- **影響**: 管理画面の応答速度低下
- **対策**: 適切なインデックス設定、キャッシュ実装

## 次のマイルストーン
[マイルストーン 2: カードマスター管理機能](milestone-2-card-admin.md) - 管理者専用のカードCRUD機能実装