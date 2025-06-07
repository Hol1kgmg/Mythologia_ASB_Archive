# 🚢 Mythologia Admiral Ship Bridge - Backend

## 環境構築ガイド

Honoフレームワークを使用したTypeScriptバックエンドAPIサーバーの環境構築手順です。

## 前提条件

- **Node.js**: v18.0以上
- **npm**: v8.0以上
- **PostgreSQL**: v13以上（本番環境）
- **Cloudflare CLI**: wrangler（Cloudflare環境用）

## インストール

```bash
# プロジェクトルートから
cd webapp/backend

# 依存関係インストール
npm install
```

## 環境変数設定

### 1. 環境変数ファイル作成

```bash
# .env.localファイル作成
cp .env.example .env.local
```

### 2. 環境変数設定例

```env
# .env.local

# PostgreSQL接続（本番・ローカル開発）
DATABASE_URL=postgresql://user:password@localhost:5432/mythologia

# JWT秘密鍵（32文字以上の文字列）
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-chars

# アプリケーション設定
NODE_ENV=development
PORT=8787

# Cloudflare設定（Cloudflare環境のみ）
# CLOUDFLARE_ACCOUNT_ID=your-account-id
# CLOUDFLARE_API_TOKEN=your-api-token
```

## データベース設定

### Option 1: PostgreSQL（推奨・本番環境）

#### 1. PostgreSQLインストール

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# PostgreSQL公式サイトからインストーラーダウンロード
```

#### 2. データベース作成

```bash
# PostgreSQLユーザー作成
sudo -u postgres createuser --interactive mythologia_user

# データベース作成
sudo -u postgres createdb mythologia

# 権限設定
sudo -u postgres psql -c "ALTER USER mythologia_user PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mythologia TO mythologia_user;"
```

#### 3. Drizzle ORMセットアップ

```bash
# Drizzle設定ファイル作成
cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema/*.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
EOF
```

#### 4. マイグレーション実行

```bash
# マイグレーションファイル生成
npm run db:generate

# マイグレーション実行
npm run db:migrate

# または、スキーマ直接反映（開発環境）
npm run db:push
```

### Option 2: D1/SQLite（Cloudflare環境）

#### 1. Cloudflare CLI設定

```bash
# wranglerインストール
npm install -g wrangler

# Cloudflareログイン
wrangler login
```

#### 2. D1データベース作成

```bash
# D1データベース作成
wrangler d1 create mythologia-db

# wrangler.tomlに出力されたdatabase_idを記録
```

#### 3. wrangler.toml設定

```toml
name = "mythologia-backend"
main = "dist/index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "mythologia-db"
database_id = "your-database-id-here"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

#### 4. D1マイグレーション

```bash
# Drizzle設定（D1用）
cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema/*.ts',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './local.db', // ローカル開発用
  },
} satisfies Config;
EOF

# マイグレーション生成
npm run db:generate

# D1にマイグレーション適用
wrangler d1 migrations apply mythologia-db --remote
```

## 開発サーバー起動

### ローカル開発（PostgreSQL）

```bash
# 開発サーバー起動
npm run dev

# サーバー起動確認
curl http://localhost:8787/health
```

### Cloudflare Workers開発

```bash
# Cloudflare Workers Dev起動
npm run dev

# または
wrangler dev src/index.ts --compatibility-date 2024-01-01
```

## データベース管理コマンド

### Drizzle Studio（推奨）

```bash
# Drizzle Studio起動（GUI管理ツール）
npm run db:studio

# ブラウザで http://localhost:4983 を開く
```

### マイグレーション管理

```bash
# 新しいマイグレーション生成
npm run db:generate

# マイグレーション実行
npm run db:migrate

# スキーマ直接反映（開発環境のみ）
npm run db:push
```

### データベース初期化

```bash
# PostgreSQL（完全リセット）
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# マイグレーション再実行
npm run db:push
```

## テスト実行

### 単体テスト

```bash
# 全テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジ付き
npm run test:coverage

# GUI テストランナー
npm run test:ui
```

### API動作確認

```bash
# API動作テストスクリプト実行
cd ../  # webapp ディレクトリに移動
./test-api.sh http://localhost:8787

# 認証テスト
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "SuperAdmin123!"}'
```

## ビルド・デプロイ

### TypeScriptビルド

```bash
# TypeScript コンパイル
npm run build

# 型チェック
npm run type-check

# ESLint実行
npm run lint
```

### Vercelデプロイ

```bash
# Vercelデプロイ
npm run deploy:vercel

# 環境変数設定（Vercel CLI）
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

### Cloudflareデプロイ

```bash
# Cloudflare Workers デプロイ
npm run deploy:cloudflare

# シークレット設定
wrangler secret put JWT_SECRET
```

## 開発環境確認

### ヘルスチェック

```bash
# サーバー状態確認
curl http://localhost:8787/health

# データベース接続確認
curl http://localhost:8787/debug/db-status

# 認証テスト
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "SuperAdmin123!"}'
```

### ログ確認

```bash
# 開発サーバーログ
npm run dev

# Cloudflare Workers ログ
wrangler tail

# 本番ログ（Vercel）
vercel logs
```

## トラブルシューティング

### PostgreSQL接続エラー

```bash
# PostgreSQL サービス確認
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# 接続テスト
psql $DATABASE_URL -c "SELECT version();"
```

### TypeScriptエラー

```bash
# 型定義再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScript設定確認
npx tsc --noEmit
```

### マイグレーションエラー

```bash
# Drizzle 設定確認
cat drizzle.config.ts

# マイグレーション履歴確認
npm run db:studio

# 強制的にスキーマ反映
npm run db:push --force
```

## パッケージ構成

### 主要依存関係

- **hono**: 軽量Webフレームワーク
- **drizzle-orm**: TypeScript ORM
- **zod**: スキーマバリデーション
- **jose**: JWT処理
- **@vercel/postgres**: Vercel PostgreSQL クライアント

### 開発依存関係

- **typescript**: TypeScript コンパイラ
- **vitest**: テストフレームワーク
- **wrangler**: Cloudflare CLI
- **tsx**: TypeScript実行環境

## 設定ファイル

- `drizzle.config.ts` - Drizzle ORM設定
- `wrangler.toml` - Cloudflare Workers設定
- `tsconfig.json` - TypeScript設定
- `vitest.config.ts` - テスト設定
- `.env.local` - 環境変数（gitignore対象）

## API仕様

### 認証API

- `POST /api/auth/login` - ログイン
- `POST /api/auth/refresh` - トークン更新
- `GET /api/auth/profile` - プロフィール取得

### 管理者API

- `GET /api/admin/admins` - 管理者一覧
- `POST /api/admin/admins` - 管理者作成
- `PUT /api/admin/admins/:id` - 管理者更新
- `DELETE /api/admin/admins/:id` - 管理者削除

詳細なAPI仕様は [API Documentation](./docs/api.md) を参照してください。

## セキュリティ設定

### JWT設定

- アクセストークン有効期限: 15分
- リフレッシュトークン有効期限: 7日
- 秘密鍵: 32文字以上の強力な文字列

### データベースセキュリティ

- SQL インジェクション対策: Drizzle ORM使用
- 接続プール: 最大10接続
- SSL接続: 本番環境では必須

## ライセンス

このプロジェクトはMITライセンスです。詳細は [LICENSE](../../LICENSE) を参照してください。