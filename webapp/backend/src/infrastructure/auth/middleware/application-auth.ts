import type { Context, Next } from 'hono';
import { validateHMACSignature } from '../utils/hmac.js';
import { validateJWTPayload, verifyJWT } from '../utils/jwt.js';

export interface ApplicationAuthOptions {
  jwtSecret: string;
  hmacSecret: string;
  allowedAppIds: string[];
}

export function applicationAuth(options: ApplicationAuthOptions) {
  return async (c: Context, next: Next) => {
    try {
      // Extract JWT from Authorization header
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        console.log('Authentication failed: Missing or invalid Authorization header');
        return c.json({ error: 'Missing or invalid Authorization header' }, 401);
      }

      const token = authHeader.substring(7);

      // Extract HMAC signature and timestamp
      const signature = c.req.header('X-HMAC-Signature');
      const timestamp = c.req.header('X-Timestamp');

      if (!signature || !timestamp) {
        console.log('Authentication failed: Missing HMAC signature or timestamp');
        return c.json({ error: 'Missing HMAC signature or timestamp' }, 401);
      }

      // Verify JWT
      let jwtPayload;
      try {
        jwtPayload = await verifyJWT(token, options.jwtSecret);
        validateJWTPayload(jwtPayload, options.allowedAppIds);
      } catch (error) {
        console.log('Authentication failed: Invalid JWT token');
        return c.json({ error: 'Invalid JWT token' }, 401);
      }

      // Get request body for HMAC validation
      const body =
        c.req.method !== 'GET' && c.req.method !== 'HEAD' ? await c.req.text() : undefined;

      // Verify HMAC signature
      try {
        validateHMACSignature({
          method: c.req.method,
          path: c.req.path,
          timestamp,
          body,
          signature,
          secret: options.hmacSecret,
          maxAge: 300000, // 5 minutes
        });
      } catch (error) {
        console.log('Authentication failed: Invalid HMAC signature');
        return c.json({ error: 'Invalid HMAC signature' }, 401);
      }

      // Add authentication info to context
      c.set('jwtPayload', jwtPayload);
      c.set('authenticated', true);

      await next();
    } catch (error) {
      console.error('Application auth error:', error);
      return c.json({ error: 'Authentication failed' }, 500);
    }
  };
}

// Helper to get auth info from context
export function getAuthInfo(c: Context) {
  return {
    isAuthenticated: c.get('authenticated') || false,
    jwtPayload: c.get('jwtPayload'),
  };
}
