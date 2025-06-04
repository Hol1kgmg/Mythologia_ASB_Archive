export enum Rarity {
  BRONZE = 1,
  SILVER = 2,
  GOLD = 3,
  LEGEND = 4,
}

export enum CardType {
  ATTACKER = 1,
  BLOCKER = 2,
  CHARGER = 3,
}

export enum Leader {
  DRAGON = 1,
  ANDROID = 2,
  ELEMENTAL = 3,
  LUMINUS = 4,
  SHADE = 5,
}

export const RarityNames = {
  [Rarity.BRONZE]: 'ブロンズ',
  [Rarity.SILVER]: 'シルバー',
  [Rarity.GOLD]: 'ゴールド',
  [Rarity.LEGEND]: 'レジェンド',
} as const;

export const CardTypeNames = {
  [CardType.ATTACKER]: 'アタッカー',
  [CardType.BLOCKER]: 'ブロッカー',
  [CardType.CHARGER]: 'チャージャー',
} as const;

export const LeaderNames = {
  [Leader.DRAGON]: 'ドラゴン',
  [Leader.ANDROID]: 'アンドロイド',
  [Leader.ELEMENTAL]: 'エレメンタル',
  [Leader.LUMINUS]: 'ルミナス',
  [Leader.SHADE]: 'シェイド',
} as const;