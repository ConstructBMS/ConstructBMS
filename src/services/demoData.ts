// Demo Data Service - All data marked as demo for easy deletion
import type { Address } from '../types';
import { createAddress } from '../types';
import { persistentStorage } from './persistentStorage';
import { supabase } from './supabase';

export interface DemoDataFlags {
  createdAt: string;
  demoId: string;
  isDemoData: boolean;
}

export interface Client extends DemoDataFlags {
  address: Address;
  company: string;
  contact: string;
  email: string;
  id: number;
  lastContact: string;
  location: string;
  name: string;
  notes: string;
  phone: string;
  projects: number;
  status: 'Active' | 'Prospect' | 'Inactive';
  value: string;
}

export interface Project extends DemoDataFlags {
  budget: number;
  client: string;
  clientId: number;
  completedTasks: number;
  description: string;
  endDate: string;
  id: number;
  manager: string;
  name: string;
  priority: 'Low' | 'Medium' | 'High';
  progress: number;
  spent: number;
  startDate: string;
  status:
    | 'In Progress'
    | 'Behind Schedule'
    | 'Nearly Complete'
    | 'On Hold'
    | 'Completed';
  tasks: number;
  team: number;
}

export interface Task extends DemoDataFlags {
  actualHours: number;
  assignee: string;
  description: string;
  dueDate: string;
  estimatedHours: number;
  id: number;
  priority: 'low' | 'medium' | 'high';
  project: string;
  projectId: number;
  status: 'pending' | 'in-progress' | 'completed';
  tags: string[];
  title: string;
}

export interface Deal extends DemoDataFlags {
  client: string;
  clientId: number;
  closeDate: string;
  id: number;
  notes: string;
  owner: string;
  probability: number;
  sortOrder?: number;
  source: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  title: string;
  value: number;
}

export interface TeamMember extends DemoDataFlags {
  avatar: string;
  department: string;
  email: string;
  id: number;
  name: string;
  phone: string;
  role: string;
  startDate: string;
  status: 'Active' | 'Inactive';
}

export interface Contractor extends DemoDataFlags {
  address: Address;
  availability: 'Available' | 'Busy' | 'Unavailable';
  certifications: string[];
  company: string;
  completedProjects: number;
  email: string;
  hourlyRate: number;
  id: number;
  insurance: boolean;
  lastWorked: string;
  name: string;
  notes: string;
  phone: string;
  rating: number;
  specialisation: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface Consultant extends DemoDataFlags {
  address: Address;
  availability: 'Available' | 'Busy' | 'Unavailable';
  company: string;
  completedProjects: number;
  email: string;
  hourlyRate: number;
  id: number;
  // How long they've been working with Napwood
  lastWorked: string;
  name: string;
  notes: string;
  phone: string;
  rating: number; 
  specialisations: string[]; 
  status: 'Active' | 'Inactive' | 'Suspended';
  totalBusinessValue: number;
  // Total value of projects worked on with Napwood
  workingRelationshipMonths: number;
}

export interface SubContractor extends DemoDataFlags {
  address: Address;
  availability: 'Available' | 'Busy' | 'Unavailable';
  certifications: string[];
  company: string;
  completedProjects: number;
  email: string;
  hourlyRate: number;
  id: number;
  insurance: boolean;
  lastWorked: string;
  name: string;
  notes: string;
  parentContractor?: number;
  phone: string;
  rating: number;
  specialisation: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface DemoCompany extends DemoDataFlags {
  address: Address;
  annualRevenue: number;
  assignedTo: string;
  description: string;
  email: string;
  employeeCount: number;
  founded: string;
  id: number;
  industry: string;
  lastContact: string;
  name: string;
  notes: string;
  phone: string;
  size: 'startup' | 'sme' | 'enterprise';
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  website: string;
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
      console.log('🧹 Clearing all demo data...');
      
      // Set flag immediately to prevent auto-regeneration
      sessionStorage.setItem('demo_data_just_cleared', 'true');
      console.log('✅ Clear flag set to prevent auto-regeneration');
      
      // Clear all demo data from persistent storage
      const demoKeys = [
        'demo_projects',
        'demo_customers', 
        'demo_tasks',
        'demo_deals',
        'demo_users',
        'demo_email_accounts',
        'demo_documents',
        'demo_activities',
        'demo_notifications',
        'demo_chat_channels',
        'demo_chat_messages',
        'demo_user_preferences',
        'demo_app_settings',
        'demo_contractors',
        'demo_subcontractors',
        'demo_companies',
        'demo_opportunities',
        'demo_invoices',
        'demo_expenses',
        'demo_time_entries',
        'demo_reports',
        'demo_templates',
        'demo_workflows',
        'demo_integrations',
        'demo_backups',
        'demo_logs',
        'demo_analytics',
        'demo_dashboard',
        'demo_crm',
        'demo_finance',
        'demo_hr',
        'demo_marketing',
        'demo_sales',
        'demo_support'
      ];

      // Clear all demo data using the persistent storage method
      try {
        await persistentStorage.clearDemoData();
        console.log('✅ All demo data cleared from database');
      } catch (error) {
        console.warn('⚠️ Failed to clear demo data:', error);
      }

      // Reset metrics to 0
      const resetMetrics = {
        totalProjects: 0,
        totalCustomers: 0,
        totalTasks: 0,
        totalDeals: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalHours: 0,
        activeUsers: 0,
        completedProjects: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        wonDeals: 0,
        lostDeals: 0,
        conversionRate: 0,
        averageProjectValue: 0,
        customerSatisfaction: 0,
        teamProductivity: 0,
        systemUptime: 100,
        dataIntegrity: 100,
        securityScore: 100
      };
      
      // Create clean demo data structure with empty arrays/objects
      const cleanDemoData = {
        'demo_metrics': resetMetrics,
        'demo_users': [],
        'demo_email_accounts': [],
        'demo_documents': [],
        'demo_activities': [],
        'demo_notifications': [],
        'demo_chat_channels': [],
        'demo_chat_messages': [],
        'demo_user_preferences': {},
        'demo_app_settings': {},
        'demo_contractors': [],
        'demo_subcontractors': [],
        'demo_companies': [],
        'demo_opportunities': [],
        'demo_invoices': [],
        'demo_expenses': [],
        'demo_time_entries': [],
        'demo_reports': [],
        'demo_templates': [],
        'demo_workflows': [],
        'demo_integrations': [],
        'demo_backups': [],
        'demo_logs': [],
        'demo_analytics': {},
        'demo_dashboard': {},
        'demo_crm': {},
        'demo_finance': {},
        'demo_hr': {},
        'demo_marketing': {},
        'demo_sales': {},
        'demo_support': {},
        'demo_projects': [],
        'demo_tasks': [],
        'demo_customers': [],
        'demo_deals': []
      };
      
      // Save all clean demo data
      for (const [key, value] of Object.entries(cleanDemoData)) {
        try {
          await persistentStorage.setSetting(key, value, 'demo');
          console.log(`✅ Created clean: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to create clean ${key}:`, error);
        }
      }
      
      console.log('✅ All demo data cleared and metrics reset to 0');
      
      // Verify the clear operation
      const remainingProjects = await this.getProjects();
      const remainingCustomers = await this.getCustomers();
      const remainingTasks = await this.getTasks();
      const remainingDeals = await this.getDeals();
      
      console.log('🔍 Verification - Remaining data:');
      console.log(`  Projects: ${remainingProjects.length}`);
      console.log(`  Customers: ${remainingCustomers.length}`);
      console.log(`  Tasks: ${remainingTasks.length}`);
      console.log(`  Deals: ${remainingDeals.length}`);
      
      if (remainingProjects.length > 0 || remainingCustomers.length > 0 || 
          remainingTasks.length > 0 || remainingDeals.length > 0) {
        console.warn('⚠️ Some demo data may still exist');
      } else {
        console.log('✅ Verification complete - all demo data cleared');
      }
      
    } catch (error) {
      console.error('❌ Failed to clear demo data:', error);
      throw error;
    }
  },

  // Manually remove the clear flag (for when user wants to regenerate demo data)
  removeClearFlag(): void {
    sessionStorage.removeItem('demo_data_just_cleared');
    console.log('✅ Demo data clear flag removed - demo data can now be generated');
  },

  // Check if demo data is currently blocked from generation
  isDemoDataBlocked(): boolean {
    return sessionStorage.getItem('demo_data_just_cleared') === 'true';
  },

  // Generate comprehensive demo data
  async generateDemoData(): Promise<void> {
    try {
      // Check if we just cleared the data (don't auto-regenerate)
      const wasJustCleared = sessionStorage.getItem('demo_data_just_cleared');
      if (wasJustCleared === 'true') {
        console.log('🚫 Demo data was just cleared, skipping generation');
        return;
      }

      console.log('🔄 Generating comprehensive demo data...');
      
      // Generate core demo data
      const demoCustomers = generateDemoCustomers();
      const demoProjects = generateDemoProjects();
      const demoTasks = generateDemoTasks();
      console.log('🔧 Generating Gantt tasks...');
      const demoGanttTasks = generateDemoGanttTasks();
      console.log('🔧 Gantt tasks generated:', demoGanttTasks.length, 'tasks');
      const demoDeals = generateDemoDeals();
      const demoContractors = generateDemoContractors();
      const demoConsultants = generateDemoConsultants();
      const demoSubContractors = generateDemoSubContractors();
      const demoCompanies = generateDemoCompanies();
      const demoUsers = generateDemoUsers();
      const demoEmailAccounts = generateDemoEmailAccounts();
      const demoDocuments = generateDemoDocuments();
      const demoActivities = generateDemoActivities();
      const demoNotifications = generateDemoNotifications();
      const demoChatChannels = generateDemoChatChannels();
      const demoChatMessages = generateDemoChatMessages();
      const demoMetrics = generateDemoMetrics();
      const demoUserPreferences = generateDemoUserPreferences();
      const demoAppSettings = generateDemoAppSettings();

      // Save all demo data
      await Promise.all([
        this.saveCustomers(demoCustomers),
        this.saveProjects(demoProjects),
        this.saveTasks(demoTasks),
        this.saveGanttTasks(demoGanttTasks),
        this.saveDeals(demoDeals),
        this.saveContractors(demoContractors),
        this.saveConsultants(demoConsultants),
        this.saveSubContractors(demoSubContractors),
        this.saveCompanies(demoCompanies),
        persistentStorage.setSetting('demo_users', demoUsers, 'demo'),
        persistentStorage.setSetting('demo_email_accounts', demoEmailAccounts, 'demo'),
        persistentStorage.setSetting('demo_documents', demoDocuments, 'demo'),
        persistentStorage.setSetting('demo_activities', demoActivities, 'demo'),
        persistentStorage.setSetting('demo_notifications', demoNotifications, 'demo'),
        persistentStorage.setSetting('demo_chat_channels', demoChatChannels, 'demo'),
        persistentStorage.setSetting('demo_chat_messages', demoChatMessages, 'demo'),
        persistentStorage.setSetting('demo_metrics', demoMetrics, 'demo'),
        persistentStorage.setSetting('demo_user_preferences', demoUserPreferences, 'demo'),
        persistentStorage.setSetting('demo_app_settings', demoAppSettings, 'demo'),
      ]);
      
      console.log('✅ Comprehensive demo data generated successfully');
    } catch (error) {
      console.warn('Failed to generate demo data:', error);
      throw error;
    }
  },

  // Check if demo data exists and generate if needed
  async ensureDemoDataExists(): Promise<void> {
    try {
      // Check if we just cleared the data (don't auto-regenerate)
      const wasJustCleared = sessionStorage.getItem('demo_data_just_cleared');
      if (wasJustCleared === 'true') {
        console.log('🚫 Demo data was just cleared, skipping auto-generation');
        return;
      }

      // Check if demo data exists in database
      const projects = await this.getProjects();
      const customers = await this.getCustomers();
      const tasks = await this.getTasks();
      const ganttTasks = await this.getGanttTasks();
      const deals = await this.getDeals();

      // If any of the demo data is empty, generate it
      if (!projects.length || !customers.length || !tasks.length || !ganttTasks.length || !deals.length) {
        await this.generateDemoData();
      }
    } catch (error) {
      console.warn('Failed to ensure demo data exists:', error);
    }
  },

  // Reset to demo data (clear existing and generate fresh)
  async resetToDemo(): Promise<void> {
    try {
      // First clear all existing demo data
      await this.clearAllDemoData();
      
      // Small delay to ensure clear operation is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the clear operation was successful
      const verification = await this.verifyDemoDataCleared();
      if (!verification.cleared) {
        console.warn('⚠️ Clear operation may not have been fully successful, but proceeding with reset');
      }
      
      // Then generate fresh demo data
      await this.generateDemoData();
    } catch (error) {
      console.warn('Failed to reset demo data:', error);
      throw error;
    }
  },

  // Force refresh all components by clearing their cached state
  async forceRefreshAllComponents(): Promise<void> {
    try {
      // Clear any cached data in memory
      this.clearCachedData();
      
      // Dispatch a custom event to notify all components to refresh
      const refreshEvent = new CustomEvent('demoDataRefreshed', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(refreshEvent);
    } catch (error) {
      console.error('❌ Failed to force refresh components:', error);
    }
  },

  // Clear all cached data in memory (for immediate UI updates)
  clearCachedData(): void {
    try {
      // Clear any cached data in various services
      // This ensures immediate UI updates without waiting for page reload
      
      // Clear localStorage cache
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('napwood_demo_') || key.includes('demo'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage cache
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('napwood_demo_') || key.includes('demo'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.error('❌ Failed to clear cached data:', error);
    }
  },

  // Verify that demo data has been cleared
  async verifyDemoDataCleared(): Promise<{ cleared: boolean; remainingData: any }> {
    try {
      console.log('🔍 Verifying all data has been cleared...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ User not authenticated:', userError);
        return { cleared: false, remainingData: { error: 'User not authenticated' } };
      }
      
      // Check all remaining data for this user
      const { data: remainingData, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);
      
      if (fetchError) {
        console.error('❌ Error fetching remaining data:', fetchError);
        return { cleared: false, remainingData: { error: fetchError.message } };
      }
      
      // Filter out super admin settings
      const nonAdminData = remainingData?.filter(item => item.key !== 'super_admin_email') || [];
      
      const verification = {
        totalEntries: nonAdminData.length,
        remainingKeys: nonAdminData.map(item => ({
          key: item.key,
          category: item.category,
          type: typeof item.value,
          isArray: Array.isArray(item.value),
          length: Array.isArray(item.value) ? item.value.length : 'N/A'
        })),
        superAdminSettings: remainingData?.filter(item => item.key === 'super_admin_email').length || 0
      };
      
      const isCleared = verification.totalEntries === 0;
      
      console.log('🔍 Verification results:', verification);
      console.log(isCleared ? '✅ All data successfully cleared' : `⚠️ ${verification.totalEntries} data entries still exist`);
      
      return {
        cleared: isCleared,
        remainingData: verification
      };
    } catch (error) {
      console.error('❌ Error verifying data:', error);
      return {
        cleared: false,
        remainingData: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  },

  // Test database connection and basic operations
  async testDatabaseConnection(): Promise<any> {
    try {
      console.log('🧪 Testing database connection...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ User not authenticated:', userError);
        return { error: 'User not authenticated' };
      }
      
      console.log('✅ User authenticated:', user.id);
      
      // Test a simple query
      const { data: testData, error: testError } = await supabase
        .from('user_settings')
        .select('count')
        .eq('user_id', user.id);
      
      if (testError) {
        console.error('❌ Database connection test failed:', testError);
        return { error: testError.message };
      }
      
      console.log('✅ Database connection successful');
      return { success: true, user: user.id };
      
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },

  // Debug method to check what data exists in the database
  async debugDemoDataStatus(): Promise<any> {
    try {
      console.log('🔍 Debugging all data status...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ User not authenticated:', userError);
        return { error: 'User not authenticated' };
      }
      
      // Check ALL data in database for this user
      const { data: allData, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);
      
      if (fetchError) {
        console.error('❌ Error fetching all data:', fetchError);
        return { error: fetchError.message };
      }
      
      // Separate demo data from other data
      const demoData = allData?.filter(item => item.category === 'demo') || [];
      const otherData = allData?.filter(item => item.category !== 'demo') || [];
      
      const status = {
        totalEntries: allData?.length || 0,
        demoEntries: demoData.length,
        otherEntries: otherData.length,
        demoKeys: demoData.map(item => ({
          key: item.key,
          type: typeof item.value,
          isArray: Array.isArray(item.value),
          length: Array.isArray(item.value) ? item.value.length : 'N/A'
        })),
        otherKeys: otherData.map(item => ({
          key: item.key,
          category: item.category,
          type: typeof item.value,
          isArray: Array.isArray(item.value),
          length: Array.isArray(item.value) ? item.value.length : 'N/A'
        })),
        user: user.id
      };
      
      console.log('🔍 All data status:', status);
      return status;
      
    } catch (error) {
      console.error('❌ Error debugging data:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },

  // Test function: Clear only customers and contractors
  async clearCustomersAndContractors(): Promise<void> {
    try {
      console.log('🧪 TESTING: Clearing only customers and contractors...');
      
      // Set flag immediately to prevent auto-regeneration
      sessionStorage.setItem('demo_data_just_cleared', 'true');
      console.log('✅ Clear flag set to prevent auto-regeneration');
      
      // Clear localStorage cache as well
      console.log('🧹 Clearing localStorage cache...');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('demo') || key.includes('customer') || key.includes('contractor'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed from localStorage: ${key}`);
      });
      
      // Clear all demo data from database
      try {
        await persistentStorage.clearDemoData();
        console.log('✅ All demo data cleared from database');
      } catch (error) {
        console.warn('⚠️ Failed to clear demo data:', error);
      }

      // Create clean demo data structure with empty customers and contractors
      const cleanDemoData = {
        'demo_customers': [],
        'demo_contractors': []
      };
      
      // Save clean customer and contractor data
      for (const [key, value] of Object.entries(cleanDemoData)) {
        try {
          await persistentStorage.setSetting(key, value, 'demo');
          console.log(`✅ Created clean: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to create clean ${key}:`, error);
        }
      }
      
      console.log('✅ Customers and contractors cleared');
      
      // Verify the clear operation
      const remainingCustomers = await this.getCustomers();
      const remainingContractors = await this.getContractors();
      
      console.log('🔍 Verification - Remaining data:');
      console.log(`  Customers: ${remainingCustomers.length}`);
      console.log(`  Contractors: ${remainingContractors.length}`);
      
      if (remainingCustomers.length > 0 || remainingContractors.length > 0) {
        console.warn('⚠️ Some customer/contractor data may still exist');
        console.log('🔍 Debug - Customer data:', remainingCustomers);
        console.log('🔍 Debug - Contractor data:', remainingContractors);
      } else {
        console.log('✅ Verification complete - customers and contractors cleared');
      }
      
      // Force refresh all components instead of page reload
      console.log('🔄 Refreshing all components...');
      await this.forceRefreshAllComponents();
      
    } catch (error) {
      console.error('❌ Failed to clear customers and contractors:', error);
      throw error;
    }
  },

  // Detailed test function: Clear only customers and contractors with full debugging
  async clearCustomersAndContractorsDetailed(): Promise<void> {
    try {
      console.log('🧪 DETAILED TEST: Clearing customers and contractors...');
      
      // Step 1: Check what's in the database BEFORE clearing
      console.log('📊 STEP 1: Checking database BEFORE clearing...');
      const beforeCustomers = await this.getCustomers();
      const beforeContractors = await this.getContractors();
      console.log(`📊 BEFORE - Customers: ${beforeCustomers.length}, Contractors: ${beforeContractors.length}`);
      
      // Step 2: Set clear flag
      sessionStorage.setItem('demo_data_just_cleared', 'true');
      console.log('✅ Clear flag set');
      
      // Step 3: Clear localStorage
      console.log('🧹 Clearing localStorage...');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('demo') || key.includes('customer') || key.includes('contractor'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed from localStorage: ${key}`);
      });
      
      // Step 4: Clear database with detailed logging
      console.log('🗄️ STEP 4: Clearing database...');
      try {
        const user = await supabase.auth.getUser();
        console.log('👤 Current user:', user.data.user?.id);
        
        // First, let's see what demo data exists
        const { data: existingData, error: selectError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.data.user?.id)
          .eq('category', 'demo');
        
        if (selectError) {
          console.error('❌ Error checking existing data:', selectError);
        } else {
          console.log('📊 Existing demo data in database:', existingData?.length || 0, 'records');
          existingData?.forEach(record => {
            console.log(`  - ${record.key}: ${Array.isArray(record.value) ? record.value.length : 'object'}`);
          });
        }
        
        // Now delete the demo data
        const { error: deleteError } = await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', user.data.user?.id)
          .eq('category', 'demo');
        
        if (deleteError) {
          console.error('❌ Error deleting demo data:', deleteError);
        } else {
          console.log('✅ Demo data deleted from database');
        }
        
        // Verify deletion
        const { data: afterData, error: verifyError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.data.user?.id)
          .eq('category', 'demo');
        
        if (verifyError) {
          console.error('❌ Error verifying deletion:', verifyError);
        } else {
          console.log('📊 After deletion - demo data records:', afterData?.length || 0);
        }
        
      } catch (error) {
        console.error('❌ Database operation failed:', error);
      }

      // Step 5: Create clean data
      console.log('📝 STEP 5: Creating clean data...');
      const cleanDemoData = {
        'demo_customers': [],
        'demo_contractors': []
      };
      
      for (const [key, value] of Object.entries(cleanDemoData)) {
        try {
          await persistentStorage.setSetting(key, value, 'demo');
          console.log(`✅ Created clean: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to create clean ${key}:`, error);
        }
      }
      
      // Step 6: Verify final state
      console.log('🔍 STEP 6: Verifying final state...');
      const afterCustomers = await this.getCustomers();
      const afterContractors = await this.getContractors();
      
      console.log('📊 FINAL STATE:');
      console.log(`  Customers: ${afterCustomers.length}`);
      console.log(`  Contractors: ${afterContractors.length}`);
      
      if (afterCustomers.length > 0 || afterContractors.length > 0) {
        console.warn('⚠️ Data still exists after clearing!');
        console.log('🔍 Customer data:', afterCustomers);
        console.log('🔍 Contractor data:', afterContractors);
      } else {
        console.log('✅ SUCCESS: All data cleared!');
      }
      
      // Step 7: Refresh components
      console.log('🔄 STEP 7: Refreshing components...');
      await this.forceRefreshAllComponents();
      
    } catch (error) {
      console.error('❌ Detailed test failed:', error);
      throw error;
    }
  },

  // Get contractors (if this method doesn't exist, we'll create it)
  async getContractors(): Promise<Contractor[]> {
    try {
      const contractors = await persistentStorage.getSetting('demo_contractors', 'demo');
      return contractors || [];
    } catch (error) {
      console.error('Failed to get contractors:', error);
      return [];
    }
  },

  async saveContractors(contractors: Contractor[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_contractors', contractors, 'demo');
    } catch (error) {
      console.warn('Failed to save contractors to database:', error);
    }
  },

  async getSubContractors(): Promise<SubContractor[]> {
    try {
      const subContractors = await persistentStorage.getSetting('demo_subcontractors', 'demo');
      return subContractors || [];
    } catch (error) {
      console.error('Failed to get sub-contractors:', error);
      return [];
    }
  },

  async saveSubContractors(subContractors: SubContractor[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_subcontractors', subContractors, 'demo');
    } catch (error) {
      console.warn('Failed to save sub-contractors to database:', error);
    }
  },

  // Consultants
  async getConsultants(): Promise<Consultant[]> {
    try {
      const stored = await persistentStorage.getSetting('demo_consultants', 'demo');
      return stored || [];
    } catch (error) {
      console.warn('Failed to load consultants from database:', error);
      return [];
    }
  },

  async saveConsultants(consultants: Consultant[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_consultants', consultants, 'demo');
    } catch (error) {
      console.warn('Failed to save consultants to database:', error);
    }
  },

  async getCompanies(): Promise<DemoCompany[]> {
    try {
      const companies = await persistentStorage.getSetting('demo_companies', 'demo');
      return companies || [];
    } catch (error) {
      console.error('Failed to get companies:', error);
      return [];
    }
  },

  async saveCompanies(companies: DemoCompany[]): Promise<void> {
    try {
      await persistentStorage.setSetting('demo_companies', companies, 'demo');
    } catch (error) {
      console.warn('Failed to save companies to database:', error);
    }
  },

  // Debug function: Check what's actually in the database
  async debugDatabaseContents(): Promise<any> {
    try {
      console.log('🔍 DEBUG: Checking database contents...');
      
      const customers = await this.getCustomers();
      const contractors = await this.getContractors();
      const projects = await this.getProjects();
      const tasks = await this.getTasks();
      const deals = await this.getDeals();
      
      const results = {
        customers: {
          count: customers.length,
          data: customers.slice(0, 3) // Show first 3 for debugging
        },
        contractors: {
          count: contractors.length,
          data: contractors.slice(0, 3)
        },
        projects: {
          count: projects.length,
          data: projects.slice(0, 3)
        },
        tasks: {
          count: tasks.length,
          data: tasks.slice(0, 3)
        },
        deals: {
          count: deals.length,
          data: deals.slice(0, 3)
        }
      };
      
      console.log('🔍 Database contents:', results);
      return results;
    } catch (error) {
      console.error('❌ Failed to debug database contents:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async regenerateDemoTasks(): Promise<void> {
    try {
      console.log('Regenerating demo tasks...');
      const newTasks = generateDemoTasks();
      await this.saveTasks(newTasks);
      console.log('Demo tasks regenerated successfully:', newTasks.length, 'tasks');
    } catch (error) {
      console.error('Failed to regenerate demo tasks:', error);
    }
  },

  async getGanttTasks(): Promise<any[]> {
    const stored = localStorage.getItem('demoGanttTasks');
    if (stored) {
      try {
        const tasks = JSON.parse(stored);
        // Convert date strings back to Date objects
        return tasks.map((task: any) => ({
          ...task,
          start: new Date(task.start || new Date()),
          end: new Date(task.end || new Date())
        }));
      } catch (error) {
        console.error('Error parsing stored Gantt tasks:', error);
      }
    }
    return [];
  },

  async saveGanttTasks(tasks: any[]): Promise<void> {
    localStorage.setItem('demoGanttTasks', JSON.stringify(tasks));
  },

  async regenerateGanttTasks(): Promise<void> {
    try {
      console.log('Regenerating demo Gantt tasks...');
      const ganttTasks = generateDemoGanttTasks();
      await this.saveGanttTasks(ganttTasks);
      console.log('Demo Gantt tasks regenerated successfully:', ganttTasks.length, 'tasks');
    } catch (error) {
      console.error('Failed to regenerate demo Gantt tasks:', error);
    }
  },

  async getEmailStats(): Promise<{ drafts: number, inbox: number; sentToday: number; unread: number; }> {
    // Generate mock email statistics for demo purposes
    const inbox = Math.floor(Math.random() * 50) + 20; // 20-70 emails
    const unread = Math.floor(Math.random() * 15) + 5; // 5-20 unread
    const sentToday = Math.floor(Math.random() * 8) + 2; // 2-10 sent today
    const drafts = Math.floor(Math.random() * 5) + 1; // 1-6 drafts
    
    return {
      inbox,
      unread,
      sentToday,
      drafts
    };
  },

  async getDemoCalendarEvents(): Promise<any[]> {
    try {
      const stored = await persistentStorage.getSetting('demo_calendar_events', 'demo');
      return stored || generateDemoCalendarEvents();
    } catch (error) {
      console.warn('Failed to load calendar events from database:', error);
      return generateDemoCalendarEvents();
    }
  },

  async isDemoMode(): Promise<boolean> {
    // Check if we're in demo mode
    // For now, return true to enable demo mode
    return true;
  },

  async initializeDemoTables(): Promise<boolean> {
    // This function is called during app initialization
    // For now, just return success
    return true;
  },
};

// Demo data generation functions
function generateDemoCustomers(): Client[] {
  return [
    {
      id: 1,
      name: 'Greenfield Developments',
      contact: 'Michael Greenfield',
      email: 'michael@greenfielddev.co.uk',
      phone: '+44 20 7946 0958',
      location: 'London',
      projects: 3,
      value: '£2.5M',
      status: 'Active',
      lastContact: '2024-01-15',
      address: createAddress({
        street: '25 Canary Wharf',
        city: 'London',
        state: 'England',
        zip: 'E14 5AB',
      }),
      company: 'Greenfield Developments Ltd',
      notes: 'Major residential developer with focus on sustainable building practices',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-customer-1',
    },
    {
      id: 2,
      name: 'Manchester Commercial Ltd',
      contact: 'Emma Thompson',
      email: 'emma.thompson@manchestercommercial.com',
      phone: '+44 161 496 0123',
      location: 'Manchester',
      projects: 2,
      value: '£850K',
      status: 'Active',
      lastContact: '2024-01-18',
      address: createAddress({
        street: '15 Deansgate',
        city: 'Manchester',
        state: 'England',
        zip: 'M3 2FF',
      }),
      company: 'Manchester Commercial Properties',
      notes: 'Commercial property management and development company',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-customer-2',
    },
    {
      id: 3,
      name: 'Birmingham Retail Group',
      contact: 'David Chen',
      email: 'david.chen@brg.co.uk',
      phone: '+44 121 496 0456',
      location: 'Birmingham',
      projects: 1,
      value: '£1.2M',
      status: 'Active',
      lastContact: '2024-01-20',
      address: createAddress({
        street: '45 Bull Street',
        city: 'Birmingham',
        state: 'England',
        zip: 'B4 6AF',
      }),
      company: 'Birmingham Retail Group Ltd',
      notes: 'Retail chain expanding logistics operations',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-customer-3',
    },
    {
      id: 4,
      name: 'Leeds Industrial Solutions',
      contact: 'Sarah Johnson',
      email: 'sarah.johnson@leedsindustrial.com',
      phone: '+44 113 496 0789',
      location: 'Leeds',
      projects: 0,
      value: '£500K',
      status: 'Active',
      lastContact: '2024-01-22',
      address: createAddress({
        street: '78 Wellington Street',
        city: 'Leeds',
        state: 'England',
        zip: 'LS1 2BA',
      }),
      company: 'Leeds Industrial Solutions Ltd',
      notes: 'New prospect - interested in warehouse automation systems',
      isDemoData: true,
      createdAt: '2024-01-04',
      demoId: 'demo-customer-4',
    },
    {
      id: 5,
      name: 'Liverpool Maritime Services',
      contact: 'Robert Wilson',
      email: 'robert.wilson@liverpoolmaritime.co.uk',
      phone: '+44 151 496 0321',
      location: 'Liverpool',
      projects: 1,
      value: '£750K',
      status: 'Active',
      lastContact: '2024-01-25',
      address: createAddress({
        street: '12 Albert Dock',
        city: 'Liverpool',
        state: 'England',
        zip: 'L3 4AA',
      }),
      company: 'Liverpool Maritime Services Ltd',
      notes: 'Port facility expansion project in planning phase',
      isDemoData: true,
      createdAt: '2024-01-05',
      demoId: 'demo-customer-5',
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
  const taskTemplates = [
    // Site Preparation Tasks
    { title: 'Site Survey and Assessment', description: 'Conduct comprehensive site survey including soil testing, environmental assessment, and utility mapping', estimatedHours: 16, tags: ['survey', 'site-prep'] },
    { title: 'Site Clearing and Demolition', description: 'Remove existing structures, vegetation, and prepare site for construction', estimatedHours: 24, tags: ['demolition', 'site-prep'] },
    { title: 'Excavation and Foundation Prep', description: 'Excavate foundation areas and prepare for concrete pouring', estimatedHours: 32, tags: ['excavation', 'foundation'] },
    { title: 'Utility Installation', description: 'Install underground utilities including water, electricity, and drainage systems', estimatedHours: 20, tags: ['utilities', 'infrastructure'] },
    
    // Foundation Tasks
    { title: 'Foundation Layout and Marking', description: 'Mark foundation locations and verify measurements according to architectural plans', estimatedHours: 8, tags: ['foundation', 'layout'] },
    { title: 'Concrete Foundation Pouring', description: 'Pour and finish concrete foundations with proper reinforcement', estimatedHours: 40, tags: ['concrete', 'foundation'] },
    { title: 'Foundation Curing and Inspection', description: 'Monitor concrete curing process and conduct quality inspections', estimatedHours: 12, tags: ['inspection', 'quality'] },
    
    // Structural Tasks
    { title: 'Steel Framework Installation', description: 'Install structural steel framework including beams, columns, and connections', estimatedHours: 48, tags: ['steel', 'structural'] },
    { title: 'Concrete Slab Installation', description: 'Install concrete floor slabs with proper reinforcement and finishing', estimatedHours: 36, tags: ['concrete', 'slab'] },
    { title: 'Roof Structure Assembly', description: 'Assemble roof trusses and install roof decking', estimatedHours: 28, tags: ['roof', 'structural'] },
    
    // MEP Installation Tasks
    { title: 'Electrical Rough-in', description: 'Install electrical conduits, wiring, and junction boxes throughout the building', estimatedHours: 44, tags: ['electrical', 'rough-in'] },
    { title: 'Plumbing Rough-in', description: 'Install plumbing pipes, drains, and water supply lines', estimatedHours: 40, tags: ['plumbing', 'rough-in'] },
    { title: 'HVAC Ductwork Installation', description: 'Install heating, ventilation, and air conditioning ductwork', estimatedHours: 32, tags: ['hvac', 'ductwork'] },
    { title: 'Fire Protection System', description: 'Install fire sprinklers, alarms, and emergency systems', estimatedHours: 24, tags: ['fire-protection', 'safety'] },
    
    // Interior Tasks
    { title: 'Drywall Installation', description: 'Install and finish drywall partitions and ceilings', estimatedHours: 56, tags: ['drywall', 'interior'] },
    { title: 'Interior Painting', description: 'Apply primer and finish coats to interior walls and ceilings', estimatedHours: 48, tags: ['painting', 'interior'] },
    { title: 'Flooring Installation', description: 'Install various flooring materials including tiles, carpet, and hardwood', estimatedHours: 52, tags: ['flooring', 'interior'] },
    { title: 'Cabinetry and Millwork', description: 'Install kitchen cabinets, bathroom vanities, and custom millwork', estimatedHours: 36, tags: ['cabinetry', 'millwork'] },
    
    // Exterior Tasks
    { title: 'Exterior Wall Construction', description: 'Build exterior walls using specified materials and insulation', estimatedHours: 60, tags: ['exterior', 'walls'] },
    { title: 'Roofing Installation', description: 'Install roof covering, flashing, and waterproofing systems', estimatedHours: 44, tags: ['roofing', 'exterior'] },
    { title: 'Exterior Painting', description: 'Apply exterior paint and protective coatings', estimatedHours: 40, tags: ['painting', 'exterior'] },
    { title: 'Landscaping and Hardscaping', description: 'Install landscaping features, walkways, and outdoor amenities', estimatedHours: 32, tags: ['landscaping', 'exterior'] },
    
    // Finishing Tasks
    { title: 'Interior Trim Installation', description: 'Install baseboards, crown molding, and decorative trim', estimatedHours: 28, tags: ['trim', 'finishing'] },
    { title: 'Lighting Fixture Installation', description: 'Install light fixtures, switches, and electrical outlets', estimatedHours: 24, tags: ['lighting', 'electrical'] },
    { title: 'Appliance Installation', description: 'Install kitchen appliances, HVAC units, and other equipment', estimatedHours: 20, tags: ['appliances', 'equipment'] },
    { title: 'Final Cleaning and Punch List', description: 'Perform final cleaning and address punch list items', estimatedHours: 16, tags: ['cleaning', 'punch-list'] },
    
    // Inspection and Testing Tasks
    { title: 'Building Code Inspection', description: 'Schedule and pass all required building code inspections', estimatedHours: 8, tags: ['inspection', 'code'] },
    { title: 'Systems Testing and Commissioning', description: 'Test all mechanical, electrical, and plumbing systems', estimatedHours: 20, tags: ['testing', 'commissioning'] },
    { title: 'Safety Systems Testing', description: 'Test fire alarms, emergency lighting, and security systems', estimatedHours: 12, tags: ['safety', 'testing'] },
    
    // Documentation Tasks
    { title: 'As-Built Documentation', description: 'Update drawings and documentation to reflect actual construction', estimatedHours: 16, tags: ['documentation', 'as-built'] },
    { title: 'Warranty Documentation', description: 'Compile warranty information and maintenance manuals', estimatedHours: 12, tags: ['documentation', 'warranty'] },
    { title: 'Project Closeout', description: 'Finalize project documentation and handover to client', estimatedHours: 8, tags: ['closeout', 'handover'] }
  ];

  const assignees = ['Tom Harvey', 'Sarah Williams', 'James Mitchell', 'Emma Thompson', 'Michael Chen', 'Lisa Rodriguez', 'David Wilson', 'Anna Johnson'];
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
  
  const tasks: Task[] = [];
  let taskId = 1;

  // Generate tasks for each project (only use projects that actually exist)
  const projects = [
    { id: 1, name: 'Canary Wharf Residential - Phase 2' },
    { id: 2, name: 'Deansgate Office Renovation' },
    { id: 3, name: 'Birmingham Logistics Hub' }
  ];

  projects.forEach(project => {
    // Generate 15-25 tasks per project
    const numTasks = Math.floor(Math.random() * 11) + 15; // 15-25 tasks
    
    for (let i = 0; i < numTasks; i++) {
      const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
      if (!template) continue; // Skip if no template found
      
      const assignee = assignees[Math.floor(Math.random() * assignees.length)] || 'Tom Harvey';
      const priority = priorities[Math.floor(Math.random() * priorities.length)] || 'medium';
      const status = statuses[Math.floor(Math.random() * statuses.length)] || 'pending';
      
      // Calculate due date based on current timeline
      const baseDate = new Date();
      const dueDateOffset = Math.floor(Math.random() * 365); // Within a year
      const dueDate = new Date(baseDate.getTime() + dueDateOffset * 24 * 60 * 60 * 1000);
      
      // Calculate actual hours based on status
      const actualHours = status === 'completed' 
        ? template.estimatedHours * (0.8 + Math.random() * 0.4) // 80-120% of estimated
        : status === 'in-progress'
          ? template.estimatedHours * Math.random() * 0.6 // 0-60% of estimated
          : 0;

      tasks.push({
        id: taskId++,
        title: template.title,
        description: template.description,
        project: project.name || 'Unknown Project',
        projectId: project.id,
        assignee,
        priority,
        status,
        dueDate: dueDate.toISOString().split('T')[0],
        tags: template.tags,
        estimatedHours: template.estimatedHours,
        actualHours: Math.round(actualHours * 10) / 10, // Round to 1 decimal
        isDemoData: true,
        createdAt: new Date(baseDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        demoId: `demo-task-${taskId - 1}`,
      });
    }
  });

  return tasks;
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

// Additional demo data generators
function generateDemoUsers(): any[] {
  return [
    {
      id: 1,
      name: 'Tom Harvey',
      email: 'tom@napwoodbusiness.co.uk',
      role: 'Project Manager',
      department: 'Project Management',
      avatar: '/avatars/tom.jpg',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-user-1',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      email: 'sarah@napwoodbusiness.co.uk',
      role: 'Senior Developer',
      department: 'Development',
      avatar: '/avatars/sarah.jpg',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-user-2',
    },
    {
      id: 3,
      name: 'James Mitchell',
      email: 'james@constructbms.co.uk',
      role: 'Sales Manager',
      department: 'Sales',
      avatar: '/avatars/james.jpg',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-user-3',
    },
  ];
}

function generateDemoEmailAccounts(): any[] {
  return [
    {
      id: 1,
      name: 'Main Office',
      email: 'info@constructbms.co.uk',
      type: 'SMTP',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-email-1',
    },
    {
      id: 2,
      name: 'Support',
      email: 'support@constructbms.co.uk',
      type: 'SMTP',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-email-2',
    },
  ];
}

function generateDemoDocuments(): any[] {
  return [
    {
      id: 1,
      title: 'Project Proposal Template',
      type: 'document',
      category: 'Templates',
      size: '2.5MB',
      lastModified: '2024-01-15',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-doc-1',
    },
    {
      id: 2,
      title: 'Contract Agreement',
      type: 'document',
      category: 'Legal',
      size: '1.8MB',
      lastModified: '2024-01-10',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-doc-2',
    },
  ];
}

function generateDemoActivities(): any[] {
  return [
    {
      id: 1,
      type: 'project_created',
      title: 'New project created',
      description: 'Canary Wharf Residential - Phase 2',
      timestamp: '2024-01-15T10:30:00Z',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-activity-1',
    },
    {
      id: 2,
      type: 'task_completed',
      title: 'Task completed',
      description: 'Review architectural drawings',
      timestamp: '2024-01-14T15:45:00Z',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-activity-2',
    },
  ];
}

function generateDemoNotifications(): any[] {
  return [
    {
      id: 1,
      type: 'mention',
      title: 'You were mentioned',
      message: 'Tom Harvey mentioned you in a project discussion',
      read: false,
      timestamp: '2024-01-15T09:00:00Z',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-notification-1',
    },
  ];
}

function generateDemoChatChannels(): any[] {
  return [
    {
      id: 1,
      name: 'General',
      type: 'system',
      members: ['all'],
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-channel-1',
    },
    {
      id: 2,
      name: 'Project Updates',
      type: 'project',
      members: ['project_team'],
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-channel-2',
    },
  ];
}

function generateDemoChatMessages(): any[] {
  return [
    {
      id: 1,
      channelId: 1,
      senderId: 1,
      content: 'Welcome to ConstructBMS!',
      timestamp: '2024-01-15T08:00:00Z',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-message-1',
    },
  ];
}

function generateDemoMetrics(): any {
  return {
    totalProjects: 3,
    activeProjects: 2,
    completedProjects: 1,
    totalTasks: 45,
    completedTasks: 34,
    pendingTasks: 11,
    totalCustomers: 3,
    activeCustomers: 3,
    totalRevenue: 2370000,
    totalDeals: 3,
    wonDeals: 1,
    lostDeals: 0,
    totalDocuments: 2,
    totalUsers: 3,
    totalEmailAccounts: 2,
    totalActivities: 2,
    totalNotifications: 1,
    totalChatMessages: 1,
    totalChatChannels: 2,
  };
}

function generateDemoUserPreferences(): any {
  return {
    theme: 'light',
    language: 'en',
    timezone: 'Europe/London',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    dashboard: {
      showMetrics: true,
      showRecentActivity: true,
      showQuickActions: true,
    },
  };
}

function generateDemoAppSettings(): any {
  return {
    company: {
      name: 'ConstructBMS',
      address: '123 Business Street, London, UK',
      phone: '+44 20 1234 5678',
      email: 'info@constructbms.co.uk',
    },
    features: {
      chat: true,
      email: true,
      documents: true,
      analytics: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 3600,
    },
  };
}

function generateDemoContractors(): Contractor[] {
  return [
    {
      id: 1,
      name: 'James Anderson',
      company: 'Anderson Construction Ltd',
      email: 'james@andersonconstruction.co.uk',
      phone: '+44 20 7946 0123',
      specialisation: 'Civil Engineering',
      hourlyRate: 95,
      availability: 'Available',
      rating: 4.9,
      completedProjects: 18,
      address: createAddress({
        street: '45 Bridge Street',
        city: 'London',
        state: 'England',
        zip: 'SW1A 1AA',
      }),
      insurance: true,
      certifications: ['CSCS', 'SSSTS', 'SMSTS', 'First Aid'],
      lastWorked: '2024-01-20',
      notes: 'Specialist in bridge and infrastructure projects',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-contractor-1',
    },
    {
      id: 2,
      name: 'Elena Petrov',
      company: 'Petrov Mechanical Services',
      email: 'elena@petrovmechanical.com',
      phone: '+44 161 496 0456',
      specialisation: 'Mechanical Engineering',
      hourlyRate: 75,
      availability: 'Busy',
      rating: 4.8,
      completedProjects: 14,
      address: createAddress({
        street: '23 Industrial Way',
        city: 'Manchester',
        state: 'England',
        zip: 'M1 1AA',
      }),
      insurance: true,
      certifications: ['Mechanical Engineering Degree', 'HVAC', 'Refrigeration'],
      lastWorked: '2024-01-18',
      notes: 'Expert in industrial HVAC and refrigeration systems',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-contractor-2',
    },
    {
      id: 3,
      name: 'Ahmed Hassan',
      company: 'Hassan Steel Fabrication',
      email: 'ahmed@hassansteel.co.uk',
      phone: '+44 121 496 0789',
      specialisation: 'Steel Fabrication',
      hourlyRate: 65,
      availability: 'Available',
      rating: 4.7,
      completedProjects: 22,
      address: createAddress({
        street: '67 Steel Works Road',
        city: 'Birmingham',
        state: 'England',
        zip: 'B1 1AA',
      }),
      insurance: true,
      certifications: ['Welding NVQ', 'Steel Fabrication', 'Coded Welder'],
      lastWorked: '2024-01-22',
      notes: 'Specialist in structural steel fabrication and welding',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-contractor-3',
    },
    {
      id: 4,
      name: 'Fiona MacLeod',
      company: 'MacLeod Landscaping',
      email: 'fiona@macleodlandscaping.com',
      phone: '+44 113 496 0321',
      specialisation: 'Landscaping & Groundworks',
      hourlyRate: 50,
      availability: 'Available',
      rating: 4.6,
      completedProjects: 12,
      address: createAddress({
        street: '89 Garden Lane',
        city: 'Leeds',
        state: 'England',
        zip: 'LS1 1AA',
      }),
      insurance: true,
      certifications: ['Landscaping NVQ', 'Groundworks', 'Tree Surgery'],
      lastWorked: '2024-01-25',
      notes: 'Expert in commercial landscaping and groundworks',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-04',
      demoId: 'demo-contractor-4',
    },
    {
      id: 5,
      name: 'Carlos Rodriguez',
      company: 'Rodriguez Tiling & Stonework',
      email: 'carlos@rodrigueztiling.co.uk',
      phone: '+44 151 496 0654',
      specialisation: 'Tiling & Stonework',
      hourlyRate: 55,
      availability: 'Unavailable',
      rating: 4.5,
      completedProjects: 8,
      address: createAddress({
        street: '12 Tile Street',
        city: 'Liverpool',
        state: 'England',
        zip: 'L1 1AA',
      }),
      insurance: true,
      certifications: ['Tiling NVQ', 'Stone Masonry', 'Marble Work'],
      lastWorked: '2024-01-15',
      notes: 'Currently on holiday until February 1st',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-05',
      demoId: 'demo-contractor-5',
    },
  ];
}

function generateDemoConsultants(): Consultant[] {
  return [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      company: 'Mitchell Consulting Group',
      email: 'sarah@mitchellconsulting.com',
      phone: '+44 20 7946 0123',
      specialisations: ['Digital Transformation', 'Change Management', 'Business Strategy'],
      hourlyRate: 250,
      availability: 'Available',
      rating: 4.9,
      completedProjects: 8,
      address: createAddress({
        street: '45 Consulting Street',
        city: 'London',
        state: 'England',
        zip: 'SW1A 1AA',
      }),
      totalBusinessValue: 4200000, // £4.2M total project value
      workingRelationshipMonths: 36, // 3 years
      lastWorked: '2024-01-20',
      notes: 'Senior digital transformation consultant with expertise in large-scale organizational change',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-consultant-1',
    },
    {
      id: 2,
      name: 'James Chen',
      company: 'Chen Technology Solutions',
      email: 'james@chentechnology.com',
      phone: '+44 161 496 0456',
      specialisations: ['Cloud Migration', 'DevOps', 'Technology Architecture'],
      hourlyRate: 200,
      availability: 'Busy',
      rating: 4.8,
      completedProjects: 12,
      address: createAddress({
        street: '23 Tech Avenue',
        city: 'Manchester',
        state: 'England',
        zip: 'M1 1AA',
      }),
      totalBusinessValue: 3100000, // £3.1M total project value
      workingRelationshipMonths: 24, // 2 years
      lastWorked: '2024-01-18',
      notes: 'Cloud infrastructure specialist with strong DevOps and automation expertise',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-consultant-2',
    },
    {
      id: 3,
      name: 'Dr. Emily Watson',
      company: 'Watson Analytics',
      email: 'emily@watsonanalytics.co.uk',
      phone: '+44 121 496 0789',
      specialisations: ['Data Analytics', 'AI/ML', 'Business Intelligence'],
      hourlyRate: 220,
      availability: 'Available',
      rating: 4.9,
      completedProjects: 6,
      address: createAddress({
        street: '67 Data Street',
        city: 'Birmingham',
        state: 'England',
        zip: 'B1 1AA',
      }),
      totalBusinessValue: 2800000, // £2.8M total project value
      workingRelationshipMonths: 18, // 1.5 years
      lastWorked: '2024-01-22',
      notes: 'Data science expert specializing in predictive analytics and machine learning',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-consultant-3',
    },
    {
      id: 4,
      name: 'Michael O\'Connor',
      company: 'O\'Connor Security Solutions',
      email: 'michael@oconnorsecurity.com',
      phone: '+44 113 496 0321',
      specialisations: ['Cybersecurity', 'Risk Management', 'Compliance'],
      hourlyRate: 180,
      availability: 'Available',
      rating: 4.7,
      completedProjects: 10,
      address: createAddress({
        street: '89 Security Lane',
        city: 'Leeds',
        state: 'England',
        zip: 'LS1 1AA',
      }),
      totalBusinessValue: 1900000, // £1.9M total project value
      workingRelationshipMonths: 30, // 2.5 years
      lastWorked: '2024-01-25',
      notes: 'Cybersecurity consultant with expertise in GDPR and ISO 27001 compliance',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-04',
      demoId: 'demo-consultant-4',
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      company: 'Thompson Process Optimization',
      email: 'lisa@thompsonprocess.co.uk',
      phone: '+44 151 496 0654',
      specialisations: ['Process Optimization', 'Lean Six Sigma', 'Operational Excellence'],
      hourlyRate: 160,
      availability: 'Unavailable',
      rating: 4.6,
      completedProjects: 15,
      address: createAddress({
        street: '12 Process Way',
        city: 'Liverpool',
        state: 'England',
        zip: 'L1 1AA',
      }),
      totalBusinessValue: 1500000, // £1.5M total project value
      workingRelationshipMonths: 42, // 3.5 years
      lastWorked: '2024-01-15',
      notes: 'Currently on sabbatical until March 1st',
      status: 'Active',
      isDemoData: true,
      createdAt: '2024-01-05',
      demoId: 'demo-consultant-5',
    },
  ];
}

function generateDemoSubContractors(): SubContractor[] {
  return [
    {
      id: 1,
      name: 'Alex Thompson',
      company: 'Thompson Scaffolding',
      email: 'alex@thompsonscaffolding.co.uk',
      phone: '+44 20 7946 0987',
      specialisation: 'Scaffolding',
      hourlyRate: 35,
      availability: 'Available',
      rating: 4.4,
      completedProjects: 20,
      address: createAddress({
        street: '34 Scaffold Road',
        city: 'London',
        state: 'England',
        zip: 'E1 1AA',
      }),
      insurance: true,
      certifications: ['CISRS', 'Working at Heights', 'Manual Handling'],
      lastWorked: '2024-01-21',
      notes: 'Sub-contractor for Smith Construction Ltd',
      status: 'Active',
      parentContractor: 1,
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-subcontractor-1',
    },
    {
      id: 2,
      name: 'Lisa Chen',
      company: 'Chen Painting Services',
      email: 'lisa@chenpainting.com',
      phone: '+44 161 496 0543',
      specialisation: 'Painting & Decorating',
      hourlyRate: 40,
      availability: 'Available',
      rating: 4.7,
      completedProjects: 14,
      address: createAddress({
        street: '56 Paint Street',
        city: 'Manchester',
        state: 'England',
        zip: 'M2 1AA',
      }),
      insurance: true,
      certifications: ['Painting NVQ', 'Asbestos Awareness', 'COSHH'],
      lastWorked: '2024-01-19',
      notes: 'Sub-contractor for Rodriguez Electrical Services',
      status: 'Active',
      parentContractor: 2,
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-subcontractor-2',
    },
    {
      id: 3,
      name: 'Mike Davis',
      company: 'Davis Demolition',
      email: 'mike@davisdemolition.co.uk',
      phone: '+44 121 496 0876',
      specialisation: 'Demolition & Site Clearance',
      hourlyRate: 50,
      availability: 'Busy',
      rating: 4.3,
      completedProjects: 8,
      address: createAddress({
        street: '78 Demolition Drive',
        city: 'Birmingham',
        state: 'England',
        zip: 'B2 1AA',
      }),
      insurance: true,
      certifications: ['Demolition NVQ', 'Asbestos Removal', 'Waste Management'],
      lastWorked: '2024-01-23',
      notes: 'Sub-contractor for Wilson Plumbing & Heating',
      status: 'Active',
      parentContractor: 3,
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-subcontractor-3',
    },
    {
      id: 4,
      name: 'Emma Wilson',
      company: 'Wilson Landscaping',
      email: 'emma@wilsonlandscaping.com',
      phone: '+44 113 496 0210',
      specialisation: 'Landscaping & Groundworks',
      hourlyRate: 38,
      availability: 'Available',
      rating: 4.6,
      completedProjects: 12,
      address: createAddress({
        street: '90 Garden Grove',
        city: 'Leeds',
        state: 'England',
        zip: 'LS2 1AA',
      }),
      insurance: true,
      certifications: ['Landscaping NVQ', 'Groundworks', 'Plant Operations'],
      lastWorked: '2024-01-24',
      notes: 'Sub-contractor for Johnson Roofing Solutions',
      status: 'Active',
      parentContractor: 4,
      isDemoData: true,
      createdAt: '2024-01-04',
      demoId: 'demo-subcontractor-4',
    },
    {
      id: 5,
      name: 'Tom Anderson',
      company: 'Anderson Security Systems',
      email: 'tom@andersonsecurity.co.uk',
      phone: '+44 151 496 0432',
      specialisation: 'Security Systems Installation',
      hourlyRate: 60,
      availability: 'Available',
      rating: 4.8,
      completedProjects: 6,
      address: createAddress({
        street: '43 Security Street',
        city: 'Liverpool',
        state: 'England',
        zip: 'L2 1AA',
      }),
      insurance: true,
      certifications: ['CCTV Installation', 'Access Control', 'Fire Alarms'],
      lastWorked: '2024-01-16',
      notes: 'Sub-contractor for Brown Flooring Ltd',
      status: 'Active',
      parentContractor: 5,
      isDemoData: true,
      createdAt: '2024-01-05',
      demoId: 'demo-subcontractor-5',
    },
  ];
}

function generateDemoCompanies(): DemoCompany[] {
  return [
    {
      id: 1,
      name: 'ConstructBMS Construction Group',
      industry: 'Construction',
      size: 'enterprise',
      website: 'https://constructbms.co.uk',
      phone: '+44 20 7946 0001',
      email: 'info@constructbms.co.uk',
      address: createAddress({
        street: '100 Construction Avenue',
        city: 'London',
        state: 'England',
        zip: 'SW1A 1AA',
      }),
      status: 'active',
      annualRevenue: 50000000,
      employeeCount: 250,
      founded: '1995-03-15',
      description: 'Leading construction company specializing in commercial and residential projects across the UK',
      lastContact: '2024-01-25',
      assignedTo: 'Tom Harvey',
      tags: ['construction', 'commercial', 'residential', 'sustainable'],
      notes: 'Long-term partner with excellent track record',
      isDemoData: true,
      createdAt: '2024-01-01',
      demoId: 'demo-company-1',
    },
    {
      id: 2,
      name: 'Manchester Property Developers',
      industry: 'Real Estate Development',
      size: 'sme',
      website: 'https://manchesterpropertydev.com',
      phone: '+44 161 496 0002',
      email: 'contact@manchesterpropertydev.com',
      address: createAddress({
        street: '25 Development Street',
        city: 'Manchester',
        state: 'England',
        zip: 'M1 1AA',
      }),
      status: 'active',
      annualRevenue: 15000000,
      employeeCount: 45,
      founded: '2010-07-22',
      description: 'Property development company focused on urban regeneration projects',
      lastContact: '2024-01-23',
      assignedTo: 'Sarah Williams',
      tags: ['property', 'development', 'urban', 'regeneration'],
      notes: 'Growing company with innovative approach to urban development',
      isDemoData: true,
      createdAt: '2024-01-02',
      demoId: 'demo-company-2',
    },
    {
      id: 3,
      name: 'Birmingham Industrial Solutions',
      industry: 'Manufacturing',
      size: 'enterprise',
      website: 'https://birminghamindustrial.com',
      phone: '+44 121 496 0003',
      email: 'info@birminghamindustrial.com',
      address: createAddress({
        street: '50 Industrial Park',
        city: 'Birmingham',
        state: 'England',
        zip: 'B1 1AA',
      }),
      status: 'active',
      annualRevenue: 75000000,
      employeeCount: 180,
      founded: '1988-11-10',
      description: 'Manufacturing company specializing in automotive and aerospace components',
      lastContact: '2024-01-20',
      assignedTo: 'James Mitchell',
      tags: ['manufacturing', 'automotive', 'aerospace', 'components'],
      notes: 'Major manufacturer with international operations',
      isDemoData: true,
      createdAt: '2024-01-03',
      demoId: 'demo-company-3',
    },
    {
      id: 4,
      name: 'Leeds Technology Solutions',
      industry: 'Technology',
      size: 'startup',
      website: 'https://leedstech.co.uk',
      phone: '+44 113 496 0004',
      email: 'hello@leedstech.co.uk',
      address: createAddress({
        street: '15 Innovation Hub',
        city: 'Leeds',
        state: 'England',
        zip: 'LS1 1AA',
      }),
      status: 'prospect',
      annualRevenue: 2000000,
      employeeCount: 12,
      founded: '2022-01-15',
      description: 'Startup technology company developing AI-powered business solutions',
      lastContact: '2024-01-22',
      assignedTo: 'Tom Harvey',
      tags: ['technology', 'startup', 'AI', 'software'],
      notes: 'Promising startup with innovative AI technology',
      isDemoData: true,
      createdAt: '2024-01-04',
      demoId: 'demo-company-4',
    },
    {
      id: 5,
      name: 'Liverpool Maritime Services',
      industry: 'Logistics & Transportation',
      size: 'sme',
      website: 'https://liverpoolmaritime.co.uk',
      phone: '+44 151 496 0005',
      email: 'info@liverpoolmaritime.co.uk',
      address: createAddress({
        street: '75 Dock Road',
        city: 'Liverpool',
        state: 'England',
        zip: 'L1 1AA',
      }),
      status: 'active',
      annualRevenue: 25000000,
      employeeCount: 85,
      founded: '2005-06-08',
      description: 'Maritime logistics and port services company',
      lastContact: '2024-01-25',
      assignedTo: 'Sarah Williams',
      tags: ['logistics', 'maritime', 'port', 'shipping'],
      notes: 'Established maritime services provider with port expansion plans',
      isDemoData: true,
      createdAt: '2024-01-05',
      demoId: 'demo-company-5',
    },
  ];
}

function generateDemoGanttTasks(): any[] {
  // Hierarchical WBS Structure - Parent/Child relationships
  const wbsStructure = [
    {
      id: '1.0',
      name: 'Pre-Construction Phase',
      type: 'summary',
      children: [
        { id: '1.1', name: 'Site Survey and Assessment', duration: 3, dependencies: [], isCritical: true },
        { id: '1.2', name: 'Permit Applications', duration: 14, dependencies: ['1.1'], isCritical: true },
        { id: '1.3', name: 'Design Finalization', duration: 21, dependencies: ['1.1'], isCritical: true },
        { id: '1.4', name: 'Material Procurement', duration: 10, dependencies: ['1.3'], isCritical: true },
        { id: '1.5', name: 'Contractor Selection', duration: 7, dependencies: ['1.3'], isCritical: false }
      ]
    },
    {
      id: '2.0',
      name: 'Site Preparation',
      type: 'summary',
      children: [
        { id: '2.1', name: 'Site Clearing and Demolition', duration: 5, dependencies: ['1.2'], isCritical: true },
        { id: '2.2', name: 'Excavation and Grading', duration: 8, dependencies: ['2.1'], isCritical: true },
        { id: '2.3', name: 'Utility Installation', duration: 6, dependencies: ['2.2'], isCritical: true },
        { id: '2.4', name: 'Site Security Setup', duration: 2, dependencies: ['2.1'], isCritical: false }
      ]
    },
    {
      id: '3.0',
      name: 'Foundation Work',
      type: 'summary',
      children: [
        { id: '3.1', name: 'Foundation Layout', duration: 3, dependencies: ['2.2'], isCritical: true },
        { id: '3.2', name: 'Concrete Foundation Pouring', duration: 7, dependencies: ['3.1'], isCritical: true },
        { id: '3.3', name: 'Foundation Curing', duration: 14, dependencies: ['3.2'], isCritical: true },
        { id: '3.4', name: 'Foundation Inspection', duration: 1, dependencies: ['3.3'], isCritical: true }
      ]
    },
    {
      id: '4.0',
      name: 'Structural Framework',
      type: 'summary',
      children: [
        { id: '4.1', name: 'Steel Framework Installation', duration: 12, dependencies: ['3.4'], isCritical: true },
        { id: '4.2', name: 'Concrete Slab Installation', duration: 8, dependencies: ['4.1'], isCritical: true },
        { id: '4.3', name: 'Roof Structure Assembly', duration: 10, dependencies: ['4.2'], isCritical: true },
        { id: '4.4', name: 'Structural Inspection', duration: 2, dependencies: ['4.3'], isCritical: true }
      ]
    },
    {
      id: '5.0',
      name: 'MEP Rough-in',
      type: 'summary',
      children: [
        { id: '5.1', name: 'Electrical Rough-in', duration: 15, dependencies: ['4.4'], isCritical: true },
        { id: '5.2', name: 'Plumbing Rough-in', duration: 12, dependencies: ['4.4'], isCritical: true },
        { id: '5.3', name: 'HVAC Ductwork Installation', duration: 10, dependencies: ['4.4'], isCritical: true },
        { id: '5.4', name: 'Fire Protection System', duration: 8, dependencies: ['4.4'], isCritical: true },
        { id: '5.5', name: 'MEP Inspection', duration: 3, dependencies: ['5.1', '5.2', '5.3', '5.4'], isCritical: true }
      ]
    },
    {
      id: '6.0',
      name: 'Exterior Work',
      type: 'summary',
      children: [
        { id: '6.1', name: 'Exterior Wall Construction', duration: 18, dependencies: ['5.5'], isCritical: true },
        { id: '6.2', name: 'Roofing Installation', duration: 12, dependencies: ['6.1'], isCritical: true },
        { id: '6.3', name: 'Exterior Painting', duration: 8, dependencies: ['6.1'], isCritical: false },
        { id: '6.4', name: 'Windows and Doors Installation', duration: 10, dependencies: ['6.1'], isCritical: true }
      ]
    },
    {
      id: '7.0',
      name: 'Interior Work',
      type: 'summary',
      children: [
        { id: '7.1', name: 'Drywall Installation', duration: 14, dependencies: ['5.5'], isCritical: true },
        { id: '7.2', name: 'Interior Painting', duration: 12, dependencies: ['7.1'], isCritical: false },
        { id: '7.3', name: 'Flooring Installation', duration: 16, dependencies: ['7.2'], isCritical: true },
        { id: '7.4', name: 'Cabinetry and Millwork', duration: 10, dependencies: ['7.3'], isCritical: true }
      ]
    },
    {
      id: '8.0',
      name: 'Finishing Work',
      type: 'summary',
      children: [
        { id: '8.1', name: 'Interior Trim Installation', duration: 8, dependencies: ['7.4'], isCritical: true },
        { id: '8.2', name: 'Lighting Fixture Installation', duration: 6, dependencies: ['8.1'], isCritical: true },
        { id: '8.3', name: 'Appliance Installation', duration: 4, dependencies: ['8.2'], isCritical: true },
        { id: '8.4', name: 'Final Cleaning', duration: 3, dependencies: ['8.3'], isCritical: true }
      ]
    },
    {
      id: '9.0',
      name: 'Final Phase',
      type: 'summary',
      children: [
        { id: '9.1', name: 'Building Code Inspection', duration: 2, dependencies: ['8.4'], isCritical: true },
        { id: '9.2', name: 'Systems Testing', duration: 5, dependencies: ['9.1'], isCritical: true },
        { id: '9.3', name: 'Punch List Completion', duration: 7, dependencies: ['9.2'], isCritical: true },
        { id: '9.4', name: 'Final Inspection', duration: 1, dependencies: ['9.3'], isCritical: true },
        { id: '9.5', name: 'Project Handover', duration: 1, dependencies: ['9.4'], isCritical: true }
      ]
    }
  ];

  const ganttTasks: any[] = [];
  let taskId = 1;

  // Generate Gantt tasks for each project (only use projects that actually exist)
  const projects = [
    { id: 1, name: 'Canary Wharf Residential - Phase 2' },
    { id: 2, name: 'Deansgate Office Renovation' },
    { id: 3, name: 'Birmingham Logistics Hub' }
  ];

  projects.forEach(project => {
    // Use current date as project start date
    const projectStartDate = new Date();
    let currentDate = new Date(projectStartDate);
    
    // Process WBS structure to create hierarchical tasks
    wbsStructure.forEach((phase, phaseIndex) => {
      // Add summary task (parent)
      const phaseStartDate = new Date(currentDate);
      const phaseEndDate = new Date(phaseStartDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days for summary
      
      ganttTasks.push({
        id: `gantt-${project.id}-${phase.id}`,
        name: phase.name,
        projectId: project.id,
        projectName: project.name,
        wbsId: phase.id,
        parentId: null,
        type: 'summary',
        start: phaseStartDate,
        end: phaseEndDate,
        duration: 30,
        dependencies: [],
        progress: 0,
        status: 'not-started',
        priority: 'medium',
        assignee: getRandomAssignee(),
        estimatedHours: 30 * 8,
        actualHours: 0,
        isCritical: false,
        isDemoData: true,
        createdAt: phaseStartDate.toISOString().split('T')[0],
        demoId: `demo-gantt-summary-${phase.id}`,
        expanded: true, // Default expanded
      });
      
      // Add child tasks
      phase.children.forEach((task, taskIndex) => {
        // Calculate start date based on dependencies
        let startDate = new Date(currentDate);
        if (task.dependencies.length > 0) {
          // Find the latest end date of dependencies
          const dependencyEndDates = task.dependencies.map((depId: string) => {
            const depTask = ganttTasks.find(t => t.wbsId === depId && t.projectId === project.id);
            return depTask ? new Date(depTask.end) : startDate;
          });
          startDate = new Date(Math.max(...dependencyEndDates.map((d: Date) => d.getTime())));
        }
        
        const endDate = new Date(startDate.getTime() + task.duration * 24 * 60 * 60 * 1000);
        
        // Calculate progress based on current date
        const now = new Date();
        let progress = 0;
        if (now >= endDate) {
          progress = 100;
        } else if (now > startDate) {
          progress = Math.round(((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100);
        }
        
        ganttTasks.push({
          id: `gantt-${project.id}-${task.id}`,
          name: task.name,
          projectId: project.id,
          projectName: project.name,
          wbsId: task.id,
          parentId: phase.id,
          type: 'task',
          start: startDate,
          end: endDate,
          duration: task.duration,
          dependencies: task.dependencies,
          progress: progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started',
          priority: task.isCritical ? 'high' : 'medium',
          assignee: getRandomAssignee(),
          estimatedHours: task.duration * 8,
          actualHours: progress > 0 ? Math.round(task.duration * 8 * (progress / 100) * (0.8 + Math.random() * 0.4)) : 0,
          isCritical: task.isCritical || false,
          isDemoData: true,
          createdAt: startDate.toISOString().split('T')[0],
          demoId: `demo-gantt-task-${task.id}`,
          expanded: false,
        });
        
        currentDate = new Date(endDate);
      });
    });
  });

  return ganttTasks;
}

function getRandomAssignee(): string {
  const assignees = [
    'Tom Harvey', 'Sarah Williams', 'James Mitchell', 'Emma Thompson', 
    'Michael Chen', 'Lisa Rodriguez', 'David Wilson', 'Anna Johnson',
    'Robert Brown', 'Jennifer Davis', 'Christopher Miller', 'Amanda Garcia'
  ];
  return assignees[Math.floor(Math.random() * assignees.length)];
}

function generateDemoCalendarEvents(): any[] {
  const events = [
    {
      id: 1,
      title: 'Project Kickoff Meeting',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      type: 'meeting',
      description: 'Initial project planning and team introduction',
      attendees: ['Tom Harvey', 'Sarah Williams', 'James Mitchell'],
      location: 'Conference Room A',
      isDemoData: true,
      createdAt: new Date().toISOString().split('T')[0],
      demoId: 'demo-calendar-1'
    },
    {
      id: 2,
      title: 'Site Inspection',
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
      type: 'site-visit',
      description: 'On-site assessment and measurements',
      attendees: ['James Mitchell', 'Emma Thompson'],
      location: 'Canary Wharf Site',
      isDemoData: true,
      createdAt: new Date().toISOString().split('T')[0],
      demoId: 'demo-calendar-2'
    },
    {
      id: 3,
      title: 'Client Presentation',
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours later
      type: 'presentation',
      description: 'Progress update and milestone review',
      attendees: ['Tom Harvey', 'Michael Greenfield', 'Sarah Williams'],
      location: 'Greenfield Developments Office',
      isDemoData: true,
      createdAt: new Date().toISOString().split('T')[0],
      demoId: 'demo-calendar-3'
    },
    {
      id: 4,
      title: 'Team Standup',
      start: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Today at 8 AM
      end: new Date(Date.now() + 8 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 30 minutes later
      type: 'meeting',
      description: 'Daily team status update',
      attendees: ['Tom Harvey', 'Sarah Williams', 'James Mitchell', 'Emma Thompson'],
      location: 'Virtual Meeting',
      isDemoData: true,
      createdAt: new Date().toISOString().split('T')[0],
      demoId: 'demo-calendar-4'
    },
    {
      id: 5,
      title: 'Material Delivery',
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      type: 'delivery',
      description: 'Steel framework materials arrival',
      attendees: ['James Mitchell'],
      location: 'Construction Site',
      isDemoData: true,
      createdAt: new Date().toISOString().split('T')[0],
      demoId: 'demo-calendar-5'
    }
  ];
  
  return events;
}
