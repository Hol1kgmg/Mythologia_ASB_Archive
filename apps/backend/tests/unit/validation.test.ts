import { describe, it, expect } from 'vitest';
import {
  CreateTribeSchema,
  UpdateTribeSchema,
  CreateCardSchema,
  CreateCardSetSchema,
  CardQuerySchema,
} from '../../src/types/validation';
import { Rarity, CardType, Leader } from '../../src/types/enums';

describe('Validation Schemas', () => {
  describe('CreateTribeSchema', () => {
    it('should validate correct tribe data', () => {
      const validTribe = {
        id: 1,
        name: 'ドラゴン',
        leaderId: 1,
        thematic: '古代の力',
        description: '強大な竜族',
      };

      const result = CreateTribeSchema.safeParse(validTribe);
      expect(result.success).toBe(true);
    });

    it('should reject invalid tribe data', () => {
      const invalidTribe = {
        id: -1, // 負の数は無効
        name: '', // 空文字は無効
        leaderId: 10, // 範囲外
      };

      const result = CreateTribeSchema.safeParse(invalidTribe);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalTribe = {
        id: 2,
        name: 'エレメンタル',
      };

      const result = CreateTribeSchema.safeParse(minimalTribe);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateCardSetSchema', () => {
    it('should validate correct card set data', () => {
      const validCardSet = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '基本セット',
        code: 'CORE',
        releaseDate: '2024-01-01',
        cardCount: 100,
        description: 'ゲームの基本カードセット',
      };

      const result = CreateCardSetSchema.safeParse(validCardSet);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidCardSet = {
        id: 'invalid-uuid',
        name: '基本セット',
        code: 'CORE',
        releaseDate: '2024-01-01',
      };

      const result = CreateCardSetSchema.safeParse(invalidCardSet);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const invalidCardSet = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '基本セット',
        code: 'CORE',
        releaseDate: '01/01/2024', // 不正な日付形式
      };

      const result = CreateCardSetSchema.safeParse(invalidCardSet);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateCardSchema', () => {
    it('should validate correct card data', () => {
      const validCard = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cardNumber: '10001',
        name: 'ファイアドラゴン',
        leaderId: Leader.DRAGON,
        tribeId: 1,
        rarityId: Rarity.GOLD,
        cardTypeId: CardType.ATTACKER,
        cost: 5,
        power: 3000,
        effects: {
          description: 'ターン終了時、敵全体に2ダメージを与える',
          abilities: [{ type: 'damage', value: 2 }],
          triggers: [{ type: 'onTurnEnd' }],
          targets: [{ type: 'enemy', filter: 'all' }],
        },
        imageUrl: 'https://example.com/card1.jpg',
        cardSetId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = CreateCardSchema.safeParse(validCard);
      expect(result.success).toBe(true);
    });

    it('should reject negative cost and power', () => {
      const invalidCard = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        cardNumber: '10001',
        name: 'テストカード',
        rarityId: Rarity.BRONZE,
        cardTypeId: CardType.ATTACKER,
        cost: -1, // 負の値は無効
        power: -100, // 負の値は無効
        effects: {
          description: 'テスト効果',
          abilities: [],
          triggers: [],
          targets: [],
        },
        imageUrl: 'https://example.com/card1.jpg',
        cardSetId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = CreateCardSchema.safeParse(invalidCard);
      expect(result.success).toBe(false);
    });
  });

  describe('CardQuerySchema', () => {
    it('should validate query parameters', () => {
      const validQuery = {
        leaderId: '1',
        rarityId: '3',
        limit: '10',
        offset: '0',
      };

      const result = CardQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.leaderId).toBe(Leader.DRAGON);
        expect(result.data.rarityId).toBe(Rarity.GOLD);
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should apply default values', () => {
      const minimalQuery = {};

      const result = CardQuerySchema.safeParse(minimalQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20); // デフォルト値
        expect(result.data.offset).toBe(0); // デフォルト値
      }
    });

    it('should reject invalid enum values', () => {
      const invalidQuery = {
        leaderId: '99', // 存在しないリーダーID
        rarityId: '10', // 存在しないレアリティID
      };

      const result = CardQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateTribeSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        name: '更新された種族名',
        description: '更新された説明',
      };

      const result = UpdateTribeSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should not allow id in update', () => {
      const invalidUpdate = {
        id: 1, // IDは更新で許可されない
        name: '更新された種族名',
      };

      const result = UpdateTribeSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        // @ts-expect-error - id should not exist in update schema
        expect(result.data.id).toBeUndefined();
      }
    });
  });
});