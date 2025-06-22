import { type NextRequest, NextResponse } from 'next/server';
import { generateHMACSignature } from '../../../api/auth/hmac';
import { getOrGenerateJWT } from '../../../api/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { method, path, body } = await request.json();

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

    // Return authentication headers
    return NextResponse.json({
      headers: {
        Authorization: `Bearer ${token}`,
        'X-HMAC-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Auth header generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication headers' },
      { status: 500 }
    );
  }
}
