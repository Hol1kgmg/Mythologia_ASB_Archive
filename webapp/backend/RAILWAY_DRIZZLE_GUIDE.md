# Railway Drizzle ORM マイグレーション実行ガイド

## 🎯 admins テーブルのみの最小構成

### ファイル構成
```
webapp/backend/
├── src/
│   ├── schema.ts          # admins テーブルのみ
│   └── migrate.ts         # マイグレーション実行スクリプト
├── drizzle/               # 生成されたマイグレーションファイル
└── drizzle.config.ts      # Drizzle設定
```

### admins テーブル構造（生成済み）
```sql
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username"),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
```

**マイグレーションファイル**: `drizzle/0000_large_kabuki.sql`

## 🔧 事前準備: PostgreSQL追加

### Railway PostgreSQLサービスの追加手順
1. Railwayダッシュボードでプロジェクトを開く
2. 「New Service」→「Database」→「Add PostgreSQL」を選択
3. PostgreSQLサービスが追加される
4. バックエンドサービスの「Variables」タブで`DATABASE_URL`が自動追加されることを確認

### 環境変数の確認
```bash
railway variables
# DATABASE_URL が表示されることを確認
```

## 📋 Railway でのマイグレーション実行手順

### 方法1: Railway CLI でコンテナ接続

```bash
# 1. Railway にログイン
railway login

# 2. プロジェクトにリンク
railway link

# 3. Railway コンテナに接続
railway shell

# 4. マイグレーション実行
npm run db:migrate
```

### 方法2: Railway での環境変数確認

```bash
# Railway 環境変数を確認
railway variables

# DATABASE_URL が設定されていることを確認
```

### 方法3: ローカルから Railway DB に接続

```bash
# .env ファイルに Railway の DATABASE_URL を設定
echo "DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:5432/railway" > .env

# ローカルからマイグレーション実行
npm run db:migrate
```

## 🔍 動作確認

### マイグレーション成功時の出力
```
🚀 Starting migration...
✅ Migration completed successfully!
```

### テーブル作成確認
Railway shell または psql で確認：
```sql
\dt
-- admins テーブルが表示されること

\d admins
-- テーブル構造が表示されること
```

## 🛠️ トラブルシューティング

### エラー: DATABASE_URL is required
```bash
# Railway 環境変数を確認
railway variables

# または環境変数をローカルで設定
export DATABASE_URL="postgresql://..."
```

### エラー: Migration failed
```bash
# 詳細なエラー情報を確認
npm run db:migrate

# 必要に応じてテーブルを削除して再実行
# psql $DATABASE_URL -c "DROP TABLE IF EXISTS admins CASCADE;"
```

## 📈 次のステップ

admins テーブルの動作確認後：

1. **テストデータの挿入**
2. **基本的なCRUD操作確認**  
3. **必要に応じて他のテーブル検討**

まずは admins テーブル単体での完全な動作確認を行う。