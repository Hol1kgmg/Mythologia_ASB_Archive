/**
 * 汎用APIプロキシ（Issue #72対応）
 * 
 * 🔒 セキュリティ修正:
 * - クライアントから直接バックエンドAPIへのアクセスを防止
 * - NEXT_PUBLIC_API_URLの露出リスクを解消
 * - すべてのAPIアクセスをサーバーサイド経由に統一
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateHMACSignature } from '../../../api/auth/hmac';
import { getOrGenerateJWT } from '../../../api/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Proxy POST request started');
    
    // 🔒 セキュリティ検証: フロントエンドからのリクエストのみ許可
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');
    
    console.log('🔍 Request headers:', { origin, referer, userAgent: userAgent?.slice(0, 50) });
    
    // Origin検証（開発環境では localhost を許可）
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      process.env.NEXT_PUBLIC_FRONTEND_URL,
      'https://mythologia-admirals-ship-bridge-git-feat-5db748-shojos-projects.vercel.app' // Vercelプレビュー
    ].filter(Boolean);
    
    if (!origin || !allowedOrigins.includes(origin)) {
      console.warn('❌ Unauthorized origin:', origin);
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }
    
    // Referer検証（認証テストページからのリクエストのみ許可）
    if (referer) {
      const refererUrl = new URL(referer);
      const isFromAuthTest = refererUrl.pathname.includes('/x7k9m2p5w8t3q6r1/auth/');
      const isFromAllowedPath = refererUrl.pathname.includes('/dashboard') || 
                               refererUrl.pathname.includes('/admin');
      
      if (!isFromAuthTest && !isFromAllowedPath) {
        console.warn('❌ Unauthorized referer path:', refererUrl.pathname);
        return NextResponse.json(
          { error: 'Unauthorized access path' },
          { status: 403 }
        );
      }
    }
    
    // User-Agent検証（ブラウザからのリクエストのみ許可）
    if (!userAgent || userAgent.includes('curl') || userAgent.includes('wget') || userAgent.includes('python')) {
      console.warn('❌ Unauthorized user agent:', userAgent);
      return NextResponse.json(
        { error: 'Browser access only' },
        { status: 403 }
      );
    }
    
    // 🔒 セキュリティ修正 (Issue #72): NEXT_PUBLIC_API_URLフォールバックを削除
    const backendApiUrl = process.env.BACKEND_API_URL;
    console.log('🔍 Backend API URL:', backendApiUrl ? 'configured' : 'NOT configured');
    
    if (!backendApiUrl) {
      console.error('❌ BACKEND_API_URL not configured');
      return NextResponse.json(
        { error: 'Backend API URL not configured' },
        { status: 500 }
      );
    }

    // リクエストボディから転送情報を取得
    const requestData = await request.json();
    const { method, path, body, headers = {} } = requestData;
    console.log('🔍 Request data:', { method, path, bodyExists: !!body, headersCount: Object.keys(headers).length });
    
    // 🔒 CSRF保護: フロントエンドからの正当なリクエストかチェック
    const expectedTimestamp = request.headers.get('x-frontend-timestamp');
    const currentTime = Date.now();
    
    if (expectedTimestamp) {
      const timestamp = parseInt(expectedTimestamp);
      const timeDiff = Math.abs(currentTime - timestamp);
      // 1分以内のリクエストのみ許可
      if (timeDiff > 60000) {
        console.warn('❌ Request timestamp too old:', timeDiff);
        return NextResponse.json(
          { error: 'Request expired' },
          { status: 403 }
        );
      }
    }

    // 認証が必要なエンドポイントかチェック
    const requiresAuth = path.includes('/auth-test') || path.includes('/admin/');
    const isAdminAPI = path.includes('/admin/');
    console.log('🔍 Requires auth:', requiresAuth, 'Is admin API:', isAdminAPI);
    
    let finalHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // 認証が必要な場合は認証ヘッダーを生成
    if (requiresAuth) {
      console.log('🔐 Generating auth headers...');
      // 管理者APIは ADMIN_HMAC_SECRET、その他は HMAC_SECRET を使用
      const hmacSecret = isAdminAPI ? process.env.ADMIN_HMAC_SECRET : process.env.HMAC_SECRET;
      const apiKey = process.env.VERCEL_API_KEY;
      const jwtSecret = process.env.JWT_SECRET;
      console.log('🔍 Auth config:', { 
        hmacSecretExists: !!hmacSecret, 
        apiKeyExists: !!apiKey,
        jwtSecretExists: !!jwtSecret
      });

      if (hmacSecret && jwtSecret) {
        try {
          // JWT生成
          console.log('🔍 Generating JWT token...');
          const appId = 'mythologia-frontend';
          const token = await getOrGenerateJWT(appId, jwtSecret);
          console.log('🔍 JWT token generated:', { tokenExists: !!token });

          // HMAC署名の生成
          console.log('🔍 Generating HMAC signature...');
          const { signature, timestamp } = await generateHMACSignature(
            method, 
            path, 
            body ? JSON.stringify(body) : undefined, 
            hmacSecret
          );
          console.log('🔍 HMAC signature generated:', { signatureExists: !!signature, timestamp });

          finalHeaders = {
            ...finalHeaders,
            'Authorization': `Bearer ${token}`,
            'X-HMAC-Signature': signature,
            'X-Timestamp': timestamp,
          };

          // APIキーも追加（管理者API用）
          if (apiKey) {
            finalHeaders['X-API-Key'] = apiKey;
          }

          console.log('✅ Auth headers added to request');
        } catch (authError) {
          console.error('❌ Error generating auth headers:', authError);
          throw authError;
        }
      } else {
        console.warn('⚠️ Auth config incomplete, skipping auth headers');
      }
    }

    // バックエンドAPIにリクエストを転送
    const targetUrl = `${backendApiUrl}${path}`;
    console.log('🌐 Making request to:', targetUrl);
    console.log('🔍 Final headers:', Object.keys(finalHeaders));
    
    const response = await fetch(targetUrl, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log('📡 Backend response:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    // レスポンスを転送
    const responseData = await response.json().catch(() => ({}));
    console.log('📄 Response data parsed');
    
    return NextResponse.json(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

  } catch (error) {
    console.error('API proxy error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
    });
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GETリクエストのクエリパラメータからプロキシ情報を取得
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  
  if (!path) {
    return NextResponse.json(
      { error: 'Path parameter required' },
      { status: 400 }
    );
  }

  try {
    // 🔒 セキュリティ修正 (Issue #72): NEXT_PUBLIC_API_URLフォールバックを削除
    const backendApiUrl = process.env.BACKEND_API_URL;
    
    if (!backendApiUrl) {
      return NextResponse.json(
        { error: 'Backend API URL not configured' },
        { status: 500 }
      );
    }

    // 認証が必要なエンドポイントかチェック
    const requiresAuth = path.includes('/auth-test') || path.includes('/admin/');
    const isAdminAPI = path.includes('/admin/');
    
    let finalHeaders = {
      'Content-Type': 'application/json',
    };

    // 認証が必要な場合は認証ヘッダーを生成
    if (requiresAuth) {
      // 管理者APIは ADMIN_HMAC_SECRET、その他は HMAC_SECRET を使用
      const hmacSecret = isAdminAPI ? process.env.ADMIN_HMAC_SECRET : process.env.HMAC_SECRET;
      const apiKey = process.env.VERCEL_API_KEY;
      const jwtSecret = process.env.JWT_SECRET;

      if (hmacSecret && jwtSecret) {
        // JWT生成
        const appId = 'mythologia-frontend';
        const token = await getOrGenerateJWT(appId, jwtSecret);

        // HMAC署名の生成
        const { signature, timestamp } = await generateHMACSignature(
          'GET', 
          path, 
          undefined, 
          hmacSecret
        );

        finalHeaders = {
          ...finalHeaders,
          'Authorization': `Bearer ${token}`,
          'X-HMAC-Signature': signature,
          'X-Timestamp': timestamp,
        };

        // APIキーも追加（管理者API用）
        if (apiKey) {
          finalHeaders['X-API-Key'] = apiKey;
        }
      }
    }

    const response = await fetch(`${backendApiUrl}${path}`, {
      method: 'GET',
      headers: finalHeaders,
    });

    const responseData = await response.json().catch(() => ({}));
    
    return NextResponse.json(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

  } catch (error) {
    console.error('API proxy error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
    });
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}