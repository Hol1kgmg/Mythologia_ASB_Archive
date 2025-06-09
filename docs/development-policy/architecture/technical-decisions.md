# 技術方針

## 技術選定の基本方針

### 1. 選定基準
1. **実績と安定性**: プロダクション環境での豊富な使用実績
2. **メンテナンス性**: アクティブな開発とコミュニティサポート
3. **パフォーマンス**: ユーザー体験に直結する処理速度
4. **開発効率**: 型安全性とツールサポート
5. **将来性**: 長期的な技術トレンドとの整合性

### 2. 避けるべき技術
- 実験的または不安定なライブラリ
- メンテナンスが停止したプロジェクト
- 過度に複雑または学習コストが高い技術
- ベンダーロックインのリスクが高い技術

## コア技術スタック

### フロントエンド
```
TypeScript + Next.js (App Router) + FSD
├── 言語: TypeScript 5.x (strict mode)
├── フレームワーク: Next.js 14.x (App Router)
├── アーキテクチャ: Feature-Sliced Design
├── スタイリング: TailwindCSS 3.x + shadcn/ui
├── 状態管理: 
│   ├── ローカル: useState
│   ├── グローバル: Jotai 2.x
│   └── サーバー: TanStack Query 5.x
└── フォーム: React Hook Form + Zod
```

**選定理由**:
- TypeScript: 型安全性による品質向上
- Next.js App Router: SSR/SSG対応、最新のReact機能
- FSD: スケーラブルなアーキテクチャ
- TailwindCSS: 一貫性のあるデザインシステム
- Jotai: アトミックで高パフォーマンスな状態管理
- TanStack Query: 効率的なサーバー状態管理

### バックエンド
```
TypeScript + Hono
├── 言語: TypeScript 5.x
├── フレームワーク: Hono 3.x
├── バリデーション: Zod 3.x
├── 認証: JWT (jose)
└── ログ: pino
```

**選定理由**:
- Hono: 軽量で高速、エッジ環境対応
- Zod: ランタイム型検証
- JWT: ステートレスな認証

### データベース
```
マルチプラットフォーム対応
├── PostgreSQL 15.x (Vercel)
├── Redis (Railwayキャッシュ)
└── Redis/KV (キャッシュ)
```

**アダプターパターン実装**:
```typescript
interface DatabaseAdapter {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(fn: (trx: Transaction) => Promise<T>): Promise<T>;
}
```

## アーキテクチャ方針

### 1. レイヤードアーキテクチャ
```
┌─────────────────────────────┐
│   Presentation Layer        │ ← UI/API
├─────────────────────────────┤
│   Application Layer         │ ← ユースケース
├─────────────────────────────┤
│   Domain Layer             │ ← ビジネスロジック
├─────────────────────────────┤
│   Infrastructure Layer     │ ← DB/外部サービス
└─────────────────────────────┘
```

### 2. 依存性の方向
- 上位層は下位層に依存
- 下位層は上位層を知らない
- インターフェースによる依存性逆転

### 3. データフロー
```
Request → Router → Controller → Service → Repository → Database
   ↓                                                        ↓
Response ← Presenter ← UseCase ← Domain Model ← Entity ←─┘
```

## API設計方針

### 1. RESTful原則
```
GET    /api/cards          # 一覧取得
GET    /api/cards/:id      # 個別取得
POST   /api/cards          # 作成
PUT    /api/cards/:id      # 更新
DELETE /api/cards/:id      # 削除
```

### 2. レスポンス形式
```typescript
// 成功レスポンス
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-06-01T00:00:00Z",
    "version": "1.0.0"
  }
}

// エラーレスポンス
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ユーザー向けメッセージ",
    "details": { ... }  // 開発環境のみ
  }
}
```

### 3. バージョニング
- URLパス方式: `/api/v1/cards`
- 後方互換性の維持
- 非推奨警告の実装

## データベース設計方針

### 1. 正規化レベル
- 基本的に第3正規形まで
- パフォーマンスのための意図的な非正規化は許容
- 読み取り専用のビューやマテリアライズドビュー活用

### 2. インデックス戦略
```sql
-- 基本インデックス
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_cost ON cards(cost);

-- 複合インデックス（頻繁な検索条件）
CREATE INDEX idx_cards_leader_cost ON cards(leader_id, cost);

-- 部分インデックス（効率化）
CREATE INDEX idx_active_cards ON cards(id) WHERE is_active = true;
```

### 3. データ型の選択
- ID: UUID v4（プライマリキー）
- 日時: TIMESTAMP WITH TIME ZONE
- JSON: 構造化データ（効果など）
- ENUM: 使用せず、参照テーブルで管理

## セキュリティ技術方針

### 1. 認証・認可
- **ユーザー**: OAuth 2.0 (Google)
- **管理者**: JWT + 多要素認証
- **API**: Bearer Token

### 2. データ保護
```typescript
// 暗号化
- パスワード: bcrypt (rounds: 12)
- トークン: AES-256-GCM
- 通信: TLS 1.3

// バリデーション
- 入力: Zod スキーマ
- SQL: プリペアドステートメント
- XSS: サニタイゼーション
```

### 3. アクセス制御
- RBAC（ロールベースアクセス制御）
- 最小権限の原則
- 監査ログの実装

### 4. Application Level認証（Vercel-Railway間）
- **課題**: Railwayのパブリックネットワーク経由でのAPI通信保護
- **解決策**: JWT + HMAC署名による二重認証
- **実装**:
  - JWT: アプリケーション識別とペイロード暗号化
  - HMAC: リクエスト完全性の検証
  - タイムスタンプ: リプレイ攻撃の防止
- **詳細**: [Application Level認証設計](./application-level-auth.md)参照

## パフォーマンス技術方針

### 1. キャッシュ戦略
```
┌─────────────┐
│   Browser   │ ← Service Worker
├─────────────┤
│     CDN     │ ← 静的アセット
├─────────────┤
│   App Cache │ ← Redis/KV
├─────────────┤
│   Database  │ ← Query Cache
└─────────────┘
```

### 2. 最適化技術
- **フロントエンド**:
  - Code Splitting
  - Lazy Loading
  - Image Optimization
  - Bundle Size Analysis

- **バックエンド**:
  - Query Optimization
  - Connection Pooling
  - Response Compression
  - Batch Processing

### 3. 監視・計測
```typescript
// パフォーマンス指標
- TTFB: < 100ms
- FCP: < 1.5s
- TTI: < 3s
- API Response: < 200ms (p95)
```

## 開発環境技術

### 1. 必須ツール
```json
{
  "node": ">=20.0.0",
  "npm": ">=10.0.0",
  "typescript": "^5.0.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0"
}
```

### 2. 開発支援ツール
- **エディタ**: VS Code推奨
- **デバッグ**: Chrome DevTools
- **API開発**: Thunder Client / Postman
- **DB管理**: TablePlus / DBeaver

### 3. CI/CD
```yaml
# GitHub Actions
- Lint & Format Check
- Type Check
- Unit Tests
- Integration Tests
- Security Scan
- Build & Deploy
```

## 技術的負債の管理

### 1. 定期的な見直し
- 四半期ごとの依存関係更新
- 年次の大規模リファクタリング
- 継続的な小規模改善

### 2. 技術的負債の記録
```typescript
// TODO: 技術的負債のマーキング
// FIXME: 修正が必要な箇所
// HACK: 一時的な回避策
// OPTIMIZE: パフォーマンス改善余地
```

### 3. 移行戦略
- 段階的な移行計画
- 機能フラグによる切り替え
- ロールバック可能な実装

## まとめ

技術選定は一度決めたら終わりではなく、プロジェクトの成長とともに見直しが必要です。重要なのは、なぜその技術を選んだのかを明確にし、チーム全体で共有することです。