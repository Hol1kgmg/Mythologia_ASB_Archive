import { Hono } from 'hono';

const debug = new Hono();

// データベーススキーマ情報を返す開発用エンドポイント
debug.get('/schema', async (c) => {
  return c.json({
    success: true,
    data: {
      status: 'mock_mode',
      message: 'データベース未接続 - モックデータモード',
      expectedTables: {
        cards: {
          columns: [
            'id VARCHAR(36) PRIMARY KEY',
            'card_number VARCHAR(20) NOT NULL UNIQUE',
            'name VARCHAR(100) NOT NULL',
            'cost INTEGER NOT NULL',
            'attack INTEGER NOT NULL',
            'defense INTEGER NOT NULL',
            'rarity_id INTEGER NOT NULL',
            'card_type_id INTEGER NOT NULL',
            'archetype_id INTEGER',
            'leader_id INTEGER',
            'tribe_id INTEGER',
            'effect_text TEXT',
            'flavor_text TEXT',
            'image_url VARCHAR(500)',
            'set_code VARCHAR(10) NOT NULL',
            'card_number_in_set VARCHAR(10) NOT NULL',
            'is_active BOOLEAN DEFAULT TRUE',
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
          ],
          status: 'not_created'
        },
        leaders: {
          columns: [
            'id INTEGER PRIMARY KEY',
            'name VARCHAR(50) NOT NULL UNIQUE',
            'name_en VARCHAR(50) NOT NULL UNIQUE',
            'description TEXT',
            'color VARCHAR(7) NOT NULL',
            'thematic VARCHAR(100)',
            'icon_url VARCHAR(500)',
            'focus VARCHAR(50) NOT NULL',
            'average_cost DECIMAL(3,1) DEFAULT 3.5',
            'preferred_card_types JSON',
            'key_effects JSON',
            'sort_order INTEGER DEFAULT 0',
            'is_active BOOLEAN DEFAULT TRUE',
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
          ],
          status: 'not_created'
        },
        tribes: {
          columns: [
            'id INTEGER PRIMARY KEY',
            'name VARCHAR(50) NOT NULL UNIQUE',
            'leader_id INTEGER',
            'thematic VARCHAR(100)',
            'description TEXT',
            'is_active BOOLEAN DEFAULT TRUE',
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'master_card_id VARCHAR(36)'
          ],
          status: 'not_created'
        }
      },
      note: 'Issue #8でデータベース接続実装予定'
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// データベース接続状態を確認
debug.get('/db-status', async (c) => {
  return c.json({
    success: true,
    data: {
      status: 'disconnected',
      adapter: 'none',
      message: 'データベースアダプターは実装済みだが、実際の接続は未設定',
      availableAdapters: ['PostgreSQLAdapter', 'D1Adapter'],
      currentMode: 'mock_data_only',
      nextSteps: [
        '1. Issue #8: データベース接続実装',
        '2. マイグレーションスクリプト実行',
        '3. 初期データ投入',
        '4. 実際のクエリ実装'
      ]
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// モックデータ一覧を表示
debug.get('/mock-data', async (c) => {
  return c.json({
    success: true,
    data: {
      cards: {
        count: 0,
        note: 'カードAPIは空配列を返す（モック）'
      },
      leaders: {
        count: 0,
        note: 'リーダーAPIは空配列を返す（モック）'
      },
      tribes: {
        count: 0,
        note: '種族APIは空配列を返す（モック）'
      },
      mockBehavior: {
        '/api/cards': 'ページネーション付き空配列',
        '/api/leaders': '空配列',
        '/api/tribes': '空配列',
        'error_endpoints': {
          '/api/leaders/invalid': '400エラー（バリデーション動作確認用）',
          '/api/tribes/invalid': '400エラー（バリデーション動作確認用）'
        }
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

export { debug };