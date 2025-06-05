# Mythologia Admiral Ship Bridge - WebApp

神託のメソロギア非公式ファンサイトのWebアプリケーション部分です。

## 📁 構成

```
webapp/
├── package.json          # ワークスペース設定
├── TESTING.md           # 動作確認手順
├── test-api.sh          # APIテストスクリプト
├── shared/              # 共有パッケージ（型定義・定数）
├── backend/             # Honoバックエンド
└── frontend/            # Next.jsフロントエンド
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
cd webapp
npm install
```

### 2. 共有パッケージのビルド

```bash
npm run build -w @mythologia/shared
```

### 3. バックエンド起動

```bash
cd backend
npm run dev
```

### 4. フロントエンド起動（別ターミナル）

```bash
cd frontend
npm run dev
```

## 🧪 テスト実行

### 自動APIテスト

```bash
cd webapp
./test-api.sh
```

### 型チェック

```bash
npm run type-check
```

## 📋 詳細な動作確認

詳細な動作確認手順については、[TESTING.md](./TESTING.md) をご参照ください。

## 🛠️ 開発コマンド

```bash
# 全パッケージ並行起動
npm run dev

# 個別起動
npm run dev:backend
npm run dev:frontend

# ビルド
npm run build

# リント
npm run lint

# 型チェック
npm run type-check
```

## 🏗️ アーキテクチャ

- **共有パッケージ**: TypeScript型定義、定数、バリデーションスキーマ
- **バックエンド**: Hono + TypeScript、クリーンアーキテクチャ
- **フロントエンド**: Next.js 15 + React 19、Feature-Sliced Design
- **データベース**: PostgreSQL/D1対応のアダプターパターン

## 🔗 API エンドポイント

- `GET /health` - ヘルスチェック
- `GET /api/cards` - カード一覧取得
- `GET /api/leaders` - リーダー一覧取得
- `GET /api/tribes` - 種族一覧取得

詳細なAPI仕様は各エンドポイントのレスポンスを確認してください。

## 📝 注意事項

- 現在はモックデータを返します
- データベース接続は未実装です
- 本格的なデータ機能は次のフェーズで実装予定です