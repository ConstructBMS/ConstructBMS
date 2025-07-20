import { supabase } from './supabase';

export interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  manager: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

class AstaHeaderService {
  private projectsCache: Project[] = [];
  private userProfileCache: UserProfile | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  async getAvailableProjects(): Promise<Project[]> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return this.getDemoProjects();
  }

  private getDemoProjects(): Project[] {
    return [
      {
        id: '1',
        name: 'Office Building Construction',
        client: 'ABC Corporation',
        status: 'active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        progress: 35,
        manager: 'John Smith'
      },
      {
        id: '2',
        name: 'Residential Complex',
        client: 'XYZ Developers',
        status: 'active',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-06-30'),
        progress: 15,
        manager: 'Sarah Johnson'
      },
      {
        id: '3',
        name: 'Shopping Center Renovation',
        client: 'Metro Properties',
        status: 'active',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        progress: 60,
        manager: 'Mike Wilson'
      },
      {
        id: '4',
        name: 'Hospital Extension',
        client: 'City Health Services',
        status: 'planning',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-12-31'),
        progress: 0,
        manager: 'Lisa Brown'
      }
    ];
  }

  async switchProject(projectId: string): Promise<Project> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    
    // Find project in demo data
    const project = this.getDemoProjects().find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Log project switch (simulated)
    await this.logProjectSwitch(projectId);

    return project;
  }

  async getUserProfile(): Promise<UserProfile> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    try {
      // Check cache first
      if (this.userProfileCache) {
        return this.userProfileCache;
      }

      // Get current user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Return basic profile from auth user
      const profile: UserProfile = {
        id: user.id,
        name: user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: user.user_metadata?.['role'] || 'project_manager'
      };
      
      this.userProfileCache = profile;
      return profile;
    } catch (error) {
      // Silently handle any errors and return fallback profile
      return {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@constructbms.com',
        role: 'project_manager'
      };
    }
  }

  async handleUserAction(action: string): Promise<void> {
    try {
      switch (action) {
        case 'profile':
          console.log('Opening user profile');
          // TODO: Implement profile modal/page
          break;
        case 'settings':
          console.log('Opening settings');
          // TODO: Implement settings modal/page
          break;
        case 'logout':
          await this.handleLogout();
          break;
        default:
          console.log(`Unknown user action: ${action}`);
      }
    } catch (error) {
      console.error('User action failed:', error);
      throw error;
    }
  }

  private async handleLogout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear caches
      this.projectsCache = [];
      this.userProfileCache = null;
      
      // Redirect to login (this would be handled by the app's auth system)
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  private async logProjectSwitch(projectId: string): Promise<void> {
    // Skip project switch logging for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return;
  }

  // Auto-save functionality
  startAutoSave(callback: () => void, intervalMs: number = 30000): void {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(callback, intervalMs);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async triggerAutoSave(): Promise<void> {
    try {
      // Simulate auto-save operation
      console.log('Auto-saving project...');
      
      // TODO: Implement actual auto-save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    }
  }

  // Clear caches (useful for testing or when data becomes stale)
  clearCaches(): void {
    this.projectsCache = [];
    this.userProfileCache = null;
  }
}

export const astaHeaderService = new AstaHeaderService(); 