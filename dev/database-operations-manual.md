# データベース操作マニュアル

このドキュメントでは、Dockerコンテナ内のPostgreSQLデータベースへの接続方法と、SQLを使った基本的なCRUD操作について説明します。

## 前提条件

```bash
# Docker環境が起動していることを確認
docker-compose up -d postgres redis

# サービス状態確認
docker-compose ps
```

## データベース接続方法

### 方法1: 対話モード（推奨）

```bash
# PostgreSQLコンテナに接続
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev
```

接続に成功すると、以下のようなプロンプトが表示されます：
```
mythologia_dev=#
```

### 方法2: 単発コマンド実行

```bash
# 一回限りのSQLコマンド実行
docker exec mythologia-postgres psql -U mythologia_user -d mythologia_dev -c "SELECT NOW();"
```

### 方法3: Web UI（Adminer）

```bash
# Adminerを起動
docker-compose up -d adminer

# ブラウザでアクセス
open http://localhost:8080
```

**接続情報:**
- Server: `postgres`
- Username: `mythologia_user`
- Password: `mythologia_pass`
- Database: `mythologia_dev`

## 基本的なpsqlコマンド

### データベース構造確認

```sql
-- データベース一覧
\l

-- テーブル一覧
\dt

-- 特定テーブルの構造確認
\d admins
\d admin_sessions
\d admin_activity_logs

-- インデックス一覧
\di

-- 列の詳細情報
\d+ admins

-- 現在の接続情報
\conninfo

-- ヘルプ
\h SELECT
\?

-- psql終了
\q
```

## マイグレーション確認

### マイグレーション履歴

```sql
-- マイグレーション履歴確認
SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;

-- 現在のスキーマ確認
SELECT schema_name FROM information_schema.schemata;
```

### テーブル作成確認

```sql
-- 全テーブル確認
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

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
```

## CRUD操作の例

### 1. SELECT（読み取り）

#### 基本的な読み取り

```sql
-- 全データ確認
SELECT * FROM admins;
SELECT * FROM admin_sessions;
SELECT * FROM admin_activity_logs;

-- 特定カラムのみ
SELECT id, username, email, role, is_active FROM admins;

-- 条件付きクエリ
SELECT * FROM admins WHERE is_active = true;
SELECT * FROM admin_sessions WHERE expires_at > NOW();
SELECT * FROM admin_activity_logs WHERE action = 'login';

-- レコード数確認
SELECT COUNT(*) FROM admins;
SELECT COUNT(*) FROM admin_sessions;
SELECT COUNT(*) FROM admin_activity_logs;
```

#### 結合クエリ

```sql
-- 管理者とセッション情報を結合
SELECT 
    a.username,
    a.email,
    s.token,
    s.expires_at,
    s.ip_address
FROM admins a
LEFT JOIN admin_sessions s ON a.id = s.admin_id;

-- 管理者と活動ログを結合
SELECT 
    a.username,
    al.action,
    al.target_type,
    al.created_at
FROM admins a
LEFT JOIN admin_activity_logs al ON a.id = al.admin_id
ORDER BY al.created_at DESC;
```

#### 集計クエリ

```sql
-- ロール別管理者数
SELECT role, COUNT(*) as count FROM admins GROUP BY role;

-- 管理者別のアクティビティ数
SELECT 
    a.username,
    COUNT(al.id) as activity_count
FROM admins a
LEFT JOIN admin_activity_logs al ON a.id = al.admin_id
GROUP BY a.id, a.username
ORDER BY activity_count DESC;
```

### 2. INSERT（作成）

#### 管理者作成

```sql
-- テスト管理者を作成
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
);

-- スーパー管理者を作成
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
    'super_admin', 
    'super@example.com', 
    'hashed_super_password', 
    'super_admin', 
    true, 
    true
);
```

#### セッション作成

```sql
-- 既存管理者のIDを確認
SELECT id, username FROM admins WHERE username = 'test_admin';

-- セッション作成（上記で取得したIDを使用）
INSERT INTO admin_sessions (
    id,
    admin_id,
    token,
    ip_address,
    user_agent,
    expires_at
) VALUES (
    gen_random_uuid(),
    '管理者のID', -- 実際のUUIDに置き換え
    'sample_session_token_' || extract(epoch from now()),
    '127.0.0.1',
    'Test User Agent',
    NOW() + INTERVAL '1 hour'
);
```

#### 活動ログ作成

```sql
-- ログイン活動を記録
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
    '管理者のID', -- 実際のUUIDに置き換え
    'login',
    'authentication',
    '{"method": "password", "success": true}',
    '127.0.0.1',
    'Test User Agent'
);

-- 管理者作成活動を記録
INSERT INTO admin_activity_logs (
    id,
    admin_id,
    action,
    target_type,
    target_id,
    details,
    ip_address
) VALUES (
    gen_random_uuid(),
    '作成者のID', -- 実際のUUIDに置き換え
    'create_admin',
    'admin',
    '作成された管理者のID', -- 実際のUUIDに置き換え
    '{"created_role": "admin", "username": "test_admin"}',
    '127.0.0.1'
);
```

### 3. UPDATE（更新）

#### 管理者情報更新

```sql
-- 最終ログイン時刻を更新
UPDATE admins 
SET last_login_at = NOW() 
WHERE username = 'test_admin';

-- 管理者を非アクティブに
UPDATE admins 
SET is_active = false 
WHERE username = 'test_admin';

-- パスワード更新
UPDATE admins 
SET password_hash = 'new_hashed_password',
    updated_at = NOW()
WHERE username = 'test_admin';

-- 権限更新
UPDATE admins 
SET permissions = '["read_users", "write_users"]'::json
WHERE username = 'test_admin';
```

#### セッション更新

```sql
-- セッション延長
UPDATE admin_sessions 
SET expires_at = NOW() + INTERVAL '2 hours' 
WHERE token = 'specific_session_token';

-- IPアドレス更新
UPDATE admin_sessions 
SET ip_address = '192.168.1.100' 
WHERE admin_id = '管理者のID';
```

### 4. DELETE（削除）

#### セッション削除

```sql
-- 期限切れセッション削除
DELETE FROM admin_sessions 
WHERE expires_at < NOW();

-- 特定管理者の全セッション削除
DELETE FROM admin_sessions 
WHERE admin_id = '管理者のID';

-- 特定セッション削除
DELETE FROM admin_sessions 
WHERE token = 'specific_session_token';
```

#### 古いログ削除

```sql
-- 30日以上古いログを削除
DELETE FROM admin_activity_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 特定管理者のログ削除
DELETE FROM admin_activity_logs 
WHERE admin_id = '管理者のID';
```

#### 管理者削除（注意）

```sql
-- ⚠️ 注意: 関連データも削除されます
-- まず関連セッションを削除
DELETE FROM admin_sessions WHERE admin_id = '管理者のID';

-- 関連活動ログを削除
DELETE FROM admin_activity_logs WHERE admin_id = '管理者のID';

-- 最後に管理者を削除
DELETE FROM admins WHERE id = '管理者のID';
```

## 便利なクエリ集

### システム監視

```sql
-- アクティブセッション数
SELECT COUNT(*) as active_sessions 
FROM admin_sessions 
WHERE expires_at > NOW();

-- 今日のログイン数
SELECT COUNT(*) as today_logins 
FROM admin_activity_logs 
WHERE action = 'login' 
  AND created_at >= CURRENT_DATE;

-- 管理者別最終ログイン
SELECT 
    username,
    last_login_at,
    CASE 
        WHEN last_login_at IS NULL THEN 'Never logged in'
        WHEN last_login_at < NOW() - INTERVAL '7 days' THEN 'Inactive (>7 days)'
        WHEN last_login_at < NOW() - INTERVAL '1 day' THEN 'Recently active'
        ELSE 'Active today'
    END as status
FROM admins
ORDER BY last_login_at DESC NULLS LAST;
```

### データベースメンテナンス

```sql
-- テーブルサイズ確認
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- インデックス使用状況
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 空きディスク容量確認
SELECT pg_size_pretty(pg_database_size('mythologia_dev')) as database_size;
```

## セキュリティ考慮事項

### パスワード管理

```sql
-- ⚠️ 本番環境では平文パスワードを絶対に保存しない
-- 常にハッシュ化されたパスワードを使用

-- 正しい例（アプリケーションでハッシュ化済み）
UPDATE admins 
SET password_hash = 'bcrypt_hashed_password_here'
WHERE id = '管理者のID';
```

### アクセス制御

```sql
-- 権限確認
SELECT 
    username,
    role,
    permissions,
    is_super_admin,
    is_active
FROM admins
WHERE is_active = true;

-- 権限更新例
UPDATE admins 
SET permissions = '["read_cards", "write_cards", "read_users"]'::json
WHERE username = 'specific_admin';
```

## トラブルシューティング

### 接続問題

```bash
# Docker容器状態確認
docker-compose ps

# PostgreSQL容器ログ確認
docker-compose logs postgres

# 容器再起動
docker-compose restart postgres

# データベース接続テスト
docker exec mythologia-postgres pg_isready -U mythologia_user -d mythologia_dev
```

### データ整合性確認

```sql
-- 外部キー制約違反確認
SELECT 
    conname,
    conrelid::regclass,
    confrelid::regclass
FROM pg_constraint 
WHERE contype = 'f' 
  AND connamespace = 'public'::regnamespace;

-- 孤児セッション確認（存在しない管理者IDを参照）
SELECT s.* 
FROM admin_sessions s
LEFT JOIN admins a ON s.admin_id = a.id
WHERE a.id IS NULL;

-- 孤児ログ確認
SELECT al.* 
FROM admin_activity_logs al
LEFT JOIN admins a ON al.admin_id = a.id
WHERE a.id IS NULL;
```

### パフォーマンス分析

```sql
-- スロークエリ分析（実行計画確認）
EXPLAIN ANALYZE 
SELECT * FROM admin_activity_logs 
WHERE created_at > NOW() - INTERVAL '1 day';

-- インデックス効果確認
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM admin_sessions 
WHERE admin_id = '特定のID' 
  AND expires_at > NOW();
```

## 注意事項

1. **本番環境では直接SQL実行を避ける**
   - アプリケーションのRepository層を経由する
   - マイグレーション以外でのスキーマ変更は避ける

2. **バックアップの重要性**
   - 重要な操作前にデータバックアップ
   - `pg_dump` を使用したデータエクスポート

3. **トランザクション使用**
   ```sql
   BEGIN;
   -- 複数の関連する操作
   UPDATE admins SET ... WHERE ...;
   INSERT INTO admin_activity_logs ...;
   COMMIT; -- または ROLLBACK;
   ```

4. **開発環境専用**
   - このマニュアルは開発環境での作業を想定
   - 本番環境では適切な権限管理とアクセス制御を実施

## 関連ドキュメント

- [database-local-setup.md](./database-local-setup.md) - データベース環境構築
- [backend-setup.md](./backend-setup.md) - バックエンド開発環境
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 開発ガイドライン