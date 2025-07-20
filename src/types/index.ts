// Shared Types for Napwood Business Management System

export interface Address {
  city: string;
  country: string;
  state: string;
  street: string;
  zip: string;
}

export interface SocialMedia {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
}

export interface Interaction {
  date: string;
  description: string;
  id: string;
  nextAction?: string;
  outcome: string;
  type: 'email' | 'call' | 'meeting' | 'note';
}

export interface Deal {
  closeDate: string;
  id: string;
  probability: number;
  stage: string;
  title: string;
  value: number;
}

export interface Opportunity {
  assignedTo: string;
  closeDate: string;
  createdAt: string;
  description: string;
  id: string;
  lastActivity: string;
  probability: number;
  source: string;
  stage: string;
  title: string;
  value: number;
}

export interface Task {
  assignedTo: string;
  completedAt?: string;
  createdAt: string;
  description: string;
  dueDate: string;
  id: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  title: string;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: 'contract' | 'proposal' | 'invoice' | 'report' | 'other';
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface ActivityItem {
  actionUrl?: string;
  actionable: boolean;
  category: string;
  color?: string;
  description: string;
  entityId?: string;
  entityName?: string;
  icon?: string;
  id: string;
  isDemoData?: boolean;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  timestamp: Date;
  title: string;
  type: string;
  userId?: string | null;
  userName?: string;
}

export interface Customer {
  address: Address;
  assignedTo: string;
  company: string;
  companyId?: string;
  createdAt: string;
  customFields: Record<string, string | number | boolean>;
  deals: Deal[];
  documents: Document[];
  email: string;
  id: string;
  industry: string;
  interactions: Interaction[];
  lastContact: string;
  lastPurchase: string;
  name: string;
  nextFollowUp: string;
  notes: string;
  opportunities: Opportunity[];
  phone: string;
  position: string;
  priority: 'low' | 'medium' | 'high';
  socialMedia: SocialMedia;
  source: string;
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  tags: string[];
  tasks: Task[];
  totalRevenue: number;
  website: string;
}

export interface Company {
  address: Address;
  annualRevenue: number;
  assignedTo: string;
  contacts: Customer[];
  customFields: Record<string, string | number | boolean>;
  deals: Deal[];
  description: string;
  documents: Document[];
  email: string;
  employeeCount: number;
  founded: string;
  id: string;
  industry: string;
  lastContact: string;
  name: string;
  notes: string;
  opportunities: Opportunity[];
  phone: string;
  size: 'startup' | 'sme' | 'enterprise';
  socialMedia: SocialMedia;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  tasks: Task[];
  website: string;
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
