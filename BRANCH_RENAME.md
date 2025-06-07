# ブランチ名変更手順

## mainからreleaseへの変更完了

### 実施済みの内容

1. **ローカルブランチ名変更**: `main` → `release` ✅
2. **リモートへのpush**: `release`ブランチ作成済み ✅
3. **GitHub Actions更新**: `deploy-production.yml`を`release`ブランチ対応に更新 ✅
4. **ドキュメント更新**: `DEPLOYMENT.md`を更新 ✅

### GitHubでの設定変更（必須）

1. **デフォルトブランチの変更**
   - GitHubリポジトリ → Settings → General
   - Default branch: `develop`に変更（または`release`）
   - Update をクリック

2. **ブランチ保護ルール**
   - Settings → Branches
   - `release`ブランチの保護ルール追加
   - Required approvals, status checks等を設定

3. **Vercelの設定更新**
   - Vercel Dashboard → Settings → Git
   - Production Branch: `release`に変更

### ブランチ構成

```
release (本番環境)
   ↑
develop (ステージング環境)
   ↑
feature/* (機能開発)
```

### 今後のワークフロー

1. 機能開発: `feature/*` ブランチで作業
2. ステージング: `develop` ブランチにマージ
3. 本番リリース: `develop` → `release` へマージ