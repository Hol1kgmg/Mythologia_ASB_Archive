# デッキデータベース設計

## 概要

デッキシステムのデータベース層設計です。デッキコードを活用してデータ量を最小限に抑えた設計を採用しています。

## テーブル定義

### decks（デッキテーブル）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| id | VARCHAR(36) | NO | - | 主キー（UUID） |
| user_id | VARCHAR(36) | NO | - | ユーザーID（外部キー） |
| leader_id | TINYINT | NO | - | リーダーID（1-5） |
| name | VARCHAR(100) | NO | - | デッキ名 |
| deck_code | TEXT | NO | - | デッキコード（圧縮形式） |
| card_count | TINYINT | NO | 30 | カード総数（30-40） |
| is_public | BOOLEAN | NO | false | 公開フラグ |
| likes | INTEGER | NO | 0 | いいね数 |
| views | INTEGER | NO | 0 | 閲覧数 |
| is_deleted | BOOLEAN | NO | false | 削除フラグ |
| deleted_at | TIMESTAMP | YES | NULL | 削除日時 |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 更新日時 |

## デッキコード仕様

### フォーマット
```
構造: cardId:quantity,cardId:quantity,...
例: "10015:2,10028:3,10025:3,80012:2,80013:3"
```

### 制約
- カードIDは重複不可
- quantityは1-3の範囲
- 合計枚数は30-40枚

## インデックス設計

```sql
-- 基本インデックス
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_leader_id ON decks(leader_id);
CREATE INDEX idx_decks_is_public ON decks(is_public);
CREATE INDEX idx_decks_is_deleted ON decks(is_deleted);
CREATE INDEX idx_decks_created_at ON decks(created_at DESC);

-- 複合インデックス（公開・非削除デッキの検索用）
CREATE INDEX idx_decks_active_public ON decks(is_deleted, is_public);
CREATE INDEX idx_decks_active_leader ON decks(is_deleted, leader_id);
CREATE INDEX idx_decks_active_user ON decks(is_deleted, user_id);
CREATE INDEX idx_decks_public_likes ON decks(is_public, is_deleted, likes DESC);
CREATE INDEX idx_decks_public_created ON decks(is_public, is_deleted, created_at DESC);
```

## データベース制約

### PostgreSQL（Vercel）

```sql
-- 外部キー制約
ALTER TABLE decks 
ADD CONSTRAINT fk_decks_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- デッキコードから総枚数を取得する関数
CREATE OR REPLACE FUNCTION get_deck_card_count(deck_code TEXT)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  entry TEXT;
  quantity INTEGER;
BEGIN
  FOREACH entry IN ARRAY string_to_array(deck_code, ',')
  LOOP
    quantity := split_part(entry, ':', 2)::INTEGER;
    total := total + quantity;
  END LOOP;
  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- カード枚数制約
ALTER TABLE decks ADD CONSTRAINT check_card_count 
  CHECK (get_deck_card_count(deck_code) BETWEEN 30 AND 40);

-- リーダーID制約
ALTER TABLE decks ADD CONSTRAINT check_leader_id 
  CHECK (leader_id BETWEEN 1 AND 5);

-- 論理削除制約
ALTER TABLE decks ADD CONSTRAINT check_deleted_at
  CHECK ((is_deleted = false AND deleted_at IS NULL) OR 
         (is_deleted = true AND deleted_at IS NOT NULL));
```

### SQLite（Cloudflare D1）

```sql
-- 外部キー制約
PRAGMA foreign_keys = ON;

-- D1では関数が制限されているため、アプリケーション層でバリデーション
-- CHECK制約は基本的なもののみ
ALTER TABLE decks ADD CONSTRAINT check_leader_id 
  CHECK (leader_id BETWEEN 1 AND 5);

ALTER TABLE decks ADD CONSTRAINT check_card_count_range
  CHECK (card_count BETWEEN 30 AND 40);
```

## 検索クエリパターン

### 基本検索パターン

```sql
-- アクティブなデッキのみ取得
SELECT * FROM decks 
WHERE is_deleted = false;

-- 公開デッキをリーダー別に取得
SELECT * FROM decks 
WHERE is_deleted = false 
  AND is_public = true 
  AND leader_id = ?
ORDER BY created_at DESC;

-- 人気デッキランキング
SELECT * FROM decks 
WHERE is_deleted = false 
  AND is_public = true 
ORDER BY likes DESC, views DESC
LIMIT 20;

-- ユーザーのデッキ一覧（削除されたものも含む、本人のみ）
SELECT * FROM decks 
WHERE user_id = ?
ORDER BY created_at DESC;
```

## パフォーマンス最適化

### クエリ最適化のポイント

1. **論理削除フィルター**: 必ず `is_deleted = false` を含める
2. **複合インデックス活用**: よく使われる条件の組み合わせ
3. **LIMIT句の使用**: 大量データでのページネーション

### 統計情報取得

```sql
-- デッキ統計（集計クエリ）
SELECT 
  leader_id,
  COUNT(*) as deck_count,
  AVG(likes) as avg_likes,
  AVG(views) as avg_views
FROM decks 
WHERE is_deleted = false 
  AND is_public = true
GROUP BY leader_id;
```

## ストレージ削減効果

### 従来の設計（deck_cardsテーブル使用）
```
30枚のデッキ = 30レコード × (36 + 36 + 4) bytes = 2,280 bytes
```

### 最適化後の設計（deck_codeカラム使用）
```
30枚のデッキ = 1レコード × 約200 bytes = 200 bytes
削減率: 約91%
```

## 移行戦略

### 既存データからの移行

```sql
-- Step 1: deck_codeカラムを追加
ALTER TABLE decks ADD COLUMN deck_code TEXT;

-- Step 2: 既存データからdeck_codeを生成
UPDATE decks d
SET deck_code = (
  SELECT STRING_AGG(
    dc.card_id || ':' || dc.quantity, 
    ',' 
    ORDER BY dc.card_id
  )
  FROM deck_cards dc
  WHERE dc.deck_id = d.id
);

-- Step 3: NOT NULL制約を追加
ALTER TABLE decks ALTER COLUMN deck_code SET NOT NULL;

-- Step 4: deck_cardsテーブルを削除（確認後）
-- DROP TABLE deck_cards;
```

## 運用上の注意点

1. **データ整合性**: アプリケーション層でのバリデーションが重要
2. **バックアップ**: deck_codeの破損に備えた定期バックアップ
3. **監視**: 異常なdeck_codeパターンの検出
4. **インデックス**: 定期的なインデックス統計更新