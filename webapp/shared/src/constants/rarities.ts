export enum Rarity {
  BRONZE = 1,      // ブロンズ
  SILVER = 2,      // シルバー
  GOLD = 3,        // ゴールド
  LEGEND = 4       // レジェンド
}

export const RARITIES = {
  [Rarity.BRONZE]: {
    id: Rarity.BRONZE,
    name: 'ブロンズ',
    nameEn: 'Bronze',
    color: '#CD7F32',
    maxInDeck: 3,                // デッキ内最大枚数
    dropRate: 0.7,               // パック排出率
  },
  [Rarity.SILVER]: {
    id: Rarity.SILVER,
    name: 'シルバー',
    nameEn: 'Silver',
    color: '#C0C0C0',
    maxInDeck: 3,
    dropRate: 0.25,
  },
  [Rarity.GOLD]: {
    id: Rarity.GOLD,
    name: 'ゴールド',
    nameEn: 'Gold',
    color: '#FFD700',
    maxInDeck: 3,
    dropRate: 0.04,
  },
  [Rarity.LEGEND]: {
    id: Rarity.LEGEND,
    name: 'レジェンド',
    nameEn: 'Legend',
    color: '#FF1493',
    maxInDeck: 2,                // レジェンドは最大2枚
    dropRate: 0.01,
  },
} as const;