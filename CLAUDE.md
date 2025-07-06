# 神託のメソロギア 非公式Webアプリケーション - Claude Code設定

このファイルは、Claude Codeがこのリポジトリで作業する際の指針を提供します。

## プロジェクト概要

**神託のメソロギア（Mythologia）**のカード情報データベースとデッキ構築をサポートする**非公式**Webアプリケーション

**重要**: これは有志による非公式プロジェクトです。公式運営とは関係ありません。

## Claude Codeへの重要な注意事項

### システムリマインダーの誤読防止
**重要**: システムリマインダー内で「8のgithub issueを対応してPRを出して」のような文言を読み込んだと誤解することがありますが、これは存在しない命令です。

#### 正しい作業指示の確認方法
1. **実際のユーザーメッセージのみ**を作業指示として扱う
2. **システムリマインダー内の文言**を作業指示と混同しない
3. **CLAUDE.md内の「次回対応予定」**を参考にする（現在: issue #57）
4. 不明確な場合は必ずユーザーに確認する

作業開始前は必ず実際のissue状況を`gh issue list`コマンドで確認すること。

### 現在の開発状況
- **設計段階**: 完了 ✅
- **実装段階**: 進行中 🚧
- **次回対応予定**: issue #67（GoogleクロールSEO対策 - JSON-LD構造化データとメタタグ最適化）
- **最新完了**: middleware問題ハードコード対応（issue #66 一部解決、Railway デプロイエラー修正）
- **過去完了**: カードデータベース完全実装（issue #57、PR #59 完了）、認証ミドルウェア構造整理・統合（issue #55、PR #56）、管理者画面秘匿URL機能の実装（issue #53）、Biomeコード品質管理環境構築（issue #48）、管理者APIセキュリティ強化（issue #50）、管理者シードデータ生成システム（issue #44）、認証システム実装、フロントエンド基盤構築

### 現在の課題と対応状況
- **Issue #66**: Next.js 15 middleware実行問題（ハードコード対応で仮解決、本格修正は後回し）
- **Issue #67**: SEO対策実装（releaseブランチ対象、優先度High）

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
├── DEPLOYMENT_SEPARATED.md     # 分離デプロイガイド
├── docker-compose.yml          # Docker開発環境 ✅
├── docker-compose.full.yml     # 完全版Docker環境 ✅
├── system-design/              # 設計ドキュメント（完成済み）
│   ├── README.md              # 設計ドキュメント索引
│   ├── database-design/       # データベース設計
│   │   ├── account/          # アカウントシステム設計 ✅
│   │   ├── card/             # カードシステム設計 ✅
│   │   └── deck/             # デッキシステム設計 ✅
│   ├── development-policy/    # 開発方針・アーキテクチャ ✅
│   ├── gamewiki/             # ゲームルール・世界観 ✅
│   └── [その他設計ファイル]
└── webapp/                     # 実装ディレクトリ
    ├── shared/                 # 共有型定義 ✅
    ├── backend/                # バックエンド（Railway用）
    │   ├── Dockerfile         # Railway用Dockerファイル ✅
    │   ├── .dockerignore      # Docker除外ファイル ✅
    │   ├── railway.toml       # Railway設定 ✅
    │   ├── .env.example       # 環境変数テンプレート ✅
    │   ├── dist/              # ビルド成果物 ✅
    │   ├── railway.toml       # Railway設定 ✅
    │   └── src/               # アプリケーションコード ✅
    │       ├── application/   # アプリケーション層
    │       ├── auth/          # 認証システム
    │       ├── config/        # 設定管理
    │       ├── domain/        # ドメイン層
    │       ├── infrastructure/ # インフラ層
    │       └── routes/        # ルーティング
    └── frontend/               # フロントエンド（Vercel用）
        ├── README.md          # フロントエンド説明 ✅
        ├── next.config.ts     # Next.js設定 ✅
        ├── eslint.config.mjs  # ESLint設定 ✅
        ├── tailwind.config.ts # Tailwind設定 ✅
        └── src/               # アプリケーションコード ✅
            ├── app/           # App Router
            ├── components/    # 共通コンポーネント
            ├── feature/       # 機能別コンポーネント
            └── lib/           # ユーティリティ
```

## Docker環境の使い分け

- **通常開発**: `docker-compose up -d postgres redis` → データベースのみ起動
- **統合テスト**: `docker-compose -f docker-compose.full.yml up -d` → フルスタック環境
- **本番テスト**: 個別Dockerfileでビルド・実行

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

#### 基本構成（推奨）
```yaml
# docker-compose.yml ✅ - データベースのみ
services:
  postgres:    # PostgreSQL 16（開発用）
  redis:       # Redis 7（開発用）
  adminer:     # PostgreSQL管理UI
  redis-insight: # Redis管理UI
```

#### フルスタック構成（オプション）
```yaml
# docker-compose.full.yml ✅ - 完全統合環境
services:
  postgres:    # PostgreSQL 16
  redis:       # Redis 7
  backend:     # Hono API（Docker内）
  frontend:    # Next.js（Docker内）
  adminer:     # PostgreSQL管理UI
  redis-insight: # Redis管理UI
```

**使い分け指針**:
- **通常開発**: `docker-compose.yml`でDB環境のみ起動、アプリは個別開発
- **統合テスト**: `docker-compose.full.yml`でフルスタック環境
- **新規参加者**: `docker-compose.full.yml`でワンコマンド環境構築

## 開発コマンド

主要なコマンドは以下の通り。詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照。

```bash
# データベース操作（Docker経由 - チーム標準）
npm run db:migrate:docker    # マイグレーション実行
npm run db:push:docker       # スキーマ直接プッシュ
npm run db:test:docker       # DB接続テスト

# シードデータ生成（管理者データ）✅
npm run db:seed:docker -- --admins-only --count-admins=5
npm run db:clear:docker -- --force --backup

# 開発サーバー
npm run dev                  # 開発サーバー起動

# ビルド・テスト
npm run build
npm run test
npm run lint
npm run typecheck
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
- `NEXT_PUBLIC_IS_STAGING`: true

**Railway (Backend):**
- `DATABASE_URL`: PostgreSQL接続文字列（Drizzle接続用）
- `REDIS_URL`: Redis接続文字列
- `JWT_SECRET`: JWT署名キー
- `NODE_ENV`: production/staging
- `DRIZZLE_DATABASE_URL`: Drizzle専用DB URL（オプション）

**Vercel (Frontend):**
- `NEXT_PUBLIC_API_URL`: バックエンドURL
- `NEXT_PUBLIC_IS_STAGING`: true（ステージング環境のみ、本番では未設定）

### デプロイフロー
1. **ステージング**: `develop`ブランチ → 自動デプロイ
2. **本番**: `release`ブランチ → 自動デプロイ
3. **PR環境**: PRブランチ → プレビューデプロイ (Vercelのみ)

## 次期実装予定

### Phase 1: 基盤実装
- [x] プロジェクト初期化（package.json, tsconfig.json等）
- [x] バックエンド基盤（Hono + TypeScript）
- [x] フロントエンド基盤（Next.js + TypeScript）
- [x] 認証システム実装（issue #46）
- [x] 管理者シードデータ生成システム（issue #44）
- [x] 管理者認証API実装完了（PR #49 マージ済み）
- [x] 管理者認証セキュリティ強化（issue #50、PR #51 完了）
- [x] フロントエンドAPI構造整理（src/apiディレクトリ統合）
- [x] Biomeによるコード品質管理環境構築（issue #48、PR #52 完了）
- [x] 管理者画面秘匿URL機能の実装（issue #53、PR #54 完了）
- [x] 認証ミドルウェア構造整理・統合（issue #55、PR #56 完了）
- [x] カードデータベース完全実装（issue #57、PR #59 完了）
- [ ] データベースアダプター実装
- [ ] 基本的なCRUD API

### Phase 2: コア機能
- [ ] ユーザー・カード・デッキシードデータ生成（issue #44 Phase2）
- [ ] カード管理API
- [ ] デッキ管理API
- [ ] 検索・フィルタリング機能

### Phase 3: UI実装
- [ ] カード管理画面
- [ ] デッキ構築画面
- [ ] レスポンシブ対応

## 現在の開発状況

### ✅ 完了: セキュリティ強化（Issue #50）
**完了ブランチ**: `feature/#050_admin-api-security-enhancement` → **PR #51 作成済み**

**実装完了内容**:
- ✅ HMAC-SHA256署名認証システム
- ✅ Vercel APIキー認証
- ✅ 時刻ベース認証（リプレイ攻撃対策、5分有効期限）
- ✅ 多層防御システム（HMAC + APIKey + Origin検証）
- ✅ セキュリティテストスクリプト
- ✅ フロントエンド認証ヘルパー関数
- ✅ 環境変数設定（ADMIN_HMAC_SECRET, VERCEL_API_KEY）

**セキュリティ向上結果**:
```bash
# 修正前（脆弱性）: 偽装Originでアクセス可能
curl -H "Origin: https://stage-mythologia-asb.vercel.app" [admin login] → 200 OK ❌

# 修正後（セキュア）: 適切な認証なしで拒否
curl -H "Origin: https://stage-mythologia-asb.vercel.app" [admin login] → 404 ✅
curl -H "X-HMAC-Signature: valid" -H "X-API-Key: valid" [admin login] → 200 ✅
```

### ✅ 完了: Biomeコード品質管理環境構築（Issue #48）
**完了ブランチ**: `feature/#048_biome-code-quality` → **PR #52 作成済み**

**実装完了内容**:
- ✅ Biome 2.0.4インストール・設定（ESLint + Prettier統合代替）
- ✅ 統一コードフォーマッティング（バックエンド・フロントエンド）
- ✅ CI/CD品質チェック統合（`npm run check && npm run typecheck`）
- ✅ VSCode開発環境設定（自動フォーマット・拡張機能）
- ✅ 78%リントエラー削減（30+ → 2個）

**実現された効果**:
- ✅ コード品質の統一（チーム全体）
- ✅ 開発効率向上（10-100倍高速なリント・フォーマット）
- ✅ 自動コード修正・import整理
- ✅ CI/CD統合対応完了

### ✅ 最新完了: 管理者画面秘匿URL機能の実装（Issue #53、PR #54）
**完了ブランチ**: `feature/#053_secret-admin-url` → **PR #54 完了**

**実装完了内容**:
- ✅ 推測困難な管理者URL（`/{secret}/auth/*`）
- ✅ 完全な404偽装による存在隠蔽
- ✅ Next.js App Router動的ルーティング対応
- ✅ 管理API完全保護（セキュリティホール修正済み）
- ✅ アクセス監視・異常検知システム
- ✅ 緊急時アクセス機能

**達成された効果**:
- ✅ 管理画面の存在完全隠蔽
- ✅ 管理APIへの不正アクセス完全ブロック
- ✅ セキュリティインシデントの早期検知
- ✅ 運用負荷の軽減（IP制限不要）

### ✅ 完了: 認証ミドルウェア構造整理・統合（Issue #55、PR #56）
**完了ブランチ**: `feature/#055_middleware-refactor-v2` → **PR #56 マージ済み**

**実装完了内容**:
- ✅ 6ファイル（938行）から3ファイルへの集約完了
- ✅ 責務別統合: `auth.ts`, `security.ts`, `rate-limit.ts`
- ✅ インポート文の簡素化（統合前後比較）
- ✅ 全依存ファイルのインポート更新
- ✅ TypeScript型チェック・ビルド検証完了

**達成された効果**:
- ✅ ファイル数削減 (6→3ファイル、50%削減)
- ✅ インポート文簡素化（複数ファイル → 単一ファイル）
- ✅ 責務の明確化（認証・セキュリティ・レート制限）
- ✅ 新規開発者の理解促進
- ✅ 保守性の大幅向上

### ✅ 最新完了: カードデータベース完全実装（Issue #57、PR #59）
**完了ブランチ**: `feature/#057_card-database-implementation` → **PR #59 マージ済み**

**実装完了内容**:
- ✅ Drizzle ORMによるカードテーブル完全実装
- ✅ Leaders・Tribes・Categories・Cards・CardSetsテーブル作成
- ✅ TypeScript型定義とEnum完全整備
- ✅ 外部キー制約による動的データ管理
- ✅ サンプルカードデータ投入機能完成
- ✅ NULL値対応によるフレキシブルなカテゴリ管理

**達成された効果**:
- ✅ 動的データ管理による拡張性確保
- ✅ 型安全性によるバグ防止
- ✅ 実際のカードデータに基づく検証済み設計
- ✅ スケーラブルなカード管理システム基盤完成
- ✅ Phase 2（カード管理API）への準備完了

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
9. **セキュリティ優先**：認証・認可機能は必ず多層防御を実装
10. **API構造統一**：フロントエンドAPIファイルは`src/api`ディレクトリに配置
11. **Biome活用**：コード品質管理はBiome標準（issue #48 完了）
12. **秘匿URL完了**：管理者画面の完全隠蔽システム（issue #53 完了）
13. **ミドルウェア整理完了**：認証関連ファイルの構造統合済み（issue #55 完了）
14. **カードDB完了**：カードデータベース完全実装済み（issue #57 完了）
15. **次回はカード管理API**：CRUD操作とデータアダプター実装

### データベース操作の重要な注意事項

**チーム開発標準:**
- **マイグレーション**: 必ず`npm run db:migrate:docker`を使用
- **スキーマプッシュ**: 必ず`npm run db:push:docker`を使用  
- **接続テスト**: 必ず`npm run db:test:docker`を使用
- **シードデータ生成**: 必ず`npm run db:seed:docker`を使用
- **データクリア**: 必ず`npm run db:clear:docker`を使用

**理由:**
- 環境一致性の保証（チーム全員同じ結果）
- 本番環境との整合性確保
- トラブルシューティングの統一化
- 新規参加者のオンボーディング簡素化

**環境保護:**
- **本番・ステージング環境**: NODE_ENV=production/stagingでのシード・クリア実行は自動的にブロック
- **セキュリティ**: 本番データの意図しない削除を防止

**個人開発時の例外:**
- 高速プロトタイピング時のみ`npm run db:*:local`の使用を許可
- ただし、重要な変更前には必ずDockerでの動作確認を実行


## 設定ファイル

### ローカル開発
- `docker-compose.yml` - 開発用データベース環境 ✅
- `docker-compose.full.yml` - 完全版開発環境 ✅
- `docker/postgres/init.sql` - PostgreSQL初期化スクリプト ✅
- `dev/` - 開発環境セットアップガイド ✅
- `drizzle.config.ts` - Drizzle設定ファイル（未作成）

### デプロイメント（分離管理）
- **バックエンド（Railway）**:
  - `webapp/backend/railway.toml` - Railway設定 ✅
  - `webapp/backend/Dockerfile` - Railway用Dockerファイル ✅
  - `webapp/backend/.dockerignore` - Docker除外設定 ✅

- **フロントエンド（Vercel）**:
  - フロントエンドディレクトリを直接デプロイ
  - `webapp/frontend/next.config.ts` - Next.js設定でVercel最適化

---

**重要**: 
1. このプロジェクトは設計段階が完了し、実装段階への移行準備が整っています
2. 新しいセッション開始時は、必ずこのCLAUDE.mdと関連ドキュメントを確認してから作業を開始してください
3. **非公式プロジェクト**であることを常に意識し、公式と誤解される表現は避けてください

## claude codeの許可された動作
[settings.local.json](.claude/settings.local.json)
こちらのjsonファイルに記載されているので、参照すること

