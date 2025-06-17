# 管理者ページ構成設計

## 概要

このドキュメントは、管理者用Webページのパス構成、レイアウト、ナビゲーション設計を定義します。

## ページパス構成

### 基本構成

```
/admin/
├── login                           # ログインページ（非認証）
├── (authenticated)/                # 認証済みエリア
│   ├── dashboard/                  # ダッシュボード
│   ├── users/                      # ユーザー管理
│   ├── content/                    # コンテンツ管理
│   ├── system/                     # システム設定
│   ├── logs/                       # ログ・監査
│   └── profile/                    # プロフィール設定
└── 404                            # 管理者用404ページ
```

### 詳細パス設計

#### 1. 認証関連
```
/admin/login                        # ログインページ
/admin/logout                       # ログアウト処理（リダイレクト）
```

#### 2. ダッシュボード
```
/admin/dashboard                    # メインダッシュボード
/admin/dashboard/stats              # 統計情報詳細
/admin/dashboard/alerts             # アラート管理
```

#### 3. ユーザー管理
```
/admin/users                        # ユーザー一覧
/admin/users/[id]                   # ユーザー詳細
/admin/users/[id]/edit              # ユーザー編集
/admin/users/create                 # 新規ユーザー作成
/admin/users/bulk                   # 一括操作
```

#### 4. 管理者管理
```
/admin/admins                       # 管理者一覧
/admin/admins/[id]                  # 管理者詳細
/admin/admins/[id]/edit             # 管理者編集
/admin/admins/create                # 新規管理者作成
/admin/admins/roles                 # ロール管理
/admin/admins/permissions           # 権限管理
```

#### 5. コンテンツ管理
```
/admin/content/                     # コンテンツ管理トップ
/admin/content/cards                # カード管理
/admin/content/cards/[id]           # カード詳細
/admin/content/cards/[id]/edit      # カード編集
/admin/content/cards/create         # 新規カード作成
/admin/content/cards/import         # カード一括インポート
/admin/content/cards/export         # カード一括エクスポート

/admin/content/news                 # お知らせ管理
/admin/content/news/[id]            # お知らせ詳細
/admin/content/news/[id]/edit       # お知らせ編集
/admin/content/news/create          # 新規お知らせ作成

/admin/content/faq                  # FAQ管理
/admin/content/faq/[id]             # FAQ詳細
/admin/content/faq/[id]/edit        # FAQ編集
/admin/content/faq/create           # 新規FAQ作成

/admin/content/pages                # 静的ページ管理
/admin/content/pages/[slug]         # ページ詳細
/admin/content/pages/[slug]/edit    # ページ編集
/admin/content/pages/create         # 新規ページ作成
```

#### 6. ゲームデータ管理
```
/admin/gamedata/                    # ゲームデータ管理トップ
/admin/gamedata/leaders             # リーダー管理
/admin/gamedata/tribes              # 種族管理
/admin/gamedata/categories          # カテゴリ管理
/admin/gamedata/rarities            # レアリティ管理
/admin/gamedata/card-types          # カードタイプ管理
/admin/gamedata/effects             # エフェクト管理
/admin/gamedata/sync                # データ同期
```

#### 7. システム設定
```
/admin/system/                      # システム設定トップ
/admin/system/general               # 一般設定
/admin/system/security              # セキュリティ設定
/admin/system/email                 # メール設定
/admin/system/backup                # バックアップ設定
/admin/system/maintenance           # メンテナンス設定
/admin/system/api                   # API設定
/admin/system/integrations          # 外部連携設定
```

#### 8. ログ・監査
```
/admin/logs/                        # ログ管理トップ
/admin/logs/access                  # アクセスログ
/admin/logs/admin-activity          # 管理者アクティビティログ
/admin/logs/user-activity           # ユーザーアクティビティログ
/admin/logs/system                  # システムログ
/admin/logs/security                # セキュリティログ
/admin/logs/errors                  # エラーログ
/admin/logs/audit                   # 監査ログ
```

#### 9. レポート・分析
```
/admin/reports/                     # レポート管理トップ
/admin/reports/users                # ユーザー分析
/admin/reports/content              # コンテンツ分析
/admin/reports/performance          # パフォーマンス分析
/admin/reports/security             # セキュリティ分析
/admin/reports/custom               # カスタムレポート
/admin/reports/export               # レポートエクスポート
```

#### 10. プロフィール・設定
```
/admin/profile/                     # プロフィールトップ
/admin/profile/edit                 # プロフィール編集
/admin/profile/password             # パスワード変更
/admin/profile/sessions             # セッション管理
/admin/profile/notifications        # 通知設定
/admin/profile/preferences          # 個人設定
```

## レイアウト設計

### レイアウト構造

```typescript
interface AdminLayoutStructure {
  // 認証前レイアウト
  AuthLayout: {
    children: ReactNode;
    showLogo: boolean;
    showFooter: boolean;
  };
  
  // 認証後レイアウト
  AdminLayout: {
    header: AdminHeader;
    sidebar: AdminSidebar;
    main: ReactNode;
    footer?: AdminFooter;
  };
}
```

### サイドバーナビゲーション

```typescript
interface SidebarNavigation {
  sections: [
    {
      title: "ダッシュボード";
      icon: "dashboard";
      path: "/admin/dashboard";
      permissions: ["READ"];
    },
    {
      title: "ユーザー管理";
      icon: "users";
      items: [
        { title: "ユーザー一覧"; path: "/admin/users"; permissions: ["USER_READ"] },
        { title: "管理者一覧"; path: "/admin/admins"; permissions: ["ADMIN_READ"] }
      ];
    },
    {
      title: "コンテンツ管理";
      icon: "content";
      items: [
        { title: "カード管理"; path: "/admin/content/cards"; permissions: ["CARD_READ"] },
        { title: "お知らせ"; path: "/admin/content/news"; permissions: ["NEWS_READ"] },
        { title: "FAQ"; path: "/admin/content/faq"; permissions: ["FAQ_READ"] }
      ];
    },
    {
      title: "ゲームデータ";
      icon: "gamepad";
      items: [
        { title: "リーダー"; path: "/admin/gamedata/leaders"; permissions: ["GAMEDATA_READ"] },
        { title: "種族"; path: "/admin/gamedata/tribes"; permissions: ["GAMEDATA_READ"] },
        { title: "カテゴリ"; path: "/admin/gamedata/categories"; permissions: ["GAMEDATA_READ"] }
      ];
    },
    {
      title: "システム";
      icon: "settings";
      items: [
        { title: "システム設定"; path: "/admin/system"; permissions: ["SYSTEM_READ"] },
        { title: "ログ管理"; path: "/admin/logs"; permissions: ["LOG_READ"] },
        { title: "レポート"; path: "/admin/reports"; permissions: ["REPORT_READ"] }
      ];
    }
  ];
}
```

## 権限ベースアクセス制御

### ロール定義

```typescript
enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  USER_MANAGER = "USER_MANAGER",
  VIEWER = "VIEWER"
}
```

### 権限マトリックス

| ページ/機能 | SUPER_ADMIN | ADMIN | CONTENT_MANAGER | USER_MANAGER | VIEWER |
|------------|-------------|--------|-----------------|--------------|--------|
| ダッシュボード | ✓ | ✓ | ✓ | ✓ | ✓ |
| ユーザー管理 | ✓ | ✓ | ✗ | ✓ | 読み取りのみ |
| 管理者管理 | ✓ | ✗ | ✗ | ✗ | ✗ |
| コンテンツ管理 | ✓ | ✓ | ✓ | ✗ | 読み取りのみ |
| ゲームデータ | ✓ | ✓ | ✓ | ✗ | 読み取りのみ |
| システム設定 | ✓ | ✗ | ✗ | ✗ | ✗ |
| ログ管理 | ✓ | ✓ | ✗ | ✗ | ✗ |

### アクセス制御実装

```typescript
interface RouteGuard {
  path: string;
  requiredPermissions: string[];
  requiredRole?: AdminRole;
  fallbackPath: string;
}

const adminRoutes: RouteGuard[] = [
  {
    path: "/admin/users",
    requiredPermissions: ["USER_READ"],
    fallbackPath: "/admin/dashboard"
  },
  {
    path: "/admin/admins",
    requiredRole: AdminRole.SUPER_ADMIN,
    requiredPermissions: ["ADMIN_READ"],
    fallbackPath: "/admin/dashboard"
  },
  {
    path: "/admin/system",
    requiredRole: AdminRole.SUPER_ADMIN,
    requiredPermissions: ["SYSTEM_READ"],
    fallbackPath: "/admin/dashboard"
  }
];
```

## レスポンシブ対応

### ブレークポイント

```typescript
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
} as const;
```

### モバイル対応

```typescript
interface MobileAdaptation {
  // サイドバー
  sidebar: {
    defaultState: 'collapsed';
    toggleButton: boolean;
    overlay: boolean;
  };
  
  // テーブル
  tables: {
    horizontalScroll: boolean;
    stackedView: boolean; // モバイル時は縦積み
  };
  
  // フォーム
  forms: {
    singleColumn: boolean;
    compactSpacing: boolean;
  };
}
```

## URL設計原則

### 1. 階層構造
- 機能ごとの明確な階層
- 予測可能なURL構造
- SEOフレンドリー（管理画面でも）

### 2. 一貫性
- 複数形での統一（users, cards, news）
- 動詞の統一（create, edit, delete）
- パラメータ形式の統一（[id], [slug]）

### 3. 拡張性
- 新機能追加時の互換性
- 既存URLの維持
- バージョニング対応

## ナビゲーション UX

### パンくずリスト

```typescript
interface Breadcrumb {
  label: string;
  href?: string;
  current: boolean;
}

// 例: /admin/content/cards/123/edit
const breadcrumbs: Breadcrumb[] = [
  { label: "管理画面", href: "/admin/dashboard", current: false },
  { label: "コンテンツ管理", href: "/admin/content", current: false },
  { label: "カード管理", href: "/admin/content/cards", current: false },
  { label: "カード詳細", href: "/admin/content/cards/123", current: false },
  { label: "編集", current: true }
];
```

### アクティブ状態

```typescript
interface ActiveState {
  exactMatch: boolean;        // 完全一致
  partialMatch: boolean;      // 部分一致（親パス）
  highlightParent: boolean;   // 親カテゴリもハイライト
}
```

## SEO・メタデータ

```typescript
interface AdminPageMeta {
  title: string;
  description?: string;
  robots: "noindex, nofollow";  // 管理画面は検索エンジンに表示しない
  canonical?: string;
}
```

## エラーページ

### 管理者用エラーページ

```
/admin/403                          # アクセス権限なし
/admin/404                          # ページが見つからない
/admin/500                          # サーバーエラー
/admin/maintenance                  # メンテナンス中
```

## 実装例（Next.js App Router）

### ディレクトリ構造

```
src/app/admin/
├── layout.tsx                      # 管理者共通レイアウト
├── login/
│   ├── page.tsx                   # ログインページ
│   └── layout.tsx                 # ログイン専用レイアウト
├── (authenticated)/               # 認証済みエリア
│   ├── layout.tsx                 # 認証済み共通レイアウト
│   ├── dashboard/
│   │   └── page.tsx
│   ├── users/
│   │   ├── page.tsx               # ユーザー一覧
│   │   ├── [id]/
│   │   │   ├── page.tsx           # ユーザー詳細
│   │   │   └── edit/
│   │   │       └── page.tsx       # ユーザー編集
│   │   └── create/
│   │       └── page.tsx           # ユーザー作成
│   └── content/
│       └── cards/
│           ├── page.tsx
│           ├── [id]/
│           │   ├── page.tsx
│           │   └── edit/
│           │       └── page.tsx
│           └── create/
│               └── page.tsx
├── 403.tsx                        # アクセス権限エラー
├── 404.tsx                        # 見つからないエラー
└── error.tsx                      # 一般的なエラー
```

### 認証ミドルウェア

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 管理者エリアの認証チェック
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin-token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // JWT検証とロール・権限チェック
    // ...
  }
}
```

このページ構成により、管理者が直感的に操作でき、拡張性とメンテナンス性を備えた管理画面を構築できます。