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