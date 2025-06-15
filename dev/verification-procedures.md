# 動作確認手順マニュアル

このドキュメントでは、開発環境でのデータベース関連機能の動作確認手順を説明します。

## 前提条件

### 環境準備

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd Mythologia_AdmiralsShipBridge

# 2. ブランチ切り替え
git checkout feature/#035_admin-sessions-logs
git pull origin feature/#035_admin-sessions-logs

# 3. Docker環境起動
docker-compose up -d postgres redis

# 4. 依存関係インストール
cd webapp/backend
npm install

# 5. 環境変数設定
cp .env.example .env.local
# .env.localを編集して適切な値を設定
```

## Phase 1: 基本動作確認

### 1.1 TypeScript・ビルド確認

```bash
# TypeScript型チェック
npm run build

# 期待される結果: エラーなしでビルド完了
# ✅ TypeScript compilation successful
```

**確認ポイント:**
- インポートエラーがないこと
- 型定義が正しく解決されること
- 全ファイルがコンパイル可能であること

### 1.2 Docker環境確認

```bash
# サービス状態確認
docker-compose ps

# 期待される出力:
# mythologia-postgres    Up    5432/tcp
# mythologia-redis       Up    6379/tcp
```

```bash
# ログ確認（エラーがないことを確認）
docker-compose logs postgres redis
```

### 1.3 データベース接続確認

```bash
# 基本接続テスト
npm run db:test

# 期待される出力:
# 🔍 Testing Railway connection...
# ✅ Connected to: { current_database: 'mythologia_dev', version: 'PostgreSQL ...' }
# ✅ admins table exists
# 📊 admins table records: 0
# 🔒 Connection closed
```

## Phase 2: Drizzle ORM動作確認

### 2.1 スキーマ読み込み確認

```bash
# Drizzle Kitでスキーマ確認
npm run db:generate

# 期待される出力:
# 3 tables
# admin_activity_logs 9 columns 6 indexes 1 fks
# admin_sessions 7 columns 3 indexes 1 fks
# admins 12 columns 0 indexes 1 fks
# No schema changes, nothing to migrate 😴
```

**確認ポイント:**
- 3つのテーブルが認識されること
- 外部キー関係が正しく設定されていること
- インデックス数が適切であること

### 2.2 マイグレーション確認

```bash
# マイグレーション実行
npm run db:migrate

# 期待される出力:
# 🚀 Starting migration...
# ✅ Migration completed successfully!
```

### 2.3 スクリプト動作確認

```bash
# データベース接続スクリプト
npx dotenv -e .env.local -- npx tsx scripts/test-db-connection.ts

# 期待される出力:
# 🔍 Testing database connection...
# ✅ Database connection successful!
# 📊 Database info: [データベース情報]
# 📋 Existing tables: [テーブル一覧]
# 🔒 Connection closed
```

## Phase 3: テーブル構造確認

### 3.1 PostgreSQL直接接続

```bash
# PostgreSQLに接続
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev
```

### 3.2 テーブル存在確認

```sql
-- テーブル一覧確認
\dt

-- 期待される出力:
--              List of relations
-- Schema |        Name         | Type  |     Owner
----------+---------------------+-------+----------------
-- public | admin_activity_logs | table | mythologia_user
-- public | admin_sessions      | table | mythologia_user
-- public | admins              | table | mythologia_user
```

### 3.3 テーブル構造確認

```sql
-- adminsテーブル構造
\d admins

-- 確認ポイント:
-- - id (uuid, PK)
-- - username (varchar(50), unique)
-- - email (varchar(100), unique)
-- - password_hash (varchar(255))
-- - role (admin_role enum)
-- - permissions (json)
-- - is_active (boolean)
-- - is_super_admin (boolean)
-- - created_by (uuid, FK)
-- - last_login_at (timestamp)
-- - created_at (timestamp)
-- - updated_at (timestamp)
```

```sql
-- admin_sessionsテーブル構造
\d admin_sessions

-- 確認ポイント:
-- - id (uuid, PK)
-- - admin_id (uuid, FK to admins)
-- - token (varchar(255), unique)
-- - ip_address (varchar(45))
-- - user_agent (varchar(500))
-- - expires_at (timestamp)
-- - created_at (timestamp)
```

```sql
-- admin_activity_logsテーブル構造
\d admin_activity_logs

-- 確認ポイント:
-- - id (uuid, PK)
-- - admin_id (uuid, FK to admins)
-- - action (varchar(100))
-- - target_type (varchar(50))
-- - target_id (varchar(36))
-- - details (json)
-- - ip_address (varchar(45))
-- - user_agent (varchar(500))
-- - created_at (timestamp)
```

### 3.4 インデックス確認

```sql
-- インデックス一覧
\di

-- 期待されるインデックス:
-- admin_sessions_admin_id_idx
-- admin_sessions_expires_at_idx
-- admin_sessions_admin_expires_idx
-- admin_activity_logs_admin_id_idx
-- admin_activity_logs_created_at_idx
-- admin_activity_logs_action_idx
```

### 3.5 外部キー制約確認

```sql
-- 外部キー制約確認
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

-- 期待される制約:
-- admin_sessions_admin_id_admins_id_fk
-- admin_activity_logs_admin_id_admins_id_fk
-- admins_created_by_admins_id_fk
```

## Phase 4: Repository動作確認

### 4.1 インポート確認

```bash
# Repositoryクラスのインポート確認
npx tsx -e "
import { AdminSessionRepository } from './src/infrastructure/database/AdminSessionRepository.js';
import { AdminActivityLogRepository } from './src/infrastructure/database/AdminActivityLogRepository.js';
import { AdminRepository } from './src/infrastructure/database/AdminRepository.js';
console.log('✅ All repositories import successfully');
"

# 期待される出力: ✅ All repositories import successfully
```

### 4.2 型定義確認

```bash
# 型定義の確認
npx tsx -e "
import { admins, adminSessions, adminActivityLogs } from './src/db/schema/index.js';
import type { Admin, NewAdmin, AdminSession, NewAdminSession, AdminActivityLog, NewAdminActivityLog } from './src/db/schema/index.js';
console.log('✅ All types import successfully');
console.log('Schema objects available:', { admins: !!admins, adminSessions: !!adminSessions, adminActivityLogs: !!adminActivityLogs });
"
```

## Phase 5: 実データでの動作確認

### 5.1 サンプルデータ作成

```sql
-- テスト管理者作成
INSERT INTO admins (
    id, 
    username, 
    email, 
    password_hash, 
    role, 
    is_active, 
    is_super_admin
) VALUES (
    gen_random_uuid(),
    'test_admin', 
    'test@example.com', 
    'hashed_password_example', 
    'admin', 
    true, 
    false
) RETURNING id, username, email;
```

### 5.2 関連データ作成

```sql
-- 作成した管理者のIDを取得
SELECT id FROM admins WHERE username = 'test_admin';

-- セッション作成（上記IDを使用）
INSERT INTO admin_sessions (
    id,
    admin_id,
    token,
    ip_address,
    user_agent,
    expires_at
) VALUES (
    gen_random_uuid(),
    '取得したID',
    'test_token_' || extract(epoch from now()),
    '127.0.0.1',
    'Test User Agent',
    NOW() + INTERVAL '1 hour'
) RETURNING id, token, expires_at;

-- 活動ログ作成
INSERT INTO admin_activity_logs (
    id,
    admin_id,
    action,
    target_type,
    details,
    ip_address,
    user_agent
) VALUES (
    gen_random_uuid(),
    '取得したID',
    'login',
    'authentication',
    '{"method": "password", "success": true}',
    '127.0.0.1',
    'Test User Agent'
) RETURNING id, action, created_at;
```

### 5.3 データ整合性確認

```sql
-- 管理者、セッション、ログの関連確認
SELECT 
    a.username,
    s.token,
    s.expires_at,
    al.action,
    al.created_at
FROM admins a
LEFT JOIN admin_sessions s ON a.id = s.admin_id
LEFT JOIN admin_activity_logs al ON a.id = al.admin_id
WHERE a.username = 'test_admin';
```

### 5.4 制約動作確認

```sql
-- 外部キー制約テスト（エラーになることを確認）
INSERT INTO admin_sessions (
    id, admin_id, token, expires_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- 存在しないID
    'invalid_test',
    NOW() + INTERVAL '1 hour'
);

-- 期待されるエラー: 外部キー制約違反
```

## Phase 6: パフォーマンス確認

### 6.1 インデックス効果確認

```sql
-- インデックス使用確認
EXPLAIN ANALYZE 
SELECT * FROM admin_sessions 
WHERE admin_id = '取得したID' 
  AND expires_at > NOW();

-- Index Scanが使用されることを確認
```

### 6.2 クエリ最適化確認

```sql
-- 複雑なクエリのパフォーマンス
EXPLAIN ANALYZE 
SELECT 
    a.username,
    COUNT(s.id) as active_sessions,
    COUNT(al.id) as recent_activities
FROM admins a
LEFT JOIN admin_sessions s ON a.id = s.admin_id AND s.expires_at > NOW()
LEFT JOIN admin_activity_logs al ON a.id = al.admin_id AND al.created_at > NOW() - INTERVAL '1 day'
GROUP BY a.id, a.username;
```

## Phase 7: 管理UI確認

### 7.1 Adminer接続確認

```bash
# Adminer起動
docker-compose up -d adminer

# ブラウザでアクセス
open http://localhost:8080
```

**確認手順:**
1. ログイン画面で接続情報入力
2. テーブル一覧表示確認
3. テーブル構造表示確認
4. サンプルデータ表示確認

### 7.2 RedisInsight確認

```bash
# RedisInsight起動
docker-compose up -d redis-insight

# ブラウザでアクセス
open http://localhost:8001
```

## トラブルシューティング

### 一般的な問題

1. **Docker容器が起動しない**
   ```bash
   docker-compose down -v
   docker-compose up -d postgres redis
   ```

2. **データベース接続エラー**
   ```bash
   # 接続確認
   docker exec mythologia-postgres pg_isready -U mythologia_user -d mythologia_dev
   
   # 環境変数確認
   cat .env.local | grep DATABASE_URL
   ```

3. **マイグレーションエラー**
   ```bash
   # マイグレーション履歴確認
   docker exec mythologia-postgres psql -U mythologia_user -d mythologia_dev -c "SELECT * FROM drizzle.__drizzle_migrations;"
   
   # 手動リセット（開発環境のみ）
   npx dotenv -e .env.local -- npx tsx scripts/reset-db.ts
   ```

4. **TypeScriptエラー**
   ```bash
   # キャッシュクリア
   rm -rf node_modules/.cache
   npm run build
   ```

### ログ確認

```bash
# Docker容器ログ
docker-compose logs postgres
docker-compose logs redis

# アプリケーションログ
npm run dev # 別ターミナルで実行してログ確認
```

## チェックリスト

### 基本動作確認
- [ ] Docker環境が正常に起動する
- [ ] TypeScriptビルドがエラーなしで完了する
- [ ] データベース接続テストが成功する
- [ ] Drizzle Kit がスキーマを正しく認識する

### スキーマ確認
- [ ] 3つのテーブルが作成される
- [ ] 適切なインデックスが作成される
- [ ] 外部キー制約が正しく設定される
- [ ] ENUMタイプが正しく作成される

### 機能確認
- [ ] マイグレーションが正常に実行される
- [ ] 全Repositoryクラスがエラーなしでimportできる
- [ ] データベーススクリプトが正常に動作する
- [ ] 管理UIからアクセスできる

### データ操作確認
- [ ] CRUD操作が正常に動作する
- [ ] 外部キー制約が適切に機能する
- [ ] インデックスが効果的に使用される
- [ ] トランザクションが正しく動作する

## 関連ドキュメント

- [database-operations-manual.md](./database-operations-manual.md) - SQL操作マニュアル
- [database-local-setup.md](./database-local-setup.md) - 環境構築
- [../CONTRIBUTING.md](../CONTRIBUTING.md) - 開発ガイドライン