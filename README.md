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

## 🧪 テスト結果

**バックエンド**: 25/25 テスト成功 ✅
- 単体テスト: バリデーション、アダプター
- 統合テスト: API エンドポイント

## 🌍 デプロイメント

**対応プラットフォーム**:
- Vercel (PostgreSQL)
- Cloudflare Workers (D1)

## 📚 ドキュメント

- [設計ドキュメント](./system-design/README.md)
- [開発ポリシー](./development-policy/README.md)
- [Claude設定](./CLAUDE.md)

## ⚠️ 免責事項

このプロジェクトは非公式のファンプロジェクトです。神託のメソロギアの公式運営とは一切関係ありません。

---
**Made with ❤️ by the Mythologia Community**