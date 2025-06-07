import { DatabaseAdapter, DatabaseAdapterFactory, DatabaseConfig } from './DatabaseAdapter';
import { PostgreSQLAdapter } from './PostgreSQLAdapter';
import { D1Adapter } from './D1Adapter';
import { DrizzleAdminRepository } from './drizzle/AdminRepository';
import { createDrizzleClient } from './drizzle/client';
import type { AdminRepository } from '../../domain/repositories/AdminRepository';

export class DefaultDatabaseAdapterFactory implements DatabaseAdapterFactory {
  create(config: DatabaseConfig): DatabaseAdapter {
    switch (config.type) {
      case 'postgresql':
        if (!config.connectionString) {
          throw new Error('Connection string required for PostgreSQL');
        }
        return new PostgreSQLAdapter(config.connectionString);
      
      case 'd1':
        if (!config.database) {
          throw new Error('D1 database instance required');
        }
        return new D1Adapter(config.database);
      
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

// Drizzle対応のリポジトリファクトリー
export class DrizzleRepositoryFactory {
  static createAdminRepository(env: any): AdminRepository {
    // 環境変数でDrizzleを使用するかどうかを制御
    if (env.USE_DRIZZLE === 'true') {
      const client = createDrizzleClient({
        DATABASE_URL: env.DATABASE_URL,
        DATABASE_TYPE: env.DATABASE_TYPE || 'postgresql',
        D1_DATABASE: env.D1_DATABASE
      });
      return new DrizzleAdminRepository(client);
    }
    
    // 既存のアダプターファクトリーを使用（段階的移行）
    const factory = new DefaultDatabaseAdapterFactory();
    const adapter = factory.create({
      type: env.DATABASE_TYPE || 'postgresql',
      connectionString: env.DATABASE_URL,
      database: env.D1_DATABASE
    });
    
    // 既存のアダプターからAdminRepositoryを取得
    // TODO: 既存アダプターがAdminRepositoryを実装する必要がある
    throw new Error('Legacy adapter AdminRepository not implemented yet');
  }
}