export interface Contact {
  id: string;
  type: 'person' | 'company';
  category: 'client' | 'contractor' | 'consultant' | 'other';
  name: string;
  email?: string;
  phone?: string;
  companyId?: string;
  notes?: string;
  tags?: string[];
  custom?: Record<string, unknown>;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  category: 'client' | 'contractor' | 'consultant' | 'other';
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  custom?: Record<string, unknown>;
  createdAt: string;
}

export type ContactType = 'person' | 'company';
export type ContactCategory = 'client' | 'contractor' | 'consultant' | 'other';
export type ViewMode = 'list' | 'grid' | 'kanban';
