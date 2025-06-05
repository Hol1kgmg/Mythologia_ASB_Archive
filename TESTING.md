# 動作確認手順

## 📋 概要

このドキュメントでは、Mythologia Admiral Ship Bridgeプロジェクトの動作確認方法を説明します。

## 🚀 事前準備

### 1. 依存関係のインストール

```bash
# ルートディレクトリで実行
npm install

# 個別パッケージのビルド
npm run build -w @mythologia/shared
npm run build -w @mythologia/backend
```

### 2. 型チェック

```bash
# 全パッケージの型チェック
npm run type-check -w @mythologia/shared
npm run type-check -w @mythologia/backend
npm run type-check -w @mythologia/frontend
```

## 🔧 バックエンドAPI動作確認

### 1. 開発サーバー起動

```bash
cd webapp/backend
npm run dev
```

サーバーが起動すると以下のようなメッセージが表示されます：
```
✨ Starting local server: http://localhost:8787
```

### 2. 自動テストスクリプト実行

```bash
# ルートディレクトリから実行
./test-api.sh

# または特定のURLを指定
./test-api.sh http://localhost:8787
```

### 3. 手動テスト（curl使用）

```bash
# ヘルスチェック
curl http://localhost:8787/health

# 基本API情報
curl http://localhost:8787/

# カード一覧取得
curl http://localhost:8787/api/cards

# パラメータ付きカード検索
curl "http://localhost:8787/api/cards?page=1&limit=10&rarity=1"

# リーダー一覧取得
curl http://localhost:8787/api/leaders

# 種族一覧取得
curl http://localhost:8787/api/tribes

# 個別リソース取得
curl http://localhost:8787/api/leaders/1
curl http://localhost:8787/api/tribes/1

# エラーケースのテスト
curl http://localhost:8787/api/leaders/invalid
curl http://localhost:8787/api/tribes/invalid
```

### 4. ブラウザでのテスト

以下のURLをブラウザで開いて、JSONレスポンスを確認：

- http://localhost:8787/health
- http://localhost:8787/api/cards
- http://localhost:8787/api/leaders
- http://localhost:8787/api/tribes

## 🎨 フロントエンド動作確認

### 1. 開発サーバー起動

```bash
cd webapp/frontend
npm run dev
```

### 2. ブラウザアクセス

http://localhost:3000 にアクセスして以下を確認：

- ページが正常に表示される
- プロジェクト名「Mythologia Admiral Ship Bridge」が表示される
- 開発状況が緑色で表示される
- カード検索とデッキ構築のリンクが表示される

## 📊 期待される結果

### APIレスポンス例

#### `/health` エンドポイント
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### `/api/cards` エンドポイント
```json
{
  "success": true,
  "data": {
    "cards": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### `/api/leaders` エンドポイント
```json
{
  "success": true,
  "data": [],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### エラーレスポンス例

#### 無効なIDの場合（400エラー）
```json
{
  "success": false,
  "error": "Invalid leader ID",
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## 🔍 トラブルシューティング

### サーバーが起動しない場合

1. ポート8787が使用中でないか確認
2. 依存関係が正しくインストールされているか確認
3. TypeScriptビルドエラーがないか確認

### APIレスポンスが期待と異なる場合

1. サーバーログを確認
2. リクエストURLとパラメータを確認
3. ブラウザの開発者ツールでネットワークタブを確認

### フロントエンドが表示されない場合

1. ポート3000が使用中でないか確認
2. 共有パッケージがビルドされているか確認
3. Next.jsの設定ファイルを確認

## 📝 注意事項

- 現在はモックデータを返すため、実際のデータベースからのデータは返されません
- 本格的なデータ機能はデータベース接続実装後に利用可能になります
- CORSは `http://localhost:3000` からのアクセスのみ許可されています

## 🎯 次のステップ

動作確認が完了したら：

1. データベース接続の実装
2. 実際のデータを使用したテスト
3. フロントエンドでのAPI呼び出し実装
4. 統合テストの作成