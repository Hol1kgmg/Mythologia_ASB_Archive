declare global {
  interface D1Database {
    prepare(query: string): any;
    batch(statements: any[]): Promise<any[]>;
    exec(query: string): Promise<any>;
  }
}

export interface DatabaseConfig {
  type: 'postgresql' | 'd1';
  connectionString?: string;
  database?: D1Database;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  transaction<T>(callback: (adapter: DatabaseAdapter) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface DatabaseAdapterFactory {
  create(config: DatabaseConfig): DatabaseAdapter;
}