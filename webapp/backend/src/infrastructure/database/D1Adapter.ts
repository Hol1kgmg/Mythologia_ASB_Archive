import { DatabaseAdapter, QueryResult } from './DatabaseAdapter';

declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
    exec(query: string): Promise<D1ExecResult>;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = any>(colName?: string): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = any>(): Promise<D1Result<T>>;
    raw<T = any>(): Promise<T[]>;
  }

  interface D1Result<T = any> {
    results: T[];
    duration: number;
    changes: number;
    last_row_id: number;
    changed_db: boolean;
    size_after: number;
    rows_read: number;
    rows_written: number;
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }
}

export class D1Adapter implements DatabaseAdapter {
  constructor(private database: D1Database) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    try {
      const stmt = this.database.prepare(sql);
      const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
      const result = await boundStmt.all<T>();
      
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