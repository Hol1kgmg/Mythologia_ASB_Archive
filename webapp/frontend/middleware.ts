import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface AdminPathInfo {
  secretPath: string | null;
  nextSecretPath: string | null;
  isSecretURLEnabled: boolean;
}

/**
 * Next.js Middleware for Admin Secret URL Protection
 * 
 * 管理画面への不正アクセスを404で隠蔽し、
 * 正しい秘匿URLでのみアクセスを許可する
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 管理パスのパターンマッチング（動的ルート対応）
  const adminPathPattern = /^\/[a-zA-Z0-9]+\/auth/;
  const isAdminPath = adminPathPattern.test(pathname);

  if (isAdminPath) {
    return handleAdminPath(request, pathname);
  }

  // 管理パス以外はそのまま通す
  return NextResponse.next();
}

/**
 * 管理パスのアクセス制御
 */
function handleAdminPath(request: NextRequest, pathname: string): NextResponse {
  console.log('Middleware handleAdminPath called:', { pathname });
  
  const adminPathInfo = getAdminPathInfo();
  
  console.log('Admin path info:', adminPathInfo);
  
  // 正しい秘匿URLかチェック
  const isValidSecretURL = validateAdminSecretURL(pathname, adminPathInfo);

  if (!isValidSecretURL) {
    // アクセス試行をログに記録
    logSuspiciousAccess(request, pathname);

    // 404偽装レスポンス（管理画面の存在を隠蔽）
    return new NextResponse(
      JSON.stringify({
        error: 'Not Found',
        message: 'The requested page could not be found.',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // 正常なアクセスの場合はそのまま通す
  console.log(`Valid admin access to: ${pathname}`);
  return NextResponse.next();
}

/**
 * 管理パス情報の取得
 */
function getAdminPathInfo(): AdminPathInfo {
  return {
    secretPath: process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || null,
    nextSecretPath: process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH_NEXT || null,
    isSecretURLEnabled: true, // 常に有効、secretPathがなければ開発環境として扱う
  };
}

/**
 * 秘匿URLの検証
 */
function validateAdminSecretURL(pathname: string, adminPathInfo: AdminPathInfo): boolean {
  const { secretPath, nextSecretPath } = adminPathInfo;

  console.log('Middleware validateAdminSecretURL:', {
    pathname,
    secretPath,
    nextSecretPath,
  });

  // 秘匿パスが設定されていない場合は開発環境として扱う
  if (!secretPath) {
    console.warn('NEXT_PUBLIC_ADMIN_SECRET_PATH not configured - allowing access for development');
    return true;
  }

  // 正しい秘匿URLパターンかチェック（admin-プレフィックスなし）
  const validPaths = [
    `/${secretPath}`,
    ...(nextSecretPath ? [`/${nextSecretPath}`] : []),
  ];

  console.log('Valid paths check:', {
    validPaths,
    result: validPaths.some(validPath => pathname.startsWith(validPath)),
  });

  return validPaths.some(validPath => pathname.startsWith(validPath));
}

/**
 * 疑わしいアクセスのログ記録
 */
function logSuspiciousAccess(request: NextRequest, pathname: string): void {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const referer = request.headers.get('referer') || 'Direct';

  // ログ出力（実際の運用では外部ログサービスに送信）
  console.warn('Suspicious admin access attempt blocked:', {
    ip: clientIP,
    pathname,
    userAgent: userAgent.substring(0, 100),
    referer,
    timestamp: new Date().toISOString(),
  });

  // Bot/自動化ツール検知
  if (isSuspiciousUserAgent(userAgent)) {
    console.warn('Bot/automated tool detected:', {
      ip: clientIP,
      userAgent,
      pathname,
    });
  }
}

/**
 * クライアントIPの取得
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  return (
    cfConnectingIP ||
    realIP ||
    forwardedFor?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * 疑わしいUser-Agentの検知
 */
function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /scanner/i,
    /automated/i,
    /test/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

// Middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};