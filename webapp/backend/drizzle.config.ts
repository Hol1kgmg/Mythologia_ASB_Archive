import type { Config } from 'drizzle-kit';

export default {
  // 現在はadmin.tsのみ
  // 将来的にスキーマファイルを追加する際は配列形式で指定:
  // schema: ['./src/db/schema/admin.ts', './src/db/schema/cards.ts', './src/db/schema/users.ts']
  schema: './src/db/schema/admin.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;