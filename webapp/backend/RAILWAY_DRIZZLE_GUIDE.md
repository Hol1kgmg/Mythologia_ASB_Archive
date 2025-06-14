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

### 方法1: Railway CLI でコンテナ接続（推奨）

```bash
# 1. Railway にログイン
railway login

# 2. プロジェクトにリンク
railway link

# 3. Railway コンテナに接続
railway shell

# 4. マイグレーション実行
npm run db:migrate

# 5. テーブル確認
npm run db:test
```

**メリット**:
- Railway内部DNS（`postgres.railway.internal`）が使用可能
- 本番環境と同じ条件で実行
- セキュアな内部接続

### 方法2: ローカルから Railway DB に接続

```bash
# 1. Railway の公開URLを取得
railway variables

# 2. .env ファイルに公開URLを設定
# 注意: 内部URL (postgres.railway.internal) ではなく公開URL (xxx.proxy.rlwy.net) を使用
DATABASE_URL=postgresql://postgres:password@nozomi.proxy.rlwy.net:33024/railway

# 3. ローカルからマイグレーション実行
npm run db:migrate

# 4. テーブル確認
npm run db:test
```

**注意点**:
- ⚠️ 内部URL（`postgres.railway.internal`）はローカルから接続不可
- ⚠️ 公開URLはIPアドレス制限やファイアウォール設定に注意
- ⚠️ 本番環境では内部URLを使用すべき

### 環境変数の確認方法

```bash
# Railway CLI で環境変数一覧を表示
railway variables

# 特定の環境変数を確認
railway variables | grep DATABASE_URL
```

### Railway CLI のプロジェクトリンク管理

```bash
# 現在のリンク状態を確認
railway status

# プロジェクトのリンクを解除
railway unlink

# 別のプロジェクトにリンクする場合
railway link
# プロジェクト一覧から選択

# 特定のサービスを指定してリンク
railway link --service mythologia-backend
```

**リンク解除が必要な場合**:
- 複数のRailwayプロジェクトを切り替える時
- 誤って別のプロジェクトにリンクした時
- ローカル開発環境をクリーンにしたい時

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

# dotenv が読み込まれているか確認
# src/migrate.ts と src/test-connection.ts に以下が必要:
import * as dotenv from 'dotenv';
dotenv.config();
```

### エラー: getaddrinfo ENOTFOUND postgres.railway.internal
```bash
# ローカルから実行している場合、内部URLは使用不可
# 公開URLに変更する必要がある:

# ❌ 内部URL（ローカルから接続不可）
DATABASE_URL=postgresql://postgres:pass@postgres.railway.internal:5432/railway

# ✅ 公開URL（ローカルから接続可能）
DATABASE_URL=postgresql://postgres:pass@nozomi.proxy.rlwy.net:33024/railway
```

### エラー: Migration failed
```bash
# 詳細なエラー情報を確認
npm run db:migrate

# 必要に応じてテーブルを削除して再実行
# psql $DATABASE_URL -c "DROP TABLE IF EXISTS admins CASCADE;"
```

### Railway shell で環境変数が読み込まれない場合
```bash
# Railway shell 内では環境変数は自動的に設定されているはず
# 確認方法:
echo $DATABASE_URL

# もし設定されていない場合は、Railway の設定を確認
railway variables
```

## 📈 次のステップ

admins テーブルの動作確認後：

1. **テストデータの挿入**
2. **基本的なCRUD操作確認**  
3. **必要に応じて他のテーブル検討**

まずは admins テーブル単体での完全な動作確認を行う。