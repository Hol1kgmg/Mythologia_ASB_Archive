# Railway環境でのマイグレーション実行ガイド

## 概要

Railway環境のデータベースに対してマイグレーションを実行する際の詳細手順を説明します。
ローカル環境から Railway のデータベースに接続してマイグレーションを実行する方法を解説します。

## 前提条件

- Railway CLI がインストール済み
- Railway プロジェクトにリンク済み（`railway link`実行済み）
- Node.js環境が設定済み
- `webapp/backend`ディレクトリで作業

## 方法1: 環境変数の一時設定（推奨）

### 手順

#### 1. Railway DATABASE_URLの取得

```bash
# Railway環境変数を確認
railway variables | grep DATABASE_URL

# または Railway ダッシュボードから確認
# https://railway.app にアクセスして対象プロジェクトの Variables タブを確認
```

#### 2. 環境変数の設定

```bash
# DATABASE_URLを環境変数にエクスポート
export DATABASE_URL="postgresql://postgres:xxxxx@xxxxx.railway.app:5432/railway"

# 設定確認
echo $DATABASE_URL
```

#### 3. マイグレーション実行

```bash
# マイグレーション実行
npm run db:migrate

# 期待される出力：
# 🚀 Starting migration...
# ✅ Migration completed successfully!
```

#### 4. 環境変数のクリア（重要！）

```bash
# 環境変数を削除
unset DATABASE_URL

# クリア確認（何も表示されないことを確認）
echo $DATABASE_URL
```

### 注意事項

- **セッション限定**: `export`で設定した環境変数は現在のターミナルセッションでのみ有効
- **必須クリア**: 作業後は必ず`unset`でクリアする
- **自動リセット**: 新しいターミナルウィンドウでは自動的にリセットされる

## 方法2: Railway Shell使用

### 手順

```bash
# 1. Railway Shellに入る
railway shell

# 2. Shell内で環境変数確認（自動的にRailway環境変数が設定される）
echo $DATABASE_URL

# 3. マイグレーション実行
npm run db:migrate

# 4. Shellから出る
exit
```

### メリット
- `.env.local`を編集する必要がない
- 環境変数の手動設定が不要
- Railway環境の全ての環境変数が利用可能

## 方法3: .env.localファイルの一時編集

### 手順

```bash
# 1. .env.localをバックアップ
cp .env.local .env.local.backup

# 2. .env.localを編集
# DATABASE_URLをRailwayの値に書き換え
# 例：
# DATABASE_URL=postgresql://postgres:xxxxx@xxxxx.railway.app:5432/railway

# 3. マイグレーション実行
npm run db:migrate

# 4. .env.localを元に戻す
mv .env.local.backup .env.local
```

### デメリット
- ファイル編集の手間がかかる
- 誤ってコミットする危険性がある
- 元に戻し忘れのリスク

## トラブルシューティング

### エラー: "getaddrinfo ENOTFOUND postgres.railway.internal"

**原因**: Railway内部ホスト名を使用している
**解決**: 外部アクセス可能なURLを使用する（xxxx.railway.app形式）

### エラー: "permission denied for schema drizzle"

**原因**: データベースユーザーに権限がない
**解決**: Railway ダッシュボードでデータベースを再作成するか、管理者権限で実行

### エラー: "relation already exists"

**原因**: 既にテーブルが存在する
**解決**: 
```bash
# マイグレーション履歴を確認
SELECT * FROM drizzle.__drizzle_migrations;
```

## ベストプラクティス

### 1. 開発フロー

```bash
# ローカル開発
npm run db:migrate  # ローカルDBに適用

# Railway環境
export DATABASE_URL="railway_url"
npm run db:migrate
unset DATABASE_URL
```

### 2. チーム開発

- Railway URLは機密情報として扱う
- 環境変数は一時的な使用に留める
- 作業後は必ずクリアする

### 3. CI/CD統合

Railway の自動デプロイ時にマイグレーションを実行する場合：

```toml
# railway.toml
[deploy]
startCommand = "npm run db:migrate && npm start"
```

## セキュリティ注意事項

1. **DATABASE_URLの取り扱い**
   - パスワードを含むため、ログに残さない
   - スクリプトにハードコードしない
   - 共有端末では必ずクリアする

2. **アクセス制御**
   - Railway ダッシュボードへのアクセスを制限
   - 環境変数へのアクセス権限を最小限に

3. **監査**
   - マイグレーション実行履歴を記録
   - 誰がいつ実行したかを追跡可能に

## まとめ

Railway環境でのマイグレーション実行は、環境変数の一時設定（方法1）が最も推奨されます。
作業後は必ず環境変数をクリアし、ローカル環境に影響を与えないよう注意してください。