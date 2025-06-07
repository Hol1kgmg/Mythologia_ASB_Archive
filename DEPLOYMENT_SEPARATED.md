# 分離デプロイメントガイド

## 概要

Railway（バックエンド）+ Vercel（フロントエンド）の分離アーキテクチャでデプロイします。

## アーキテクチャ

```
┌─────────────────┐    API通信    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│   (Vercel)      │               │   (Railway)     │
│                 │               │                 │
│ - Next.js       │               │ - Hono API      │
│ - React         │               │ - PostgreSQL    │
│ - TailwindCSS   │               │ - Redis         │
└─────────────────┘               └─────────────────┘
```

## 🚂 Railway バックエンドデプロイ

### 1. Railway プロジェクト作成

1. [Railway](https://railway.app) にログイン
2. 「New Project」→ 「Deploy from GitHub repo」
3. このリポジトリを選択
4. サービス設定:
   - **Root Directory**: `webapp/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2. データベース設定

#### PostgreSQL サービス追加
1. プロジェクトダッシュボード → 「New Service」→ PostgreSQL
2. 自動的に `DATABASE_URL` が生成される

#### Redis サービス追加
1. プロジェクトダッシュボード → 「New Service」→ Redis
2. 自動的に `REDIS_URL` が生成される

### 3. 環境変数設定

```
NODE_ENV=production
DATABASE_TYPE=postgresql
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
PORT=${{PORT}}
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 4. ドメイン設定

1. Railway ダッシュボード → Settings → Domains
2. カスタムドメインまたは Railway 提供ドメインを設定
3. HTTPS が自動で有効化される

## 🚀 Vercel フロントエンドデプロイ

### 1. Vercel プロジェクト作成

#### 本番環境
1. [Vercel](https://vercel.com) にログイン
2. 「New Project」→ GitHubリポジトリ選択
3. プロジェクト設定:
   - **Root Directory**: `webapp/frontend`
   - **Framework Preset**: Next.js
   - **Production Branch**: `release`

#### ステージング環境
1. 新しいプロジェクトを作成
2. 同設定で **Production Branch**: `develop`

### 2. 環境変数設定

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
ENVIRONMENT=production
```

### 3. ビルド設定

Vercel ダッシュボード → Settings → Build & Development Settings:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

## 🔧 ローカル開発環境

### バックエンド開発

```bash
cd webapp/backend

# 環境変数設定
cp .env.example .env.local

# 編集: .env.local
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://localhost:5432/mythologia_dev
REDIS_URL=redis://localhost:6379
PORT=8787
CORS_ORIGIN=http://localhost:3000

# 開発サーバー起動
npm run dev
```

### フロントエンド開発

```bash
cd webapp/frontend

# 環境変数設定
cp .env.example .env.local

# 編集: .env.local
NEXT_PUBLIC_API_URL=http://localhost:8787

# 開発サーバー起動
npm run dev
```

## 🔄 デプロイフロー

### 自動デプロイ

1. **バックエンド**:
   - `main` ブランチ → Railway 本番環境
   - `develop` ブランチ → Railway ステージング環境

2. **フロントエンド**:
   - `release` ブランチ → Vercel 本番環境
   - `develop` ブランチ → Vercel ステージング環境

### 手動デプロイ

#### Railway バックエンド
```bash
# Railway CLI インストール
npm install -g @railway/cli

# ログイン
railway login

# デプロイ
cd webapp/backend
railway up
```

#### Vercel フロントエンド
```bash
# Vercel CLI インストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
cd webapp/frontend
vercel --prod
```

## 📋 確認事項

### バックエンド確認
- `https://your-backend.railway.app/health`
- `https://your-backend.railway.app/api/cards`
- `https://your-backend.railway.app/debug/db-status`

### フロントエンド確認
- `https://your-frontend.vercel.app`
- API連携が正常に動作すること
- CORS設定が正しく動作すること

### 連携確認
- フロントエンドからバックエンドAPIを呼び出せること
- 認証フローが正常に動作すること
- エラーハンドリングが適切に動作すること

## 🐛 トラブルシューティング

### CORS エラー
```
Access-Control-Allow-Origin error
```

**解決策**:
1. Railway の `CORS_ORIGIN` 環境変数にフロントエンドURLを設定
2. バックエンドのCORS設定を確認

### API接続エラー
```
Failed to fetch from API
```

**解決策**:
1. `NEXT_PUBLIC_API_URL` が正しく設定されているか確認
2. Railway バックエンドサービスが稼働しているか確認
3. ネットワーク接続を確認

### ビルドエラー

**Railway**:
1. `package.json` のスクリプトを確認
2. 依存関係の競合を確認
3. Railway ログを確認

**Vercel**:
1. ビルドコマンドを確認
2. 環境変数が設定されているか確認
3. Vercel ログを確認

## 📈 モニタリング

### Railway
- ダッシュボードでメトリクス確認
- ログストリーミング
- アラート設定

### Vercel
- Analytics でパフォーマンス確認
- Function ログ確認
- エラー追跡

## 🔗 関連リンク

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)