/**
 * 認証テスト専用プロキシ
 * 
 * シンプルな実装で認証テストのみを処理
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateHMACSignature } from '../../../api/auth/hmac';
import { getOrGenerateJWT } from '../../../api/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const backendApiUrl = process.env.BACKEND_API_URL;
    
    if (!backendApiUrl) {
      return NextResponse.json(
        { error: 'Backend API URL not configured' },
        { status: 500 }
      );
    }

    // 認証ヘッダー生成
    const jwtSecret = process.env.JWT_SECRET;
    const hmacSecret = process.env.HMAC_SECRET;
    
    if (!jwtSecret || !hmacSecret) {
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    // JWT + HMAC認証
    const appId = 'mythologia-frontend';
    const token = await getOrGenerateJWT(appId, jwtSecret);
    const { signature, timestamp } = await generateHMACSignature(
      'GET',
      '/api/health/auth-test',
      undefined,
      hmacSecret
    );

    // 認証テストAPIを呼び出し
    const response = await fetch(`${backendApiUrl}/api/health/auth-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-HMAC-Signature': signature,
        'X-Timestamp': timestamp,
      },
    });

    const responseData = await response.json().catch(() => ({}));
    
    return NextResponse.json(responseData, {
      status: response.status,
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Authentication test failed' },
      { status: 500 }
    );
  }
}