# 管理者認証API仕様書

## 概要

このドキュメントは、管理者認証に関連するAPIエンドポイントの詳細な仕様を定義します。

## 基本情報

### ベースURL
- 開発環境: `http://localhost:8787/api/admin/auth`
- ステージング環境: `https://mythologia-api-staging.railway.app/api/admin/auth`
- 本番環境: `https://mythologia-api-production.railway.app/api/admin/auth`

### 認証方式
- Bearer Token認証（JWT）
- リフレッシュトークンによる自動更新

### 共通ヘッダー
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

### 共通エラーレスポンス
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## エンドポイント詳細

### 1. ログイン

管理者の認証を行い、アクセストークンとリフレッシュトークンを発行します。

#### エンドポイント
```
POST /api/admin/auth/login
```

#### リクエスト
```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;  // デフォルト: false
}
```

##### リクエスト例
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

#### レスポンス
```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;  // 秒単位
  admin: {
    id: string;
    username: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN";
    permissions: string[];
    lastLoginAt: string;  // ISO 8601形式
  };
}
```

##### レスポンス例
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "admin": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@example.com",
    "role": "SUPER_ADMIN",
    "permissions": ["READ", "WRITE", "DELETE", "MANAGE_ADMINS"],
    "lastLoginAt": "2024-01-01T00:00:00Z"
  }
}
```

#### エラーレスポンス
| ステータスコード | エラーコード | 説明 |
|--------------|-----------|------|
| 400 | INVALID_REQUEST | リクエストパラメータが不正 |
| 401 | INVALID_CREDENTIALS | メールアドレスまたはパスワードが間違っている |
| 423 | ACCOUNT_LOCKED | アカウントがロックされている |
| 429 | TOO_MANY_REQUESTS | ログイン試行回数が上限を超えた |

### 2. ログアウト

現在のセッションを無効化します。

#### エンドポイント
```
POST /api/admin/auth/logout
```

#### リクエスト
```typescript
interface LogoutRequest {
  refreshToken?: string;  // 指定した場合、そのトークンも無効化
}
```

#### レスポンス
```typescript
interface LogoutResponse {
  success: boolean;
  message: string;
}
```

##### レスポンス例
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### 3. トークンリフレッシュ

リフレッシュトークンを使用して新しいアクセストークンを取得します。

#### エンドポイント
```
POST /api/admin/auth/refresh
```

#### リクエスト
```typescript
interface RefreshRequest {
  refreshToken: string;
}
```

##### リクエスト例
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### レスポンス
```typescript
interface RefreshResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}
```

##### レスポンス例
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

#### エラーレスポンス
| ステータスコード | エラーコード | 説明 |
|--------------|-----------|------|
| 400 | INVALID_REQUEST | リクエストパラメータが不正 |
| 401 | INVALID_REFRESH_TOKEN | リフレッシュトークンが無効または期限切れ |
| 403 | SESSION_NOT_FOUND | セッションが存在しない |

### 4. 現在のユーザー情報取得

認証済みの管理者の情報を取得します。

#### エンドポイント
```
GET /api/admin/auth/me
```

#### リクエスト
認証ヘッダーが必要です。

#### レスポンス
```typescript
interface MeResponse {
  admin: {
    id: string;
    username: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN";
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
  };
}
```

##### レスポンス例
```json
{
  "admin": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@example.com",
    "role": "SUPER_ADMIN",
    "permissions": ["READ", "WRITE", "DELETE", "MANAGE_ADMINS"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T00:00:00Z"
  }
}
```

#### エラーレスポンス
| ステータスコード | エラーコード | 説明 |
|--------------|-----------|------|
| 401 | UNAUTHORIZED | 認証トークンが無効または期限切れ |

## JWTトークン仕様

### アクセストークン

#### ペイロード
```typescript
interface AccessTokenPayload {
  sub: string;      // 管理者ID
  email: string;
  role: string;
  permissions: string[];
  iat: number;      // 発行時刻
  exp: number;      // 有効期限
  jti: string;      // トークンID
}
```

#### 有効期限
- デフォルト: 1時間
- rememberMe=true: 24時間

### リフレッシュトークン

#### ペイロード
```typescript
interface RefreshTokenPayload {
  sub: string;      // 管理者ID
  sessionId: string;
  iat: number;
  exp: number;
  jti: string;
}
```

#### 有効期限
- デフォルト: 7日間
- rememberMe=true: 30日間

## レート制限

### ログインエンドポイント
- 1分間に5回まで
- IPアドレスベース
- 制限超過時は15分間ロック

### その他のエンドポイント
- 1分間に60回まで
- トークンベース

## セキュリティヘッダー

すべてのレスポンスに以下のセキュリティヘッダーが含まれます：

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## バリデーション規則

### メールアドレス
- 有効なメール形式
- 最大255文字

### パスワード
- 最小8文字
- 大文字・小文字・数字を含む
- 特殊文字を推奨

## 使用例

### cURL

#### ログイン
```bash
# Railway ステージ環境での動作確認
curl -X POST https://mythologiaadmiralsshipbridge-stage.up.railway.app/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://stage-mythologia-asb.vercel.app" \
  -d '{
    "username": "super_admin",
    "password": "Demo123Secure"
  }'
```

#### トークンリフレッシュ
```bash
# Railway ステージ環境での動作確認
curl -X POST https://mythologiaadmiralsshipbridge-stage.up.railway.app/api/admin/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Origin: https://stage-mythologia-asb.vercel.app" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### JavaScript (Fetch API)

#### ログイン
```javascript
const response = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'SecurePassword123!',
    rememberMe: true
  })
});

const data = await response.json();
```

#### 認証付きリクエスト
```javascript
const response = await fetch('/api/admin/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
```