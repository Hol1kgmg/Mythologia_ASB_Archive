# デプロイメントガイド

## 概要

Mythologia Admiral Ship BridgeはVercelとCloudflareの両環境にデプロイ可能です。

## 🚀 Vercel環境へのデプロイ

### 1. 事前準備

```bash
# Vercel CLIインストール
npm install -g vercel

# Vercelにログイン
vercel login
```

### 2. データベースセットアップ

```bash
# Vercel Postgresデータベース作成
vercel postgres create mythologia-db

# データベースURLを取得（プロジェクト設定で確認）
# DATABASE_URL=postgresql://...
```

### 3. 環境変数設定

```bash
# Vercel環境変数設定
vercel env add DATABASE_TYPE
# Value: postgresql

vercel env add DATABASE_URL
# Value: <Vercel Postgresの接続URL>

vercel env add ENVIRONMENT
# Value: production
```

### 4. マイグレーション実行

```bash
# ローカルでマイグレーション実行（Vercel DB接続）
cd webapp/backend
npm run migrate:postgresql
```

### 5. デプロイ実行

```bash
# プロジェクトルートから
vercel deploy --prod
```

### 6. 動作確認

- `https://your-project.vercel.app/health`
- `https://your-project.vercel.app/api/cards`
- `https://your-project.vercel.app/debug/db-status`

## ☁️ Cloudflare環境へのデプロイ

### 1. 事前準備

```bash
# Wrangler CLIインストール（既にインストール済み）
cd webapp/backend

# Cloudflareにログイン
npx wrangler login
```

### 2. データベース・KVセットアップ

```bash
# D1データベース作成
npx wrangler d1 create mythologia-db

# KVネームスペース作成
npx wrangler kv:namespace create mythologia-cache

# 出力されたIDをwrangler.joncのdatabase_idとidに設定
```

### 3. wrangler.jsonc更新

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mythologia-db",
      "database_id": "YOUR_DATABASE_ID" // 上記で取得したID
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "YOUR_KV_NAMESPACE_ID" // 上記で取得したID
    }
  ]
}
```

### 4. マイグレーション実行

```bash
# D1マイグレーション実行
npx wrangler d1 execute mythologia-db --file=sql/d1/001_initial_schema.sql
npx wrangler d1 execute mythologia-db --file=sql/d1/002_initial_data.sql
```

### 5. デプロイ実行

```bash
cd webapp/backend
npm run deploy:cloudflare
```

### 6. 動作確認

- `https://your-worker.your-subdomain.workers.dev/health`
- `https://your-worker.your-subdomain.workers.dev/api/cards`
- `https://your-worker.your-subdomain.workers.dev/debug/db-status`

## 🔧 ローカル開発環境

### 1. 環境変数設定

```bash
# .env.local作成
cp .env.example .env.local

# 以下を設定
DATABASE_TYPE=postgresql # または d1
DATABASE_URL=postgresql://... # PostgreSQLの場合
```

### 2. 開発サーバー起動

```bash
# バックエンド
cd webapp/backend
npm run dev

# フロントエンド（別ターミナル）
cd webapp/frontend  
npm run dev
```

### 3. 動作確認

```bash
# APIテスト実行
cd webapp
./test-api.sh
```

## 📋 デプロイ後の確認事項

### 基本動作確認

- [ ] ヘルスチェック：`GET /health`
- [ ] APIエンドポイント：`GET /api/cards`, `/api/leaders`, `/api/tribes`
- [ ] デバッグ情報：`GET /debug/db-status`
- [ ] フロントエンド：ホームページ表示
- [ ] CORS：フロントエンドからAPI呼び出し

### データベース確認

- [ ] リーダーデータ：5件のリーダーが正常に挿入されている
- [ ] 種族データ：6件の種族が正常に挿入されている
- [ ] 外部キー制約：tribes.leader_idがleaders.idを参照

### パフォーマンス確認

- [ ] レスポンス時間：API呼び出しが1秒以内
- [ ] 並行リクエスト：複数同時アクセスでエラーが発生しない
- [ ] メモリ使用量：適切な範囲内

## 🐛 トラブルシューティング

### Vercel環境

**問題**: データベース接続エラー
```
Database query failed: connection timeout
```

**解決策**:
1. `DATABASE_URL`環境変数が正しく設定されているか確認
2. Vercel Postgresのコネクション制限を確認
3. ファイアウォール設定を確認

### Cloudflare環境

**問題**: D1データベースが見つからない
```
Error: D1Database binding 'DB' not found
```

**解決策**:
1. `wrangler.jsonc`の`database_id`が正しく設定されているか確認
2. D1データベースが正常に作成されているか確認：`npx wrangler d1 list`
3. デプロイ前にビルドが完了しているか確認

### 共通

**問題**: CORS エラー
```
Access-Control-Allow-Origin error
```

**解決策**:
1. フロントエンドのURLがCORS設定に含まれているか確認
2. プロダクション環境のURL設定を確認

## 📈 モニタリング

### Vercel環境

- Vercelダッシュボードでリクエスト数・エラー率・レスポンス時間を監視
- Postgres Insightsでデータベースパフォーマンスを監視

### Cloudflare環境

- Cloudflare Analyticsでトラフィック・パフォーマンスを監視
- D1 Analyticsでデータベース使用量を監視

## 🔄 CI/CD設定

### GitHub Actions（推奨）

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-vercel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd webapp && npm install
      - run: cd webapp && npm run build
      - run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
  
  deploy-cloudflare:
    runs-on: ubuntu-latest  
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd webapp/backend && npm install
      - run: cd webapp/backend && npm run deploy:cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📞 サポート

デプロイに関する問題が発生した場合：

1. [TESTING.md](./TESTING.md) で基本動作を確認
2. [GitHub Issues](https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/issues) で既知の問題を確認
3. 新しいIssueを作成して詳細を報告