# カードアプリケーション層設計

## 概要

カードシステムのアプリケーション層実装です。プラットフォーム非依存な設計により、Vercel（PostgreSQL）とCloudflare（D1）の両環境をサポートします。

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│         Application Layer               │
├─────────────────────────────────────────┤
│  CardService │ CardSearchService       │
│  CardValidator │ CardCacheService      │
│  MetaAnalysisService                   │
├─────────────────────────────────────────┤
│         Adapter Layer                   │
├─────────────────────────────────────────┤
│ DatabaseAdapter │ CacheAdapter         │
│ (PostgreSQL/D1) │ (Vercel KV/CF KV)   │
│ ImageAdapter │ SearchAdapter           │
└─────────────────────────────────────────┘
```

## 型定義とスキーマ

```typescript
import { z } from 'zod';

// Zodスキーマベースの型定義
export const RaritySchema = z.number().int().min(1).max(4);     // 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
export const CardTypeSchema = z.number().int().min(1).max(3);   // 1:ATTACKER, 2:BLOCKER, 3:CHARGER
export const LeaderSchema = z.number().int().min(1).max(5);     // 1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE

export const CardEffectSchema = z.object({
  description: z.string().min(1, '効果説明は必須です'),
  abilities: z.array(z.object({
    type: z.string(),
    value: z.number().optional(),
    condition: z.string().optional()
  })).optional(),
  triggers: z.array(z.object({
    type: z.string(),
    condition: z.string().optional()
  })).optional(),
  targets: z.array(z.object({
    type: z.string(),
    filter: z.string().optional()
  })).optional(),
  values: z.array(z.object({
    key: z.string(),
    value: z.union([z.number(), z.string()])
  })).optional()
});

export const CreateCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{5}$/, 'カード番号は5桁の数字である必要があります'),
  name: z.string().min(1, 'カード名は必須です').max(100),
  leaderId: LeaderSchema.optional(),
  tribeId: z.number().int().min(1).optional(),
  rarityId: RaritySchema,
  cardTypeId: CardTypeSchema,
  cost: z.number().int().min(0),
  power: z.number().int().min(0),
  effects: z.array(CardEffectSchema),
  flavorText: z.string().max(500).optional(),
  imageUrl: z.string().url('有効なURL形式である必要があります'),
  artist: z.string().max(100).optional(),
  cardSetId: z.string().uuid('有効なUUID形式である必要があります')
});

export const CardSearchSchema = z.object({
  name: z.string().optional(),
  leaderId: LeaderSchema.optional(),
  tribeId: z.number().int().min(1).optional(),
  rarityId: RaritySchema.optional(),
  cardTypeId: CardTypeSchema.optional(),
  costMin: z.number().int().min(0).optional(),
  costMax: z.number().int().min(0).optional(),
  powerMin: z.number().int().min(0).optional(),
  powerMax: z.number().int().min(0).optional(),
  effectType: z.string().optional(),
  cardSetId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['name', 'cost', 'power', 'rarity', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export type Card = z.infer<typeof CreateCardSchema> & {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CardSearchCriteria = z.infer<typeof CardSearchSchema>;
export type CreateCardRequest = z.infer<typeof CreateCardSchema>;

// Tribe型定義
export const CreateTribeSchema = z.object({
  name: z.string().min(1, '種族名は必須です').max(50),
  leaderId: LeaderSchema.optional(),
  thematic: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  MasterCardId: z.string().uuid().optional()
});

export type Tribe = {
  id: number;
  name: string;
  leaderId?: number;
  thematic?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  MasterCardId?: string;
};

// CardSet型定義
export const CreateCardSetSchema = z.object({
  name: z.string().min(1, 'セット名は必須です').max(100),
  code: z.string().min(1, 'セットコードは必須です').max(20),
  releaseDate: z.string().datetime('有効な日時形式である必要があります'),
  description: z.string().max(500).optional()
});

export type CardSet = {
  id: string;
  name: string;
  code: string;
  releaseDate: Date;
  cardCount: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTribeRequest = z.infer<typeof CreateTribeSchema>;
export type CreateCardSetRequest = z.infer<typeof CreateCardSetSchema>;
```

## コアサービス

### CardService（基本CRUD操作）

```typescript
export class CardService {
  constructor(
    private dbAdapter: DatabaseAdapter,
    private cacheAdapter: CacheAdapter,
    private imageAdapter: ImageAdapter
  ) {}
  
  async createCard(request: CreateCardRequest): Promise<Card> {
    // バリデーション
    const validation = CreateCardSchema.safeParse(request);
    if (!validation.success) {
      throw new ValidationError('入力データが無効です', validation.error.errors);
    }
    
    // カード番号重複チェック
    const existingCard = await this.dbAdapter.findCardByNumber(request.cardNumber);
    if (existingCard) {
      throw new ConflictError('カード番号が既に存在します');
    }
    
    // 種族ID存在チェック
    if (request.tribeId) {
      const tribe = await this.dbAdapter.findTribeById(request.tribeId);
      if (!tribe || !tribe.isActive) {
        throw new ValidationError('指定された種族IDが無効です');
      }
    }
    
    // カードセットID存在チェック
    const cardSet = await this.dbAdapter.findCardSetById(request.cardSetId);
    if (!cardSet || !cardSet.isActive) {
      throw new ValidationError('指定されたカードセットIDが無効です');
    }
    
    // 画像URL検証
    const isImageValid = await this.imageAdapter.validateImageUrl(request.imageUrl);
    if (!isImageValid) {
      throw new ValidationError('画像URLが無効です');
    }
    
    // カード作成
    const card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'> = {
      ...request,
      isActive: true
    };
    
    const createdCard = await this.dbAdapter.createCard(card);
    
    // キャッシュクリア
    await this.clearCardCache();
    
    return createdCard;
  }
  
  async getCard(cardId: string): Promise<Card | null> {
    // キャッシュから取得試行
    const cacheKey = `card:${cardId}`;
    const cached = await this.cacheAdapter.get<Card>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // データベースから取得
    const card = await this.dbAdapter.findCardById(cardId);
    if (!card || !card.isActive) {
      return null;
    }
    
    // キャッシュに保存（長期キャッシュ）
    await this.cacheAdapter.set(cacheKey, card, 3600 * 24); // 24時間
    
    return card;
  }
  
  async getCardByNumber(cardNumber: string): Promise<Card | null> {
    const cacheKey = `card:number:${cardNumber}`;
    const cached = await this.cacheAdapter.get<Card>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const card = await this.dbAdapter.findCardByNumber(cardNumber);
    if (!card || !card.isActive) {
      return null;
    }
    
    await this.cacheAdapter.set(cacheKey, card, 3600 * 24);
    return card;
  }
  
  async updateCard(cardId: string, updates: Partial<CreateCardRequest>): Promise<Card> {
    const existingCard = await this.dbAdapter.findCardById(cardId);
    if (!existingCard || !existingCard.isActive) {
      throw new NotFoundError('カードが見つかりません');
    }
    
    // 部分的なバリデーション
    if (updates.cardNumber && updates.cardNumber !== existingCard.cardNumber) {
      const duplicate = await this.dbAdapter.findCardByNumber(updates.cardNumber);
      if (duplicate && duplicate.id !== cardId) {
        throw new ConflictError('カード番号が既に存在します');
      }
    }
    
    // 画像URL変更時の検証
    if (updates.imageUrl && updates.imageUrl !== existingCard.imageUrl) {
      const isImageValid = await this.imageAdapter.validateImageUrl(updates.imageUrl);
      if (!isImageValid) {
        throw new ValidationError('画像URLが無効です');
      }
    }
    
    const updateData: Partial<Card> = {
      ...updates,
      updatedAt: new Date()
    };
    
    const updatedCard = await this.dbAdapter.updateCard(cardId, updateData);
    
    // キャッシュクリア
    await this.clearCardCache(cardId);
    
    return updatedCard;
  }
  
  async deactivateCard(cardId: string): Promise<void> {
    const card = await this.dbAdapter.findCardById(cardId);
    if (!card || !card.isActive) {
      throw new NotFoundError('カードが見つかりません');
    }
    
    await this.dbAdapter.updateCard(cardId, {
      isActive: false,
      updatedAt: new Date()
    });
    
    await this.clearCardCache(cardId);
  }
  
  private async clearCardCache(cardId?: string): Promise<void> {
    if (cardId) {
      const card = await this.dbAdapter.findCardById(cardId);
      await this.cacheAdapter.delete(`card:${cardId}`);
      if (card) {
        await this.cacheAdapter.delete(`card:number:${card.cardNumber}`);
      }
    }
    
    // 検索結果キャッシュをクリア
    await this.cacheAdapter.deletePattern('cards:search:*');
    await this.cacheAdapter.deletePattern('cards:*');
  }
}
```

### TribeService（種族管理）

```typescript
export class TribeService {
  constructor(private dbAdapter: DatabaseAdapter) {}
  
  async createTribe(request: CreateTribeRequest): Promise<Tribe> {
    const validation = CreateTribeSchema.safeParse(request);
    if (!validation.success) {
      throw new ValidationError('入力データが無効です', validation.error.errors);
    }
    
    // 種族名重複チェック
    const existingTribe = await this.dbAdapter.findTribeByName(request.name);
    if (existingTribe) {
      throw new ConflictError('種族名が既に存在します');
    }
    
    return this.dbAdapter.createTribe(request);
  }
  
  async getAllTribes(): Promise<Tribe[]> {
    return this.dbAdapter.findAllTribes();
  }
  
  async getTribe(tribeId: number): Promise<Tribe | null> {
    return this.dbAdapter.findTribeById(tribeId);
  }
  
  async updateTribe(tribeId: number, updates: Partial<CreateTribeRequest>): Promise<Tribe> {
    const existingTribe = await this.dbAdapter.findTribeById(tribeId);
    if (!existingTribe || !existingTribe.isActive) {
      throw new NotFoundError('種族が見つかりません');
    }
    
    if (updates.name && updates.name !== existingTribe.name) {
      const duplicate = await this.dbAdapter.findTribeByName(updates.name);
      if (duplicate && duplicate.id !== tribeId) {
        throw new ConflictError('種族名が既に存在します');
      }
    }
    
    return this.dbAdapter.updateTribe(tribeId, updates);
  }
  
  async deactivateTribe(tribeId: number): Promise<void> {
    const tribe = await this.dbAdapter.findTribeById(tribeId);
    if (!tribe || !tribe.isActive) {
      throw new NotFoundError('種族が見つかりません');
    }
    
    await this.dbAdapter.updateTribe(tribeId, { isActive: false });
  }
}
```

### CardSetService（カードセット管理）

```typescript
export class CardSetService {
  constructor(private dbAdapter: DatabaseAdapter) {}
  
  async createCardSet(request: CreateCardSetRequest): Promise<CardSet> {
    const validation = CreateCardSetSchema.safeParse(request);
    if (!validation.success) {
      throw new ValidationError('入力データが無効です', validation.error.errors);
    }
    
    // セットコード重複チェック
    const existingSet = await this.dbAdapter.findCardSetByCode(request.code);
    if (existingSet) {
      throw new ConflictError('セットコードが既に存在します');
    }
    
    return this.dbAdapter.createCardSet({
      ...request,
      releaseDate: new Date(request.releaseDate),
      cardCount: 0
    });
  }
  
  async getAllCardSets(): Promise<CardSet[]> {
    return this.dbAdapter.findAllCardSets();
  }
  
  async getCardSet(cardSetId: string): Promise<CardSet | null> {
    return this.dbAdapter.findCardSetById(cardSetId);
  }
  
  async updateCardSet(cardSetId: string, updates: Partial<CreateCardSetRequest>): Promise<CardSet> {
    const existingSet = await this.dbAdapter.findCardSetById(cardSetId);
    if (!existingSet || !existingSet.isActive) {
      throw new NotFoundError('カードセットが見つかりません');
    }
    
    if (updates.code && updates.code !== existingSet.code) {
      const duplicate = await this.dbAdapter.findCardSetByCode(updates.code);
      if (duplicate && duplicate.id !== cardSetId) {
        throw new ConflictError('セットコードが既に存在します');
      }
    }
    
    const updateData = {
      ...updates,
      ...(updates.releaseDate && { releaseDate: new Date(updates.releaseDate) })
    };
    
    return this.dbAdapter.updateCardSet(cardSetId, updateData);
  }
  
  async deactivateCardSet(cardSetId: string): Promise<void> {
    const cardSet = await this.dbAdapter.findCardSetById(cardSetId);
    if (!cardSet || !cardSet.isActive) {
      throw new NotFoundError('カードセットが見つかりません');
    }
    
    await this.dbAdapter.updateCardSet(cardSetId, { isActive: false });
  }
  
  async updateCardCount(cardSetId: string): Promise<void> {
    const cardCount = await this.dbAdapter.countCardsBySet(cardSetId);
    await this.dbAdapter.updateCardSet(cardSetId, { cardCount });
  }
}
```

### CardSearchService（検索・フィルタリング）

```typescript
export class CardSearchService {
  constructor(
    private dbAdapter: DatabaseAdapter,
    private cacheAdapter: CacheAdapter
  ) {}
  
  async searchCards(criteria: CardSearchCriteria): Promise<{
    cards: Card[];
    total: number;
    pagination: PaginationInfo;
  }> {
    // バリデーション
    const validation = CardSearchSchema.safeParse(criteria);
    if (!validation.success) {
      throw new ValidationError('検索条件が無効です', validation.error.errors);
    }
    
    const validCriteria = validation.data;
    
    // キャッシュキー生成
    const cacheKey = `cards:search:${this.generateSearchCacheKey(validCriteria)}`;
    const cached = await this.cacheAdapter.get<{cards: Card[], total: number}>(cacheKey);
    
    if (cached) {
      return {
        ...cached,
        pagination: {
          limit: validCriteria.limit,
          offset: validCriteria.offset,
          total: cached.total
        }
      };
    }
    
    // データベース検索
    const { cards, total } = await this.dbAdapter.searchCards(validCriteria);
    
    // キャッシュに保存（短期キャッシュ）
    await this.cacheAdapter.set(cacheKey, { cards, total }, 300); // 5分
    
    return {
      cards,
      total,
      pagination: {
        limit: validCriteria.limit,
        offset: validCriteria.offset,
        total
      }
    };
  }
  
  async getCardsBySet(cardSetId: string): Promise<Card[]> {
    const cacheKey = `cards:set:${cardSetId}`;
    const cached = await this.cacheAdapter.get<Card[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const cards = await this.dbAdapter.findCardsBySet(cardSetId);
    await this.cacheAdapter.set(cacheKey, cards, 3600); // 1時間
    
    return cards;
  }
  
  async getCardsByLeader(leaderId: number): Promise<Card[]> {
    const cacheKey = `cards:leader:${leaderId}`;
    const cached = await this.cacheAdapter.get<Card[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const cards = await this.dbAdapter.findCardsByLeader(leaderId);
    await this.cacheAdapter.set(cacheKey, cards, 3600);
    
    return cards;
  }
  
  async getCardsByTribe(tribeId: number): Promise<Card[]> {
    const cacheKey = `cards:tribe:${tribeId}`;
    const cached = await this.cacheAdapter.get<Card[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const cards = await this.dbAdapter.findCardsByTribe(tribeId);
    await this.cacheAdapter.set(cacheKey, cards, 3600);
    
    return cards;
  }
  
  async getRandomCards(count: number = 10): Promise<Card[]> {
    return this.dbAdapter.getRandomCards(count);
  }
  
  private generateSearchCacheKey(criteria: CardSearchCriteria): string {
    // 検索条件をソートして一意なキーを生成
    const sortedCriteria = Object.keys(criteria)
      .sort()
      .reduce((obj, key) => {
        obj[key] = criteria[key as keyof CardSearchCriteria];
        return obj;
      }, {} as any);
    
    return btoa(JSON.stringify(sortedCriteria)).replace(/[^a-zA-Z0-9]/g, '');
  }
}
```

### CardValidationService（基本バリデーション）

```typescript
export class CardValidationService {
  static validateBasicRules(card: Card): ValidationResult {
    const errors: string[] = [];
    
    // 基本制約チェック
    if (!Number.isInteger(card.cost) || card.cost < 0) {
      errors.push('コストは0以上の自然数である必要があります');
    }
    
    if (!Number.isInteger(card.power) || card.power < 0) {
      errors.push('パワーは0以上の自然数である必要があります');
    }
    
    // カード番号フォーマット
    if (!/^\d{5}$/.test(card.cardNumber)) {
      errors.push('カード番号は5桁の数字である必要があります');
    }
    
    // 必須フィールド
    if (!card.name || card.name.length === 0) {
      errors.push('カード名は必須です');
    }
    
    if (!Number.isInteger(card.rarityId) || card.rarityId < 1 || card.rarityId > 4) {
      errors.push('レアリティIDは1-4の範囲である必要があります');
    }
    
    if (!Number.isInteger(card.cardTypeId) || card.cardTypeId < 1 || card.cardTypeId > 3) {
      errors.push('カードタイプIDは1-3の範囲である必要があります');
    }
    
    // リーダーID範囲チェック
    if (card.leaderId && (card.leaderId < 1 || card.leaderId > 5)) {
      errors.push('リーダーIDは1-5の範囲である必要があります');
    }
    
    // 種族ID範囲チェック
    if (card.tribeId && (!Number.isInteger(card.tribeId) || card.tribeId < 1)) {
      errors.push('種族IDは1以上の自然数である必要があります');
    }
    
    // 効果の基本構造チェック
    if (card.effects && card.effects.length > 0) {
      card.effects.forEach((effect, index) => {
        if (!effect.description || effect.description.length === 0) {
          errors.push(`効果${index + 1}の説明が必須です`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateCardSet(cards: Card[]): ValidationResult {
    const errors: string[] = [];
    
    // カード番号の重複チェック
    const numbers = cards.map(card => card.cardNumber);
    const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);
    if (duplicates.length > 0) {
      errors.push(`重複したカード番号: ${duplicates.join(', ')}`);
    }
    
    // カード名の重複チェック
    const names = cards.map(card => card.name);
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      errors.push(`重複したカード名: ${duplicateNames.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## アダプターパターン

### データベースアダプター

```typescript
interface DatabaseAdapter {
  // Card operations
  createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card>;
  findCardById(id: string): Promise<Card | null>;
  findCardByNumber(cardNumber: string): Promise<Card | null>;
  updateCard(id: string, updates: Partial<Card>): Promise<Card>;
  searchCards(criteria: CardSearchCriteria): Promise<{cards: Card[], total: number}>;
  findCardsBySet(cardSetId: string): Promise<Card[]>;
  findCardsByLeader(leaderId: number): Promise<Card[]>;
  findCardsByTribe(tribeId: number): Promise<Card[]>;
  getRandomCards(count: number): Promise<Card[]>;
  countCardsBySet(cardSetId: string): Promise<number>;
  
  // Tribe operations
  createTribe(tribe: CreateTribeRequest): Promise<Tribe>;
  findTribeById(id: number): Promise<Tribe | null>;
  findTribeByName(name: string): Promise<Tribe | null>;
  findAllTribes(): Promise<Tribe[]>;
  updateTribe(id: number, updates: Partial<Tribe>): Promise<Tribe>;
  
  // CardSet operations
  createCardSet(cardSet: Omit<CardSet, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardSet>;
  findCardSetById(id: string): Promise<CardSet | null>;
  findCardSetByCode(code: string): Promise<CardSet | null>;
  findAllCardSets(): Promise<CardSet[]>;
  updateCardSet(id: string, updates: Partial<CardSet>): Promise<CardSet>;
}

// PostgreSQL実装
export class PostgresCardAdapter implements DatabaseAdapter {
  constructor(private prisma: PrismaClient) {}
  
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    return this.prisma.card.create({
      data: {
        id: generateUUID(),
        ...card,
        effects: JSON.stringify(card.effects),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }) as Promise<Card>;
  }
  
  async searchCards(criteria: CardSearchCriteria): Promise<{cards: Card[], total: number}> {
    const where: any = {
      isActive: true
    };
    
    // 検索条件の構築
    if (criteria.name) {
      where.name = { contains: criteria.name };
    }
    
    if (criteria.leaderId) {
      where.leaderId = criteria.leaderId;
    }
    
    if (criteria.tribeId) {
      where.tribeId = criteria.tribeId;
    }
    
    if (criteria.rarityId) {
      where.rarityId = criteria.rarityId;
    }
    
    if (criteria.cardTypeId) {
      where.cardTypeId = criteria.cardTypeId;
    }
    
    if (criteria.costMin !== undefined || criteria.costMax !== undefined) {
      where.cost = {};
      if (criteria.costMin !== undefined) where.cost.gte = criteria.costMin;
      if (criteria.costMax !== undefined) where.cost.lte = criteria.costMax;
    }
    
    if (criteria.powerMin !== undefined || criteria.powerMax !== undefined) {
      where.power = {};
      if (criteria.powerMin !== undefined) where.power.gte = criteria.powerMin;
      if (criteria.powerMax !== undefined) where.power.lte = criteria.powerMax;
    }
    
    if (criteria.cardSetId) {
      where.cardSetId = criteria.cardSetId;
    }
    
    // 効果タイプ検索（JSON検索）
    if (criteria.effectType) {
      where.effects = {
        path: ['abilities'],
        array_contains: [{ type: criteria.effectType }]
      };
    }
    
    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        orderBy: { [criteria.sortBy]: criteria.sortOrder },
        skip: criteria.offset,
        take: criteria.limit
      }),
      this.prisma.card.count({ where })
    ]);
    
    return {
      cards: cards.map(card => ({
        ...card,
        effects: JSON.parse(card.effects as string)
      })) as Card[],
      total
    };
  }
  
  // その他のメソッド実装...
}

// D1実装
export class D1CardAdapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}
  
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const id = generateUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO cards (
        id, card_number, name, leader_id, tribe_id, rarity_id, card_type_id,
        cost, power, effects, flavor_text, image_url, artist, 
        card_set_id, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      id, card.cardNumber, card.name, card.leaderId, card.tribeId,
      card.rarityId, card.cardTypeId, card.cost, card.power,
      JSON.stringify(card.effects), card.flavorText, card.imageUrl,
      card.artist, card.cardSetId, card.isActive, now, now
    ).run();
    
    return {
      ...card,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }
  
  async searchCards(criteria: CardSearchCriteria): Promise<{cards: Card[], total: number}> {
    let whereClause = 'WHERE is_active = 1';
    const params: any[] = [];
    let paramIndex = 1;
    
    // 検索条件の構築
    if (criteria.name) {
      whereClause += ` AND name LIKE ?`;
      params.push(`%${criteria.name}%`);
    }
    
    if (criteria.leaderId) {
      whereClause += ` AND leader_id = ?`;
      params.push(criteria.leaderId);
    }
    
    if (criteria.tribeId) {
      whereClause += ` AND tribe_id = ?`;
      params.push(criteria.tribeId);
    }
    
    if (criteria.rarityId) {
      whereClause += ` AND rarity_id = ?`;
      params.push(criteria.rarityId);
    }
    
    if (criteria.cardTypeId) {
      whereClause += ` AND card_type_id = ?`;
      params.push(criteria.cardTypeId);
    }
    
    if (criteria.costMin !== undefined) {
      whereClause += ` AND cost >= ?`;
      params.push(criteria.costMin);
    }
    
    if (criteria.costMax !== undefined) {
      whereClause += ` AND cost <= ?`;
      params.push(criteria.costMax);
    }
    
    if (criteria.cardSetId) {
      whereClause += ` AND card_set_id = ?`;
      params.push(criteria.cardSetId);
    }
    
    // カウント取得
    const countQuery = `SELECT COUNT(*) as total FROM cards ${whereClause}`;
    const countResult = await this.db.prepare(countQuery).bind(...params).first();
    const total = countResult?.total as number || 0;
    
    // データ取得
    const dataQuery = `
      SELECT * FROM cards ${whereClause}
      ORDER BY ${criteria.sortBy} ${criteria.sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;
    
    const { results } = await this.db.prepare(dataQuery)
      .bind(...params, criteria.limit, criteria.offset)
      .all();
    
    const cards = results.map(row => ({
      ...row,
      effects: JSON.parse(row.effects as string),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    })) as Card[];
    
    return { cards, total };
  }
  
  // その他のメソッド実装...
}
```

## エラーハンドリング

```typescript
export class CardError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'CardError';
  }
}

export class ValidationError extends CardError {
  constructor(message: string, public errors: any[]) {
    super(message, 'VALIDATION_ERROR', errors);
  }
}

export class ConflictError extends CardError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR');
  }
}

export class NotFoundError extends CardError {
  constructor(message: string) {
    super(message, 'NOT_FOUND_ERROR');
  }
}
```

## ファクトリーパターン

```typescript
export function createCardServices(): {
  cardService: CardService;
  searchService: CardSearchService;
} {
  const { database, cache, image } = createAdapters();
  
  return {
    cardService: new CardService(database, cache, image),
    searchService: new CardSearchService(database, cache)
  };
}

function createAdapters() {
  const deployTarget = process.env.DEPLOY_TARGET;
  
  if (deployTarget === 'cloudflare') {
    return {
      database: new D1CardAdapter(globalThis.DB as D1Database),
      cache: new CloudflareKVAdapter(globalThis.CACHE as KVNamespace),
      image: new CloudflareImageAdapter()
    };
  } else {
    return {
      database: new PostgresCardAdapter(globalThis.prisma),
      cache: new VercelKVAdapter(require('@vercel/kv')),
      image: new VercelImageAdapter()
    };
  }
}
```

## Honoでの実装例

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// サービス初期化
const { cardService, searchService } = createCardServices();

// カード作成エンドポイント
app.post('/api/cards', 
  zValidator('json', CreateCardSchema),
  async (c) => {
    try {
      const request = c.req.valid('json');
      const card = await cardService.createCard(request);
      
      return c.json(card, 201);
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json({ error: error.message, details: error.errors }, 400);
      }
      if (error instanceof ConflictError) {
        return c.json({ error: error.message }, 409);
      }
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

// カード取得エンドポイント
app.get('/api/cards/:id', async (c) => {
  try {
    const cardId = c.req.param('id');
    const card = await cardService.getCard(cardId);
    
    if (!card) {
      return c.json({ error: 'カードが見つかりません' }, 404);
    }
    
    return c.json(card);
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// カード検索エンドポイント
app.get('/api/cards',
  zValidator('query', CardSearchSchema),
  async (c) => {
    try {
      const criteria = c.req.valid('query');
      const result = await searchService.searchCards(criteria);
      
      return c.json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json({ error: error.message, details: error.errors }, 400);
      }
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

// カード更新エンドポイント
app.put('/api/cards/:id',
  zValidator('json', CreateCardSchema.partial()),
  async (c) => {
    try {
      const cardId = c.req.param('id');
      const updates = c.req.valid('json');
      
      const card = await cardService.updateCard(cardId, updates);
      
      return c.json(card);
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json({ error: error.message, details: error.errors }, 400);
      }
      if (error instanceof NotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      if (error instanceof ConflictError) {
        return c.json({ error: error.message }, 409);
      }
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

// カード無効化エンドポイント
app.delete('/api/cards/:id', async (c) => {
  try {
    const cardId = c.req.param('id');
    await cardService.deactivateCard(cardId);
    
    return c.json({ message: 'カードが無効化されました' });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// リーダー別カード取得
app.get('/api/cards/leader/:leaderId', async (c) => {
  try {
    const leaderId = parseInt(c.req.param('leaderId'));
    const cards = await searchService.getCardsByLeader(leaderId);
    
    return c.json({ cards });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ランダムカード取得
app.get('/api/cards/random/:count?', async (c) => {
  try {
    const count = parseInt(c.req.param('count') || '10');
    const cards = await searchService.getRandomCards(count);
    
    return c.json({ cards });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default app;
```

## パフォーマンス最適化

### キャッシュ戦略

```typescript
interface CardCacheKeys {
  single: `card:${string}`;                    // 単体カード（長期）
  byNumber: `card:number:${string}`;           // カード番号別（長期）
  search: `cards:search:${string}`;            // 検索結果（短期）
  bySet: `cards:set:${string}`;               // セット別（中期）
  byLeader: `cards:leader:${number}`;         // リーダー別（中期）
  random: "cards:random";                      // ランダム（短期）
}

// キャッシュ期間設定
const CACHE_DURATION = {
  CARD_SINGLE: 24 * 3600,        // 24時間
  CARD_SET: 3600,                // 1時間
  SEARCH_RESULT: 300,            // 5分
  RANDOM_CARDS: 60               // 1分
};
```

### 検索最適化

```typescript
export class CardSearchOptimizer {
  static optimizeSearchQuery(criteria: CardSearchCriteria): CardSearchCriteria {
    // 不要な条件を除去
    const optimized = { ...criteria };
    
    // 空の条件を削除
    Object.keys(optimized).forEach(key => {
      const value = optimized[key as keyof CardSearchCriteria];
      if (value === undefined || value === null || value === '') {
        delete optimized[key as keyof CardSearchCriteria];
      }
    });
    
    // ソート最適化
    if (optimized.sortBy === 'name' && !optimized.name) {
      // 名前ソートでフィルタなしの場合、IDソートに変更
      optimized.sortBy = 'cardNumber';
    }
    
    return optimized;
  }
  
  static shouldUseFullTextSearch(criteria: CardSearchCriteria): boolean {
    return !!(criteria.name && criteria.name.length >= 2);
  }
}
```

この設計により、効率的なカード管理と高速な検索機能を提供し、ゲームバランスの維持とパフォーマンスの両立を実現できます。