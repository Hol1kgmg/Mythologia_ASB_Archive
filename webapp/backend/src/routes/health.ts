import { Hono } from 'hono';
import {
  applicationAuth,
  getAuthInfo,
} from '../infrastructure/auth/middleware/application-auth.js';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET!;
const HMAC_SECRET = process.env.HMAC_SECRET!;
const ALLOWED_APP_IDS = process.env.ALLOWED_APP_IDS?.split(',') || ['mythologia-frontend'];

const healthRoutes = new Hono();

// Basic health check (public)
healthRoutes.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Authentication test endpoint (protected)
healthRoutes.get(
  '/auth-test',
  applicationAuth({
    jwtSecret: JWT_SECRET,
    hmacSecret: HMAC_SECRET,
    allowedAppIds: ALLOWED_APP_IDS,
  }),
  (c) => {
    const authInfo = getAuthInfo(c);
    return c.json({
      success: true,
      message: 'Authentication successful',
      timestamp: new Date().toISOString(),
      appId: authInfo.jwtPayload?.iss,
      authenticated: authInfo.isAuthenticated,
    });
  }
);

export { healthRoutes };
