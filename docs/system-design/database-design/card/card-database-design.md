# カードデータベース設計

## 概要

神託のメソロギアのカード情報を管理するデータベース設計です。カードマスターデータの効率的な保存・検索・管理を目的としています。

## テーブル設計

### leaders テーブル

```sql
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
```

### tribes テーブル

```sql
CREATE TABLE tribes (
  id INTEGER PRIMARY KEY,               -- 種族ID
  name VARCHAR(50) NOT NULL UNIQUE,     -- 種族名
  leaderId INTEGER NULL,                -- リーダーID（1-5）
  thematic VARCHAR(100) NULL,           -- テーマ特性
  description TEXT NULL,                -- 種族説明
  isActive BOOLEAN DEFAULT TRUE,        -- アクティブフラグ
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  MasterCardId VARCHAR(36) NULL         -- マスターカードID
);
```

### card_sets テーブル（収録パック）

```sql
CREATE TABLE card_sets (
  id VARCHAR(36) PRIMARY KEY,           -- セットID
  name VARCHAR(100) NOT NULL,           -- セット名
  code VARCHAR(20) UNIQUE NOT NULL,     -- セットコード（例: "CORE", "EXP1"）
  release_date DATE NOT NULL,           -- リリース日
  card_count INTEGER DEFAULT 0,        -- カード総数
  description TEXT NULL,                -- セット説明
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### cards テーブル

```sql
CREATE TABLE cards (
  id VARCHAR(36) PRIMARY KEY,           -- カードID（UUID形式）
  card_number VARCHAR(20) UNIQUE NOT NULL, -- カード番号（例: "10015", "80012"）
  name VARCHAR(100) NOT NULL,           -- カード名
  leader_id INTEGER NULL,               -- リーダーID（1-5、NULL可）
  tribe_id INTEGER NULL,                -- 種族ID（NULL可）
  category_id INTEGER NULL,             -- カテゴリID（NULL可）
  rarity_id INTEGER NOT NULL,           -- レアリティID（1-4）
  card_type_id INTEGER NOT NULL,        -- カードタイプID（1-3）
  cost INTEGER NOT NULL,                -- コスト
  power INTEGER NOT NULL,               -- パワー
  effects JSON NULL,                    -- 効果（JSON配列、NULL可）
  flavor_text TEXT NULL,                -- フレーバーテキスト
  image_url VARCHAR(500) NOT NULL,      -- カード画像URL
  artist VARCHAR(100) NULL,             -- イラストレーター
  card_set_id VARCHAR(36) NOT NULL,     -- カードセットID
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ（論理削除用）
  deleted_at TIMESTAMP NULL,            -- 削除日時（論理削除用）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 外部キー制約
  FOREIGN KEY (leader_id) REFERENCES leaders(id) ON DELETE SET NULL,
  FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (card_set_id) REFERENCES card_sets(id) ON DELETE RESTRICT
  
  -- Note: カテゴリは2つのアプローチが可能
  -- 1. Direct Reference: category_idで直接カテゴリを参照（実装済み）
  -- 2. Many-to-Many: card_categoriesテーブルで複数カテゴリ管理（将来拡張）
  -- 現在は1の直接参照アプローチを採用
);
```


### categories テーブル（カテゴリ分類）

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,               -- カテゴリID
  tribe_id INTEGER NOT NULL,            -- 種族ID（必須）
  name VARCHAR(50) NOT NULL,            -- カテゴリ名（日本語）
  name_en VARCHAR(50) NOT NULL,         -- カテゴリ名（英語）
  description TEXT NULL,                -- カテゴリ説明
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ（論理削除用）
  deleted_at TIMESTAMP NULL,            -- 削除日時（論理削除用）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(tribe_id, name),               -- 同一種族内でのカテゴリ名重複防止
  UNIQUE(tribe_id, name_en),            -- 同一種族内での英語名重複防止
  FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE
);
```

### card_categories テーブル（中間テーブル）

```sql
CREATE TABLE card_categories (
  card_id VARCHAR(36) NOT NULL,         -- カードID
  category_id INTEGER NOT NULL,         -- カテゴリID
  is_primary BOOLEAN DEFAULT FALSE,     -- 主カテゴリフラグ
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ（論理削除用）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,            -- 削除日時（論理削除用）
  PRIMARY KEY (card_id, category_id),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### card_translations テーブル（多言語対応）

```sql
CREATE TABLE card_translations (
  id VARCHAR(36) PRIMARY KEY,
  card_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,    -- 言語コード（ja, en, ko など）
  name VARCHAR(100) NOT NULL,           -- 翻訳されたカード名
  flavor_text TEXT NULL,                -- 翻訳されたフレーバーテキスト
  effects_text JSON NULL,               -- 翻訳された効果テキスト
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ（論理削除用）
  deleted_at TIMESTAMP NULL,            -- 削除日時（論理削除用）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  UNIQUE KEY unique_card_language (card_id, language_code)
);
```

## インデックス設計

### パフォーマンス最適化インデックス

```sql
-- 基本検索用インデックス
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_card_number ON cards(card_number);
CREATE INDEX idx_cards_rarity_id ON cards(rarity_id);
CREATE INDEX idx_cards_card_type_id ON cards(card_type_id);
CREATE INDEX idx_cards_leader_id ON cards(leader_id);
CREATE INDEX idx_cards_tribe_id ON cards(tribe_id);
CREATE INDEX idx_cards_cost ON cards(cost);
CREATE INDEX idx_cards_power ON cards(power);
CREATE INDEX idx_cards_set ON cards(card_set_id);
CREATE INDEX idx_cards_active ON cards(is_active);
CREATE INDEX idx_cards_deleted_at ON cards(deleted_at);

-- 複合インデックス（よく使われる組み合わせ）
CREATE INDEX idx_cards_rarity_type ON cards(rarity_id, card_type_id);
CREATE INDEX idx_cards_leader_cost ON cards(leader_id, cost);
CREATE INDEX idx_cards_tribe_type ON cards(tribe_id, card_type_id);
CREATE INDEX idx_cards_cost_power ON cards(cost, power);
CREATE INDEX idx_cards_set_active ON cards(card_set_id, is_active);

-- leaders テーブル用インデックス
CREATE INDEX idx_leaders_name ON leaders(name);
CREATE INDEX idx_leaders_name_en ON leaders(name_en);
CREATE INDEX idx_leaders_focus ON leaders(focus);
CREATE INDEX idx_leaders_active ON leaders(is_active);
CREATE INDEX idx_leaders_sort_order ON leaders(sort_order);

-- tribes テーブル用インデックス
CREATE INDEX idx_tribes_name ON tribes(name);
CREATE INDEX idx_tribes_leader_id ON tribes(leaderId);
CREATE INDEX idx_tribes_active ON tribes(isActive);

-- card_sets テーブル用インデックス
CREATE INDEX idx_card_sets_code ON card_sets(code);
CREATE INDEX idx_card_sets_release_date ON card_sets(release_date);
CREATE INDEX idx_card_sets_active ON card_sets(is_active);

-- 検索用フルテキストインデックス
CREATE FULLTEXT INDEX idx_cards_search ON cards(name, flavor_text);

-- categories テーブル用インデックス
CREATE INDEX idx_categories_tribe_id ON categories(tribe_id);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_name_en ON categories(name_en);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);

-- card_categories テーブル用インデックス
CREATE INDEX idx_card_categories_card_id ON card_categories(card_id);
CREATE INDEX idx_card_categories_category_id ON card_categories(category_id);
CREATE INDEX idx_card_categories_primary ON card_categories(is_primary);
CREATE INDEX idx_card_categories_active ON card_categories(is_active);
CREATE INDEX idx_card_categories_deleted_at ON card_categories(deleted_at);
CREATE INDEX idx_card_categories_active_primary ON card_categories(is_active, is_primary);

-- 翻訳テーブル用インデックス
CREATE INDEX idx_translations_language ON card_translations(language_code);
CREATE INDEX idx_translations_card_lang ON card_translations(card_id, language_code);
CREATE INDEX idx_translations_active ON card_translations(is_active);
CREATE INDEX idx_translations_deleted_at ON card_translations(deleted_at);
```

## Enum定義

### 初期データ移行（leaders）

```sql
-- リーダーテーブルの初期データ
INSERT INTO leaders (id, name, name_en, description, color, thematic, focus, average_cost, preferred_card_types, key_effects, sort_order) VALUES 
(1, 'ドラゴン', 'Dragon', '強力な攻撃力を持つカードが多い', '#FF6B35', '火力・直接攻撃', 'aggro', 3.2, '["ATTACKER"]', '["damage", "buff"]', 1),
(2, 'アンドロイド', 'Android', 'テクノロジーとシナジー効果', '#00B4D8', '機械・連携', 'control', 4.1, '["BLOCKER", "CHARGER"]', '["draw", "search", "debuff"]', 2),
(3, 'エレメンタル', 'Elemental', '自然の力と魔法的効果', '#06FFA5', '自然・魔法', 'midrange', 3.5, '["ATTACKER", "BLOCKER"]', '["heal", "buff", "damage"]', 3),
(4, 'ルミナス', 'Luminus', '光の力と防御・回復', '#FFD23F', '光・防御・回復', 'defense', 3.8, '["BLOCKER"]', '["heal", "shield", "debuff"]', 4),
(5, 'シェイド', 'Shade', '闇の力と特殊効果', '#6A4C93', '闇・特殊効果', 'combo', 3.0, '["CHARGER"]', '["draw", "search", "summon"]', 5);
```

### TypeScript Enum対応（動的リーダー対応）

```typescript
// データベースの数値IDに対応するTypeScript定義
export enum Rarity {
  BRONZE = 1,      // ブロンズ
  SILVER = 2,      // シルバー
  GOLD = 3,        // ゴールド
  LEGEND = 4       // レジェンド
}

export enum CardType {
  ATTACKER = 1,    // アタッカー
  BLOCKER = 2,     // ブロッカー
  CHARGER = 3      // チャージャー
}

export enum CardArchetype {
  EARLY_GAME = 1,  // 序盤型
  MID_GAME = 2,    // 中盤型
  LATE_GAME = 3,   // 終盤型
  UTILITY = 4,     // ユーティリティ
  REMOVAL = 5,     // 除去
  ENGINE = 6       // エンジン
}

// リーダーは動的なleadersテーブルから取得
// 固定enumは使用せず、データベースベースの管理に移行済み
export interface Leader {
  id: number;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  focus: 'aggro' | 'control' | 'midrange' | 'defense' | 'combo';
  averageCost: number;
  preferredCardTypes: string[];
  keyEffects: string[];
  sortOrder: number;
  isActive: boolean;
}

// カテゴリ関連の型定義
export interface Category {
  id: number;
  tribeId: number;
  name: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardCategory {
  cardId: string;
  categoryId: number;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

### データベースチェック制約

```sql
-- cards テーブルの制約
ALTER TABLE cards 
ADD CONSTRAINT chk_rarity_id 
CHECK (rarity_id BETWEEN 1 AND 4);

ALTER TABLE cards 
ADD CONSTRAINT chk_card_type_id 
CHECK (card_type_id BETWEEN 1 AND 3);

ALTER TABLE cards 
ADD CONSTRAINT chk_leader_id 
CHECK (leader_id IS NULL OR leader_id BETWEEN 1 AND 5);

ALTER TABLE cards 
ADD CONSTRAINT chk_tribe_id 
CHECK (tribe_id IS NULL OR tribe_id > 0);

ALTER TABLE cards 
ADD CONSTRAINT chk_category_id 
CHECK (category_id IS NULL OR category_id > 0);

ALTER TABLE cards 
ADD CONSTRAINT chk_cost 
CHECK (cost >= 0);

ALTER TABLE cards 
ADD CONSTRAINT chk_power 
CHECK (power >= 0);
```

## JSON効果フィールド設計

### 効果データ構造

```json
{
  "description": "ターン終了時、敵全体に2ダメージを与える",
  "abilities": [
    {
      "type": "damage",
      "value": 2
    }
  ],
  "triggers": [
    {
      "type": "onTurnEnd"
    }
  ],
  "targets": [
    {
      "type": "enemy",
      "filter": "all"
    }
  ]
}
```

### JSON検索インデックス

```sql
-- MySQL 8.0以降のJSON検索用インデックス
CREATE INDEX idx_cards_effects_type ON cards((JSON_EXTRACT(effects, '$.abilities[*].type')));
CREATE INDEX idx_cards_triggers ON cards((JSON_EXTRACT(effects, '$.triggers[*].type')));
```

## データ移行・更新戦略

### 段階的データ移行

```sql
-- Phase 1: マスターデータの準備
-- リーダーデータの初期化（上記参照）

-- 種族データの初期化（leaderId関連付け）
INSERT INTO tribes (id, name, leaderId, description) VALUES 
(1, 'ドラゴン', 1, '古代より存在する強大な竜族'),
(2, 'ロボット', 2, '高度な技術で作られた機械生命体'),
(3, 'エレメンタル', 3, '自然の力を宿す精霊たち'),
(4, 'アンジェル', 4, '天界からの使者'),
(5, 'デーモン', 5, '闇の力を操る魔族'),
(6, 'ビースト', NULL, '野生の力を持つ獣族'),
(7, 'ヒューマン', NULL, '様々な技能を持つ人間'),
(8, 'アンデッド', NULL, '死を超越した不死の存在'),
(9, '旧神', NULL, '太古より存在する畏怖すべき神格');

-- カテゴリの初期データ（種族に従属）
INSERT INTO categories (id, tribe_id, name, name_en, description) VALUES
-- HUMAN種族のカテゴリ（tribe_id = 7）
(1, 7, '騎士', 'KNIGHT', '重装甲で防御重視'),
(2, 7, '魔法使い', 'MAGE', '魔法攻撃特化'),
(3, 7, '弓兵', 'ARCHER', '遠距離攻撃'),
(4, 7, '僧侶', 'HEALER', '回復・支援特化'),

-- DRAGON種族のカテゴリ（tribe_id = 1）
(5, 1, '古龍', 'ANCIENT', '強力な個体'),
(6, 1, '幼龍', 'WHELP', '素早い攻撃'),
(7, 1, '長老', 'ELDER', '知恵と魔法'),
(8, 1, '守護龍', 'GUARDIAN', '防御特化'),

-- ROBOT種族のカテゴリ（tribe_id = 2）
(9, 2, '戦闘機', 'COMBAT', '攻撃特化'),
(10, 2, '支援機', 'SUPPORT', 'サポート機能'),
(11, 2, '重機', 'HEAVY', '高耐久'),
(12, 2, '偵察機', 'SCOUT', '高機動');

-- Note: 旧神種族（tribe_id = 9）にはカテゴリは存在しない

-- カードセット情報の初期化
INSERT INTO card_sets (id, name, code, release_date, card_count, description)
VALUES 
('set-001', '基本セット', 'CORE', '2024-01-01', 200, 'ゲームの基本となるカードセット'),
('set-002', '拡張パック第1弾', 'EXP1', '2024-03-01', 100, '新たな戦略を追加する拡張パック'),
('set-003', '特別版', 'SPECIAL', '2024-06-01', 50, '限定カードを含む特別版');

-- Phase 2: 基本カードデータの移行
INSERT INTO cards (
  id, card_number, name, leader_id, tribe_id, rarity_id, 
  card_type_id, cost, power, effects, image_url, card_set_id
) VALUES 
-- 既存データからの移行...

-- Phase 3: 多言語データの追加
INSERT INTO card_translations (card_id, language_code, name, flavor_text)
SELECT id, 'en', name_en, flavor_text_en 
FROM legacy_cards_en;
```

### バージョン管理

```sql
-- カードデータのバージョン管理テーブル
CREATE TABLE card_versions (
  id VARCHAR(36) PRIMARY KEY,
  card_id VARCHAR(36) NOT NULL,
  version_number INTEGER NOT NULL,
  changes JSON NOT NULL,            -- 変更内容の詳細
  created_by VARCHAR(36) NOT NULL,  -- 変更者ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id)
);
```

## パフォーマンス考慮事項

### クエリ最適化

```sql
-- よく使われるクエリパターンと最適化

-- 1. リーダー別カード検索（leadersテーブル結合）
SELECT c.*, l.name as leader_name, l.focus as leader_focus
FROM cards c
LEFT JOIN leaders l ON c.leader_id = l.id
WHERE c.leader_id = ? AND c.is_active = TRUE AND l.is_active = TRUE
ORDER BY c.cost, c.name;

-- 2. コストレンジ検索
SELECT * FROM cards 
WHERE cost BETWEEN ? AND ? AND is_active = TRUE;

-- 3. 効果タイプ検索
SELECT * FROM cards 
WHERE JSON_CONTAINS(effects, JSON_OBJECT('abilities', JSON_ARRAY(JSON_OBJECT('type', ?))))
AND is_active = TRUE;

-- 4. 複合条件検索
SELECT * FROM cards 
WHERE rarity = ? 
  AND card_type = ? 
  AND cost <= ?
  AND is_active = TRUE
ORDER BY power DESC;

-- 5. カードのアクティブなカテゴリ取得（論理削除対応）
SELECT c.*, cat.name as category_name, cc.is_primary
FROM cards c
JOIN card_categories cc ON c.id = cc.card_id 
JOIN categories cat ON cc.category_id = cat.id
WHERE c.id = ? 
  AND cc.is_active = TRUE 
  AND cc.deleted_at IS NULL
  AND cat.is_active = TRUE;

-- 6. カテゴリの論理削除
UPDATE card_categories 
SET is_active = FALSE, 
    deleted_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE card_id = ? AND category_id = ?;
```

### キャッシュ戦略

```typescript
// Redis/KVでのキャッシュキー設計
interface CardCacheKeys {
  all: "cards:all";                     // 全カード（短期キャッシュ）
  bySet: "cards:set:{setId}";          // セット別
  byLeader: "cards:leader:{leaderId}";  // リーダー別
  leaders: "leaders:all";              // 全リーダー情報
  leaderById: "leader:{leaderId}";      // 単体リーダー
  byType: "cards:type:{cardType}";     // タイプ別
  single: "card:{cardId}";             // 単体カード（長期キャッシュ）
  search: "cards:search:{query}";       // 検索結果
}
```

## 運用・メンテナンス

### 定期メンテナンス

```sql
-- 統計情報更新
ANALYZE TABLE cards;
ANALYZE TABLE card_sets;
ANALYZE TABLE card_translations;

-- インデックス最適化
OPTIMIZE TABLE cards;

-- 不要データクリーンアップ
DELETE FROM card_versions 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### 監視項目

- カード検索レスポンス時間
- JSON効果フィールドのクエリパフォーマンス
- 画像URL可用性
- 翻訳データの整合性

この設計により、効率的なカードデータ管理と高速な検索性能を実現できます。