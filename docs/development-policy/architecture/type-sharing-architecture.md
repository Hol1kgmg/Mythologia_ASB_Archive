# 型共有アーキテクチャ - Mythologia Admiral Ship Bridge

## 概要

**神託のメソロギア**ファンサイト「Mythologia Admiral Ship Bridge」における、フロントエンドとバックエンド間での型定義共有アーキテクチャです。**ドメイン分離ポリシー**、**技術方針**に基づき、Honoフレームワークとマルチプラットフォーム対応（Vercel/Cloudflare）を考慮したセキュアで保守性の高い設計となっています。

### このドキュメントの位置づけ
- **ベース**: `docs/development-policy/architecture/domain-separation-policy.md`
- **技術選定**: `docs/development-policy/architecture/technical-decisions.md`
- **全体設計**: `docs/system-design/architecture.md`
- **実装指針**: このドキュメント

## 基本方針

### 1. 型共有の原則
- **共有するもの**: DTO（Data Transfer Object）、APIレスポンス型、Zodバリデーションスキーマ、ゲームルール定数
- **共有しないもの**: ドメインモデル、内部実装の型、データベーススキーマ、セキュリティセンシティブな型

### 2. プラットフォーム対応
- **Vercel環境**: PostgreSQL + Vercel KV
- **Cloudflare環境**: D1 + Cloudflare KV  
- **共通インターフェース**: アダプターパターンによる環境抽象化

### 3. ディレクトリ構造
```
webapp/
├── shared/                      # 共有パッケージ (@mythologia/shared)
│   ├── src/
│   │   ├── types/              # 共有型定義
│   │   │   ├── dto/            # データ転送オブジェクト
│   │   │   │   ├── card.dto.ts          # カード情報DTO
│   │   │   │   ├── deck.dto.ts          # デッキ情報DTO
│   │   │   │   ├── tribe.dto.ts         # 種族情報DTO
│   │   │   │   ├── card-set.dto.ts      # カードセットDTO
│   │   │   │   └── user.dto.ts          # ユーザー情報DTO
│   │   │   ├── api/            # APIレスポンス型
│   │   │   │   ├── responses.ts         # 統一レスポンス型
│   │   │   │   ├── errors.ts            # エラーレスポンス型
│   │   │   │   └── filters.ts           # 検索・フィルター型
│   │   │   └── common/         # 共通型定義
│   │   │       ├── pagination.ts       # ページネーション
│   │   │       ├── enums.ts            # 共通Enum
│   │   │       └── utils.ts            # ユーティリティ型
│   │   ├── schemas/            # Zodバリデーションスキーマ
│   │   │   ├── card.schema.ts          # カード検証スキーマ
│   │   │   ├── deck.schema.ts          # デッキ検証スキーマ
│   │   │   ├── tribe.schema.ts         # 種族検証スキーマ
│   │   │   └── auth.schema.ts          # 認証検証スキーマ
│   │   ├── constants/          # 共通定数
│   │   │   ├── game-rules.ts           # ゲームルール定数
│   │   │   ├── leaders.ts              # リーダー定数
│   │   │   ├── rarities.ts             # レアリティ定数
│   │   │   └── card-types.ts           # カードタイプ定数
│   │   └── adapters/           # プラットフォーム抽象化
│   │       ├── database.adapter.ts     # DB統一インターフェース
│   │       └── cache.adapter.ts        # キャッシュ統一インターフェース
│   ├── package.json
│   ├── tsconfig.json
│   └── exports.json            # エクスポート設定
│
├── backend/                     # Honoバックエンド
│   ├── src/
│   │   ├── domain/             # ドメインモデル（非共有）
│   │   │   ├── card.domain.ts           # カードドメインロジック
│   │   │   ├── deck.domain.ts           # デッキドメインロジック
│   │   │   └── tribe.domain.ts          # 種族ドメインロジック
│   │   ├── application/        # アプリケーション層
│   │   │   ├── services/               # ビジネスロジック
│   │   │   └── use-cases/              # ユースケース
│   │   ├── infrastructure/     # インフラ層
│   │   │   ├── database/               # データベース実装
│   │   │   ├── cache/                  # キャッシュ実装
│   │   │   └── adapters/               # プラットフォームアダプター
│   │   └── api/                # API層（Hono）
│   │       ├── routes/                 # ルート定義
│   │       ├── middleware/             # ミドルウェア
│   │       └── controllers/            # コントローラー
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                    # Next.js フロントエンド
    ├── src/
    │   ├── app/                # App Router
    │   ├── features/           # Feature-Sliced Design
    │   │   ├── deck-builder/           # デッキ構築機能
    │   │   ├── card-browser/           # カード閲覧機能
    │   │   └── auth/                   # 認証機能
    │   ├── shared/             # UI共有コード
    │   │   ├── ui/                     # UIコンポーネント
    │   │   ├── hooks/                  # カスタムフック
    │   │   └── utils/                  # ユーティリティ
    │   └── widgets/            # ページレベルコンポーネント
    ├── package.json
    └── tsconfig.json
```

## 実装詳細

### 1. Mythologia固有のDTO定義

#### カード関連DTO
```typescript
// shared/src/types/dto/card.dto.ts
export interface CardDto {
  id: string;
  cardNumber: string;          // カード番号（M001-001等）
  name: string;
  cost: number;
  power: number;
  imageUrl: string;
  leaderId: number | null;     // 1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE
  tribeId: number | null;      // 動的種族ID（tribes.id）
  rarityId: number;            // 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
  cardTypeId: number;          // 1:ATTACKER, 2:BLOCKER, 3:CHARGER
  archetypeId?: number;        // 1:EARLY_GAME, 2:MID_GAME, 3:LATE_GAME, 4:UTILITY, 5:REMOVAL, 6:ENGINE
  cardSetId: string;           // カードセットID
  // 表示用の計算済みプロパティ
  displayName: string;         // レアリティプレフィックス付き名前
  formattedCost: string;       // 「3コスト」等の表示形式
  canPlayInLeader?: number[];  // 使用可能リーダーリスト
  effects: CardEffectDto[];    // カード効果（表示用）
}

export interface CardEffectDto {
  id: string;
  type: 'BATTLE' | 'ENTER' | 'LEAVE' | 'CONTINUOUS';
  description: string;         // 日本語説明文
  timing: string;              // 発動タイミング
}

export interface CardListDto {
  cards: CardDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    leaderDistribution: Record<string, number>;
    costDistribution: Record<number, number>;
    tribeDistribution: Record<string, number>;
  };
}

// shared/src/types/dto/tribe.dto.ts
export interface TribeDto {
  id: number;
  name: string;
  leaderId: number | null;     // 関連リーダーID
  thematic: string | null;     // テーマ特性
  description: string | null;
  isActive: boolean;
  masterCardId: string | null; // マスターカードID
  cardCount: number;           // 所属カード数
}

// shared/src/types/dto/deck.dto.ts
export interface DeckDto {
  id: string;
  name: string;
  leaderId: number;            // 必須リーダーID
  cardCount: number;
  isValid: boolean;
  isCompetitive: boolean;      // 大会使用可能フラグ
  createdAt: string;
  updatedAt: string;
  deckCode?: string;           // 圧縮デッキコード
}

export interface DeckDetailDto extends DeckDto {
  cards: DeckCardDto[];
  statistics: DeckStatisticsDto;
  validationErrors?: DeckValidationError[];
  recommendations?: CardDto[]; // 推薦カード
}

export interface DeckCardDto {
  cardId: string;
  quantity: number;            // 1-3枚
  card: CardDto;
  isRequired?: boolean;        // 必須カード（デッキ制約）
}

export interface DeckStatisticsDto {
  totalCards: number;          // 30-40枚
  averageCost: number;
  costDistribution: Record<number, number>;
  typeDistribution: Record<string, number>; // ATTACKER/BLOCKER/CHARGER
  tribeDistribution: Record<string, number>;
  rarityDistribution: Record<string, number>;
  leaderCompatibility: number; // リーダー相性度（%）
  expectedPower: number;       // 期待パワー値
}

export interface DeckValidationError {
  type: 'CARD_COUNT' | 'LEADER_MISMATCH' | 'RARITY_LIMIT' | 'TRIBE_CONFLICT';
  message: string;
  cardIds?: string[];          // 関連カードID
  severity: 'ERROR' | 'WARNING';
}

// shared/src/types/dto/card-set.dto.ts
export interface CardSetDto {
  id: string;
  name: string;
  code: string;                // セットコード（M001等）
  releaseDate: string;
  cardCount: number;
  description: string;
  isLatest: boolean;
  imageUrl: string;            // セットアイコン
}
```

#### APIレスポンス型
```typescript
// shared/src/types/api/responses.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, string[]>;
    errorId?: string;
  };
}

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

// shared/src/types/common/pagination.ts
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### 2. Mythologia固有のゲームルール定数

```typescript
// shared/src/constants/game-rules.ts
/**
 * 神託のメソロギア ゲームルール定数
 * 公式ルールに基づく制約とバランス調整値
 */
export const GAME_RULES = {
  DECK: {
    MIN_CARDS: 30,               // デッキ最小枚数
    MAX_CARDS: 40,               // デッキ最大枚数
    MAX_SAME_CARD: 3,            // 同名カード最大枚数
    MAX_LEGEND_CARDS: 2,         // レジェンド最大枚数
    REQUIRED_LEADER: true,       // リーダー必須
  },
  BATTLE: {
    MAX_HAND_SIZE: 7,            // 手札上限
    STARTING_HAND: 5,            // 初期手札
    MAX_FIELD_SIZE: 5,           // フィールド上限
    TURN_TIME_LIMIT: 120,        // ターン制限時間（秒）
  },
  COST: {
    MIN_COST: 0,                 // 最小コスト
    MAX_COST: 10,                // 最大コスト（現実的上限）
    STARTING_MANA: 1,            // 初期マナ
    MAX_MANA: 10,                // 最大マナ
  }
} as const;

// shared/src/types/dto/leader.dto.ts  
// リーダー情報はleadersテーブルから動的に取得
export interface LeaderDto {
  id: number;
  name: string;                // 日本語名
  nameEn: string;              // 英語名
  description: string;         // 説明
  color: string;               // テーマカラー（HEX）
  thematic: string;            // テーマ特性
  iconUrl?: string;            // アイコンURL
  focus: 'aggro' | 'control' | 'midrange' | 'defense' | 'combo';
  averageCost: number;         // 推奨平均コスト
  preferredCardTypes: string[]; // 推奨カードタイプ
  keyEffects: string[];        // 主要効果
  sortOrder: number;           // 表示順序
  isActive: boolean;           // アクティブフラグ
}

// レガシー互換性のためのヘルパー定数（実装初期のみ使用）
export const LEADER_IDS = {
  DRAGON: 1,
  ANDROID: 2, 
  ELEMENTAL: 3,
  LUMINUS: 4,
  SHADE: 5,
} as const;

// shared/src/constants/rarities.ts
export const RARITIES = {
  BRONZE: {
    id: 1,
    name: 'ブロンズ',
    nameEn: 'Bronze',
    color: '#CD7F32',
    maxInDeck: 3,                // デッキ内最大枚数
    dropRate: 0.7,               // パック排出率
  },
  SILVER: {
    id: 2,
    name: 'シルバー',
    nameEn: 'Silver',
    color: '#C0C0C0',
    maxInDeck: 3,
    dropRate: 0.25,
  },
  GOLD: {
    id: 3,
    name: 'ゴールド',
    nameEn: 'Gold',
    color: '#FFD700',
    maxInDeck: 3,
    dropRate: 0.04,
  },
  LEGEND: {
    id: 4,
    name: 'レジェンド',
    nameEn: 'Legend',
    color: '#FF1493',
    maxInDeck: 2,                // レジェンドは最大2枚
    dropRate: 0.01,
  },
} as const;

// shared/src/constants/card-types.ts
export enum CardType {
  ATTACKER = 1,
  BLOCKER = 2,
  CHARGER = 3,
}

export enum CardArchetype {
  EARLY_GAME = 1,
  MID_GAME = 2,
  LATE_GAME = 3,
  UTILITY = 4,
  REMOVAL = 5,
  ENGINE = 6,
}

export const CARD_TYPES = {
  [CardType.ATTACKER]: {
    id: CardType.ATTACKER,
    name: 'アタッカー',
    nameEn: 'Attacker',
    description: '攻撃に特化したカード',
    icon: '⚔️',
  },
  [CardType.BLOCKER]: {
    id: CardType.BLOCKER,
    name: 'ブロッカー',
    nameEn: 'Blocker',
    description: '防御に特化したカード',
    icon: '🛡️',
  },
  [CardType.CHARGER]: {
    id: CardType.CHARGER,
    name: 'チャージャー',
    nameEn: 'Charger',
    description: 'サポート効果を持つカード',
    icon: '⚡',
  },
} as const;

export const ARCHETYPES = {
  [CardArchetype.EARLY_GAME]: {
    id: CardArchetype.EARLY_GAME,
    name: '序盤型',
    nameEn: 'Early Game',
    description: 'ゲーム開始直後にプレイされる低コストカード',
    costRange: [1, 3],
  },
  [CardArchetype.MID_GAME]: {
    id: CardArchetype.MID_GAME,
    name: '中盤型',
    nameEn: 'Mid Game',
    description: 'ゲーム中盤の主力となるバランス型カード',
    costRange: [4, 6],
  },
  [CardArchetype.LATE_GAME]: {
    id: CardArchetype.LATE_GAME,
    name: '終盤型',
    nameEn: 'Late Game',
    description: 'ゲーム終盤の勝負を決する高コストカード',
    costRange: [7, 10],
  },
  [CardArchetype.UTILITY]: {
    id: CardArchetype.UTILITY,
    name: 'ユーティリティ',
    nameEn: 'Utility',
    description: '特殊な効果やサポート機能を持つカード',
    costRange: [1, 8],
  },
  [CardArchetype.REMOVAL]: {
    id: CardArchetype.REMOVAL,
    name: '除去',
    nameEn: 'Removal',
    description: '相手のカードや脅威を除去するカード',
    costRange: [2, 6],
  },
  [CardArchetype.ENGINE]: {
    id: CardArchetype.ENGINE,
    name: 'エンジン',
    nameEn: 'Engine',
    description: '継続的なアドバンテージを生み出すカード',
    costRange: [3, 7],
  },
} as const;

// 型ヘルパー
export type LeaderId = typeof LEADER_IDS[keyof typeof LEADER_IDS];
export type RarityId = typeof RARITIES[keyof typeof RARITIES]['id'];
export type CardTypeId = CardType;
export type ArchetypeId = CardArchetype;

// ユーティリティ関数
export const getLeaderById = (id: LeaderId) => {
  return Object.values(LEADERS).find(leader => leader.id === id);
};

export const getRarityById = (id: RarityId) => {
  return Object.values(RARITIES).find(rarity => rarity.id === id);
};

export const getCardTypeById = (id: CardTypeId) => {
  return CARD_TYPES[id];
};

export const getArchetypeById = (id: ArchetypeId) => {
  return ARCHETYPES[id];
};
```

### 3. Zodバリデーションスキーマ

```typescript
// shared/src/schemas/deck.schema.ts
import { z } from 'zod';
import { GAME_RULES } from '../constants/game-rules';

// フォーム入力用スキーマ
export const createDeckInputSchema = z.object({
  name: z.string()
    .min(1, 'デッキ名を入力してください')
    .max(50, 'デッキ名は50文字以内で入力してください'),
  leaderId: z.number()
    .int()
    .min(1)
    .max(5),
  cardIds: z.array(z.string())
    .min(GAME_RULES.DECK.MIN_CARDS, `カードは最低${GAME_RULES.DECK.MIN_CARDS}枚必要です`)
    .max(GAME_RULES.DECK.MAX_CARDS, `カードは最大${GAME_RULES.DECK.MAX_CARDS}枚まで追加できます`)
});

export type CreateDeckInput = z.infer<typeof createDeckInputSchema>;

// 更新用スキーマ
export const updateDeckInputSchema = createDeckInputSchema.partial();
export type UpdateDeckInput = z.infer<typeof updateDeckInputSchema>;

// カード追加用スキーマ
export const addCardToDeckSchema = z.object({
  cardId: z.string().uuid(),
  quantity: z.number().int().min(1).max(3)
});

export type AddCardToDeckInput = z.infer<typeof addCardToDeckSchema>;

// カード検索・フィルタースキーマ
export const cardFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  leaderId: z.number().int().min(1).max(5).optional(),
  tribeId: z.number().int().positive().optional(),
  rarityId: z.number().int().min(1).max(4).optional(),
  cardTypeId: z.number().int().min(1).max(3).optional(),
  costMin: z.number().int().min(0).max(10).optional(),
  costMax: z.number().int().min(0).max(10).optional(),
  powerMin: z.number().int().min(0).optional(),
  powerMax: z.number().int().min(0).optional(),
  search: z.string().max(100).optional(),
  cardSetId: z.string().optional(),
  sortBy: z.enum(['name', 'cost', 'power', 'releaseDate']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CardFilterInput = z.infer<typeof cardFilterSchema>;
```

### 4. プラットフォーム抽象化アダプター

```typescript
// shared/src/adapters/database.adapter.ts
export interface DatabaseAdapter {
  // クエリ実行
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ rowsAffected: number }>;
  
  // トランザクション
  transaction<T>(fn: (trx: DatabaseAdapter) => Promise<T>): Promise<T>;
  
  // バッチ処理
  batch(statements: { sql: string; params?: any[] }[]): Promise<any[]>;
  
  // 環境情報
  getPlatform(): 'vercel' | 'cloudflare';
  getConnectionInfo(): { type: string; version: string };
}

// shared/src/adapters/cache.adapter.ts
export interface CacheAdapter {
  // 基本操作
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  
  // バッチ操作
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset<T>(pairs: { key: string; value: T; ttl?: number }[]): Promise<void>;
  
  // パターン操作
  deletePattern(pattern: string): Promise<number>;
  exists(key: string): Promise<boolean>;
  
  // TTL管理
  getTtl(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
}
```

### 5. Honoベースのバックエンド実装

```typescript
// backend/src/domain/card.domain.ts（非共有）
import type { CardDto, CardEffectDto } from '@mythologia/shared/types';
import { LEADERS, RARITIES, CARD_TYPES } from '@mythologia/shared/constants';

export class CardDomain {
  constructor(
    private id: string,
    private cardNumber: string,
    private name: string,
    private leaderId: number | null,
    private tribeId: number | null,
    private rarityId: number,
    private cardTypeId: number,
    private cost: number,
    private power: number,
    private cardSetId: string,
    private effects: CardEffectDomain[]
  ) {}

  // Mythologiaゲーム固有のビジネスロジック
  calculateBattlePower(context: BattleContext): number {
    let modifiedPower = this.power;
    
    // 種族シナジー効果
    if (context.fieldTribes.includes(this.tribeId)) {
      modifiedPower += this.getTribeSynergyBonus();
    }
    
    // リーダー相性効果
    if (this.leaderId === context.playerLeaderId) {
      modifiedPower += this.getLeaderBonus();
    }
    
    // カード効果適用
    for (const effect of this.effects) {
      modifiedPower = effect.applyToPower(modifiedPower, context);
    }
    
    return Math.max(0, modifiedPower);
  }

  canBePlayedBy(leaderId: number): boolean {
    return this.leaderId === null || this.leaderId === leaderId;
  }

  // DTO変換（API公開用）
  toDto(): CardDto {
    return {
      id: this.id,
      cardNumber: this.cardNumber,
      name: this.name,
      cost: this.cost,
      power: this.power,
      imageUrl: `/images/cards/${this.cardNumber}.jpg`,
      leaderId: this.leaderId,
      tribeId: this.tribeId,
      rarityId: this.rarityId,
      cardTypeId: this.cardTypeId,
      cardSetId: this.cardSetId,
      displayName: this.getDisplayName(),
      formattedCost: `${this.cost}コスト`,
      canPlayInLeader: this.getPlayableLeaders(),
      effects: this.effects.map(effect => effect.toDto()),
    };
  }

  private getDisplayName(): string {
    const rarity = Object.values(RARITIES).find(r => r.id === this.rarityId);
    const prefix = rarity?.id === RARITIES.LEGEND.id ? '【伝説】' : '';
    return `${prefix}${this.name}`;
  }
  
  private getPlayableLeaders(): number[] {
    if (this.leaderId === null) return Object.values(LEADERS).map(l => l.id);
    return [this.leaderId];
  }
}

// backend/src/api/routes/cards.route.ts (Hono)
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { cardFilterSchema } from '@mythologia/shared/schemas';
import type { ApiResponse, CardListDto } from '@mythologia/shared/types';
import { cardService } from '../services/card.service';

const cardsRouter = new Hono();

// カード一覧取得
cardsRouter.get('/', zValidator('query', cardFilterSchema), async (c) => {
  try {
    const filters = c.req.valid('query');
    const result = await cardService.findCards(filters);
    
    const response: ApiResponse<CardListDto> = {
      success: true,
      data: {
        cards: result.cards.map(card => card.toDto()),
        pagination: result.pagination,
        filters: result.filters,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    
    return c.json(response);
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'カード取得に失敗しました',
        errorId: crypto.randomUUID(),
      },
    }, 500);
  }
});

export { cardsRouter };
```

### 6. Next.jsフロントエンド実装（Feature-Sliced Design）

```typescript
// frontend/src/features/deck-builder/api/use-cards.ts
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, CardListDto } from '@mythologia/shared/types';
import { cardFilterSchema } from '@mythologia/shared/schemas';
import { api } from '@/shared/api/client';

export interface UseCardsParams {
  page?: number;
  limit?: number;
  leaderId?: number;
  tribeId?: number;
  rarityId?: number;
  costMin?: number;
  costMax?: number;
  search?: string;
}

export function useCards(params: UseCardsParams) {
  // パラメータのバリデーション
  const validatedParams = cardFilterSchema.parse(params);
  
  return useQuery({
    queryKey: ['cards', validatedParams],
    queryFn: async () => {
      const response = await api.get<ApiResponse<CardListDto>>('/api/cards', {
        params: validatedParams,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'カード取得に失敗しました');
      }
      
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,  // 5分間キャッシュ
    gcTime: 30 * 60 * 1000,   // 30分間メモリ保持
  });
}

// frontend/src/features/deck-builder/components/DeckForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDeckInputSchema, type CreateDeckInput } from '@mythologia/shared/schemas';
import { LEADERS } from '@mythologia/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';

export function DeckForm() {
  const queryClient = useQueryClient();
  
  const form = useForm<CreateDeckInput>({
    resolver: zodResolver(createDeckInputSchema),
    defaultValues: {
      name: '',
      leaderId: LEADERS.DRAGON.id,
      cardIds: [],
    },
  });

  const createDeckMutation = useMutation({
    mutationFn: async (data: CreateDeckInput) => {
      const response = await api.post('/api/decks', data);
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'デッキ作成に失敗しました');
      }
      return response.data.data;
    },
    onSuccess: (deck) => {
      // キャッシュ更新
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      
      // 成功通知
      toast.success(`デッキ「${deck.name}」を作成しました`);
      
      // 詳細ページに遷移
      router.push(`/decks/${deck.id}`);
    },
    onError: (error) => {
      if (isApiError(error) && error.response?.data.error.code === 'VALIDATION_ERROR') {
        // バックエンドからの詳細エラーをフォームに反映
        const details = error.response.data.error.details;
        Object.entries(details || {}).forEach(([field, messages]) => {
          form.setError(field as keyof CreateDeckInput, {
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });
      } else {
        toast.error(error.message || 'デッキ作成に失敗しました');
      }
    },
  });

  const onSubmit = async (data: CreateDeckInput) => {
    await createDeckMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* デッキ名入力 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          デッキ名
        </label>
        <input
          {...form.register('name')}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="デッキ名を入力"
        />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* リーダー選択 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          リーダー
        </label>
        <select
          {...form.register('leaderId', { valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded-md"
        >
          {Object.values(LEADERS).map((leader) => (
            <option key={leader.id} value={leader.id}>
              {leader.name}
            </option>
          ))}
        </select>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={createDeckMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {createDeckMutation.isPending ? 'デッキ作成中...' : 'デッキを作成'}
      </button>
    </form>
  );
}
```

## パッケージ設定とワークスペース構成

### shared/package.json
```json
{
  "name": "@mythologia/shared",
  "version": "1.0.0",
  "description": "Mythologia Admiral Ship Bridge - 共有型定義・バリデーション・定数",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js"
    },
    "./schemas": {
      "types": "./dist/schemas/index.d.ts",
      "import": "./dist/schemas/index.js"
    },
    "./constants": {
      "types": "./dist/constants/index.d.ts",
      "import": "./dist/constants/index.js"
    },
    "./adapters": {
      "types": "./dist/adapters/index.d.ts",
      "import": "./dist/adapters/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "test": "vitest"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "vitest": "^1.0.0"
  }
}
```

### backend/package.json
```json
{
  "name": "@mythologia/backend",
  "version": "1.0.0",
  "description": "Mythologia Admiral Ship Bridge - Honoバックエンド",
  "main": "dist/index.js",
  "scripts": {
    "dev": "wrangler dev src/index.ts --compatibility-date 2024-01-01",
    "build": "tsc",
    "deploy:cloudflare": "wrangler deploy",
    "deploy:vercel": "vercel deploy",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@mythologia/shared": "workspace:*",
    "hono": "^3.12.0",
    "@hono/zod-validator": "^0.2.0",
    "jose": "^5.0.0",
    "pino": "^8.17.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20231218.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "wrangler": "^3.0.0",
    "vitest": "^1.0.0"
  }
}
```

### frontend/package.json
```json
{
  "name": "@mythologia/frontend",
  "version": "1.0.0",
  "description": "Mythologia Admiral Ship Bridge - Next.jsフロントエンド",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@mythologia/shared": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "jotai": "^2.6.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### ルートpackage.json（ワークスペース設定）
```json
{
  "name": "mythologia-admiral-ship-bridge",
  "version": "1.0.0",
  "description": "神託のメソロギア ファンサイト - Mythologia Admiral Ship Bridge",
  "private": true,
  "workspaces": [
    "webapp/shared",
    "webapp/backend",
    "webapp/frontend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:shared\" \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:shared": "npm run dev --workspace=@mythologia/shared",
    "dev:backend": "npm run dev --workspace=@mythologia/backend",
    "dev:frontend": "npm run dev --workspace=@mythologia/frontend",
    "build": "npm run build --workspace=@mythologia/shared && npm run build --workspace=@mythologia/backend && npm run build --workspace=@mythologia/frontend",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "type-check": "npm run type-check --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

## 開発ベストプラクティス

### 1. 型定義の更新ワークフロー
```bash
# 1. 共有パッケージで型定義を更新
cd webapp/shared
npm run build

# 2. バックエンド・フロントエンドで型チェック
npm run type-check --workspaces

# 3. テスト実行
npm run test --workspaces

# 4. コミット
git add .
git commit -m "feat: 新しいTribeDto型定義を追加"
```

### 2. エラーハンドリング戦略
```typescript
// shared/src/types/api/errors.ts
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;              // ユーザー向けメッセージ
    details?: ValidationDetails;   // フィールド別エラー詳細
    errorId: string;              // トラッキング用UUID
    timestamp: string;
  };
}

// バックエンドでの実装例
try {
  const deck = await deckService.create(input);
  return c.json({ success: true, data: deck.toDto() });
} catch (error) {
  const errorId = crypto.randomUUID();
  
  // ログに詳細な情報を記録（内部用）
  logger.error('Deck creation failed', {
    errorId,
    userId: c.get('userId'),
    input,
    error: error.message,
    stack: error.stack,
  });
  
  // ユーザーには安全な情報のみ返却
  return c.json({
    success: false,
    error: {
      code: 'DECK_CREATION_ERROR',
      message: 'デッキの作成に失敗しました。しばらく後に再試行してください。',
      errorId,
      timestamp: new Date().toISOString(),
    },
  }, 500);
}
```

### 3. セキュリティガイドライン
```typescript
// ❌ 悪い例：内部実装の露出
export interface CardDto {
  _databaseId: number;          // 内部ID露出
  _internalCost: number;        // 内部コスト計算値
  adminNotes: string;           // 管理者メモ
}

// ✅ 良い例：最小限の公開情報
export interface CardDto {
  id: string;                   // 公開ID
  name: string;                 // 表示名
  cost: number;                 // 最終コスト値
  // 内部実装は隠蔽
}
```

## 型共有アーキテクチャの利点

### 1. 開発効率の向上
- **IntelliSense**: IDEでの自動補完とタイプチェック
- **リファクタリング**: 型レベルでの一括変更対応
- **ドキュメント**: 型定義自体がAPIドキュメントとして機能

### 2. 品質保証
- **型安全性**: コンパイル時のエラー検出
- **一貫性**: フロントエンド・バックエンド間の型整合性
- **テスト**: 型レベルでの契約テスト

### 3. 保守性
- **Single Source of Truth**: 型定義の一元管理
- **段階的移行**: 下位互換性を保った段階的アップデート
- **依存関係**: 明確な依存関係とインターフェース

### 4. スケーラビリティ
- **プラットフォーム対応**: Vercel/Cloudflare両環境対応
- **機能拡張**: 新機能追加時の型安全性確保
- **チーム開発**: 複数開発者での一貫した型使用

## まとめ

この型共有アーキテクチャにより、**Mythologia Admiral Ship Bridge**プロジェクトは：

1. **Mythologia固有の要件対応**: ゲームルール、種族システム、デッキ制約の型安全な実装
2. **マルチプラットフォーム対応**: Vercel/Cloudflare環境での一貫した開発体験
3. **高品質なUX**: 型安全性によるバグ削減とリアルタイムバリデーション
4. **効率的な開発**: Feature-Sliced Designとの組み合わせによる保守性向上
5. **将来への拡張性**: 新カードセット・新機能追加への柔軟な対応

**ドメイン分離ポリシー**を維持しながら、開発者体験と型安全性を最大化する現代的なWebアプリケーションアーキテクチャを実現します。