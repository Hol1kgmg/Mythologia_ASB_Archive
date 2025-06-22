/**
 * レート制限ストア抽象化
 * Redis または Database による永続化可能な実装
 */
import { and, eq, isNull, lt, or } from 'drizzle-orm';

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

export interface RateLimitStore {
  /**
   * キーのカウントを増加し、現在の状態を返す
   */
  increment(key: string, windowMs: number): Promise<RateLimitEntry>;

  /**
   * キーを特定期間ブロック
   */
  block(key: string, duration: number): Promise<void>;

  /**
   * キーがブロックされているかチェック
   */
  isBlocked(key: string): Promise<boolean>;

  /**
   * キーの制限をリセット
   */
  reset(key: string): Promise<void>;

  /**
   * 期限切れエントリをクリーンアップ
   */
  cleanup(): Promise<number>;
}

/**
 * インメモリ実装（開発・テスト用）
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      entry.count++;
    }

    this.store.set(key, entry);
    return { ...entry };
  }

  async block(key: string, duration: number): Promise<void> {
    const entry = this.store.get(key) || { count: 0, resetTime: 0 };
    entry.blockedUntil = Date.now() + duration;
    this.store.set(key, entry);
  }

  async isBlocked(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry?.blockedUntil) return false;

    const now = Date.now();
    if (now >= entry.blockedUntil) {
      delete entry.blockedUntil;
      return false;
    }

    return true;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  async cleanup(): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.store.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Redis実装（本番用）
 */
export class RedisRateLimitStore implements RateLimitStore {
  constructor(
    private redis: any, // Redis client type will be provided by Redis package
    private keyPrefix: string = 'rate_limit:'
  ) {}

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const redisKey = `${this.keyPrefix}${key}`;
    const now = Date.now();

    // Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();
    pipeline.hgetall(redisKey);
    pipeline.hincrby(redisKey, 'count', 1);
    pipeline.expire(redisKey, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    const existing = results[0][1] || {};

    let entry: RateLimitEntry;

    if (!existing.resetTime || now > parseInt(existing.resetTime)) {
      // Reset window
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };

      await this.redis.hmset(redisKey, {
        count: 1,
        resetTime: entry.resetTime,
      });
    } else {
      // Increment existing
      entry = {
        count: parseInt(existing.count) || 1,
        resetTime: parseInt(existing.resetTime),
        blockedUntil: existing.blockedUntil ? parseInt(existing.blockedUntil) : undefined,
      };
    }

    return entry;
  }

  async block(key: string, duration: number): Promise<void> {
    const redisKey = `${this.keyPrefix}${key}`;
    const blockedUntil = Date.now() + duration;

    await this.redis.hset(redisKey, 'blockedUntil', blockedUntil);
    await this.redis.expire(redisKey, Math.ceil(duration / 1000) + 60); // Extra buffer
  }

  async isBlocked(key: string): Promise<boolean> {
    const redisKey = `${this.keyPrefix}${key}`;
    const blockedUntil = await this.redis.hget(redisKey, 'blockedUntil');

    if (!blockedUntil) return false;

    const now = Date.now();
    if (now >= parseInt(blockedUntil)) {
      await this.redis.hdel(redisKey, 'blockedUntil');
      return false;
    }

    return true;
  }

  async reset(key: string): Promise<void> {
    const redisKey = `${this.keyPrefix}${key}`;
    await this.redis.del(redisKey);
  }

  async cleanup(): Promise<number> {
    // Redis TTL handles cleanup automatically
    // This method can be used for manual cleanup if needed
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.redis.keys(pattern);

    let cleaned = 0;
    const now = Date.now();

    for (const key of keys) {
      const entry = await this.redis.hgetall(key);
      if (
        entry.resetTime &&
        now > parseInt(entry.resetTime) &&
        (!entry.blockedUntil || now > parseInt(entry.blockedUntil))
      ) {
        await this.redis.del(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Database実装（Redisが利用できない場合の代替案）
 * Note: 現在は簡易実装。将来的に適切なテーブルスキーマで拡張予定
 */
export class DatabaseRateLimitStore implements RateLimitStore {
  private inMemoryStore = new InMemoryRateLimitStore();

  constructor(
    private db: any, // Drizzle database instance
    private tableName: string = 'rate_limits'
  ) {}

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    // Temporary fallback to in-memory until proper DB schema is implemented
    return this.inMemoryStore.increment(key, windowMs);
  }

  async block(key: string, duration: number): Promise<void> {
    return this.inMemoryStore.block(key, duration);
  }

  async isBlocked(key: string): Promise<boolean> {
    return this.inMemoryStore.isBlocked(key);
  }

  async reset(key: string): Promise<void> {
    return this.inMemoryStore.reset(key);
  }

  async cleanup(): Promise<number> {
    return this.inMemoryStore.cleanup();
  }
}

/**
 * ファクトリー関数：環境に応じて適切なストアを作成
 */
export function createRateLimitStore(): RateLimitStore {
  // Redis が利用可能な場合
  if (process.env.REDIS_URL) {
    try {
      // Redis implementation would require redis package
      // For now, fallback to in-memory
      console.log(
        'Redis URL detected, but Redis implementation not yet configured. Using in-memory store.'
      );
      return new InMemoryRateLimitStore();
    } catch (error) {
      console.warn('Failed to connect to Redis, falling back to in-memory store:', error);
      return new InMemoryRateLimitStore();
    }
  }

  // Database fallback (future implementation)
  // return new DatabaseRateLimitStore(db);

  // Default: in-memory (development only)
  console.log('Using in-memory rate limit store (development only)');
  return new InMemoryRateLimitStore();
}
