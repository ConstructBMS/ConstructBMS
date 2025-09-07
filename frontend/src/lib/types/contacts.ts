export interface Contact {
  id: string;
  type: 'person' | 'company';
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
export type ViewMode = 'list' | 'grid';
