# フロントエンドアーキテクチャ方針

## 概要

Next.js App RouterとFeature-Sliced Design（FSD）を組み合わせた、スケーラブルで保守性の高いフロントエンドアーキテクチャを採用します。

## Feature-Sliced Design (FSD) の原則

### 1. レイヤー構成
```
レイヤーの階層（上位 → 下位）:
├── app      # アプリケーション構成
├── widgets  # 独立した機能ブロック
├── features # ユーザー操作・ビジネスロジック
├── entities # ビジネスエンティティ
└── shared   # 共有リソース
```

### 2. 依存関係ルール
- 上位レイヤーは下位レイヤーを使用可能
- 同一レイヤー内のスライス間は独立
- 下位レイヤーは上位レイヤーを認識しない

## ディレクトリ構成

### プロジェクトルート構造
```
frontend/
├── app/                    # Next.js App Router
├── src/                    # FSDアーキテクチャ
│   ├── widgets/           # ウィジェット層
│   ├── features/          # フィーチャー層
│   ├── entities/          # エンティティ層
│   └── shared/            # 共有層
├── public/                # 静的ファイル
├── tests/                 # テストファイル
└── next.config.js         # Next.js設定
```

### 詳細なディレクトリ構造

#### App Router (app/)
```
app/
├── (auth)/                # 認証レイアウトグループ
│   ├── login/
│   │   └── page.tsx      # ログインページ
│   └── register/
│       └── page.tsx      # 登録ページ
├── (dashboard)/          # ダッシュボードレイアウト
│   ├── layout.tsx        # 共通レイアウト
│   ├── cards/
│   │   ├── page.tsx      # カード一覧
│   │   └── [id]/
│   │       └── page.tsx  # カード詳細
│   └── decks/
│       ├── page.tsx      # デッキ一覧
│       ├── new/
│       │   └── page.tsx  # デッキ作成
│       └── [id]/
│           ├── page.tsx  # デッキ詳細
│           └── edit/
│               └── page.tsx  # デッキ編集
├── api/                  # APIルート
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
├── layout.tsx            # ルートレイアウト
├── page.tsx             # ホームページ
└── global.css           # グローバルスタイル
```

#### FSD構造 (src/)

##### Widgets層
```
src/widgets/
├── header/
│   ├── ui/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── UserMenu.tsx
│   ├── model/
│   │   └── useHeader.ts
│   └── index.ts
├── card-search/
│   ├── ui/
│   │   ├── CardSearchWidget.tsx
│   │   ├── SearchBar.tsx
│   │   └── SearchResults.tsx
│   ├── model/
│   │   └── useCardSearch.ts
│   └── index.ts
└── deck-stats/
    ├── ui/
    │   ├── DeckStatsWidget.tsx
    │   ├── CostCurve.tsx
    │   └── TypeDistribution.tsx
    ├── model/
    │   └── useDeckStats.ts
    └── index.ts
```

##### Features層
```
src/features/
├── auth/
│   ├── ui/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── GoogleAuthButton.tsx
│   ├── model/
│   │   ├── useAuth.ts
│   │   └── authStore.ts
│   ├── api/
│   │   └── authApi.ts
│   └── index.ts
├── card-management/
│   ├── ui/
│   │   ├── CreateCardForm.tsx
│   │   ├── EditCardForm.tsx
│   │   └── DeleteCardDialog.tsx
│   ├── model/
│   │   └── useCardManagement.ts
│   ├── api/
│   │   └── cardApi.ts
│   └── index.ts
└── deck-operations/
    ├── ui/
    │   ├── SaveDeckButton.tsx
    │   ├── LoadDeckDialog.tsx
    │   └── ShareDeckModal.tsx
    ├── model/
    │   ├── useDeckOperations.ts
    │   └── deckOperationsStore.ts
    ├── api/
    │   └── deckApi.ts
    └── index.ts
```

##### Entities層
```
src/entities/
├── card/
│   ├── ui/
│   │   ├── CardDisplay.tsx
│   │   ├── CardImage.tsx
│   │   └── CardTooltip.tsx
│   ├── model/
│   │   ├── types.ts        # Card型定義（DTOベース）
│   │   └── useCard.ts
│   └── index.ts
├── deck/
│   ├── ui/
│   │   ├── DeckCard.tsx
│   │   └── DeckInfo.tsx
│   ├── model/
│   │   ├── types.ts        # Deck型定義（DTOベース）
│   │   └── useDeck.ts
│   └── index.ts
└── user/
    ├── ui/
    │   ├── UserAvatar.tsx
    │   └── UserProfile.tsx
    ├── model/
    │   ├── types.ts
    │   └── useUser.ts
    └── index.ts
```

##### Shared層
```
src/shared/
├── api/
│   ├── client.ts           # APIクライアント設定
│   ├── endpoints.ts        # エンドポイント定義
│   └── types.ts           # 共通API型
├── ui/
│   ├── components/        # 共通UIコンポーネント
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Dialog/
│   │   └── Form/
│   ├── layouts/          # 共通レイアウト
│   │   ├── BaseLayout.tsx
│   │   └── DashboardLayout.tsx
│   └── hooks/            # 共通フック
│       ├── useDebounce.ts
│       ├── useLocalStorage.ts
│       └── useMediaQuery.ts
├── lib/
│   ├── utils.ts          # ユーティリティ関数
│   ├── constants.ts      # 定数定義
│   └── validators.ts     # 共通バリデーション
└── types/
    ├── common.ts         # 共通型定義
    └── api.ts           # API共通型
```

## 各レイヤーの責務

### App Router (app/)
- ルーティングとメタデータ管理
- レイアウトの定義
- ローディング・エラー状態の管理
- サーバーサイドレンダリング

### Widgets層
- 独立した機能ブロック
- 複数のフィーチャーの組み合わせ
- ウィジェット内の状態管理
- 再利用可能な大きな単位

### Features層
- ユーザーアクション（クリック、送信等）
- ビジネスロジックの実装
- API通信
- 複雑な状態管理（Zustand）

### Entities層
- ビジネスエンティティの表現
- 単純なデータ表示
- エンティティ固有のロジック
- 型定義（DTOベース）

### Shared層
- 横断的関心事
- 共通コンポーネント
- ユーティリティ
- 設定・定数

## 状態管理戦略

### 1. 状態の種類と管理方法
```typescript
// ローカル状態: useState
const [isOpen, setIsOpen] = useState(false);

// フォーム状態: React Hook Form
const form = useForm<DeckFormData>();

// グローバル状態: Zustand
const useDeckStore = create<DeckStore>((set) => ({
  currentDeck: null,
  setCurrentDeck: (deck) => set({ currentDeck: deck })
}));

// サーバー状態: TanStack Query
const { data: cards } = useQuery({
  queryKey: ['cards'],
  queryFn: fetchCards
});
```

### 2. 状態配置の原則
```
状態の配置場所:
├── コンポーネント内: UIの開閉等
├── Feature内: 機能固有の状態
├── Widget内: ウィジェット間で共有
└── Global: アプリ全体で必要
```

## import規則

### 1. 絶対パスの使用
```typescript
// ❌ 相対パス
import { Button } from '../../../shared/ui/components/Button';

// ✅ 絶対パス
import { Button } from '@/shared/ui/components/Button';
```

### 2. Public API経由のimport
```typescript
// ❌ 内部実装を直接import
import { CardDisplay } from '@/entities/card/ui/CardDisplay';

// ✅ Public API経由
import { CardDisplay } from '@/entities/card';
```

### 3. tsconfig.json設定
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/app/*": ["app/*"],
      "@/widgets/*": ["src/widgets/*"],
      "@/features/*": ["src/features/*"],
      "@/entities/*": ["src/entities/*"],
      "@/shared/*": ["src/shared/*"]
    }
  }
}
```

## ファイル命名規則

BCDデザインパターンに基づく命名規則を採用します。詳細は[naming-conventions.md](./naming-conventions.md)を参照してください。

### 基本パターン
```
// コンポーネント: [Block][Case][Domain].tsx
CardDisplay.tsx
DeckBuilderPage.tsx

// フック: use[Block][Case][Domain].ts
useCardSearch.ts
useDeckValidation.ts

// ストア: [block][Case][Domain]Store.ts
deckBuilderStore.ts
authSessionStore.ts

// ディレクトリ: kebab-case
card-management/
deck-builder/
```

## テスト構造

```
tests/
├── unit/          # ユニットテスト
│   ├── features/
│   ├── entities/
│   └── shared/
├── integration/   # 統合テスト
│   └── api/
└── e2e/          # E2Eテスト
    └── scenarios/
```

## まとめ

このアーキテクチャにより：
1. **明確な責務分離**: 各レイヤーの役割が明確
2. **高い保守性**: 機能単位での独立性
3. **スケーラビリティ**: 新機能追加が容易
4. **型安全性**: TypeScriptの恩恵を最大化
5. **再利用性**: コンポーネントの効率的な再利用