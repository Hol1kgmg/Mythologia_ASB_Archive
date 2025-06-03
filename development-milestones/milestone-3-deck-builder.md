# マイルストーン 3: デッキビルダーUI

## ステータス: 🔴 未開始

## 概要
ユーザー向けのデッキ作成画面を実装します。カードの検索、選択、デッキへの追加/削除機能を提供しますが、この段階ではデッキの保存機能は実装しません。UIの使いやすさとデッキ構築ルールの検証に焦点を当てます。

## 期間
- **開始予定**: 2025年7月第2週
- **終了予定**: 2025年7月第4週
- **期間**: 3週間

## 前提条件
- マイルストーン2（カードマスター管理機能）の完了
- カードデータが登録されている状態
- カード検索APIが利用可能な状態

## 目標
- 直感的なデッキビルダーUI
- リアルタイムのデッキ検証
- 高速なカード検索・フィルタリング
- レスポンシブデザイン対応
- デッキ構築ルールの完全実装（保存なし）

## タスクリスト

### Week 1: フロントエンド基盤とカード表示

#### Day 1-2: フロントエンドプロジェクト設定
- [ ] Reactプロジェクトの初期設定（Vite使用）
- [ ] TypeScript設定
- [ ] TailwindCSS + shadcn/ui設定
- [ ] 状態管理ライブラリ設定（Zustand）
- [ ] APIクライアント設定（Axios/Fetch）

#### Day 3-4: カード一覧画面
- [ ] カードグリッドレイアウト実装
- [ ] カード表示コンポーネント作成
  ```typescript
  interface CardDisplayProps {
    card: Card;
    onClick?: (card: Card) => void;
    quantity?: number;
    disabled?: boolean;
  }
  ```
- [ ] カード画像の遅延読み込み
- [ ] カード詳細モーダル
- [ ] ページネーション実装

#### Day 5: 検索・フィルタリングUI
- [ ] 検索バーコンポーネント
- [ ] フィルターパネル実装
  - リーダー選択
  - 種族選択
  - レアリティ選択
  - カードタイプ選択
  - コストスライダー
  - パワースライダー
- [ ] フィルター状態の管理
- [ ] リアルタイム検索（デバウンス付き）

### Week 2: デッキビルダーコア機能

#### Day 6-7: デッキ構築画面レイアウト
- [ ] 2カラムレイアウト（カード一覧 / デッキリスト）
- [ ] デッキリストコンポーネント
  ```typescript
  interface DeckListProps {
    deck: DeckCard[];
    leader: Leader;
    onRemoveCard: (cardId: string) => void;
    onQuantityChange: (cardId: string, quantity: number) => void;
  }
  ```
- [ ] ドラッグ&ドロップ機能
- [ ] カード追加/削除アニメーション
- [ ] デッキ統計表示（枚数、コスト分布等）

#### Day 8-9: デッキ検証ロジック
- [ ] デッキルール検証実装
  - 最小/最大枚数チェック（30-40枚）
  - 同名カード制限（最大3枚）
  - レジェンドカード制限（最大1枚）
  - リーダー制限チェック
- [ ] リアルタイムエラー表示
- [ ] 検証結果のビジュアルフィードバック
- [ ] デッキ完成度インジケーター

#### Day 10: デッキ分析機能
- [ ] コストカーブグラフ
- [ ] カードタイプ分布チャート
- [ ] レアリティ分布表示
- [ ] 平均コスト/パワー計算
- [ ] デッキ強度の簡易評価

### Week 3: UX向上とモバイル対応

#### Day 11-12: インタラクション改善
- [ ] カード追加時のビジュアルフィードバック
- [ ] ショートカットキー実装
  - Space: カード追加
  - Delete: カード削除
  - 1-3: 数量変更
- [ ] アンドゥ/リドゥ機能
- [ ] デッキのインポート/エクスポート（JSON形式）
- [ ] デッキコード生成（表示のみ）

#### Day 13-14: モバイル対応
- [ ] レスポンシブレイアウト調整
- [ ] タッチ操作の最適化
- [ ] モバイル用UIコンポーネント
- [ ] スワイプジェスチャー対応
- [ ] 画面回転対応

#### Day 15: パフォーマンス最適化とテスト
- [ ] 仮想スクロール実装（大量カード対応）
- [ ] 画像の最適化とキャッシュ
- [ ] コンポーネントのメモ化
- [ ] E2Eテスト実装（Playwright）
- [ ] ユーザビリティテスト

## 成果物

### UIコンポーネント
```
components/
├── cards/
│   ├── CardDisplay.tsx          # カード表示
│   ├── CardGrid.tsx            # カードグリッド
│   ├── CardModal.tsx           # カード詳細モーダル
│   └── CardImage.tsx           # カード画像（遅延読み込み）
├── deck/
│   ├── DeckList.tsx            # デッキリスト
│   ├── DeckStats.tsx           # デッキ統計
│   ├── DeckValidation.tsx      # 検証結果表示
│   └── CostCurve.tsx           # コストカーブ
├── search/
│   ├── SearchBar.tsx           # 検索バー
│   ├── FilterPanel.tsx         # フィルターパネル
│   └── FilterChips.tsx         # 選択中フィルター表示
└── layout/
    ├── DeckBuilder.tsx         # メインレイアウト
    ├── MobileLayout.tsx        # モバイルレイアウト
    └── Header.tsx              # ヘッダー
```

### 状態管理
```typescript
interface DeckBuilderStore {
  // デッキ状態
  deck: DeckCard[];
  leader: Leader | null;
  
  // UI状態
  selectedCard: Card | null;
  filters: FilterState;
  searchQuery: string;
  
  // アクション
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  setLeader: (leader: Leader) => void;
  clearDeck: () => void;
  
  // 検証
  validation: ValidationResult;
  validateDeck: () => void;
}
```

### デッキ検証ルール
```typescript
interface DeckValidationRules {
  minCards: 30;
  maxCards: 40;
  maxCopiesNormal: 3;
  maxCopiesLegend: 1;
  requiresLeader: true;
  leaderRestriction: true;  // カードは選択したリーダーに対応必須
}
```

## 成功基準

### 機能要件
- ✅ カードの検索・フィルタリングが高速（< 100ms）
- ✅ デッキへのカード追加/削除がスムーズ
- ✅ デッキ検証がリアルタイムで動作
- ✅ モバイルデバイスで快適に操作可能
- ✅ 1000枚以上のカードでも問題なく動作

### UX要件
- 初心者でも直感的に操作可能
- エラーメッセージが分かりやすい
- アニメーションが自然で快適
- レスポンス時間が体感的に速い

### パフォーマンス指標
- 初期ロード時間: < 3秒
- カード検索レスポンス: < 100ms
- フィルター適用: < 50ms
- メモリ使用量: < 200MB

## 技術詳細

### 使用技術
```json
{
  "dependencies": {
    "react": "^18.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "@radix-ui/react-*": "latest",
    "zustand": "^4.x",
    "react-beautiful-dnd": "^13.x",
    "recharts": "^2.x",
    "react-intersection-observer": "^9.x"
  }
}
```

### 最適化戦略
- React.memo による不要な再レンダリング防止
- useMemo/useCallback の適切な使用
- 仮想スクロールによる大量データ対応
- 画像の遅延読み込みとプログレッシブ表示

## リスクと対策

### リスク1: ブラウザ間の互換性
- **影響**: 特定ブラウザでの動作不良
- **対策**: 主要ブラウザでのテスト、ポリフィルの使用

### リスク2: 大量カードでのパフォーマンス
- **影響**: UIの応答速度低下
- **対策**: 仮想化、ページネーション、キャッシュ戦略

### リスク3: モバイルでの操作性
- **影響**: ユーザー体験の低下
- **対策**: タッチ操作の最適化、専用UIの実装

## 次のステップ
- デッキ保存機能の実装
- ユーザー認証システムとの統合
- デッキ共有機能の追加
- コミュニティ機能の実装