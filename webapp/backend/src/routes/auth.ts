/**
 * 管理者認証API
 * マイルストーン1: システム管理者認証基盤
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();

// ログインスキーマ
const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false)
});

// パスワード変更スキーマ
const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

// プロフィール更新スキーマ
const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  email: z.string().email().optional()
});

// POST /auth/login - 管理者ログイン
app.post(
  '/login',
  zValidator('json', LoginSchema),
  async (c) => {
    try {
      const body = c.req.valid('json');
      const { username, password, rememberMe } = body;

      // TODO: レート制限チェック
      // TODO: 管理者アカウント検索
      // TODO: パスワード検証
      // TODO: アクティブアカウントチェック
      // TODO: JWTトークン生成
      // TODO: セッション作成
      // TODO: ログイン時刻更新
      // TODO: アクティビティログ記録

      // モックレスポンス
      const mockAuthResult = {
        admin: {
          id: 'admin-001',
          username: username,
          email: 'admin@example.com',
          role: 'admin',
          permissions: [],
          isActive: true,
          isSuperAdmin: false,
          lastLoginAt: new Date().toISOString()
        },
        accessToken: 'mock-jwt-access-token',
        refreshToken: 'mock-jwt-refresh-token',
        expiresIn: 900 // 15分
      };

      return c.json({
        data: mockAuthResult,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Invalid credentials'
      }, 401);
    }
  }
);

// POST /auth/logout - ログアウト
app.post('/logout', async (c) => {
  try {
    // TODO: 認証ミドルウェアで管理者情報・トークン取得
    // TODO: セッション削除
    // TODO: アクティビティログ記録

    return c.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({
      error: 'Logout failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// POST /auth/refresh - トークン更新
app.post('/refresh', async (c) => {
  try {
    // TODO: リフレッシュトークン検証
    // TODO: セッション有効性チェック
    // TODO: 新しいアクセストークン生成
    // TODO: セッション更新

    const mockRefreshResult = {
      accessToken: 'new-mock-jwt-access-token',
      expiresIn: 900 // 15分
    };

    return c.json({
      data: mockRefreshResult,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({
      error: 'Token refresh failed',
      message: error instanceof Error ? error.message : 'Invalid refresh token'
    }, 401);
  }
});

// GET /auth/profile - 自身のプロフィール取得
app.get('/profile', async (c) => {
  try {
    // TODO: 認証ミドルウェアで管理者情報取得

    const mockProfile = {
      id: 'admin-001',
      username: 'admin1',
      email: 'admin1@example.com',
      role: 'admin',
      permissions: [],
      isActive: true,
      isSuperAdmin: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return c.json({ data: mockProfile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// PUT /auth/profile - 自身のプロフィール更新
app.put(
  '/profile',
  zValidator('json', UpdateProfileSchema),
  async (c) => {
    try {
      const body = c.req.valid('json');

      // TODO: 認証ミドルウェアで管理者情報取得
      // TODO: ユーザー名・メールアドレスの重複チェック
      // TODO: プロフィール更新
      // TODO: アクティビティログ記録

      const mockUpdatedProfile = {
        id: 'admin-001',
        username: body.username || 'admin1',
        email: body.email || 'admin1@example.com',
        role: 'admin',
        permissions: [],
        isActive: true,
        isSuperAdmin: false,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return c.json({
        data: mockUpdatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return c.json({
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }
);

// PUT /auth/password - パスワード変更
app.put(
  '/password',
  zValidator('json', ChangePasswordSchema),
  async (c) => {
    try {
      const body = c.req.valid('json');

      // TODO: 認証ミドルウェアで管理者情報取得
      // TODO: 現在のパスワード検証
      // TODO: 新しいパスワードのハッシュ化
      // TODO: パスワード更新
      // TODO: 全セッション無効化（セキュリティのため）
      // TODO: アクティビティログ記録

      return c.json({
        message: 'Password changed successfully. Please login again.'
      });
    } catch (error) {
      console.error('Password change error:', error);
      return c.json({
        error: 'Failed to change password',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }
);

// GET /auth/sessions - 自身のアクティブセッション一覧
app.get('/sessions', async (c) => {
  try {
    // TODO: 認証ミドルウェアで管理者情報取得
    // TODO: 管理者のアクティブセッション取得

    const mockSessions = [
      {
        id: 'session-001',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        isCurrent: true,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString()
      }
    ];

    return c.json({ data: mockSessions });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return c.json({
      error: 'Failed to fetch sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// DELETE /auth/sessions/:id - 特定セッション終了
app.delete('/sessions/:id', async (c) => {
  try {
    const sessionId = c.req.param('id');

    // TODO: 認証ミドルウェアで管理者情報取得
    // TODO: セッション所有者チェック
    // TODO: セッション削除
    // TODO: アクティビティログ記録

    return c.json({
      message: 'Session terminated successfully'
    });
  } catch (error) {
    console.error('Session termination error:', error);
    return c.json({
      error: 'Failed to terminate session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { app as auth };