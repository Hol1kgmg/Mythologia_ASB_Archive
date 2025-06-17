# バックエンド

## クイックスタート

```bash
npm install
npm run dev
```

## 開発コマンド

すべての開発コマンドは [README_COMMANDS.md](./README_COMMANDS.md) を参照してください。

### よく使用するコマンド

```bash
# Docker環境起動
docker-compose up -d postgres redis

# DB接続テスト
npm run db:test:docker

# シードデータ生成
npm run db:seed:docker -- --admins-only --count-admins=5

# 開発サーバー起動
npm run dev
```

## ドキュメント

- [📋 開発コマンド統合ガイド](./README_COMMANDS.md) - 全コマンドの使用方法
- [🌱 シードデータ詳細仕様](./README_SEEDS.md) - ダミーデータ生成の詳細
- [🗑️ データクリア詳細仕様](./README_CLEAR.md) - データベース削除の詳細
- [🚂 Railway環境テスト](./RAILWAY_SEED_TEST.md) - 本番環境での動作確認
- [📊 テスト結果](./TEST_RESULTS.md) - 実装機能のテスト結果
