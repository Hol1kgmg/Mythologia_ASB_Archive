# カードカテゴリシステム設計

## 概要

神託のメソロギアにおけるカードの「カテゴリ」分類システムの設計ドキュメントです。カテゴリは種族に従属する細分化システムで、種族内での更なる詳細分類を行います。

## カテゴリの概念

### カテゴリとは
カテゴリは種族（Tribe）に従属するカードの詳細分類システムです：

- **種族の細分化**: 各種族内での更なる役割・特性分類
- **種族依存**: カテゴリは必ず特定の種族に属する
- **階層構造**: 種族 > カテゴリという階層関係
- **種族特化**: 種族ごとに独自のカテゴリが存在

### 例：カテゴリの活用
```
カード例：「魔法騎士アルテミス」
- 種族: HUMAN（人間）
- カテゴリ: MAGIC_KNIGHT（魔法騎士）※HUMAN種族内のカテゴリ
- 分類: HUMAN種族の魔法騎士カテゴリ

カード例：「ドラゴンナイト」
- 種族: DRAGON（竜族）
- カテゴリ: KNIGHT（騎士）※DRAGON種族内のカテゴリ
- 分類: DRAGON種族の騎士カテゴリ
```

## データベース設計

### categoriesテーブル

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,               -- カテゴリID
  tribe_id INTEGER NOT NULL,            -- 種族ID（必須）
  name VARCHAR(50) NOT NULL,            -- カテゴリ名（日本語）
  name_en VARCHAR(50) NOT NULL,         -- カテゴリ名（英語）
  description TEXT NULL,                -- カテゴリ説明
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(tribe_id, name),               -- 同一種族内でのカテゴリ名重複防止
  UNIQUE(tribe_id, name_en),            -- 同一種族内での英語名重複防止
  FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE
);
```

### card_categoriesテーブル（中間テーブル）

```sql
CREATE TABLE card_categories (
  card_id VARCHAR(36) NOT NULL,         -- カードID
  category_id INTEGER NOT NULL,         -- カテゴリID
  is_primary BOOLEAN DEFAULT FALSE,     -- 主カテゴリフラグ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (card_id, category_id),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

## カテゴリ分類例

### HUMAN種族のカテゴリ
- **KNIGHT** (1): 騎士 - 重装甲で防御重視
- **MAGE** (2): 魔法使い - 魔法攻撃特化
- **ARCHER** (3): 弓兵 - 遠距離攻撃
- **HEALER** (4): 僧侶 - 回復・支援特化

### DRAGON種族のカテゴリ
- **ANCIENT** (5): 古龍 - 強力な個体
- **WHELP** (6): 幼龍 - 素早い攻撃
- **ELDER** (7): 長老 - 知恵と魔法
- **GUARDIAN** (8): 守護龍 - 防御特化

### MACHINE種族のカテゴリ
- **COMBAT** (9): 戦闘機 - 攻撃特化
- **SUPPORT** (10): 支援機 - サポート機能
- **HEAVY** (11): 重機 - 高耐久
- **SCOUT** (12): 偵察機 - 高機動

### SPIRIT種族のカテゴリ
- **ELEMENTAL** (13): 精霊 - 属性攻撃
- **PHANTOM** (14): 幻霊 - 回避特化
- **GUARDIAN** (15): 守護霊 - 保護能力
- **ANCIENT** (16): 古霊 - 古代の力

### 旧神種族
- **カテゴリなし**: 旧神種族にはカテゴリ分類は存在しない

## ビジネスルール

### 1. カテゴリ付与ルール
- **種族制約**: カテゴリは必ず特定の種族に属する
- **複数カテゴリ**: 1つのカードに同一種族の複数カテゴリを付与可能
- **主カテゴリ**: `is_primary`で主要なカテゴリを1つ指定
- **種族整合性**: カードの種族とカテゴリの種族が一致する必要がある

### 2. 分類ルール
- **種族内分類**: 同一種族内での役割・特性による分類
- **表示・検索**: カテゴリによるカードの表示・検索・フィルタリング
- **情報整理**: プレイヤーがカードを理解・整理するための補助情報

### 3. 動的管理ルール
- **静的enum禁止**: カテゴリはデータベースで動的管理
- **種族連動**: 種族の追加に伴うカテゴリの追加
- **拡張性重視**: 種族ごとの新カテゴリ追加が容易

## API設計

### カテゴリ管理API
```typescript
// 全カテゴリ一覧取得
GET /api/categories
Response: Category[]

// 種族別カテゴリ一覧取得
GET /api/tribes/:tribeId/categories
Response: Category[]

// カテゴリ詳細取得
GET /api/categories/:id
Response: CategoryDetail

// カテゴリ別カード一覧
GET /api/categories/:id/cards
Response: Card[]

// カードのカテゴリ一覧
GET /api/cards/:id/categories
Response: Category[]
```

### データ構造
```typescript
interface Category {
  id: number;
  tribeId: number;           // 種族ID（必須）
  name: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tribe?: Tribe;             // 関連種族情報
}

interface CardCategory {
  cardId: string;
  categoryId: number;
  isPrimary: boolean;
  category: Category;
}

interface TribeWithCategories extends Tribe {
  categories: Category[];    // 種族に属するカテゴリ一覧
}
```

## 実装パターン

### 1. 種族別カテゴリフィルタリング
```typescript
// 種族とカテゴリでのフィルタリング
const filterByTribeAndCategories = (
  cards: Card[], 
  tribeId: number, 
  categoryIds: number[]
) => {
  return cards.filter(card => 
    card.tribeId === tribeId &&
    card.categories.some(cat => categoryIds.includes(cat.id))
  );
};

// 種族内カテゴリ検証
const validateCategoryForTribe = (tribeId: number, categoryId: number) => {
  // カテゴリが指定された種族に属するかチェック
  return categories.find(cat => 
    cat.id === categoryId && cat.tribeId === tribeId
  ) !== undefined;
};
```

### 2. カテゴリ統計計算
```typescript
// 種族カテゴリ分布統計
const calculateTribeCategoryStats = (deck: Card[]) => {
  const tribeCategoryCount = new Map<string, number>();
  
  deck.forEach(card => {
    card.categories.forEach(category => {
      const key = `${card.tribeId}-${category.id}`;
      tribeCategoryCount.set(key, (tribeCategoryCount.get(key) || 0) + 1);
    });
  });
  
  return Array.from(tribeCategoryCount.entries())
    .map(([key, count]) => {
      const [tribeId, categoryId] = key.split('-').map(Number);
      return { tribeId, categoryId, count };
    });
};
```

### 3. 種族内関連カードの推奨
```typescript
// 同一種族内の関連カード推奨
const getRelatedCardsInTribe = (card: Card, allCards: Card[]) => {
  const cardCategoryIds = card.categories.map(cat => cat.id);
  
  return allCards.filter(otherCard => 
    otherCard.id !== card.id &&
    otherCard.tribeId === card.tribeId && // 同一種族
    otherCard.categories.some(cat => cardCategoryIds.includes(cat.id))
  );
};
```

## マイグレーション戦略

### Phase 1: テーブル作成
```sql
-- categoriesテーブル作成
CREATE TABLE categories (...);

-- card_categoriesテーブル作成  
CREATE TABLE card_categories (...);
```

### Phase 2: 初期データ投入
```sql
-- HUMAN種族のカテゴリ投入（tribe_id = 1と仮定）
INSERT INTO categories (id, tribe_id, name, name_en, description) VALUES
(1, 1, '騎士', 'KNIGHT', '重装甲で防御重視'),
(2, 1, '魔法使い', 'MAGE', '魔法攻撃特化'),
(3, 1, '弓兵', 'ARCHER', '遠距離攻撃'),
(4, 1, '僧侶', 'HEALER', '回復・支援特化');

-- DRAGON種族のカテゴリ投入（tribe_id = 2と仮定）
INSERT INTO categories (id, tribe_id, name, name_en, description) VALUES
(5, 2, '古龍', 'ANCIENT', '強力な個体'),
(6, 2, '幼龍', 'WHELP', '素早い攻撃'),
(7, 2, '長老', 'ELDER', '知恵と魔法'),
(8, 2, '守護龍', 'GUARDIAN', '防御特化');
```

### Phase 3: 既存カードへの適用
```sql
-- 既存カードにカテゴリを段階的に適用
-- カードタイプに基づく自動分類も検討
```

## 運用方針

### 1. カテゴリ設計原則
- **明確な役割**: 各カテゴリは明確な戦術的役割を持つ
- **バランス**: カテゴリ間の分類バランスを維持
- **差別化**: 種族とは異なる軸での差別化

### 2. 拡張戦略
- **段階的追加**: 新カテゴリは段階的に追加
- **分類検証**: 新カテゴリの分類妥当性を十分に検証
- **コミュニティフィードバック**: プレイヤーの意見を反映

### 3. メンテナンス
- **定期見直し**: カテゴリの利用状況を定期的に分析
- **分類精度**: 必要に応じてカテゴリ分類の精度を調整
- **非アクティブ化**: 使用されないカテゴリの非アクティブ化

---

このカテゴリシステムにより、種族内での戦略的なカード細分化が可能になり、種族の特色を活かしたカード検索・フィルタリング・整理機能を実現できます。