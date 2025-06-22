import type { MiddlewareHandler } from 'hono';
import { AdminAuthService } from '../../../application/services/AdminAuthService.js';
import { db } from '../../../db/client.js';
import { logger } from '../../../utils/logger.js';
import { AdminJWTManager } from '../utils/admin-jwt.js';

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
        if (error.message.includes('expired')) {
          return c.json(
            {
              error: 'Token expired',
              message: 'Access token has expired. Please refresh your token.',
            },
            401
          );
        }

        if (error.message.includes('invalid') || error.message.includes('not found')) {
          return c.json(
            {
              error: 'Invalid token',
              message: 'Invalid access token. Please login again.',
            },
            401
          );
        }
      }

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
 * Admin role-based authorization middleware
 */
export function requireAdminRole(
  requiredRoles: string[]
): MiddlewareHandler<{ Variables: AdminAuthContext }> {
  return async (c, next) => {
    const admin = c.get('admin');

    if (!admin) {
      logger.error('Admin authorization middleware called without authentication');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    // Super admin bypasses role restrictions
    if (admin.isSuperAdmin) {
      await next();
      return;
    }

    // Check if admin has required role
    if (!requiredRoles.includes(admin.role)) {
      logger.warn(
        `Access denied for admin ${admin.username}: required roles ${requiredRoles.join(', ')}, has ${admin.role}`
      );
      return c.json(
        {
          error: 'Forbidden',
          message: `Insufficient privileges. Required roles: ${requiredRoles.join(', ')}`,
        },
        403
      );
    }

    await next();
  };
}

/**
 * Admin permission-based authorization middleware
 */
export function requireAdminPermission(
  requiredPermissions: string[]
): MiddlewareHandler<{ Variables: AdminAuthContext }> {
  return async (c, next) => {
    const admin = c.get('admin');

    if (!admin) {
      logger.error('Admin permission middleware called without authentication');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    // Super admin bypasses permission restrictions
    if (admin.isSuperAdmin || admin.permissions.includes('*')) {
      await next();
      return;
    }

    // Check if admin has any of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      admin.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(
        `Access denied for admin ${admin.username}: required permissions ${requiredPermissions.join(', ')}, has ${admin.permissions.join(', ')}`
      );
      return c.json(
        {
          error: 'Forbidden',
          message: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        },
        403
      );
    }

    await next();
  };
}

/**
 * Super admin only middleware
 */
export function requireSuperAdmin(): MiddlewareHandler<{ Variables: AdminAuthContext }> {
  return async (c, next) => {
    const admin = c.get('admin');

    if (!admin) {
      logger.error('Super admin middleware called without authentication');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    if (!admin.isSuperAdmin) {
      logger.warn(`Super admin access denied for admin ${admin.username}`);
      return c.json(
        {
          error: 'Forbidden',
          message: 'Super admin privileges required',
        },
        403
      );
    }

    await next();
  };
}

/**
 * Active admin only middleware (additional check)
 */
export function requireActiveAdmin(): MiddlewareHandler<{ Variables: AdminAuthContext }> {
  return async (c, next) => {
    const admin = c.get('admin');

    if (!admin) {
      logger.error('Active admin middleware called without authentication');
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    if (!admin.isActive) {
      logger.warn(`Inactive admin access attempt: ${admin.username}`);
      return c.json(
        {
          error: 'Forbidden',
          message: 'Account is inactive',
        },
        403
      );
    }

    await next();
  };
}
