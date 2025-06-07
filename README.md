# 🚢 Mythologia Admiral Ship Bridge

## 神託のメソロギア ファンサイト

**Mythologia Admiral Ship Bridge** は、カード情報データベースとデッキ構築をサポートする**非公式**ファンサイトです。

**免責事項**: このアプリケーションは有志による非公式プロジェクトです。公式運営とは一切関係がありません。

## プロジェクト概要

カード情報の効率的な管理とデッキ構築機能を提供し、プレイヤーの戦略構築をサポートします。

### 主要機能

- **カードデータベース管理**: カード情報の登録・検索・管理
- **デッキ構築システム**: デッキコード圧縮によるデータ最小化
- **種族・リーダーシステム**: 動的な種族管理とリーダーとの関連性
- **多言語対応**: 日本語・英語・韓国語サポート
- **クロスプラットフォーム**: Vercel（PostgreSQL）とCloudflare（D1）対応

## 技術スタック

### コア技術
- **TypeScript** - 型安全性重視
- **Hono** - 軽量Webフレームワーク
- **Zod** - ランタイムバリデーション

### フロントエンド
- **Next.js 15** - App Router + React 19
- **TailwindCSS** - スタイリング
- **TanStack Query** - サーバー状態管理
- **Jotai** - クライアント状態管理

### バックエンド・データベース
- **PostgreSQL** (Vercel環境)
- **D1/SQLite** (Cloudflare環境)
- **Drizzle ORM** - TypeScript対応ORM
- **Vercel KV / Cloudflare KV** - キャッシュ

### デプロイメント
- **Vercel** - メイン環境
- **Cloudflare Workers** - エッジ環境

## データベース設計

### 主要テーブル

#### tribes テーブル
```sql
CREATE TABLE tribes (
  id INTEGER PRIMARY KEY,               -- 種族ID
  name VARCHAR(50) NOT NULL UNIQUE,     -- 種族名
  leaderId INTEGER NULL,                -- リーダーID（1-5）
  thematic VARCHAR(100) NULL,           -- テーマ特性
  description TEXT NULL,                -- 種族説明
  isActive BOOLEAN DEFAULT TRUE,        -- アクティブフラグ
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  MasterCardId VARCHAR(36) NULL         -- マスターカードID
);
```

#### cards テーブル
- カード基本情報（ID、名前、コスト、パワー）
- 種族・リーダー・レアリティとの関連
- JSON形式での効果定義
- 多言語対応

#### card_sets テーブル
- カードセット（収録パック）管理
- リリース日・カード数の管理

### リーダーシステム
- **1: DRAGON** - ドラゴン
- **2: ANDROID** - アンドロイド  
- **3: ELEMENTAL** - エレメンタル
- **4: LUMINUS** - ルミナス
- **5: SHADE** - シェイド

### レアリティシステム
- **1: BRONZE** - ブロンズ（基本）
- **2: SILVER** - シルバー（強化）
- **3: GOLD** - ゴールド（希少）
- **4: LEGEND** - レジェンド（伝説）

## プロジェクト構造

```
/
├── docs/                            # ドキュメント管理
│   ├── development-milestones/      # 開発マイルストーン
│   ├── development-policy/          # 開発方針・ガイドライン
│   ├── gamewiki/                    # ゲームルール・戦略
│   └── system-design/               # システム設計
├── dev/                             # 開発ガイド
│   ├── setup-guide.md              # 全体セットアップガイド
│   ├── backend-setup.md            # バックエンド開発ガイド
│   ├── frontend-setup.md           # フロントエンド開発ガイド
│   └── database-local-setup.md     # ローカルDB操作ガイド
├── webapp/                          # アプリケーション実装
│   ├── shared/                     # 共有パッケージ（型定義・スキーマ）
│   ├── backend/                    # Honoバックエンド
│   │   ├── src/                    # TypeScriptソースコード
│   │   ├── drizzle/                # Drizzle ORMスキーマ
│   │   ├── __tests__/              # Vitestテスト
│   │   └── scripts/                # ビルドスクリプト
│   ├── frontend/                   # Next.jsフロントエンド
│   │   ├── src/                    # React + TypeScriptソースコード
│   │   └── public/                 # 静的アセット
│   ├── DEPLOYMENT.md               # デプロイメントガイド
│   ├── TESTING.md                  # テストガイド
│   └── test-api.sh                 # API動作確認スクリプト
├── vercel.json                      # Vercelデプロイ設定
├── .env.example                     # 環境変数テンプレート
├── index.html                       # Coming Soonページ
├── CLAUDE.md                        # AI開発支援設定
├── CONTRIBUTING.md                  # 開発参加ガイドライン
└── README.md                        # このファイル
```

## 環境構築

### 前提条件

- **Node.js**: v18.0以上
- **npm**: v8.0以上
- **PostgreSQL**: v13以上（本番環境）
- **Git**: 最新版

### クイックスタート

```bash
# リポジトリクローン
git clone https://github.com/yourusername/Mythologia_AdmiralsShipBridge.git
cd Mythologia_AdmiralsShipBridge

# 依存関係インストール
cd webapp
npm install

# 環境変数設定
cd backend
cp .env.example .env.local
# .env.localを編集して必要な値を設定

# Cloudflare Workers開発の場合は.dev.varsも作成
cp .env.example .dev.vars
# .dev.varsを編集（Wrangler用）

# データベースセットアップ（ローカルPostgreSQL）
createdb mythologia_asb  # PostgreSQLに新しいデータベースを作成
# または既存のPostgreSQLユーザーを指定
# createdb -U postgres mythologia_asb

# Drizzleでテーブル作成
npm run db:push

# 開発サーバー起動
npm run dev         # Cloudflare Workers環境（.dev.vars使用）
# または
npm run dev:node    # 通常のNode.js環境（.env.local使用）
```

### 詳細な環境構築手順

#### 1. PostgreSQL セットアップ

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# データベース作成（ローカル環境）
createdb mythologia_asb
# またはユーザーを指定して作成
# createdb -U postgres mythologia_asb
# または psql で作成
# psql -U postgres -c "CREATE DATABASE mythologia_asb;"

# 環境変数設定（.env.localに記載するか、exportで設定）
export DATABASE_URL="postgresql://user:password@localhost:5432/mythologia_asb"
```

#### 2. Drizzle ORM セットアップ

```bash
cd webapp/backend

# Drizzle設定ファイル作成
cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema/*.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
EOF

# マイグレーション実行
npm run db:generate
npm run db:push
```

#### 3. 認証用テストアカウント

開発環境では以下のテストアカウントが使用可能:

- **スーパー管理者**: `superadmin` / `SuperAdmin123!`
- **カード管理者**: `cardadmin` / `CardAdmin456!`
- **閲覧専用管理者**: `vieweradmin` / `ViewAdmin789!`

#### 4. 環境変数の使い分け

バックエンドは実行環境によって異なる環境変数ファイルを使用します:

- **`.env.local`**: 通常のNode.js実行時（`npm run dev:node`、`npm run db:studio`）
- **`.dev.vars`**: Cloudflare Workers開発時（`npm run dev`）
- **環境変数**: 本番環境（Vercel、Cloudflare Workers）

両ファイルには同じ環境変数を設定してください。

## 開発コマンド

### 全体（webapp ディレクトリ）
```bash
# 全サービス同時起動
cd webapp && npm run dev

# 全パッケージビルド
cd webapp && npm run build

# 全パッケージテスト
cd webapp && npm run test

# 全パッケージリント
cd webapp && npm run lint
```

### バックエンド（webapp/backend）
```bash
# 開発サーバー起動
cd webapp/backend && npm run dev       # Cloudflare Workers環境（.dev.vars使用）
cd webapp/backend && npm run dev:node  # 通常のNode.js環境（.env.local使用）

# Drizzle Studio（DB管理GUI）
cd webapp/backend && npm run db:studio  # .env.localのDATABASE_URLを使用

# マイグレーション管理
cd webapp/backend && npm run db:generate  # 生成
cd webapp/backend && npm run db:migrate   # 実行
cd webapp/backend && npm run db:push      # 直接反映

# TypeScriptビルド
cd webapp/backend && npm run build

# Cloudflare Workers デプロイ
cd webapp/backend && npm run deploy:cloudflare
```

### フロントエンド（webapp/frontend）
```bash
# 開発サーバー起動
cd webapp/frontend && npm run dev

# Next.js ビルド
cd webapp/frontend && npm run build

# 本番サーバー起動
cd webapp/frontend && npm run start
```

### データベース操作確認
```bash
# API動作テスト実行
cd webapp && ./test-api.sh

# ローカル環境テスト
cd webapp && ./test-api.sh http://localhost:8787

# デバッグエンドポイント確認
curl http://localhost:8787/debug/db-status

# 認証テスト
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "SuperAdmin123!"}'
```

## 設定ファイル

- `.env.example` - 環境変数テンプレート
- `webapp/backend/.env.local` - バックエンド環境変数（gitignore対象）
- `webapp/backend/drizzle.config.ts` - Drizzle ORM設定
- `webapp/backend/wrangler.jsonc` - Cloudflare Workers設定
- `vercel.json` - Vercelデプロイ設定
- `CLAUDE.md` - AI開発支援設定

## データ最小化戦略

### デッキコード圧縮
- 既存データベース構造を維持
- API応答でのみデータ最小化
- デッキコード形式による効率的なデータ転送

### キャッシュ戦略
- **長期キャッシュ**: 個別カード情報（24時間）
- **中期キャッシュ**: セット別・リーダー別カード（1時間）
- **短期キャッシュ**: 検索結果（5分）

## アーキテクチャ原則

### 1. プラットフォーム非依存
- アダプターパターンによる環境抽象化
- Vercel/Cloudflare両対応

### 2. ドメイン駆動設計
- ビジネスロジックの分離
- 純粋なドメインモデル

### 3. パフォーマンス重視
- 効率的なデータベースクエリ
- 適切なインデックス設計
- レスポンス時間最適化

## 開発状況

### ✅ 完了済み
- **設計段階**: 完全完了
- **バックエンド実装**: Hono + TypeScript + ドメインモデル
- **Drizzle ORM実装**: PostgreSQL・D1両対応の完全移行
- **管理者認証API**: JWT認証・CRUD操作・テストカバレッジ
- **デプロイメント設定**: Vercel・Cloudflare Workers両対応
- **データベース**: PostgreSQL・D1両対応のマイグレーション
- **API実装**: カード・リーダー・種族管理API
- **開発環境**: ローカル開発・テスト環境構築
- **テスト環境**: Vitest導入・66テスト実装済み

### 🚧 進行中
- **フロントエンド実装**: Next.js + React基盤構築済み
- **管理者機能実装**: セッション管理・アクティビティログ機能追加中（Issue #13）

### 📋 今後の予定
- 管理者セッション・アクティビティログ完全実装
- フロントエンド管理画面実装
- カードデータベースCRUD API実装
- 本格的なデータベース運用開始

### 最新の更新内容
- **Drizzle ORM移行**: Issue #14完了、SQLファイル削除・完全ORM化
- **管理者認証実装**: Issue #12完了、JWT認証・テストアカウント3種
- **テストカバレッジ**: 認証・管理者API・Drizzle全66テスト実装
- **型安全性向上**: テストファイルの型エラー50件以上修正
- **環境構築改善**: README更新・Drizzle移行手順文書化

## 開発参加ガイド

### 初回セットアップ
1. **ドキュメント確認**: [dev/setup-guide.md](dev/setup-guide.md)
2. **データベース設定**: [dev/database-local-setup.md](dev/database-local-setup.md)
3. **開発ガイドライン**: [CONTRIBUTING.md](CONTRIBUTING.md)

### 開発フロー
1. **ブランチ作成**: `feature/#000_branch-name` 形式
2. **ローカル開発**: モックデータまたはPostgreSQL接続
3. **テスト実行**: `./test-api.sh` でAPI動作確認
4. **PR作成**: Issue番号とブランチ名の対応

### 重要な原則
- **設計ドキュメント参照**: 実装前に必ず確認
- **プラットフォーム非依存**: アダプターパターン遵守
- **型安全性**: TypeScript strict mode使用
- **テスト実行**: コミット前に必ずテスト

## ライセンスと著作権

- このプロジェクトは非公式の有志プロジェクトです
- 「神託のメソロギア」の著作権は公式運営に帰属します
- カード画像・ゲームデータの著作権は公式運営に帰属します
- 本アプリケーションのソースコードはMITライセンスです