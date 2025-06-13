import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;
let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create postgres connection
    sql = postgres(connectionString, {
      max: 10, // Maximum number of connections
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Create drizzle instance
    db = drizzle(sql, { schema });
  }

  return db;
}

// Close database connection
export async function closeDb() {
  if (sql) {
    await sql.end();
    sql = null;
    db = null;
  }
}

// Export type for use in other modules
export type Database = ReturnType<typeof getDb>;