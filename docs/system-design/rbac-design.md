# ロール別アクセス制御（RBAC）設計詳細

## 概要
神託のメソロギア管理システムにおけるロール別アクセス制御の詳細設計です。管理者の権限を適切に制御し、セキュリティを確保します。

## ロール定義

### 1. スーパー管理者（Super Admin）
**権限レベル**: 最高権限
```typescript
interface SuperAdminPermissions {
  // 管理者管理
  admin: {
    create: true;
    read: true;
    update: true;
    delete: true;
    updatePermissions: true;
    viewActivity: true;
  };
  
  // カード管理
  cards: {
    create: true;
    read: true;
    update: true;
    delete: true;
    bulkOperations: true;
    import: true;
  };
  
  // システム管理
  system: {
    viewLogs: true;
    updateSettings: true;
    maintenance: true;
    backup: true;
  };
}
```

### 2. カード管理者（Card Admin）
**権限レベル**: カードデータ管理権限
```typescript
interface CardAdminPermissions {
  // 管理者管理
  admin: {
    create: false;
    read: "self";  // 自分の情報のみ
    update: "self"; // 自分の情報のみ
    delete: false;
    updatePermissions: false;
    viewActivity: "self";
  };
  
  // カード管理
  cards: {
    create: true;
    read: true;
    update: true;
    delete: false;  // 論理削除のみ
    bulkOperations: true;
    import: true;
  };
  
  // システム管理
  system: {
    viewLogs: false;
    updateSettings: false;
    maintenance: false;
    backup: false;
  };
}
```

### 3. 閲覧者（Viewer）
**権限レベル**: 読み取り専用
```typescript
interface ViewerPermissions {
  // 管理者管理
  admin: {
    create: false;
    read: "self";
    update: false;
    delete: false;
    updatePermissions: false;
    viewActivity: false;
  };
  
  // カード管理
  cards: {
    create: false;
    read: true;
    update: false;
    delete: false;
    bulkOperations: false;
    import: false;
  };
  
  // システム管理
  system: {
    viewLogs: false;
    updateSettings: false;
    maintenance: false;
    backup: false;
  };
}
```

## 権限チェック実装

### 1. ミドルウェア実装
```typescript
// src/middleware/rbac.middleware.ts

export const checkPermission = (
  resource: string,
  action: string
) => async (c: Context, next: Next) => {
  const admin = c.get('admin');
  
  if (!admin) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // スーパー管理者は全権限を持つ
  if (admin.is_super_admin) {
    await next();
    return;
  }
  
  // 権限マトリックスから確認
  const hasPermission = await checkAdminPermission(
    admin.id,
    resource,
    action,
    c.req.param()
  );
  
  if (!hasPermission) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  await next();
};
```

### 2. 権限チェック関数
```typescript
// src/utils/permissions.ts

interface PermissionContext {
  adminId: string;
  resource: string;
  action: string;
  targetId?: string;
}

export async function checkAdminPermission(
  adminId: string,
  resource: string,
  action: string,
  params: Record<string, string>
): Promise<boolean> {
  const admin = await getAdminWithPermissions(adminId);
  
  // カスタム権限チェック
  if (admin.permissions && admin.permissions[resource]) {
    const resourcePermissions = admin.permissions[resource];
    
    // "self"の場合の処理
    if (resourcePermissions[action] === "self") {
      return params.id === adminId;
    }
    
    return resourcePermissions[action] === true;
  }
  
  // デフォルトロール権限チェック
  const rolePermissions = getRolePermissions(admin.role);
  return checkRolePermission(rolePermissions, resource, action, {
    adminId,
    targetId: params.id
  });
}
```

### 3. 動的権限付与
```typescript
// src/services/admin-permissions.service.ts

export class AdminPermissionService {
  // カスタム権限の付与
  async grantPermission(
    adminId: string,
    resource: string,
    action: string,
    scope: 'all' | 'self' | string[]
  ): Promise<void> {
    const admin = await this.adminRepo.findById(adminId);
    
    if (!admin.permissions) {
      admin.permissions = {};
    }
    
    if (!admin.permissions[resource]) {
      admin.permissions[resource] = {};
    }
    
    admin.permissions[resource][action] = scope;
    
    await this.adminRepo.update(adminId, {
      permissions: admin.permissions
    });
    
    // 権限変更をログに記録
    await this.logPermissionChange(adminId, resource, action, scope);
  }
  
  // 権限の取り消し
  async revokePermission(
    adminId: string,
    resource: string,
    action?: string
  ): Promise<void> {
    const admin = await this.adminRepo.findById(adminId);
    
    if (!admin.permissions || !admin.permissions[resource]) {
      return;
    }
    
    if (action) {
      delete admin.permissions[resource][action];
    } else {
      delete admin.permissions[resource];
    }
    
    await this.adminRepo.update(adminId, {
      permissions: admin.permissions
    });
  }
}
```

## API エンドポイントへの適用

### 1. ルート定義での権限設定
```typescript
// src/routes/admin.routes.ts

// 管理者一覧（スーパー管理者のみ）
app.get('/api/admin/admins',
  authMiddleware,
  checkPermission('admin', 'read'),
  adminController.list
);

// 管理者作成（スーパー管理者のみ）
app.post('/api/admin/admins',
  authMiddleware,
  checkPermission('admin', 'create'),
  adminController.create
);

// 管理者更新（自分またはスーパー管理者）
app.put('/api/admin/admins/:id',
  authMiddleware,
  checkPermission('admin', 'update'),
  adminController.update
);

// カード作成（カード管理権限必要）
app.post('/api/admin/cards',
  authMiddleware,
  checkPermission('cards', 'create'),
  cardController.create
);
```

### 2. コントローラーでの追加チェック
```typescript
// src/controllers/admin.controller.ts

export class AdminController {
  async update(c: Context) {
    const adminId = c.req.param('id');
    const currentAdmin = c.get('admin');
    const data = await c.req.json();
    
    // 権限変更の場合は追加チェック
    if (data.permissions || data.role) {
      if (!currentAdmin.is_super_admin) {
        return c.json({ error: 'Only super admin can change permissions' }, 403);
      }
    }
    
    // パスワード変更の場合
    if (data.password) {
      // 自分のパスワードか、スーパー管理者のみ変更可能
      if (adminId !== currentAdmin.id && !currentAdmin.is_super_admin) {
        return c.json({ error: 'Cannot change other admin password' }, 403);
      }
    }
    
    // 更新処理
    const updated = await this.adminService.update(adminId, data);
    return c.json(updated);
  }
}
```

## 権限マトリックス

| リソース | アクション | スーパー管理者 | カード管理者 | 閲覧者 |
|---------|-----------|--------------|-------------|--------|
| **管理者管理** |
| admins | create | ✅ | ❌ | ❌ |
| admins | read | ✅ (all) | ✅ (self) | ✅ (self) |
| admins | update | ✅ (all) | ✅ (self) | ❌ |
| admins | delete | ✅ | ❌ | ❌ |
| admins | updatePermissions | ✅ | ❌ | ❌ |
| **カード管理** |
| cards | create | ✅ | ✅ | ❌ |
| cards | read | ✅ | ✅ | ✅ |
| cards | update | ✅ | ✅ | ❌ |
| cards | delete | ✅ | ❌ | ❌ |
| cards | import | ✅ | ✅ | ❌ |
| **システム管理** |
| system | viewLogs | ✅ | ❌ | ❌ |
| system | settings | ✅ | ❌ | ❌ |
| system | maintenance | ✅ | ❌ | ❌ |

## セキュリティ考慮事項

### 1. 権限昇格の防止
```typescript
// 自己権限昇格の防止
if (targetAdminId === currentAdmin.id && !currentAdmin.is_super_admin) {
  // 自分の権限は変更できない
  throw new ForbiddenError('Cannot modify own permissions');
}
```

### 2. 権限の継承
```typescript
// 作成者の権限を超える権限は付与できない
if (!currentAdmin.is_super_admin) {
  const maxPermissions = getCurrentAdminPermissions(currentAdmin);
  validatePermissionsSubset(requestedPermissions, maxPermissions);
}
```

### 3. 監査ログ
```typescript
// すべての権限変更を記録
interface PermissionAuditLog {
  admin_id: string;
  action: 'grant' | 'revoke';
  target_admin_id: string;
  resource: string;
  permission: string;
  old_value: any;
  new_value: any;
  timestamp: Date;
}
```

## 実装チェックリスト

- [ ] 基本的なロール定義（3種類）
- [ ] 権限チェックミドルウェア
- [ ] 動的権限付与システム
- [ ] API エンドポイントへの適用
- [ ] 権限変更の監査ログ
- [ ] 権限昇格の防止機能
- [ ] セルフサービス機能の制限
- [ ] 権限のキャッシュ機構
- [ ] 権限の一括更新機能
- [ ] 権限レポート機能

## テストシナリオ

### 1. 基本的な権限チェック
- スーパー管理者が全リソースにアクセスできる
- カード管理者がカードCRUD操作できる
- 閲覧者が読み取りのみできる

### 2. セルフサービス制限
- 一般管理者が自分の情報のみ更新できる
- 一般管理者が他の管理者情報にアクセスできない
- 自己権限昇格ができない

### 3. 権限の動的変更
- スーパー管理者が権限を付与/取り消しできる
- 権限変更が即座に反映される
- 権限変更履歴が記録される