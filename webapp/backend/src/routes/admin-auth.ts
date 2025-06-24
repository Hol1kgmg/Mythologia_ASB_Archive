import { Hono } from 'hono';
import { AdminAuthController } from '../auth/controllers/AdminAuthController.js';
import { adminAPISecurity } from '../infrastructure/auth/middleware/admin-api-security.js';
import { adminAuth, requireAdminRole } from '../infrastructure/auth/middleware/admin-auth.js';
import {
  adminGeneralRateLimit,
  adminLoginRateLimit,
  adminRefreshRateLimit,
} from '../infrastructure/auth/middleware/admin-rate-limit.js';
import { adminSecretURL } from '../infrastructure/auth/middleware/admin-secret-url.js';

const adminAuthRoutes = new Hono();
const adminAuthController = new AdminAuthController();

/**
 * Admin Authentication Routes
 * Base path: /api/admin/auth
 */

// Apply secret URL validation to all admin routes
adminAuthRoutes.use('*', adminSecretURL());

// Public routes (no authentication required, but security-protected)
adminAuthRoutes.use('/login', adminAPISecurity(), adminLoginRateLimit());
adminAuthRoutes.post('/login', (c) => adminAuthController.login(c));

adminAuthRoutes.use('/refresh', adminAPISecurity(), adminRefreshRateLimit());
adminAuthRoutes.post('/refresh', (c) => adminAuthController.refresh(c));

// Protected routes (authentication required + security-protected)
adminAuthRoutes.use('/logout', adminAPISecurity(), adminGeneralRateLimit(), adminAuth());
adminAuthRoutes.post('/logout', (c) => adminAuthController.logout(c));

adminAuthRoutes.use('/me', adminAPISecurity(), adminGeneralRateLimit(), adminAuth());
adminAuthRoutes.get('/me', (c) => adminAuthController.me(c));

// Admin only routes
adminAuthRoutes.use(
  '/cleanup-sessions',
  adminAPISecurity(),
  adminGeneralRateLimit(),
  adminAuth(),
  requireAdminRole(['admin', 'super_admin'])
);
adminAuthRoutes.post('/cleanup-sessions', (c) => adminAuthController.cleanupSessions(c));

export { adminAuthRoutes };
