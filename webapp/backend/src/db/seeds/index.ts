/**
 * メインシードスクリプト
 * 
 * このスクリプトは、開発環境でのダミーデータ生成を管理します。
 * 各テーブル用のシード関数を呼び出し、順序を制御します。
 */

import { db } from '../client';
import { seedAdmins } from './admin-seeds';
import { logger } from '../../utils/logger';

// シード実行のオプション
export interface SeedOptions {
  // 既存データをクリアするか
  clearExisting?: boolean;
  // 生成するデータ量の設定
  counts?: {
    admins?: number;
    users?: number;
    cards?: number;
    decks?: number;
  };
  // 特定のテーブルのみシードするか
  tables?: string[];
}

/**
 * すべてのシードを実行
 */
export async function runAllSeeds(options: SeedOptions = {}) {
  const startTime = Date.now();
  logger.info('🌱 Starting seed process...');

  try {
    // デフォルトオプションの設定
    const opts: Required<SeedOptions> = {
      clearExisting: options.clearExisting ?? false,
      counts: {
        admins: options.counts?.admins ?? 5,
        users: options.counts?.users ?? 100,
        cards: options.counts?.cards ?? 500,
        decks: options.counts?.decks ?? 50,
      },
      tables: options.tables ?? ['admins', 'users', 'cards', 'decks'],
    };

    // 管理者データのシード
    if (opts.tables.includes('admins')) {
      logger.info('Seeding admins...');
      await seedAdmins(db, {
        clearExisting: opts.clearExisting,
        count: opts.counts.admins,
      });
    }

    // TODO: ユーザーデータのシード
    if (opts.tables.includes('users')) {
      logger.info('Seeding users... (not implemented yet)');
      // await seedUsers(db, { ... });
    }

    // TODO: カードデータのシード
    if (opts.tables.includes('cards')) {
      logger.info('Seeding cards... (not implemented yet)');
      // await seedCards(db, { ... });
    }

    // TODO: デッキデータのシード
    if (opts.tables.includes('decks')) {
      logger.info('Seeding decks... (not implemented yet)');
      // await seedDecks(db, { ... });
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Seed completed successfully in ${duration}ms`);
    
  } catch (error) {
    logger.error('❌ Seed failed:', error);
    throw error;
  }
}

/**
 * 特定のテーブルのデータをクリア
 */
export async function clearTable(tableName: string) {
  logger.info(`Clearing table: ${tableName}`);
  
  switch (tableName) {
    case 'admins':
      // 管理者テーブルのクリアは慎重に行う必要がある
      logger.warn('Admin table clearing is not implemented for safety');
      break;
    // TODO: 他のテーブルのクリア実装
    default:
      logger.warn(`Clear not implemented for table: ${tableName}`);
  }
}

// CLIから直接実行された場合
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const args = process.argv.slice(2);
  const options: SeedOptions = {};

  // 簡単なCLI引数パース
  if (args.includes('--clear')) {
    options.clearExisting = true;
  }
  
  if (args.includes('--admins-only')) {
    options.tables = ['admins'];
  }

  // カウントの指定例: --count-admins=10
  args.forEach(arg => {
    const match = arg.match(/--count-(\w+)=(\d+)/);
    if (match) {
      if (!options.counts) options.counts = {};
      options.counts[match[1] as keyof typeof options.counts] = parseInt(match[2], 10);
    }
  });

  runAllSeeds(options)
    .then(() => {
      logger.info('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed:', error);
      process.exit(1);
    });
}