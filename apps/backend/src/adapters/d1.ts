import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { tribes, cardSets, cards } from '@/db/schema';
import type {
  DatabaseAdapter,
  SelectTribe,
  SelectCardSet,
  SelectCard,
  InsertTribe,
  InsertCardSet,
  InsertCard,
} from '@/types/database';

export class D1Adapter implements DatabaseAdapter {
  private db: ReturnType<typeof drizzle>;

  constructor(d1Database: D1Database) {
    this.db = drizzle(d1Database, { schema: { tribes, cardSets, cards } });
  }

  // Tribes
  async getTribes(): Promise<SelectTribe[]> {
    return this.db.select().from(tribes).where(eq(tribes.isActive, true));
  }

  async getTribe(id: number): Promise<SelectTribe | null> {
    const result = await this.db
      .select()
      .from(tribes)
      .where(eq(tribes.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async createTribe(tribe: InsertTribe): Promise<SelectTribe> {
    const result = await this.db.insert(tribes).values(tribe).returning();
    return result[0]!;
  }

  async updateTribe(id: number, tribe: Partial<InsertTribe>): Promise<SelectTribe> {
    const result = await this.db
      .update(tribes)
      .set({ ...tribe, updatedAt: new Date() })
      .where(eq(tribes.id, id))
      .returning();
    return result[0]!;
  }

  async deleteTribe(id: number): Promise<boolean> {
    const result = await this.db
      .update(tribes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(tribes.id, id))
      .returning();
    return result.length > 0;
  }

  // Card Sets
  async getCardSets(): Promise<SelectCardSet[]> {
    return this.db.select().from(cardSets).where(eq(cardSets.isActive, true));
  }

  async getCardSet(id: string): Promise<SelectCardSet | null> {
    const result = await this.db
      .select()
      .from(cardSets)
      .where(eq(cardSets.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async createCardSet(cardSet: InsertCardSet): Promise<SelectCardSet> {
    const result = await this.db.insert(cardSets).values(cardSet).returning();
    return result[0]!;
  }

  async updateCardSet(id: string, cardSet: Partial<InsertCardSet>): Promise<SelectCardSet> {
    const result = await this.db
      .update(cardSets)
      .set({ ...cardSet, updatedAt: new Date() })
      .where(eq(cardSets.id, id))
      .returning();
    return result[0]!;
  }

  async deleteCardSet(id: string): Promise<boolean> {
    const result = await this.db
      .update(cardSets)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(cardSets.id, id))
      .returning();
    return result.length > 0;
  }

  // Cards
  async getCards(): Promise<SelectCard[]> {
    return this.db.select().from(cards).where(eq(cards.isActive, true));
  }

  async getCard(id: string): Promise<SelectCard | null> {
    const result = await this.db
      .select()
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async getCardsByLeader(leaderId: number): Promise<SelectCard[]> {
    return this.db
      .select()
      .from(cards)
      .where(and(eq(cards.leaderId, leaderId), eq(cards.isActive, true)));
  }

  async getCardsByTribe(tribeId: number): Promise<SelectCard[]> {
    return this.db
      .select()
      .from(cards)
      .where(and(eq(cards.tribeId, tribeId), eq(cards.isActive, true)));
  }

  async getCardsByRarity(rarityId: number): Promise<SelectCard[]> {
    return this.db
      .select()
      .from(cards)
      .where(and(eq(cards.rarityId, rarityId), eq(cards.isActive, true)));
  }

  async getCardsByType(cardTypeId: number): Promise<SelectCard[]> {
    return this.db
      .select()
      .from(cards)
      .where(and(eq(cards.cardTypeId, cardTypeId), eq(cards.isActive, true)));
  }

  async createCard(card: InsertCard): Promise<SelectCard> {
    const result = await this.db.insert(cards).values(card).returning();
    return result[0]!;
  }

  async updateCard(id: string, card: Partial<InsertCard>): Promise<SelectCard> {
    const result = await this.db
      .update(cards)
      .set({ ...card, updatedAt: new Date() })
      .where(eq(cards.id, id))
      .returning();
    return result[0]!;
  }

  async deleteCard(id: string): Promise<boolean> {
    const result = await this.db
      .update(cards)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(cards.id, id))
      .returning();
    return result.length > 0;
  }
}