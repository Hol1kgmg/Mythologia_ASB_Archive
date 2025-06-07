export enum CardType {
  ATTACKER = 1,
  BLOCKER = 2,
  CHARGER = 3,
}

export enum CardArchetype {
  EARLY_GAME = 1,
  MID_GAME = 2,
  LATE_GAME = 3,
  UTILITY = 4,
  REMOVAL = 5,
  ENGINE = 6,
}

export const CARD_TYPES = {
  [CardType.ATTACKER]: {
    id: CardType.ATTACKER,
    name: 'アタッカー',
    nameEn: 'Attacker',
    description: '攻撃に特化したカード',
    icon: '⚔️',
  },
  [CardType.BLOCKER]: {
    id: CardType.BLOCKER,
    name: 'ブロッカー',
    nameEn: 'Blocker',
    description: '防御に特化したカード',
    icon: '🛡️',
  },
  [CardType.CHARGER]: {
    id: CardType.CHARGER,
    name: 'チャージャー',
    nameEn: 'Charger',
    description: 'サポート効果を持つカード',
    icon: '⚡',
  },
} as const;

export const ARCHETYPES = {
  [CardArchetype.EARLY_GAME]: {
    id: CardArchetype.EARLY_GAME,
    name: '序盤型',
    nameEn: 'Early Game',
    description: 'ゲーム開始直後にプレイされる低コストカード',
    costRange: [1, 3] as const,
  },
  [CardArchetype.MID_GAME]: {
    id: CardArchetype.MID_GAME,
    name: '中盤型',
    nameEn: 'Mid Game',
    description: 'ゲーム中盤の主力となるバランス型カード',
    costRange: [4, 6] as const,
  },
  [CardArchetype.LATE_GAME]: {
    id: CardArchetype.LATE_GAME,
    name: '終盤型',
    nameEn: 'Late Game',
    description: 'ゲーム終盤の勝負を決する高コストカード',
    costRange: [7, 10] as const,
  },
  [CardArchetype.UTILITY]: {
    id: CardArchetype.UTILITY,
    name: 'ユーティリティ',
    nameEn: 'Utility',
    description: '特殊な効果やサポート機能を持つカード',
    costRange: [1, 8] as const,
  },
  [CardArchetype.REMOVAL]: {
    id: CardArchetype.REMOVAL,
    name: '除去',
    nameEn: 'Removal',
    description: '相手のカードや脅威を除去するカード',
    costRange: [2, 6] as const,
  },
  [CardArchetype.ENGINE]: {
    id: CardArchetype.ENGINE,
    name: 'エンジン',
    nameEn: 'Engine',
    description: '継続的なアドバンテージを生み出すカード',
    costRange: [3, 7] as const,
  },
} as const;