import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDatabaseAdapter } from '../../src/adapters/factory';
import type { DatabaseConfig } from '../../src/adapters/factory';

// PostgreSQL adapter のモック
vi.mock('../../src/adapters/postgresql', () => ({
  PostgreSQLAdapter: vi.fn().mockImplementation(() => ({
    getTribes: vi.fn().mockResolvedValue([]),
    getTribe: vi.fn().mockResolvedValue(null),
    createTribe: vi.fn().mockResolvedValue({}),
    updateTribe: vi.fn().mockResolvedValue({}),
    deleteTribe: vi.fn().mockResolvedValue(true),
    getCards: vi.fn().mockResolvedValue([]),
    getCard: vi.fn().mockResolvedValue(null),
    getCardsByLeader: vi.fn().mockResolvedValue([]),
    getCardsByTribe: vi.fn().mockResolvedValue([]),
    getCardsByRarity: vi.fn().mockResolvedValue([]),
    getCardsByType: vi.fn().mockResolvedValue([]),
    createCard: vi.fn().mockResolvedValue({}),
    updateCard: vi.fn().mockResolvedValue({}),
    deleteCard: vi.fn().mockResolvedValue(true),
    getCardSets: vi.fn().mockResolvedValue([]),
    getCardSet: vi.fn().mockResolvedValue(null),
    createCardSet: vi.fn().mockResolvedValue({}),
    updateCardSet: vi.fn().mockResolvedValue({}),
    deleteCardSet: vi.fn().mockResolvedValue(true),
  })),
}));

// D1 adapter のモック
vi.mock('../../src/adapters/d1', () => ({
  D1Adapter: vi.fn().mockImplementation(() => ({
    getTribes: vi.fn().mockResolvedValue([]),
    getTribe: vi.fn().mockResolvedValue(null),
    createTribe: vi.fn().mockResolvedValue({}),
    updateTribe: vi.fn().mockResolvedValue({}),
    deleteTribe: vi.fn().mockResolvedValue(true),
    getCards: vi.fn().mockResolvedValue([]),
    getCard: vi.fn().mockResolvedValue(null),
    getCardsByLeader: vi.fn().mockResolvedValue([]),
    getCardsByTribe: vi.fn().mockResolvedValue([]),
    getCardsByRarity: vi.fn().mockResolvedValue([]),
    getCardsByType: vi.fn().mockResolvedValue([]),
    createCard: vi.fn().mockResolvedValue({}),
    updateCard: vi.fn().mockResolvedValue({}),
    deleteCard: vi.fn().mockResolvedValue(true),
    getCardSets: vi.fn().mockResolvedValue([]),
    getCardSet: vi.fn().mockResolvedValue(null),
    createCardSet: vi.fn().mockResolvedValue({}),
    updateCardSet: vi.fn().mockResolvedValue({}),
    deleteCardSet: vi.fn().mockResolvedValue(true),
  })),
}));

describe('Database Adapter Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PostgreSQL Platform', () => {
    it('should create PostgreSQL adapter with valid config', () => {
      const config: DatabaseConfig = {
        platform: 'vercel',
        connectionString: 'postgresql://user:pass@localhost:5432/db',
      };

      const adapter = createDatabaseAdapter(config);
      expect(adapter).toBeDefined();
      expect(typeof adapter.getTribes).toBe('function');
      expect(typeof adapter.createTribe).toBe('function');
    });

    it('should throw error when connection string is missing', () => {
      const config: DatabaseConfig = {
        platform: 'vercel',
        // connectionString is missing
      };

      expect(() => createDatabaseAdapter(config)).toThrow(
        'PostgreSQL connection string is required for Vercel platform'
      );
    });
  });

  describe('Cloudflare Platform', () => {
    it('should create D1 adapter with valid config', () => {
      const mockD1Database = {} as D1Database;
      const config: DatabaseConfig = {
        platform: 'cloudflare',
        d1Database: mockD1Database,
      };

      const adapter = createDatabaseAdapter(config);
      expect(adapter).toBeDefined();
      expect(typeof adapter.getTribes).toBe('function');
      expect(typeof adapter.createTribe).toBe('function');
    });

    it('should throw error when D1 database is missing', () => {
      const config: DatabaseConfig = {
        platform: 'cloudflare',
        // d1Database is missing
      };

      expect(() => createDatabaseAdapter(config)).toThrow(
        'D1 database instance is required for Cloudflare platform'
      );
    });
  });

  describe('Unsupported Platform', () => {
    it('should throw error for unsupported platform', () => {
      const config = {
        platform: 'unsupported' as any,
      };

      expect(() => createDatabaseAdapter(config)).toThrow(
        'Unsupported platform: unsupported'
      );
    });
  });

  describe('Adapter Interface Compliance', () => {
    it('should have all required methods', async () => {
      const config: DatabaseConfig = {
        platform: 'vercel',
        connectionString: 'postgresql://user:pass@localhost:5432/db',
      };

      const adapter = createDatabaseAdapter(config);

      // Tribe methods
      expect(typeof adapter.getTribes).toBe('function');
      expect(typeof adapter.getTribe).toBe('function');
      expect(typeof adapter.createTribe).toBe('function');
      expect(typeof adapter.updateTribe).toBe('function');
      expect(typeof adapter.deleteTribe).toBe('function');

      // Card methods
      expect(typeof adapter.getCards).toBe('function');
      expect(typeof adapter.getCard).toBe('function');
      expect(typeof adapter.getCardsByLeader).toBe('function');
      expect(typeof adapter.getCardsByTribe).toBe('function');
      expect(typeof adapter.getCardsByRarity).toBe('function');
      expect(typeof adapter.getCardsByType).toBe('function');
      expect(typeof adapter.createCard).toBe('function');
      expect(typeof adapter.updateCard).toBe('function');
      expect(typeof adapter.deleteCard).toBe('function');

      // CardSet methods
      expect(typeof adapter.getCardSets).toBe('function');
      expect(typeof adapter.getCardSet).toBe('function');
      expect(typeof adapter.createCardSet).toBe('function');
      expect(typeof adapter.updateCardSet).toBe('function');
      expect(typeof adapter.deleteCardSet).toBe('function');

      // Test that methods return promises
      const tribesResult = adapter.getTribes();
      expect(tribesResult).toBeInstanceOf(Promise);
      
      const tribes = await tribesResult;
      expect(Array.isArray(tribes)).toBe(true);
    });
  });
});