# 状態管理ライブラリ選定: Zustand vs Jotai

## 結論：Jotai を採用

プロジェクトの要件と特性を総合的に検討した結果、**Jotai** を状態管理ライブラリとして採用することを決定しました。

## 比較検討

### 1. プロジェクトの特性

#### 神託のメソロギア アプリの状態管理要件
- **デッキビルダー**: 複雑な状態とリアルタイムバリデーション
- **カード検索**: 高度なフィルタリングとソート
- **認証状態**: グローバルな認証情報管理
- **UI状態**: モーダル、サイドバーなどの表示状態

### 2. 技術的比較

| 項目 | Zustand | Jotai | 判定 |
|------|---------|-------|------|
| **学習コストの低さ** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Zustand |
| **TypeScript対応** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Jotai** |
| **パフォーマンス** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Jotai** |
| **バンドルサイズ** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Jotai** |
| **React統合** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Jotai** |
| **デバッグツール** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Zustand |
| **エコシステム** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 同等 |

### 3. 詳細分析

#### Jotai の優位点

**🎯 Atomic Design パターンとの親和性**
```typescript
// FSDのEntity層との相性が良い
const cardAtom = atom<Card | null>(null);
const deckCardsAtom = atom<DeckCard[]>([]);

// 依存関係が明確
const deckStatsAtom = atom((get) => {
  const cards = get(deckCardsAtom);
  return calculateDeckStats(cards);
});
```

**⚡ 優れたパフォーマンス**
- 必要な部分のみ再レンダリング
- デッキビルダーのような複雑なUIで威力を発揮

**🔧 TypeScript強力サポート**
```typescript
// 型安全性が高い
const userAtom = atom<User | null>(null);
const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
```

**📦 軽量性**
- バンドルサイズ: ~5KB（Zustand: ~2.5KB）
- アプリケーションの複雑さを考慮すると許容範囲

#### Zustand の優位点

**📖 学習コストの低さ**
```typescript
// シンプルで理解しやすい
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
```

**🛠️ デバッグツール**
- Redux DevTools対応
- 状態変化の追跡が容易

### 4. プロジェクト要件への適合性

#### デッキビルダー機能
```typescript
// Jotai: Atomicな状態管理でパフォーマンス最適化
const selectedCardsAtom = atom<string[]>([]);
const deckValidationAtom = atom((get) => {
  const cards = get(selectedCardsAtom);
  return validateDeck(cards);
});

// 必要な部分のみ再レンダリング
function DeckBuilder() {
  const [selectedCards, setSelectedCards] = useAtom(selectedCardsAtom);
  const validation = useAtomValue(deckValidationAtom); // 依存のみ
  // ...
}
```

#### カード検索・フィルタリング
```typescript
// 複雑なフィルタ状態の管理
const searchQueryAtom = atom('');
const rarityFilterAtom = atom<number[]>([]);
const costRangeAtom = atom<[number, number]>([0, 10]);

// 複合的な検索結果
const filteredCardsAtom = atom((get) => {
  const query = get(searchQueryAtom);
  const rarities = get(rarityFilterAtom);
  const costRange = get(costRangeAtom);
  
  return filterCards(allCards, { query, rarities, costRange });
});
```

### 5. パフォーマンスシミュレーション

#### デッキビルダーでの想定シナリオ
- **カード数**: 1000枚
- **フィルタ条件**: 5つ以上
- **リアルタイム検証**: デッキルール

**Jotai の場合**:
- フィルタ変更時: 検索結果のみ再計算
- カード追加時: バリデーション部分のみ更新
- UI更新: 変更された部分のみ再レンダリング

**Zustand の場合**:
- フィルタ変更時: ストア全体の更新通知
- カード追加時: 関連コンポーネントすべて再レンダリング
- UI更新: セレクター依存で最適化が必要

## 実装戦略

### 1. Atomの設計パターン

#### エンティティAtom
```typescript
// entities/card/model/atoms.ts
export const cardAtom = atomFamily((cardId: string) => 
  atom<Card | null>(null)
);

export const allCardsAtom = atom<Card[]>([]);
```

#### フィーチャーAtom
```typescript
// features/deck-builder/model/atoms.ts
export const deckBuilderAtom = atom({
  selectedCards: [] as string[],
  currentLeader: null as Leader | null,
  isValid: false
});

export const deckStatsAtom = atom((get) => {
  const builder = get(deckBuilderAtom);
  return calculateDeckStats(builder.selectedCards);
});
```

#### グローバルAtom
```typescript
// shared/model/atoms.ts
export const userAtom = atom<User | null>(null);
export const themeAtom = atom<'light' | 'dark'>('light');
```

### 2. マイグレーション計画

#### Phase 1: 基本セットアップ
```bash
npm install jotai
npm uninstall zustand
```

#### Phase 2: 段階的移行
1. 新機能は Jotai で実装
2. 既存の Zustand ストアを徐々に移行
3. 混在期間は最小限に抑制

#### Phase 3: 最適化
1. 不要な再レンダリングの除去
2. Atomの分割・統合最適化
3. パフォーマンス測定と調整

### 3. 開発ガイドライン

#### Atom命名規則
```typescript
// [domain][Context]Atom
const cardSearchAtom = atom('');
const deckBuilderAtom = atom({});
const userProfileAtom = atom(null);
```

#### ファイル配置
```
features/
├── deck-builder/
│   ├── model/
│   │   ├── atoms.ts      # 機能固有のAtom
│   │   └── selectors.ts  # 派生状態
│   └── ui/
└── card-search/
    ├── model/
    │   └── atoms.ts
    └── ui/
```

## 最終決定の理由

1. **パフォーマンス優先**: デッキビルダーの複雑なUIに最適
2. **TypeScript親和性**: 型安全性の向上
3. **React統合**: Suspenseとの連携
4. **将来性**: React Server Componentsとの互換性
5. **学習投資**: アトミックな状態管理の理解は長期的資産

## 移行タイムライン

- **Week 1**: Jotaiセットアップと基本Atom作成
- **Week 2-3**: デッキビルダー機能の移行
- **Week 4**: カード検索機能の移行
- **Week 5**: 認証・UI状態の移行
- **Week 6**: 最適化とパフォーマンステスト

この選定により、プロジェクトの複雑性に対応しつつ、高いパフォーマンスと保守性を実現できます。