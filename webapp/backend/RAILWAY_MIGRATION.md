# Railway マイグレーション実行ガイド

## 🚀 シンプルな手順

### 方法1: Railway CLI でシェル接続

```bash
# 1. Railway にログイン
railway login

# 2. プロジェクトに接続  
railway link

# 3. Railway コンテナに接続
railway shell

# 4. マイグレーション実行
./scripts/run-migration.sh
```

### 方法2: 直接 psql 実行

```bash
# Railway shell 内で
psql $DATABASE_URL -f sql/001_create_admin_tables.sql
```

### 方法3: ローカルから Railway DB への直接接続

```bash
# Railway 環境変数を取得
railway variables

# DATABASE_URL を使って直接接続
psql "postgresql://user:pass@host:port/db" -f sql/001_create_admin_tables.sql
```

## 📋 マイグレーション確認

### テーブル作成確認
```sql
-- Railway shell または psql で実行
\dt
-- admins, admin_sessions, admin_activity_logs が表示されること
```

### スキーマ確認
```sql
\d admins
\d admin_sessions  
\d admin_activity_logs
```

## 🔧 トラブルシューティング

### psql コマンドがない場合
```bash
# Railway コンテナ内で
apt-get update && apt-get install -y postgresql-client
```

### 権限エラーの場合
```bash
# スクリプトに実行権限を付与
chmod +x scripts/run-migration.sh
```

## ✅ 成功確認

マイグレーション成功時の出力例：
```
🗃️  Starting database migration...
🔍 Connected to: postgresql://***@xxx.railway.app:5432/railway
📋 Executing migration: 001_create_admin_tables.sql
CREATE TYPE
CREATE TABLE
CREATE TABLE  
CREATE TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
✅ Migration completed successfully!
🔒 Migration finished
```