import { SignJWT } from 'jose';

export interface ApplicationJWTPayload {
  iss: string; // Issuer (App ID)
  exp: number; // Expiration time
  iat: number; // Issued at
  jti: string; // JWT ID
}

export async function generateJWT(
  appId: string,
  secret: string,
  expirationTime: number = 3600 // 1 hour in seconds
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload: ApplicationJWTPayload = {
    iss: appId,
    exp: now + expirationTime,
    iat: now,
    jti: crypto.randomUUID(),
  };

  const secretKey = new TextEncoder().encode(secret);

  return await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .setJti(payload.jti)
    .setIssuer(payload.iss)
    .sign(secretKey);
}

// Cache for JWT tokens to avoid regenerating frequently
let jwtCache: { token: string; expiresAt: number } | null = null;

export async function getOrGenerateJWT(
  appId: string,
  secret: string,
  expirationTime: number = 3600
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Check if cached token is still valid (with 5 minute buffer)
  if (jwtCache && jwtCache.expiresAt > now + 300) {
    return jwtCache.token;
  }

  // Generate new token
  const token = await generateJWT(appId, secret, expirationTime);

  // Update cache
  jwtCache = {
    token,
    expiresAt: now + expirationTime,
  };

  return token;
}
