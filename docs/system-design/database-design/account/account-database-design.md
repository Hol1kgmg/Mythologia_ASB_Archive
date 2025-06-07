# アカウント管理システム - データベース設計

## 概要

神託のメソロギア（Mythologia）非公式Webアプリケーションの管理者アカウント管理システムのデータベース設計です。
PostgreSQL（Vercel環境）とD1/SQLite（Cloudflare環境）の両プラットフォームに対応しています。

## テーブル構成

### 1. admins（管理者アカウント）

管理者の基本情報と権限を管理するメインテーブル。

#### PostgreSQL版
```sql
CREATE TABLE admins (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSON DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(36) REFERENCES admins(id) ON DELETE SET NULL,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### D1/SQLite版
```sql
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT DEFAULT '[]', -- JSON as TEXT
  is_active INTEGER DEFAULT 1, -- BOOLEAN as INTEGER
  is_super_admin INTEGER DEFAULT 0,
  created_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
  last_login_at INTEGER, -- TIMESTAMP as INTEGER (unix timestamp)
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### カラム仕様

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | VARCHAR(36)/TEXT | PRIMARY KEY | 管理者ID（UUID） |
| username | VARCHAR(50)/TEXT | UNIQUE NOT NULL | ユーザー名（3-50文字、英数字・ハイフン・アンダースコア） |
| email | VARCHAR(100)/TEXT | UNIQUE NOT NULL | メールアドレス（RFC準拠） |
| password_hash | VARCHAR(255)/TEXT | NOT NULL | bcryptハッシュ化パスワード |
| role | VARCHAR(20)/TEXT | CHECK制約 | 管理者ロール（admin/super_admin） |
| permissions | JSON/TEXT | DEFAULT '[]' | 権限配列（JSON形式） |
| is_active | BOOLEAN/INTEGER | DEFAULT TRUE/1 | アカウント有効フラグ |
| is_super_admin | BOOLEAN/INTEGER | DEFAULT FALSE/0 | スーパー管理者フラグ |
| created_by | VARCHAR(36)/TEXT | 外部キー | 作成者管理者ID |
| last_login_at | TIMESTAMP/INTEGER | NULL可 | 最終ログイン日時 |
| created_at | TIMESTAMP/INTEGER | DEFAULT現在時刻 | 作成日時 |
| updated_at | TIMESTAMP/INTEGER | DEFAULT現在時刻 | 更新日時 |

### 2. admin_sessions（管理者セッション）

JWTリフレッシュトークンとセッション情報を管理。

#### PostgreSQL版
```sql
CREATE TABLE admin_sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id VARCHAR(36) NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### D1/SQLite版
```sql
CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL, -- TIMESTAMP as INTEGER
  ip_address TEXT,
  user_agent TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### カラム仕様

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | VARCHAR(36)/TEXT | PRIMARY KEY | セッションID（UUID） |
| admin_id | VARCHAR(36)/TEXT | 外部キー NOT NULL | 管理者ID |
| refresh_token | VARCHAR(255)/TEXT | UNIQUE NOT NULL | JWTリフレッシュトークン |
| expires_at | TIMESTAMP/INTEGER | NOT NULL | トークン有効期限 |
| ip_address | VARCHAR(45)/TEXT | NULL可 | ログイン元IPアドレス（IPv4/IPv6対応） |
| user_agent | TEXT | NULL可 | ユーザーエージェント文字列 |
| is_active | BOOLEAN/INTEGER | DEFAULT TRUE/1 | セッション有効フラグ |
| created_at | TIMESTAMP/INTEGER | DEFAULT現在時刻 | セッション作成日時 |

### 3. admin_activity_logs（管理者アクティビティログ）

管理者の操作履歴を記録する監査ログテーブル。

#### PostgreSQL版
```sql
CREATE TABLE admin_activity_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id VARCHAR(36) NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### D1/SQLite版
```sql
CREATE TABLE admin_activity_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT, -- JSON as TEXT
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### カラム仕様

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | VARCHAR(36)/TEXT | PRIMARY KEY | ログID（UUID） |
| admin_id | VARCHAR(36)/TEXT | 外部キー NOT NULL | 実行者管理者ID |
| action | VARCHAR(100)/TEXT | NOT NULL | 実行アクション（login, create_admin, update_cardなど） |
| target_type | VARCHAR(50)/TEXT | NULL可 | 操作対象タイプ（admin, card, userなど） |
| target_id | VARCHAR(36)/TEXT | NULL可 | 操作対象ID |
| details | JSON/TEXT | NULL可 | 操作詳細情報（JSON形式） |
| ip_address | VARCHAR(45)/TEXT | NULL可 | 操作元IPアドレス |
| user_agent | TEXT | NULL可 | ユーザーエージェント文字列 |
| created_at | TIMESTAMP/INTEGER | DEFAULT現在時刻 | ログ記録日時 |

## インデックス設計

### パフォーマンス最適化のためのインデックス

```sql
-- adminsテーブル
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_is_active ON admins(is_active);

-- admin_sessionsテーブル
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_refresh_token ON admin_sessions(refresh_token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- admin_activity_logsテーブル
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
```

### インデックス設計方針

1. **認証関連**: username, email, refresh_tokenの高速検索
2. **セッション管理**: admin_id, expires_atでの効率的なクリーンアップ
3. **監査ログ**: admin_id, action, created_atでの履歴検索最適化
4. **アクティブ状態**: is_activeでの有効アカウント絞り込み

## 制約・外部キー設計

### 参照整合性

```sql
-- 自己参照（作成者管理者）
created_by → admins(id) ON DELETE SET NULL

-- セッション管理
admin_sessions.admin_id → admins(id) ON DELETE CASCADE

-- アクティビティログ
admin_activity_logs.admin_id → admins(id) ON DELETE CASCADE
```

### CHECK制約

```sql
-- 管理者ロール制限
role CHECK (role IN ('admin', 'super_admin'))
```

### UNIQUE制約

```sql
-- 重複防止
username UNIQUE
email UNIQUE
refresh_token UNIQUE
```

## トリガー設計

### 更新時刻自動更新（PostgreSQL）

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at 
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 更新時刻自動更新（D1/SQLite）

```sql
CREATE TRIGGER update_admins_updated_at 
  AFTER UPDATE ON admins
  FOR EACH ROW
  BEGIN
    UPDATE admins SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
  END;
```

## プラットフォーム差異対応

### データ型マッピング

| 概念 | PostgreSQL | D1/SQLite | 説明 |
|------|------------|-----------|------|
| UUID | VARCHAR(36) | TEXT | UUID文字列格納 |
| JSON | JSON | TEXT | JSON文字列として格納 |
| BOOLEAN | BOOLEAN | INTEGER | 0/1での真偽値表現 |
| TIMESTAMP | TIMESTAMP | INTEGER | Unixタイムスタンプ |

### 自動生成ID

- **PostgreSQL**: `gen_random_uuid()::text`
- **D1/SQLite**: アプリケーション側でUUID生成

### 時刻関数

- **PostgreSQL**: `CURRENT_TIMESTAMP`
- **D1/SQLite**: `strftime('%s', 'now')`

## セキュリティ考慮事項

### パスワード管理
- bcryptによるハッシュ化（コスト係数12）
- 平文パスワードはデータベースに保存しない
- パスワード強度要件をアプリケーション層で実装

### セッション管理
- JWTリフレッシュトークンの一意性保証
- 有効期限による自動無効化
- セッション無効化（ログアウト）の即座反映

### 監査ログ
- 全管理者操作の記録
- IP/User-Agent情報の保存
- ログの改ざん防止（INSERT ONLYの運用）

### 権限管理
- JSON形式での柔軟な権限設定
- スーパー管理者フラグによる特権管理
- 権限エスカレーション防止

## 運用考慮事項

### データ保持期間
- **admin_sessions**: 30日間（自動クリーンアップ）
- **admin_activity_logs**: 1年間（法的要件に応じて調整）

### バックアップ戦略
- 管理者アカウント: 日次バックアップ必須
- セッション情報: リアルタイム同期
- アクティビティログ: 長期保存アーカイブ

### パフォーマンス監視
- セッションテーブルサイズ監視
- ログテーブル増加率監視
- インデックス効率性定期確認

## マイグレーション戦略

### 実行順序
1. `003_admin_tables.sql` - テーブル・インデックス・トリガー作成
2. `004_admin_initial_data.sql` - 初期管理者アカウント作成

### ロールバック対応
```sql
-- テーブル削除（緊急時）
DROP TABLE admin_activity_logs;
DROP TABLE admin_sessions;
DROP TABLE admins;
```

### 本番適用前チェックリスト
- [ ] スキーマ構文検証
- [ ] インデックス効果測定
- [ ] 制約・トリガー動作確認
- [ ] プラットフォーム間動作統一性確認