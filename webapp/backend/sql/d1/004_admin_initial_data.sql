-- 初期管理者アカウントデータ（D1/SQLite対応）
-- マイルストーン1: システム管理者認証基盤

-- UUIDv4生成のヘルパー（SQLite用）
-- 実際の実装では lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))
-- を使用しますが、ここでは固定値を使用

-- 初期スーパー管理者アカウント作成
INSERT OR IGNORE INTO admins (
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
  '550e8400-e29b-41d4-a716-446655440001',
  'superadmin',
  'superadmin@mythologia.local',
  'simple_hash_placeholder_will_be_generated_by_app',
  'super_admin',
  '[]',
  1,
  1,
  null,
  strftime('%s', 'now'),
  strftime('%s', 'now')
);

-- 初期管理者アカウント作成（カード管理権限付き）
INSERT OR IGNORE INTO admins (
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
  '550e8400-e29b-41d4-a716-446655440002',
  'cardadmin',
  'cardadmin@mythologia.local',
  'simple_hash_placeholder_will_be_generated_by_app',
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
  ]',
  1,
  0,
  '550e8400-e29b-41d4-a716-446655440001',
  strftime('%s', 'now'),
  strftime('%s', 'now')
);

-- 読み取り専用管理者アカウント作成
INSERT OR IGNORE INTO admins (
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
  '550e8400-e29b-41d4-a716-446655440003',
  'vieweradmin',
  'viewer@mythologia.local',
  'simple_hash_placeholder_will_be_generated_by_app',
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
  ]',
  1,
  0,
  '550e8400-e29b-41d4-a716-446655440001',
  strftime('%s', 'now'),
  strftime('%s', 'now')
);

-- 作成されたアカウント情報の表示用コメント
-- 初期アカウント情報:
-- 1. superadmin / superadmin@mythologia.local / SuperAdmin123! (スーパー管理者)
-- 2. cardadmin / cardadmin@mythologia.local / CardAdmin123! (カード管理者)  
-- 3. vieweradmin / viewer@mythologia.local / ViewerAdmin123! (読み取り専用)
--
-- 重要: 本番環境では必ずパスワードを変更してください