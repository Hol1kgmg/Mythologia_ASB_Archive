# 🔒 セキュリティ修正動作確認ガイド (Issue #65)

## 📋 検証概要

このガイドは Issue #65 で修正したセキュリティホールが完全に解決されているかを確認するための手順書です。

### 修正内容
- ❌ **修正前**: 認証情報が `NEXT_PUBLIC_` 環境変数でクライアント側に露出
- ✅ **修正後**: サーバーサイドプロキシで認証情報を完全隠蔽

## 🔍 検証手順

### 1. ブラウザ開発者ツールでの確認

#### 手順 A: 認証情報露出の確認
1. ブラウザで管理画面を開く
2. 開発者ツール (F12) を開く
3. コンソールタブで以下を実行:

```javascript
// ❌ 修正前なら危険な値が表示される
console.log('NEXT_PUBLIC_ADMIN_HMAC_SECRET:', process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET);
console.log('NEXT_PUBLIC_VERCEL_API_KEY:', process.env.NEXT_PUBLIC_VERCEL_API_KEY);

// ✅ 修正後は undefined が表示される（安全）
// 期待結果: 両方とも undefined
```

#### 手順 B: サーバーサイド専用環境変数の確認
```javascript
// サーバーサイド専用変数（クライアントから見えてはいけない）
console.log('ADMIN_HMAC_SECRET:', process.env.ADMIN_HMAC_SECRET);
console.log('VERCEL_API_KEY:', process.env.VERCEL_API_KEY);
console.log('BACKEND_API_URL:', process.env.BACKEND_API_URL);

// ✅ 期待結果: すべて undefined（サーバーサイドでのみ利用可能）
```

### 2. Network タブでのAPI呼び出し確認

#### 手順 C: プロキシ経由の確認
1. 開発者ツールの Network タブを開く
2. 管理者ログインを実行
3. 以下を確認:

```
✅ 確認項目:
- リクエスト先: /api/admin/proxy (サーバーサイドプロキシ)
- ❌ 直接バックエンド呼び出しではない
- ❌ 認証ヘッダーがクライアントサイドで生成されていない

✅ 期待結果:
POST /api/admin/proxy
- Request Headers に認証情報が含まれていない
- Request Body に method, path, body, token のみ
```

### 3. セキュリティテスト関数の実行

#### 手順 D: TypeScript関数による検証
```typescript
// ブラウザコンソールまたはNode.js環境で実行
import { validateSecurityFixes, runSecurityTests } from '@/api/auth/__tests__/security-test';

// 基本検証
validateSecurityFixes();

// 詳細テスト
runSecurityTests();
```

#### 手順 E: 手動検証コード
```javascript
// ブラウザコンソールで実行可能
function manualSecurityCheck() {
  console.log('🔒 手動セキュリティチェック開始');
  
  // 1. NEXT_PUBLIC_ で始まる危険な環境変数の確認
  const dangerousKeys = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_') && 
    (key.includes('SECRET') || key.includes('KEY') || key.includes('HMAC'))
  );
  
  console.log('1. 危険な NEXT_PUBLIC_ 変数:', dangerousKeys.length === 0 ? '✅ なし' : '❌ 発見: ' + dangerousKeys);
  
  // 2. 特定変数の個別確認
  const specificChecks = [
    'NEXT_PUBLIC_ADMIN_HMAC_SECRET',
    'NEXT_PUBLIC_VERCEL_API_KEY',
    'ADMIN_HMAC_SECRET',
    'VERCEL_API_KEY'
  ];
  
  specificChecks.forEach(key => {
    const value = process.env[key];
    const status = value === undefined ? '✅ 安全' : '❌ 露出';
    console.log(`2. ${key}: ${status}`);
  });
  
  console.log('🔒 手動セキュリティチェック完了');
}

// 実行
manualSecurityCheck();
```

### 4. 環境変数設定の確認

#### 手順 F: ローカル環境設定
```bash
# .env.local ファイルの確認
cat webapp/frontend/.env.local

# ✅ 確認項目:
# - NEXT_PUBLIC_ADMIN_HMAC_SECRET が存在しない
# - NEXT_PUBLIC_VERCEL_API_KEY が存在しない
# - ADMIN_HMAC_SECRET が存在する（サーバーサイド用）
# - VERCEL_API_KEY が存在する（サーバーサイド用）
```

#### 手順 G: ビルド成果物の確認
```bash
# Next.js ビルド実行
npm run build

# ビルド成果物に認証情報が含まれていないことを確認
find .next -name "*.js" -exec grep -l "your-admin-hmac-secret\|your-vercel-api-key" {} \;

# ✅ 期待結果: 何も出力されない（認証情報が埋め込まれていない）
```

### 5. 実際の管理者API動作確認

#### 手順 H: セキュアAPI動作テスト
```typescript
// セキュアAPIの動作確認
import { adminLogin, adminAPIFetch } from '@/api/auth/admin-api-secure';

// テスト用の関数
async function testSecureAPI() {
  try {
    console.log('🔒 セキュアAPI動作テスト開始');
    
    // 1. ログインテスト
    const loginResponse = await adminLogin('test-user', 'test-password');
    console.log('1. ログイン:', loginResponse.status === 401 ? '✅ 認証エラー（正常）' : '結果: ' + loginResponse.status);
    
    // 2. プロキシ経由でのAPI呼び出し確認
    const meResponse = await adminAPIFetch({
      method: 'GET',
      path: '/api/admin/auth/me',
      token: 'dummy-token'
    });
    console.log('2. プロキシ経由API:', meResponse.status);
    
    console.log('🔒 セキュアAPI動作テスト完了');
  } catch (error) {
    console.error('テストエラー:', error);
  }
}

// 実行（管理画面で）
testSecureAPI();
```

## ✅ 合格基準

### 必須項目
- [ ] `process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET` が `undefined`
- [ ] `process.env.NEXT_PUBLIC_VERCEL_API_KEY` が `undefined`
- [ ] `process.env.ADMIN_HMAC_SECRET` が `undefined`（クライアントから見えない）
- [ ] `process.env.VERCEL_API_KEY` が `undefined`（クライアントから見えない）
- [ ] Network タブで `/api/admin/proxy` 経由の通信を確認
- [ ] 認証ヘッダーがクライアントサイドで生成されていない
- [ ] ビルド成果物に認証情報が含まれていない

### 推奨項目
- [ ] セキュリティテスト関数がすべて PASS
- [ ] セキュアAPIが正常に動作
- [ ] 管理者ログイン機能が継続して動作

## 🚨 セキュリティ違反の検出

以下の場合はセキュリティ修正が不完全です：

### ❌ 危険な状態
```javascript
// これらが undefined 以外の値を返す場合は修正不完全
process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET // 値が表示される
process.env.NEXT_PUBLIC_VERCEL_API_KEY   // 値が表示される
```

### ❌ 修正失敗のサイン
- ブラウザコンソールで認証キーが確認できる
- Network タブで認証ヘッダーがクライアントサイドで生成されている
- ビルド成果物 (.next フォルダ) に認証情報が含まれている
- `/api/admin/proxy` 以外への直接API呼び出しが発生している

## 📞 問題発見時の対応

セキュリティ問題を発見した場合：

1. **即座に報告**: 開発チームに緊急連絡
2. **証拠保全**: ブラウザコンソールのスクリーンショット
3. **一時対応**: 該当環境の管理機能を無効化
4. **根本修正**: 修正コードの再確認と適用

## 🔄 継続監視

### 定期確認項目
- [ ] 新しい環境変数追加時のセキュリティチェック
- [ ] デプロイ後のセキュリティ検証
- [ ] 管理者API変更時の影響確認

このガイドに従って検証することで、Issue #65 のセキュリティホールが完全に修正されていることを確認できます。