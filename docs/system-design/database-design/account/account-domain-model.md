# アカウント管理システム - ドメインモデル設計

## 概要

神託のメソロギア（Mythologia）非公式Webアプリケーションのアカウント管理システムにおけるドメインモデル設計です。
ドメイン駆動設計（DDD）のアプローチを採用し、ビジネスルールとドメインロジックを明確に分離しています。

## ドメインエンティティ

### 1. Admin（管理者）

システム管理者を表現するルートアグリゲート。

```typescript
export interface Admin {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  permissions: AdminPermissionDTO[];
  isActive: boolean;
  isSuperAdmin: boolean;
  createdBy: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### プロパティ仕様

| プロパティ | 型 | 説明 | ビジネスルール |
|------------|----|----- |----------------|
| id | string | 管理者の一意識別子 | UUID形式、システム生成 |
| username | string | ログイン用ユーザー名 | 3-50文字、英数字・ハイフン・アンダースコアのみ |
| email | string | メールアドレス | RFC準拠、システム内一意 |
| passwordHash | string | ハッシュ化されたパスワード | bcrypt、平文は保存しない |
| role | AdminRole | 管理者ロール | 'admin' または 'super_admin' |
| permissions | AdminPermissionDTO[] | 詳細権限リスト | リソース・アクション単位の権限配列 |
| isActive | boolean | アカウント有効性 | 無効化による論理削除対応 |
| isSuperAdmin | boolean | スーパー管理者フラグ | 全権限を持つ特権管理者 |
| createdBy | string \| null | 作成者管理者ID | 監査証跡、自己参照 |
| lastLoginAt | Date \| null | 最終ログイン日時 | セキュリティ監視用 |
| createdAt | Date | 作成日時 | 監査証跡 |
| updatedAt | Date | 更新日時 | 監査証跡 |

### 2. AdminSession（管理者セッション）

管理者の認証セッションを管理するエンティティ。

```typescript
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
```

#### プロパティ仕様

| プロパティ | 型 | 説明 | ビジネスルール |
|------------|----|----- |----------------|
| id | string | セッションの一意識別子 | UUID形式 |
| adminId | string | 関連管理者ID | Adminエンティティへの外部参照 |
| refreshToken | string | JWTリフレッシュトークン | システム内一意、暗号化推奨 |
| expiresAt | Date | セッション有効期限 | 自動無効化の基準 |
| ipAddress | string \| null | ログイン元IPアドレス | セキュリティ監視、IPv4/IPv6対応 |
| userAgent | string \| null | ユーザーエージェント | デバイス識別、セキュリティ監視 |
| isActive | boolean | セッション有効性 | 手動無効化（ログアウト）対応 |
| createdAt | Date | セッション開始日時 | 監査証跡 |

### 3. AdminActivityLog（管理者アクティビティログ）

管理者の操作履歴を記録するイベントエンティティ。

```typescript
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
```

#### プロパティ仕様

| プロパティ | 型 | 説明 | ビジネスルール |
|------------|----|----- |----------------|
| id | string | ログの一意識別子 | UUID形式 |
| adminId | string | 実行者管理者ID | Adminエンティティへの外部参照 |
| action | string | 実行されたアクション | login, create_admin, update_card等 |
| targetType | string \| null | 操作対象のタイプ | admin, card, user等 |
| targetId | string \| null | 操作対象の識別子 | 対象エンティティのID |
| details | Record<string, any> \| null | 操作詳細情報 | JSON形式、変更内容等 |
| ipAddress | string \| null | 操作元IPアドレス | セキュリティ監視 |
| userAgent | string \| null | ユーザーエージェント | デバイス識別 |
| createdAt | Date | ログ記録日時 | 監査証跡、変更不可 |

## 値オブジェクト（Value Objects）

### 1. AdminPassword

パスワードの妥当性とセキュリティルールを担保する値オブジェクト。

```typescript
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
```

#### バリデーションルール
- **最小長**: 8文字以上
- **複雑性**: 大文字・小文字・数字を各1文字以上含む
- **不正値拒否**: 条件を満たさない場合は例外をスロー

### 2. AdminEmail

メールアドレスの形式妥当性を担保する値オブジェクト。

```typescript
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
```

#### バリデーションルール
- **形式検証**: RFC準拠の基本形式チェック
- **特殊文字**: スペース・@マークの適切な配置確認

### 3. AdminUsername

ユーザー名の命名規則と制約を担保する値オブジェクト。

```typescript
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
```

#### バリデーションルール
- **文字数**: 3-50文字
- **文字種**: 英数字・アンダースコア・ハイフンのみ
- **予約語**: システム予約語の使用禁止（実装時に拡張）

## ドメインサービス

### 1. AdminFactory

管理者エンティティの作成と初期化を担当するファクトリークラス。

```typescript
export class AdminFactory {
  static createNewAdmin(params: {
    username: string;
    email: string;
    password: string;
    role?: AdminRole;
    permissions?: AdminPermissionDTO[];
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

  static validatePermissions(permissions: AdminPermissionDTO[]): boolean {
    const validResources: AdminPermissionDTO['resource'][] = ['cards', 'users', 'admins', 'system'];
    const validActions: AdminPermissionDTO['actions'][number][] = ['create', 'read', 'update', 'delete'];

    return permissions.every(permission => 
      validResources.includes(permission.resource) &&
      permission.actions.every(action => validActions.includes(action))
    );
  }
}
```

#### 責務
- **値オブジェクトによる検証**: 入力値の妥当性確認
- **デフォルト値設定**: ビジネスルールに基づく初期値設定
- **権限検証**: 権限設定の妥当性確認

### 2. AdminPermissionChecker

管理者の権限チェックを担当するドメインサービス。

```typescript
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

  static canViewResource(admin: Admin, resource: AdminPermissionDTO['resource']): boolean {
    return admin.isSuperAdmin ||
           admin.permissions.some(p => 
             p.resource === resource && 
             p.actions.includes('read')
           );
  }

  static canPerformAction(
    admin: Admin, 
    resource: AdminPermissionDTO['resource'], 
    action: AdminPermissionDTO['actions'][number]
  ): boolean {
    return admin.isSuperAdmin ||
           admin.permissions.some(p => 
             p.resource === resource && 
             p.actions.includes(action)
           );
  }
}
```

#### 権限チェックロジック
- **スーパー管理者**: 全ての操作に対してtrue
- **リソース権限**: 特定リソースへの操作権限チェック
- **アクション権限**: 具体的なアクション（CRUD）権限チェック

## ビジネスルール

### 1. アカウント管理ルール

#### 作成ルール
- スーパー管理者のみが他の管理者を作成可能
- 初回管理者は特別なセットアップフローで作成
- 作成者情報は監査証跡として記録

#### 更新ルール
- 自分自身のプロフィール更新は常に可能
- 他者の権限変更はスーパー管理者のみ
- パスワード変更は本人確認必須

#### 削除ルール
- 物理削除は実行しない（論理削除のみ）
- 自分自身の削除は禁止
- 最後のスーパー管理者の削除は禁止

### 2. 認証・セッション管理ルール

#### ログインルール
- アクティブなアカウントのみログイン可能
- パスワード試行回数制限（レート制限）
- セッション数制限（同時ログイン数）

#### セッション管理ルール
- リフレッシュトークンの有効期限は30日
- 自動延長は行わない（明示的な更新のみ）
- ログアウト時は即座に無効化

#### パスワード管理ルール
- 定期的な変更推奨（90日）
- 過去のパスワードの再利用禁止（履歴管理）
- 初期パスワードの強制変更

### 3. 権限管理ルール

#### 権限階層
```
super_admin > admin
```

#### リソース権限
- **cards**: カード管理権限
- **users**: ユーザー管理権限
- **admins**: 管理者管理権限（スーパー管理者のみ）
- **system**: システム設定権限

#### アクション権限
- **create**: 作成権限
- **read**: 閲覧権限
- **update**: 更新権限
- **delete**: 削除権限

### 4. 監査ログルール

#### 記録対象
- 全ての管理者操作（ログイン・ログアウト含む）
- データ変更操作（作成・更新・削除）
- 権限変更操作
- システム設定変更

#### 記録内容
- 実行者（adminId）
- 実行アクション（action）
- 操作対象（targetType, targetId）
- 詳細情報（details）
- 環境情報（ipAddress, userAgent）
- 実行日時（createdAt）

#### 保持期間
- 通常ログ: 1年間
- セキュリティ関連: 3年間
- 法的要件に応じて調整

## ドメインイベント

### 1. 管理者関連イベント

#### AdminCreated
```typescript
interface AdminCreated {
  adminId: string;
  createdBy: string;
  timestamp: Date;
}
```

#### AdminUpdated
```typescript
interface AdminUpdated {
  adminId: string;
  updatedBy: string;
  changes: Partial<Admin>;
  timestamp: Date;
}
```

#### AdminDeactivated
```typescript
interface AdminDeactivated {
  adminId: string;
  deactivatedBy: string;
  reason?: string;
  timestamp: Date;
}
```

### 2. 認証関連イベント

#### AdminLoggedIn
```typescript
interface AdminLoggedIn {
  adminId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

#### AdminLoggedOut
```typescript
interface AdminLoggedOut {
  adminId: string;
  sessionId: string;
  timestamp: Date;
}
```

#### PasswordChanged
```typescript
interface PasswordChanged {
  adminId: string;
  changedBy: string;
  timestamp: Date;
}
```

## エラーハンドリング

### 1. AdminAuthError

認証関連のドメインエラー。

```typescript
export class AdminAuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_INACTIVE' | 'TOKEN_EXPIRED' | 'INVALID_TOKEN'
  ) {
    super(message);
    this.name = 'AdminAuthError';
  }
}
```

#### エラーコード
- **INVALID_CREDENTIALS**: 認証情報が無効
- **ACCOUNT_LOCKED**: アカウントがロック状態
- **ACCOUNT_INACTIVE**: アカウントが無効状態
- **TOKEN_EXPIRED**: トークンが期限切れ
- **INVALID_TOKEN**: トークンが無効

### 2. バリデーションエラー

値オブジェクトや制約違反によるエラー。

```typescript
// 値オブジェクトでの例外
throw new Error('Password must be at least 8 characters long');
throw new Error('Invalid email format');
throw new Error('Username must be between 3 and 50 characters');
```

## アグリゲート設計

### 1. Admin アグリゲート

```
Admin (Root)
├── AdminSession (Entity)
└── AdminActivityLog (Entity)
```

#### 整合性境界
- 管理者の状態変更（アクティブ/非アクティブ）
- セッション管理（作成・無効化）
- アクティビティログの記録

#### 不変条件
- アクティブな管理者のみがログイン可能
- セッションは有効な管理者にのみ紐づく
- 全ての操作はアクティビティログに記録される

### 2. トランザクション境界

#### 管理者作成トランザクション
1. 管理者エンティティ作成
2. 初期セッション作成（任意）
3. 作成ログ記録

#### ログイントランザクション
1. 認証情報検証
2. セッション作成
3. 最終ログイン時刻更新
4. ログインログ記録

#### ログアウトトランザクション
1. セッション無効化
2. ログアウトログ記録

## 実装考慮事項

### 1. 型安全性
- TypeScriptの型システムを最大限活用
- 共有型定義（@mythologia/shared）の使用
- 実行時バリデーション（Zod）との整合性

### 2. パフォーマンス
- 権限チェックの最適化（キャッシュ活用）
- ログテーブルの肥大化対策（パーティショニング）
- インデックス設計の最適化

### 3. 拡張性
- 新しい権限リソースの追加容易性
- ロール階層の拡張対応
- 外部認証システムとの統合準備

### 4. セキュリティ
- パスワードの平文保存禁止
- セッショントークンの安全な管理
- 権限エスカレーション攻撃の防止
- SQLインジェクション対策

この設計により、セキュアで拡張性の高い管理者アカウント管理システムを実現します。