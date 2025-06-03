# データモデル定義

## 1. カード (Card)

```typescript
interface Card {
  id: string;                    // 一意識別子
  name: string;                  // カード名
  leader?: Leader;              // リーダー（オプション）
  tribe?: string;               // 種族（オプション）
  rarity: Rarity;               // レアリティ
  cardNumber: string;            // カード番号
  cardType: CardType;           // カードタイプ
  cost: number;                 // コスト
  power: number;                // パワー
  effects: CardEffect[];        // 効果（JSON型配列） ※詳細は card-effect-models.md 参照
  flavorText?: string;          // フレーバーテキスト
  imageUrl: string;             // カード画像URL
  artist?: string;              // イラストレーター
  releaseSet: string;           // リリースセット
  createdAt: Date;              // 作成日時
  updatedAt: Date;              // 更新日時
}

// CardEffect インターフェースの詳細は card-effect-models.md を参照

enum Rarity {
  LEGEND = "LEGEND",
  GOLD = "GOLD",
  SILVER = "SILVER",
  BRONZE = "BRONZE"
}

enum CardType {
  ATTACKER = "ATTACKER",
  BLOCKER = "BLOCKER",
  CHARGER = "CHARGER"
}

enum Leader {
  DRAGON = "DRAGON",
  ANDROID = "ANDROID",
  ELEMENTAL = "ELEMENTAL",
  LUMINUS = "LUMINUS",
  SHADE = "SHADE"
}
```

## 2. デッキ (Deck)

```typescript
interface Deck {
  id: string;                    // 一意識別子
  userId: string;                // 作成者ID
  leaderId: number;             // リーダーID (1-5)
  name: string;                  // デッキ名
  description?: string;          // デッキ説明
  deckCode: string;             // デッキコード（圧縮形式）
  cardCount: number;            // カード総数（30-40）
  isPublic: boolean;            // 公開設定
  tags: string[];               // タグ
  createdAt: Date;              // 作成日時
  updatedAt: Date;              // 更新日時
  likes: number;                // いいね数
  views: number;                // 閲覧数
  isDeleted: boolean;           // 削除フラグ
  deletedAt?: Date;             // 削除日時
  // 計算済み統計（オプション）
  avgCost?: number;             // 平均コスト
  avgPower?: number;            // 平均パワー
  cardTypes?: CardTypeDistribution;  // カードタイプ分布
  rarities?: RarityDistribution;     // レアリティ分布
}

// デッキコード形式: "cardId:quantity,cardId:quantity,..."
// 例: "10015:2,10028:3,10025:3,80012:2"

interface DeckCard {
  cardId: string;               // カードID
  quantity: number;             // 枚数
}

interface CardTypeDistribution {
  attacker: number;
  blocker: number;
  charger: number;
}

interface RarityDistribution {
  legend: number;
  gold: number;
  silver: number;
  bronze: number;
}
```

## 3. ユーザー (User)

```typescript
interface User {
  id: string;                    // 一意識別子
  username: string;              // ユーザー名
  email: string;                 // メールアドレス
  passwordHash: string;          // パスワードハッシュ
  displayName?: string;          // 表示名
  avatar?: string;               // アバター画像URL
  bio?: string;                  // 自己紹介
  role: UserRole;               // ユーザー権限
  createdAt: Date;              // 作成日時
  updatedAt: Date;              // 更新日時
  lastLoginAt?: Date;           // 最終ログイン日時
}

enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}
```

## 4. デッキ評価 (DeckLike)

```typescript
interface DeckLike {
  id: string;                    // 一意識別子
  userId: string;                // ユーザーID
  deckId: string;                // デッキID
  createdAt: Date;              // 作成日時
}
```

## 5. コメント (Comment)

```typescript
interface Comment {
  id: string;                    // 一意識別子
  userId: string;                // ユーザーID
  deckId: string;                // デッキID
  content: string;               // コメント内容
  createdAt: Date;              // 作成日時
  updatedAt: Date;              // 更新日時
}
```

## 6. デッキ統計 (DeckStats)

```typescript
interface DeckStats {
  deckId: string;                // デッキID
  cardTypeDistribution: {
    attacker: number;
    blocker: number;
    charger: number;
  };
  costCurve: Record<number, number>;  // コスト別カード枚数
  leaderDistribution: Record<string, number>; // リーダー別カード枚数
  rarityDistribution: {
    legend: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  averageCost: number;           // 平均コスト
}
```

## 7. カードセット (CardSet)

```typescript
interface CardSet {
  id: string;                    // 一意識別子
  name: string;                  // セット名
  code: string;                  // セットコード
  releaseDate: Date;             // リリース日
  cardCount: number;             // カード総数
  description?: string;          // セット説明
}
```

## リレーション

### 主要なリレーション
- User 1:N Deck (ユーザーは複数のデッキを作成可能)
- Deck N:M Card (デッキは複数のカードを含み、カードは複数のデッキに含まれる)
- User 1:N DeckLike (ユーザーは複数のデッキにいいね可能)
- User 1:N Comment (ユーザーは複数のコメントを投稿可能)
- Deck 1:N Comment (デッキは複数のコメントを持つ)
- Deck 1:1 DeckStats (デッキは統計情報を持つ)
- CardSet 1:N Card (カードセットは複数のカードを含む)

## インデックス設計

### 推奨インデックス
- Card: name, rarity, cardType, leader, tribe, cost, power
- Deck: userId, isPublic, createdAt, likes
- User: username, email
- DeckLike: userId + deckId (複合ユニーク)
- Comment: deckId, createdAt