# API設計

## API設計原則

- RESTful設計に準拠
- 一貫性のある命名規則
- 適切なHTTPステータスコードの使用
- ページネーション対応
- エラーレスポンスの統一

## エンドポイント一覧

### 認証 (Authentication)

#### ユーザー登録
```
POST /api/auth/register
```
Request:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
Response: 201 Created
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "string"
}
```

#### ログイン
```
POST /api/auth/login
```
Request:
```json
{
  "email": "string",
  "password": "string"
}
```
Response: 200 OK
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "string"
}
```

#### ログアウト
```
POST /api/auth/logout
```
Headers:
```
Authorization: Bearer {token}
```
Response: 200 OK

### カード (Cards)

#### カード一覧取得
```
GET /api/cards
```
Query Parameters:
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `search`: string (カード名検索)
- `rarity`: LEGEND | GOLD | SILVER | BRONZE
- `cardType`: ATTACKER | BLOCKER | CHARGER
- `leader`: string
- `tribe`: string
- `cost`: number
- `power`: number
- `sort`: name | cost | rarity (default: name)
- `order`: asc | desc (default: asc)

Response: 200 OK
```json
{
  "cards": [
    {
      "id": "string",
      "name": "string",
      "leader": "string",
      "tribe": "string",
      "rarity": "string",
      "cardType": "string",
      "cost": "number",
      "power": "number",
      "imageUrl": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### カード詳細取得
```
GET /api/cards/:id
```
Response: 200 OK
```json
{
  "id": "string",
  "name": "string",
  "leader": "string",
  "tribe": "string",
  "rarity": "string",
  "cardNumber": "string",
  "cardType": "string",
  "cost": "number",
  "power": "number",
  "effects": [
    {
      "description": "string",
      "abilities": [
        {
          "type": "string",
          "value": "number",
          "condition": "string"
        }
      ],
      "triggers": [
        {
          "type": "string",
          "condition": "string"
        }
      ],
      "targets": [
        {
          "type": "string",
          "filter": "string"
        }
      ],
      "values": [
        {
          "key": "string",
          "value": "number | string"
        }
      ]
    }
  ],
  "flavorText": "string",
  "imageUrl": "string",
  "artist": "string",
  "releaseSet": "string"
}
```

### デッキ (Decks)

#### デッキ一覧取得
```
GET /api/decks
```
Query Parameters:
- `page`: number
- `limit`: number
- `userId`: string (特定ユーザーのデッキ)
- `isPublic`: boolean
- `includeDeleted`: boolean (管理者用)
- `sort`: createdAt | likes | views
- `order`: asc | desc

Response: 200 OK
```json
{
  "decks": [
    {
      "id": "string",
      "name": "string",
      "userId": "string",
      "username": "string",
      "cardCount": 30,
      "likes": "number",
      "views": "number",
      "createdAt": "string",
      "tags": ["string"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### デッキ詳細取得
```
GET /api/decks/:id
```
Response: 200 OK
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "userId": "string",
  "username": "string",
  "cards": [
    {
      "cardId": "string",
      "quantity": "number",
      "card": {
        "id": "string",
        "name": "string",
        "rarity": "string",
        "cardType": "string",
        "cost": "number",
        "imageUrl": "string"
      }
    }
  ],
  "stats": {
    "cardTypeDistribution": {
      "attacker": 10,
      "blocker": 10,
      "charger": 10
    },
    "costCurve": {
      "1": 5,
      "2": 8,
      "3": 7,
      "4": 6,
      "5": 4
    },
    "averageCost": 2.8
  },
  "isPublic": true,
  "likes": "number",
  "views": "number",
  "tags": ["string"],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### デッキ作成
```
POST /api/decks
```
Headers:
```
Authorization: Bearer {token}
```
Request:
```json
{
  "name": "string",
  "description": "string",
  "cards": [
    {
      "cardId": "string",
      "quantity": "number"
    }
  ],
  "isPublic": "boolean",
  "tags": ["string"]
}
```
Response: 201 Created

#### デッキ更新
```
PUT /api/decks/:id
```
Headers:
```
Authorization: Bearer {token}
```
Request: (同上)
Response: 200 OK

#### デッキ削除（論理削除）
```
DELETE /api/decks/:id
```
Headers:
```
Authorization: Bearer {token}
```
Response: 200 OK
```json
{
  "message": "デッキが削除されました",
  "deletedAt": "2024-01-01T00:00:00Z"
}
```

#### デッキ復元
```
POST /api/decks/:id/restore
```
Headers:
```
Authorization: Bearer {token}
```
Response: 200 OK
```json
{
  "message": "デッキが復元されました"
}
```

#### デッキコピー
```
POST /api/decks/:id/copy
```
Headers:
```
Authorization: Bearer {token}
```
Response: 201 Created

#### デッキいいね
```
POST /api/decks/:id/like
```
Headers:
```
Authorization: Bearer {token}
```
Response: 200 OK

```
DELETE /api/decks/:id/like
```
Headers:
```
Authorization: Bearer {token}
```
Response: 200 OK

### ユーザー (Users)

#### ユーザープロフィール取得
```
GET /api/users/:id
```
Response: 200 OK
```json
{
  "id": "string",
  "username": "string",
  "displayName": "string",
  "avatar": "string",
  "bio": "string",
  "deckCount": "number",
  "createdAt": "string"
}
```

#### ユーザーデッキ一覧
```
GET /api/users/:id/decks
```
Query Parameters: (デッキ一覧と同様)

### 統計 (Statistics)

#### 人気デッキランキング
```
GET /api/stats/popular-decks
```
Query Parameters:
- `period`: daily | weekly | monthly | all
- `limit`: number (default: 10)

#### カード使用率統計
```
GET /api/stats/card-usage
```
Query Parameters:
- `period`: daily | weekly | monthly

## エラーレスポンス

### 統一エラーフォーマット
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### HTTPステータスコード
- 200: OK
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Unprocessable Entity
- 500: Internal Server Error

## 共通ヘッダー

### リクエストヘッダー
```
Content-Type: application/json
Authorization: Bearer {token} (認証が必要なエンドポイント)
```

### レスポンスヘッダー
```
Content-Type: application/json
X-Request-ID: {uuid}
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## ページネーション

リスト系エンドポイントは統一的なページネーション形式を使用:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```