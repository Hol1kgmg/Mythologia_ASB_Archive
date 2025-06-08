-- Mythologia Admiral Ship Bridge - PostgreSQL初期化スクリプト
-- 開発環境用のデータベース初期設定

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 開発用ユーザー権限設定
GRANT ALL PRIVILEGES ON DATABASE mythologia_dev TO mythologia_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO mythologia_user;

-- タイムゾーン設定
SET timezone = 'Asia/Tokyo';

-- データベース初期化完了ログ
SELECT 'Mythologia Database initialized successfully' AS status;