/**
 * セキュリティ修正 (Issue #65, #72) のテストファイル
 * 認証情報露出防止とAPI URL露出防止の検証
 */

// テスト用のセキュリティ検証ファイル
// 実際のテスト実行時は適切なテストランナーを設定してください

/**
 * セキュリティ検証関数
 * ブラウザ開発者ツールまたはNode.js環境で実行可能
 */

export function validateSecurityFixes() {
  console.log('🔒 Issue #65, #72 セキュリティ修正の検証を開始...');

  // NEXT_PUBLIC_環境変数から認証情報・API URLが露出していないことを確認
  const exposedSecrets = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_') && 
    (key.includes('HMAC_SECRET') || key.includes('API_KEY') || key.includes('SECRET') || key.includes('API_URL'))
  );

  console.log('1. NEXT_PUBLIC_ 認証情報露出チェック:');
  if (exposedSecrets.length === 0) {
    console.log('  ✅ 認証情報の露出なし');
  } else {
    console.log('  ❌ 露出している認証情報:', exposedSecrets);
  }

  // 特に危険な環境変数の個別確認
  console.log('2. 危険な環境変数の個別チェック:');
  console.log('  - NEXT_PUBLIC_ADMIN_HMAC_SECRET:', process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET || '✅ undefined');
  console.log('  - NEXT_PUBLIC_VERCEL_API_KEY:', process.env.NEXT_PUBLIC_VERCEL_API_KEY || '✅ undefined');
  console.log('  - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || '✅ undefined (Issue #72修正)');

  // サーバーサイド専用環境変数の確認
  console.log('3. サーバーサイド専用環境変数チェック:');
  console.log('  - ADMIN_HMAC_SECRET:', process.env.ADMIN_HMAC_SECRET || '✅ undefined (クライアントから見えない)');
  console.log('  - VERCEL_API_KEY:', process.env.VERCEL_API_KEY || '✅ undefined (クライアントから見えない)');
  console.log('  - BACKEND_API_URL:', process.env.BACKEND_API_URL || '✅ undefined (サーバーサイドプロキシ専用)');

  console.log('🔒 セキュリティ検証完了');
}

/**
 * TypeScript対応のセキュリティ検証関数
 */
export function runSecurityTests() {
  console.log('🔒 セキュリティテスト実行中...');
  
  // Test 1: NEXT_PUBLIC_環境変数から認証情報が露出していないことを確認
  const exposedSecrets = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_') && 
    (key.includes('HMAC_SECRET') || key.includes('API_KEY') || key.includes('SECRET'))
  );
  
  console.log('Test 1: NEXT_PUBLIC_環境変数露出チェック');
  console.log('  結果:', exposedSecrets.length === 0 ? '✅ PASS' : '❌ FAIL');
  
  // Test 2: 特定の危険な環境変数チェック
  const dangerousVars = [
    'NEXT_PUBLIC_ADMIN_HMAC_SECRET',
    'NEXT_PUBLIC_VERCEL_API_KEY',
    'NEXT_PUBLIC_HMAC_SECRET'
  ];
  
  console.log('Test 2: 危険な環境変数個別チェック');
  dangerousVars.forEach(varName => {
    const isExposed = process.env[varName] !== undefined;
    console.log(`  ${varName}: ${isExposed ? '❌ EXPOSED' : '✅ SAFE'}`);
  });
  
  // Test 3: サーバーサイド専用環境変数がクライアントから見えないことを確認
  const serverSideVars = [
    'ADMIN_HMAC_SECRET',
    'VERCEL_API_KEY',
    'BACKEND_API_URL'
  ];
  
  console.log('Test 3: サーバーサイド専用環境変数チェック');
  serverSideVars.forEach(varName => {
    const isHidden = process.env[varName] === undefined;
    console.log(`  ${varName}: ${isHidden ? '✅ HIDDEN' : '❌ VISIBLE'}`);
  });
  
  console.log('🔒 セキュリティテスト完了');
}

/**
 * ブラウザ環境でのセキュリティテスト
 * 
 * 以下のテストはブラウザ開発者ツールで実行可能:
 * 
 * // ❌ 修正前（セキュリティホール）
 * console.log(process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET);
 * // → 秘密鍵が表示される（危険）
 * 
 * // ✅ 修正後（セキュア）
 * console.log(process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET);
 * // → undefined（安全）
 * 
 * console.log(process.env.ADMIN_HMAC_SECRET);
 * // → undefined（サーバーサイド専用のため読み取り不可）
 */