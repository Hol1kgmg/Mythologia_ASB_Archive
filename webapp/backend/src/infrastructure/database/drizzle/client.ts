/**
 * Drizzle データベースクライアント
 * PostgreSQL・D1両対応のクライアント管理
 */

import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import postgres from 'postgres';
import * as schema from '../../../../drizzle/schema';

// 環境変数の型定義
interface Env {
  DATABASE_URL?: string;
  DATABASE_TYPE?: 'postgresql' | 'd1';
  D1_DATABASE?: D1Database;
}

// PostgreSQL クライアント作成
export function createPostgreSQLClient(connectionString: string) {
  const client = postgres(connectionString);
  return drizzlePg(client, { schema });
}

// D1 クライアント作成
export function createD1Client(database: D1Database) {
  return drizzleD1(database, { schema });
}

// 統合データベースクライアント
export interface DrizzleClient {
  db: ReturnType<typeof createPostgreSQLClient> | ReturnType<typeof createD1Client>;
  type: 'postgresql' | 'd1';
}

export function createDrizzleClient(env: Env): DrizzleClient {
  const databaseType = env.DATABASE_TYPE || 'postgresql';
  
  switch (databaseType) {
    case 'postgresql': {
      const connectionString = env.DATABASE_URL || 'postgresql://localhost:5432/mythologia';
      return {
        db: createPostgreSQLClient(connectionString),
        type: 'postgresql'
      };
    }
    
    case 'd1': {
      if (!env.D1_DATABASE) {
        throw new Error('D1_DATABASE is required for D1 database type');
      }
      return {
        db: createD1Client(env.D1_DATABASE),
        type: 'd1'
      };
    }
    
    default:
      throw new Error(`Unsupported database type: ${databaseType}`);
  }
}

// 型ヘルパー
export type PostgreSQLDB = ReturnType<typeof createPostgreSQLClient>;
export type D1DB = ReturnType<typeof createD1Client>;
export type Database = PostgreSQLDB | D1DB;