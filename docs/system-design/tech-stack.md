# 技術スタック選定

## 移行戦略
**ベータ版**: Vercelでの迅速なリリース → **本番版**: Cloudflareへの段階的移行

### 移行コスト最小化の方針
1. **プラットフォーム中立な技術選択**: 両環境で動作する標準技術を採用
2. **抽象化層の導入**: プラットフォーム固有機能をアダプターパターンで隠蔽
3. **環境変数による切り替え**: デプロイ先に応じた自動設定
4. **段階的移行**: フロントエンド → API → データベースの順で移行

## フロントエンド

### コア技術
- **Framework**: Next.js 14+ (App Router)
  - 理由: Vercel/Cloudflare Pages両対応、優れた開発体験
  - ベータ: Vercelの自動最適化を活用
  - 本番: `next export`でCloudflare Pagesへ静的デプロイ
- **Language**: TypeScript 5.3+
  - 理由: 型安全性、開発効率向上、メンテナンス性
  - 厳格な型チェック設定（strict: true）
- **Styling**: Tailwind CSS 3.4+ + shadcn/ui
  - 理由: 高速な開発、一貫性のあるデザイン
  - プラットフォーム非依存のスタイリング

### 状態管理
- **Global State**: Zustand 4.4+
  - 理由: シンプルなAPI、TypeScript対応、軽量（8KB）
  - devtoolsサポート、持続化対応
- **Server State**: TanStack Query v5 (React Query)
  - 理由: キャッシング、同期、エラーハンドリングの自動化
  - オプティミスティックアップデート対応

### その他のライブラリ
- **Form**: React Hook Form 7.48+ + Zod 3.22+
  - 高パフォーマンス、非制御コンポーネント
- **DnD**: @dnd-kit 6.1+
  - アクセシビリティ対応、タッチデバイス対応
- **Charts**: Recharts 2.10+
  - D3.js基盤、レスポンシブ対応
- **Icons**: Lucide React 0.294+
  - 軽量SVGアイコン、ツリーシェイキング対応

## バックエンド

### コア技術
- **Runtime**: Node.js 20.10 LTS
  - 理由: Vercel/Cloudflare Workers両対応
- **Framework**: Hono 3.11+
  - 理由: 超軽量（20KB）、マルチランタイム対応
  - Vercel Edge Functions/Cloudflare Workers両対応
  - Fastify互換のミドルウェアシステム
- **Language**: TypeScript 5.3+
  - 理由: 型安全性、最新ECMAScript機能
- **ORM/クエリビルダー**: 
  - **ベータ版**: Prisma 5.7+（Vercel Postgres）
  - **本番移行後**: Drizzle ORM（D1対応）
  - **移行戦略**: リポジトリパターンで抽象化

### 認証・セキュリティ
- **Authentication**: JSON Web Tokens (JWT) with refresh tokens
  - アクセストークン: 15分
  - リフレッシュトークン: 7日間
- **Password Hashing**: bcrypt (saltRounds: 12)
- **Validation**: Zod 3.22+
  - スキーマベースバリデーション、型推論
- **Rate Limiting**: @fastify/rate-limit
  - DDoS防止、API保護
- **CORS**: @fastify/cors
  - クロスオリジン制御

### APIドキュメント
- **Documentation**: @fastify/swagger + @fastify/swagger-ui
  - OpenAPI 3.0準拠、自動生成
- **Type Sharing**: tRPC 10.45+
  - 型安全なAPI、自動補完
  - React QueryとのシームレスLAPな統合

## データベース

### データベース移行戦略
#### ベータ版（Vercel）
- **PostgreSQL**: Vercel Postgres または Supabase
  - 理由: Vercelとの統合、簡単なセットアップ
  - 接続プーリング自動管理

#### 本番版（Cloudflare）
- **Cloudflare D1**: SQLiteベース
  - 理由: エッジ配信、低レイテンシ
  
#### 移行アプローチ
```typescript
// データベースアダプター例
interface DatabaseAdapter {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

// 環境に応じて実装を切り替え
const db = process.env.DEPLOY_TARGET === 'cloudflare' 
  ? new D1Adapter() 
  : new PostgresAdapter();
```

### キャッシュ層
#### ベータ版
- **Vercel KV**: Redis互換キャッシュ
- **Next.js Cache**: 組み込みキャッシュ

#### 本番版
- **Cloudflare KV**: 分散KVストア
- **統一インターフェース**: Redis互換API使用

### ファイルストレージ
- **S3互換API使用**: 移行を容易に
  - ベータ: Vercel Blob または AWS S3
  - 本番: Cloudflare R2
- **抽象化例**:
```typescript
interface StorageAdapter {
  upload(file: File): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

## 開発ツール

### バージョン管理
- **Git**: GitHub
- **Branching Strategy**: GitHub Flow
  - main: 本番環境
  - feature/*: 機能開発
  - fix/*: バグ修正

### パッケージマネージャー
- **pnpm 8.12+**: 高速、効率的なディスク使用
  - ワークスペース対応、厳格な依存関係管理

### コード品質
- **Linter**: ESLint 8.56+
  - @typescript-eslint/eslint-plugin
  - eslint-plugin-react-hooks
- **Formatter**: Prettier 3.1+
  - 統一されたコードスタイル
- **Git Hooks**: Husky 8.0+ + lint-staged 15.2+
  - pre-commit: lint, format, type-check
- **Commit Convention**: Conventional Commits
  - feat:, fix:, docs:, style:, refactor:, test:, chore:

### テスト
- **Unit/Integration**: Vitest 1.0+
  - 高速実行、ESM対応、TypeScript統合
- **E2E**: Playwright 1.40+
  - クロスブラウザテスト、並列実行
- **API Testing**: @fastify/testing
  - インジェクションテスト、モック対応

## インフラ・デプロイ

### 開発環境
- **ローカル開発**: Wrangler CLI
  - Cloudflare環境のローカルエミュレーション
- **環境変数管理**: .dev.vars (Wrangler)
  - シークレット管理、環境別設定

### デプロイ環境

#### Phase 1: ベータ版（Vercel）
- **Frontend**: Vercel
  - Next.jsの自動最適化
  - プレビューデプロイ
  - Edge Functionsでの軽量API
- **Backend**: Vercel Functions
  - サーバーレス関数
  - 自動スケーリング
- **Database**: Vercel Postgres
  - マネージドPostgreSQL
  - 接続プーリング込み
- **Storage**: Vercel Blob
  - シンプルなファイルストレージ

#### Phase 2: 本番版（Cloudflare）
- **Frontend**: Cloudflare Pages
  - Next.js静的エクスポート
  - グローバルCDN配信
- **Backend**: Cloudflare Workers
  - エッジコンピューティング
  - Honoフレームワーク使用
- **Database**: Cloudflare D1
  - SQLiteベース
  - エッジでのクエリ実行
- **Storage**: Cloudflare R2
  - S3互換API
  - エグレス料金無料

### CI/CD
- **GitHub Actions** + **Cloudflare Pages/Workers**
  - 自動テスト実行
  - 型チェック、リント
  - Cloudflareへの自動デプロイ
  - プレビュー環境の自動作成

## 監視・分析

### エラー監視
- **Sentry 7.91+**: エラートラッキング、パフォーマンス監視
  - Cloudflare Workers統合
  - ソースマップサポート
  - リリーストラッキング

### アナリティクス
- **Cloudflare Web Analytics**: プライバシーファースト分析
  - Cookieレス、GDPR準拠
  - Core Web Vitals自動計測
- **Cloudflare Analytics Engine**: カスタムメトリクス
  - SQLクエリ対応、リアルタイム集計

### ログ管理
- **Cloudflare Logpush**: 構造化ログ配信
  - R2への自動保存
  - リアルタイムストリーミング
- **Workers Tail**: リアルタイムログ監視
  - 開発・デバッグ用

### 監視・アラート
- **Cloudflare Notifications**: システムアラート
  - メール、Webhook、PagerDuty統合
- **Health Checks**: エンドポイント監視
  - 自動フェイルオーバー

## 技術選定の方針

### 優先事項
1. **エッジファースト**: レイテンシ最小化、グローバル配信
2. **型安全性**: TypeScriptによる堅牢性
3. **開発効率**: 統合されたツールチェーン
4. **コスト効率**: 従量課金、充実した無料枠
5. **スケーラビリティ**: 自動スケーリング、無限の拡張性

### Cloudflare採用のメリット
1. **統一プラットフォーム**: フロントエンド〜バックエンドまで一元管理
2. **グローバルエッジ**: 275+拠点での低レイテンシ配信
3. **セキュリティ**: DDoS保護、WAF、Bot管理が標準装備
4. **開発者体験**: Wrangler CLI、ローカル開発環境
5. **コスト**: 寛大な無料枠、予測可能な料金体系

### 段階的導入計画

#### Phase 1: ベータ版リリース（〜1.5ヶ月）
**プラットフォーム**: Vercel
- 基本的なカードゲーム機能
- ユーザー認証・登録
- デッキ構築・管理
- シンプルなマッチング

#### Phase 2: 機能拡張（1.5〜3ヶ月）
**プラットフォーム**: Vercel
- ランキングシステム
- フレンド機能
- リアルタイム対戦（WebSocket）
- 初期のバランス調整

#### Phase 3: Cloudflare移行準備（3〜4ヶ月）
- アダプターパターンの実装
- データ移行スクリプト作成
- パフォーマンステスト
- 段階的な機能移行

#### Phase 4: 本番移行（4〜5ヶ月）
**プラットフォーム**: Cloudflare
- フロントエンドをCloudflare Pagesへ
- APIをCloudflare Workersへ
- データベースをD1へ移行
- 完全移行後の最適化

## 開発ワークフロー

### 環境変数による設定
```env
# .env.local（ベータ版）
DEPLOY_TARGET=vercel
DATABASE_URL=postgres://...
STORAGE_TYPE=vercel-blob

# .env.production（本番版）
DEPLOY_TARGET=cloudflare
DATABASE_URL=d1://...
STORAGE_TYPE=r2
```

### ローカル開発
```bash
# 共通のフロントエンド開発
pnpm dev

# ベータ版API開発
pnpm dev:api  # Vercel Functions

# 本番版API開発
wrangler dev  # Cloudflare Workers
```

### デプロイフロー
1. GitHub へのプッシュ
2. GitHub Actions でテスト実行
3. Cloudflare Pages/Workers への自動デプロイ
4. プレビュー環境での確認
5. 本番環境へのマージ

### 移行コスト最小化のベストプラクティス

#### 1. 共通コードベース
```typescript
// adapters/index.ts
export interface Adapters {
  db: DatabaseAdapter;
  storage: StorageAdapter;
  cache: CacheAdapter;
  analytics: AnalyticsAdapter;
}

// 環境に応じたアダプター選択
export function createAdapters(): Adapters {
  const target = process.env.DEPLOY_TARGET;
  
  return {
    db: target === 'cloudflare' ? new D1Adapter() : new PostgresAdapter(),
    storage: target === 'cloudflare' ? new R2Adapter() : new S3Adapter(),
    cache: target === 'cloudflare' ? new KVAdapter() : new RedisAdapter(),
    analytics: target === 'cloudflare' ? new CFAnalytics() : new VercelAnalytics()
  };
}
```

#### 2. 移行チェックリスト
- [ ] 環境変数の整理と文書化
- [ ] データベーススキーマの互換性確保
- [ ] APIエンドポイントの統一
- [ ] 認証フローの抽象化
- [ ] ファイルアップロードの共通化
- [ ] キャッシュ戦略の統一
- [ ] ログ/モニタリングの標準化

#### 3. 推定移行期間
- **準備期間**: 2週間（アダプター実装）
- **移行作業**: 1週間（データ移行含む）
- **検証期間**: 1週間（A/Bテスト）
- **完全切り替え**: 1日

### 料金比較（月額・1000 DAU想定）

#### Vercel（ベータ版）
- **Hobby Plan**: $0
- **Pro Plan**: $20（商用利用時）
- **Postgres**: $15〜
- **合計**: $35〜

#### Cloudflare（本番版）
- **Workers**: $5（無料枠超過後）
- **D1**: $5（無料枠超過後）
- **R2**: $0（無料枠内）
- **合計**: $10〜

**コスト削減**: 約70%削減可能