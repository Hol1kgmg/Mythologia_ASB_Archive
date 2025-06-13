import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;