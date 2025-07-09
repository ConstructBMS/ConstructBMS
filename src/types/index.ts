// Shared Types for Archer Business Management System

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
}

export interface Interaction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  date: string;
  description: string;
  outcome: string;
  nextAction?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
  description: string;
  source: string;
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string;
  createdAt: string;
  completedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'proposal' | 'invoice' | 'report' | 'other';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  entityId?: string;
  entityName?: string;
  userId?: string | null;
  userName?: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  icon?: string;
  color?: string;
  isDemoData?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  companyId?: string;
  position: string;
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  source: string;
  tags: string[];
  address: Address;
  totalRevenue: number;
  lastPurchase: string;
  nextFollowUp: string;
  notes: string;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  priority: 'low' | 'medium' | 'high';
  industry: string;
  website: string;
  socialMedia: SocialMedia;
  interactions: Interaction[];
  deals: Deal[];
  opportunities: Opportunity[];
  tasks: Task[];
  documents: Document[];
  customFields: Record<string, string | number | boolean>;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'sme' | 'enterprise';
  website: string;
  phone: string;
  email: string;
  address: Address;
  status: 'active' | 'inactive' | 'prospect';
  annualRevenue: number;
  employeeCount: number;
  founded: string;
  description: string;
  contacts: Customer[];
  deals: Deal[];
  opportunities: Opportunity[];
  tasks: Task[];
  documents: Document[];
  lastContact: string;
  assignedTo: string;
  tags: string[];
  notes: string;
  socialMedia: SocialMedia;
  customFields: Record<string, string | number | boolean>;
}

// Default address for UK
export const DEFAULT_UK_ADDRESS: Address = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'United Kingdom',
};

// Helper function to create a valid address object
export const createAddress = (partial: Partial<Address> = {}): Address => ({
  ...DEFAULT_UK_ADDRESS,
  ...partial,
});

// Import type definitions from other modules
export * from './auth';
export * from './ui';
export * from './email';
