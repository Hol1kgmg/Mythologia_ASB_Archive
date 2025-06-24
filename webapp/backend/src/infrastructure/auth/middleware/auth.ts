/**
 * Unified Authentication Middleware
 *
 * This file consolidates all authentication-related middleware:
 * - Admin authentication (from admin-auth.ts)
 * - Application authentication (from application-auth.ts)
 *
 * Refactoring: Issue #55
 */

import type { Context, MiddlewareHandler, Next } from 'hono';
import { AdminAuthService } from '../../../application/services/AdminAuthService.js';
import { db } from '../../../db/client.js';
import { logger } from '../../../utils/logger.js';
import { AdminJWTManager } from '../utils/admin-jwt.js';
import { validateHMACSignature } from '../utils/hmac.js';
import { validateJWTPayload, verifyJWT } from '../utils/jwt.js';

// =============================================================================
// Types and Interfaces
// =============================================================================

interface AdminAuthContext {
  admin: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    isSuperAdmin: boolean;
  };
}

export interface ApplicationAuthOptions {
  jwtSecret: string;
  hmacSecret: string;
  allowedAppIds: string[];
}

// =============================================================================
// Admin Authentication (from admin-auth.ts)
// =============================================================================

/**
 * Admin authentication middleware
 */
export function adminAuth(): MiddlewareHandler<{ Variables: AdminAuthContext }> {
  return async (c, next) => {
    try {
      // Extract token from Authorization header
      const authHeader = c.req.header('Authorization');
      const token = AdminJWTManager.extractTokenFromHeader(authHeader);

      if (!token) {
        return c.json(
          {
            error: 'Unauthorized',
            message: 'Access token is required',
          },
          401
        );
      }

      // Verify token and get admin info
      const authService = new AdminAuthService(db);
      const admin = await authService.verifyAccessToken(token);

      // Set admin in context
      c.set('admin', admin);

      await next();
    } catch (error) {
      logger.warn('Admin authentication failed:', error);

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Token expired error
        if (errorMessage.includes('expired') || errorMessage.includes('exp')) {
          return c.json(
            {
              error: 'TokenExpired',
              message: 'Access token has expired',
            },
            401
          );
        }

        // Invalid token error
        if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
          return c.json(
            {
              error: 'InvalidToken',
              message: 'Invalid access token',
            },
            401
          );
        }

        // Admin not found or inactive
        if (errorMessage.includes('not found') || errorMessage.includes('inactive')) {
          return c.json(
            {
              error: 'AdminNotFound',
              message: 'Admin account not found or inactive',
            },
            401
          );
        }
      }

      // Generic authentication error
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication failed',
        },
        401
      );
    }
  };
}

/**
 * Role-based access control middleware
 */
export function requireAdminRole(
  allowedRoles: string[] = [],
  allowSuperAdmin: boolean = true
): MiddlewareHandler<{ Variables: AdminAuthContext }> {
  return async (c, next) => {
    const admin = c.get('admin');

    if (!admin) {
      logger.warn('Role check failed: No admin in context');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      logger.warn(`Role check failed: Inactive admin ${admin.username}`);
      return c.json(
        {
          error: 'Forbidden',
          message: 'Admin account is inactive',
        },
        403
      );
    }

    // Super admin has access to everything
    if (allowSuperAdmin && admin.isSuperAdmin) {
      logger.info(`Super admin access granted: ${admin.username}`);
      await next();
      return;
    }

    // Check specific roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(admin.role)) {
      logger.warn(
        `Role check failed: ${admin.username} (role: ${admin.role}) not in allowed roles: ${allowedRoles.join(', ')}`
      );
      return c.json(
        {
          error: 'Forbidden',
          message: 'Insufficient permissions',
        },
        403
      );
    }

    logger.info(`Role check passed: ${admin.username} (role: ${admin.role})`);
    await next();
  };
}

/**
 * Permission-based access control middleware
 */
export function requireAdminPermission(
  requiredPermissions: string[] = [],
  requireAll: boolean = false
): MiddlewareHandler<{ Variables: AdminAuthContext }> {
  return async (c, next) => {
    const admin = c.get('admin');

    if (!admin) {
      logger.warn('Permission check failed: No admin in context');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      logger.warn(`Permission check failed: Inactive admin ${admin.username}`);
      return c.json(
        {
          error: 'Forbidden',
          message: 'Admin account is inactive',
        },
        403
      );
    }

    // Super admin has all permissions
    if (admin.isSuperAdmin || admin.permissions.includes('*')) {
      logger.info(`Super admin permission granted: ${admin.username}`);
      await next();
      return;
    }

    // Check specific permissions
    if (requiredPermissions.length > 0) {
      const hasPermissions = requireAll
        ? requiredPermissions.every((permission) => admin.permissions.includes(permission))
        : requiredPermissions.some((permission) => admin.permissions.includes(permission));

      if (!hasPermissions) {
        logger.warn(
          `Permission check failed: ${admin.username} missing permissions: ${requiredPermissions.join(', ')}`
        );
        return c.json(
          {
            error: 'Forbidden',
            message: 'Insufficient permissions',
          },
          403
        );
      }
    }

    logger.info(`Permission check passed: ${admin.username}`);
    await next();
  };
}

// =============================================================================
// Application Authentication (from application-auth.ts)
// =============================================================================

/**
 * Application authentication middleware with JWT and HMAC validation
 */
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
      } catch (_error) {
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
      } catch (_error) {
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

/**
 * Helper to get auth info from context
 */
export function getAuthInfo(c: Context) {
  return {
    isAuthenticated: c.get('authenticated') || false,
    jwtPayload: c.get('jwtPayload'),
  };
}

/**
 * Helper to get admin info from context
 */
export function getAdminInfo(c: Context): AdminAuthContext['admin'] | null {
  return c.get('admin') || null;
}
