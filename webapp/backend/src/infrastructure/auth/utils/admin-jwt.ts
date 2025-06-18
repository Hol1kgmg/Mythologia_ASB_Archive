import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';

export interface AdminJWTPayload {
  sub: string; // Admin ID
  username: string; // Admin username
  role: string; // Admin role
  permissions: string[]; // Admin permissions
  iss: string; // Issuer
  aud: string; // Audience  
  exp: number; // Expiration time
  iat: number; // Issued at
  jti: string; // JWT ID (session token reference)
  [key: string]: any; // Index signature for compatibility with JWTPayload
}

export interface AdminTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// Validation schemas
export const adminJWTPayloadSchema = z.object({
  sub: z.string().uuid(),
  username: z.string(),
  role: z.enum(['super_admin', 'admin', 'viewer']),
  permissions: z.array(z.string()),
  iss: z.string(),
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string().uuid(),
});

export class AdminJWTManager {
  private static readonly JWT_ISSUER = 'mythologia-admin-api';
  private static readonly JWT_AUDIENCE = 'mythologia-admin';
  private static readonly ACCESS_TOKEN_EXPIRES_IN = 60 * 60; // 1 hour
  private static readonly REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days

  constructor(private readonly jwtSecret: string) {
    if (!jwtSecret) {
      throw new Error('JWT secret is required');
    }
  }

  /**
   * Generate admin access token
   */
  async generateAccessToken(
    adminId: string,
    username: string,
    role: string,
    permissions: string[],
    sessionId: string
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload: AdminJWTPayload = {
      sub: adminId,
      username,
      role,
      permissions,
      iss: AdminJWTManager.JWT_ISSUER,
      aud: AdminJWTManager.JWT_AUDIENCE,
      exp: now + AdminJWTManager.ACCESS_TOKEN_EXPIRES_IN,
      iat: now,
      jti: sessionId,
    };

    const secretKey = new TextEncoder().encode(this.jwtSecret);
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp)
      .setIssuer(payload.iss)
      .setAudience(payload.aud)
      .setSubject(payload.sub)
      .setJti(payload.jti)
      .sign(secretKey);
  }

  /**
   * Generate admin refresh token
   */
  async generateRefreshToken(sessionId: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      jti: sessionId,
      iss: AdminJWTManager.JWT_ISSUER,
      aud: AdminJWTManager.JWT_AUDIENCE,
      exp: now + AdminJWTManager.REFRESH_TOKEN_EXPIRES_IN,
      iat: now,
      type: 'refresh',
    };

    const secretKey = new TextEncoder().encode(this.jwtSecret);
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp)
      .setIssuer(payload.iss)
      .setAudience(payload.aud)
      .setJti(payload.jti)
      .sign(secretKey);
  }

  /**
   * Generate admin token pair
   */
  async generateTokenPair(
    adminId: string,
    username: string,
    role: string,
    permissions: string[],
    sessionId: string
  ): Promise<AdminTokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(adminId, username, role, permissions, sessionId),
      this.generateRefreshToken(sessionId),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: AdminJWTManager.ACCESS_TOKEN_EXPIRES_IN,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify admin access token
   */
  async verifyAccessToken(token: string): Promise<AdminJWTPayload> {
    try {
      const secretKey = new TextEncoder().encode(this.jwtSecret);
      const { payload } = await jwtVerify(token, secretKey, {
        issuer: AdminJWTManager.JWT_ISSUER,
        audience: AdminJWTManager.JWT_AUDIENCE,
      });

      // Validate payload structure
      const validatedPayload = adminJWTPayloadSchema.parse(payload);
      
      return validatedPayload;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid token payload structure');
      }
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify admin refresh token
   */
  async verifyRefreshToken(token: string): Promise<{ sessionId: string }> {
    try {
      const secretKey = new TextEncoder().encode(this.jwtSecret);
      const { payload } = await jwtVerify(token, secretKey, {
        issuer: AdminJWTManager.JWT_ISSUER,
        audience: AdminJWTManager.JWT_AUDIENCE,
      });

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      if (!payload.jti || typeof payload.jti !== 'string') {
        throw new Error('Invalid session ID in token');
      }

      return { sessionId: payload.jti };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Get token expiration time
   */
  static getAccessTokenExpiresIn(): number {
    return AdminJWTManager.ACCESS_TOKEN_EXPIRES_IN;
  }

  /**
   * Get refresh token expiration time
   */
  static getRefreshTokenExpiresIn(): number {
    return AdminJWTManager.REFRESH_TOKEN_EXPIRES_IN;
  }
}