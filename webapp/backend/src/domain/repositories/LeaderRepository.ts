import { Leader, LeaderSearchParams } from '../models/Leader';

export interface LeaderRepository {
  findById(id: number): Promise<Leader | null>;
  findAll(params?: LeaderSearchParams): Promise<Leader[]>;
  create(leader: Omit<Leader, 'id' | 'createdAt' | 'updatedAt'>): Promise<Leader>;
  update(id: number, data: Partial<Omit<Leader, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Leader | null>;
  delete(id: number): Promise<boolean>;
  findActive(): Promise<Leader[]>;
}