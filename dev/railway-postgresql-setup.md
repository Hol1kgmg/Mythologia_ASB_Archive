# Railway PostgreSQL セットアップガイド

このガイドでは、Railway PostgreSQLへの接続設定と開発環境構築について説明します。

## 前提条件

- Railwayアカウントとプロジェクトが作成済み
- PostgreSQLサービスがRailway上でプロビジョニング済み
- Node.js 18以上がインストール済み

## 1. Railway DATABASE_URL の取得

### 手順

1. [Railway Dashboard](https://railway.app/dashboard) にログイン
2. 対象プロジェクトを選択
3. PostgreSQLサービスをクリック
4. `Variables` タブを開く
5. `DATABASE_URL` の値をコピー

### DATABASE_URL の形式

```
postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway
```

## 2. ローカル環境設定

### 環境変数の設定

```bash
cd webapp/backend

# .envファイルを作成
cp .env.example .env

# .envファイルを編集
# DATABASE_URL=取得したRailway PostgreSQL URL
```

### .env ファイル例

```env
# Railway PostgreSQL
DATABASE_URL=postgresql://postgres:xxxxxxxxxxxx@xxxxx.railway.app:5432/railway

# その他の設定
JWT_SECRET=your-jwt-secret
HMAC_SECRET=your-hmac-secret

# 初期管理者設定
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=secure-password
INITIAL_ADMIN_EMAIL=admin@example.com
```

## 3. 接続確認

### 接続テストの実行

```bash
cd webapp/backend

# 依存関係のインストール（初回のみ）
npm install

# データベース接続テスト
npm run db:test
```

### 成功時の出力例

```
🔍 Testing database connection...
✅ Database connection successful!
📊 Database info: Result(1) [
  {
    current_database: 'railway',
    version: 'PostgreSQL 16.x on x86_64-pc-linux-gnu, compiled by gcc ...'
  }
]
📋 Existing tables: Result(0) []
🔒 Connection closed
```

## 4. スキーマの適用

### 開発環境（推奨）

スキーマを直接データベースにプッシュ：

```bash
npm run db:push
# または確認なしで強制適用
npx drizzle-kit push --force
```

#### 期待される結果

```
No config path provided, using default 'drizzle.config.ts'
Reading config file '/path/to/drizzle.config.ts'
Using 'postgres' driver for database querying
[✓] Pulling schema from database...

 Warning  You are about to execute current statements:

CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'viewer');
CREATE TABLE "admin_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50),
	"target_id" varchar(36),
	"details" json,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);

CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"permissions" json DEFAULT '[]'::json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_super_admin" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username"),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);

ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "admins" ADD CONSTRAINT "admins_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;

[✓] Changes applied
```

### 本番環境向け

マイグレーションファイルを生成して適用：

```bash
# マイグレーションファイルの生成
npm run db:generate

# マイグレーションの適用
npm run db:migrate
```

#### 期待される結果

**マイグレーション生成時:**
```
No config path provided, using default 'drizzle.config.ts'
Reading config file '/path/to/drizzle.config.ts'
3 tables
admin_activity_logs 9 columns 0 indexes 1 fks
admin_sessions 7 columns 0 indexes 1 fks
admins 12 columns 0 indexes 1 fks

[✓] Your SQL migration file ➜ drizzle/0000_admin_tables.sql 🚀
```

**マイグレーション実行時:**
```
Starting database migrations...
Migrations completed successfully!
```

## 5. Drizzle Studio でのデータ確認

```bash
# Drizzle Studio の起動
npm run db:studio

# ブラウザで http://localhost:4983 を開く
```

### 期待される結果

**コンソール出力:**
```
Drizzle Studio is running on http://localhost:4983
```

**ブラウザ画面:**
- 左サイドバーに以下のテーブルが表示される:
  - `admins` - 管理者アカウント
  - `admin_sessions` - セッション管理
  - `admin_activity_logs` - 活動ログ
- 各テーブルのスキーマとデータが確認可能
- クエリエディタでSQLを直接実行可能

## 6. トラブルシューティング

### 接続エラーが発生する場合

#### エラーパターンと解決方法

**1. DATABASE_URL設定エラー**
```
❌ DATABASE_URL environment variable is not set
💡 Please create .env file with your database connection string
```
→ `.env`ファイルを作成してDATABASE_URLを設定

**2. サンプル値検出エラー**
```
❌ DATABASE_URL appears to be using sample values
💡 Please update .env with your actual database credentials
```
→ RailwayダッシュボードからDATABASE_URLを取得して設定

**3. 認証エラー**
```
❌ Database reset failed: PostgresError: password authentication failed
```
→ DATABASE_URLの認証情報を確認

**4. 接続タイムアウト**
```
❌ Cannot connect to database
💡 Please check your DATABASE_URL and database server
```
→ ネットワーク接続とRailwayサービスの状態を確認

#### 確認手順

1. **DATABASE_URL の確認**
   ```bash
   # 環境変数が正しく設定されているか確認
   echo $DATABASE_URL
   ```

2. **接続テスト**
   ```bash
   npm run db:test
   ```

3. **Railway サービス状態確認**
   - Railwayダッシュボードでサービスが稼働中か確認
   - PostgreSQLサービスのログを確認

4. **ネットワーク接続**
   - VPNやファイアウォールの設定を確認
   - Railway PostgreSQLは外部からの接続を許可しています

5. **SSL接続**
   - RailwayのPostgreSQLはSSL接続がデフォルトで有効
   - 接続文字列に `?sslmode=require` を追加する場合もあります

### スキーマ適用エラー

#### エラーパターンと解決方法

**1. テーブル作成エラー**
```
ERROR: relation "admins" already exists
```
→ テーブルが既に存在している場合
```bash
npm run db:reset  # 既存テーブルを削除
npm run db:push   # 新しいスキーマを適用
```

**2. 外部キー制約エラー**
```
ERROR: cannot add foreign key constraint
```
→ 参照テーブルが存在しない場合
```bash
npm run db:fresh  # 全テーブル削除後に再作成
```

#### 確認手順

1. **権限の確認**
   - Railway PostgreSQLのユーザーには全権限があります

2. **既存テーブルとの競合**
   - `npm run db:push` は既存のスキーマを上書きします
   - 本番環境では必ずマイグレーションを使用してください

3. **テーブル作成確認**
   ```bash
   npm run db:test
   # 📋 Existing tables: に作成されたテーブルが表示される
   ```

## 7. セキュリティベストプラクティス

### 環境変数の管理

- `.env` ファイルは絶対にコミットしない
- `.gitignore` に含まれていることを確認
- チームメンバーには安全な方法で共有

### Railway環境での設定

```bash
# Railway CLIを使用した環境変数の設定
railway variables set JWT_SECRET=your-production-secret
railway variables set HMAC_SECRET=your-production-hmac
```

### 接続プーリング

`src/db/client.ts` では以下の設定でプーリングを管理：

```typescript
sql = postgres(connectionString, {
  max: 10,           // 最大接続数
  idle_timeout: 20,  // アイドルタイムアウト（秒）
  connect_timeout: 10 // 接続タイムアウト（秒）
});
```

## 8. 完全動作確認手順

### Railway環境での完全テスト

```bash
# 1. 環境設定
cd webapp/backend
cp .env.example .env
# DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:5432/railway

# 2. 接続確認
npm run db:test
```

**期待される結果:**
```
🔍 Testing database connection...
✅ Database connection successful!
📊 Database info: Result(1) [
  {
    current_database: 'railway',
    version: 'PostgreSQL 16.x on x86_64-pc-linux-gnu'
  }
]
📋 Existing tables: Result(0) []
🔒 Connection closed
```

```bash
# 3. スキーマ適用
npx drizzle-kit push --force
```

**期待される結果:**
```
[✓] Changes applied
```

```bash
# 4. テーブル作成確認
npm run db:test
```

**期待される結果:**
```
📋 Existing tables: Result(3) [
  { table_name: 'admins' },
  { table_name: 'admin_activity_logs' },
  { table_name: 'admin_sessions' }
]
```

```bash
# 5. リセット機能テスト
npm run db:reset
```

**期待される結果:**
```
⚠️  WARNING: This will delete ALL admin data!
🔍 Database: xxx.railway.app:5432/railway
⏰ Starting reset in 3 seconds... (Ctrl+C to cancel)
🗑️  Starting database reset...
🔍 Testing database connection...
📋 Dropping admin tables...
🔄 Dropping migration tracking...
✅ Database reset completed!
```

```bash
# 6. リセット確認
npm run db:test
```

**期待される結果:**
```
📋 Existing tables: Result(0) []
```

### ローカル環境での完全テスト

```bash
# 1. Docker PostgreSQL起動
docker-compose up -d postgres

# 2. 環境設定
DATABASE_URL=postgresql://mythologia_user:mythologia_pass@localhost:5432/mythologia_dev

# 3. 完全動作確認
npm run db:test          # 接続確認
npm run db:fresh         # スキーマ適用
npm run db:test          # テーブル確認
npm run db:studio        # UI確認
```

## 9. 開発ワークフロー

### 日常的な開発

1. **ローカルでスキーマ変更**
   ```typescript
   // src/db/schema/admin.ts でスキーマを編集
   ```

2. **変更を確認**
   ```bash
   npm run db:push  # 開発DBに直接適用
   ```

3. **データ確認**
   ```bash
   npm run db:studio
   ```

### デプロイ前

1. **マイグレーション生成**
   ```bash
   npm run db:generate
   ```

2. **マイグレーション確認**
   ```bash
   # drizzle/ ディレクトリのSQLファイルを確認
   ```

3. **ステージング環境でテスト**
   ```bash
   # ステージング環境のDATABASE_URLを設定して
   npm run db:migrate
   ```

## 関連ドキュメント

- [Drizzle ORM使用ガイド](../webapp/backend/README_DRIZZLE.md)
- [Railway公式ドキュメント](https://docs.railway.app/databases/postgresql)
- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)

## サポート

問題が発生した場合は、以下を確認してください：

1. Railway のサービスステータス
2. PostgreSQL のログ（Railwayダッシュボード）
3. ローカルのエラーログ
4. GitHub Issues でのサポート