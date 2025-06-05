/**
 * 管理者ドメインモデル
 * マイルストーン1: システム管理者認証基盤
 */

export interface AdminPermission {
  resource: string;
  actions: string[];
}

export type AdminRole = 'admin' | 'super_admin';

export interface Admin {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  isSuperAdmin: boolean;
  createdBy: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSession {
  id: string;
  adminId: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// ドメインロジック用の値オブジェクト
export class AdminPassword {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (this.value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.value)) {
      throw new Error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class AdminEmail {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error('Invalid email format');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class AdminUsername {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (this.value.length < 3 || this.value.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(this.value)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
  }

  getValue(): string {
    return this.value;
  }
}

// 管理者作成用のファクトリー
export class AdminFactory {
  static createNewAdmin(params: {
    username: string;
    email: string;
    password: string;
    role?: AdminRole;
    permissions?: AdminPermission[];
    createdBy?: string;
    isSuperAdmin?: boolean;
  }): Omit<Admin, 'id' | 'createdAt' | 'updatedAt'> {
    const username = new AdminUsername(params.username);
    const email = new AdminEmail(params.email);
    // パスワードのバリデーションのみ実行
    new AdminPassword(params.password);

    return {
      username: username.getValue(),
      email: email.getValue(),
      passwordHash: '', // ハッシュ化は別途実行
      role: params.role || 'admin',
      permissions: params.permissions || [],
      isActive: true,
      isSuperAdmin: params.isSuperAdmin || false,
      createdBy: params.createdBy || null,
      lastLoginAt: null,
    };
  }

  static validatePermissions(permissions: AdminPermission[]): boolean {
    const validResources = ['cards', 'users', 'admins', 'system'];
    const validActions = ['create', 'read', 'update', 'delete'];

    return permissions.every(permission => 
      validResources.includes(permission.resource) &&
      permission.actions.every(action => validActions.includes(action))
    );
  }
}

// 管理者権限チェックユーティリティ
export class AdminPermissionChecker {
  static canManageAdmins(admin: Admin): boolean {
    return admin.isSuperAdmin;
  }

  static canManageCards(admin: Admin): boolean {
    return admin.isSuperAdmin || 
           admin.permissions.some(p => 
             p.resource === 'cards' && 
             (p.actions.includes('create') || p.actions.includes('update') || p.actions.includes('delete'))
           );
  }

  static canViewResource(admin: Admin, resource: string): boolean {
    return admin.isSuperAdmin ||
           admin.permissions.some(p => 
             p.resource === resource && 
             p.actions.includes('read')
           );
  }

  static canPerformAction(admin: Admin, resource: string, action: string): boolean {
    return admin.isSuperAdmin ||
           admin.permissions.some(p => 
             p.resource === resource && 
             p.actions.includes(action)
           );
  }
}

// 管理者認証結果
export interface AdminAuthResult {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 管理者認証エラー
export class AdminAuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_INACTIVE' | 'TOKEN_EXPIRED' | 'INVALID_TOKEN'
  ) {
    super(message);
    this.name = 'AdminAuthError';
  }
}