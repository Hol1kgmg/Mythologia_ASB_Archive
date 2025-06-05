# バックエンド開発ガイド (Hono)

このドキュメントでは、HonoフレームワークベースのバックエンドAPI開発について詳しく説明します。

## Honoフレームワーク概要

[Hono](https://hono-ja.pages.dev/docs/)は軽量で高速なWebフレームワークです。

### 特徴
- **エッジ対応**: Cloudflare Workers、Vercel Edge Functions対応
- **型安全**: TypeScriptファーストで強力な型推論
- **軽量**: 小さなバンドルサイズ
- **高速**: 優れたパフォーマンス
- **マルチランタイム**: Node.js、Bun、Deno対応

## プロジェクト構造

```
webapp/backend/
├── src/
│   ├── index.ts                    # エントリーポイント
│   ├── api/                        # API層
│   │   ├── routes/                 # ルート定義
│   │   │   ├── cards.route.ts      # カード関連API
│   │   │   ├── decks.route.ts      # デッキ関連API
│   │   │   ├── leaders.route.ts    # リーダー関連API
│   │   │   └── tribes.route.ts     # 種族関連API
│   │   ├── middleware/             # ミドルウェア
│   │   │   ├── auth.middleware.ts  # 認証
│   │   │   ├── cors.middleware.ts  # CORS設定
│   │   │   └── error.middleware.ts # エラーハンドリング
│   │   └── controllers/            # コントローラー
│   │       ├── card.controller.ts
│   │       └── deck.controller.ts
│   ├── application/                # アプリケーション層
│   │   ├── services/               # ビジネスロジック
│   │   │   ├── card.service.ts
│   │   │   └── deck.service.ts
│   │   └── use-cases/              # ユースケース
│   │       ├── create-deck.use-case.ts
│   │       └── search-cards.use-case.ts
│   ├── domain/                     # ドメイン層
│   │   ├── card.domain.ts          # カードドメインモデル
│   │   ├── deck.domain.ts          # デッキドメインモデル
│   │   └── leader.domain.ts        # リーダードメインモデル
│   └── infrastructure/             # インフラ層
│       ├── database/               # データベース実装
│       │   ├── adapters/           # DBアダプター
│       │   └── repositories/       # リポジトリ実装
│       └── cache/                  # キャッシュ実装
├── wrangler.toml                   # Cloudflare Workers設定
├── package.json
└── tsconfig.json
```

## API開発ベストプラクティス

### 1. ルート定義

```typescript
// src/api/routes/cards.route.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { cardFilterSchema } from '@mythologia/shared/schemas';
import type { ApiResponse, CardListDto } from '@mythologia/shared/types';
import { cardController } from '../controllers/card.controller';

const cardsRouter = new Hono();

// カード一覧取得
cardsRouter.get('/', 
  zValidator('query', cardFilterSchema),
  cardController.getCards
);

// カード詳細取得
cardsRouter.get('/:id', 
  zValidator('param', z.object({ id: z.string().uuid() })),
  cardController.getCardById
);

// カード作成（管理者のみ）
cardsRouter.post('/',
  authMiddleware,
  adminOnlyMiddleware,
  zValidator('json', createCardSchema),
  cardController.createCard
);

export { cardsRouter };
```

### 2. コントローラー実装

```typescript
// src/api/controllers/card.controller.ts
import type { Context } from 'hono';
import type { ApiResponse, CardListDto, CardDto } from '@mythologia/shared/types';
import { cardService } from '../../application/services/card.service';

export const cardController = {
  async getCards(c: Context) {
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
  },

  async getCardById(c: Context) {
    try {
      const { id } = c.req.valid('param');
      const card = await cardService.findCardById(id);
      
      if (!card) {
        return c.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'カードが見つかりません',
          },
        }, 404);
      }

      const response: ApiResponse<CardDto> = {
        success: true,
        data: card.toDto(),
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
  },
};
```

### 3. ミドルウェア実装

```typescript
// src/api/middleware/auth.middleware.ts
import type { Context, Next } from 'hono';
import { verify } from 'jose';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: '認証が必要です',
      },
    }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await verify(token, secret);
    
    // ユーザー情報をコンテキストに追加
    c.set('user', payload);
    
    await next();
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: '無効なトークンです',
      },
    }, 401);
  }
}

// src/api/middleware/error.middleware.ts
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export function errorHandler(err: Error, c: Context) {
  console.error('Unhandled error:', err);

  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        code: 'HTTP_ERROR',
        message: err.message,
      },
    }, err.status);
  }

  // 予期しないエラー
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '内部サーバーエラーが発生しました',
      errorId: crypto.randomUUID(),
    },
  }, 500);
}
```

### 4. サービス層実装

```typescript
// src/application/services/card.service.ts
import type { CardFilterInput } from '@mythologia/shared/schemas';
import type { PaginationDto } from '@mythologia/shared/types';
import { CardDomain } from '../../domain/card.domain';
import { cardRepository } from '../../infrastructure/database/repositories/card.repository';
import { cacheService } from '../../infrastructure/cache/cache.service';

class CardService {
  async findCards(filters: CardFilterInput) {
    // キャッシュキーを生成
    const cacheKey = `cards:search:${JSON.stringify(filters)}`;
    
    // キャッシュから確認
    let result = await cacheService.get(cacheKey);
    if (result) {
      return result;
    }

    // データベースから取得
    const cards = await cardRepository.findMany(filters);
    const total = await cardRepository.count(filters);

    // ページネーション計算
    const pagination: PaginationDto = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      total,
      totalPages: Math.ceil(total / (filters.limit || 20)),
      hasNext: (filters.page || 1) * (filters.limit || 20) < total,
      hasPrev: (filters.page || 1) > 1,
    };

    // フィルター集計
    const filterStats = await cardRepository.getFilterStats(filters);

    result = {
      cards,
      pagination,
      filters: filterStats,
    };

    // キャッシュに保存（5分間）
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  async findCardById(id: string): Promise<CardDomain | null> {
    const cacheKey = `card:${id}`;
    
    // キャッシュから確認
    let card = await cacheService.get<CardDomain>(cacheKey);
    if (card) {
      return card;
    }

    // データベースから取得
    card = await cardRepository.findById(id);
    if (card) {
      // キャッシュに保存（1時間）
      await cacheService.set(cacheKey, card, 3600);
    }

    return card;
  }

  async createCard(input: CreateCardInput, userId: string): Promise<CardDomain> {
    // ビジネスルール検証
    await this.validateCardCreation(input);

    // ドメインモデル作成
    const card = CardDomain.create(input, userId);

    // 保存
    const savedCard = await cardRepository.save(card);

    // 関連キャッシュを削除
    await this.invalidateCardCaches();

    return savedCard;
  }

  private async validateCardCreation(input: CreateCardInput): Promise<void> {
    // カード番号の重複チェック
    const existing = await cardRepository.findByCardNumber(input.cardNumber);
    if (existing) {
      throw new Error('このカード番号は既に使用されています');
    }

    // その他のビジネスルール検証...
  }

  private async invalidateCardCaches(): Promise<void> {
    await cacheService.deletePattern('cards:*');
  }
}

export const cardService = new CardService();
```

### 5. ドメインモデル実装

```typescript
// src/domain/card.domain.ts
import type { CardDto } from '@mythologia/shared/types';
import { RARITIES, CARD_TYPES } from '@mythologia/shared/constants';

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
    private effects: CardEffectDomain[],
    private createdAt: Date,
    private updatedAt: Date
  ) {}

  // ファクトリーメソッド
  static create(input: CreateCardInput, createdBy: string): CardDomain {
    return new CardDomain(
      crypto.randomUUID(),
      input.cardNumber,
      input.name,
      input.leaderId,
      input.tribeId,
      input.rarityId,
      input.cardTypeId,
      input.cost,
      input.power,
      input.cardSetId,
      input.effects.map(e => CardEffectDomain.create(e)),
      new Date(),
      new Date()
    );
  }

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
    if (this.leaderId === null) return [1, 2, 3, 4, 5]; // 全リーダー
    return [this.leaderId];
  }

  private getTribeSynergyBonus(): number {
    // 種族シナジーボーナス計算ロジック
    return 1;
  }

  private getLeaderBonus(): number {
    // リーダーボーナス計算ロジック
    return 1;
  }

  // Getter メソッド
  getId(): string { return this.id; }
  getCardNumber(): string { return this.cardNumber; }
  getName(): string { return this.name; }
  getCost(): number { return this.cost; }
  getPower(): number { return this.power; }
  // ... その他のgetter
}
```

## データベース統合

### 1. アダプターパターン実装

```typescript
// src/infrastructure/database/adapters/database.adapter.ts
export interface DatabaseAdapter {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ rowsAffected: number }>;
  transaction<T>(fn: (trx: DatabaseAdapter) => Promise<T>): Promise<T>;
  batch(statements: { sql: string; params?: any[] }[]): Promise<any[]>;
  getPlatform(): 'vercel' | 'cloudflare';
}

// PostgreSQL実装（Vercel）
export class PostgreSQLAdapter implements DatabaseAdapter {
  constructor(private client: any) {}

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.client.query(sql, params);
    return result.rows;
  }

  async execute(sql: string, params?: any[]): Promise<{ rowsAffected: number }> {
    const result = await this.client.query(sql, params);
    return { rowsAffected: result.rowCount };
  }

  getPlatform(): 'vercel' { return 'vercel'; }
}

// D1実装（Cloudflare）
export class D1Adapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.db.prepare(sql).bind(...(params || [])).all();
    return result.results as T[];
  }

  async execute(sql: string, params?: any[]): Promise<{ rowsAffected: number }> {
    const result = await this.db.prepare(sql).bind(...(params || [])).run();
    return { rowsAffected: result.changes || 0 };
  }

  getPlatform(): 'cloudflare' { return 'cloudflare'; }
}
```

### 2. リポジトリ実装

```typescript
// src/infrastructure/database/repositories/card.repository.ts
import type { CardFilterInput } from '@mythologia/shared/schemas';
import { CardDomain } from '../../../domain/card.domain';
import type { DatabaseAdapter } from '../adapters/database.adapter';

class CardRepository {
  constructor(private db: DatabaseAdapter) {}

  async findMany(filters: CardFilterInput): Promise<CardDomain[]> {
    let sql = `
      SELECT c.*, l.name as leader_name, t.name as tribe_name
      FROM cards c
      LEFT JOIN leaders l ON c.leader_id = l.id
      LEFT JOIN tribes t ON c.tribe_id = t.id
      WHERE c.is_active = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // フィルター条件を動的に追加
    if (filters.leaderId) {
      sql += ` AND c.leader_id = $${paramIndex++}`;
      params.push(filters.leaderId);
    }

    if (filters.tribeId) {
      sql += ` AND c.tribe_id = $${paramIndex++}`;
      params.push(filters.tribeId);
    }

    if (filters.rarityId) {
      sql += ` AND c.rarity_id = $${paramIndex++}`;
      params.push(filters.rarityId);
    }

    if (filters.costMin !== undefined) {
      sql += ` AND c.cost >= $${paramIndex++}`;
      params.push(filters.costMin);
    }

    if (filters.costMax !== undefined) {
      sql += ` AND c.cost <= $${paramIndex++}`;
      params.push(filters.costMax);
    }

    if (filters.search) {
      sql += ` AND c.name ILIKE $${paramIndex++}`;
      params.push(`%${filters.search}%`);
    }

    // ソート
    sql += ` ORDER BY ${filters.sortBy || 'name'} ${filters.sortOrder || 'ASC'}`;

    // ページネーション
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const rows = await this.db.query(sql, params);
    return rows.map(row => this.mapRowToDomain(row));
  }

  async findById(id: string): Promise<CardDomain | null> {
    const sql = `
      SELECT c.*, l.name as leader_name, t.name as tribe_name
      FROM cards c
      LEFT JOIN leaders l ON c.leader_id = l.id
      LEFT JOIN tribes t ON c.tribe_id = t.id
      WHERE c.id = $1 AND c.is_active = true
    `;
    
    const rows = await this.db.query(sql, [id]);
    return rows.length > 0 ? this.mapRowToDomain(rows[0]) : null;
  }

  async save(card: CardDomain): Promise<CardDomain> {
    const sql = `
      INSERT INTO cards (id, card_number, name, leader_id, tribe_id, rarity_id, 
                        card_type_id, cost, power, effects, card_set_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const params = [
      card.getId(),
      card.getCardNumber(),
      card.getName(),
      card.getLeaderId(),
      card.getTribeId(),
      card.getRarityId(),
      card.getCardTypeId(),
      card.getCost(),
      card.getPower(),
      JSON.stringify(card.getEffects()),
      card.getCardSetId(),
      new Date(),
      new Date()
    ];

    const rows = await this.db.query(sql, params);
    return this.mapRowToDomain(rows[0]);
  }

  private mapRowToDomain(row: any): CardDomain {
    return new CardDomain(
      row.id,
      row.card_number,
      row.name,
      row.leader_id,
      row.tribe_id,
      row.rarity_id,
      row.card_type_id,
      row.cost,
      row.power,
      row.card_set_id,
      JSON.parse(row.effects || '[]'),
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

export const cardRepository = new CardRepository(/* DB adapter */);
```

## デプロイメント

### 1. Cloudflare Workers デプロイ

```bash
# Cloudflare Workers にデプロイ
npm run deploy:cloudflare

# 環境変数設定
wrangler secret put JWT_SECRET
wrangler secret put DATABASE_URL
```

### 2. Vercel デプロイ

```bash
# Vercel にデプロイ
npm run deploy:vercel

# 環境変数設定（Vercel Dashboard）
vercel env add JWT_SECRET
vercel env add DATABASE_URL
```

## テスト戦略

### 1. ユニットテスト

```typescript
// tests/unit/card.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { cardService } from '../../src/application/services/card.service';
import { cardRepository } from '../../src/infrastructure/database/repositories/card.repository';

vi.mock('../../src/infrastructure/database/repositories/card.repository');

describe('CardService', () => {
  it('should find cards with filters', async () => {
    const mockCards = [/* mock data */];
    vi.mocked(cardRepository.findMany).mockResolvedValue(mockCards);
    
    const result = await cardService.findCards({ page: 1, limit: 20 });
    
    expect(result.cards).toEqual(mockCards);
    expect(cardRepository.findMany).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });
});
```

### 2. 統合テスト

```typescript
// tests/integration/cards.api.test.ts
import { describe, it, expect } from 'vitest';
import app from '../../src/index';

describe('Cards API', () => {
  it('should return cards list', async () => {
    const res = await app.request('/api/cards');
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.cards).toBeInstanceOf(Array);
  });
});
```

## パフォーマンス最適化

### 1. キャッシュ戦略
- Redis/KVによるクエリ結果キャッシュ
- CDNによる静的コンテンツ配信
- データベースクエリ最適化

### 2. 監視・ログ
- エラー追跡とログ記録
- パフォーマンス指標の計測
- アラート設定

この設計により、スケーラブルで保守性の高いバックエンドAPIを構築できます。