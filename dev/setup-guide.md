# 開発環境セットアップガイド

このドキュメントでは、Mythologia Admiral Ship Bridgeプロジェクトの開発環境セットアップ手順を説明します。

## 前提条件

### システム要件
- **Node.js**: v20.0.0以上
- **npm**: v10.0.0以上
- **Git**: v2.20以上

### 必須ツール
```bash
# Node.jsのバージョン確認
node --version  # v20.0.0+

# npmのバージョン確認  
npm --version   # v10.0.0+

# Gitのバージョン確認
git --version   # v2.20+
```

## プロジェクト構造

```
mythologia-admiral-ship-bridge/
├── webapp/
│   ├── shared/                    # 共有パッケージ
│   ├── backend/                   # Honoバックエンド
│   └── frontend/                  # Next.jsフロントエンド
├── docs/                          # 設計ドキュメント
└── dev/                           # 開発ガイド
```

## ワークスペース初期セットアップ

### 1. リポジトリクローン
```bash
git clone https://github.com/your-username/mythologia-admiral-ship-bridge.git
cd mythologia-admiral-ship-bridge
```

### 2. ワークスペース構造作成
```bash
# ワークスペースディレクトリを作成
mkdir -p webapp/{shared,backend,frontend}

# ルートpackage.jsonでワークスペース設定
cat > package.json << 'EOF'
{
  "name": "mythologia-admiral-ship-bridge",
  "version": "1.0.0",
  "description": "神託のメソロギア ファンサイト - Mythologia Admiral Ship Bridge",
  "private": true,
  "workspaces": [
    "webapp/shared",
    "webapp/backend", 
    "webapp/frontend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:shared\" \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:shared": "npm run dev --workspace=@mythologia/shared",
    "dev:backend": "npm run dev --workspace=@mythologia/backend",
    "dev:frontend": "npm run dev --workspace=@mythologia/frontend",
    "build": "npm run build --workspace=@mythologia/shared && npm run build --workspace=@mythologia/backend && npm run build --workspace=@mythologia/frontend",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "type-check": "npm run type-check --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
EOF

# 依存関係をインストール
npm install
```

## 共有パッケージセットアップ

### 1. 共有パッケージ初期化
```bash
cd webapp/shared

# package.jsonを作成
cat > package.json << 'EOF'
{
  "name": "@mythologia/shared",
  "version": "1.0.0",
  "description": "Mythologia Admiral Ship Bridge - 共有型定義・バリデーション・定数",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js"
    },
    "./schemas": {
      "types": "./dist/schemas/index.d.ts",
      "import": "./dist/schemas/index.js"
    },
    "./constants": {
      "types": "./dist/constants/index.d.ts",
      "import": "./dist/constants/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "test": "vitest"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "vitest": "^1.0.0"
  }
}
EOF

# TypeScript設定
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF

# ソースディレクトリ構造を作成
mkdir -p src/{types/{dto,api,common},schemas,constants,adapters}

# エントリーポイント作成
cat > src/index.ts << 'EOF'
// 型定義
export * from './types/dto/card.dto';
export * from './types/dto/deck.dto';
export * from './types/dto/tribe.dto';
export * from './types/dto/leader.dto';
export * from './types/api/responses';
export * from './types/common/pagination';

// スキーマ
export * from './schemas/card.schema';
export * from './schemas/deck.schema';

// 定数
export * from './constants/game-rules';
export * from './constants/rarities';
export * from './constants/card-types';

// アダプター
export * from './adapters/database.adapter';
export * from './adapters/cache.adapter';
EOF

# 依存関係をインストール
npm install

cd ../..
```

## バックエンドセットアップ（Hono）

### 1. バックエンド初期化
```bash
cd webapp/backend

# package.jsonを作成
cat > package.json << 'EOF'
{
  "name": "@mythologia/backend",
  "version": "1.0.0",
  "description": "Mythologia Admiral Ship Bridge - Honoバックエンド",
  "main": "dist/index.js",
  "scripts": {
    "dev": "wrangler dev src/index.ts --compatibility-date 2024-01-01",
    "build": "tsc",
    "deploy:cloudflare": "wrangler deploy",
    "deploy:vercel": "vercel deploy",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@mythologia/shared": "workspace:*",
    "hono": "^3.12.0",
    "@hono/zod-validator": "^0.2.0",
    "jose": "^5.0.0",
    "pino": "^8.17.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20231218.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "wrangler": "^3.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
EOF

# TypeScript設定
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["@cloudflare/workers-types", "node"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF

# Cloudflare Workers設定
cat > wrangler.toml << 'EOF'
name = "mythologia-backend"
main = "dist/index.js"
compatibility_date = "2024-01-01"

[env.development]
name = "mythologia-backend-dev"

[env.production] 
name = "mythologia-backend-prod"
EOF

# ソースディレクトリ構造を作成
mkdir -p src/{api/{routes,middleware,controllers},application/{services,use-cases},domain,infrastructure/{database,cache,adapters}}

# エントリーポイント作成
cat > src/index.ts << 'EOF'
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { cardsRouter } from './api/routes/cards.route';
import { decksRouter } from './api/routes/decks.route';

const app = new Hono();

// ミドルウェア
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ルート
app.route('/api/cards', cardsRouter);
app.route('/api/decks', decksRouter);

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default app;
EOF

# 基本的なルートファイルを作成
cat > src/api/routes/cards.route.ts << 'EOF'
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const cardsRouter = new Hono();

// カード一覧取得
cardsRouter.get('/', zValidator('query', z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  leaderId: z.string().optional(),
})), async (c) => {
  const query = c.req.valid('query');
  
  // TODO: 実際のデータベースからデータを取得
  return c.json({
    success: true,
    data: {
      cards: [],
      pagination: {
        page: parseInt(query.page || '1'),
        limit: parseInt(query.limit || '20'),
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

export { cardsRouter };
EOF

cat > src/api/routes/decks.route.ts << 'EOF'
import { Hono } from 'hono';

const decksRouter = new Hono();

// デッキ一覧取得
decksRouter.get('/', async (c) => {
  return c.json({
    success: true,
    data: { decks: [] },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

export { decksRouter };
EOF

# 依存関係をインストール
npm install

cd ../..
```

## フロントエンドセットアップ（Next.js）

### 1. Next.jsプロジェクト作成
```bash
cd webapp/frontend

# Next.jsプロジェクトを初期化
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 既存のpackage.jsonを更新
cat > package.json << 'EOF'
{
  "name": "@mythologia/frontend",
  "version": "1.0.0",
  "description": "Mythologia Admiral Ship Bridge - Next.jsフロントエンド",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@mythologia/shared": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "jotai": "^2.6.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
EOF

# Feature-Sliced Designディレクトリ構造を作成
mkdir -p src/{app,features/{deck-builder,card-browser,auth},shared/{ui,hooks,utils,api},widgets}

# Next.js設定を更新
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['images.example.com'], // カード画像ドメインを追加
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  },
}

module.exports = nextConfig
EOF

# TypeScript設定を更新
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"],
      "@/widgets/*": ["./src/widgets/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# 基本的なAPIクライアントを作成
cat > src/shared/api/client.ts << 'EOF'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const api = new ApiClient(API_BASE_URL);
EOF

# 基本的なページを作成
cat > src/app/page.tsx << 'EOF'
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Mythologia Admiral Ship Bridge
      </h1>
      <p className="text-center text-gray-600 mb-8">
        神託のメソロギア 非公式ファンサイト
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link 
          href="/cards" 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">カード検索</h2>
          <p className="text-gray-600">
            カード情報の検索・フィルタリング
          </p>
        </Link>
        
        <Link 
          href="/decks" 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">デッキ構築</h2>
          <p className="text-gray-600">
            デッキの作成・編集・共有
          </p>
        </Link>
      </div>
    </main>
  );
}
EOF

# 依存関係をインストール
npm install

cd ../..
```

## 環境変数設定

### 1. バックエンド環境変数
```bash
# webapp/backend/.env.example を作成
cat > webapp/backend/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mythologia
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret-here
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=development
API_VERSION=v1
EOF
```

### 2. フロントエンド環境変数
```bash
# webapp/frontend/.env.local.example を作成
cat > webapp/frontend/.env.local.example << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# External Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
EOF
```

## 開発サーバー起動

### 1. 全サービス同時起動
```bash
# ルートディレクトリから
npm run dev
```

### 2. 個別起動
```bash
# 共有パッケージ（ウォッチモード）
npm run dev:shared

# バックエンド（別ターミナル）
npm run dev:backend

# フロントエンド（別ターミナル）
npm run dev:frontend
```

### 3. アクセス確認
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8787
- **API確認**: http://localhost:8787/health

## 開発ツール設定

### 1. VS Code推奨拡張機能
```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss", 
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 2. VS Code設定
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 3. Prettier設定
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. ポートが使用中の場合
```bash
# プロセスを確認
lsof -i :3000
lsof -i :8787

# プロセスを終了
kill -9 <PID>
```

#### 2. npm workspaceエラー
```bash
# ルートディレクトリで依存関係を再インストール
rm -rf node_modules package-lock.json
rm -rf webapp/*/node_modules webapp/*/package-lock.json
npm install
```

#### 3. TypeScriptエラー
```bash
# 型チェック実行
npm run type-check

# 各パッケージで個別確認
npm run type-check --workspace=@mythologia/shared
npm run type-check --workspace=@mythologia/backend
npm run type-check --workspace=@mythologia/frontend
```

#### 4. 共有パッケージが認識されない
```bash
# 共有パッケージを再ビルド
cd webapp/shared
npm run build
cd ../..

# 依存関係を再インストール
npm install
```

## 次のステップ

1. **データベースセットアップ**: PostgreSQL/D1の設定
2. **認証システム**: OAuth 2.0の実装
3. **スタイリング**: shadcn/uiコンポーネントの導入
4. **テスト環境**: Jest/Vitestのセットアップ
5. **CI/CD**: GitHub Actionsの設定

詳細な実装については、`docs/system-design/`の設計ドキュメントを参照してください。