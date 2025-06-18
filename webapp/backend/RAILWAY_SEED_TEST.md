# Railway 本番環境シードテスト手順

> **📋 統合ドキュメント**: 基本的なコマンド操作は [README_COMMANDS.md](./README_COMMANDS.md) を参照してください。

## 概要

本ドキュメントは、Railway本番環境でのシードスクリプト動作確認手順を説明します。

## 前提条件

- Railway CLI がインストール済み
- Railway プロジェクトにアクセス権限がある
- 本番環境のデータベース情報が設定済み

## テスト手順

### 1. Railway 環境確認

```bash
# Railway にログイン
railway login

# プロジェクト選択
railway link

# 環境変数確認
railway variables

# 必要な環境変数:
# - DATABASE_URL (PostgreSQL接続文字列)
# - REDIS_URL (Redis接続文字列)
```

### 2. ローカルでのRailway環境テスト

```bash
# Railway環境でローカル実行
railway run npm run db:seed -- --admins-only --count-admins=3

# または直接実行
railway run npx tsx src/db/seeds/index.ts --admins-only --count-admins=3
```

### 3. Railway サービス経由でのテスト

```bash
# Railwayサービスでシードスクリプトを実行
railway run --service backend npm run db:seed -- --admins-only --count-admins=3
```

### 4. データ確認

```bash
# Railway PostgreSQL に接続
railway connect postgres

# 管理者データ確認
\c mythologia_production  # 本番DB名を確認
SELECT username, email, role, is_active FROM admins ORDER BY created_at;
```

## 注意事項

### セキュリティ
- **本番環境では開発用パスワードを使用しない**
- シード実行前に必ずバックアップを取得
- 本番データがある場合は `--clear` オプションを使用しない

### 認証情報
本番環境用の安全な認証情報を設定:

```bash
# 環境変数で本番用パスワードを設定
export PRODUCTION_ADMIN_PASSWORD="your-secure-password"

# または .env.production ファイルを作成
PRODUCTION_ADMIN_PASSWORD=your-secure-password
```

### 実行権限
- Railway管理者権限が必要
- データベース書き込み権限の確認

## 期待される結果

### 成功時のログ出力
```
[INFO] 🌱 Starting seed process...
[INFO] Seeding admins...
[INFO] Created super admin: super_admin
[INFO] Created 2 additional admins
[INFO] Total admins in database: 3
[INFO] ✅ Seed completed successfully in XXXms
```

### データベース確認
```sql
  username   |         email          |    role     | is_active 
-------------+------------------------+-------------+-----------
 super_admin | super@mythologia.test  | super_admin | t
 admin_1     | admin1@mythologia.test | admin       | t
 admin_2     | admin2@mythologia.test | viewer      | t
```

## トラブルシューティング

### データベース接続エラー
```bash
# 接続テスト
railway run npx tsx src/test-connection.ts

# DATABASE_URL 確認
railway variables | grep DATABASE_URL
```

### 権限エラー
```bash
# Railway サービス状態確認
railway status

# ログ確認
railway logs
```

### メモリ不足エラー
- Railway プランのメモリ制限を確認
- 必要に応じてプランをアップグレード

## 本番運用時の推奨事項

1. **段階的実行**: 最初は小さなデータセットでテスト
2. **バックアップ**: 実行前に必ずデータベースバックアップ
3. **監視**: シード実行中のメトリクス監視
4. **検証**: 生成データの整合性確認
5. **ドキュメント**: 実行結果の記録

---

⚠️ **重要**: 本番環境でのシード実行は慎重に行い、必要に応じて開発チームと連携してください。