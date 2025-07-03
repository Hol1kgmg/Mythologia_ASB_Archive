import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL || 'postgresql://mythologia_user:mythologia_pass@localhost:5432/mythologia_dev';

export default {
  // 全スキーマファイルを含める（ESM対応のため.js拡張子使用）
  schema: [
    './dist/db/schema/admin.js',        // 管理者システム
    './dist/db/schema/leaders.js',      // リーダー管理
    './dist/db/schema/tribe.js',        // 種族管理  
    './dist/db/schema/card.js',         // カード関連（card_sets, cards, categories）
    './dist/db/schema/rarities.js',     // レアリティ管理
    './dist/db/schema/card-types.js',   // カードタイプ管理
    './dist/db/schema/card-categories.js', // カード・カテゴリ中間テーブル
  ],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;