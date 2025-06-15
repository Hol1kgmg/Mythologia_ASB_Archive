import type { Config } from 'drizzle-kit';
import 'dotenv/config';

// Node.js process型の明示的宣言
declare const process: NodeJS.Process;

const config = {
  // 現在はadmin.tsのみ
  // 将来的にスキーマファイルを追加する際は配列形式で指定:
  // schema: ['./src/db/schema/admin.ts', './src/db/schema/cards.ts', './src/db/schema/users.ts']
  schema: './src/db/schema/admin.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://mythologia_user:mythologia_pass@localhost:5432/mythologia_dev',
  },
} satisfies Config;

module.exports = config;