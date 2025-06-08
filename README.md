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
- **クラウドネイティブ**: Railway + Vercel による分離アーキテクチャ

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

### バックエンド
- **Railway** - バックエンドホスティング
- **PostgreSQL** - プライマリデータベース
- **Redis** - キャッシュレイヤー

### デプロイメント
- **Railway** - バックエンドAPI
- **Vercel** - フロントエンド

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
│   ├── ENVIRONMENT_VARIABLES.md    # 環境変数管理戦略
│   ├── development-milestones/      # 開発マイルストーン
│   ├── development-policy/          # 開発方針・ガイドライン
│   ├── gamewiki/                    # ゲームルール・戦略
│   └── system-design/               # システム設計
├── docker/                          # Docker設定
│   └── postgres/                    # PostgreSQL設定
│       └── init.sql                 # 初期化スクリプト
├── webapp/                          # アプリケーション実装
│   ├── shared/                     # 共有パッケージ（型定義・スキーマ）
│   ├── backend/                    # Honoバックエンド（Railway用）
│   │   ├── src/                    # TypeScriptソースコード
│   │   ├── Dockerfile              # Railway用コンテナ設定
│   │   ├── railway.toml            # Railway設定
│   │   └── .env.example            # バックエンド個人設定
│   ├── frontend/                   # Next.jsフロントエンド（Vercel用）
│   │   ├── src/                    # React + TypeScriptソースコード
│   │   ├── Dockerfile              # ローカルテスト用
│   │   ├── vercel.json             # Vercel設定
│   │   └── .env.example            # フロントエンド個人設定
│   ├── DEPLOYMENT.md               # デプロイメントガイド
│   └── test-api.sh                 # API動作確認スクリプト
├── docker-compose.yml              # 開発用データベース環境
├── railway.json                    # Railway設定（ルート用）
├── vercel.json                     # Vercel設定（ルート用）
├── DEPLOYMENT_SEPARATED.md         # 分離デプロイガイド
├── .env                            # チーム共有環境変数（コミット対象）
├── .env.local.example              # 個人設定テンプレート
├── index.html                      # Coming Soonページ
├── CLAUDE.md                       # AI開発支援設定
├── CONTRIBUTING.md                 # 開発参加ガイドライン
└── README.md                       # このファイル
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

# Railway デプロイ（GitHub自動連携）
# push時に自動実行
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


### API動作確認
```bash
# API動作テスト実行
cd webapp && ./test-api.sh

# ローカル環境テスト
cd webapp && ./test-api.sh http://localhost:8787

# デバッグエンドポイント確認
curl http://localhost:8787/debug/db-status
```

## 設定ファイル

### 分離デプロイ設定
- **Railway（バックエンド）**:
  - `railway.json` - ルート用Railway設定
  - `webapp/backend/railway.toml` - バックエンド専用設定
  - `webapp/backend/Dockerfile` - Railway用コンテナ設定
  - `webapp/backend/.env.example` - バックエンド環境変数テンプレート

- **Vercel（フロントエンド）**:
  - `vercel.json` - ルート用Vercel設定
  - `webapp/frontend/vercel.json` - フロントエンド専用設定
  - `webapp/frontend/.env.example` - フロントエンド環境変数テンプレート

### 開発環境
- `docker-compose.yml` - 開発用データベース環境（PostgreSQL + Redis）
- `webapp/frontend/Dockerfile` - ローカルテスト用コンテナ設定
- `.env` - チーム共有環境変数（コミット対象）
- `.env.local.example` - 個人設定テンプレート
- `CLAUDE.md` - AI開発支援設定

### 環境変数管理
詳細な環境変数戦略は [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) を参照してください。


## データ最小化戦略

### デッキコード圧縮
- 既存データベース構造を維持
- API応答でのみデータ最小化
- デッキコード形式による効率的なデータ転送

### キャッシュ戦略
- **Redis**: セッション・一時データ
- **長期キャッシュ**: 個別カード情報（24時間）
- **中期キャッシュ**: セット別・リーダー別カード（1時間）
- **短期キャッシュ**: 検索結果（5分）

## Docker開発環境

### 🐳 開発用データベース環境

#### 🚀 クイックスタート
```bash
# 1. リポジトリクローン
git clone <repository>
cd Mythologia_AdmiralsShipBridge

# 2. 環境変数設定
cp .env.local.example .env.local
vim .env.local  # 個人の機密情報を設定

# 3. データベース環境起動
docker-compose up -d

# 4. 依存関係インストール
cd webapp && npm install

# 5. 開発サーバー起動
npm run dev
```

#### サービス構成
```yaml
services:
  postgres:      # PostgreSQL 16
  redis:         # Redis 7  
  adminer:       # PostgreSQL管理UI
  redis-insight: # Redis管理UI
```

#### 基本コマンド
```bash
# 全サービス起動
docker-compose up -d

# データベースのみ起動
docker-compose up -d postgres redis

# ログ確認
docker-compose logs -f postgres redis

# サービス停止
docker-compose down

# データ削除（初期化）
docker-compose down -v
```

### 🔧 管理UI

#### データベース管理
- **Adminer**: http://localhost:8080
  - Server: `postgres`
  - Username: `mythologia_user`
  - Password: `mythologia_pass`
  - Database: `mythologia_dev`

#### キャッシュ管理
- **RedisInsight**: http://localhost:8001
  - Host: `redis`
  - Port: `6379`
  - Password: `mythologia_redis_pass`

### 🚀 分離デプロイ用コンテナ

#### Railway バックエンドテスト
```bash
cd webapp/backend
docker build -t mythologia-backend .
docker run -p 8787:8787 \
  --env-file .env.local \
  mythologia-backend
```

#### Vercel フロントエンドテスト
```bash
cd webapp/frontend
docker build -t mythologia-frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8787 .
docker run -p 3000:3000 mythologia-frontend

# ブラウザで http://localhost:3000 にアクセスして確認
# APIヘルスチェック機能でバックエンド接続テスト可能
```

### 🏗️ 日常開発ワークフロー
```bash
# Docker環境起動
docker-compose up -d postgres redis

# アプリケーション開発
cd webapp && npm run dev

# 管理UI確認
open http://localhost:8080    # Adminer
open http://localhost:8001    # RedisInsight
```

### 🧹 メンテナンス

#### データベースリセット
```bash
# データベース完全初期化
docker-compose down -v
docker-compose up -d postgres redis

# マイグレーション実行（今後実装予定）
npm run db:migrate
```

#### ログ・デバッグ
```bash
# サービス状態確認
docker-compose ps

# ログ確認
docker-compose logs postgres
docker-compose logs redis

# コンテナ内接続
docker-compose exec postgres psql -U mythologia_user -d mythologia_dev
docker-compose exec redis redis-cli -a mythologia_redis_pass
```

## アーキテクチャ原則

### 1. マイクロサービス分離
- バックエンドAPI（Railway）とフロントエンド（Vercel）の分離
- 各サービス専用のDocker設定
- 明確な責任境界とスケーラビリティ

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
- **デプロイメント戦略**: Railway + Vercel 分離アーキテクチャ
- **データベース設計**: PostgreSQL + Redis構成
- **API実装**: カード・リーダー・種族管理API
- **開発環境**: ローカル開発・テスト環境構築

### 🚧 進行中
- **Railway移行**: バックエンドホスティング移行作業
- **フロントエンド実装**: Next.js + React基盤構築済み
- **本番環境構築**: Railway + Vercel連携設定

### 📋 今後の予定
- Railway本番環境セットアップ
- フロントエンド機能実装
- API連携テスト・最適化

### 最新の更新内容
- **アーキテクチャ変更**: Railway + Vercel分離構成に変更
- **デプロイ戦略**: GitHub連携による自動デプロイ設定
- **データベース最適化**: PostgreSQL + Redis構成確定
- **開発環境**: 統合開発ガイド完備

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
- **分離アーキテクチャ**: バックエンド・フロントエンドの明確な分離
- **型安全性**: TypeScript strict mode使用
- **テスト実行**: コミット前に必ずテスト

## ライセンスと著作権

- このプロジェクトは非公式の有志プロジェクトです
- 「神託のメソロギア」の著作権は公式運営に帰属します
- カード画像・ゲームデータの著作権は公式運営に帰属します
- 本アプリケーションのソースコードはMITライセンスです