import type { Config } from 'drizzle-kit';
import 'dotenv/config';

// Node.js process型の明示的宣言
declare const process: NodeJS.Process;

export default {
  schema: './src/db/schema/admin.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://mythologia_user:mythologia_pass@localhost:5432/mythologia_dev',
  },
} satisfies Config;