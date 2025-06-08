# 技術スタック選定

## デプロイ戦略
**Railway + Vercel分離アーキテクチャ**: バックエンド（Railway）とフロントエンド（Vercel）の分離構成

### アーキテクチャの方針
1. **明確な責任分離**: バックエンドAPIとフロントエンドUIの独立デプロイ
2. **スケーラビリティ**: 各サービスの独立したスケーリング
3. **開発効率**: 並行開発とCI/CDの最適化
4. **コスト最適化**: 各サービスに最適なプラットフォーム選択

## フロントエンド

### コア技術
- **Framework**: Next.js 14+ (App Router)
  - 理由: Vercelに最適化、優れた開発体験
  - Vercelの自動最適化を活用
  - App RouterによるサーバーコンポーネントとRSC対応
- **Language**: TypeScript 5.3+
  - 理由: 型安全性、開発効率向上、メンテナンス性
  - 厳格な型チェック設定（strict: true）
- **Styling**: Tailwind CSS 3.4+ + shadcn/ui
  - 理由: 高速な開発、一貫性のあるデザイン
  - プラットフォーム非依存のスタイリング

### 状態管理
- **Global State**: Jotai 2.6+
  - 理由: React Suspense対応、原子的状態管理、TypeScript完全対応
  - React DevTools統合、SSR対応、軽量（2.4KB）
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
  - 理由: Railway完全対応、安定性とパフォーマンス
- **Framework**: Hono 3.11+
  - 理由: 超軽量（20KB）、高速なルーティング
  - Express/Fastify互換のミドルウェアシステム
  - Railway環境での最適なパフォーマンス
- **Language**: TypeScript 5.3+
  - 理由: 型安全性、最新ECMAScript機能
- **ORM/クエリビルダー**: 
  - **Prisma 5.7+**: PostgreSQL対応
  - **リポジトリパターン**: ビジネスロジックとデータアクセスの分離

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

### データベース構成
#### メインデータベース
- **PostgreSQL 16**: Railway提供
  - 理由: 高い信頼性、豊富な機能、JSONB対応
  - 自動バックアップ、接続プーリング
  - 垂直・水平スケーリング対応

#### キャッシュ層
- **Redis 7**: Railway提供
  - 理由: 高速な読み取り、セッション管理
  - Pub/Sub対応、データ永続化オプション
  - クラスター構成可能

### データアクセス戦略
```typescript
// リポジトリパターンによる抽象化
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter: Filter): Promise<T[]>;
  create(data: CreateInput<T>): Promise<T>;
  update(id: string, data: UpdateInput<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Prismaを使用した実装
export class PrismaRepository<T> implements Repository<T> {
  constructor(private model: any) {}
  // 実装...
}
```

### ファイルストレージ
- **Railway Volumes**: 永続的ファイルストレージ
  - アップロードファイルの保存
  - バックアップデータの管理
- **CDN統合**: 画像配信の最適化
  - Vercel Edge Network経由での配信
  - 画像最適化とキャッシング

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
- **ローカル開発**: Docker Compose
  - PostgreSQL + Redis環境
  - 管理UI（Adminer + RedisInsight）
- **環境変数管理**: 
  - `.env`: チーム共有設定
  - `.env.local`: 個人機密情報

### デプロイ環境

#### バックエンド（Railway）
- **Platform**: Railway
  - Honoアプリケーションのホスティング
  - 自動スケーリング、ヘルスチェック
  - GitHub連携による自動デプロイ
- **Database**: Railway PostgreSQL
  - マネージドPostgreSQL 16
  - 自動バックアップ、接続プーリング
- **Cache**: Railway Redis
  - マネージドRedis 7
  - 永続化オプション、クラスター対応
- **Storage**: Railway Volumes
  - 永続的ファイルストレージ
  - 自動バックアップ

#### フロントエンド（Vercel）
- **Platform**: Vercel
  - Next.js最適化デプロイ
  - エッジランタイム、ISR対応
  - プレビューデプロイ
- **CDN**: Vercel Edge Network
  - グローバル配信
  - 自動画像最適化
- **Analytics**: Vercel Analytics
  - Web Vitals計測
  - リアルタイムパフォーマンス監視

<!-- ### CI/CD
- **GitHub Actions**
  - 自動テスト実行
  - 型チェック、リント
  - Railway/Vercelへの自動デプロイ
  - ブランチごとのプレビュー環境 -->

## 監視・分析

### エラー監視
- **Sentry 7.91+**: エラートラッキング、パフォーマンス監視
  - Railway/Vercel統合
  - ソースマップサポート
  - リリーストラッキング

### アナリティクス
- **Vercel Analytics**: プライバシーファースト分析
  - Cookieレス、GDPR準拠
  - Core Web Vitals自動計測
- **Custom Metrics**: カスタムメトリクス
  - PostgreSQL基盤、リアルタイム集計

### ログ管理
- **Railway Logs**: 構造化ログ配信
  - 自動保存・ストリーミング
  - リアルタイムモニタリング
- **Vercel Functions Logs**: フロントエンドログ監視
  - 開発・デバッグ用

### 監視・アラート
- **Railway Notifications**: システムアラート
  - メール、Webhook統合
- **Health Checks**: エンドポイント監視
  - ヘルスチェック機能

## 技術選定の方針

### 優先事項
1. **パフォーマンス**: レイテンシ最小化、グローバル配信
2. **型安全性**: TypeScriptによる堅牢性
3. **開発効率**: 統合されたツールチェーン
4. **コスト効率**: 従量課金、充実した無料枠
5. **スケーラビリティ**: 自動スケーリング、柔軟な拡張性

### Railway + Vercel採用のメリット
1. **専門性の活用**: 各プラットフォームの強みを最大限活用
2. **開発効率**: 並行開発とデプロイの独立性
3. **スケーラビリティ**: サービスごとの柔軟なスケーリング
4. **開発者体験**: 優れたDX、GitHub統合
5. **コスト最適化**: 使用量に応じた従量課金

### 段階的導入計画

#### Phase 1: MVP リリース（〜1ヶ月）
**プラットフォーム**: Railway + Vercel
- カード情報データベース
- 基本的なCRUD API
- カード閲覧UI
- 検索・フィルタリング機能

#### Phase 2: デッキ機能実装（1〜2ヶ月）
**プラットフォーム**: Railway + Vercel
- デッキ構築システム
- デッキ保存・共有機能
- デッキコード圧縮
- ユーザー認証基盤

#### Phase 3: コミュニティ機能（2〜3ヶ月）
- ユーザープロファイル
- デッキ評価・コメント
- ランキングシステム
- 統計・分析機能

#### Phase 4: 高度な機能（3〜4ヶ月）
**プラットフォーム**: Railway + Vercel
- AIデッキ提案
- メタゲーム分析
- トーナメント管理
- モバイルアプリ対応

## 開発ワークフロー

### 環境変数による設定
```env
# .env（チーム共有）
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_APP_NAME="Mythologia Admiral Ship Bridge"

# .env.local（個人機密）
DATABASE_URL=postgresql://user:pass@localhost:5432/mythologia_dev
REDIS_URL=redis://:pass@localhost:6379
JWT_SECRET=your-secret-key
```

### ローカル開発
```bash
# データベース環境起動
docker-compose up -d

# 全サービス同時起動
cd webapp && npm run dev

# 個別起動
cd webapp/backend && npm run dev  # バックエンド
cd webapp/frontend && npm run dev # フロントエンド
```

### デプロイフロー
1. GitHub へのプッシュ
2. GitHub Actions でテスト実行
3. Railway/Vercel への自動デプロイ
   - develop → ステージング環境
   - main → 本番環境
4. プレビュー環境での確認
5. 本番環境へのマージ

### アーキテクチャのベストプラクティス

#### 1. 型共有による一貫性
```typescript
// shared/types/api.ts
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    total: number;
  };
}

// フロントエンド・バックエンド両方で使用
import { APIResponse } from '@mythologia/shared';
```

#### 2. 開発チェックリスト
- [ ] TypeScript strictモード有効化
- [ ] Zodによるランタイムバリデーション
- [ ] API型定義の共有パッケージ化
- [ ] エラーハンドリングの統一
- [ ] ログフォーマットの標準化
- [ ] テストカバレッジ80%以上
- [ ] ドキュメント自動生成

#### 3. パフォーマンス最適化
- **バックエンド**: 接続プーリング、クエリ最適化
- **フロントエンド**: コード分割、画像最適化
- **キャッシュ**: Redis多層キャッシュ戦略
- **CDN**: 静的アセットの効率的配信

### 料金比較（月額・1000 DAU想定）

#### Railway（バックエンド）
- **Starter Plan**: $5〜
- **PostgreSQL**: $5〜
- **Redis**: $5〜
- **小計**: $15〜

#### Vercel（フロントエンド）
- **Hobby Plan**: $0（非商用）
- **Pro Plan**: $20（商用利用時）
- **小計**: $0〜20

**合計月額**: $15〜35

**メリット**: 
- 予測可能な料金体系
- 無料枠の活用
- スケーリング時の柔軟性