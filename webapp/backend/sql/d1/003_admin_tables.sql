-- 管理者テーブル作成（D1/SQLite対応）
-- マイルストーン1: システム管理者認証基盤

-- 管理者アカウントテーブル
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT DEFAULT '[]', -- JSON as TEXT in SQLite
  is_active INTEGER DEFAULT 1, -- BOOLEAN as INTEGER in SQLite
  is_super_admin INTEGER DEFAULT 0,
  created_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
  last_login_at INTEGER, -- TIMESTAMP as INTEGER (unix timestamp)
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 管理者セッションテーブル
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

-- 管理者アクティビティログテーブル
CREATE TABLE admin_activity_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT, -- JSON as TEXT in SQLite
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- インデックス作成
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_is_active ON admins(is_active);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_refresh_token ON admin_sessions(refresh_token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- 更新時刻自動更新トリガー（SQLite対応）
CREATE TRIGGER update_admins_updated_at 
  AFTER UPDATE ON admins
  FOR EACH ROW
  BEGIN
    UPDATE admins SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
  END;