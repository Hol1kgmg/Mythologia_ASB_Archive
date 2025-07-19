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
    // 🚧 開発・デバッグ用設定
    // 方法1: 環境変数で制御 (.env.local に ALLOW_CURL_AUTH_TEST=true を追加)
    // 方法2: コメントアウトで制御 (下記のif文全体をコメントアウト)
    const allowCurlTesting = process.env.ALLOW_CURL_AUTH_TEST === 'true';
    
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