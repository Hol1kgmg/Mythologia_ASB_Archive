/**
 * データベース全データ削除スクリプト
 *
 * 開発環境での完全なデータリセット用
 * ⚠️ 注意: このスクリプトは全データを削除します
 */

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { logger } from '../../utils/logger.js';
import { adminActivityLogs, adminSessions, admins } from '../schema/admin.js';

interface ClearOptions {
  // 確認スキップ（自動化用）
  force?: boolean;
  // 特定のテーブルのみクリア
  tables?: string[];
  // バックアップ作成
  createBackup?: boolean;
}

/**
 * 全データ削除の実行
 */
export async function clearAllData(
  db: PostgresJsDatabase<any>,
  options: ClearOptions = {}
): Promise<void> {
  const { force = false, tables = [], createBackup = false } = options;

  try {
    // 本番・ステージング環境での実行制限
    checkEnvironmentRestrictions();

    // 安全確認
    if (!force && process.env.NODE_ENV === 'production') {
      throw new Error('本番環境での全削除は禁止されています。--force オプションが必要です。');
    }

    if (!force) {
      logger.warn('⚠️  警告: 全データを削除しようとしています');
      logger.warn('⚠️  この操作は元に戻せません');
      logger.warn('⚠️  続行するには --force オプションを指定してください');
      return;
    }

    // バックアップ作成（オプション）
    if (createBackup) {
      await createDataBackup(db);
    }

    logger.info('🗑️  データ削除を開始します...');

    // 削除するテーブルの決定
    const allTables = ['admin_activity_logs', 'admin_sessions', 'admins'];
    const tablesToClear = tables.length > 0 ? tables : allTables;

    // 外部キー制約を考慮した削除順序
    const deletionOrder = [
      { name: 'admin_activity_logs', table: adminActivityLogs },
      { name: 'admin_sessions', table: adminSessions },
      { name: 'admins', table: admins },
    ];

    let totalDeleted = 0;

    for (const { name, table } of deletionOrder) {
      if (!tablesToClear.includes(name)) {
        logger.info(`Skipping ${name} (not in specified tables)`);
        continue;
      }

      try {
        // データ数を事前確認
        const countResult = await db.select().from(table);
        const recordCount = countResult.length;

        if (recordCount === 0) {
          logger.info(`${name}: データなし (0件)`);
          continue;
        }

        // データ削除実行
        await db.delete(table);
        totalDeleted += recordCount;

        logger.info(`${name}: ${recordCount}件削除`);
      } catch (error) {
        logger.error(`${name} の削除に失敗:`, error);
        throw error;
      }
    }

    // シーケンスのリセット（ID自動採番のリセット）
    await resetSequences(db, tablesToClear);

    logger.info(`✅ データ削除完了: 合計 ${totalDeleted}件削除`);

    if (createBackup) {
      logger.info('📁 バックアップが作成されました');
    }
  } catch (error) {
    logger.error('❌ データ削除に失敗:', error);
    throw error;
  }
}

/**
 * 特定のテーブルのみクリア
 */
export async function clearTable(
  db: PostgresJsDatabase<any>,
  tableName: string,
  force: boolean = false
): Promise<void> {
  // 本番・ステージング環境での実行制限
  checkEnvironmentRestrictions();

  logger.info(`🗑️  ${tableName} テーブルをクリアします...`);

  if (!force) {
    logger.warn('⚠️  --force オプションが必要です');
    return;
  }

  try {
    switch (tableName) {
      case 'admins':
        await db.delete(admins);
        logger.info('✅ admins テーブルをクリアしました');
        break;
      case 'admin_sessions':
        await db.delete(adminSessions);
        logger.info('✅ admin_sessions テーブルをクリアしました');
        break;
      case 'admin_activity_logs':
        await db.delete(adminActivityLogs);
        logger.info('✅ admin_activity_logs テーブルをクリアしました');
        break;
      default:
        throw new Error(`未対応のテーブル: ${tableName}`);
    }
  } catch (error) {
    logger.error(`❌ ${tableName} のクリアに失敗:`, error);
    throw error;
  }
}

/**
 * シーケンスのリセット（ID自動採番のリセット）
 */
async function resetSequences(db: PostgresJsDatabase<any>, tables: string[]): Promise<void> {
  logger.info('🔄 ID採番シーケンスをリセット中...');

  // PostgreSQLのシーケンスリセットクエリ
  const sequenceResets: string[] = [];

  if (tables.includes('admins')) {
    // UUIDの場合はシーケンスリセット不要
    logger.info('admins: UUID主キーのためシーケンスリセット不要');
  }

  // 将来的に他のテーブルでINTEGER主キーを使用する場合
  // if (tables.includes('future_table')) {
  //   sequenceResets.push("SELECT setval('future_table_id_seq', 1, false)");
  // }

  for (const resetQuery of sequenceResets) {
    try {
      await db.execute(resetQuery as any);
      logger.debug(`Sequence reset: ${resetQuery}`);
    } catch (error) {
      logger.warn(`Sequence reset failed: ${resetQuery}`, error);
    }
  }
}

/**
 * データバックアップの作成
 */
async function createDataBackup(db: PostgresJsDatabase<any>): Promise<void> {
  logger.info('📁 データバックアップを作成中...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupData: any = {};

  try {
    // 各テーブルのデータを取得
    backupData.admins = await db.select().from(admins);
    backupData.adminSessions = await db.select().from(adminSessions);
    backupData.adminActivityLogs = await db.select().from(adminActivityLogs);
    backupData.timestamp = timestamp;
    backupData.totalRecords = Object.values(backupData)
      .filter(Array.isArray)
      .reduce((sum, arr: any[]) => sum + arr.length, 0);

    // バックアップファイルのパス
    const backupPath = `./backups/backup_${timestamp}.json`;

    // バックアップディレクトリ作成
    const fs = await import('node:fs');
    const path = await import('node:path');

    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // ファイル書き込み
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    logger.info(`✅ バックアップ作成完了: ${backupPath}`);
    logger.info(`📊 バックアップレコード数: ${backupData.totalRecords}件`);
  } catch (error) {
    logger.error('❌ バックアップ作成に失敗:', error);
    throw error;
  }
}

// CLIから直接実行された場合
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const { db } = await import('../client');
  const args = process.argv.slice(2);

  const options: ClearOptions = {
    force: args.includes('--force'),
    createBackup: args.includes('--backup'),
  };

  // 特定テーブル指定
  const tableArg = args.find((arg) => arg.startsWith('--table='));
  if (tableArg) {
    const tableName = tableArg.split('=')[1];
    await clearTable(db, tableName, options.force);
  } else {
    // 全データクリア
    await clearAllData(db, options);
  }

  process.exit(0);
}

/**
 * 環境制限チェック（クリア実行制限）
 */
function checkEnvironmentRestrictions(): void {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    logger.error(`❌ ${nodeEnv}環境でのデータクリア実行は禁止されています`);
    logger.error('💡 データクリア機能はローカル開発環境専用です');
    logger.error('🔒 本番環境でのデータ削除は管理者が手動で行ってください');
    logger.error('🏠 ローカル環境でのみ実行してください:');
    logger.error('   npm run db:clear:docker -- --force');

    throw new Error(
      `CLEAR_BLOCKED_IN_${nodeEnv.toUpperCase()}: ${nodeEnv}環境でのデータクリア実行は禁止されています`
    );
  }
}
