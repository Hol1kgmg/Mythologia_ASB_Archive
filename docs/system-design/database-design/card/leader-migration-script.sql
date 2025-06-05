# Leader Database Migration Script

-- This script demonstrates the complete migration from hardcoded Leader enums
-- to dynamic leaders table management for Mythologia Admiral Ship Bridge

-- ==========================================
-- Step 1: Create Leaders Table
-- ==========================================

CREATE TABLE leaders (
  id INTEGER PRIMARY KEY,               -- リーダーID（1-5）
  name VARCHAR(50) NOT NULL UNIQUE,     -- リーダー名（日本語）
  name_en VARCHAR(50) NOT NULL UNIQUE,  -- リーダー名（英語）
  description TEXT NULL,                -- リーダー説明
  color VARCHAR(7) NOT NULL,            -- テーマカラー（HEX形式）
  thematic VARCHAR(100) NULL,           -- テーマ特性
  icon_url VARCHAR(500) NULL,           -- アイコンURL
  focus VARCHAR(50) NOT NULL,           -- 戦略フォーカス（aggro, control, midrange, defense, combo）
  average_cost DECIMAL(3,1) DEFAULT 3.5, -- 推奨平均コスト
  preferred_card_types JSON NULL,       -- 推奨カードタイプ（JSON配列）
  key_effects JSON NULL,                -- 主要効果（JSON配列）
  sort_order INTEGER DEFAULT 0,         -- 表示順序
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- Step 2: Insert Initial Leader Data
-- ==========================================

INSERT INTO leaders (id, name, name_en, description, color, thematic, icon_url, focus, average_cost, preferred_card_types, key_effects, sort_order) VALUES 
(1, 'ドラゴン', 'Dragon', '強力な攻撃力を持つカードが多い。火力と直接攻撃を重視した速攻戦略。', '#FF6B35', '火力・直接攻撃', '/images/leaders/dragon.png', 'aggro', 3.2, '["ATTACKER"]', '["damage", "buff"]', 1),
(2, 'アンドロイド', 'Android', 'テクノロジーとシナジー効果。機械的な論理と効率性を武器にした制圧戦略。', '#00B4D8', '機械・連携', '/images/leaders/android.png', 'control', 4.1, '["BLOCKER", "CHARGER"]', '["draw", "search", "debuff"]', 2),
(3, 'エレメンタル', 'Elemental', '自然の力と魔法的効果。バランス取れた中盤重視の戦略。', '#06FFA5', '自然・魔法', '/images/leaders/elemental.png', 'midrange', 3.5, '["ATTACKER", "BLOCKER"]', '["heal", "buff", "damage"]', 3),
(4, 'ルミナス', 'Luminus', '光の力と防御・回復。神聖な力による守備重視の戦略。', '#FFD23F', '光・防御・回復', '/images/leaders/luminus.png', 'defense', 3.8, '["BLOCKER"]', '["heal", "shield", "debuff"]', 4),
(5, 'シェイド', 'Shade', '闇の力と特殊効果。連携とコンボを重視した戦略。', '#6A4C93', '闇・特殊効果', '/images/leaders/shade.png', 'combo', 3.0, '["CHARGER"]', '["draw", "search", "summon"]', 5);

-- ==========================================
-- Step 3: Add Foreign Key Constraints
-- ==========================================

-- Add foreign key constraint to cards table
ALTER TABLE cards 
ADD CONSTRAINT fk_cards_leader_id 
FOREIGN KEY (leader_id) REFERENCES leaders(id) ON DELETE SET NULL;

-- Update tribes table to reference leaders
ALTER TABLE tribes 
ADD CONSTRAINT fk_tribes_leader_id 
FOREIGN KEY (leaderId) REFERENCES leaders(id) ON DELETE SET NULL;

-- ==========================================
-- Step 4: Create Indexes for Performance
-- ==========================================

-- Leaders table indexes
CREATE INDEX idx_leaders_name ON leaders(name);
CREATE INDEX idx_leaders_name_en ON leaders(name_en);
CREATE INDEX idx_leaders_focus ON leaders(focus);
CREATE INDEX idx_leaders_active ON leaders(is_active);
CREATE INDEX idx_leaders_sort_order ON leaders(sort_order);

-- Update existing indexes to include leader relationships
CREATE INDEX idx_tribes_leader_id ON tribes(leaderId);

-- ==========================================
-- Step 5: Update Tribes Data with Leader Relationships
-- ==========================================

-- Update existing tribes to link with appropriate leaders
UPDATE tribes SET leaderId = 1 WHERE name = 'ドラゴン';      -- Dragon tribe -> Dragon leader
UPDATE tribes SET leaderId = 2 WHERE name = 'ロボット';      -- Robot tribe -> Android leader  
UPDATE tribes SET leaderId = 3 WHERE name = 'エレメンタル';  -- Elemental tribe -> Elemental leader
UPDATE tribes SET leaderId = 4 WHERE name = 'アンジェル';    -- Angel tribe -> Luminus leader
UPDATE tribes SET leaderId = 5 WHERE name = 'デーモン';      -- Demon tribe -> Shade leader

-- Neutral tribes (no specific leader affinity)
UPDATE tribes SET leaderId = NULL WHERE name IN ('ビースト', 'ヒューマン', 'アンデッド');

-- ==========================================
-- Step 6: Verification Queries
-- ==========================================

-- Verify leader data insertion
SELECT 
  id,
  name,
  name_en,
  focus,
  average_cost,
  is_active
FROM leaders 
ORDER BY sort_order;

-- Verify tribe-leader relationships  
SELECT 
  t.id,
  t.name as tribe_name,
  l.name as leader_name,
  l.focus as leader_focus
FROM tribes t
LEFT JOIN leaders l ON t.leaderId = l.id
WHERE t.isActive = TRUE
ORDER BY t.id;

-- Verify cards with leader information
SELECT 
  c.id,
  c.name as card_name,
  c.leader_id,
  l.name as leader_name,
  l.focus as leader_focus
FROM cards c
LEFT JOIN leaders l ON c.leader_id = l.id
WHERE c.is_active = TRUE
LIMIT 10;

-- ==========================================
-- Step 7: Sample Application Queries
-- ==========================================

-- Get all leaders with their strategic information
SELECT 
  id,
  name,
  name_en,
  description,
  color,
  thematic,
  focus,
  average_cost,
  preferred_card_types,
  key_effects
FROM leaders 
WHERE is_active = TRUE 
ORDER BY sort_order;

-- Get cards for a specific leader with leader info
SELECT 
  c.id,
  c.card_number,
  c.name,
  c.cost,
  c.power,
  c.rarity_id,
  l.name as leader_name,
  l.color as leader_color,
  l.focus as leader_focus
FROM cards c
INNER JOIN leaders l ON c.leader_id = l.id
WHERE l.id = 1 -- Dragon leader
  AND c.is_active = TRUE
ORDER BY c.cost, c.name;

-- Get tribes associated with a leader
SELECT 
  t.id,
  t.name,
  t.thematic,
  t.description,
  l.name as leader_name,
  l.focus as leader_focus
FROM tribes t
INNER JOIN leaders l ON t.leaderId = l.id
WHERE l.id = 1 -- Dragon leader
  AND t.isActive = TRUE;

-- Get leader distribution statistics
SELECT 
  l.name as leader_name,
  l.focus,
  COUNT(c.id) as card_count,
  AVG(c.cost) as avg_cost,
  AVG(c.power) as avg_power
FROM leaders l
LEFT JOIN cards c ON l.id = c.leader_id AND c.is_active = TRUE
WHERE l.is_active = TRUE
GROUP BY l.id, l.name, l.focus
ORDER BY l.sort_order;

-- ==========================================
-- Step 8: Migration Validation
-- ==========================================

-- Check for any cards with invalid leader_id
SELECT COUNT(*) as invalid_leader_cards
FROM cards c
WHERE c.leader_id IS NOT NULL 
  AND c.leader_id NOT IN (SELECT id FROM leaders WHERE is_active = TRUE);

-- Check for any tribes with invalid leaderId  
SELECT COUNT(*) as invalid_leader_tribes
FROM tribes t
WHERE t.leaderId IS NOT NULL 
  AND t.leaderId NOT IN (SELECT id FROM leaders WHERE is_active = TRUE);

-- ==========================================
-- Migration Complete
-- ==========================================

-- This completes the migration from hardcoded Leader enum 
-- to dynamic leaders table management.
-- 
-- Benefits achieved:
-- 1. Dynamic leader management via database
-- 2. Rich leader metadata (colors, themes, strategies)
-- 3. Proper foreign key relationships
-- 4. Extensibility for future leaders
-- 5. Consistent data integrity