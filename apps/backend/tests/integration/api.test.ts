import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';

// Database adapter をモック
const mockDb = {
  getTribes: vi.fn(),
  getTribe: vi.fn(),
  createTribe: vi.fn(),
  updateTribe: vi.fn(),
  deleteTribe: vi.fn(),
  getCards: vi.fn(),
  getCard: vi.fn(),
  getCardsByLeader: vi.fn(),
  getCardsByTribe: vi.fn(),
  getCardsByRarity: vi.fn(),
  getCardsByType: vi.fn(),
  createCard: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
  getCardSets: vi.fn(),
  getCardSet: vi.fn(),
  createCardSet: vi.fn(),
  updateCardSet: vi.fn(),
  deleteCardSet: vi.fn(),
};

// Database adapter factory をモック
vi.mock('../../src/adapters', () => ({
  createDatabaseAdapter: vi.fn(() => mockDb),
}));

describe('API Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    // DATABASE_URL を設定してデータベースアダプターが初期化されるようにする
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    // アプリを動的にインポート（モック適用後）
    const { default: appInstance } = await import('../../src/index');
    app = appInstance;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health Check Endpoints', () => {
    it('should return app info at root endpoint', async () => {
      const res = await app.request('/');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        message: '神託のメソロギア 非公式カード情報データベース API',
        version: '0.1.0',
        status: 'healthy',
        platform: 'vercel',
      });
      expect(data.timestamp).toBeDefined();
    });

    it('should return health status', async () => {
      const res = await app.request('/api/health');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        status: 'ok',
        platform: 'vercel',
      });
      expect(data.timestamp).toBeDefined();
    });

    it('should return API documentation', async () => {
      const res = await app.request('/api');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        success: true,
        message: '神託のメソロギア 非公式カード情報データベース API',
        version: '0.1.0',
        endpoints: {
          tribes: '/api/tribes',
          cards: '/api/cards',
          cardSets: '/api/card-sets',
          health: '/api/health',
        },
      });
    });
  });

  describe('Tribes API', () => {
    it('should get all tribes', async () => {
      const mockTribes = [
        { id: 1, name: 'ドラゴン', isActive: true },
        { id: 2, name: 'エレメンタル', isActive: true },
      ];
      mockDb.getTribes.mockResolvedValue(mockTribes);

      const res = await app.request('/api/tribes');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        success: true,
        data: mockTribes,
        count: 2,
      });
      expect(mockDb.getTribes).toHaveBeenCalledOnce();
    });

    it('should get tribe by id', async () => {
      const mockTribe = { id: 1, name: 'ドラゴン', isActive: true };
      mockDb.getTribe.mockResolvedValue(mockTribe);

      const res = await app.request('/api/tribes/1');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toMatchObject({
        success: true,
        data: mockTribe,
      });
      expect(mockDb.getTribe).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent tribe', async () => {
      mockDb.getTribe.mockResolvedValue(null);

      const res = await app.request('/api/tribes/999');
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data).toMatchObject({
        success: false,
        error: 'Tribe not found',
      });
    });

    it('should create new tribe', async () => {
      const newTribe = {
        id: 3,
        name: 'ビースト',
        leaderId: 1,
        description: '野生の力を持つ獣族',
      };
      mockDb.createTribe.mockResolvedValue(newTribe);

      const res = await app.request('/api/tribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTribe),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data).toMatchObject({
        success: true,
        data: newTribe,
      });
      expect(mockDb.createTribe).toHaveBeenCalledWith(newTribe);
    });

    it('should validate tribe data on creation', async () => {
      const invalidTribe = {
        id: -1, // 無効なID
        name: '', // 空の名前
      };

      const res = await app.request('/api/tribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTribe),
      });

      expect(res.status).toBe(400);
      expect(mockDb.createTribe).not.toHaveBeenCalled();
    });
  });

  describe('Cards API', () => {
    it('should get all cards', async () => {
      const mockCards = [
        {
          id: 'card-1',
          name: 'ファイアドラゴン',
          leaderId: 1,
          rarityId: 3,
          cost: 5,
          power: 3000,
        },
      ];
      mockDb.getCards.mockResolvedValue(mockCards);

      const res = await app.request('/api/cards');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCards);
      expect(mockDb.getCards).toHaveBeenCalledOnce();
    });

    it('should filter cards by leader', async () => {
      const mockCards = [
        { id: 'card-1', name: 'ドラゴンカード', leaderId: 1 },
      ];
      mockDb.getCardsByLeader.mockResolvedValue(mockCards);

      const res = await app.request('/api/cards?leaderId=1');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(mockDb.getCardsByLeader).toHaveBeenCalledWith(1);
    });

    it('should apply pagination', async () => {
      const mockCards = Array.from({ length: 50 }, (_, i) => ({
        id: `card-${i}`,
        name: `カード${i}`,
      }));
      mockDb.getCards.mockResolvedValue(mockCards);

      const res = await app.request('/api/cards?limit=10&offset=20');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.pagination).toMatchObject({
        offset: 20,
        limit: 10,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.getTribes.mockRejectedValue(new Error('Database connection failed'));

      const res = await app.request('/api/tribes');
      expect(res.status).toBe(500);

      const data = await res.json();
      expect(data).toMatchObject({
        success: false,
        error: 'Failed to fetch tribes',
        message: 'Database connection failed',
      });
    });

    it('should return 404 for unknown endpoints', async () => {
      const res = await app.request('/api/unknown');
      expect(res.status).toBe(404);
    });
  });

  describe('Database Not Configured', () => {
    it('should return 503 when database is not configured', async () => {
      // DATABASE_URL を一時的に削除
      const originalUrl = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      
      try {
        // 新しいアプリインスタンスを作成（DATABASE_URL なし）
        vi.resetModules();
        const { default: appWithoutDb } = await import('../../src/index');
        
        const res = await appWithoutDb.request('/api/tribes');
        expect(res.status).toBe(503);

        const data = await res.json();
        expect(data).toMatchObject({
          success: false,
          error: 'Database not configured',
          message: 'Please set DATABASE_URL environment variable',
        });
      } finally {
        // 環境変数を復元
        if (originalUrl) {
          process.env.DATABASE_URL = originalUrl;
        }
      }
    });
  });
});