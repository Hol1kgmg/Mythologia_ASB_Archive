# 認証テストのデバッグ・動作確認ガイド

認証テスト機能(`/api/auth-test`)をcurlなどの外部ツールでテストする方法です。

## 🚧 開発・デバッグ時の設定方法

認証テストエンドポイントは通常、ブラウザからのアクセスのみを許可していますが、開発・デバッグ時にcurl等でテストするため、以下の2つの方法で制限を解除できます。

### 方法1: 環境変数で制御（推奨）

`.env.local`ファイルに以下を追加：

```bash
# 認証テスト: curlでのテストを許可
ALLOW_CURL_AUTH_TEST=true
```

この設定により、curlやwget等のツールからもアクセス可能になります。

### 方法2: コメントアウトで制御

`src/app/api/auth-test/route.ts` の18-30行目のif文全体をコメントアウト：

```typescript
// 🚧 デバッグ用: 下記をコメントアウトしてcurlテストを許可
/*
if (!allowCurlTesting) {
  // Origin/Referer/User-Agent検証（本番用）
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent');
  
  // ブラウザからのアクセスのみ許可
  if (!origin || !userAgent || userAgent.includes('curl') || userAgent.includes('wget')) {
    return NextResponse.json(
      { error: 'Browser access only' },
      { status: 403 }
    );
  }
}
*/
```

## 🧪 curlでのテスト例

設定後、以下のコマンドで認証テストを実行できます：

```bash
# 基本的な認証テスト
curl -X POST http://localhost:3001/api/auth-test \
  -H "Content-Type: application/json"

# 期待される成功レスポンス
{
  "success": true,
  "message": "Authentication successful",
  "timestamp": "2025-07-19T14:04:41.017Z",
  "appId": "mythologia-frontend",
  "authenticated": true
}
```

## ⚠️ 重要な注意事項

1. **本番環境では無効化**
   - 本番環境では`ALLOW_CURL_AUTH_TEST`は設定しない
   - コメントアウトした場合は、コミット前に必ず元に戻す

2. **セキュリティ**
   - この設定は開発・デバッグ目的のみ
   - 一時的な使用に留める

3. **設定の確認**
   ```bash
   # 現在の設定確認
   grep ALLOW_CURL_AUTH_TEST .env.local
   ```

## 🔄 元に戻す方法

### 環境変数の場合
`.env.local`から該当行を削除または`false`に変更：

```bash
# ALLOW_CURL_AUTH_TEST=true  # ← この行を削除またはコメントアウト
```

### コメントアウトの場合
コメントアウトしたif文を元に戻す。

## 🔍 トラブルシューティング

### curlで403エラーが出る場合
- 環境変数が正しく設定されているか確認
- Next.jsの開発サーバーを再起動
- `.env.local`ファイルの場所と内容を確認

### 認証エラーが出る場合
- バックエンドサーバーが起動しているか確認
- 環境変数（JWT_SECRET、HMAC_SECRET）が設定されているか確認

```bash
# バックエンドの動作確認
curl http://localhost:8000/health
```