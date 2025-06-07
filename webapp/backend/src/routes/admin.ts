/**
 * 管理者アカウント管理API
 * マイルストーン1: システム管理者認証基盤
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { 
  CreateAdminSchema,
  UpdateAdminSchema,
  AdminListFiltersSchema
} from '@mythologia/shared';

const app = new Hono();

// クエリパラメータ用のスキーマ（シンプル版）
const AdminListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum(['admin', 'super_admin']).optional(),
  isActive: z.string().optional(),
  createdBy: z.string().optional()
});

// GET /admin/admins - 管理者一覧取得
app.get(
  '/',
  async (c) => {
    try {
      const query = c.req.query();
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '20', 10);
      const offset = (page - 1) * limit;
      const filters = {
        role: query.role as 'admin' | 'super_admin' | undefined,
        isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
        createdBy: query.createdBy
      };

      // TODO: 認証ミドルウェアで管理者情報を取得
      // TODO: スーパー管理者権限チェック
      
      // TODO: AdminRepositoryを使用してデータ取得
      const mockResult = {
        admins: [
          {
            id: 'admin-001',
            username: 'admin1',
            email: 'admin1@example.com',
            role: 'admin',
            permissions: [],
            isActive: true,
            isSuperAdmin: false,
            createdBy: 'super-admin',
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        total: 1,
        page,
        limit,
        totalPages: 1
      };

      return c.json({
        data: mockResult.admins,
        pagination: {
          page: mockResult.page,
          limit: mockResult.limit,
          total: mockResult.total,
          totalPages: mockResult.totalPages
        }
      });
    } catch (error) {
      console.error('Admin list error:', error);
      return c.json({
        error: 'Failed to retrieve admin list',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }
);

// GET /admin/admins/:id - 管理者詳細取得
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // TODO: 認証ミドルウェアで管理者情報を取得
    // TODO: 権限チェック（自分自身またはスーパー管理者）
    
    // TODO: AdminRepositoryを使用してデータ取得
    const mockAdmin = {
      id,
      username: 'admin1',
      email: 'admin1@example.com',
      role: 'admin',
      permissions: [],
      isActive: true,
      isSuperAdmin: false,
      createdBy: 'super-admin',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return c.json({ data: mockAdmin });
  } catch (error) {
    console.error('Admin detail error:', error);
    return c.json({
      error: 'Failed to retrieve admin details',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// POST /admin/admins - 管理者作成
app.post(
  '/',
  zValidator('json', CreateAdminSchema),
  async (c) => {
    try {
      const body = c.req.valid('json');

      // TODO: 認証ミドルウェアで管理者情報を取得
      // TODO: スーパー管理者権限チェック
      
      // TODO: パスワードハッシュ化
      // TODO: AdminRepositoryを使用してデータ作成
      
      const mockNewAdmin = {
        id: 'new-admin-id',
        username: body.username,
        email: body.email,
        role: body.role,
        permissions: body.permissions,
        isActive: true,
        isSuperAdmin: body.isSuperAdmin,
        createdBy: 'current-admin-id',
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return c.json({ 
        data: mockNewAdmin,
        message: 'Admin created successfully'
      }, 201);
    } catch (error) {
      console.error('Admin creation error:', error);
      return c.json({
        error: 'Failed to create admin',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }
);

// PUT /admin/admins/:id - 管理者更新
app.put(
  '/:id',
  zValidator('json', UpdateAdminSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const body = c.req.valid('json');

      // TODO: 認証ミドルウェアで管理者情報を取得
      // TODO: 権限チェック（自分自身またはスーパー管理者）
      
      // TODO: パスワードハッシュ化（パスワード更新時）
      // TODO: AdminRepositoryを使用してデータ更新
      
      const mockUpdatedAdmin = {
        id,
        username: body.username || 'admin1',
        email: body.email || 'admin1@example.com',
        role: body.role || 'admin',
        permissions: body.permissions || [],
        isActive: body.isActive ?? true,
        isSuperAdmin: body.isSuperAdmin ?? false,
        createdBy: 'super-admin',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return c.json({ 
        data: mockUpdatedAdmin,
        message: 'Admin updated successfully'
      });
    } catch (error) {
      console.error('Admin update error:', error);
      return c.json({
        error: 'Failed to update admin',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }
);

// DELETE /admin/admins/:id - 管理者無効化
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // TODO: 認証ミドルウェアで管理者情報を取得
    // TODO: スーパー管理者権限チェック
    // TODO: 自分自身を無効化しようとしていないかチェック
    
    // TODO: AdminRepositoryを使用してソフトデリート（is_active = false）
    
    return c.json({ 
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    console.error('Admin deactivation error:', error);
    return c.json({
      error: 'Failed to deactivate admin',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /admin/admins/:id/activity - 管理者アクティビティ履歴
app.get('/:id/activity', async (c) => {
  try {
    const id = c.req.param('id');
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;

    // TODO: 認証ミドルウェアで管理者情報を取得
    // TODO: 権限チェック（自分自身またはスーパー管理者）
    
    // TODO: AdminRepositoryを使用してアクティビティ取得
    
    const mockActivity = {
      logs: [
        {
          id: 'log-001',
          adminId: id,
          action: 'login',
          targetType: null,
          targetId: null,
          details: { ip: '192.168.1.1' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          createdAt: new Date().toISOString()
        }
      ],
      total: 1,
      page,
      limit,
      totalPages: 1
    };

    return c.json({
      data: mockActivity.logs,
      pagination: {
        page: mockActivity.page,
        limit: mockActivity.limit,
        total: mockActivity.total,
        totalPages: mockActivity.totalPages
      }
    });
  } catch (error) {
    console.error('Admin activity error:', error);
    return c.json({
      error: 'Failed to retrieve admin activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { app as admin };