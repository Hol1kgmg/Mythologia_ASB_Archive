# Railway ステージ環境 管理者認証API動作確認手順

> **📋 統合ドキュメント**: 基本的なコマンド操作は [README_COMMANDS.md](./README_COMMANDS.md) を参照してください。

## 概要

本ドキュメントは、Railwayステージ環境での管理者認証API動作確認手順を説明します。

## 前提条件

- Railway CLI がインストール済み
- Railway プロジェクトにアクセス権限がある
- ステージ環境のデータベース情報が設定済み
- 管理者認証APIが正常にデプロイ済み
- ステージ環境にadminシードデータが投入済み

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

### 2. 管理者シードデータ投入

```bash
# ローカル環境でRailwayデータベースに接続してシード実行
npm run seed:railway:admins -- --count=5

# 既存データクリア後に再投入
npm run clear:railway:admins -- --force --backup
npm run seed:railway:admins -- --count=5
```

### 3. 管理者認証API動作確認

#### 環境変数設定
```bash
# ステージ環境URL設定
export STAGING_API_URL=https://mythologiaadmiralsshipbridge-stage.up.railway.app
```

#### ログインAPI確認
```bash
# Super Admin ログイン
curl -X POST $STAGING_API_URL/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://stage-mythologia-asb.vercel.app" \
  -d '{"username": "super_admin", "password": "Demo123Secure"}'

# 一般Admin ログイン（viewer権限）
curl -X POST $STAGING_API_URL/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://stage-mythologia-asb.vercel.app" \
  -d '{"username": "admin_1", "password": "Demo123Secure"}'
```

#### 認証情報取得確認
```bash
# ログインレスポンスからaccess_tokenを取得後
export ACCESS_TOKEN="your_access_token_here"

# 管理者情報取得
curl -X GET $STAGING_API_URL/api/admin/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Origin: https://stage-mythologia-asb.vercel.app"
```

#### トークンリフレッシュ確認
```bash
# ログインレスポンスからrefresh_tokenを取得後
export REFRESH_TOKEN="your_refresh_token_here"

# トークンリフレッシュ
curl -X POST $STAGING_API_URL/api/admin/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Origin: https://stage-mythologia-asb.vercel.app" \
  -d '{"refreshToken": "'$REFRESH_TOKEN'"}'
```

#### ログアウト確認
```bash
# ログアウト
curl -X POST $STAGING_API_URL/api/admin/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Origin: https://stage-mythologia-asb.vercel.app"
```

### 4. データベース確認

```bash
# Railway PostgreSQL に接続
railway connect postgres

# 管理者データ確認
SELECT username, email, role, is_active FROM admins ORDER BY created_at;

# セッションデータ確認
SELECT admin_id, expires_at, is_active FROM admin_sessions WHERE is_active = true;
```

## 注意事項

### CORS設定
- **重要**: Originヘッダー (`https://stage-mythologia-asb.vercel.app`) が必須
- CORS_ORIGINSに設定されたVercel URLからのみアクセス可能
- curlテスト時は必ずOriginヘッダーを含める

### ステージ環境認証情報
現在のステージ環境用テスト認証情報:

```bash
# 利用可能なアカウント
super_admin / Demo123Secure  (super_admin権限)
admin_1 / Demo123Secure      (viewer権限)
admin_2 / Demo123Secure      (admin権限)
admin_3 / Demo123Secure      (admin権限)
admin_4 / Demo123Secure      (admin権限)
```

⚠️ **注意**: これらは開発/ステージ環境専用の認証情報です

### 実行権限
- Railway環境での読み書き権限が必要
- .env.local にRailway DATABASE_URLが設定済みであること
- bcryptライブラリが正常にインストールされていること

## 期待される結果

### ログイン成功時のレスポンス
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin-uuid",
      "username": "super_admin",
      "email": "super@mythologia.test",
      "role": "super_admin",
      "permissions": ["*"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "refreshExpiresIn": 604800
  }
}
```

### 管理者情報取得成功時のレスポンス
```json
{
  "success": true,
  "data": {
    "id": "admin-uuid",
    "username": "super_admin",
    "email": "super@mythologia.test",
    "role": "super_admin",
    "permissions": ["*"],
    "isActive": true,
    "lastLoginAt": "2025-06-21T14:19:07.835Z"
  }
}
```

### データベース確認
```sql
  username   |         email          |    role     | is_active 
-------------+------------------------+-------------+-----------
 super_admin | super@mythologia.test  | super_admin | t
 admin_1     | admin1@mythologia.test | viewer      | t
 admin_2     | admin2@mythologia.test | admin       | t
 admin_3     | admin3@mythologia.test | admin       | t
 admin_4     | admin4@mythologia.test | admin       | t
```

## トラブルシューティング

### 404 Not Found エラー
```bash
# Originヘッダーが不足している場合
# 解決: -H "Origin: https://stage-mythologia-asb.vercel.app" を追加

# Railway環境確認
railway status
railway logs
```

### bcrypt関連エラー
```bash
# node_modules再インストール
rm -rf node_modules package-lock.json
npm install

# Railway環境での動作確認
railway run npm run seed:railway:admins
```

### 認証エラー
```bash
# 管理者データ確認
npm run clear:railway:admins

# レスポンス例:
# ❌ Invalid username or password
# → ユーザー名・パスワードを確認

# ✅ Login successful
# → 正常ログイン
```

### メモリ不足エラー
- Railway プランのメモリ制限を確認
- 必要に応じてプランをアップグレード

## ステージ環境テスト時の推奨事項

1. **段階的テスト**: 個別API → 連続フロー → 異常系テスト
2. **バックアップ**: 重要なテスト前にデータバックアップ作成
3. **監視**: Railway logsでリアルタイム動作確認
4. **検証**: レスポンス形式・セッション管理・権限制御の確認
5. **ドキュメント**: テスト結果の記録・問題点の共有

---

⚠️ **重要**: ステージ環境での認証APIテストは、本番リリース前の最終確認として位置づけ、チーム全体で結果を共有してください。