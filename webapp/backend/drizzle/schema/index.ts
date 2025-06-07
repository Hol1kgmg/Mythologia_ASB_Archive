/**
 * Drizzle スキーマ統合エクスポート
 */

// 管理者関連スキーマ
export {
  // PostgreSQL テーブル
  adminsTablePg,
  adminSessionsTablePg,
  adminActivityLogsTablePg,
  
  // SQLite テーブル
  adminsTableSqlite,
  adminSessionsTableSqlite,
  adminActivityLogsTableSqlite,
  
  // リレーション
  adminsRelationsPg,
  adminSessionsRelationsPg,
  adminActivityLogsRelationsPg,
  adminsRelationsSqlite,
  adminSessionsRelationsSqlite,
  adminActivityLogsRelationsSqlite,
  
  // 型定義
  type AdminSelectPg,
  type AdminInsertPg,
  type AdminSessionSelectPg,
  type AdminSessionInsertPg,
  type AdminActivityLogSelectPg,
  type AdminActivityLogInsertPg,
  type AdminSelectSqlite,
  type AdminInsertSqlite,
  type AdminSessionSelectSqlite,
  type AdminSessionInsertSqlite,
  type AdminActivityLogSelectSqlite,
  type AdminActivityLogInsertSqlite
} from './admin';

// 将来のスキーマ（カード、ユーザーなど）
// export * from './card';
// export * from './user';