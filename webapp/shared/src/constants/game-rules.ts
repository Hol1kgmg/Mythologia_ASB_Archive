/**
 * 神託のメソロギア ゲームルール定数
 * 公式ルールに基づく制約とバランス調整値
 */
export const GAME_RULES = {
  DECK: {
    MIN_CARDS: 30,               // デッキ最小枚数
    MAX_CARDS: 40,               // デッキ最大枚数
    MAX_SAME_CARD: 3,            // 同名カード最大枚数
    MAX_LEGEND_CARDS: 2,         // レジェンド最大枚数
    REQUIRED_LEADER: true,       // リーダー必須
  },
  BATTLE: {
    MAX_HAND_SIZE: 7,            // 手札上限
    STARTING_HAND: 5,            // 初期手札
    MAX_FIELD_SIZE: 5,           // フィールド上限
    TURN_TIME_LIMIT: 120,        // ターン制限時間（秒）
  },
  COST: {
    MIN_COST: 0,                 // 最小コスト
    MAX_COST: 10,                // 最大コスト（現実的上限）
    STARTING_MANA: 1,            // 初期マナ
    MAX_MANA: 10,                // 最大マナ
  }
} as const;