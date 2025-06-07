# GitHub Actions CI/CD

このディレクトリには、Mythologia Admiral Ship BridgeプロジェクトのCI/CDワークフローが含まれています。

## ワークフロー一覧

### 1. PR Checks (`pr-checks.yml`)
**トリガー**: Pull Request作成・更新時
**対象**: `develop`, `main`ブランチへのPR

#### チェック内容
- TypeScript型チェック (`npm run type-check`)
- テスト実行 (`npm test`)
- リント実行 (利用可能な場合)
- ビルド確認 (利用可能な場合)

#### 実行環境
- Node.js 18.x, 20.x でのマトリックステスト
- Ubuntu最新版

### 2. Push Checks (`push-checks.yml`)
**トリガー**: `develop`, `main`ブランチへのプッシュ時

#### チェック内容
- TypeScript型チェック
- テスト実行
- テスト結果のアーティファクト保存

#### 実行環境
- Node.js 20.x
- Ubuntu最新版

### 3. Nightly Checks (`nightly-checks.yml`)
**トリガー**: 毎日午前2時（UTC）/ 手動実行

#### チェック内容
- 包括的なテスト実行（カバレッジ付き）
- TypeScript型チェック
- リント・ビルド確認
- 複数Node.jsバージョンでのテスト

#### 実行環境
- Node.js 18.x, 20.x, 22.x でのマトリックステスト
- Ubuntu最新版

## ファイル構造

```
.github/
├── workflows/
│   ├── pr-checks.yml      # PR用チェック
│   ├── push-checks.yml    # Push用チェック
│   └── nightly-checks.yml # 夜間包括チェック
└── README.md             # このファイル
```

## 対象パス

ワークフローは以下のパスに変更があった場合にトリガーされます：

- `webapp/backend/**`
- `webapp/shared/**`
- `.github/workflows/**`

## ワークフロー実行の確認

### 1. GitHub UI
1. リポジトリページの「Actions」タブにアクセス
2. 各ワークフローの実行状況を確認

### 2. PR状況
- PRページでチェック状況が自動表示
- 全チェック通過後にマージ可能

### 3. バッジ表示
READMEにステータスバッジを追加可能：

```markdown
![PR Checks](https://github.com/USER/REPO/actions/workflows/pr-checks.yml/badge.svg)
![Push Checks](https://github.com/USER/REPO/actions/workflows/push-checks.yml/badge.svg)
```

## トラブルシューティング

### よくある問題

#### 1. 依存関係エラー
```bash
npm ci  # package-lock.jsonを使用した確実なインストール
```

#### 2. 型チェックエラー
```bash
cd webapp/backend
npm run type-check
```

#### 3. テスト失敗
```bash
cd webapp/backend
npm test
```

### ワークフローをローカルで確認

```bash
# 型チェック
cd webapp/backend && npm run type-check

# テスト実行
cd webapp/backend && npm test

# リント（利用可能な場合）
cd webapp/backend && npm run lint

# ビルド（利用可能な場合）
cd webapp/backend && npm run build
```

## 設定のカスタマイズ

### Node.jsバージョンの変更
`strategy.matrix.node-version`を編集：

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # 追加・削除可能
```

### トリガー条件の変更
`on`セクションを編集：

```yaml
on:
  pull_request:
    branches: [ develop, main, feature/* ]  # ブランチ追加
    paths:
      - 'webapp/**'  # パス変更
```

### 実行スクリプトの追加
`steps`セクションにステップを追加：

```yaml
- name: Custom Check
  run: |
    cd webapp/backend
    npm run custom-script
```

## セキュリティ考慮事項

- 外部からのPRでは秘匿情報にアクセス不可
- アーティファクトは指定期間後に自動削除
- ワークフローファイル自体の変更も監視対象

## 関連ドキュメント

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js with GitHub Actions](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- [プロジェクトのCONTRIBUTING.md](../CONTRIBUTING.md)