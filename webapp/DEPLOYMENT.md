# デプロイメントガイド

## 概要

Mythologia Admiral Ship Bridgeは分離アーキテクチャでデプロイします：
- **バックエンド**: Railway (API + Database)
- **フロントエンド**: Vercel (Next.js)

## 環境構成

- **本番環境**: `release`ブランチ → Railway + Vercel Production
- **ステージング環境**: `develop`ブランチ → Railway + Vercel Staging

## 🚂 Railway バックエンドデプロイ

### 1. Railway プロジェクト作成

1. [Railway](https://railway.app) にログイン
2. 「New Project」→ 「Deploy from GitHub repo」
3. このリポジトリを選択
4. サービス設定:
   - **Root Directory**: `webapp/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2. データベース・キャッシュ設定

#### PostgreSQL サービス追加
1. プロジェクト → 「New Service」→ PostgreSQL
2. 自動的に `DATABASE_URL` 環境変数が生成

#### Redis サービス追加  
1. プロジェクト → 「New Service」→ Redis
2. 自動的に `REDIS_URL` 環境変数が生成

### 3. Railway 環境変数設定

```
NODE_ENV=production
DATABASE_TYPE=postgresql  
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
PORT=${{PORT}}
CORS_ORIGIN=https://your-frontend.vercel.app
```

## 🚀 Vercel フロントエンドデプロイ

### 1. Vercel プロジェクト設定

#### 本番環境プロジェクト
1. [Vercel](https://vercel.com) にログイン
2. 「New Project」→ GitHubリポジトリ選択
3. プロジェクト設定:
   - **Root Directory**: `webapp/frontend`
   - **Framework Preset**: Next.js
   - **Production Branch**: `release`

#### ステージング環境プロジェクト
1. 新しいプロジェクトを作成
2. 同設定で **Production Branch**: `develop`

### 2. Vercel 環境変数設定

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
ENVIRONMENT=production
```

### 3. 自動デプロイの動作

- `release`ブランチ → Railway + Vercel 本番環境
- `develop`ブランチ → Railway + Vercel ステージング環境
- プルリクエスト → Vercel プレビューデプロイ

## 🔧 ローカル開発環境

### 1. 環境変数設定

```bash
# .env.local作成
cp .env.example .env.local

# 以下を設定
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://...
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


## 📋 デプロイ確認事項

### 環境別URL

#### 本番環境
- サイト: `https://mythologia.vercel.app`
- API: `https://mythologia.vercel.app/api/*`
- ヘルスチェック: `https://mythologia.vercel.app/health`

#### ステージング環境
- サイト: `https://mythologia-staging.vercel.app`
- API: `https://mythologia-staging.vercel.app/api/*`
- ヘルスチェック: `https://mythologia-staging.vercel.app/health`

### 基本動作確認

- [ ] 自動デプロイ：GitHubプッシュ後に自動デプロイされる
- [ ] プレビューデプロイ：PRごとに個別URLが生成される
- [ ] 環境変数：各環境で正しく設定されている
- [ ] データベース接続：Vercel Postgresに接続できる

## 🐛 トラブルシューティング

### デプロイが失敗する場合

1. **ビルドエラー**
   - package.jsonのスクリプトを確認
   - 依存関係のバージョン競合を確認
   - ルートディレクトリが`webapp`に設定されているか確認

2. **環境変数エラー**
   - Vercelダッシュボードで環境変数が設定されているか確認
   - 環境変数名のタイポがないか確認
   - プレビューデプロイにも環境変数が適用されているか確認

3. **データベース接続エラー**
   - DATABASE_URLが正しく設定されているか確認
   - Vercel Postgresが作成されているか確認
   - IPアドレス制限がないか確認

### プレビューデプロイの確認

1. PRのコメントにプレビューURLが表示される
2. プレビュー環境でも環境変数が必要
3. データベースは本番/ステージングと共有される場合がある

## 📈 モニタリング

### Vercelダッシュボード

1. **Analytics**
   - リクエスト数
   - エラー率
   - レスポンス時間
   - 地域別アクセス

2. **Functions**
   - API関数の実行時間
   - メモリ使用量
   - エラーログ

3. **Logs**
   - リアルタイムログ
   - エラートレース
   - デプロイログ

## 🔄 デプロイフロー

### ブランチ戦略

```
feature/* → develop → release
    ↓          ↓          ↓
   PR      Staging    Production
```

### デプロイプロセス

1. **機能開発**
   - `feature/*`ブランチで開発
   - `develop`へのPR作成
   - プレビューデプロイで動作確認

2. **ステージング確認**
   - `develop`にマージ
   - ステージング環境に自動デプロイ
   - QAテスト実施

3. **本番リリース**
   - `develop`から`release`へのPR作成
   - レビュー後マージ
   - 本番環境に自動デプロイ

## 📞 サポート

デプロイに関する問題が発生した場合：

1. Vercelのステータスページを確認: https://www.vercel-status.com/
2. [GitHub Issues](https://github.com/your-org/Mythologia_AdmiralsShipBridge/issues) で既知の問題を確認
3. 新しいIssueを作成して詳細を報告

## 🔗 関連ドキュメント

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [環境変数の管理](https://vercel.com/docs/environment-variables)