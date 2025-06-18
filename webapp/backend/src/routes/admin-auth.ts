import { Hono } from 'hono';
import { AdminAuthController } from '../auth/controllers/AdminAuthController';
import { adminAuth, requireAdminRole } from '../infrastructure/auth/middleware/admin-auth';
import { 
  adminLoginRateLimit, 
  adminRefreshRateLimit, 
  adminGeneralRateLimit 
} from '../infrastructure/auth/middleware/admin-rate-limit';

const adminAuthRoutes = new Hono();
const adminAuthController = new AdminAuthController();

/**
 * Admin Authentication Routes
 * Base path: /api/admin/auth
 */

// Public routes (no authentication required)
adminAuthRoutes.use('/login', adminLoginRateLimit());
adminAuthRoutes.post('/login', (c) => adminAuthController.login(c));

adminAuthRoutes.use('/refresh', adminRefreshRateLimit());
adminAuthRoutes.post('/refresh', (c) => adminAuthController.refresh(c));

// Protected routes (authentication required)
adminAuthRoutes.use('/logout', adminGeneralRateLimit(), adminAuth());
adminAuthRoutes.post('/logout', (c) => adminAuthController.logout(c));

adminAuthRoutes.use('/me', adminGeneralRateLimit(), adminAuth());
adminAuthRoutes.get('/me', (c) => adminAuthController.me(c));

// Admin only routes
adminAuthRoutes.use('/cleanup-sessions', adminGeneralRateLimit(), adminAuth(), requireAdminRole(['admin', 'super_admin']));
adminAuthRoutes.post('/cleanup-sessions', (c) => adminAuthController.cleanupSessions(c));

export { adminAuthRoutes };