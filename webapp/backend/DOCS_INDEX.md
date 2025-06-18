# バックエンドドキュメント索引

## 📚 ドキュメント構成

### 🎯 すぐに使いたい方向け

1. **[README_COMMANDS.md](./README_COMMANDS.md)** - 開発コマンド統合ガイド
   - すべてのコマンドの使用方法が1つのファイルにまとまっています
   - 最初にこのファイルを読むことを推奨します

### 📖 詳細仕様を知りたい方向け

2. **[README_SEEDS.md](./README_SEEDS.md)** - シードデータ詳細仕様
   - ダミーデータ生成の内部仕組み
   - カスタマイズ方法
   - 技術的な詳細

3. **[README_CLEAR.md](./README_CLEAR.md)** - データクリア詳細仕様
   - データベース削除機能の仕組み
   - 安全機能の詳細
   - バックアップ機能の仕様

4. **[RAILWAY_SEED_TEST.md](./RAILWAY_SEED_TEST.md)** - Railway環境テスト
   - 本番環境での動作確認手順
   - Railway固有の設定

5. **[TEST_RESULTS.md](./TEST_RESULTS.md)** - テスト結果
   - 実装機能のテスト検証結果
   - パフォーマンス情報

## 🗂️ ドキュメントの役割分担

### 📋 統合ドキュメント
- **README_COMMANDS.md**: 全コマンドの使用方法を集約
  - チーム開発でよく使用するコマンドを素早く確認
  - Docker vs ローカル環境の使い分け指針
  - よくある操作パターンのサンプル

### 📝 詳細仕様ドキュメント
各機能の深い理解と高度な使用方法：

- **README_SEEDS.md**: シード機能の詳細
- **README_CLEAR.md**: クリア機能の詳細
- **RAILWAY_SEED_TEST.md**: Railway環境の詳細
- **TEST_RESULTS.md**: テスト結果の詳細

### 🚀 クイックスタート
- **README.md**: プロジェクト概要と最小限の使用方法

## 🎯 目的別ガイド

### 初回セットアップしたい
1. [README.md](./README.md) - クイックスタート
2. [README_COMMANDS.md - 開発環境セットアップ](./README_COMMANDS.md#開発環境セットアップ)

### コマンドを確認したい
1. [README_COMMANDS.md](./README_COMMANDS.md) - 全コマンド一覧

### ダミーデータを作成したい
1. [README_COMMANDS.md - シードデータ生成](./README_COMMANDS.md#シードデータ生成)
2. [README_SEEDS.md](./README_SEEDS.md) - 詳細仕様

### データベースをリセットしたい
1. [README_COMMANDS.md - データベースクリア](./README_COMMANDS.md#データベースクリア)
2. [README_CLEAR.md](./README_CLEAR.md) - 詳細仕様

### Railway環境で作業したい
1. [README_COMMANDS.md - Railway本番環境](./README_COMMANDS.md#railway本番環境)
2. [RAILWAY_SEED_TEST.md](./RAILWAY_SEED_TEST.md) - 詳細手順

### トラブルを解決したい
1. [README_COMMANDS.md - トラブルシューティング](./README_COMMANDS.md#トラブルシューティング)

## 📱 クイックリファレンス

### よく使用するコマンド
```bash
# 環境セットアップ
docker-compose up -d postgres redis
npm run db:test:docker

# 開発データ準備
npm run db:seed:docker -- --admins-only --count-admins=5

# 開発サーバー起動
npm run dev

# データリセット
npm run db:clear:docker -- --force --backup
```

### デバッグ用コマンド
```bash
# 追加管理者作成
npm run db:seed:docker -- --admins-only --count-admins=10

# 特定テーブルクリア
npm run db:clear:docker -- --force --table=admins

# DB直接アクセス
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev
```

---

💡 **ヒント**: 迷ったら [README_COMMANDS.md](./README_COMMANDS.md) を最初に確認してください。