-- PostgreSQL初期スキーマ
-- Mythologia Admiral Ship Bridge

-- リーダーテーブル
CREATE TABLE IF NOT EXISTS leaders (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  name_en VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) NOT NULL,
  thematic VARCHAR(100),
  icon_url VARCHAR(500),
  focus VARCHAR(50) NOT NULL CHECK (focus IN ('aggro', 'control', 'midrange', 'defense', 'combo')),
  average_cost DECIMAL(3,1) DEFAULT 3.5,
  preferred_card_types JSON,
  key_effects JSON,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 種族テーブル
CREATE TABLE IF NOT EXISTS tribes (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  leader_id INTEGER REFERENCES leaders(id),
  thematic VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  master_card_id VARCHAR(36)
);

-- カードテーブル
CREATE TABLE IF NOT EXISTS cards (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
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
  image_url VARCHAR(500),
  set_code VARCHAR(10) NOT NULL,
  card_number_in_set VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- 更新日時トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leaders_updated_at BEFORE UPDATE ON leaders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tribes_updated_at BEFORE UPDATE ON tribes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();