/**
 * テストセットアップファイル
 * 共通のテスト設定とユーティリティ
 */

import { Hono } from 'hono';
import type { AdminDTO, CreateAdminDTO, LoginDTO } from '@mythologia/shared';

// テスト用のアプリケーション作成関数
export function createTestApp(): Hono {
  const app = new Hono();

  // 既存のルートを読み込む
  // 注意: 実際の実装では、src/index.ts からルートを import する
  
  // テスト用のモックレスポンス（実際の実装が完了するまでの暫定）
  
  // 認証API
  app.post('/api/admin/auth/login', async (c) => {
    const body = await c.req.json() as LoginDTO;
    
    // モック認証ロジック
    if (body.username === 'superadmin' && body.password === 'SuperAdmin123!') {
      return c.json({
        admin: {
          id: 'admin-001',
          username: 'superadmin',
          email: 'superadmin@example.com',
          role: 'super_admin',
          permissions: [],
          isActive: true,
          isSuperAdmin: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        accessToken: 'mock.access.token.admin-001',
        refreshToken: 'mock.refresh.token.admin-001',
        expiresIn: 900
      });
    }
    
    return c.json({ error: 'Invalid credentials' }, 401);
  });

  app.post('/api/admin/auth/logout', async (c) => {
    return c.json({ success: true });
  });

  app.post('/api/admin/auth/refresh', async (c) => {
    return c.json({
      accessToken: 'mock.access.token.refreshed',
      expiresIn: 900
    });
  });

  app.get('/api/admin/auth/profile', async (c) => {
    return c.json({
      id: 'admin-001',
      username: 'superadmin',
      email: 'superadmin@example.com',
      role: 'super_admin',
      permissions: [],
      isActive: true,
      isSuperAdmin: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  app.put('/api/admin/auth/profile', async (c) => {
    const body = await c.req.json();
    return c.json({
      id: 'admin-001',
      username: body.username || 'superadmin',
      email: body.email || 'superadmin@example.com',
      role: 'super_admin',
      permissions: [],
      isActive: true,
      isSuperAdmin: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  app.put('/api/admin/auth/password', async (c) => {
    return c.json({ success: true });
  });

  app.get('/api/admin/auth/sessions', async (c) => {
    return c.json({
      sessions: [
        {
          id: 'session-001',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser',
          isCurrent: true,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString()
        }
      ],
      total: 1
    });
  });

  app.delete('/api/admin/auth/sessions/:id', async (c) => {
    return c.json({ success: true });
  });

  // 管理者API
  app.get('/api/admin/admins', async (c) => {
    const query = c.req.query();
    return c.json({
      admins: [
        {
          id: 'admin-001',
          username: 'superadmin',
          email: 'superadmin@example.com',
          role: 'super_admin',
          permissions: [],
          isActive: true,
          isSuperAdmin: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'admin-002',
          username: 'cardadmin',
          email: 'cardadmin@example.com',
          role: 'admin',
          permissions: [{ resource: 'cards', actions: ['create', 'read', 'update', 'delete'] }],
          isActive: true,
          isSuperAdmin: false,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      total: 2,
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '20'),
      totalPages: 1
    });
  });

  app.get('/api/admin/admins/:id', async (c) => {
    const id = c.req.param('id');
    
    if (id === 'nonexistent') {
      return c.json({ error: 'Admin not found' }, 404);
    }
    
    return c.json({
      id: id,
      username: 'testadmin',
      email: 'test@example.com',
      role: 'admin',
      permissions: [],
      isActive: true,
      isSuperAdmin: false,
      createdBy: 'admin-001',
      createdByName: 'superadmin',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  app.post('/api/admin/admins', async (c) => {
    const body = await c.req.json() as CreateAdminDTO;
    
    // バリデーション（簡易版）
    if (!body.username || body.username.length < 3) {
      return c.json({ 
        error: 'Validation failed',
        errors: [{ field: 'username', message: 'Username must be at least 3 characters' }]
      }, 400);
    }
    
    if (!body.email || !body.email.includes('@')) {
      return c.json({ 
        error: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email format' }]
      }, 400);
    }
    
    if (!body.password || body.password.length < 8) {
      return c.json({ 
        error: 'Validation failed',
        errors: [{ field: 'password', message: 'Password must be at least 8 characters' }]
      }, 400);
    }
    
    return c.json({
      id: 'admin-new',
      username: body.username,
      email: body.email,
      role: body.role || 'admin',
      permissions: body.permissions || [],
      isActive: true,
      isSuperAdmin: body.isSuperAdmin || false,
      createdBy: 'admin-001',
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, 201);
  });

  app.put('/api/admin/admins/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    return c.json({
      id: id,
      username: body.username || 'updatedadmin',
      email: body.email || 'updated@example.com',
      role: body.role || 'admin',
      permissions: body.permissions || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      isSuperAdmin: body.isSuperAdmin || false,
      createdBy: 'admin-001',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  app.delete('/api/admin/admins/:id', async (c) => {
    return c.json({ success: true });
  });

  app.get('/api/admin/admins/:id/activity', async (c) => {
    const id = c.req.param('id');
    const query = c.req.query();
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    
    return c.json({
      activities: [
        {
          id: 'activity-001',
          adminId: id,
          adminName: 'testadmin',
          action: 'login',
          targetType: null,
          targetId: null,
          details: null,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser',
          createdAt: new Date().toISOString()
        }
      ],
      total: 1,
      page: page,
      limit: limit,
      totalPages: 1
    });
  });

  return app;
}

// テストデータ生成ユーティリティ
export const TestData = {
  validLogin: {
    username: 'superadmin',
    password: 'SuperAdmin123!',
    rememberMe: false
  },
  
  invalidLogin: {
    username: 'invalid',
    password: 'wrong',
    rememberMe: false
  },
  
  validAdmin: {
    username: 'newadmin',
    email: 'newadmin@example.com',
    password: 'NewAdmin123!',
    role: 'admin' as const,
    permissions: [
      {
        resource: 'cards' as const,
        actions: ['read', 'update'] as const
      }
    ],
    isSuperAdmin: false
  },
  
  invalidAdmin: {
    username: 'ab', // 短すぎる
    email: 'invalid-email',
    password: 'weak',
    role: 'invalid_role'
  },
  
  profileUpdate: {
    username: 'newusername',
    email: 'newemail@example.com'
  },
  
  passwordChange: {
    currentPassword: 'oldpassword',
    newPassword: 'NewPassword123!'
  }
};

// アサーションヘルパー
export const AssertionHelpers = {
  expectSuccessResponse: (response: any) => {
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
  },
  
  expectErrorResponse: (response: any, expectedStatus: number) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.headers.get('content-type')).toContain('application/json');
  },
  
  expectValidAdmin: (admin: any) => {
    expect(admin).toHaveProperty('id');
    expect(admin).toHaveProperty('username');
    expect(admin).toHaveProperty('email');
    expect(admin).toHaveProperty('role');
    expect(admin).toHaveProperty('permissions');
    expect(admin).toHaveProperty('isActive');
    expect(admin).toHaveProperty('isSuperAdmin');
    expect(admin).toHaveProperty('createdAt');
    expect(admin).toHaveProperty('updatedAt');
  },
  
  expectValidAuthResult: (result: any) => {
    expect(result).toHaveProperty('admin');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('expiresIn');
    AssertionHelpers.expectValidAdmin(result.admin);
  }
};