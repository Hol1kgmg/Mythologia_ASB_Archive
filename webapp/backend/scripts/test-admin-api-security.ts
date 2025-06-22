#!/usr/bin/env tsx
/**
 * 管理者API認証強化テストスクリプト
 * Issue #50 対応: CORS偽装対策とセキュリティレイヤーのテスト
 */

import { generateHMACSignature } from '../src/infrastructure/auth/utils/hmac.js';

interface TestCase {
  name: string;
  description: string;
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: string;
  };
  expectedStatus: number;
  expectedResponse?: string;
}

// テスト設定
const API_URL = process.env.API_URL || 'http://localhost:8000';
const VALID_ORIGIN = process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3000';
const INVALID_ORIGIN = 'https://malicious-site.com';
const ADMIN_HMAC_SECRET = process.env.ADMIN_HMAC_SECRET || 'test-admin-hmac-secret';
const VERCEL_API_KEY = process.env.VERCEL_API_KEY || 'test-vercel-api-key';

async function generateTestHMAC(
  method: string,
  path: string,
  body?: string
): Promise<{ signature: string; timestamp: string }> {
  const timestamp = Date.now().toString();
  const signature = generateHMACSignature(method, path, timestamp, body, ADMIN_HMAC_SECRET);
  return { signature, timestamp };
}

const testCases: TestCase[] = [
  // 1. 攻撃テスト: 偽装Origin + HMAC/APIキーなし
  {
    name: 'attack_fake_origin_no_auth',
    description: '偽装Origin + 認証情報なし（攻撃パターン）',
    request: {
      method: 'POST',
      path: '/api/admin/auth/login',
      headers: {
        'Content-Type': 'application/json',
        Origin: INVALID_ORIGIN,
      },
      body: JSON.stringify({ username: 'super_admin', password: 'Demo123Secure' }),
    },
    expectedStatus: 404, // セキュリティ上の理由で404を返す
  },

  // 2. 攻撃テスト: 正しいOrigin + HMAC/APIキーなし
  {
    name: 'attack_valid_origin_no_auth',
    description: '正しいOrigin + 認証情報なし（攻撃パターン）',
    request: {
      method: 'POST',
      path: '/api/admin/auth/login',
      headers: {
        'Content-Type': 'application/json',
        Origin: VALID_ORIGIN,
      },
      body: JSON.stringify({ username: 'super_admin', password: 'Demo123Secure' }),
    },
    expectedStatus: 404,
  },

  // 3. 攻撃テスト: APIキーのみ（HMACなし）
  {
    name: 'attack_api_key_only',
    description: 'APIキーのみでHMACなし（攻撃パターン）',
    request: {
      method: 'POST',
      path: '/api/admin/auth/login',
      headers: {
        'Content-Type': 'application/json',
        Origin: VALID_ORIGIN,
        'X-API-Key': VERCEL_API_KEY,
      },
      body: JSON.stringify({ username: 'super_admin', password: 'Demo123Secure' }),
    },
    expectedStatus: 404,
  },

  // 4. 攻撃テスト: HMACのみ（APIキーなし）
  {
    name: 'attack_hmac_only',
    description: 'HMACのみでAPIキーなし（攻撃パターン）',
    request: {
      method: 'POST',
      path: '/api/admin/auth/login',
      headers: {
        'Content-Type': 'application/json',
        Origin: VALID_ORIGIN,
        // HMAC署名は実行時に生成される
      },
      body: JSON.stringify({ username: 'super_admin', password: 'Demo123Secure' }),
    },
    expectedStatus: 404,
  },

  // 5. 攻撃テスト: 無効なHMAC署名
  {
    name: 'attack_invalid_hmac',
    description: '無効なHMAC署名（攻撃パターン）',
    request: {
      method: 'POST',
      path: '/api/admin/auth/login',
      headers: {
        'Content-Type': 'application/json',
        Origin: VALID_ORIGIN,
        'X-API-Key': VERCEL_API_KEY,
        'X-HMAC-Signature': 'invalid-signature',
        'X-Timestamp': Date.now().toString(),
      },
      body: JSON.stringify({ username: 'super_admin', password: 'Demo123Secure' }),
    },
    expectedStatus: 404,
  },

  // 6. 攻撃テスト: 期限切れタイムスタンプ
  {
    name: 'attack_expired_timestamp',
    description: '期限切れタイムスタンプ（攻撃パターン）',
    request: {
      method: 'POST',
      path: '/api/admin/auth/login',
      headers: {
        'Content-Type': 'application/json',
        Origin: VALID_ORIGIN,
        'X-API-Key': VERCEL_API_KEY,
        'X-Timestamp': (Date.now() - 600000).toString(), // 10分前
        // HMAC署名は実行時に生成される
      },
      body: JSON.stringify({ username: 'super_admin', password: 'Demo123Secure' }),
    },
    expectedStatus: 404,
  },

  // 7. 正常テスト: 完全な認証情報
  {
    name: 'success_full_auth',
    description: '完全な認証情報（成功パターン）',
    request: {
      method: 'POST',
      path: '/api/admin/auth/login',
      headers: {
        'Content-Type': 'application/json',
        Origin: VALID_ORIGIN,
        'X-API-Key': VERCEL_API_KEY,
        // HMAC署名とタイムスタンプは実行時に生成される
      },
      body: JSON.stringify({ username: 'super_admin', password: 'Demo123Secure' }),
    },
    expectedStatus: 200, // ログイン成功を期待
  },
];

async function runTest(testCase: TestCase): Promise<boolean> {
  console.log(`\n🧪 テスト: ${testCase.name}`);
  console.log(`   ${testCase.description}`);

  try {
    // HMAC署名が必要な場合は生成
    if (testCase.name.includes('hmac_only') || testCase.name.includes('success_')) {
      const { signature, timestamp } = await generateTestHMAC(
        testCase.request.method,
        testCase.request.path,
        testCase.request.body
      );
      testCase.request.headers['X-HMAC-Signature'] = signature;
      testCase.request.headers['X-Timestamp'] = timestamp;
    }

    // 期限切れタイムスタンプテスト用の特別処理
    if (testCase.name.includes('expired_timestamp')) {
      const expiredTimestamp = testCase.request.headers['X-Timestamp'];
      const expiredSignature = generateHMACSignature(
        testCase.request.method,
        testCase.request.path,
        expiredTimestamp,
        testCase.request.body,
        ADMIN_HMAC_SECRET
      );
      testCase.request.headers['X-HMAC-Signature'] = expiredSignature;
    }

    const response = await fetch(`${API_URL}${testCase.request.path}`, {
      method: testCase.request.method,
      headers: testCase.request.headers,
      body: testCase.request.body,
    });

    const success = response.status === testCase.expectedStatus;
    const statusIcon = success ? '✅' : '❌';
    const responseText = await response.text();

    console.log(
      `   ${statusIcon} ステータス: ${response.status} (期待: ${testCase.expectedStatus})`
    );

    if (!success) {
      console.log(`   📄 レスポンス: ${responseText}`);
    }

    return success;
  } catch (error) {
    console.log(`   ❌ エラー: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🔒 管理者API認証強化テスト開始');
  console.log(`🌐 テスト対象: ${API_URL}`);
  console.log(`✅ 有効Origin: ${VALID_ORIGIN}`);
  console.log(`❌ 無効Origin: ${INVALID_ORIGIN}`);

  let passed = 0;
  const total = testCases.length;

  for (const testCase of testCases) {
    const success = await runTest(testCase);
    if (success) passed++;

    // テスト間の間隔
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n📊 テスト結果: ${passed}/${total} 成功`);

  if (passed === total) {
    console.log('🎉 すべてのテストが成功しました！');
    process.exit(0);
  } else {
    console.log('⚠️  一部のテストが失敗しました。');
    process.exit(1);
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
