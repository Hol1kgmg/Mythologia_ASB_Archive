export interface Leader {
  id: number;
  name: string;
  nameEn: string;
  description?: string;
  color: string;
  thematic?: string;
  iconUrl?: string;
  focus: string;
  averageCost: number;
  preferredCardTypes?: number[];
  keyEffects?: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderFilter {
  name?: string;
  isActive?: boolean;
  focus?: string;
}

export interface LeaderSearchParams {
  query?: string;
  filters?: LeaderFilter;
  sortBy?: 'name' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}