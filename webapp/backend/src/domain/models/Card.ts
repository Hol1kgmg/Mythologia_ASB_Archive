import { Rarity, CardType, CardArchetype } from '@mythologia/shared';

export type CardRarity = Rarity;

export interface Card {
  id: string;
  name: string;
  nameEn: string;
  cost: number;
  attack: number;
  defense: number;
  rarity: CardRarity;
  cardType: CardType;
  archetype: CardArchetype;
  leaderId: number;
  tribeId: number;
  effectText: string;
  flavorText?: string;
  imageUrl?: string;
  setCode: string;
  cardNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardFilter {
  name?: string;
  rarity?: CardRarity;
  cardType?: CardType;
  archetype?: CardArchetype;
  leaderId?: number;
  tribeId?: number;
  costMin?: number;
  costMax?: number;
  attackMin?: number;
  attackMax?: number;
  defenseMin?: number;
  defenseMax?: number;
  setCode?: string;
  isActive?: boolean;
}

export interface CardSearchParams {
  query?: string;
  filters?: CardFilter;
  sortBy?: 'name' | 'cost' | 'attack' | 'defense' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}