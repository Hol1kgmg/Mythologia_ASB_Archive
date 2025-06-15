# システムアーキテクチャ

## アーキテクチャ概要

3層アーキテクチャを採用し、フロントエンド、バックエンド、データベースを分離して開発します。

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Vercel)                      │
│                    (Next.js 15 App Router)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS API
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Railway)                      │
│                       (Node.js/Hono API)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Routes    │  │  Controllers │  │    Services      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Middleware  │  │ Repositories │  │   Validators     │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Drizzle ORM
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Database (Railway)                        │
│                       (PostgreSQL 16)                       │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント詳細

### 1. フロントエンド層

#### 責務
- ユーザーインターフェースの提供
- ユーザー入力の処理
- APIとの通信
- 状態管理

#### 主要コンポーネント
- **App Router**: Next.js 15のファイルベースルーティング
- **Components**: 再利用可能なUIコンポーネント（shadcn/ui）
- **Hooks**: カスタムフック（API通信、状態管理）
- **Store**: グローバル状態管理（Jotai + TanStack Query）
- **Utils**: ユーティリティ関数

### 2. バックエンド層

#### 責務
- APIエンドポイントの提供
- ビジネスロジックの実装
- データ検証
- 認証・認可
- データベースアクセス

#### 主要コンポーネント
- **Routes**: Honoルーティング定義
- **Controllers**: リクエスト/レスポンス処理
- **Services**: ビジネスロジック実装
- **Repositories**: データアクセス層（Drizzle ORM）
- **Middleware**: 認証、ロギング、エラーハンドリング
- **Validators**: 入力検証（Zod）

### 3. データベース層

#### 責務
- データの永続化
- データ整合性の保証
- トランザクション管理

#### 構成
- メインDB: PostgreSQL 16（Railway）- 管理者、カード、デッキ情報
- キャッシュ: Redis 7（Railway）- セッション管理
- ファイルストレージ: Railway Volumes - アップロードファイル

## API設計方針

### RESTful API

```
# 管理者認証API
POST   /api/admin/auth/login      # 管理者ログイン
POST   /api/admin/auth/logout     # ログアウト
POST   /api/admin/auth/refresh    # トークン更新

# 管理者管理API（スーパー管理者専用）
GET    /api/admin/admins          # 管理者一覧取得
POST   /api/admin/admins          # 管理者作成
PUT    /api/admin/admins/:id      # 管理者更新
DELETE /api/admin/admins/:id      # 管理者無効化

# カードマスター管理API（将来実装）
GET    /api/admin/cards           # カード一覧取得
POST   /api/admin/cards           # カード作成
PUT    /api/admin/cards/:id       # カード更新
DELETE /api/admin/cards/:id       # カード削除
```

## セキュリティ設計

### 認証・認可
- JWT (JSON Web Token) による認証
- Role-based Access Control (RBAC)

### セキュリティ対策
- HTTPS通信の強制
- CORS設定（@hono/cors）
- Rate Limiting（自実装）
- Input Validation（Zod）
- SQL Injection防止（Drizzle ORM使用）
- XSS対策（サニタイゼーション）

## スケーラビリティ考慮

### 水平スケーリング対応
- ステートレスなAPI設計
- セッション情報のRedis管理
- ロードバランサー対応

### パフォーマンス最適化
- データベースインデックス
- クエリ最適化
- キャッシング戦略
- CDNによる静的アセット配信

## デプロイメント

### 開発環境
- **ローカル**: Docker Compose（PostgreSQL + Redis）
- **アプリ開発**: 個別起動（npm run dev）

### 本番環境（Railway + Vercel構成）
1. **フロントエンド**: Vercel
   - Next.js 15最適化デプロイ
   - エッジランタイム、ISR対応
   - GitHub連携による自動デプロイ

2. **バックエンド**: Railway
   - Honoアプリケーションホスティング
   - 自動スケーリング、ヘルスチェック
   - PostgreSQL + Redis マネージドサービス

3. **データベース**: Railway PostgreSQL 16
   - 自動バックアップ、接続プーリング
   - 垂直・水平スケーリング対応

### CI/CD
- GitHub Actions
- 自動テスト実行
- 自動デプロイ

## 監視・ログ

### アプリケーション監視
- エラートラッキング（Sentry）
- パフォーマンス監視
- アップタイム監視

### ログ管理
- 構造化ログ
- ログレベル管理
- ログ集約・分析