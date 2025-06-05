export interface Tribe {
  id: number;
  name: string;
  leaderId?: number;
  thematic?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  masterCardId?: string;
}

export interface TribeFilter {
  name?: string;
  leaderId?: number;
  isActive?: boolean;
}

export interface TribeSearchParams {
  query?: string;
  filters?: TribeFilter;
  sortBy?: 'name' | 'id' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}