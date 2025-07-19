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
    console.log('🔍 Requires auth:', requiresAuth);
    
    let finalHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // 認証が必要な場合は認証ヘッダーを生成
    if (requiresAuth) {
      console.log('🔐 Generating auth headers...');
      const hmacSecret = process.env.ADMIN_HMAC_SECRET;
      const apiKey = process.env.VERCEL_API_KEY;
      console.log('🔍 Auth config:', { 
        hmacSecretExists: !!hmacSecret, 
        apiKeyExists: !!apiKey 
      });

      if (hmacSecret && apiKey) {
        try {
          // HMAC署名の生成と認証ヘッダーの追加
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
            'X-HMAC-Signature': signature,
            'X-Timestamp': timestamp,
            'X-API-Key': apiKey,
          };
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
    
    let finalHeaders = {
      'Content-Type': 'application/json',
    };

    // 認証が必要な場合は認証ヘッダーを生成
    if (requiresAuth) {
      const hmacSecret = process.env.ADMIN_HMAC_SECRET;
      const apiKey = process.env.VERCEL_API_KEY;

      if (hmacSecret && apiKey) {
        // HMAC署名の生成と認証ヘッダーの追加
        const { signature, timestamp } = await generateHMACSignature(
          'GET', 
          path, 
          undefined, 
          hmacSecret
        );

        finalHeaders = {
          ...finalHeaders,
          'X-HMAC-Signature': signature,
          'X-Timestamp': timestamp,
          'X-API-Key': apiKey,
        };
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