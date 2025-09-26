// Demo data management for ConstructBMS
// This file handles storing and clearing demo data from the database

export interface DemoDataItem {
  id: string;
  type: 'project' | 'opportunity' | 'client' | 'sticky-note' | 'task';
  data: any;
  created_at: string;
}

export class DemoDataManager {
  private static readonly DEMO_PREFIX = 'demo-';

  /**
   * Check if an ID is a demo item
   */
  static isDemoItem(id: string): boolean {
    return id.startsWith(this.DEMO_PREFIX);
  }

  /**
   * Generate a demo ID
   */
  static generateDemoId(type: string): string {
    return `${this.DEMO_PREFIX}${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all demo data from localStorage
   */
  static getDemoData(): DemoDataItem[] {
    try {
      const stored = localStorage.getItem('demo-data');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add demo data item
   */
  static addDemoData(type: DemoDataItem['type'], data: any): string {
    const id = this.generateDemoId(type);
    const demoItem: DemoDataItem = {
      id,
      type,
      data,
      created_at: new Date().toISOString(),
    };

    const existingData = this.getDemoData();
    existingData.push(demoItem);
    localStorage.setItem('demo-data', JSON.stringify(existingData));

    return id;
  }

  /**
   * Remove demo data item
   */
  static removeDemoData(id: string): void {
    const existingData = this.getDemoData();
    const filteredData = existingData.filter(item => item.id !== id);
    localStorage.setItem('demo-data', JSON.stringify(filteredData));
  }

  /**
   * Clear all demo data
   */
  static clearAllDemoData(): void {
    localStorage.removeItem('demo-data');

    // Clear all demo-related localStorage items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes('demo') ||
          key.includes('store') ||
          key.startsWith('sticky-notes') ||
          key.startsWith('projects') ||
          key.startsWith('opportunities'))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get demo data by type
   */
  static getDemoDataByType(type: DemoDataItem['type']): DemoDataItem[] {
    return this.getDemoData().filter(item => item.type === type);
  }

  /**
   * Check if demo data exists
   */
  static hasDemoData(): boolean {
    return this.getDemoData().length > 0;
  }

  /**
   * Export demo data for backup
   */
  static exportDemoData(): string {
    return JSON.stringify(this.getDemoData(), null, 2);
  }

  /**
   * Import demo data from backup
   */
  static importDemoData(data: string): void {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        localStorage.setItem('demo-data', data);
      }
    } catch (error) {
      console.error('Failed to import demo data:', error);
    }
  }
}

// Demo data templates
export const DEMO_DATA_TEMPLATES = {
  projects: [
    {
      id: 'proj-1',
      name: 'Office Building Construction',
      status: 'in-progress',
      description: 'New 5-story office building in downtown area',
      budget: 2500000,
      start_date: '2024-01-15',
      end_date: '2024-12-31',
    },
    {
      id: 'proj-2',
      name: 'Warehouse Renovation',
      status: 'planning',
      description: 'Complete renovation of existing warehouse facility',
      budget: 850000,
      start_date: '2024-02-01',
      end_date: '2024-08-31',
    },
    {
      id: 'proj-3',
      name: 'Residential Complex',
      status: 'in-progress',
      description: '50-unit residential complex with amenities',
      budget: 1800000,
      start_date: '2024-01-01',
      end_date: '2024-10-31',
    },
  ],

  opportunities: [
    {
      id: 'opp-1',
      name: 'Tech Startup Office Lease',
      stage: 'proposal',
      value: 150000,
      description: 'Office space fit-out for growing tech company',
    },
    {
      id: 'opp-2',
      name: 'Retail Store Fit-Out',
      stage: 'qualified',
      value: 75000,
      description: 'Complete retail space renovation',
    },
    {
      id: 'opp-3',
      name: 'Restaurant Renovation',
      stage: 'negotiation',
      value: 120000,
      description: 'Kitchen and dining area renovation',
    },
  ],

  clients: [
    {
      id: 'client-1',
      name: 'John Smith',
      email: 'john@acmecorp.com',
      phone: '+1-555-0123',
      company: 'ACME Corp',
    },
    {
      id: 'client-2',
      name: 'Sarah Johnson',
      email: 'sarah@techstart.com',
      phone: '+1-555-0456',
      company: 'TechStart Inc',
    },
    {
      id: 'client-3',
      name: 'Mike Wilson',
      email: 'mike@buildco.com',
      phone: '+1-555-0789',
      company: 'BuildCo Ltd',
    },
  ],

  stickyNotes: [
    {
      id: 'note-1',
      title: 'Welcome to ConstructBMS',
      content:
        'Getting Started: Explore the dashboard, Create your first project, Add team members, Set up your workflow, Happy building!',
      color: 'yellow',
      tags: ['welcome', 'getting-started'],
    },
    {
      id: 'note-2',
      title: 'Team Meeting Agenda',
      content:
        "Weekly Team Meeting - Monday 9:00 AM\n\n1. Review project progress\n2. Discuss upcoming deadlines\n3. Address any blockers\n4. Plan next week's priorities",
      color: 'purple',
      tags: ['meeting', 'agenda', 'team'],
    },
    {
      id: 'note-3',
      title: 'Client Feedback - Excellent',
      content:
        'Client Meeting Summary:\n\n✅ Project timeline approved\n✅ Budget confirmed\n✅ Quality standards met\n✅ Communication excellent',
      color: 'green',
      tags: ['client', 'feedback', 'positive'],
    },
  ],
};
