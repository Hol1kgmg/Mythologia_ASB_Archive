# 命名規則 - BCDデザインパターン

## 概要

BCD（Block-Case-Domain）デザインパターンに基づく統一的な命名規則を定めます。これにより、コードの可読性と保守性を向上させます。

## BCDデザインの基本原則

### 1. Block（ブロック）
独立した機能単位を表す最上位の概念

### 2. Case（ケース）
ブロック内での具体的な使用場面や状態

### 3. Domain（ドメイン）
ビジネスロジックや責務を表す領域

## ディレクトリ命名規則

### 1. 基本ルール
```
小文字のkebab-case を使用
例: card-management, deck-builder, auth-provider
```

### 2. FSDレイヤー別命名パターン

#### Features層（Block中心）
```
features/
├── auth-management/        # Block: 認証管理
├── card-operations/        # Block: カード操作
├── deck-building/          # Block: デッキ構築
└── user-settings/          # Block: ユーザー設定
```

#### Widgets層（Block-Case）
```
widgets/
├── card-search-panel/      # Block-Case: カード検索パネル
├── deck-stats-viewer/      # Block-Case: デッキ統計ビューアー
├── user-profile-card/      # Block-Case: ユーザープロフィールカード
└── navigation-header/      # Block-Case: ナビゲーションヘッダー
```

#### Entities層（Domain中心）
```
entities/
├── card/                   # Domain: カード
├── deck/                   # Domain: デッキ
├── user/                   # Domain: ユーザー
└── tribe/                  # Domain: 種族
```

## ファイル命名規則

### 1. コンポーネントファイル

#### 基本パターン: `[Block][Case][Domain].tsx`
```typescript
// Block: Card, Case: Display, Domain: Component
CardDisplay.tsx

// Block: Deck, Case: Builder, Domain: Page
DeckBuilderPage.tsx

// Block: Auth, Case: Login, Domain: Form
AuthLoginForm.tsx

// Block: User, Case: Profile, Domain: Modal
UserProfileModal.tsx
```

### 2. カスタムフック

#### パターン: `use[Block][Case][Domain].ts`
```typescript
// Block: Card, Case: Search, Domain: Logic
useCardSearch.ts

// Block: Deck, Case: Validation, Domain: State
useDeckValidation.ts

// Block: Auth, Case: Session, Domain: Manager
useAuthSession.ts
```

### 3. ストア（Zustand）

#### パターン: `[block][Case][Domain]Store.ts`
```typescript
// Block: deck, Case: Builder, Domain: Store
deckBuilderStore.ts

// Block: auth, Case: Session, Domain: Store
authSessionStore.ts

// Block: card, Case: Filter, Domain: Store
cardFilterStore.ts
```

### 4. API関連ファイル

#### パターン: `[block][Domain]Api.ts`
```typescript
// Block: card, Domain: Api
cardApi.ts

// Block: deck, Domain: Api
deckApi.ts

// Block: auth, Domain: Api
authApi.ts
```

### 5. 型定義ファイル

#### パターン: `[block][Domain].types.ts`
```typescript
// Block: card, Domain: types
card.types.ts

// Block: deck, Domain: types
deck.types.ts

// Block: user, Domain: types
user.types.ts
```

## 変数・関数命名規則

### 1. 変数名

#### 基本パターン: `[domain][Case][Descriptor]`
```typescript
// Domain: card, Case: selected, Descriptor: items
const cardSelectedItems: Card[] = [];

// Domain: deck, Case: validation, Descriptor: result
const deckValidationResult: ValidationResult = validate(deck);

// Domain: user, Case: profile, Descriptor: data
const userProfileData: UserProfile = fetchProfile();
```

### 2. 関数名

#### アクション関数: `[action][Domain][Case]`
```typescript
// Action: create, Domain: Card, Case: Instance
function createCardInstance(data: CardData): Card {
  // ...
}

// Action: validate, Domain: Deck, Case: Size
function validateDeckSize(deck: Deck): boolean {
  // ...
}

// Action: fetch, Domain: User, Case: Profile
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // ...
}
```

#### ハンドラー関数: `handle[Domain][Event]`
```typescript
// Domain: Card, Event: Click
const handleCardClick = (cardId: string) => {
  // ...
};

// Domain: Deck, Event: Save
const handleDeckSave = async (deck: Deck) => {
  // ...
};

// Domain: Form, Event: Submit
const handleFormSubmit = (data: FormData) => {
  // ...
};
```

### 3. 定数名

#### パターン: `[DOMAIN]_[CASE]_[DESCRIPTOR]`
```typescript
// Domain: CARD, Case: MAX, Descriptor: COUNT
const CARD_MAX_COUNT = 40;

// Domain: DECK, Case: MIN, Descriptor: SIZE
const DECK_MIN_SIZE = 30;

// Domain: AUTH, Case: TOKEN, Descriptor: EXPIRY
const AUTH_TOKEN_EXPIRY = 900; // 15 minutes
```

## CSS/スタイル命名規則

### 1. CSS Modules

#### パターン: `[block]-[case]-[domain]`
```scss
// styles.module.scss
.card-display-container {
  // Block: card, Case: display, Domain: container
}

.deck-builder-panel {
  // Block: deck, Case: builder, Domain: panel
}

.auth-form-wrapper {
  // Block: auth, Case: form, Domain: wrapper
}
```

### 2. Tailwind CSS カスタムクラス

#### パターン: `[block]-[case]-[state]`
```typescript
// Block: card, Case: hover, State: active
<div className="card-hover-active">

// Block: button, Case: primary, State: disabled
<button className="button-primary-disabled">

// Block: modal, Case: overlay, State: visible
<div className="modal-overlay-visible">
```

## インターフェース・型名規則

### 1. インターフェース

#### パターン: `[Domain][Case][Type]`
```typescript
// Domain: Card, Case: Display, Type: Props
interface CardDisplayProps {
  card: Card;
  onClick?: (id: string) => void;
}

// Domain: Deck, Case: Builder, Type: State
interface DeckBuilderState {
  cards: Card[];
  isValid: boolean;
}

// Domain: Auth, Case: Login, Type: Request
interface AuthLoginRequest {
  email: string;
  password: string;
}
```

### 2. 型エイリアス

#### パターン: `[Domain][Case]Type`
```typescript
// Domain: Card, Case: Filter
type CardFilterType = 'cost' | 'power' | 'rarity';

// Domain: Deck, Case: Status
type DeckStatusType = 'draft' | 'complete' | 'invalid';

// Domain: User, Case: Role
type UserRoleType = 'admin' | 'user' | 'guest';
```

## 実例による命名パターン

### 1. カード検索機能
```typescript
// ディレクトリ
features/card-search/

// コンポーネント
CardSearchPanel.tsx         // Block: Card, Case: Search, Domain: Panel
CardSearchResults.tsx       // Block: Card, Case: Search, Domain: Results
CardSearchFilter.tsx        // Block: Card, Case: Search, Domain: Filter

// フック
useCardSearch.ts           // Block: Card, Case: Search
useCardSearchFilter.ts     // Block: Card, Case: SearchFilter

// ストア
cardSearchStore.ts         // Block: card, Case: Search, Domain: Store

// 型定義
interface CardSearchProps {}
interface CardSearchState {}
type CardSearchSortType = 'name' | 'cost' | 'power';
```

### 2. デッキビルダー機能
```typescript
// ディレクトリ
features/deck-builder/

// コンポーネント
DeckBuilderPage.tsx        // Block: Deck, Case: Builder, Domain: Page
DeckBuilderSidebar.tsx     // Block: Deck, Case: Builder, Domain: Sidebar
DeckBuilderCanvas.tsx      // Block: Deck, Case: Builder, Domain: Canvas

// フック
useDeckBuilder.ts          // Block: Deck, Case: Builder
useDeckValidation.ts       // Block: Deck, Case: Validation

// ストア
deckBuilderStore.ts        // Block: deck, Case: Builder, Domain: Store

// 定数
const DECK_MAX_SIZE = 40;
const DECK_MIN_SIZE = 30;
```

## アンチパターン

### 避けるべき命名
```typescript
// ❌ 曖昧な名前
const data = fetchData();
const handleClick = () => {};

// ❌ 省略形の多用
const usrProf = getUserProfile();
const crdCnt = cards.length;

// ❌ 一貫性のない命名
CardDisplay.tsx vs card-show.tsx
useCardData.ts vs useCardsInfo.ts

// ❌ ドメインが不明確
Button.tsx  // → CardActionButton.tsx
Modal.tsx   // → DeckSaveModal.tsx
```

## まとめ

BCDデザインパターンに基づく命名規則により：
1. **一貫性**: プロジェクト全体で統一された命名
2. **可読性**: 名前から機能と責務が明確
3. **検索性**: パターン化により検索が容易
4. **保守性**: 新規開発者も理解しやすい構造

この命名規則を遵守することで、チーム全体の生産性と<del>コード品質を向上させます。