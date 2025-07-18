/**
 * 汎用APIプロキシ（Issue #72対応）
 * 
 * 🔒 セキュリティ修正:
 * - クライアントから直接バックエンドAPIへのアクセスを防止
 * - NEXT_PUBLIC_API_URLの露出リスクを解消
 * - すべてのAPIアクセスをサーバーサイド経由に統一
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 🔒 セキュリティ修正 (Issue #72): NEXT_PUBLIC_API_URLフォールバックを削除
    const backendApiUrl = process.env.BACKEND_API_URL;
    
    if (!backendApiUrl) {
      return NextResponse.json(
        { error: 'Backend API URL not configured' },
        { status: 500 }
      );
    }

    // リクエストボディから転送情報を取得
    const { method, path, body, headers = {} } = await request.json();

    // バックエンドAPIにリクエストを転送
    const response = await fetch(`${backendApiUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // レスポンスを転送
    const responseData = await response.json().catch(() => ({}));
    
    return NextResponse.json(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
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

    const response = await fetch(`${backendApiUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json().catch(() => ({}));
    
    return NextResponse.json(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}