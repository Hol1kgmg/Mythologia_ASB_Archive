# Vercel デプロイメント設定ガイド

このドキュメントでは、GitHubからVercelへの自動デプロイメント設定手順を説明します。

## 📋 前提条件

- GitHubリポジトリが作成済み
- Vercelアカウントが作成済み
- PostgreSQLデータベースが利用可能

## 🚀 デプロイメント手順

### 1. Vercelプロジェクトの作成

#### Vercel Dashboard での設定
1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. "New Project" をクリック
3. GitHubリポジトリ `Mythologia_AdmiralsShipBridge` を選択
4. "Import" をクリック

#### プロジェクト設定
- **Framework Preset**: `Other`
- **Root Directory**: `./` (ルートディレクトリ)
- **Build Command**: `npm run build`
- **Output Directory**: `apps/frontend/dist`
- **Install Command**: `npm install`

### 2. 環境変数の設定

Vercel Dashboard の Project Settings → Environment Variables で以下を設定:

#### 必須環境変数
```bash
# データベース接続
DATABASE_URL=postgresql://user:password@host:port/database

# アプリケーション設定
NODE_ENV=production
PORT=3000

# Vercel固有（自動設定）
VERCEL_URL=${VERCEL_URL}
VERCEL_REGION=${VERCEL_REGION}
```

#### PostgreSQL データベース設定例
```bash
# Vercel Postgres使用時
DATABASE_URL=${POSTGRES_URL}

# 外部PostgreSQL使用時
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

### 3. vercel.json 設定確認

プロジェクトルートに配置済みの `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "apps/frontend/dist"
      }
    },
    {
      "src": "apps/backend/src/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": "apps/backend/**"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "apps/frontend/dist/$1"
    }
  ],
  "functions": {
    "apps/backend/src/index.ts": {
      "maxDuration": 30
    }
  },
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "framework": null
}
```

**設定のポイント**:
- フロントエンド: 静的サイトとしてビルド（`@vercel/static-build`）
- バックエンド: Node.js関数として実行（`@vercel/node`）
- ルーティング: `/api/*` はバックエンド、それ以外はフロントエンドにルーティング

### 4. データベースセットアップ

#### Vercel Postgres 使用時
1. Vercel Dashboard → Storage → Create Database
2. "Postgres" を選択
3. データベース名を設定
4. 環境変数が自動設定されることを確認

#### 外部PostgreSQL使用時
1. PostgreSQLインスタンスを作成
2. 接続文字列を取得
3. Vercel環境変数に `DATABASE_URL` を設定

### 5. 自動デプロイメント

#### GitHub連携確認
- `main` ブランチへのpushで自動デプロイ
- プルリクエストでプレビューデプロイ生成
- Vercel Dashboard でデプロイ状況確認

#### デプロイメント検証
```bash
# デプロイ後の動作確認
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api
```

期待されるレスポンス:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## 🔧 トラブルシューティング

### ビルドエラー
```bash
# ログ確認
vercel logs your-deployment-url

# ローカルでのビルド確認
npm run build --workspace=@mythologia/backend
```

### データベース接続エラー
```bash
# 環境変数確認
vercel env ls

# DATABASE_URL形式確認
echo $DATABASE_URL
```

### 関数タイムアウト
- `vercel.json` の `maxDuration` を調整
- 長時間処理は非同期処理に変更

### モノレポ関連エラー
```bash
# workspace確認
npm ls --workspaces

# 依存関係確認
npm ls --workspace=@mythologia/backend
```

## 📊 モニタリング

### Vercel Analytics
- Vercel Dashboard → Analytics でアクセス状況確認
- パフォーマンスメトリクス監視

### ログ監視
```bash
# リアルタイムログ
vercel logs --follow

# 特定時間のログ
vercel logs --since=1h
```

### アラート設定
- Vercel Dashboard → Settings → Alerts
- エラー率、レスポンス時間の閾値設定

## 🔄 継続的な改善

### パフォーマンス最適化
- レスポンス時間の監視
- メモリ使用量の最適化
- キャッシュ戦略の改善

### セキュリティ
- 環境変数の定期的な更新
- アクセスログの監視
- セキュリティヘッダーの設定

## 📚 参考資料

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Node.js Runtime](https://vercel.com/docs/runtimes/node-js)
- [Monorepo Deployment](https://vercel.com/docs/concepts/git/monorepos)

---

このガイドに従って設定することで、GitHubからVercelへの自動デプロイメントが完了します。