# デプロイメント設定

## 環境分離

### 本番環境 (Production)
- **ブランチ**: `release`
- **環境変数**: `ENVIRONMENT=production`
- **URL**: https://mythologia-webapp.vercel.app

### ステージング環境 (Staging)
- **ブランチ**: `develop`
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

## 自動デプロイ

Vercelの自動デプロイ機能を使用します：

- `develop`ブランチへのpush → ステージング環境へ自動デプロイ
- `release`ブランチへのpush → 本番環境へ自動デプロイ

### 注意事項

- GitHub Actionsは使用せず、Vercelの標準機能で十分です
- 各プロジェクトのProduction Branchを正しく設定してください
- プレビューデプロイも自動的に有効になります