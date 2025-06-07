# 🚢 Mythologia Admiral Ship Bridge

[![PR Checks](https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/actions/workflows/pr-checks.yml)
[![Push Checks](https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/actions/workflows/push-checks.yml/badge.svg)](https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/actions/workflows/push-checks.yml)
[![Nightly Checks](https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/actions/workflows/nightly-checks.yml/badge.svg)](https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/actions/workflows/nightly-checks.yml)

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
│   │   ├── sql/                    # マイグレーションSQL
│   │   └── scripts/                # ビルド・マイグレーションスクリプト
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
cd webapp/backend && npm run dev

# PostgreSQLマイグレーション
cd webapp/backend && npm run migrate:postgresql

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
```

## 設定ファイル

- `.env.example` - 環境変数テンプレート
- `webapp/backend/.env.local` - バックエンド環境変数（gitignore対象）
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
- **デプロイメント設定**: Vercel・Cloudflare Workers両対応
- **データベース**: PostgreSQL・D1両対応のマイグレーション
- **API実装**: カード・リーダー・種族管理API
- **開発環境**: ローカル開発・テスト環境構築

### 🚧 進行中
- **フロントエンド実装**: Next.js + React基盤構築済み
- **Vercelデプロイ**: 基本設定完了、実行時エラー調査中

### 📋 今後の予定
- Vercel Status 500エラーの解決
- フロントエンド機能実装
- 本格的なデータベース運用開始

### 最新の更新内容
- **デプロイメント対応**: Issue #8完了、Vercel・Cloudflare設定実装
- **ローカル開発環境**: データベース操作ガイド完備
- **型安全性**: TypeScriptビルドエラー修正
- **Tribeテーブル仕様**: leaderId・thematic・MasterCardId追加

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