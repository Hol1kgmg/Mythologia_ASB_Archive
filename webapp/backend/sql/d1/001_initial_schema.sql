-- Cloudflare D1初期スキーマ
-- Mythologia Admiral Ship Bridge

-- リーダーテーブル
CREATE TABLE IF NOT EXISTS leaders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL,
  thematic TEXT,
  icon_url TEXT,
  focus TEXT NOT NULL CHECK (focus IN ('aggro', 'control', 'midrange', 'defense', 'combo')),
  average_cost REAL DEFAULT 3.5,
  preferred_card_types TEXT, -- JSONはTEXTとして保存
  key_effects TEXT, -- JSONはTEXTとして保存
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1, -- BOOLEANはINTEGERとして保存
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 種族テーブル
CREATE TABLE IF NOT EXISTS tribes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  leader_id INTEGER REFERENCES leaders(id),
  thematic TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  master_card_id TEXT
);

-- カードテーブル
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  card_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost >= 0),
  attack INTEGER NOT NULL CHECK (attack >= 0),
  defense INTEGER NOT NULL CHECK (defense >= 0),
  rarity_id INTEGER NOT NULL CHECK (rarity_id IN (1, 2, 3, 4)),
  card_type_id INTEGER NOT NULL CHECK (card_type_id IN (1, 2, 3)),
  archetype_id INTEGER CHECK (archetype_id IN (1, 2, 3, 4, 5, 6)),
  leader_id INTEGER REFERENCES leaders(id),
  tribe_id INTEGER REFERENCES tribes(id),
  effect_text TEXT,
  flavor_text TEXT,
  image_url TEXT,
  set_code TEXT NOT NULL,
  card_number_in_set TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- インデックス
CREATE INDEX idx_cards_leader_id ON cards(leader_id);
CREATE INDEX idx_cards_tribe_id ON cards(tribe_id);
CREATE INDEX idx_cards_rarity_id ON cards(rarity_id);
CREATE INDEX idx_cards_card_type_id ON cards(card_type_id);
CREATE INDEX idx_cards_archetype_id ON cards(archetype_id);
CREATE INDEX idx_cards_set_code ON cards(set_code);
CREATE INDEX idx_cards_cost ON cards(cost);
CREATE INDEX idx_cards_name ON cards(name);

CREATE INDEX idx_tribes_leader_id ON tribes(leader_id);

-- D1では更新トリガーは手動で実装する必要がある