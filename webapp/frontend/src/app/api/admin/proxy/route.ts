import { NextRequest, NextResponse } from 'next/server';
import { generateHMACSignature } from '../../../../api/auth/hmac';

/**
 * 管理者API用のセキュアプロキシ
 * 認証情報をサーバーサイドで処理し、クライアントサイドから隠蔽
 */

export interface AdminProxyRequestBody {
  method: string;
  path: string;
  body?: string;
  token?: string;
}

/**
 * 管理者APIへのプロキシ処理
 * POST /api/admin/proxy
 */
export async function POST(request: NextRequest) {
  try {
    const requestBody: AdminProxyRequestBody = await request.json();
    const { method, path, body, token } = requestBody;

    // サーバーサイド専用環境変数から取得（NEXT_PUBLIC_なし）
    const hmacSecret = process.env.ADMIN_HMAC_SECRET;
    const apiKey = process.env.VERCEL_API_KEY;
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // 環境変数の存在確認
    if (!hmacSecret) {
      console.error('ADMIN_HMAC_SECRET is not configured');
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      );
    }

    if (!apiKey) {
      console.error('VERCEL_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // HMAC署名を生成（サーバーサイドで安全に実行）
    const { signature, timestamp } = await generateHMACSignature(method, path, body, hmacSecret);

    // バックエンドAPIへの認証済みリクエスト
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-HMAC-Signature': signature,
      'X-Timestamp': timestamp,
      'X-API-Key': apiKey,
    };

    // JWTトークンが提供されている場合は追加
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // バックエンドAPIへプロキシ
    const backendResponse = await fetch(`${backendUrl}${path}`, {
      method,
      headers,
      body: body || undefined,
    });

    // レスポンスデータを取得
    const responseData = await backendResponse.text();
    
    // Content-Typeを適切に設定
    const contentType = backendResponse.headers.get('content-type') || 'application/json';
    
    // バックエンドからのレスポンスをそのまま返す
    return new NextResponse(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': contentType,
      },
    });

  } catch (error) {
    console.error('Admin proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS request for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}