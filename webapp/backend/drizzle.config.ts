import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema/index.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mythologia',
  },
  verbose: true,
  strict: true,
  introspect: {
    casing: 'snake_case',
  },
}) satisfies Config;