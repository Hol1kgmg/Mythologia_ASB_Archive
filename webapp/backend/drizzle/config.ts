/**
 * Drizzle ORM設定
 * PostgreSQL・D1両対応の設定管理
 */

export interface DrizzleConfig {
  postgresql: {
    connectionString: string;
  };
  d1: {
    database: string;
  };
  environment: 'development' | 'production';
}

export function createDrizzleConfig(): DrizzleConfig {
  return {
    postgresql: {
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mythologia'
    },
    d1: {
      database: process.env.D1_DATABASE_NAME || 'mythologia-db'
    },
    environment: (process.env.NODE_ENV as 'development' | 'production') || 'development'
  };
}