# Admin Secret URL System

管理者画面を一般ユーザーから完全に隠蔽するセキュリティシステム

## 概要

従来の予測可能な管理者URL（`/admin/*`）を排除し、推測困難な秘匿URLシステムを実装。
不正アクセスは完全に404で隠蔽され、管理画面の存在自体を秘匿します。

## 機能

### 1. 秘匿URL検証
- 環境変数による推測困難なURLパス管理
- 例: `/api/admin-x7k9m2p5w8t3q6r1/auth/login`
- 不正なURLは本物の404レスポンスを返す

### 2. 完全隠蔽システム
- ✅ ミドルウェアによる404偽装
- ✅ アクセス試行の自動ログ記録
- ✅ Bot/自動化ツール検知
- ✅ IP別異常パターン検知

### 3. 移行期間対応
- ✅ 新旧URL並行運用機能
- ✅ 手動URL変更システム
- ✅ 環境変数更新指示書の自動生成

### 4. 監視・管理機能
- ✅ アクセス統計取得API
- ✅ 緊急時アクセスURL生成
- ✅ セキュリティアラート機能

## 設定

### 環境変数

**バックエンド (.env.local):**
```bash
# 現在の秘匿パス
ADMIN_SECRET_PATH=x7k9m2p5w8t3q6r1

# 移行期間用（次期パス）
ADMIN_SECRET_PATH_NEXT=b8c4f03d5e9f2a1

# セキュリティ設定
ADMIN_SECURITY_EMAIL=admin@example.com
DISABLE_SECRET_URL=false
```

**フロントエンド (.env.local):**
```bash
# 現在の秘匿パス
NEXT_PUBLIC_ADMIN_SECRET_PATH=x7k9m2p5w8t3q6r1

# 移行期間用（次期パス）
NEXT_PUBLIC_ADMIN_SECRET_PATH_NEXT=b8c4f03d5e9f2a1

# 機能無効化（開発用）
NEXT_PUBLIC_DISABLE_SECRET_URL=false
```

### セキュリティパス要件
- **長さ**: 10-20文字
- **文字種**: 英数字のみ（a-zA-Z0-9）
- **推奨**: 16文字以上のランダム文字列

## 実装箇所

### バックエンド
- `src/infrastructure/auth/middleware/admin-secret-url.ts` - メインミドルウェア
- `src/routes/admin-auth.ts` - 認証ルートへの適用
- `src/routes/admin-monitoring.ts` - 監視・管理API

### フロントエンド
- `middleware.ts` - Next.js ミドルウェア
- 全ての `/admin-*` パスに適用

## API仕様

### 1. アクセス統計取得
```bash
GET /api/admin-x7k9m2p5w8t3q6r1/monitoring/access-stats
Authorization: Bearer <admin_token>
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "total24h": 15,
    "valid24h": 12,
    "invalid24h": 3,
    "suspiciousIPs": ["192.168.1.100"],
    "recentInvalidPaths": ["/admin/login", "/admin-test/login"]
  }
}
```

### 2. 緊急時アクセスURL生成
```bash
POST /api/admin-x7k9m2p5w8t3q6r1/monitoring/emergency-access
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "reason": "Primary admin locked out",
  "durationMinutes": 30
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "emergencyURL": "/admin-emergency1a2b3c4d5e6f7g8h/",
    "expiresAt": "2025-06-22T15:30:00.000Z",
    "durationMinutes": 30,
    "instructions": [
      "1. This URL is valid for a limited time only",
      "2. Use it only for the stated emergency reason",
      "3. Change the regular secret URL after resolving the emergency",
      "4. This access attempt will be logged"
    ]
  }
}
```

### 3. URL変更指示書生成
```bash
POST /api/admin-x7k9m2p5w8t3q6r1/monitoring/generate-migration-guide
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "newSecretPath": "n8w5r2t7k1m4p9q3x6z"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "title": "Admin Secret URL Migration Guide",
    "steps": [
      {
        "step": 1,
        "title": "Update Environment Variables",
        "backend": {
          "new": "ADMIN_SECRET_PATH_NEXT=n8w5r2t7k1m4p9q3x6z"
        }
      }
    ]
  }
}
```

## セキュリティ機能

### 1. アクセス検知
- **異常パターン**: 5分間に5回以上の無効アクセス
- **Bot検知**: 特定User-Agentパターンの検知
- **ログ記録**: 全てのアクセス試行を記録

### 2. 404偽装
```bash
# 不正アクセス例
curl https://domain.com/admin/login
# → 404 Not Found (偽装レスポンス)

curl https://domain.com/admin-invalid/login
# → 404 Not Found (偽装レスポンス)
```

### 3. 正常アクセス例
```bash
# 正しい秘匿URL
curl https://domain.com/admin-x7k9m2p5w8t3q6r1/auth/login
# → 200 OK (ログイン画面) ※適切な認証ヘッダー必要
```

## 運用手順

### 1. 初期セットアップ
```bash
# 1. 秘匿パスを生成
openssl rand -hex 8  # → 16文字のランダム文字列

# 2. 環境変数設定
ADMIN_SECRET_PATH=generated_random_string

# 3. デプロイ・テスト
curl https://domain.com/admin-generated_random_string/auth/login
```

### 2. URL変更手順
```bash
# 1. 新しい秘匿パス生成
ADMIN_SECRET_PATH_NEXT=new_random_string

# 2. デプロイ（移行期間開始）
# - 新旧両方のURLが有効

# 3. 完全移行（24-48時間後）
ADMIN_SECRET_PATH=new_random_string
unset ADMIN_SECRET_PATH_NEXT

# 4. 確認
# - 新URLのみ有効
# - 旧URLは404を返す
```

### 3. 緊急時対応
```bash
# 1. 緊急URLを生成（API経由）
POST /api/admin-{current}/monitoring/emergency-access

# 2. 緊急URLでアクセス
https://domain.com/admin-emergency{random}/

# 3. 問題解決後、通常のURL変更手順を実行
```

## テスト

### 手動テスト
```bash
# テストスクリプト実行
cd webapp/backend
npm run test:secret-url

# または手動テスト
curl -i https://domain.com/admin/login                           # → 404
curl -i https://domain.com/admin-invalid/login                   # → 404  
curl -i https://domain.com/admin-x7k9m2p5w8t3q6r1/auth/login    # → 要認証
```

### 自動テスト
```bash
# Bot検知テスト
curl -H "User-Agent: Googlebot/2.1" https://domain.com/admin/login
# → 404 + ログに警告記録

# 大量アクセステスト
for i in {1..10}; do
  curl https://domain.com/admin$i/login
done
# → 疑わしいIP検知アラート
```

## 監視

### ログ確認
```bash
# アクセス統計
GET /api/admin-{secret}/monitoring/access-stats

# 疑わしいアクセスのログ例
{
  "level": "warn",
  "message": "Suspicious admin access pattern detected",
  "ip": "192.168.1.100",
  "invalidAttempts": 5,
  "recentPaths": ["/admin/login", "/admin-test/login"]
}
```

### アラート設定
- **疑わしいアクセス**: 5回以上の無効試行
- **Bot検知**: 自動化ツールのUser-Agent
- **通知先**: `ADMIN_SECURITY_EMAIL` で設定

## 注意事項

1. **環境変数の管理**
   - 秘匿パスの漏洩防止
   - 定期的なローテーション
   - バックアップ・復旧手順の確保

2. **移行期間の管理**
   - 新旧URL並行期間は最小限に
   - 移行完了後の確認必須

3. **緊急時対応**
   - 緊急URLは短時間のみ有効
   - 使用後は必ず通常URL変更

4. **ログ容量**
   - アクセスログの定期クリーンアップ
   - Redis使用推奨（本番環境）

## 開発環境

開発時はセキュリティ機能を無効化可能：
```bash
DISABLE_SECRET_URL=true
NEXT_PUBLIC_DISABLE_SECRET_URL=true
```

ただし、本番環境テスト時は必ず有効化して確認すること。