# デッキアプリケーション層設計

## 概要

デッキシステムのアプリケーション層実装です。プラットフォーム非依存な設計により、Vercel（PostgreSQL）とCloudflare（D1）の両環境をサポートします。

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│         Application Layer               │
├─────────────────────────────────────────┤
│  DeckService │ DeckStatsCalculator     │
│  DeckValidator │ DeckCacheService      │
├─────────────────────────────────────────┤
│         Adapter Layer                   │
├─────────────────────────────────────────┤
│ DatabaseAdapter │ CacheAdapter         │
│ (PostgreSQL/D1) │ (Vercel KV/CF KV)   │
└─────────────────────────────────────────┘
```

## 型定義とスキーマ

```typescript
import { z } from 'zod';

// Zodスキーマベースの型定義
export const DeckCardSchema = z.object({
  cardId: z.string().min(1, 'カードIDは必須です'),
  quantity: z.number().int().min(1).max(3, '枚数は1-3の範囲で入力してください')
});

export const DeckCodeSchema = z.string()
  .regex(/^[a-zA-Z0-9\-]+:[1-3](,[a-zA-Z0-9\-]+:[1-3])*$/, '無効なデッキコード形式です');

export const CreateDeckSchema = z.object({
  name: z.string().min(1, 'デッキ名は必須です').max(100),
  description: z.string().max(500).optional(),
  leaderId: z.number().int().min(1).max(5),
  cards: z.array(DeckCardSchema).min(30).max(40),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).max(10).default([])
});

export type DeckCard = z.infer<typeof DeckCardSchema>;
export type CreateDeckRequest = z.infer<typeof CreateDeckSchema>;

export interface Deck {
  id: string;
  userId: string;
  leaderId: number;
  name: string;
  description?: string;
  deckCode: string;
  cardCount: number;
  isPublic: boolean;
  tags: string[];
  likes: number;
  views: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckStats {
  avgCost: number;
  avgPower: number;
  cardTypes: CardTypeDistribution;
  rarities: RarityDistribution;
  totalCards: number;
}
```

## コアサービス

### DeckCodeParser（デッキコード操作）

```typescript
export class DeckCodeParser {
  static parse(deckCode: string): DeckCard[] {
    if (!deckCode) return [];
    
    // Zodでバリデーション
    const validation = DeckCodeSchema.safeParse(deckCode);
    if (!validation.success) {
      throw new DeckCodeError(
        'デッキコード形式が無効です',
        'INVALID_FORMAT',
        validation.error.errors
      );
    }
    
    return deckCode.split(',').map(entry => {
      const [cardId, quantityStr] = entry.split(':');
      const quantity = parseInt(quantityStr, 10);
      
      const cardValidation = DeckCardSchema.safeParse({ cardId, quantity });
      if (!cardValidation.success) {
        throw new DeckCodeError(
          `無効なカードデータ: ${entry}`,
          'INVALID_CARD',
          { entry, errors: cardValidation.error.errors }
        );
      }
      
      return { cardId, quantity };
    });
  }
  
  static stringify(cards: DeckCard[]): string {
    // 各カードをバリデーション
    cards.forEach(card => {
      const validation = DeckCardSchema.safeParse(card);
      if (!validation.success) {
        throw new DeckCodeError(
          `無効なカードデータ`,
          'INVALID_CARD',
          { card, errors: validation.error.errors }
        );
      }
    });
    
    return cards
      .sort((a, b) => a.cardId.localeCompare(b.cardId))
      .map(card => `${card.cardId}:${card.quantity}`)
      .join(',');
  }
  
  static validate(deckCode: string): ValidationResult {
    const errors: string[] = [];
    
    try {
      const cards = this.parse(deckCode);
      const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
      
      if (totalCards < 30 || totalCards > 40) {
        errors.push(`デッキは30-40枚である必要があります（現在: ${totalCards}枚）`);
      }
      
      // 重複チェック
      const cardIds = new Set<string>();
      for (const card of cards) {
        if (cardIds.has(card.cardId)) {
          errors.push(`重複したカードID: ${card.cardId}`);
        }
        cardIds.add(card.cardId);
      }
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : '不明なエラー');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### DeckService（ビジネスロジック）

```typescript
export class DeckService {
  constructor(
    private dbAdapter: DatabaseAdapter,
    private cacheAdapter: CacheAdapter
  ) {}
  
  async createDeck(userId: string, request: CreateDeckRequest): Promise<Deck> {
    // バリデーション
    const validation = CreateDeckSchema.safeParse(request);
    if (!validation.success) {
      throw new ValidationError('入力データが無効です', validation.error.errors);
    }
    
    // デッキコード生成
    const deckCode = DeckCodeParser.stringify(request.cards);
    const cardCount = request.cards.reduce((sum, card) => sum + card.quantity, 0);
    
    // デッキ作成
    const deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      leaderId: request.leaderId,
      name: request.name,
      description: request.description,
      deckCode,
      cardCount,
      isPublic: request.isPublic,
      tags: request.tags,
      likes: 0,
      views: 0,
      isDeleted: false
    };
    
    const createdDeck = await this.dbAdapter.createDeck(deck);
    
    // キャッシュクリア
    await this.clearUserDeckCache(userId);
    
    return createdDeck;
  }
  
  async getDeck(deckId: string, viewerId?: string): Promise<Deck | null> {
    const deck = await this.dbAdapter.findDeckById(deckId);
    
    if (!deck || deck.isDeleted) {
      return null;
    }
    
    // 公開デッキまたは所有者のチェック
    if (!deck.isPublic && deck.userId !== viewerId) {
      return null;
    }
    
    // 閲覧数更新（所有者以外の場合）
    if (viewerId && deck.userId !== viewerId) {
      await this.dbAdapter.incrementViews(deckId);
    }
    
    return deck;
  }
  
  async updateDeck(
    deckId: string, 
    userId: string, 
    updates: Partial<CreateDeckRequest>
  ): Promise<Deck> {
    const deck = await this.dbAdapter.findDeckById(deckId);
    
    if (!deck || deck.isDeleted || deck.userId !== userId) {
      throw new NotFoundError('デッキが見つかりません');
    }
    
    // 更新データの準備
    const updateData: Partial<Deck> = {
      ...updates,
      updatedAt: new Date()
    };
    
    // カードが更新される場合、デッキコードを再生成
    if (updates.cards) {
      updateData.deckCode = DeckCodeParser.stringify(updates.cards);
      updateData.cardCount = updates.cards.reduce((sum, card) => sum + card.quantity, 0);
    }
    
    const updatedDeck = await this.dbAdapter.updateDeck(deckId, updateData);
    
    // キャッシュクリア
    await this.clearDeckCache(deckId);
    await this.clearUserDeckCache(userId);
    
    return updatedDeck;
  }
  
  async softDeleteDeck(deckId: string, userId: string): Promise<void> {
    const deck = await this.dbAdapter.findDeckById(deckId);
    
    if (!deck || deck.isDeleted || deck.userId !== userId) {
      throw new NotFoundError('デッキが見つかりません');
    }
    
    await this.dbAdapter.updateDeck(deckId, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date()
    });
    
    // キャッシュクリア
    await this.clearDeckCache(deckId);
    await this.clearUserDeckCache(userId);
  }
  
  async restoreDeck(deckId: string, userId: string): Promise<void> {
    const deck = await this.dbAdapter.findDeckById(deckId);
    
    if (!deck || !deck.isDeleted || deck.userId !== userId) {
      throw new NotFoundError('削除されたデッキが見つかりません');
    }
    
    await this.dbAdapter.updateDeck(deckId, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date()
    });
    
    // キャッシュクリア
    await this.clearDeckCache(deckId);
    await this.clearUserDeckCache(userId);
  }
  
  private async clearDeckCache(deckId: string): Promise<void> {
    await this.cacheAdapter.delete(`deck:${deckId}`);
    await this.cacheAdapter.delete(`deck-stats:${deckId}`);
  }
  
  private async clearUserDeckCache(userId: string): Promise<void> {
    await this.cacheAdapter.delete(`user-decks:${userId}`);
  }
}
```

## アダプターパターン

### データベースアダプター

```typescript
interface DatabaseAdapter {
  createDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck>;
  findDeckById(id: string): Promise<Deck | null>;
  updateDeck(id: string, updates: Partial<Deck>): Promise<Deck>;
  findCardsByIds(ids: string[]): Promise<Card[]>;
  incrementViews(deckId: string): Promise<void>;
}

// PostgreSQL実装
export class PostgresDeckAdapter implements DatabaseAdapter {
  constructor(private prisma: PrismaClient) {}
  
  async createDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    return this.prisma.deck.create({
      data: {
        id: generateUUID(),
        ...deck,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  async findDeckById(id: string): Promise<Deck | null> {
    return this.prisma.deck.findUnique({
      where: { id }
    });
  }
  
  // その他のメソッド実装...
}

// D1実装
export class D1DeckAdapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}
  
  async createDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    const id = generateUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO decks (
        id, user_id, leader_id, name, description, deck_code, 
        card_count, is_public, tags, likes, views, is_deleted, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      id, deck.userId, deck.leaderId, deck.name, deck.description,
      deck.deckCode, deck.cardCount, deck.isPublic, 
      JSON.stringify(deck.tags), deck.likes, deck.views, 
      deck.isDeleted, now, now
    ).run();
    
    return { ...deck, id, createdAt: new Date(now), updatedAt: new Date(now) };
  }
  
  // その他のメソッド実装...
}
```

### キャッシュアダプター

```typescript
interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Vercel KV実装
export class VercelKVAdapter implements CacheAdapter {
  constructor(private kv: typeof import('@vercel/kv')) {}
  
  async get<T>(key: string): Promise<T | null> {
    return this.kv.get(key);
  }
  
  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    await this.kv.set(key, value, { ex: ttl });
  }
  
  async delete(key: string): Promise<void> {
    await this.kv.del(key);
  }
}

// Cloudflare KV実装
export class CloudflareKVAdapter implements CacheAdapter {
  constructor(private kv: KVNamespace) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
  }
  
  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}
```

## ファクトリーパターン

```typescript
// アダプター生成
export function createAdapters(): {
  database: DatabaseAdapter;
  cache: CacheAdapter;
} {
  const deployTarget = process.env.DEPLOY_TARGET;
  
  if (deployTarget === 'cloudflare') {
    return {
      database: new D1DeckAdapter(globalThis.DB as D1Database),
      cache: new CloudflareKVAdapter(globalThis.CACHE as KVNamespace)
    };
  } else {
    // Vercel環境
    return {
      database: new PostgresDeckAdapter(globalThis.prisma),
      cache: new VercelKVAdapter(require('@vercel/kv'))
    };
  }
}

// サービス初期化
export function createDeckService(): DeckService {
  const { database, cache } = createAdapters();
  return new DeckService(database, cache);
}
```

## エラーハンドリング

```typescript
export class DeckCodeError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_FORMAT' | 'INVALID_CARD' | 'INVALID_QUANTITY',
    public details?: any
  ) {
    super(message);
    this.name = 'DeckCodeError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

## Honoでの実装例

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// サービス初期化
const deckService = createDeckService();

// デッキ作成エンドポイント
app.post('/api/decks', 
  zValidator('json', CreateDeckSchema),
  async (c) => {
    try {
      const userId = c.get('userId'); // 認証ミドルウェアから取得
      const request = c.req.valid('json');
      
      const deck = await deckService.createDeck(userId, request);
      
      return c.json(deck, 201);
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json({ error: error.message, details: error.errors }, 400);
      }
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

// デッキ取得エンドポイント
app.get('/api/decks/:id', async (c) => {
  try {
    const deckId = c.req.param('id');
    const viewerId = c.get('userId'); // オプション
    
    const deck = await deckService.getDeck(deckId, viewerId);
    
    if (!deck) {
      return c.json({ error: 'デッキが見つかりません' }, 404);
    }
    
    return c.json(deck);
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
```