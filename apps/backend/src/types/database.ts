import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { tribes, cardSets, cards } from '@/db/schema';

// Insert types (for creating new records)
export type InsertTribe = InferInsertModel<typeof tribes>;
export type InsertCardSet = InferInsertModel<typeof cardSets>;
export type InsertCard = InferInsertModel<typeof cards>;

// Select types (for reading records)
export type SelectTribe = InferSelectModel<typeof tribes>;
export type SelectCardSet = InferSelectModel<typeof cardSets>;
export type SelectCard = InferSelectModel<typeof cards>;

// Card effect structure
export interface CardEffect {
  description: string;
  abilities: Array<{
    type: string;
    value?: number;
    target?: string;
  }>;
  triggers: Array<{
    type: string;
    condition?: string;
  }>;
  targets: Array<{
    type: string;
    filter?: string;
  }>;
}

// Database adapter interface
export interface DatabaseAdapter {
  // Tribes
  getTribes(): Promise<SelectTribe[]>;
  getTribe(id: number): Promise<SelectTribe | null>;
  createTribe(tribe: InsertTribe): Promise<SelectTribe>;
  updateTribe(id: number, tribe: Partial<InsertTribe>): Promise<SelectTribe>;
  deleteTribe(id: number): Promise<boolean>;

  // Card Sets
  getCardSets(): Promise<SelectCardSet[]>;
  getCardSet(id: string): Promise<SelectCardSet | null>;
  createCardSet(cardSet: InsertCardSet): Promise<SelectCardSet>;
  updateCardSet(id: string, cardSet: Partial<InsertCardSet>): Promise<SelectCardSet>;
  deleteCardSet(id: string): Promise<boolean>;

  // Cards
  getCards(): Promise<SelectCard[]>;
  getCard(id: string): Promise<SelectCard | null>;
  getCardsByLeader(leaderId: number): Promise<SelectCard[]>;
  getCardsByTribe(tribeId: number): Promise<SelectCard[]>;
  getCardsByRarity(rarityId: number): Promise<SelectCard[]>;
  getCardsByType(cardTypeId: number): Promise<SelectCard[]>;
  createCard(card: InsertCard): Promise<SelectCard>;
  updateCard(id: string, card: Partial<InsertCard>): Promise<SelectCard>;
  deleteCard(id: string): Promise<boolean>;
}