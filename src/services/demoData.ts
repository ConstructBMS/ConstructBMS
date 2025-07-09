// Demo Data Service - All data marked as demo for easy deletion
import { Address, createAddress } from '../types';
import { persistentStorage } from './persistentStorage';

export interface DemoDataFlags {
  isDemoData: boolean;
  createdAt: string;
  demoId: string;
}

export interface Client extends DemoDataFlags {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  projects: number;
  value: string;
  status: 'Active' | 'Prospect' | 'Inactive';
  lastContact: string;
  address: Address;
  company: string;
  notes: string;
}

export interface Project extends DemoDataFlags {
  id: number;
  name: string;
  client: string;
  clientId: number;
  manager: string;
  status:
    | 'In Progress'
    | 'Behind Schedule'
    | 'Nearly Complete'
    | 'On Hold'
    | 'Completed';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  team: number;
  tasks: number;
  completedTasks: number;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface Task extends DemoDataFlags {
  id: number;
  title: string;
  description: string;
  project: string;
  projectId: number;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
}

export interface Deal extends DemoDataFlags {
  id: number;
  title: string;
  client: string;
  clientId: number;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  closeDate: string;
  owner: string;
  notes: string;
  source: string;
  sortOrder?: number;
}

export interface TeamMember extends DemoDataFlags {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  startDate: string;
  avatar: string;
  status: 'Active' | 'Inactive';
}

export const demoDataService = {
  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const stored = await persistentStorage.getSetting(
        'demo_projects',
        'demo'
      );
      return stored || [];
    } catch (error) {
      console.warn('Failed to load projects from database:', error);
      return [];
    }
  },

  async saveProjects(projects: Project[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_projects', projects, 'demo');
    } catch (error) {
      console.warn('Failed to save projects to database:', error);
    }
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const stored = await persistentStorage.getSetting('demo_tasks', 'demo');
      return stored || [];
    } catch (error) {
      console.warn('Failed to load tasks from database:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_tasks', tasks, 'demo');
    } catch (error) {
      console.warn('Failed to save tasks to database:', error);
    }
  },

  // Customers/Clients
  async getCustomers(): Promise<Client[]> {
    try {
      const stored = await persistentStorage.getSetting(
        'demo_customers',
        'demo'
      );
      return stored || [];
    } catch (error) {
      console.warn('Failed to load customers from database:', error);
      return [];
    }
  },

  async saveCustomers(customers: Client[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_customers', customers, 'demo');
    } catch (error) {
      console.warn('Failed to save customers to database:', error);
    }
  },

  // Alias for clients (same as customers)
  async getClients(): Promise<Client[]> {
    return this.getCustomers();
  },

  async saveClients(clients: Client[]): Promise<void> {
    return this.saveCustomers(clients);
  },

  // Deals
  async getDeals(): Promise<Deal[]> {
    try {
      const stored = await persistentStorage.getSetting('demo_deals', 'demo');
      return stored || [];
    } catch (error) {
      console.warn('Failed to load deals from database:', error);
      return [];
    }
  },

  async saveDeals(deals: Deal[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_deals', deals, 'demo');
    } catch (error) {
      console.warn('Failed to save deals to database:', error);
    }
  },

  // Documents
  async getDocuments(): Promise<any[]> {
    try {
      const stored = await persistentStorage.getSetting(
        'demo_documents',
        'demo'
      );
      return stored || [];
    } catch (error) {
      console.warn('Failed to load documents from database:', error);
      return [];
    }
  },

  async saveDocuments(documents: any[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_documents', documents, 'demo');
    } catch (error) {
      console.warn('Failed to save documents to database:', error);
    }
  },

  // Activity Stream
  async getActivities(): Promise<any[]> {
    try {
      const stored = await persistentStorage.getSetting(
        'demo_activities',
        'demo'
      );
      return stored || [];
    } catch (error) {
      console.warn('Failed to load activities from database:', error);
      return [];
    }
  },

  async saveActivities(activities: any[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_activities', activities, 'demo');
    } catch (error) {
      console.warn('Failed to save activities to database:', error);
    }
  },

  // Clear all demo data
  async clearAllDemoData(): Promise<void> {
    try {
      await persistentStorage.clearDemoData();
    } catch (error) {
      console.warn('Failed to clear demo data from database:', error);
    }
  },

  // Generate demo data
  async generateDemoData(): Promise<void> {
    try {
      // Generate and save demo data
      const demoCustomers = generateDemoCustomers();
      const demoProjects = generateDemoProjects();
      const demoTasks = generateDemoTasks();
      const demoDeals = generateDemoDeals();

      await Promise.all([
        this.saveCustomers(demoCustomers),
        this.saveProjects(demoProjects),
        this.saveTasks(demoTasks),
        this.saveDeals(demoDeals),
      ]);
    } catch (error) {
      console.warn('Failed to generate demo data:', error);
    }
  },
};

// Demo data generation functions
function generateDemoCustomers(): Client[] {
  return [
    {
      id: 1,
      name: 'Greenfield Developments',
      contact: 'Tom Harvey',
      email: 'tom@greenfield.co.uk',
      phone: '+44 20 7123 4567',
      location: 'London',
      projects: 3,
      value: '£1.2M',
      status: 'Active',
      lastContact: '2 days ago',
      address: createAddress({
        street: '123 Canary Wharf',
        city: 'London',
        state: 'England',
        zip: 'E14 5AB',
        country: 'United Kingdom',
      }),
      company: 'Greenfield Developments Ltd',
      notes:
        'Key client for residential projects. Prefers sustainable building methods.',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-client-1',
    },
    {
      id: 2,
      name: 'Manchester Commercial Ltd',
      contact: 'Sarah Williams',
      email: 'sarah@manchestercommercial.co.uk',
      phone: '+44 161 987 6543',
      location: 'Manchester',
      projects: 2,
      value: '£850K',
      status: 'Active',
      lastContact: '1 week ago',
      address: createAddress({
        street: '456 Deansgate',
        city: 'Manchester',
        state: 'England',
        zip: 'M3 2LG',
        country: 'United Kingdom',
      }),
      company: 'Manchester Commercial Ltd',
      notes: 'Focus on office renovations and commercial spaces.',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-client-2',
    },
    {
      id: 3,
      name: 'Birmingham Retail Group',
      contact: 'James Mitchell',
      email: 'james@birminghamretail.co.uk',
      phone: '+44 121 456 7890',
      location: 'Birmingham',
      projects: 1,
      value: '£2.1M',
      status: 'Prospect',
      lastContact: '3 days ago',
      address: createAddress({
        street: '789 Bullring',
        city: 'Birmingham',
        state: 'England',
        zip: 'B5 4BU',
        country: 'United Kingdom',
      }),
      company: 'Birmingham Retail Group PLC',
      notes:
        'Large retail projects. Long approval process but high value contracts.',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-client-3',
    },
  ];
}

function generateDemoProjects(): Project[] {
  return [
    {
      id: 1,
      name: 'Canary Wharf Residential - Phase 2',
      client: 'Greenfield Developments',
      clientId: 1,
      manager: 'Tom Harvey',
      status: 'In Progress',
      progress: 75,
      budget: 850000,
      spent: 637500,
      startDate: '2023-09-15',
      endDate: '2024-03-15',
      team: 12,
      tasks: 45,
      completedTasks: 34,
      description:
        'Second phase of the residential development including 50 units',
      priority: 'High',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-project-1',
    },
    {
      id: 2,
      name: 'Deansgate Office Renovation',
      client: 'Manchester Commercial Ltd',
      clientId: 2,
      manager: 'Sarah Williams',
      status: 'Behind Schedule',
      progress: 45,
      budget: 320000,
      spent: 144000,
      startDate: '2023-11-01',
      endDate: '2024-02-28',
      team: 8,
      tasks: 32,
      completedTasks: 14,
      description: 'Complete renovation of 5-story office building',
      priority: 'Medium',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-project-2',
    },
    {
      id: 3,
      name: 'Birmingham Logistics Hub',
      client: 'Birmingham Retail Group',
      clientId: 3,
      manager: 'James Mitchell',
      status: 'Nearly Complete',
      progress: 90,
      budget: 1200000,
      spent: 1080000,
      startDate: '2023-06-01',
      endDate: '2024-01-20',
      team: 15,
      tasks: 58,
      completedTasks: 52,
      description: 'New 50,000 sq ft warehouse with automated systems',
      priority: 'High',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-project-3',
    },
  ];
}

function generateDemoTasks(): Task[] {
  return [
    {
      id: 1,
      title: 'Review architectural drawings for Phase 2',
      description:
        'Complete review of updated architectural plans and provide feedback on structural elements',
      project: 'Canary Wharf Residential - Phase 2',
      projectId: 1,
      assignee: 'Tom Harvey',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-01-25',
      tags: ['review', 'architecture'],
      estimatedHours: 8,
      actualHours: 6,
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-task-1',
    },
    {
      id: 2,
      title: 'Schedule HSE inspection',
      description:
        'Coordinate with HSE inspector for comprehensive site safety audit',
      project: 'Deansgate Office Renovation',
      projectId: 2,
      assignee: 'Sarah Williams',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-28',
      tags: ['safety', 'inspection'],
      estimatedHours: 4,
      actualHours: 0,
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-task-2',
    },
    {
      id: 3,
      title: 'Update project timeline',
      description:
        'Revise project schedule based on recent changes and material delivery delays',
      project: 'Birmingham Logistics Hub',
      projectId: 3,
      assignee: 'James Mitchell',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-01-22',
      tags: ['planning', 'timeline'],
      estimatedHours: 3,
      actualHours: 4,
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-task-3',
    },
  ];
}

function generateDemoDeals(): Deal[] {
  return [
    {
      id: 1,
      title: 'Canary Wharf Residential - Phase 3',
      client: 'Greenfield Developments',
      clientId: 1,
      value: 950000,
      stage: 'proposal',
      probability: 60,
      closeDate: '2024-03-15',
      owner: 'Tom Harvey',
      notes:
        'Follow-up to successful Phase 2. Client requesting sustainable building options and extended timeline.',
      source: 'Referral',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-deal-1',
    },
    {
      id: 2,
      title: 'Deansgate Office Modernization',
      client: 'Manchester Commercial Ltd',
      clientId: 2,
      value: 480000,
      stage: 'negotiation',
      probability: 80,
      closeDate: '2024-02-28',
      owner: 'Sarah Williams',
      notes: 'Negotiating timeline and payment terms',
      source: 'Website',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-deal-2',
    },
    {
      id: 3,
      title: 'Bullring Shopping Centre Extension',
      client: 'Birmingham Retail Group',
      clientId: 3,
      value: 2100000,
      stage: 'qualified',
      probability: 40,
      closeDate: '2024-06-30',
      owner: 'James Mitchell',
      notes:
        'Large project requiring extensive planning phase. Multiple stakeholders involved.',
      source: 'Trade Show',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-deal-3',
    },
  ];
}
