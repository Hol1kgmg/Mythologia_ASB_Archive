# データベースクリア機能ガイド

## 概要

このドキュメントは、開発環境でのデータベース全削除機能の使用方法を説明します。

⚠️ **重要**: この機能は全データを削除します。使用前に必ずデータの重要性を確認してください。

## 基本的な使用方法

### 全データ削除

```bash
# 警告メッセージを表示（実際は削除されない）
npm run db:clear:docker

# 強制実行（実際に削除される）
npm run db:clear:docker -- --force

# バックアップ付きで削除
npm run db:clear:docker -- --force --backup
```

### 特定のテーブルのみ削除

```bash
# 管理者テーブルのみクリア
npm run db:clear:docker -- --force --table=admins

# セッションテーブルのみクリア
npm run db:clear:docker -- --force --table=admin_sessions

# アクティビティログのみクリア
npm run db:clear:docker -- --force --table=admin_activity_logs
```

## オプション

### `--force`
- **必須**: 実際に削除を実行するためのフラグ
- このオプションなしでは警告メッセージのみ表示

### `--backup`
- **任意**: 削除前にJSONファイルでバックアップを作成
- バックアップは `./backups/backup_YYYY-MM-DDTHH-mm-ss.json` に保存

### `--table=テーブル名`
- **任意**: 特定のテーブルのみ削除
- 対応テーブル: `admins`, `admin_sessions`, `admin_activity_logs`

## 安全機能

### 1. 本番環境保護
```bash
# 本番環境では追加確認が必要
NODE_ENV=production npm run db:clear -- --force
# エラー: 本番環境での全削除は禁止されています
```

### 2. 削除順序制御
外部キー制約を考慮した安全な削除順序：
1. `admin_activity_logs` (依存テーブル)
2. `admin_sessions` (依存テーブル) 
3. `admins` (親テーブル)

### 3. バックアップ機能
```bash
# 自動バックアップ付き削除
npm run db:clear:docker -- --force --backup
```

バックアップファイル例：
```json
{
  "admins": [...],
  "adminSessions": [...], 
  "adminActivityLogs": [...],
  "timestamp": "2025-06-17T13-45-30-123Z",
  "totalRecords": 25
}
```

## 実行例

### 開発環境リセット
```bash
# 1. バックアップ付きで全削除
npm run db:clear:docker -- --force --backup

# 2. 新しいシードデータを生成
npm run db:seed:docker -- --admins-only --count-admins=5
```

### 特定テーブルのみリセット
```bash
# 管理者データのみクリア
npm run db:clear:docker -- --force --table=admins

# 新しい管理者データを生成
npm run db:seed:docker -- --admins-only --count-admins=3
```

## ログ出力例

### 成功時
```
[INFO] 🗑️  データ削除を開始します...
[INFO] 📁 データバックアップを作成中...
[INFO] ✅ バックアップ作成完了: ./backups/backup_2025-06-17T13-45-30-123Z.json
[INFO] 📊 バックアップレコード数: 25件
[INFO] admin_activity_logs: 15件削除
[INFO] admin_sessions: 5件削除
[INFO] admins: 5件削除
[INFO] 🔄 ID採番シーケンスをリセット中...
[INFO] ✅ データ削除完了: 合計 25件削除
[INFO] 📁 バックアップが作成されました
```

### 警告時（--forceなし）
```
[WARN] ⚠️  警告: 全データを削除しようとしています
[WARN] ⚠️  この操作は元に戻せません
[WARN] ⚠️  続行するには --force オプションを指定してください
```

## トラブルシューティング

### バックアップディレクトリがない
```bash
# 手動でディレクトリ作成
mkdir -p webapp/backend/backups
```

### 外部キー制約エラー
削除スクリプトは依存関係を考慮した順序で実行しますが、エラーが発生した場合：

```bash
# PostgreSQLに直接接続して手動削除
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev

-- 外部キー制約を一時的に無効化
SET session_replication_role = replica;
DELETE FROM admin_activity_logs;
DELETE FROM admin_sessions;  
DELETE FROM admins;
SET session_replication_role = DEFAULT;
```

### 権限エラー
```bash
# Docker コンテナの権限確認
docker-compose ps

# データベース接続確認
npm run db:test:docker
```

## 注意事項

1. **本番環境での使用禁止**
   - 本番環境では `--force` でも追加確認が必要

2. **バックアップの重要性**
   - 重要なデータがある場合は必ず `--backup` オプションを使用

3. **チーム開発での配慮**
   - 共有開発環境での実行前にチームメンバーに確認

4. **復旧方法**
   - バックアップからの復旧機能は別途実装が必要
   - 現在はシードスクリプトでの再構築を推奨

---

⚠️ **免責事項**: このツールは開発環境での使用を前提としています。データ損失のリスクを理解した上でご使用ください。