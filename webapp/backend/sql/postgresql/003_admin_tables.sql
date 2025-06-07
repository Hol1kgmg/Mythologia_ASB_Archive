-- 管理者テーブル作成
-- マイルストーン1: システム管理者認証基盤

-- 管理者アカウントテーブル
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

-- 管理者セッションテーブル
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

-- 管理者アクティビティログテーブル
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

-- 更新時刻自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE admins IS '管理者アカウント情報';
COMMENT ON TABLE admin_sessions IS '管理者セッション管理';
COMMENT ON TABLE admin_activity_logs IS '管理者アクティビティログ';

COMMENT ON COLUMN admins.id IS '管理者ID（UUID）';
COMMENT ON COLUMN admins.username IS 'ユーザー名（一意）';
COMMENT ON COLUMN admins.email IS 'メールアドレス（一意）';
COMMENT ON COLUMN admins.password_hash IS 'ハッシュ化されたパスワード';
COMMENT ON COLUMN admins.role IS '管理者ロール（admin/super_admin）';
COMMENT ON COLUMN admins.permissions IS '権限リスト（JSON配列）';
COMMENT ON COLUMN admins.is_super_admin IS 'スーパー管理者フラグ';
COMMENT ON COLUMN admins.created_by IS '作成者管理者ID';