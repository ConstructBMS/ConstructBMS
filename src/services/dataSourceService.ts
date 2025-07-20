import { supabase } from './supabase';
import { demoDataService } from './demoDataService';

class DataSourceService {
  private static instance: DataSourceService;

  static getInstance(): DataSourceService {
    if (!DataSourceService.instance) {
      DataSourceService.instance = new DataSourceService();
    }
    return DataSourceService.instance;
  }

  // Check if we should use production data
  isProductionMode(): boolean {
    return sessionStorage.getItem('use_production_data') === 'true';
  }

  // Switch to production data mode
  switchToProduction(): void {
    console.log('🔄 Switching to production data sources...');
    sessionStorage.setItem('use_production_data', 'true');
    this.notifyComponents();
  }

  // Switch to demo data mode
  switchToDemo(): void {
    console.log('🔄 Switching to demo data sources...');
    sessionStorage.removeItem('use_production_data');
    this.notifyComponents();
  }

  // Notify all components of data source change
  private notifyComponents(): void {
    window.dispatchEvent(new CustomEvent('dataSourceChanged', { 
      detail: { useProductionData: this.isProductionMode() } 
    }));
  }

  // Get customers from appropriate source
  async getCustomers(): Promise<any[]> {
    if (this.isProductionMode()) {
      // Read from production customers table
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) {
        console.error('Error fetching production customers:', error);
        return [];
      }
      
      return data || [];
    } else {
      // Read from demo customers table
      const { data, error } = await supabase
        .from('demo_customers')
        .select('data');
      
      if (error) {
        console.error('Error fetching demo customers:', error);
        return [];
      }
      
      return data?.map(item => item.data) || [];
    }
  }

  // Get projects from appropriate source
  async getProjects(): Promise<any[]> {
    if (this.isProductionMode()) {
      // Read from production projects table
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) {
        console.error('Error fetching production projects:', error);
        return [];
      }
      
      return data || [];
    } else {
      // Read from demo projects table
      const { data, error } = await supabase
        .from('demo_projects')
        .select('data');
      
      if (error) {
        console.error('Error fetching demo projects:', error);
        return [];
      }
      
      return data?.map(item => item.data) || [];
    }
  }

  // Get tasks from appropriate source
  async getTasks(): Promise<any[]> {
    if (this.isProductionMode()) {
      // Read from production tasks table
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (error) {
        console.error('Error fetching production tasks:', error);
        return [];
      }
      
      return data || [];
    } else {
      // Read from demo tasks table
      const { data, error } = await supabase
        .from('demo_tasks')
        .select('data');
      
      if (error) {
        console.error('Error fetching demo tasks:', error);
        return [];
      }
      
      return data?.map(item => item.data) || [];
    }
  }

  // Get deals from appropriate source
  async getDeals(): Promise<any[]> {
    // For now, return empty array since the deals table doesn't exist
    return [];
  }

  // Get opportunities from appropriate source
  async getOpportunities(): Promise<any[]> {
    // For now, return empty array since the opportunities table doesn't exist
    return [];
  }

  // Get emails from appropriate source
  async getEmails(): Promise<any[]> {
    // For now, return empty array since the emails table doesn't exist
    return [];
  }

  // Get activities from appropriate source
  async getActivities(): Promise<any[]> {
    // For now, return empty array since the activities table doesn't exist
    return [];
  }

  // Get notifications from appropriate source
  async getNotifications(): Promise<any[]> {
    // For now, return empty array since the notifications table doesn't exist
    return [];
  }

  // Get chat messages from appropriate source
  async getChatMessages(): Promise<any[]> {
    // For now, return empty array since the chat_messages table doesn't exist
    return [];
  }

  // Get chat channels from appropriate source
  async getChatChannels(): Promise<any[]> {
    // For now, return empty array since the chat_channels table doesn't exist
    return [];
  }

  // Get metrics from appropriate source
  async getMetrics(): Promise<any> {
    // For now, return default metrics since the metrics table doesn't exist
    return this.getEmptyMetrics();
  }

  private getEmptyMetrics(): any {
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      totalCustomers: 0,
      activeCustomers: 0,
      totalRevenue: 0,
      totalDeals: 0,
      wonDeals: 0,
      lostDeals: 0,
      totalDocuments: 0,
      totalUsers: 0,
      totalEmailAccounts: 0,
      totalActivities: 0,
      totalNotifications: 0,
      totalChatMessages: 0,
      totalChatChannels: 0,
    };
  }

  // Save data to appropriate source
  async saveCustomers(customers: any[]): Promise<void> {
    if (this.isProductionMode()) {
      // Save to production customers table
      const { error } = await supabase
        .from('customers')
        .upsert(customers);
      
      if (error) {
        console.error('Error saving production customers:', error);
        throw error;
      }
    } else {
      // Save to demo customers table
      const { error } = await supabase
        .from('demo_customers')
        .upsert(customers.map(customer => ({
          id: customer.id,
          data: customer,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      
      if (error) {
        console.error('Error saving demo customers:', error);
        throw error;
      }
    }
  }

  async saveProjects(projects: any[]): Promise<void> {
    if (this.isProductionMode()) {
      // Save to production projects table
      const { error } = await supabase
        .from('projects')
        .upsert(projects);
      
      if (error) {
        console.error('Error saving production projects:', error);
        throw error;
      }
    } else {
      // Save to demo projects table
      const { error } = await supabase
        .from('demo_projects')
        .upsert(projects.map(project => ({
          id: project.id,
          data: project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      
      if (error) {
        console.error('Error saving demo projects:', error);
        throw error;
      }
    }
  }

  async saveTasks(tasks: any[]): Promise<void> {
    if (this.isProductionMode()) {
      // Save to production tasks table
      const { error } = await supabase
        .from('tasks')
        .upsert(tasks);
      
      if (error) {
        console.error('Error saving production tasks:', error);
        throw error;
      }
    } else {
      // Save to demo tasks table
      const { error } = await supabase
        .from('demo_tasks')
        .upsert(tasks.map(task => ({
          id: task.id,
          data: task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      
      if (error) {
        console.error('Error saving demo tasks:', error);
        throw error;
      }
    }
  }

  // Get current data source status
  getDataSourceStatus(): { description: string, mode: 'demo' | 'production'; } {
    const isProduction = this.isProductionMode();
    return {
      mode: isProduction ? 'production' : 'demo',
      description: isProduction 
        ? 'Reading from production tables (live data)'
        : 'Reading from demo tables (sample data)'
    };
  }

  // Clear all production tables (ensure they're empty)
  async clearProductionTables(): Promise<void> {
    console.log('🧹 Clearing all production tables...');
    
    try {
      // Only clear tables that exist
      const tablesToClear = ['customers', 'projects', 'tasks'];
      
      for (const tableName of tablesToClear) {
        try {
          await supabase.from(tableName).delete().neq('id', '');
          console.log(`✅ Cleared ${tableName} table`);
        } catch (error) {
          console.log(`⚠️ Table ${tableName} doesn't exist or couldn't be cleared:`, error);
        }
      }
      
      console.log('✅ Production tables cleared');
    } catch (error) {
      console.error('Error clearing production tables:', error);
      throw error;
    }
  }

  // Ensure demo data exists in demo tables only
  async ensureDemoDataInDemoTables(): Promise<void> {
    console.log('📊 Ensuring demo data exists in demo tables...');
    
    try {
      // Check if demo data exists in demo tables
      const { data: demoCustomers } = await supabase
        .from('demo_customers')
        .select('count')
        .limit(1);
      
      const { data: demoProjects } = await supabase
        .from('demo_projects')
        .select('count')
        .limit(1);
      
      const { data: demoTasks } = await supabase
        .from('demo_tasks')
        .select('count')
        .limit(1);
      
      // If demo data doesn't exist, generate it
      if (!demoCustomers?.length && !demoProjects?.length && !demoTasks?.length) {
        console.log('🔄 Demo data not found, generating...');
        await demoDataService.generateDemoData();
        console.log('✅ Demo data generated in demo tables');
      } else {
        console.log('✅ Demo data already exists in demo tables');
      }
    } catch (error) {
      console.error('Error ensuring demo data:', error);
      throw error;
    }
  }
}

export const dataSourceService = DataSourceService.getInstance(); 
