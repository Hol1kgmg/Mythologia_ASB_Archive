# マイルストーン 2: カードマスター管理機能

## ステータス: 🔴 未開始

## 概要
システム管理者専用のカードCRUD機能を実装します。カードマスターデータの登録、更新、削除、検索機能を提供し、ゲームのコンテンツ管理を可能にします。

## 期間
- **開始予定**: 2025年6月第3週
- **終了予定**: 2025年7月第1週
- **期間**: 3週間

## 前提条件
- マイルストーン1（管理者認証基盤）の完了
- 管理者がログインして認証トークンを取得できる状態

## 目標
- カードマスターデータの完全なCRUD機能
- 効率的な一括登録・更新機能
- カード画像アップロード機能
- 高度な検索・フィルタリング機能
- データ整合性の保証

## タスクリスト

### Week 1: カードCRUD基本実装

#### Day 1-2: データベース準備とドメインモデル
- [ ] カード関連テーブルの作成（cards, tribes, card_sets）
- [ ] 初期マスターデータの投入（tribes, card_sets）
- [ ] カードドメインモデルの実装
- [ ] Zodスキーマ定義
  ```typescript
  const CardSchema = z.object({
    id: z.string().uuid(),
    cardNumber: z.string().regex(/^\d{5}$/),
    name: z.string().min(1).max(100),
    leaderId: z.number().min(1).max(5).nullable(),
    tribeId: z.number().positive().nullable(),
    rarityId: z.number().min(1).max(4),
    cardTypeId: z.number().min(1).max(3),
    cost: z.number().min(0).max(10),
    power: z.number().min(0).max(9999),
    effects: z.array(CardEffectSchema),
    flavorText: z.string().optional(),
    imageUrl: z.string().url(),
    artist: z.string().optional(),
    cardSetId: z.string().uuid()
  });
  ```

#### Day 3-4: 基本CRUD APIエンドポイント
- [ ] POST `/api/admin/cards` - カード作成
- [ ] GET `/api/admin/cards/:id` - カード詳細取得
- [ ] PUT `/api/admin/cards/:id` - カード更新
- [ ] DELETE `/api/admin/cards/:id` - カード削除（論理削除）
- [ ] GET `/api/admin/cards` - カード一覧（ページネーション付き）

#### Day 5: バリデーションとエラーハンドリング
- [ ] カード番号の重複チェック
- [ ] 種族とリーダーの整合性チェック
- [ ] 効果データの構造検証
- [ ] 詳細なエラーメッセージの実装
- [ ] トランザクション処理の実装

### Week 2: 高度な機能実装

#### Day 6-7: 検索・フィルタリング機能
- [ ] GET `/api/admin/cards/search` - 高度な検索エンドポイント
  - 名前検索（部分一致）
  - リーダー別フィルタ
  - 種族別フィルタ
  - レアリティ別フィルタ
  - コスト範囲フィルタ
  - パワー範囲フィルタ
  - カードタイプ別フィルタ
  - 効果タイプ検索
- [ ] ソート機能（名前、コスト、パワー、更新日時）
- [ ] 検索結果のエクスポート機能（CSV）

#### Day 8-9: 一括操作機能
- [ ] POST `/api/admin/cards/bulk` - 一括登録
- [ ] PUT `/api/admin/cards/bulk` - 一括更新
- [ ] POST `/api/admin/cards/import` - CSVインポート
- [ ] インポート時のバリデーションレポート
- [ ] ドライラン機能（実際に登録せずに検証のみ）

#### Day 10: カード画像管理
- [ ] POST `/api/admin/cards/:id/image` - 画像アップロード
- [ ] 画像リサイズ・最適化処理
- [ ] 画像ストレージ設定（S3/R2）
- [ ] 画像URLの生成と管理
- [ ] 古い画像の自動削除

### Week 3: 補助機能とテスト

#### Day 11-12: マスターデータ管理API
- [ ] GET `/api/admin/tribes` - 種族一覧
- [ ] POST `/api/admin/tribes` - 種族追加
- [ ] PUT `/api/admin/tribes/:id` - 種族更新
- [ ] GET `/api/admin/card-sets` - カードセット一覧
- [ ] POST `/api/admin/card-sets` - カードセット追加
- [ ] データ整合性チェック機能

#### Day 13-14: 監査とログ機能
- [ ] カード変更履歴の記録
- [ ] 管理者アクション履歴
- [ ] GET `/api/admin/cards/:id/history` - 変更履歴取得
- [ ] データベースバックアップ機能
- [ ] 削除済みカードの復元機能

#### Day 15: 統合テストとドキュメント
- [ ] カードCRUD操作の統合テスト
- [ ] パフォーマンステスト（大量データ）
- [ ] API仕様書の完成
- [ ] 管理者向け操作ガイド作成
- [ ] トラブルシューティングガイド

## 成果物

### API エンドポイント一覧
```
# カードCRUD
POST   /api/admin/cards              # カード作成
GET    /api/admin/cards              # カード一覧
GET    /api/admin/cards/:id          # カード詳細
PUT    /api/admin/cards/:id          # カード更新
DELETE /api/admin/cards/:id          # カード削除

# 検索・一括操作
GET    /api/admin/cards/search       # 高度な検索
POST   /api/admin/cards/bulk         # 一括登録
PUT    /api/admin/cards/bulk         # 一括更新
POST   /api/admin/cards/import       # CSVインポート
GET    /api/admin/cards/export       # データエクスポート

# 画像管理
POST   /api/admin/cards/:id/image    # 画像アップロード
DELETE /api/admin/cards/:id/image    # 画像削除

# マスターデータ
GET    /api/admin/tribes             # 種族一覧
POST   /api/admin/tribes             # 種族追加
PUT    /api/admin/tribes/:id         # 種族更新
GET    /api/admin/card-sets          # セット一覧
POST   /api/admin/card-sets          # セット追加

# 監査
GET    /api/admin/cards/:id/history  # 変更履歴
GET    /api/admin/audit-logs         # 監査ログ
```

### データ構造
```typescript
// カード作成/更新リクエスト
interface CardRequest {
  cardNumber: string;
  name: string;
  leaderId?: number;
  tribeId?: number;
  rarityId: number;
  cardTypeId: number;
  cost: number;
  power: number;
  effects: CardEffect[];
  flavorText?: string;
  imageUrl?: string;
  artist?: string;
  cardSetId: string;
}

// 検索パラメータ
interface CardSearchParams {
  query?: string;
  leaderId?: number;
  tribeId?: number;
  rarityId?: number;
  cardTypeId?: number;
  minCost?: number;
  maxCost?: number;
  minPower?: number;
  maxPower?: number;
  effectType?: string;
  cardSetId?: string;
  sortBy?: 'name' | 'cost' | 'power' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

## 成功基準

### 機能要件
- ✅ すべてのCRUD操作が正常に動作する
- ✅ 10,000件のカードデータを問題なく管理できる
- ✅ 検索レスポンス時間 < 500ms
- ✅ 一括登録で100件を5秒以内に処理
- ✅ 画像アップロードが正常に機能する

### データ品質
- カード番号の一意性が保証される
- すべての外部キー制約が適切に機能する
- 削除操作が論理削除として実装される
- 変更履歴が完全に記録される

## 技術詳細

### パフォーマンス最適化
- 適切なインデックス設定
- クエリ最適化
- バッチ処理の活用
- キャッシュ戦略（変更の少ないマスターデータ）

### セキュリティ考慮
- 管理者認証の徹底
- SQLインジェクション対策
- ファイルアップロードのセキュリティ
- アクセスログの記録

## リスクと対策

### リスク1: 大量データ処理のパフォーマンス
- **影響**: システムの応答速度低下
- **対策**: ページネーション、インデックス最適化、キャッシュ活用

### リスク2: データ不整合
- **影響**: ゲームバランスの崩壊
- **対策**: トランザクション処理、バリデーション強化、定期的な整合性チェック

### リスク3: 画像ストレージのコスト
- **影響**: 運用コスト増大
- **対策**: 画像最適化、不要画像の自動削除、CDN活用

## 次のマイルストーン
[マイルストーン 3: デッキビルダーUI](milestone-3-deck-builder.md) - ユーザー向けデッキ作成画面の実装