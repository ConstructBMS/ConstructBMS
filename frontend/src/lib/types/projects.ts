export type ProjectStatus =
  | 'planned'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'cancelled';

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientId?: string; // link to Contacts
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientId?: string;
  tags?: string[];
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus[];
  tags?: string[];
  clientId?: string;
}

export type ViewMode = 'list' | 'grid' | 'kanban';
