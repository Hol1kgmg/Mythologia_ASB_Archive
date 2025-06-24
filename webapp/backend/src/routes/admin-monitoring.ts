import { Hono } from 'hono';
import { adminAuth, requireAdminRole } from '../infrastructure/auth/middleware/auth.js';
import { adminGeneralRateLimit } from '../infrastructure/auth/middleware/rate-limit.js';
import {
  adminAPISecurity,
  adminSecretURL,
  getAdminAccessStats,
} from '../infrastructure/auth/middleware/security.js';
import { logger } from '../utils/logger.js';

const adminMonitoringRoutes = new Hono();

/**
 * Admin Monitoring Routes
 * Base path: /api/admin/monitoring
 */

// Apply secret URL validation to all monitoring routes
adminMonitoringRoutes.use('*', adminSecretURL());

// Require admin authentication for all monitoring routes
adminMonitoringRoutes.use('*', adminAPISecurity(), adminGeneralRateLimit(), adminAuth());

/**
 * アクセス統計の取得
 * GET /api/admin/monitoring/access-stats
 */
adminMonitoringRoutes.get('/access-stats', requireAdminRole(['admin', 'super_admin']), (c) => {
  try {
    const stats = getAdminAccessStats();

    logger.info('Admin access stats requested', {
      adminId: c.get('admin').id,
      stats: {
        total24h: stats.total24h,
        invalid24h: stats.invalid24h,
        suspiciousIPs: stats.suspiciousIPs.length,
      },
    });

    return c.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get admin access stats:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to retrieve access statistics',
      },
      500
    );
  }
});

/**
 * 秘匿URL設定の取得
 * GET /api/admin/monitoring/secret-url-config
 */
adminMonitoringRoutes.get('/secret-url-config', requireAdminRole(['super_admin']), (c) => {
  try {
    const config = {
      currentPath: process.env.ADMIN_SECRET_PATH ? 'configured' : 'not_configured',
      nextPath: process.env.ADMIN_SECRET_PATH_NEXT ? 'configured' : 'not_configured',
      securityEmail: process.env.ADMIN_SECURITY_EMAIL ? 'configured' : 'not_configured',
      isEnabled: process.env.DISABLE_SECRET_URL !== 'true',
      environment: process.env.NODE_ENV,
    };

    logger.info('Secret URL config requested', {
      adminId: c.get('admin').id,
      config,
    });

    return c.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get secret URL config:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to retrieve configuration',
      },
      500
    );
  }
});

/**
 * 緊急時アクセスURL生成
 * POST /api/admin/monitoring/emergency-access
 *
 * 短時間有効な緊急アクセスURLを生成
 */
adminMonitoringRoutes.post('/emergency-access', requireAdminRole(['super_admin']), async (c) => {
  try {
    const body = await c.req.json();
    const { reason, durationMinutes = 30 } = body;

    if (!reason || typeof reason !== 'string') {
      return c.json(
        {
          success: false,
          error: 'Reason for emergency access is required',
        },
        400
      );
    }

    // 緊急時アクセスURL生成（ランダム文字列）
    const emergencyPath = generateEmergencyPath();
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    // TODO: 実際の運用では、これをRedisや一時テーブルに保存
    const _emergencyAccess = {
      path: emergencyPath,
      reason,
      createdBy: c.get('admin').id,
      expiresAt,
      used: false,
    };

    logger.warn('Emergency admin access URL generated', {
      adminId: c.get('admin').id,
      reason,
      durationMinutes,
      emergencyPath: `${emergencyPath.substring(0, 8)}***`, // ログではマスク
    });

    return c.json({
      success: true,
      data: {
        emergencyURL: `/admin-${emergencyPath}/`,
        expiresAt: expiresAt.toISOString(),
        durationMinutes,
        instructions: [
          '1. This URL is valid for a limited time only',
          '2. Use it only for the stated emergency reason',
          '3. Change the regular secret URL after resolving the emergency',
          '4. This access attempt will be logged',
        ],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to generate emergency access:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to generate emergency access',
      },
      500
    );
  }
});

/**
 * URL変更指示書生成
 * POST /api/admin/monitoring/generate-migration-guide
 */
adminMonitoringRoutes.post(
  '/generate-migration-guide',
  requireAdminRole(['super_admin']),
  async (c) => {
    try {
      const body = await c.req.json();
      const { newSecretPath } = body;

      if (!newSecretPath || typeof newSecretPath !== 'string') {
        return c.json(
          {
            success: false,
            error: 'New secret path is required',
          },
          400
        );
      }

      // 秘匿URLの形式チェック
      if (!/^[a-zA-Z0-9]{10,20}$/.test(newSecretPath)) {
        return c.json(
          {
            success: false,
            error: 'Secret path must be 10-20 alphanumeric characters',
          },
          400
        );
      }

      const currentPath = process.env.ADMIN_SECRET_PATH;
      const migrationGuide = generateMigrationGuide(currentPath, newSecretPath);

      logger.info('Migration guide generated', {
        adminId: c.get('admin').id,
        fromPath: currentPath ? `${currentPath.substring(0, 4)}***` : 'none',
        toPath: `${newSecretPath.substring(0, 4)}***`,
      });

      return c.json({
        success: true,
        data: migrationGuide,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to generate migration guide:', error);
      return c.json(
        {
          success: false,
          error: 'Failed to generate migration guide',
        },
        500
      );
    }
  }
);

/**
 * 緊急時パスの生成
 */
function generateEmergencyPath(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'emergency';

  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * URL変更指示書の生成
 */
function generateMigrationGuide(currentPath: string | undefined, newPath: string) {
  const now = new Date().toISOString();

  return {
    title: 'Admin Secret URL Migration Guide',
    generatedAt: now,
    currentPath: currentPath || 'not_configured',
    newPath,
    steps: [
      {
        step: 1,
        title: 'Update Environment Variables',
        backend: {
          current: `ADMIN_SECRET_PATH=${currentPath || 'not_set'}`,
          new: `ADMIN_SECRET_PATH_NEXT=${newPath}`,
          note: 'Add new path as NEXT, keep current path for transition period',
        },
        frontend: {
          current: `NEXT_PUBLIC_ADMIN_SECRET_PATH=${currentPath || 'not_set'}`,
          new: `NEXT_PUBLIC_ADMIN_SECRET_PATH_NEXT=${newPath}`,
          note: 'Add new path as NEXT, keep current path for transition period',
        },
      },
      {
        step: 2,
        title: 'Deploy and Test',
        actions: [
          'Deploy backend with new environment variables',
          'Deploy frontend with new environment variables',
          `Test access via new URL: /admin-${newPath}/login`,
          'Verify old URL still works for transition period',
        ],
      },
      {
        step: 3,
        title: 'Complete Migration (After 24-48 hours)',
        backend: {
          old: `ADMIN_SECRET_PATH=${currentPath || 'not_set'}`,
          new: `ADMIN_SECRET_PATH=${newPath}`,
          remove: 'ADMIN_SECRET_PATH_NEXT',
        },
        frontend: {
          old: `NEXT_PUBLIC_ADMIN_SECRET_PATH=${currentPath || 'not_set'}`,
          new: `NEXT_PUBLIC_ADMIN_SECRET_PATH=${newPath}`,
          remove: 'NEXT_PUBLIC_ADMIN_SECRET_PATH_NEXT',
        },
      },
      {
        step: 4,
        title: 'Verify and Clean Up',
        actions: [
          'Test only new URL works',
          'Verify old URL returns 404',
          'Update bookmarks and saved URLs',
          'Document the change in security log',
        ],
      },
    ],
    securityNotes: [
      'Both URLs will work during transition period',
      'Monitor access logs for any suspicious activity',
      'Old URL should return 404 after final deployment',
      'Keep this guide secure and delete after migration',
    ],
  };
}

export { adminMonitoringRoutes };
