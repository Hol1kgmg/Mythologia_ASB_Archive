# バックエンド開発コマンドガイド

## 概要

このドキュメントは、バックエンド開発で使用するすべてのコマンドの統合ガイドです。

## 開発環境セットアップ

### Docker環境起動
```bash
# データベースのみ起動（推奨開発方法）
docker-compose up -d postgres redis

# フルスタック統合環境（新規参加者向け）
docker-compose -f docker-compose.full.yml up -d
```

### 依存関係インストール
```bash
cd webapp/backend
npm install
```

## データベース操作

### 基本操作（チーム標準：Docker使用）

#### 接続テスト
```bash
# Docker経由でDB接続テスト
npm run db:test:docker

# ローカル環境で接続テスト（高速プロトタイピング用）
npm run db:test:local
```

#### マイグレーション
```bash
# Docker経由でマイグレーション実行（推奨）
npm run db:migrate:docker

# ローカル環境でマイグレーション
npm run db:migrate:local
```

#### スキーマ同期
```bash
# Docker経由でスキーマプッシュ（推奨）
npm run db:push:docker

# ローカル環境でスキーマプッシュ
npm run db:push:local
```

## シードデータ生成

### 基本的なシード操作

#### 全データ生成
```bash
# すべてのシードデータを生成（チーム標準）
npm run db:seed:docker

# ローカル環境で実行（高速プロトタイピング用）
npm run db:seed:local
```

#### 管理者データ生成
```bash
# 管理者データのみ生成
npm run db:seed:docker -- --admins-only

# 管理者数を指定して生成
npm run db:seed:docker -- --admins-only --count-admins=5

# 既存データをクリアしてから生成
npm run db:seed:docker -- --clear --admins-only --count-admins=3
```

### 重複データ処理

シードスクリプトは既存データと共存できます：

```bash
# 既存データをスキップして新規データを追加
npm run db:seed:docker -- --admins-only --count-admins=10
# 既存5件 + 新規5件 = 10件になります

# 既存データをクリアしてから新規生成
npm run db:seed:docker -- --clear --admins-only --count-admins=5
# 既存データ削除 + 新規5件生成
```

### 生成される管理者データ

#### スーパー管理者（自動作成）
- **Username**: `super_admin`
- **Email**: `super@mythologia.test`
- **Password**: `Demo123!@#`
- **権限**: `["*"]` (全権限)

#### 一般管理者（指定数作成）
- **Username**: `admin_1`, `admin_2`, ...
- **Email**: `admin1@mythologia.test`, `admin2@mythologia.test`, ...
- **Password**: `Demo123!@#`
- **ロール**: `admin`, `viewer` をローテーション
- **権限**: ロールに応じた適切な権限

⚠️ **注意**: これらの認証情報は開発環境専用です。

## データベースクリア

### 安全な削除操作

#### 警告確認
```bash
# 警告メッセージを表示（実際は削除されない）
npm run db:clear:docker
```

#### 全データ削除
```bash
# 強制実行（実際に削除される）
npm run db:clear:docker -- --force

# バックアップ付きで削除
npm run db:clear:docker -- --force --backup
```

#### 特定テーブル削除
```bash
# 管理者テーブルのみクリア
npm run db:clear:docker -- --force --table=admins

# セッションテーブルのみクリア
npm run db:clear:docker -- --force --table=admin_sessions

# アクティビティログのみクリア
npm run db:clear:docker -- --force --table=admin_activity_logs
```

### バックアップ機能

削除前の自動バックアップ：
- **保存場所**: `./backups/backup_YYYY-MM-DDTHH-mm-ss.json`
- **形式**: JSON（全テーブルデータ含む）
- **使用方法**: `--backup` オプション付きで実行

```json
{
  "admins": [...],
  "adminSessions": [...],
  "adminActivityLogs": [...],
  "timestamp": "2025-06-17T14-19-05-409Z",
  "totalRecords": 25
}
```

## 開発サーバー

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start
```

## Railway本番環境

### Railway CLI使用
```bash
# Railway にログイン
railway login

# プロジェクト選択
railway link

# 環境変数確認
railway variables

# Railway環境でローカル実行
railway run npm run db:seed -- --admins-only --count-admins=3
```

### 本番環境注意事項
- **シード実行**: 必ずバックアップを作成
- **データクリア**: `--force`でも追加確認が必要
- **認証情報**: 開発用パスワードは使用禁止

## コマンド一覧表

### データベース操作
| コマンド | 説明 | 推奨環境 |
|---------|------|----------|
| `npm run db:test:docker` | DB接続テスト | Docker |
| `npm run db:migrate:docker` | マイグレーション実行 | Docker |
| `npm run db:push:docker` | スキーマプッシュ | Docker |
| `npm run db:test:local` | DB接続テスト | ローカル |
| `npm run db:migrate:local` | マイグレーション実行 | ローカル |
| `npm run db:push:local` | スキーマプッシュ | ローカル |

### シードデータ
| コマンド | 説明 | 推奨環境 |
|---------|------|----------|
| `npm run db:seed:docker` | シードデータ生成 | Docker |
| `npm run db:seed:local` | シードデータ生成 | ローカル |

### データクリア
| コマンド | 説明 | 推奨環境 |
|---------|------|----------|
| `npm run db:clear:docker` | データ削除 | Docker |
| `npm run db:clear:local` | データ削除 | ローカル |

### 開発サーバー
| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | 本番サーバー起動 |

## よくある操作パターン

### 開発環境初期セットアップ
```bash
# 1. Docker起動
docker-compose up -d postgres redis

# 2. 依存関係インストール
npm install

# 3. DB接続確認
npm run db:test:docker

# 4. 初期データ生成
npm run db:seed:docker -- --admins-only --count-admins=5

# 5. 開発サーバー起動
npm run dev
```

### 開発環境リセット
```bash
# 1. バックアップ付きで全削除
npm run db:clear:docker -- --force --backup

# 2. 新しいシードデータを生成
npm run db:seed:docker -- --admins-only --count-admins=5
```

### デバッグ用データ追加
```bash
# 既存データに追加管理者を作成
npm run db:seed:docker -- --admins-only --count-admins=10
```

## トラブルシューティング

### Docker関連
```bash
# Dockerサービス確認
docker-compose ps

# コンテナログ確認
docker-compose logs postgres redis

# PostgreSQL直接アクセス
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev

# Redis直接アクセス
docker exec -it mythologia-redis redis-cli -a mythologia_redis_pass
```

### 権限エラー
```bash
# 実行権限付与
chmod +x scripts/*.sh
```

### 依存関係エラー
```bash
# node_modules再構築
rm -rf node_modules package-lock.json
npm install
```

## 環境別設定

### ローカル開発環境
- **データベース**: `postgresql://mythologia_user:mythologia_pass@localhost:5432/mythologia_dev`
- **Redis**: `redis://localhost:6379`
- **設定ファイル**: `.env.local`

### Railway本番環境
- **データベース**: Railway PostgreSQL（環境変数）
- **Redis**: Railway Redis（環境変数）
- **設定**: Railway環境変数

---

⚠️ **重要**: 
- チーム開発では Docker コマンドを使用してください
- 本番環境での操作は慎重に行ってください
- 重要なデータがある場合は必ずバックアップを作成してください