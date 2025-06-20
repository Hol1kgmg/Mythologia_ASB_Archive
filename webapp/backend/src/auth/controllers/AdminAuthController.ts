import type { Context } from 'hono';
import { z } from 'zod';
import { AdminAuthService } from '../../application/services/AdminAuthService';
import { db } from '../../db/client';
import { logger } from '../../utils/logger';

// Request schemas
const loginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Response schemas
const adminResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.string(),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  isSuperAdmin: z.boolean(),
  lastLoginAt: z.date().nullable(),
});

const loginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    admin: adminResponseSchema,
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      expiresIn: z.number(),
      tokenType: z.literal('Bearer'),
    }),
    sessionId: z.string(),
  }),
});

const refreshResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    admin: adminResponseSchema,
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      expiresIn: z.number(),
      tokenType: z.literal('Bearer'),
    }),
  }),
});

export class AdminAuthController {
  private authService: AdminAuthService;

  constructor(authService?: AdminAuthService) {
    // Dependency injection with fallback
    this.authService = authService || new AdminAuthService(db);
  }

  /**
   * POST /api/admin/auth/login
   * Admin login with username/password
   */
  async login(c: Context): Promise<Response> {
    try {
      // Parse and validate request body
      const body = await c.req.json();
      const { username, password } = loginRequestSchema.parse(body);

      // Get client info
      const ipAddress = c.req.header('x-forwarded-for') || 
                       c.req.header('x-real-ip') || 
                       c.env?.ip || 
                       'unknown';
      const userAgent = c.req.header('user-agent') || 'unknown';

      // Authenticate admin
      const result = await this.authService.login({
        username,
        password,
        ipAddress,
        userAgent,
      });

      logger.info(`Admin login successful: ${username}`);

      return c.json({
        success: true,
        data: {
          admin: {
            id: result.admin.id,
            username: result.admin.username,
            email: result.admin.email,
            role: result.admin.role,
            permissions: result.admin.permissions,
            isActive: result.admin.isActive,
            isSuperAdmin: result.admin.isSuperAdmin,
            lastLoginAt: result.admin.lastLoginAt,
          },
          tokens: result.tokens,
          sessionId: result.sessionId,
        },
      }, 200);

    } catch (error) {
      logger.error('Admin login error:', error);

      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        }, 400);
      }

      if (error instanceof Error) {
        // Don't expose sensitive error details in production
        if (error.message === 'Invalid credentials' || 
            error.message === 'Account is inactive') {
          return c.json({
            success: false,
            error: error.message,
          }, 401);
        }

        // In development, show detailed error information for debugging
        if (process.env.NODE_ENV === 'development') {
          return c.json({
            success: false,
            error: 'Login failed',
            message: error.message,
            details: error.stack,
          }, 500);
        }
      }

      return c.json({
        success: false,
        error: 'Login failed',
        message: 'An error occurred during login',
      }, 500);
    }
  }

  /**
   * POST /api/admin/auth/logout
   * Admin logout (invalidate session)
   */
  async logout(c: Context): Promise<Response> {
    try {
      // Get session ID from admin context (set by auth middleware)
      const admin = c.get('admin');
      if (!admin) {
        return c.json({
          success: false,
          error: 'Unauthorized',
        }, 401);
      }

      // Extract session ID from JWT token
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.split(' ')[1];
      if (!token) {
        return c.json({
          success: false,
          error: 'No token provided',
        }, 400);
      }

      // Verify token to get session ID
      const jwtManager = new (await import('../../infrastructure/auth/utils/admin-jwt')).AdminJWTManager();
      const payload = await jwtManager.verifyAccessToken(token);

      // Get client info
      const ipAddress = c.req.header('x-forwarded-for') || 
                       c.req.header('x-real-ip') || 
                       c.env?.ip || 
                       'unknown';
      const userAgent = c.req.header('user-agent') || 'unknown';

      // Logout (invalidate session)
      await this.authService.logout(payload.jti, ipAddress, userAgent);

      logger.info(`Admin logout successful: ${admin.username}`);

      return c.json({
        success: true,
        message: 'Logout successful',
      }, 200);

    } catch (error) {
      logger.error('Admin logout error:', error);

      return c.json({
        success: false,
        error: 'Logout failed',
        message: 'An error occurred during logout',
      }, 500);
    }
  }

  /**
   * POST /api/admin/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(c: Context): Promise<Response> {
    try {
      // Parse and validate request body
      const body = await c.req.json();
      const { refreshToken } = refreshTokenRequestSchema.parse(body);

      // Get client info
      const ipAddress = c.req.header('x-forwarded-for') || 
                       c.req.header('x-real-ip') || 
                       c.env?.ip || 
                       'unknown';
      const userAgent = c.req.header('user-agent') || 'unknown';

      // Refresh tokens
      const result = await this.authService.refreshToken(refreshToken, ipAddress, userAgent);

      logger.info(`Token refresh successful: ${result.admin.username}`);

      return c.json({
        success: true,
        data: {
          admin: {
            id: result.admin.id,
            username: result.admin.username,
            email: result.admin.email,
            role: result.admin.role,
            permissions: result.admin.permissions,
            isActive: result.admin.isActive,
            isSuperAdmin: result.admin.isSuperAdmin,
            lastLoginAt: result.admin.lastLoginAt,
          },
          tokens: result.tokens,
        },
      }, 200);

    } catch (error) {
      logger.error('Token refresh error:', error);

      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        }, 400);
      }

      if (error instanceof Error) {
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
          return c.json({
            success: false,
            error: 'Invalid or expired refresh token',
          }, 401);
        }
      }

      return c.json({
        success: false,
        error: 'Token refresh failed',
        message: 'An error occurred during token refresh',
      }, 500);
    }
  }

  /**
   * GET /api/admin/auth/me
   * Get authenticated admin information
   */
  async me(c: Context): Promise<Response> {
    try {
      // Get admin from context (set by auth middleware)
      const admin = c.get('admin');
      if (!admin) {
        return c.json({
          success: false,
          error: 'Unauthorized',
        }, 401);
      }

      return c.json({
        success: true,
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
            isSuperAdmin: admin.isSuperAdmin,
            lastLoginAt: admin.lastLoginAt,
          },
        },
      }, 200);

    } catch (error) {
      logger.error('Get admin info error:', error);

      return c.json({
        success: false,
        error: 'Failed to get admin information',
      }, 500);
    }
  }

  /**
   * POST /api/admin/auth/cleanup-sessions
   * Clean up expired sessions (admin only)
   */
  async cleanupSessions(c: Context): Promise<Response> {
    try {
      const admin = c.get('admin');
      if (!admin) {
        return c.json({
          success: false,
          error: 'Unauthorized',
        }, 401);
      }

      // Only admins and super admins can cleanup sessions
      if (!admin.isSuperAdmin && admin.role !== 'admin') {
        return c.json({
          success: false,
          error: 'Insufficient privileges',
        }, 403);
      }

      const deletedCount = await this.authService.cleanupExpiredSessions();

      logger.info(`Session cleanup performed by ${admin.username}: ${deletedCount} sessions deleted`);

      return c.json({
        success: true,
        data: {
          deletedSessions: deletedCount,
        },
        message: `Cleaned up ${deletedCount} expired sessions`,
      }, 200);

    } catch (error) {
      logger.error('Session cleanup error:', error);

      return c.json({
        success: false,
        error: 'Session cleanup failed',
      }, 500);
    }
  }
}