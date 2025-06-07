import { DatabaseAdapter, QueryResult } from './DatabaseAdapter';

// D1 types are provided by @cloudflare/workers-types

export class D1Adapter implements DatabaseAdapter {
  constructor(private database: D1Database) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    try {
      const stmt = this.database.prepare(sql);
      const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
      const result = await boundStmt.all();
      
      return {
        rows: result.results,
        rowCount: result.results.length
      };
    } catch (error) {
      console.error('D1 Query Error:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (adapter: DatabaseAdapter) => Promise<T>): Promise<T> {
    // D1 doesn't support traditional transactions
    // For now, we'll just execute the callback
    return callback(this);
  }

  async close(): Promise<void> {
    // D1 connections are managed automatically
    // No explicit close needed
  }
}