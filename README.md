# 神託のメソロギア 非公式Webアプリケーション

**神託のメソロギア（Mythologia）**のカード情報データベースとデッキ構築をサポートする**非公式**Webアプリケーション

**重要**: これは有志による非公式プロジェクトです。公式運営とは関係ありません。

## 🏗️ アーキテクチャ（モノレポ）

```
apps/
├── 🚀 backend/     # RESTful API (Hono + TypeScript)
└── 🎨 frontend/    # Webアプリケーション (React + TypeScript)

packages/
└── 📋 shared/      # 共通型定義・ユーティリティ
```

### 🛠️ 技術スタック

**バックエンド**: Hono + TypeScript + Drizzle ORM + Zod  
**フロントエンド**: React + TypeScript + Vite + TanStack Query  
**共有**: TypeScript型定義 + Zodバリデーション

## 🚀 クイックスタート

```bash
# クローン
git clone https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge.git
cd Mythologia_AdmiralsShipBridge

# 全依存関係インストール
npm run install-all

# 開発サーバー起動
npm run dev:backend   # バックエンド (port 3000)
npm run dev:frontend  # フロントエンド (port 5173)
```

## 📋 コマンド

```bash
# 開発
npm run dev              # バックエンドのみ
npm run dev:backend      # バックエンドAPI
npm run dev:frontend     # フロントエンドUI

# ビルド・テスト
npm run build            # 全てビルド
npm run test             # 全てテスト
npm run lint             # 全てリント

# メンテナンス
npm run clean            # node_modules削除
```

## 🔧 API エンドポイント

### 基本
- `GET /` - アプリケーション情報
- `GET /api/health` - ヘルスチェック

### 種族管理
- `GET /api/tribes` - 種族一覧
- `POST /api/tribes` - 種族作成
- `PUT /api/tribes/:id` - 種族更新

### カード管理
- `GET /api/cards` - カード一覧（フィルタリング対応）
- `POST /api/cards` - カード作成
- `PUT /api/cards/:id` - カード更新

### カードセット管理
- `GET /api/card-sets` - カードセット一覧
- `POST /api/card-sets` - カードセット作成

## 🧪 テスト・品質管理

### テスト実行

#### 全体テスト実行
```bash
npm run test             # 全パッケージのテスト実行
npm run test:backend     # バックエンドのみ
npm run test:frontend    # フロントエンドのみ（実装後）
```

#### バックエンドテスト詳細
```bash
cd apps/backend
npm run test            # 全テスト実行
npm run test:coverage   # カバレッジ付きテスト
```

**現在のテスト結果**: 39/39 テスト成功 ✅
```
✓ tests/unit/adapters.test.ts        (6 tests)
✓ tests/unit/validation.test.ts      (13 tests)  
✓ tests/integration/api-basic.test.ts (6 tests)
✓ tests/integration/api.test.ts      (14 tests)

Test Files  4 passed (4)
Tests      39 passed (39)
Duration    1.42s
```

### コード品質チェック

#### 型チェック
```bash
npm run typecheck        # 全パッケージの型チェック
npm run typecheck:backend # バックエンドのみ
```

#### リント
```bash
npm run lint             # 全パッケージのリント
npm run lint:backend     # バックエンドのみ
npm run lint:fix         # 自動修正
```

### API動作確認

#### 1. 開発サーバー起動
```bash
npm run dev:backend
```

出力例:
```
🚀 Server is running on port 3000
📖 API Documentation: http://localhost:3000/api
💚 Health Check: http://localhost:3000/api/health
```

#### 2. 基本エンドポイント確認
```bash
# アプリケーション情報
curl http://localhost:3000

# ヘルスチェック
curl http://localhost:3000/api/health

# API情報
curl http://localhost:3000/api
```

#### 3. データベース未設定時の動作確認
```bash
# 503エラーの確認
curl http://localhost:3000/api/tribes
```

期待されるレスポンス:
```json
{
  "success": false,
  "error": "Database not configured",
  "message": "Please set DATABASE_URL environment variable"
}
```

### 品質基準

- **型チェック**: TypeScript厳密モード + exactOptionalPropertyTypes
- **テストカバレッジ**: 単体テスト・統合テスト完備
- **コード品質**: ESLintエラー0件
- **API設計**: RESTful + 適切なエラーハンドリング

### トラブルシューティング

#### テスト実行エラー
```bash
# 依存関係の再インストール
npm run clean && npm run install-all

# 特定のテストのみ実行
npm run test --workspace=@mythologia/backend -- --run
```

#### 型チェックエラー
```bash
# TypeScriptキャッシュクリア
rm -rf apps/backend/node_modules/.cache
npm run typecheck:backend
```

#### 開発サーバー起動エラー
```bash
# ポート確認
lsof -i :3000

# 別ポートで起動
PORT=3001 npm run dev:backend
```

#### モノレポ関連エラー
```bash
# ワークスペース確認
npm ls --workspaces

# 各パッケージの依存関係確認
npm ls --workspace=@mythologia/backend
```

## 🌍 デプロイメント

**対応プラットフォーム**:
- Vercel (PostgreSQL)
- Cloudflare Workers (D1)

### Vercel デプロイメント
Vercelへのデプロイメント手順は [デプロイメントガイド](./docs/vercel-deployment.md) を参照してください。

**クイックスタート**:
1. [Vercel Dashboard](https://vercel.com/dashboard) でGitHubリポジトリを接続
2. 環境変数 `DATABASE_URL` を設定
3. 自動デプロイメント完了

## 📚 ドキュメント

- [設計ドキュメント](./system-design/README.md)
- [Vercelデプロイメント](./docs/vercel-deployment.md)
- [Claude設定](./CLAUDE.md)

## ⚠️ 免責事項

このプロジェクトは非公式のファンプロジェクトです。神託のメソロギアの公式運営とは一切関係ありません。

---
**Made with ❤️ by the Mythologia Community**