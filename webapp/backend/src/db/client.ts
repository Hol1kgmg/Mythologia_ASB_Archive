import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres connection
const sql = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // Ignore notices
});

// Create drizzle instance
export const db = drizzle(sql, { schema });

// Close database connection
export async function closeDb() {
  await sql.end();
}

// Export type for use in other modules
export type Database = typeof db;