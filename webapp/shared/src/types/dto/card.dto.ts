export interface CardDto {
  id: string;
  cardNumber: string;          // カード番号（M001-001等）
  name: string;
  cost: number;
  power: number;
  imageUrl: string;
  leaderId: number | null;     // 1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE
  tribeId: number | null;      // 動的種族ID（tribes.id）
  rarityId: number;            // 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
  cardTypeId: number;          // 1:ATTACKER, 2:BLOCKER, 3:CHARGER
  archetypeId?: number;        // 1:EARLY_GAME, 2:MID_GAME, 3:LATE_GAME, 4:UTILITY, 5:REMOVAL, 6:ENGINE
  cardSetId: string;           // カードセットID
  // 表示用の計算済みプロパティ
  displayName: string;         // レアリティプレフィックス付き名前
  formattedCost: string;       // 「3コスト」等の表示形式
  canPlayInLeader?: number[];  // 使用可能リーダーリスト
  effects: CardEffectDto[];    // カード効果（表示用）
}

export interface CardEffectDto {
  id: string;
  type: 'BATTLE' | 'ENTER' | 'LEAVE' | 'CONTINUOUS';
  description: string;         // 日本語説明文
  timing: string;              // 発動タイミング
}

export interface CardListDto {
  cards: CardDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    leaderDistribution: Record<string, number>;
    costDistribution: Record<number, number>;
    tribeDistribution: Record<string, number>;
  };
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}