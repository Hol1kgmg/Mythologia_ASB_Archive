import { eq, and, gt, lt } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { admins, adminSessions, adminActivityLogs } from '../../db/schema/admin';
import { AdminJWTManager, type AdminTokenPair } from '../../infrastructure/auth/utils/admin-jwt';
import { logger } from '../../utils/logger';

export interface LoginCredentials {
  username: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticatedAdmin {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: Date | null;
}

export interface LoginResult {
  admin: AuthenticatedAdmin;
  tokens: AdminTokenPair;
  sessionId: string;
}

export interface RefreshResult {
  tokens: AdminTokenPair;
  admin: AuthenticatedAdmin;
}

export class AdminAuthService {
  private jwtManager: AdminJWTManager;

  constructor(
    private readonly db: PostgresJsDatabase<any>
  ) {
    this.jwtManager = new AdminJWTManager();
  }

  /**
   * Authenticate admin with username/password
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const { username, password, ipAddress, userAgent } = credentials;

    try {
      // Find admin by username
      const adminResult = await this.db
        .select()
        .from(admins)
        .where(eq(admins.username, username))
        .limit(1);

      if (adminResult.length === 0) {
        await this.logActivity(null, 'login_failed', 'authentication', undefined, {
          reason: 'user_not_found',
          username,
        }, ipAddress, userAgent);
        throw new Error('Invalid credentials');
      }

      const admin = adminResult[0];

      // Check if admin is active
      if (!admin.isActive) {
        await this.logActivity(admin.id, 'login_failed', 'authentication', undefined, {
          reason: 'account_inactive',
        }, ipAddress, userAgent);
        throw new Error('Account is inactive');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
      
      if (!isPasswordValid) {
        await this.logActivity(admin.id, 'login_failed', 'authentication', undefined, {
          reason: 'invalid_password',
        }, ipAddress, userAgent);
        throw new Error('Invalid credentials');
      }

      // Create session
      const sessionExpiresAt = new Date(Date.now() + AdminJWTManager.getRefreshTokenExpiresIn() * 1000);
      
      // Generate temporary unique token to avoid UNIQUE constraint violation
      const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      const sessionResult = await this.db
        .insert(adminSessions)
        .values({
          adminId: admin.id,
          token: tempToken, // Temporary unique token, will be updated with refresh token
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          expiresAt: sessionExpiresAt,
        })
        .returning();

      const session = sessionResult[0];
      if (!session) {
        throw new Error('Failed to create session');
      }

      // Generate tokens
      const tokens = await this.jwtManager.generateTokenPair(
        admin.id,
        admin.username,
        admin.role,
        admin.permissions,
        session.id
      );

      // Update session with refresh token
      await this.db
        .update(adminSessions)
        .set({ token: tokens.refreshToken })
        .where(eq(adminSessions.id, session.id));

      // Update last login time
      await this.db
        .update(admins)
        .set({ lastLoginAt: new Date() })
        .where(eq(admins.id, admin.id));

      // Log successful login
      await this.logActivity(admin.id, 'login_success', 'authentication', session.id, {
        sessionId: session.id,
      }, ipAddress, userAgent);

      const authenticatedAdmin: AuthenticatedAdmin = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        isSuperAdmin: admin.isSuperAdmin,
        lastLoginAt: admin.lastLoginAt,
      };

      logger.info(`Admin login successful: ${admin.username} (${admin.id})`);

      return {
        admin: authenticatedAdmin,
        tokens,
        sessionId: session.id,
      };

    } catch (error) {
      logger.error('Admin login failed:', error);
      throw error;
    }
  }

  /**
   * Logout admin (invalidate session)
   */
  async logout(sessionId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Find and delete session
      const sessionResult = await this.db
        .select()
        .from(adminSessions)
        .where(eq(adminSessions.id, sessionId))
        .limit(1);

      if (sessionResult.length === 0) {
        throw new Error('Session not found');
      }

      const session = sessionResult[0];

      // Delete session
      await this.db
        .delete(adminSessions)
        .where(eq(adminSessions.id, sessionId));

      // Log logout
      await this.logActivity(session.adminId, 'logout', 'authentication', sessionId, {
        sessionId,
      }, ipAddress, userAgent);

      logger.info(`Admin logout: session ${sessionId}`);

    } catch (error) {
      logger.error('Admin logout failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<RefreshResult> {
    try {
      // Verify refresh token
      const { sessionId } = await this.jwtManager.verifyRefreshToken(refreshToken);

      // Find active session
      const sessionResult = await this.db
        .select()
        .from(adminSessions)
        .where(
          and(
            eq(adminSessions.id, sessionId),
            eq(adminSessions.token, refreshToken),
            gt(adminSessions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      const session = sessionResult[0];

      // Find admin
      const adminResult = await this.db
        .select()
        .from(admins)
        .where(eq(admins.id, session.adminId))
        .limit(1);

      if (adminResult.length === 0 || !adminResult[0].isActive) {
        // Delete invalid session
        await this.db
          .delete(adminSessions)
          .where(eq(adminSessions.id, sessionId));
        throw new Error('Admin not found or inactive');
      }

      const admin = adminResult[0];

      // Generate new tokens
      const tokens = await this.jwtManager.generateTokenPair(
        admin.id,
        admin.username,
        admin.role,
        admin.permissions,
        session.id
      );

      // Update session with new refresh token
      await this.db
        .update(adminSessions)
        .set({ 
          token: tokens.refreshToken,
          ipAddress: ipAddress || session.ipAddress || null,
          userAgent: userAgent || session.userAgent || null,
        })
        .where(eq(adminSessions.id, sessionId));

      // Log token refresh
      await this.logActivity(admin.id, 'token_refresh', 'authentication', sessionId, {
        sessionId,
      }, ipAddress, userAgent);

      const authenticatedAdmin: AuthenticatedAdmin = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        isSuperAdmin: admin.isSuperAdmin,
        lastLoginAt: admin.lastLoginAt,
      };

      logger.info(`Token refresh successful: ${admin.username} (${admin.id})`);

      return {
        tokens,
        admin: authenticatedAdmin,
      };

    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get authenticated admin info
   */
  async getAdminInfo(adminId: string): Promise<AuthenticatedAdmin> {
    try {
      const adminResult = await this.db
        .select()
        .from(admins)
        .where(eq(admins.id, adminId))
        .limit(1);

      if (adminResult.length === 0 || !adminResult[0].isActive) {
        throw new Error('Admin not found or inactive');
      }

      const admin = adminResult[0];

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        isSuperAdmin: admin.isSuperAdmin,
        lastLoginAt: admin.lastLoginAt,
      };

    } catch (error) {
      logger.error('Get admin info failed:', error);
      throw error;
    }
  }

  /**
   * Verify access token and return admin info
   */
  async verifyAccessToken(accessToken: string): Promise<AuthenticatedAdmin> {
    try {
      const payload = await this.jwtManager.verifyAccessToken(accessToken);
      
      // Verify session still exists and is valid
      const sessionResult = await this.db
        .select()
        .from(adminSessions)
        .where(
          and(
            eq(adminSessions.id, payload.jti),
            gt(adminSessions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        throw new Error('Session not found or expired');
      }

      // Get latest admin info
      return await this.getAdminInfo(payload.sub);

    } catch (error) {
      logger.error('Access token verification failed:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.db
        .delete(adminSessions)
        .where(lt(adminSessions.expiresAt, new Date()));

      // Handle different return types from different database drivers
      let deletedCount = 0;
      if (typeof result === 'object' && result !== null && 'rowCount' in result) {
        deletedCount = (result as any).rowCount || 0;
      }
      
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired admin sessions`);
      }

      return deletedCount;

    } catch (error) {
      logger.error('Session cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Log admin activity
   */
  private async logActivity(
    adminId: string | null,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      if (!adminId) {
        // For failed login attempts without valid admin ID
        return;
      }

      await this.db
        .insert(adminActivityLogs)
        .values({
          adminId,
          action,
          targetType: targetType || null,
          targetId: targetId || null,
          details: details || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        });

    } catch (error) {
      logger.warn('Failed to log admin activity:', error);
      // Don't throw error for logging failures
    }
  }
}