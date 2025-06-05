import { DatabaseAdapter, QueryResult } from './DatabaseAdapter';
import { Pool, PoolClient } from 'pg';
import { sql as vercelSql } from '@vercel/postgres';
import { env } from '../../config/env';

export class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;
  private isVercelEnvironment: boolean;
  private transactionClient: PoolClient | null = null;

  constructor(connectionString?: string) {
    // Vercel環境の判定
    this.isVercelEnvironment = !!process.env.POSTGRES_URL;
    
    if (!this.isVercelEnvironment && connectionString) {
      // ローカル環境またはカスタムPostgreSQL
      this.pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: Number(env.POSTGRES_POOL_TIMEOUT) * 1000,
      });
      
      // エラーハンドリング
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      if (this.isVercelEnvironment) {
        // Vercel Postgres使用
        const result = await vercelSql.query(sql, params);
        return {
          rows: result.rows as T[],
          rowCount: result.rowCount || 0
        };
      } else if (this.transactionClient) {
        // トランザクション中
        const result = await this.transactionClient.query(sql, params);
        return {
          rows: result.rows as T[],
          rowCount: result.rowCount
        };
      } else if (this.pool) {
        // 通常のクエリ
        const result = await this.pool.query(sql, params);
        return {
          rows: result.rows as T[],
          rowCount: result.rowCount
        };
      } else {
        throw new Error('PostgreSQL connection not initialized');
      }
    } catch (error) {
      console.error('PostgreSQL Query Error:', error);
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transaction<T>(callback: (adapter: DatabaseAdapter) => Promise<T>): Promise<T> {
    if (this.isVercelEnvironment) {
      // Vercel Postgresはトランザクションを自動管理
      return callback(this);
    }
    
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized');
    }
    
    const client = await this.pool.connect();
    this.transactionClient = client;
    
    try {
      await client.query('BEGIN');
      const result = await callback(this);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      this.transactionClient = null;
      client.release();
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}