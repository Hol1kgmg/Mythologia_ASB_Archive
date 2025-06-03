# カードデータベース設計

## 概要

神託のメソロギアのカード情報を管理するデータベース設計です。カードマスターデータの効率的な保存・検索・管理を目的としています。

## テーブル設計

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
  tribe_id INTEGER NULL,                -- 種族ID
  rarity_id INTEGER NOT NULL,           -- レアリティID（1-4）
  card_type_id INTEGER NOT NULL,        -- カードタイプID（1-3）
  cost INTEGER NOT NULL,                -- コスト
  power INTEGER NOT NULL,               -- パワー
  effects JSON NOT NULL,                -- 効果（JSON配列）
  flavor_text TEXT NULL,                -- フレーバーテキスト
  image_url VARCHAR(500) NOT NULL,      -- カード画像URL
  artist VARCHAR(100) NULL,             -- イラストレーター
  card_set_id VARCHAR(36) NOT NULL,     -- カードセットID
  is_active BOOLEAN DEFAULT TRUE,       -- アクティブフラグ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 外部キー制約
  FOREIGN KEY (tribe_id) REFERENCES tribes(id),
  FOREIGN KEY (card_set_id) REFERENCES card_sets(id)
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

-- 複合インデックス（よく使われる組み合わせ）
CREATE INDEX idx_cards_rarity_type ON cards(rarity_id, card_type_id);
CREATE INDEX idx_cards_leader_cost ON cards(leader_id, cost);
CREATE INDEX idx_cards_tribe_type ON cards(tribe_id, card_type_id);
CREATE INDEX idx_cards_cost_power ON cards(cost, power);
CREATE INDEX idx_cards_set_active ON cards(card_set_id, is_active);

-- tribes テーブル用インデックス
CREATE INDEX idx_tribes_name ON tribes(name);
CREATE INDEX idx_tribes_active ON tribes(is_active);

-- card_sets テーブル用インデックス
CREATE INDEX idx_card_sets_code ON card_sets(code);
CREATE INDEX idx_card_sets_release_date ON card_sets(release_date);
CREATE INDEX idx_card_sets_active ON card_sets(is_active);

-- 検索用フルテキストインデックス
CREATE FULLTEXT INDEX idx_cards_search ON cards(name, flavor_text);

-- 翻訳テーブル用インデックス
CREATE INDEX idx_translations_language ON card_translations(language_code);
CREATE INDEX idx_translations_card_lang ON card_translations(card_id, language_code);
```

## Enum定義

### TypeScript Enum対応

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

export enum Leader {
  DRAGON = 1,      // ドラゴン
  ANDROID = 2,     // アンドロイド
  ELEMENTAL = 3,   // エレメンタル
  LUMINUS = 4,     // ルミナス
  SHADE = 5        // シェイド
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
-- 種族データの初期化
INSERT INTO tribes (id, name, description) VALUES 
(1, 'ドラゴン', '古代より存在する強大な竜族'),
(2, 'ロボット', '高度な技術で作られた機械生命体'),
(3, 'エレメンタル', '自然の力を宿す精霊たち'),
(4, 'アンジェル', '天界からの使者'),
(5, 'デーモン', '闇の力を操る魔族'),
(6, 'ビースト', '野生の力を持つ獣族'),
(7, 'ヒューマン', '様々な技能を持つ人間'),
(8, 'アンデッド', '死を超越した不死の存在');

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

-- 1. リーダー別カード検索
SELECT * FROM cards 
WHERE leader_id = ? AND is_active = TRUE 
ORDER BY cost, name;

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
```

### キャッシュ戦略

```typescript
// Redis/KVでのキャッシュキー設計
interface CardCacheKeys {
  all: "cards:all";                     // 全カード（短期キャッシュ）
  bySet: "cards:set:{setId}";          // セット別
  byLeader: "cards:leader:{leaderId}";  // リーダー別
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