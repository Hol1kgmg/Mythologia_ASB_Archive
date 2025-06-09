# Application Level認証設計

## 概要

VercelからRailwayへのAPI通信において、パブリックネットワーク経由での安全な通信を実現するための認証機構設計。

## 背景と課題

### 構成変更
- **旧構成**: Vercel (Frontend) + Cloudflare Workers (Backend)
- **新構成**: Vercel (Frontend) + Railway (Backend + DB)

### セキュリティ課題
1. **パブリックアクセス**: RailwayのAPIエンドポイントがインターネット公開
2. **認証の必要性**: 不正アクセスからAPIを保護
3. **完全性の保証**: リクエストの改ざん防止
4. **リプレイ攻撃**: 同一リクエストの再利用防止

## 認証アーキテクチャ

### 二層認証システム

```
┌─────────────┐      JWT + HMAC      ┌─────────────┐
│   Vercel    │ ──────────────────> │   Railway   │
│  (Frontend) │ <────────────────── │  (Backend)  │
└─────────────┘     検証 + レスポンス  └─────────────┘
```

### 1. JWT (JSON Web Token)
- **用途**: アプリケーション識別とセッション管理
- **ペイロード**: 
  - `iss`: 発行者（Vercel App ID）
  - `exp`: 有効期限
  - `iat`: 発行時刻
  - `jti`: トークンID（一意性保証）

### 2. HMAC署名
- **用途**: リクエスト完全性の検証
- **署名対象**:
  - HTTPメソッド
  - リクエストパス
  - タイムスタンプ
  - リクエストボディ（ハッシュ）

## 実装詳細

### 環境変数

```bash
# Vercel側
NEXT_PUBLIC_API_URL=https://api.mythologia.railway.app
JWT_SECRET=shared-secret-key
HMAC_SECRET=hmac-signing-key
APP_ID=mythologia-frontend

# Railway側
JWT_SECRET=shared-secret-key
HMAC_SECRET=hmac-signing-key
ALLOWED_APP_IDS=mythologia-frontend
```

### リクエストフロー

#### 1. トークン生成（Vercel側）

```typescript
// JWT生成
const generateJWT = () => {
  const payload = {
    iss: process.env.APP_ID,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1時間
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID()
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET);
};

// HMAC署名生成
const generateHMAC = (method: string, path: string, body?: any) => {
  const timestamp = Date.now();
  const bodyHash = body ? crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') : '';
  
  const message = `${method}:${path}:${timestamp}:${bodyHash}`;
  const signature = crypto.createHmac('sha256', process.env.HMAC_SECRET)
    .update(message)
    .digest('hex');
    
  return { signature, timestamp };
};
```

#### 2. リクエスト送信

```typescript
const apiRequest = async (method: string, path: string, body?: any) => {
  const token = generateJWT();
  const { signature, timestamp } = generateHMAC(method, path, body);
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-HMAC-Signature': signature,
      'X-Timestamp': timestamp.toString(),
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  return response;
};
```

#### 3. 認証検証（Railway側）

```typescript
// ミドルウェア実装
const authMiddleware = async (c: Context, next: Next) => {
  // JWT検証
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!process.env.ALLOWED_APP_IDS.includes(payload.iss)) {
      return c.json({ error: 'Invalid issuer' }, 401);
    }
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // HMAC検証
  const signature = c.req.header('X-HMAC-Signature');
  const timestamp = c.req.header('X-Timestamp');
  
  if (!signature || !timestamp) {
    return c.json({ error: 'Missing signature' }, 401);
  }
  
  // タイムスタンプ検証（5分以内）
  const requestTime = parseInt(timestamp);
  if (Math.abs(Date.now() - requestTime) > 300000) {
    return c.json({ error: 'Request expired' }, 401);
  }
  
  // 署名検証
  const body = await c.req.text();
  const bodyHash = body ? crypto.createHash('sha256').update(body).digest('hex') : '';
  const message = `${c.req.method}:${c.req.path}:${timestamp}:${bodyHash}`;
  const expectedSignature = crypto.createHmac('sha256', process.env.HMAC_SECRET)
    .update(message)
    .digest('hex');
    
  if (signature !== expectedSignature) {
    return c.json({ error: 'Invalid signature' }, 401);
  }
  
  await next();
};
```

## セキュリティ考慮事項

### 1. シークレット管理
- **環境変数**: 本番環境では必ず環境変数で管理
- **ローテーション**: 定期的なシークレットの更新
- **分離**: JWT用とHMAC用で異なるシークレットを使用

### 2. タイムアウト設定
- **JWT有効期限**: 1時間（更新可能）
- **リクエスト有効期限**: 5分（リプレイ攻撃防止）

### 3. エラーハンドリング
- **具体的なエラー**: 開発環境のみ
- **汎用エラー**: 本番環境（情報漏洩防止）

### 4. レート制限
```typescript
// Railway側での実装例
const rateLimiter = new Map();

const rateLimit = (key: string, limit: number = 100) => {
  const now = Date.now();
  const windowStart = now - 60000; // 1分間
  
  const requests = rateLimiter.get(key) || [];
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  recentRequests.push(now);
  rateLimiter.set(key, recentRequests);
};
```

## 実装チェックリスト

### Vercel側
- [ ] JWT生成ロジックの実装
- [ ] HMAC署名生成の実装
- [ ] APIクライアントの更新
- [ ] 環境変数の設定
- [ ] エラーハンドリングの実装
- [ ] トークン更新ロジック

### Railway側
- [ ] 認証ミドルウェアの実装
- [ ] JWT検証ロジック
- [ ] HMAC検証ロジック
- [ ] タイムスタンプ検証
- [ ] レート制限の実装
- [ ] エラーレスポンスの統一

### 運用
- [ ] シークレットの生成と配置
- [ ] 監視・アラートの設定
- [ ] ログ収集の設定
- [ ] 定期的なシークレットローテーション計画

## トラブルシューティング

### よくある問題

1. **401 Unauthorized**
   - JWT_SECRETが一致しているか確認
   - APP_IDがALLOWED_APP_IDSに含まれているか確認

2. **Invalid signature**
   - HMAC_SECRETが一致しているか確認
   - リクエストボディが改変されていないか確認
   - タイムスタンプのフォーマットが正しいか確認

3. **Request expired**
   - サーバー間の時刻同期を確認
   - ネットワーク遅延を考慮してタイムアウト値を調整

## 参考実装

完全な実装例は以下を参照：
- Frontend: `/webapp/frontend/src/lib/api-client.ts`
- Backend: `/webapp/backend/src/middleware/auth.ts`