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

### フロントエンド
- **TypeScript** - 型安全性
- **Hono** - 軽量Webフレームワーク
- **Zod** - スキーマバリデーション

### バックエンド・データベース
- **PostgreSQL** (Vercel環境)
- **D1** (Cloudflare環境)
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
│   │   ├── roadmap.md              # 全体ロードマップ
│   │   ├── milestone-1-admin-auth.md    # 管理認証システム
│   │   ├── milestone-2-card-admin.md    # カード管理システム
│   │   └── milestone-3-deck-builder.md  # デッキ構築システム
│   ├── development-policy/          # 開発方針・ガイドライン
│   │   ├── core/                   # コア開発原則・品質基準
│   │   ├── architecture/           # アーキテクチャ・技術方針
│   │   ├── frontend/               # フロントエンド開発方針
│   │   └── operations/             # 運用・インフラ方針
│   ├── gamewiki/                    # ゲームルール・戦略
│   │   ├── overview.md             # ゲーム概要
│   │   ├── game-rules-facts.md     # 基本ルール
│   │   ├── battle-rules.md         # バトルシステム
│   │   ├── deck-building-rules.md  # デッキ構築ルール
│   │   ├── deck_format_analysis.md # デッキフォーマット分析
│   │   ├── strategy-guide.md       # 戦略ガイド
│   │   └── world-lore.md           # 世界観
│   ├── system-design/               # システム設計
│   │   ├── requirements.md         # 要件定義
│   │   ├── architecture.md         # アーキテクチャ
│   │   ├── tech-stack.md           # 技術選定
│   │   └── database-design/        # データベース設計
│   │       ├── deck/               # デッキシステム設計
│   │       └── card/               # カードシステム設計
│   └── vercel-deployment.md        # Vercelデプロイメント手順
├── CLAUDE.md                        # AI開発支援設定
└── README.md                        # このファイル
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行  
npm run test

# リント実行
npm run lint

# 型チェック
npm run typecheck
```

## 設定ファイル

- `settings.local.json` - ローカル開発設定
- `database.config.ts` - データベース設定
- `.env.local` - 環境変数
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

## 最新の更新内容

### Tribeテーブル仕様更新
- `leader`カラムを`leaderId`（INTEGER）に変更
- `thematic`カラムを追加（テーマ特性管理）
- `MasterCardId`カラムを追加（マスターカード関連）

### 動的種族管理
- 静的enumから動的データベース管理に移行
- 将来的な種族追加に対応
- リーダーとの関連性を数値IDで管理

## 貢献・開発

1. 設計ドキュメント（`system-design/`）を確認
2. Tribeテーブルの最新仕様を理解
3. プラットフォーム固有の実装は避ける
4. テストとリントを実行してからコミット

## ライセンスと著作権

- このプロジェクトは非公式の有志プロジェクトです
- 「神託のメソロギア」の著作権は公式運営に帰属します
- カード画像・ゲームデータの著作権は公式運営に帰属します
- 本アプリケーションのソースコードはMITライセンスです