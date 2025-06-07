# 神託のメソロギア 非公式Webアプリケーション - Claude Code設定

このファイルは、Claude Codeがこのリポジトリで作業する際の指針を提供します。

## プロジェクト概要

**神託のメソロギア（Mythologia）**のカード情報データベースとデッキ構築をサポートする**非公式**Webアプリケーション

**重要**: これは有志による非公式プロジェクトです。公式運営とは関係ありません。

### 現在の開発状況
- **設計段階**: 完了 ✅
- **実装段階**: 未開始 📋
- **最新更新**: Leadersテーブル追加完了、リーダー情報のデータベース管理対応

## 技術スタック

### コア技術
- **TypeScript** - 型安全性重視
- **Hono** - 軽量Webフレームワーク
- **Zod** - ランタイムバリデーション

### データベース・インフラ
- **PostgreSQL** (Railway提供)
- **Redis** (Railway提供 - キャッシュ・セッション管理)

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

### 重要なID体系
- **リーダーID**: 1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE
- **レアリティID**: 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
- **カードタイプID**: 1:ATTACKER, 2:BLOCKER, 3:CHARGER

### 動的データ管理
- **リーダー管理**: 静的enumからleadersテーブルへ移行完了 ✅
- **種族管理**: 静的enumから動的データベース管理に移行済み
- `TribeDomain`インターフェース実装済み
- リーダーと種族の関連性を外部キーで管理

## プロジェクト構造

```
/
├── README.md                    # プロジェクト概要
├── CLAUDE.md                   # このファイル
├── system-design/              # 設計ドキュメント（完成済み）
│   ├── README.md              # 設計ドキュメント索引
│   ├── database-design/       # データベース設計
│   │   ├── card/             # カードシステム設計 ✅
│   │   └── deck/             # デッキシステム設計 ✅
│   └── [その他設計ファイル]
└── [実装予定ディレクトリ]
```

## 開発コマンド（実装後）

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# リント・型チェック
npm run lint
npm run typecheck
```

## 設計原則・開発方針

### 1. 環境分離とデプロイメント戦略
- **本番・ステージ環境**: Railway + Vercel構成
- **データベース統一**: PostgreSQL（本番・ステージ共通）
- **環境変数管理**: Railway/Vercelの環境設定で分離

### 2. ドメイン駆動設計
- **ビジネスロジック分離**: 純粋なドメインモデル
- **動的データ管理**: 拡張性を重視した種族システム
- **型安全性**: TypeScript + Zodによる厳密な型管理

### 3. データ最小化戦略
- **既存構造維持**: データベーステーブルはそのまま
- **API最適化**: レスポンスサイズの最小化
- **効率的キャッシュ**: 階層的キャッシュ戦略

## 重要なドキュメント参照順序

新規開発・理解時の推奨読み順：

1. **README.md** - プロジェクト全体概要
2. **system-design/README.md** - 設計ドキュメント索引
3. **system-design/database-design/card/card-domain-model.md** - カードビジネスルール
4. **system-design/database-design/card/card-database-design.md** - データベース構造
5. **system-design/database-design/deck/deck-minimal-crud.md** - デッキ機能仕様

## 開発時の注意事項

### データベース関連
- **Leadersテーブル**: 動的管理（静的enumから移行済み）
- **Tribesテーブル**: 動的管理（静的enumは使用しない）
- 外部キー制約を適切に設定
- PostgreSQL/D1両対応のSQL記述

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
本番環境:
├── Frontend: Vercel (mythologia-production.vercel.app)
├── Backend: Railway (mythologia-api-production.railway.app)
├── Database: Railway PostgreSQL (Production DB)
└── Cache: Railway Redis (Production Cache)

ステージ環境:
├── Frontend: Vercel (mythologia-staging.vercel.app)
├── Backend: Railway (mythologia-api-staging.railway.app)
├── Database: Railway PostgreSQL (Staging DB)
└── Cache: Railway Redis (Staging Cache)
```

### 環境変数管理
**Railway (Backend):**
- `DATABASE_URL`: PostgreSQL接続文字列
- `REDIS_URL`: Redis接続文字列
- `JWT_SECRET`: JWT署名キー
- `NODE_ENV`: production/staging

**Vercel (Frontend):**
- `NEXT_PUBLIC_API_URL`: バックエンドURL
- `NEXT_PUBLIC_ENVIRONMENT`: production/staging

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
2. **Railway + Vercel構成**に最適化された実装
3. **PostgreSQL単一DB**での設計（D1/SQLiteサポートは廃止）
4. **環境分離**を意識した設定管理
5. **型安全性**を最優先にしたコード記述
6. **動的データ管理**の原則に従う（リーダー・種族の静的enumは使用禁止）

## 設定ファイル

- `.env.local` - ローカル開発環境変数（未作成）
- `railway.toml` - Railway設定（未作成）
- `vercel.json` - Vercel設定（未作成）

---

**重要**: 
1. このプロジェクトは設計段階が完了し、実装段階への移行準備が整っています
2. 新しいセッション開始時は、必ずこのCLAUDE.mdと関連ドキュメントを確認してから作業を開始してください
3. **非公式プロジェクト**であることを常に意識し、公式と誤解される表現は避けてください