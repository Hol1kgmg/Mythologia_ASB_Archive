import { Card, CardSearchParams } from '../models/Card';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CardRepository {
  findById(id: string): Promise<Card | null>;
  findMany(params: CardSearchParams): Promise<PaginationResult<Card>>;
  create(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card>;
  update(id: string, data: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Card | null>;
  delete(id: string): Promise<boolean>;
  findByTribeId(tribeId: number): Promise<Card[]>;
  findByLeaderId(leaderId: number): Promise<Card[]>;
}