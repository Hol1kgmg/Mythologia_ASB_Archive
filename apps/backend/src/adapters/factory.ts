import { PostgreSQLAdapter } from './postgresql';
import { D1Adapter } from './d1';
import type { DatabaseAdapter } from '@/types/database';

export interface DatabaseConfig {
  platform: 'vercel' | 'cloudflare';
  connectionString?: string;
  d1Database?: D1Database;
}

export function createDatabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
  switch (config.platform) {
    case 'vercel':
      if (!config.connectionString) {
        throw new Error('PostgreSQL connection string is required for Vercel platform');
      }
      return new PostgreSQLAdapter(config.connectionString);
    
    case 'cloudflare':
      if (!config.d1Database) {
        throw new Error('D1 database instance is required for Cloudflare platform');
      }
      return new D1Adapter(config.d1Database);
    
    default:
      throw new Error(`Unsupported platform: ${config.platform as string}`);
  }
}

export type { DatabaseAdapter } from '@/types/database';