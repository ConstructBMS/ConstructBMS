import { useDemoModeStore } from '../app/store/demo-mode.store';
import { supabase } from './supabase';

export class DemoModeInitService {
  /**
   * Initialize demo mode on app startup
   * This should be called when the app loads
   */
  static async initializeDemoMode(): Promise<void> {
    try {
      // Check if user has permission to manage demo data
      const canManage = await this.checkDemoDataPermissions();

      // Update the store with permission status
      useDemoModeStore.getState().setCanManageDemoData(canManage);

      // Check if we're in demo mode by looking at the data
      const isDemoMode = await this.checkIfInDemoMode();
      useDemoModeStore.getState().setDemoMode(isDemoMode);

      // Get demo data count
      if (isDemoMode) {
        const stats = await this.getDemoDataStats();
        useDemoModeStore.getState().setDemoDataCount(stats.totalRecords);
      }
    } catch (error) {
      console.error('Error initializing demo mode:', error);
      // Default to demo mode if there's an error
      useDemoModeStore.getState().setDemoMode(true);
    }
  }

  /**
   * Check if the system is currently in demo mode
   */
  private static async checkIfInDemoMode(): Promise<boolean> {
    try {
      // Check if there's any demo data in the system
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('is_demo_data', true)
        .limit(1);

      if (error) {
        console.error('Error checking demo mode:', error);
        return true; // Default to demo mode
      }

      // If there's demo data, we're in demo mode
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking demo mode:', error);
      return true; // Default to demo mode
    }
  }

  /**
   * Check if user has permission to manage demo data
   */
  private static async checkDemoDataPermissions(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      // Check if user is admin or super admin
      const { data: userData } = await supabase
        .from('users')
        .select('role, permissions')
        .eq('id', user.id)
        .single();

      if (!userData) return false;

      // Super admin and admin roles can manage demo data
      return (
        ['super_admin', 'admin'].includes(userData.role) ||
        (userData.permissions &&
          userData.permissions.includes('manage_demo_data'))
      );
    } catch (error) {
      console.error('Error checking demo data permissions:', error);
      return false;
    }
  }

  /**
   * Get demo data statistics
   */
  private static async getDemoDataStats(): Promise<{ totalRecords: number }> {
    try {
      const [
        projectsResult,
        contactsResult,
        tasksResult,
        invoicesResult,
        expensesResult,
        usersResult,
        documentsResult,
      ] = await Promise.all([
        supabase
          .from('projects')
          .select('id', { count: 'exact' })
          .eq('is_demo_data', true),

        supabase
          .from('contacts')
          .select('id', { count: 'exact' })
          .eq('is_demo_data', true),

        supabase
          .from('tasks')
          .select('id', { count: 'exact' })
          .eq('is_demo_data', true),

        supabase
          .from('invoices')
          .select('id', { count: 'exact' })
          .eq('is_demo_data', true),

        supabase
          .from('expenses')
          .select('id', { count: 'exact' })
          .eq('is_demo_data', true),

        supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('is_demo_data', true),

        supabase
          .from('documents')
          .select('id', { count: 'exact' })
          .eq('is_demo_data', true),
      ]);

      const totalRecords =
        (projectsResult.count || 0) +
        (contactsResult.count || 0) +
        (tasksResult.count || 0) +
        (invoicesResult.count || 0) +
        (expensesResult.count || 0) +
        (usersResult.count || 0) +
        (documentsResult.count || 0);

      return { totalRecords };
    } catch (error) {
      console.error('Error fetching demo data stats:', error);
      return { totalRecords: 0 };
    }
  }
}
