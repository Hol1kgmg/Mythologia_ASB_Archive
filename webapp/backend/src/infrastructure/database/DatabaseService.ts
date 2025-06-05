import { DatabaseAdapter } from './DatabaseAdapter';
import { DefaultDatabaseAdapterFactory } from './DatabaseAdapterFactory';
import { Context } from 'hono';

// シングルトンインスタンス管理
let postgresqlAdapter: DatabaseAdapter | null = null;

export class DatabaseService {
  /**
   * 環境に応じたデータベースアダプターを取得
   */
  static async getAdapter(c: Context): Promise<DatabaseAdapter> {
    const factory = new DefaultDatabaseAdapterFactory();
    
    // Cloudflare Workers環境（D1）
    if (c.env?.DB) {
      return factory.create({
        type: 'd1',
        database: c.env.DB as D1Database
      });
    }
    
    // Vercel/Node.js環境（PostgreSQL）
    const databaseUrl = process.env.DATABASE_URL || c.env?.DATABASE_URL;
    const databaseType = process.env.DATABASE_TYPE || c.env?.DATABASE_TYPE || 'postgresql';
    
    if (databaseType === 'postgresql' && databaseUrl) {
      // シングルトンパターンで接続を再利用
      if (!postgresqlAdapter) {
        postgresqlAdapter = factory.create({
          type: 'postgresql',
          connectionString: databaseUrl
        });
      }
      return postgresqlAdapter;
    }
    
    // フォールバック：モックアダプター
    console.warn('No database configured, using mock adapter');
    return {
      async query<T>(): Promise<{ rows: T[]; rowCount: number }> {
        return { rows: [], rowCount: 0 };
      },
      async transaction<T>(callback: (adapter: DatabaseAdapter) => Promise<T>): Promise<T> {
        return callback(this as any);
      },
      async close(): Promise<void> {}
    };
  }
  
  /**
   * グレースフルシャットダウン用
   */
  static async closeAll(): Promise<void> {
    if (postgresqlAdapter) {
      await postgresqlAdapter.close();
      postgresqlAdapter = null;
    }
  }
}