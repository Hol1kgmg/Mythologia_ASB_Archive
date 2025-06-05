import { Tribe, TribeSearchParams } from '../models/Tribe';

export interface TribeRepository {
  findById(id: number): Promise<Tribe | null>;
  findAll(params?: TribeSearchParams): Promise<Tribe[]>;
  create(tribe: Omit<Tribe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tribe>;
  update(id: number, data: Partial<Omit<Tribe, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tribe | null>;
  delete(id: number): Promise<boolean>;
  findByLeaderId(leaderId: number): Promise<Tribe[]>;
  findActive(): Promise<Tribe[]>;
}