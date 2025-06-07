# デプロイメント設定

## 環境分離

### 本番環境 (Production)
- **ブランチ**: `release`
- **Vercel設定**: `vercel.json`
- **環境変数**: `ENVIRONMENT=production`
- **URL**: https://mythologia-webapp.vercel.app

### ステージング環境 (Staging)
- **ブランチ**: `develop`
- **Vercel設定**: `vercel.staging.json`
- **環境変数**: `ENVIRONMENT=staging`
- **URL**: https://mythologia-staging.vercel.app

## Vercel設定手順

### 1. ステージング環境の設定

1. Vercelダッシュボードで新しいプロジェクト作成
   - プロジェクト名: `mythologia-staging`
   - リポジトリ: 同じGitHubリポジトリ
   - Framework Preset: Other
   - Build and Output Settings:
     - Build Command: `cd webapp && npm run build --workspace=@mythologia/shared && npm run build --workspace=@mythologia/backend`
     - Output Directory: 空（rootディレクトリ）
   - Environment Variables:
     ```
     DATABASE_TYPE=postgresql
     ENVIRONMENT=staging
     ```

2. Git Branch設定
   - Production Branch: 無効化
   - Preview Deployments: `develop`ブランチのみ有効

### 2. 本番環境の更新

既存のVercelプロジェクトで：

1. Settings > Git
   - Production Branch: `release`に変更
   - Preview Deployments: `release`ブランチのみ有効

2. Environment Variables確認:
   ```
   DATABASE_TYPE=postgresql
   ENVIRONMENT=production
   ```

## 推奨URL設定

- **本番**: `mythologia.vercel.app` または独自ドメイン
- **ステージング**: `mythologia-staging.vercel.app`

## デプロイフロー

```
develop ブランチ → ステージング環境
   ↓ (テスト完了後)
release ブランチ → 本番環境
```

## GitHub Secretsの設定

以下のSecretsをGitHub リポジトリに設定してください：

### 共通
- `VERCEL_TOKEN`: Vercelのアクセストークン
- `VERCEL_ORG_ID`: VercelのOrganization ID

### 環境別
- `VERCEL_PROJECT_ID`: 本番環境のProject ID
- `VERCEL_PROJECT_ID_STAGING`: ステージング環境のProject ID

### 取得方法

1. Vercel Token:
   - https://vercel.com/account/tokens
   - Create new token with full scope

2. Organization ID & Project ID:
   ```bash
   npx vercel link
   cat .vercel/project.json
   ```

## 自動デプロイ

GitHub Actionsによる自動デプロイが設定されています：

- `develop`ブランチへのpush → ステージング環境へ自動デプロイ
- `release`ブランチへのpush → 本番環境へ自動デプロイ