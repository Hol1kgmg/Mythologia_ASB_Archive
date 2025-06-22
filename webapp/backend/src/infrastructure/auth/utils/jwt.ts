import { jwtVerify } from 'jose';

export interface ApplicationJWTPayload {
  iss: string; // Issuer (App ID)
  exp: number; // Expiration time
  iat: number; // Issued at
  jti: string; // JWT ID
}

export async function verifyJWT(token: string, secret: string): Promise<ApplicationJWTPayload> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    return {
      iss: payload.iss as string,
      exp: payload.exp as number,
      iat: payload.iat as number,
      jti: payload.jti as string,
    };
  } catch (_error) {
    throw new Error('Invalid JWT token');
  }
}

export function validateJWTPayload(payload: ApplicationJWTPayload, allowedAppIds: string[]): void {
  // Check if issuer is allowed
  if (!allowedAppIds.includes(payload.iss)) {
    throw new Error('Invalid issuer');
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error('Token expired');
  }

  // Check issued at time (not in the future)
  if (payload.iat > now + 60) {
    // Allow 1 minute clock skew
    throw new Error('Token issued in the future');
  }
}
