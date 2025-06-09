# Application Level認証 動作確認ガイド

このドキュメントは、Vercel（フロントエンド）からRailway（バックエンド）へのApplication Level認証の動作確認手順を説明します。

## 概要

JWT + HMAC署名による二重認証システムの動作を確認するための、最小限のテスト実装と確認手順です。

## 前提条件

- Vercel、Railwayの両環境がデプロイ済み
- 各環境の環境変数設定権限がある
- ローカル開発環境でのテストが可能

## 環境変数の設定

### 1. シークレットキーの生成

まず、以下のコマンドで安全なシークレットキーを生成します：

```bash
# JWT用シークレット
openssl rand -base64 32
# 例: 7Xq2R5PgNm8vJ4kL9aHbCdEfGhIjKlMn

# HMAC用シークレット
openssl rand -base64 32
# 例: 3YtUvWxZaBcDeFgHiJkLmNoPqRsTuVwX
```

### 2. Vercel側の環境変数

Vercelダッシュボード > Settings > Environment Variables で設定：

```
NEXT_PUBLIC_API_URL=https://[your-railway-app].railway.app
JWT_SECRET=7Xq2R5PgNm8vJ4kL9aHbCdEfGhIjKlMn
HMAC_SECRET=3YtUvWxZaBcDeFgHiJkLmNoPqRsTuVwX
APP_ID=mythologia-frontend
```

### 3. Railway側の環境変数

Railwayダッシュボード > Variables で設定：

```
JWT_SECRET=7Xq2R5PgNm8vJ4kL9aHbCdEfGhIjKlMn
HMAC_SECRET=3YtUvWxZaBcDeFgHiJkLmNoPqRsTuVwX
ALLOWED_APP_IDS=mythologia-frontend
```

**重要**: JWT_SECRETとHMAC_SECRETは両環境で完全に一致する必要があります。

## テスト用エンドポイントの実装

### バックエンド側（最小限の実装）

`webapp/backend/src/index.ts` に以下を追加：

```typescript
// 認証テスト用エンドポイント
app.get('/api/health/auth-test', authMiddleware, (c) => {
  return c.json({
    success: true,
    message: 'Authentication successful',
    timestamp: new Date().toISOString()
  });
});
```

### フロントエンド側（最小限の実装）

`webapp/frontend/src/app/page.tsx` に以下を追加：

```tsx
// 認証テストボタン（既存のページに追加）
<button 
  onClick={async () => {
    try {
      const res = await fetch('/api/test-auth');
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      alert('認証テスト失敗: ' + error.message);
    }
  }}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  認証テスト
</button>
```

## 動作確認手順

### 1. ローカル環境での確認

```bash
# 環境変数を設定
cd webapp/frontend
cp .env.example .env.local
# .env.localに上記の環境変数を設定

cd webapp/backend
cp .env.example .env
# .envに上記の環境変数を設定

# 両サービスを起動
npm run dev  # それぞれのディレクトリで実行
```

### 2. ステージング環境での確認

1. **デプロイ状況の確認**
   - Vercel: デプロイが成功していることを確認
   - Railway: デプロイが成功し、サービスが起動していることを確認

2. **環境変数の確認**
   - 両環境で環境変数が正しく設定されていることを再確認
   - 特にシークレットキーが一致していることを確認

3. **動作テスト**
   - Vercelのデプロイ済みURLにアクセス
   - 「認証テスト」ボタンをクリック
   - 成功時: `{"success": true, "message": "Authentication successful", ...}` が表示
   - 失敗時: エラーメッセージを確認

## トラブルシューティング

### よくあるエラーと対処法

#### 1. "401 Unauthorized" エラー
```
原因: JWT_SECRETが一致していない
対処: 両環境の環境変数を確認し、完全一致させる
```

#### 2. "Invalid signature" エラー
```
原因: HMAC_SECRETが一致していない
対処: 両環境の環境変数を確認し、完全一致させる
```

#### 3. "Request expired" エラー
```
原因: サーバー間の時刻のずれ
対処: タイムアウト許容時間を5分から10分に延長
```

#### 4. CORSエラー
```
原因: バックエンドでCORS設定が不足
対処: Railway側でVercelのドメインを許可リストに追加
```

### デバッグ用ログの確認

#### Vercel側
- Functions タブでAPI Routeのログを確認
- 送信したヘッダーとレスポンスを確認

#### Railway側
- Logsタブでアプリケーションログを確認
- 受信したリクエストと認証結果を確認

## 確認項目チェックリスト

- [ ] 環境変数が両環境で設定されている
- [ ] JWT_SECRETが完全一致している
- [ ] HMAC_SECRETが完全一致している
- [ ] APP_IDとALLOWED_APP_IDSが一致している
- [ ] テストエンドポイントが実装されている
- [ ] 認証成功のレスポンスが返ってくる
- [ ] エラー時に適切なエラーメッセージが表示される

## 次のステップ

認証が正常に動作することを確認したら：

1. 本番用のAPIエンドポイントに認証ミドルウェアを適用
2. エラーハンドリングの強化
3. レート制限の実装
4. 監視・アラートの設定

## 参考情報

- [Application Level認証設計書](../docs/development-policy/architecture/application-level-auth.md)
- [JWT公式ドキュメント](https://jwt.io/)
- [HMAC仕様](https://tools.ietf.org/html/rfc2104)