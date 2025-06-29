import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL || 'postgresql://mythologia_user:mythologia_pass@localhost:5432/mythologia_dev';

export default {
  // 全スキーマファイルを含める
  schema: [
    './src/db/schema/admin.ts',        // 管理者システム
    './src/db/schema/leaders.ts',      // リーダー管理
    './src/db/schema/tribe.ts',        // 種族管理  
    './src/db/schema/card.ts',         // カード関連（card_sets, cards, categories）
    './src/db/schema/rarities.ts',     // レアリティ管理
    './src/db/schema/card-types.ts',   // カードタイプ管理
    './src/db/schema/card-categories.ts', // カード・カテゴリ中間テーブル
  ],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;