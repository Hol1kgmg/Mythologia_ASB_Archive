# ローカルデータベース操作ガイド

このドキュメントでは、localhost環境でのデータベース操作方法を説明します。

## 概要

現在のMythologia Admiral Ship Bridgeアプリケーションは、以下のデータベース環境をサポートしています：

- **PostgreSQL** (Vercel本番環境・ローカル開発推奨)
- **D1** (Cloudflare Workers環境・ローカルテスト)
- **モックデータ** (デフォルト・DB設定なし)

## 現在の状況

デフォルトでは **モックアダプター** を使用しており、実際のデータベース操作は行われません。

```bash
# 現在の状況確認
curl http://localhost:8787/debug/db-status
# Response: {"database":"mock","status":"No database configured, using mock adapter"}
```

## 方法1: PostgreSQL接続（推奨）

### 1.1 PostgreSQLのインストールと起動

```bash
# Homebrewでインストール
brew install postgresql

# サービス開始
brew services start postgresql

# 確認
brew services list | grep postgresql
```

### 1.2 ローカルデータベース作成

```bash
# データベース作成
createdb mythologia_local

# 接続テスト
psql mythologia_local -c "SELECT version();"
```

### 1.3 環境変数設定

```bash
# .env.localファイル作成・編集
cd webapp/backend
cat > .env.local << EOF
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://$USER@localhost:5432/mythologia_local
ENVIRONMENT=development
EOF
```

### 1.4 マイグレーション実行

```bash
# 依存関係インストール（未実施の場合）
npm install

# PostgreSQLマイグレーション実行
npm run migrate:postgresql

# 成功例:
# 🚀 Running PostgreSQL migrations...
# 📄 Executing: 001_initial_schema.sql
# ✅ 001_initial_schema.sql completed
# 📄 Executing: 002_initial_data.sql
# ✅ 002_initial_data.sql completed
# ✨ All PostgreSQL migrations completed!
```

### 1.5 開発サーバー起動と確認

```bash
# 開発サーバー起動
npm run dev

# 別ターミナルで確認
curl http://localhost:8787/debug/db-status
# Expected: {"database":"postgresql","status":"connected",...}

curl http://localhost:8787/api/leaders | jq
# Expected: 5件のリーダーデータ

curl http://localhost:8787/api/tribes | jq  
# Expected: 6件の種族データ
```

## 方法2: D1ローカル（Cloudflare環境テスト）

### 2.1 D1ローカルデータベース作成

```bash
cd webapp/backend

# D1ローカルデータベース作成
npx wrangler d1 create mythologia-local

# 出力例:
# ✅ Successfully created DB 'mythologia-local' in region APAC
# Created your database using D1's new storage backend.
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "mythologia-local" 
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.2 wrangler.jsonc設定更新

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "mythologia-backend",
  "main": "dist/index.js", 
  "compatibility_date": "2024-01-01",
  "vars": {
    "DATABASE_TYPE": "d1",
    "ENVIRONMENT": "development"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mythologia-local",
      "database_id": "ここに取得したIDを設定"
    }
  ]
}
```

### 2.3 D1マイグレーション実行

```bash
# スキーマ作成
npx wrangler d1 execute mythologia-local --local --file=sql/d1/001_initial_schema.sql

# 初期データ投入
npx wrangler d1 execute mythologia-local --local --file=sql/d1/002_initial_data.sql

# 確認
npx wrangler d1 execute mythologia-local --local --command="SELECT * FROM leaders;"
```

### 2.4 開発サーバー起動と確認

```bash
# 開発サーバー起動
npm run dev

# 確認
curl http://localhost:8787/debug/db-status
# Expected: {"database":"d1","status":"connected",...}
```

## 方法3: SQLite ファイル（検討中）

現在SQLiteアダプターは未実装ですが、将来的に追加予定です。

```bash
# 将来の実装予定
echo "DATABASE_TYPE=sqlite" >> .env.local  
echo "DATABASE_URL=sqlite:./local.db" >> .env.local
```

## データベース操作の確認方法

### 基本確認コマンド

```bash
# データベース接続状態
curl http://localhost:8787/debug/db-status | jq

# スキーマ情報
curl http://localhost:8787/debug/schema | jq

# モックデータ情報
curl http://localhost:8787/debug/mock-data | jq
```

### API動作確認

```bash
# 包括的テスト実行
cd webapp
./test-api.sh http://localhost:8787

# 個別エンドポイント確認
curl http://localhost:8787/api/leaders | jq
curl http://localhost:8787/api/tribes | jq
curl http://localhost:8787/api/cards | jq
```

### 期待されるレスポンス例

#### PostgreSQL/D1接続時

```json
// GET /api/leaders
{
  "data": [
    {"id": 1, "name": "DRAGON", "description": "ドラゴン系統のリーダー"},
    {"id": 2, "name": "ANDROID", "description": "アンドロイド系統のリーダー"},
    {"id": 3, "name": "ELEMENTAL", "description": "エレメンタル系統のリーダー"},
    {"id": 4, "name": "LUMINUS", "description": "ルミナス系統のリーダー"},
    {"id": 5, "name": "SHADE", "description": "シェイド系統のリーダー"}
  ],
  "count": 5
}

// GET /debug/db-status (PostgreSQL)
{
  "database": "postgresql",
  "status": "connected",
  "connectionType": "pool",
  "timestamp": "2025-06-05T16:45:00.000Z"
}
```

#### モックデータ時

```json
// GET /api/leaders
{
  "data": [],
  "message": "Mock data - database not configured"
}

// GET /debug/db-status
{
  "database": "mock", 
  "status": "No database configured, using mock adapter",
  "timestamp": "2025-06-05T16:45:00.000Z"
}
```

## トラブルシューティング

### PostgreSQL関連

#### 問題: 接続エラー
```
Database query failed: connection timeout
```

**解決策:**
```bash
# PostgreSQLサービス確認
brew services list | grep postgresql

# サービス再起動
brew services restart postgresql

# 接続テスト
psql mythologia_local -c "SELECT 1;"
```

#### 問題: データベースが存在しない
```
Database "mythologia_local" does not exist
```

**解決策:**
```bash
# データベース再作成
createdb mythologia_local
npm run migrate:postgresql
```

### D1関連

#### 問題: D1データベースが見つからない
```
Error: D1Database binding 'DB' not found
```

**解決策:**
```bash
# D1データベース一覧確認
npx wrangler d1 list

# wrangler.jsonc のdatabase_id確認
# 正しいIDが設定されているか確認
```

#### 問題: wrangler設定エラー
```
"d1_databases[0]" bindings should have a string "id" field
```

**解決策:**
```bash
# wrangler.jsonc のdatabase_idが空でないか確認
# 必要に応じてD1データベースを再作成
```

### 共通問題

#### 問題: 環境変数が読み込まれない
```
Invalid environment variables
```

**解決策:**
```bash
# .env.localファイル確認
cat webapp/backend/.env.local

# ファイルパス確認（backend ディレクトリ内にあること）
pwd
# /path/to/Mythologia_AdmiralsShipBridge/webapp/backend
```

## 開発ワークフロー

### 推奨手順

1. **PostgreSQL設定** - 本番環境に近い動作確認
2. **マイグレーション実行** - 初期データ準備
3. **開発サーバー起動** - API開発・テスト
4. **test-api.sh実行** - 包括的動作確認

### データ変更時

```bash
# スキーマ変更時
# 1. SQLファイル更新 (sql/postgresql/*.sql)
# 2. マイグレーション再実行
npm run migrate:postgresql

# 開発データリセット時
# 1. データベース削除・再作成
dropdb mythologia_local && createdb mythologia_local
npm run migrate:postgresql
```

## 関連ドキュメント

- [DEPLOYMENT.md](../webapp/DEPLOYMENT.md) - 本番環境デプロイ
- [TESTING.md](../webapp/TESTING.md) - APIテスト方法
- [backend-setup.md](./backend-setup.md) - バックエンド開発環境
- [setup-guide.md](./setup-guide.md) - 全体セットアップ

## 注意事項

- ローカル開発では本番データを使用しないこと
- 環境変数ファイル（.env.local）はgitに含めないこと
- PostgreSQL接続の場合、適切にコネクションプールを使用すること
- D1ローカル環境は開発専用であり、本番D1とは分離されていること