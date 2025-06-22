import { type NextRequest, NextResponse } from 'next/server';
import { generateHMACSignature } from '../../../api/auth/hmac';
import { getOrGenerateJWT } from '../../../api/auth/jwt';

/**
 * URLパスから管理者秘匿パスを抽出
 * /{admin-secret}/auth/* 形式から {admin-secret} 部分を取得
 */
function extractAdminSecretFromPath(path?: string): string | null {
  if (!path) return null;

  // /{admin-secret}/auth/* パターンから秘匿パスを抽出
  const adminSecretPattern = /^\/([a-zA-Z0-9]+)\/auth\//;
  const match = path.match(adminSecretPattern);
  
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { method, path, body, referrer } = await request.json();

    // Environment variables (server-side only)
    const jwtSecret = process.env.JWT_SECRET;
    const hmacSecret = process.env.HMAC_SECRET;
    const appId = process.env.NEXT_PUBLIC_APP_ID || 'mythologia-frontend';

    if (!jwtSecret || !hmacSecret) {
      return NextResponse.json({ error: 'Missing authentication configuration' }, { status: 500 });
    }

    // Generate JWT token
    const token = await getOrGenerateJWT(appId, jwtSecret);

    // Generate HMAC signature
    const { signature, timestamp } = await generateHMACSignature(method, path, body, hmacSecret);

    // Extract admin secret from referrer path for API access control
    const adminSecret = extractAdminSecretFromPath(referrer);

    // Prepare authentication headers
    const authHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-HMAC-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': 'application/json',
    };

    // Add admin secret header if available
    if (adminSecret) {
      authHeaders['X-Admin-Secret-Path'] = adminSecret;
    }

    // Return authentication headers
    return NextResponse.json({
      headers: authHeaders,
    });
  } catch (error) {
    console.error('Auth header generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication headers' },
      { status: 500 }
    );
  }
}
