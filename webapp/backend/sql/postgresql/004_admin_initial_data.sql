-- 初期管理者アカウントデータ
-- マイルストーン1: システム管理者認証基盤

-- 初期スーパー管理者アカウント作成
-- パスワード: SuperAdmin123! (本番環境では変更必須)
-- ハッシュ値は実際のアプリケーションで生成される
INSERT INTO admins (
  id,
  username,
  email,
  password_hash,
  role,
  permissions,
  is_active,
  is_super_admin,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'superadmin',
  'superadmin@mythologia.local',
  '$2b$12$placeholder.hash.value.will.be.generated.by.app', -- 実際のハッシュは後で更新
  'super_admin',
  '[]'::json,
  true,
  true,
  null, -- 自己作成
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- 初期管理者アカウント作成（カード管理権限付き）
INSERT INTO admins (
  id,
  username,
  email,
  password_hash,
  role,
  permissions,
  is_active,
  is_super_admin,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'cardadmin',
  'cardadmin@mythologia.local',
  '$2b$12$placeholder.hash.value.will.be.generated.by.app',
  'admin',
  '[
    {
      "resource": "cards",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "resource": "system",
      "actions": ["read"]
    }
  ]'::json,
  true,
  false,
  (SELECT id FROM admins WHERE username = 'superadmin' LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- 読み取り専用管理者アカウント作成
INSERT INTO admins (
  id,
  username,
  email,
  password_hash,
  role,
  permissions,
  is_active,
  is_super_admin,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'vieweradmin',
  'viewer@mythologia.local',
  '$2b$12$placeholder.hash.value.will.be.generated.by.app',
  'admin',
  '[
    {
      "resource": "cards",
      "actions": ["read"]
    },
    {
      "resource": "users",
      "actions": ["read"]
    },
    {
      "resource": "system",
      "actions": ["read"]
    }
  ]'::json,
  true,
  false,
  (SELECT id FROM admins WHERE username = 'superadmin' LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- 作成されたアカウント情報の表示用コメント
-- 初期アカウント情報:
-- 1. superadmin / superadmin@mythologia.local / SuperAdmin123! (スーパー管理者)
-- 2. cardadmin / cardadmin@mythologia.local / CardAdmin123! (カード管理者)  
-- 3. vieweradmin / viewer@mythologia.local / ViewerAdmin123! (読み取り専用)
--
-- 重要: 本番環境では必ずパスワードを変更してください