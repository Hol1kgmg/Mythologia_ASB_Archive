# Admin API Security Fix (Issue #65)

## 🚨 セキュリティ問題と修正

### 修正前の問題
- `admin-api.ts` で認証情報が `NEXT_PUBLIC_` 環境変数として露出
- ブラウザから HMAC 秘密鍵と Vercel API キーが閲覧可能
- 管理者認証システムの完全バイパスが可能

### 修正後のアーキテクチャ

```
クライアントサイド          サーバーサイド              バックエンド
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  管理画面UI     │       │  /api/admin/    │       │  管理者API      │
│                 │ ───→  │  proxy/route.ts │ ───→  │  (Railway)      │
│  認証情報なし   │       │                 │       │                 │
│                 │       │  🔒 認証情報     │       │  🔒 検証・処理   │
│                 │       │  🔒 HMAC署名     │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

## 📁 ファイル構成

### 新規作成ファイル
- `proxy/route.ts` - セキュアプロキシ（サーバーサイド認証処理）
- `../../../api/auth/admin-api-secure.ts` - セキュアクライアントAPI

### 修正ファイル
- `../../../api/auth/admin-api.ts` - DEPRECATED マーク追加
- `../../.env.example` - 環境変数設定の修正

## 🔧 使用方法

### セキュアAPI の使用（推奨）
```typescript
import { adminLogin, adminAPIFetch } from '@/api/auth/admin-api-secure';

// ログイン
const response = await adminLogin('username', 'password');

// その他のAPI呼び出し
const meResponse = await adminAPIFetch({
  method: 'GET',
  path: '/api/admin/auth/me',
  token: 'jwt-token'
});
```

### 環境変数設定
```bash
# フロントエンド (.env.local)
ADMIN_HMAC_SECRET=your-secret-key
VERCEL_API_KEY=your-vercel-key
BACKEND_API_URL=http://localhost:8000

# ❌ 使用禁止（セキュリティホール）
# NEXT_PUBLIC_ADMIN_HMAC_SECRET=xxx
# NEXT_PUBLIC_VERCEL_API_KEY=xxx
```

## 🔍 セキュリティ検証

### ブラウザでの確認方法
```javascript
// ✅ 正常（undefined が表示される）
console.log(process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET);
// → undefined

// ✅ 正常（サーバーサイド専用のため undefined）
console.log(process.env.ADMIN_HMAC_SECRET);
// → undefined
```

### テスト実行
```bash
npm test -- security-test.ts
```

## 🎯 移行ガイド

### 段階的移行
1. **Phase 1**: セキュアAPI の導入（完了）
2. **Phase 2**: 既存コードの移行
3. **Phase 3**: 古いAPI の削除

### 既存コードの移行
```typescript
// ❌ 修正前（セキュリティホール）
import { adminLogin } from '@/api/auth/admin-api';

// ✅ 修正後（セキュア）
import { adminLogin } from '@/api/auth/admin-api-secure';
```

## ⚠️ 重要な注意事項

1. **環境変数**: `NEXT_PUBLIC_` プレフィックスの付いた認証情報は使用禁止
2. **下位互換性**: セキュアAPIは既存APIと同じインターフェース
3. **デプロイ**: Vercel環境変数も `NEXT_PUBLIC_` を削除して再設定が必要

## 🔗 関連Issue・PR

- Issue #65: admin-api.ts の認証情報露出問題
- Issue #58: 管理者秘匿URL機能のセキュリティホール修正（別問題）