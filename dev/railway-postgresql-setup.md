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
📊 Database info: { current_database: 'railway', version: 'PostgreSQL 16.x ...' }
📋 Existing tables: []
🔒 Connection closed
```

## 4. スキーマの適用

### 開発環境（推奨）

スキーマを直接データベースにプッシュ：

```bash
npm run db:push
```

### 本番環境向け

マイグレーションファイルを生成して適用：

```bash
# マイグレーションファイルの生成
npm run db:generate

# マイグレーションの適用
npm run db:migrate
```

## 5. Drizzle Studio でのデータ確認

```bash
# Drizzle Studio の起動
npm run db:studio

# ブラウザで http://localhost:4983 を開く
```

## 6. トラブルシューティング

### 接続エラーが発生する場合

1. **DATABASE_URL の確認**
   ```bash
   # 環境変数が正しく設定されているか確認
   echo $DATABASE_URL
   ```

2. **ネットワーク接続**
   - VPNやファイアウォールの設定を確認
   - Railway PostgreSQLは外部からの接続を許可しています

3. **SSL接続**
   - RailwayのPostgreSQLはSSL接続がデフォルトで有効
   - 接続文字列に `?sslmode=require` を追加する場合もあります

### スキーマ適用エラー

1. **権限の確認**
   - Railway PostgreSQLのユーザーには全権限があります

2. **既存テーブルとの競合**
   - `npm run db:push` は既存のスキーマを上書きします
   - 本番環境では必ずマイグレーションを使用してください

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

## 8. 開発ワークフロー

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