# 神託のメソロギア 非公式Webアプリケーション - Claude Code設定

このファイルは、Claude Codeがこのリポジトリで作業する際の指針を提供します。

## プロジェクト概要

**神託のメソロギア（Mythologia）**のカード情報データベースとデッキ構築をサポートする**非公式**Webアプリケーション

**重要**: これは有志による非公式プロジェクトです。公式運営とは関係ありません。

### 現在の開発状況
- **設計段階**: 完了 ✅
- **実装段階**: 未開始 📋
- **最新更新**: カードカテゴリシステム設計完了、種族従属の細分化システム追加

## 技術スタック

### コア技術
- **TypeScript** - 型安全性重視
- **Hono** - 軽量Webフレームワーク
- **Zod** - ランタイムバリデーション
- **Drizzle ORM** - 型安全なORM・マイグレーション管理

### データベース・インフラ
- **PostgreSQL** (Railway提供)
- **Redis** (Railway提供 - キャッシュ・セッション管理)
- **Drizzle Kit** - マイグレーション・スキーマ管理

### デプロイメント環境
- **本番環境**: Railway(バックエンド) + Vercel(フロントエンド)
- **ステージ環境**: Railway(バックエンド) + Vercel(フロントエンド)
- **バックエンド**: Hono + PostgreSQL on Railway
- **フロントエンド**: Next.js on Vercel

## 重要なデータベース仕様

### Leadersテーブル（新追加）
```sql
CREATE TABLE leaders (
  id INTEGER PRIMARY KEY,               -- リーダーID（1-5）
  name VARCHAR(50) NOT NULL UNIQUE,     -- リーダー名（日本語）
  name_en VARCHAR(50) NOT NULL UNIQUE,  -- リーダー名（英語）
  description TEXT NULL,                -- リーダー説明
  color VARCHAR(7) NOT NULL,            -- テーマカラー（HEX形式）
  thematic VARCHAR(100) NULL,           -- テーマ特性
  focus VARCHAR(50) NOT NULL,           -- 戦略フォーカス
  average_cost DECIMAL(3,1) DEFAULT 3.5, -- 推奨平均コスト
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tribeテーブル（最新仕様）
```sql
CREATE TABLE tribes (
  id INTEGER PRIMARY KEY,               -- 種族ID
  name VARCHAR(50) NOT NULL UNIQUE,     -- 種族名
  leaderId INTEGER NULL,                -- リーダーID（leaders.id参照）
  thematic VARCHAR(100) NULL,           -- テーマ特性
  description TEXT NULL,                -- 種族説明
  isActive BOOLEAN DEFAULT TRUE,        -- アクティブフラグ
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  MasterCardId VARCHAR(36) NULL,        -- マスターカードID
  FOREIGN KEY (leaderId) REFERENCES leaders(id) ON DELETE SET NULL
);
```

### Categoriesテーブル（新追加）
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,               -- カテゴリID
  tribe_id INTEGER NOT NULL,            -- 種族ID（必須）
  name VARCHAR(50) NOT NULL,            -- カテゴリ名（日本語）
  name_en VARCHAR(50) NOT NULL,         -- カテゴリ名（英語）
  description TEXT NULL,                -- カテゴリ説明
  thematic VARCHAR(100) NULL,           -- テーマ特性
  color VARCHAR(7) NULL,                -- テーマカラー（HEX形式）
  synergy_type VARCHAR(50) NULL,        -- シナジータイプ
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(tribe_id, name),               -- 同一種族内でのカテゴリ名重複防止
  UNIQUE(tribe_id, name_en),            -- 同一種族内での英語名重複防止
  FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE
);
```

### 重要なID体系
- **リーダーID**: 1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE
- **レアリティID**: 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
- **カードタイプID**: 1:ATTACKER, 2:BLOCKER, 3:CHARGER
- **種族ID**: 1:ドラゴン, 2:ロボット, 3:エレメンタル, 4:アンジェル, 5:デーモン, 6:ビースト, 7:ヒューマン, 8:アンデッド, 9:旧神
- **カテゴリID**: 1-4:HUMAN種族(騎士,魔法使い,弓兵,僧侶), 5-8:DRAGON種族(古龍,幼龍,長老,守護龍), 9-12:ROBOT種族(戦闘機,支援機,重機,偵察機) ※旧神種族にはカテゴリなし

### 動的データ管理
- **リーダー管理**: 静的enumからleadersテーブルへ移行完了 ✅
- **種族管理**: 静的enumから動的データベース管理に移行済み
- **カテゴリ管理**: 種族に従属する細分化システムとして動的管理
- `TribeDomain`インターフェース実装済み
- リーダーと種族の関連性を外部キーで管理
- 種族とカテゴリの階層関係（categories.tribe_id外部キー）
- カードとカテゴリの多対多関係（card_categories中間テーブル）

## プロジェクト構造

```
/
├── README.md                    # プロジェクト概要
├── CLAUDE.md                   # このファイル
├── railway.json                # Railway設定（ルート用）
├── vercel.json                 # Vercel設定（ルート用）
├── DEPLOYMENT_SEPARATED.md     # 分離デプロイガイド
├── docker-compose.yml          # Docker開発環境（未作成）
├── system-design/              # 設計ドキュメント（完成済み）
│   ├── README.md              # 設計ドキュメント索引
│   ├── database-design/       # データベース設計
│   │   ├── card/             # カードシステム設計 ✅
│   │   │   └── card-categories-design.md  # カテゴリシステム ✅
│   │   └── deck/             # デッキシステム設定 ✅
│   └── [その他設計ファイル]
└── webapp/                     # 実装ディレクトリ
    ├── shared/                 # 共有型定義 ✅
    ├── backend/                # バックエンド（Railway用）
    │   ├── Dockerfile         # Railway用Dockerファイル ✅
    │   ├── .dockerignore      # Docker除外ファイル ✅
    │   ├── railway.toml       # Railway設定 ✅
    │   ├── .env.example       # 環境変数テンプレート ✅
    │   ├── drizzle/           # Drizzleマイグレーション
    │   │   ├── migrations/    # マイグレーションファイル
    │   │   └── schema.ts      # スキーマ定義
    │   └── src/               # アプリケーションコード
    └── frontend/               # フロントエンド（Vercel用）
        ├── Dockerfile         # 開発・テスト用Dockerファイル ✅
        ├── .dockerignore      # Docker除外ファイル ✅
        ├── vercel.json        # Vercel設定 ✅
        ├── .env.example       # 環境変数テンプレート ✅
        └── src/               # アプリケーションコード
```

## Docker管理構成

### 分離Docker管理
```bash
# バックエンド用（Railway環境テスト）
cd webapp/backend
docker build -t mythologia-backend .
docker run -p 8787:8787 mythologia-backend

# フロントエンド用（ローカルテスト）
cd webapp/frontend  
docker build -t mythologia-frontend .
docker run -p 3000:3000 mythologia-frontend

# 開発環境データベース（Docker Compose）
docker-compose up -d postgres redis
```

### Dockerファイル管理
```
webapp/
├── backend/
│   ├── Dockerfile         # Railway用本番ビルド
│   ├── .dockerignore      # Railway用除外設定
│   └── railway.toml       # Railway設定
└── frontend/
    ├── Dockerfile         # ローカルテスト用
    ├── .dockerignore      # Vercel用除外設定
    └── vercel.json        # Vercel設定
```

### 開発環境構成
```yaml
# docker-compose.yml (未作成)
services:
  postgres:    # PostgreSQL 16（開発用）
  redis:       # Redis 7（開発用）
  # Note: バックエンド・フロントエンドは各ディレクトリで個別管理
```

## 開発コマンド（実装後）

```bash
# ローカル開発
npm run dev              # 開発サーバー起動
npm run dev:docker       # Docker環境での開発

# ビルド・テスト
npm run build
npm run test
npm run lint
npm run typecheck

# データベース関連
npm run db:generate      # マイグレーションファイル生成
npm run db:migrate       # マイグレーション実行
npm run db:push          # スキーマを直接プッシュ（開発用）
npm run db:studio        # Drizzle Studio起動
npm run db:seed          # シードデータ投入

# Docker関連
npm run docker:backend   # バックエンドDocker起動
npm run docker:frontend  # フロントエンドDocker起動
npm run docker:dev       # 開発用DB起動（PostgreSQL + Redis）
```

## 設計原則・開発方針

### 1. 環境分離とデプロイメント戦略
- **ローカル環境**: Docker Compose（PostgreSQL + Redis）
- **本番・ステージ環境**: Railway + Vercel構成
- **データベース統一**: PostgreSQL（全環境共通）
- **環境変数管理**: .env.local / Railway / Vercelで分離

### 2. データベース管理戦略（Drizzle ORM）
- **型安全なスキーマ**: TypeScriptでスキーマ定義
- **マイグレーション管理**: Drizzle Kitによるバージョン管理
- **開発体験**: Drizzle Studioによるデータ可視化
- **環境別DB**: 本番・ステージ・ローカル環境の分離

### 3. ドメイン駆動設計
- **ビジネスロジック分離**: 純粋なドメインモデル
- **動的データ管理**: 拡張性を重視した種族システム
- **型安全性**: TypeScript + Zod + Drizzleによる厳密な型管理

## 重要なドキュメント参照順序

新規開発・理解時の推奨読み順：

1. **README.md** - プロジェクト全体概要
2. **system-design/README.md** - 設計ドキュメント索引
3. **system-design/database-design/card/card-domain-model.md** - カードビジネスルール
4. **system-design/database-design/card/card-database-design.md** - データベース構造
5. **system-design/database-design/card/card-categories-design.md** - カテゴリシステム設計
6. **system-design/database-design/deck/deck-minimal-crud.md** - デッキ機能仕様

## 開発時の注意事項

### データベース関連
- **Leadersテーブル**: 動的管理（静的enumから移行済み）
- **Tribesテーブル**: 動的管理（静的enumは使用しない）
- **Categoriesテーブル**: 第2の種族として動的管理
- **多対多関係**: card_categories中間テーブルで管理
- 外部キー制約を適切に設定
- PostgreSQL専用のSQL記述

### 実装パターン
- アダプターパターンによる環境抽象化
- Zodスキーマによるバリデーション
- キャッシュ戦略に基づくパフォーマンス最適化

### コード品質
- TypeScript厳密モードの使用
- コメントよりも明確な命名を優先
- テストカバレッジの確保

## デプロイメント構成

### 環境構成
```
ローカル環境:
├── Frontend: localhost:3000 (Next.js Dev)
├── Backend: localhost:8000 (Hono Dev)
├── Database: localhost:5432 (Docker PostgreSQL)
└── Cache: localhost:6379 (Docker Redis)

ステージ環境:
├── Frontend: Vercel (mythologia-staging.vercel.app)
├── Backend: Railway (mythologia-api-staging.railway.app)
├── Database: Railway PostgreSQL (Staging DB)
└── Cache: Railway Redis (Staging Cache)

本番環境:
├── Frontend: Vercel (mythologia-production.vercel.app)
├── Backend: Railway (mythologia-api-production.railway.app)
├── Database: Railway PostgreSQL (Production DB)
└── Cache: Railway Redis (Production Cache)
```

### 環境変数管理
**ローカル環境 (.env.local):**
- `DATABASE_URL`: postgres://user:password@localhost:5432/mythologia_local
- `REDIS_URL`: redis://localhost:6379
- `JWT_SECRET`: local-development-secret
- `NODE_ENV`: development
- `NEXT_PUBLIC_API_URL`: http://localhost:8000

**Railway (Backend):**
- `DATABASE_URL`: PostgreSQL接続文字列（Drizzle接続用）
- `REDIS_URL`: Redis接続文字列
- `JWT_SECRET`: JWT署名キー
- `NODE_ENV`: production/staging
- `DRIZZLE_DATABASE_URL`: Drizzle専用DB URL（オプション）

**Vercel (Frontend):**
- `NEXT_PUBLIC_API_URL`: バックエンドURL
- `NEXT_PUBLIC_ENVIRONMENT`: production/staging/local

### デプロイフロー
1. **ステージング**: `develop`ブランチ → 自動デプロイ
2. **本番**: `main`ブランチ → 自動デプロイ
3. **PR環境**: PRブランチ → プレビューデプロイ (Vercelのみ)

## 次期実装予定

### Phase 1: 基盤実装
- [ ] プロジェクト初期化（package.json, tsconfig.json等）
- [ ] データベースアダプター実装
- [ ] 基本的なCRUD API

### Phase 2: コア機能
- [ ] カード管理API
- [ ] デッキ管理API
- [ ] 検索・フィルタリング機能

### Phase 3: UI実装
- [ ] カード管理画面
- [ ] デッキ構築画面
- [ ] レスポンシブ対応

## Claude Codeへの指示

このプロジェクトで作業する際は：

1. **設計ドキュメントを必ず参照**してからコード実装
2. **ローカル開発はDocker**を使用（PostgreSQL + Redis）
3. **Railway + Vercel構成**に最適化された実装
4. **Drizzle ORM**でのマイグレーション・スキーマ管理
5. **PostgreSQL単一DB**での設計（D1/SQLiteサポートは廃止）
6. **環境分離**を意識した設定管理（Local/Staging/Production）
7. **型安全性**を最優先にしたコード記述（TypeScript + Drizzle）
8. **動的データ管理**の原則に従う（リーダー・種族・カテゴリの静的enumは使用禁止）

## 設定ファイル

### ローカル開発
- `docker-compose.yml` - 開発用データベース環境 ✅
- `docker/postgres/init.sql` - PostgreSQL初期化スクリプト ✅
- `.env.local.example` - ローカル開発環境変数テンプレート ✅
- `webapp/backend/.env.example` - バックエンド環境変数テンプレート ✅
- `webapp/frontend/.env.example` - フロントエンド環境変数テンプレート ✅
- `drizzle.config.ts` - Drizzle設定ファイル（未作成）

### デプロイメント（分離管理）
- **バックエンド（Railway）**:
  - `railway.json` - ルート用Railway設定 ✅
  - `webapp/backend/railway.toml` - バックエンド専用設定 ✅
  - `webapp/backend/Dockerfile` - Railway用Dockerファイル ✅
  - `webapp/backend/.dockerignore` - Docker除外設定 ✅

- **フロントエンド（Vercel）**:
  - `vercel.json` - ルート用Vercel設定 ✅
  - `webapp/frontend/vercel.json` - フロントエンド専用設定 ✅
  - `webapp/frontend/Dockerfile` - ローカルテスト用 ✅
  - `webapp/frontend/.dockerignore` - Docker除外設定 ✅

---

**重要**: 
1. このプロジェクトは設計段階が完了し、実装段階への移行準備が整っています
2. 新しいセッション開始時は、必ずこのCLAUDE.mdと関連ドキュメントを確認してから作業を開始してください
3. **非公式プロジェクト**であることを常に意識し、公式と誤解される表現は避けてください