import { supabase } from './supabase';

export interface DemoDataStats {
  totalRecords: number;
  categories: {
    projects: number;
    contacts: number;
    tasks: number;
    invoices: number;
    expenses: number;
    users: number;
    documents: number;
  };
}

export class DemoDataService {
  /**
   * Get statistics about demo data in the system
   */
  static async getDemoDataStats(): Promise<DemoDataStats> {
    try {
      // Count demo data across all tables
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

      return {
        totalRecords,
        categories: {
          projects: projectsResult.count || 0,
          contacts: contactsResult.count || 0,
          tasks: tasksResult.count || 0,
          invoices: invoicesResult.count || 0,
          expenses: expensesResult.count || 0,
          users: usersResult.count || 0,
          documents: documentsResult.count || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching demo data stats:', error);
      throw new Error('Failed to fetch demo data statistics');
    }
  }

  /**
   * Delete all demo data from the system
   */
  static async deleteAllDemoData(): Promise<void> {
    try {
      // Delete in reverse dependency order to avoid foreign key constraints
      const deleteOperations = [
        // Delete dependent records first
        supabase.from('task_comments').delete().eq('is_demo_data', true),
        supabase.from('project_members').delete().eq('is_demo_data', true),
        supabase.from('invoice_items').delete().eq('is_demo_data', true),
        supabase.from('expense_attachments').delete().eq('is_demo_data', true),
        supabase.from('document_versions').delete().eq('is_demo_data', true),

        // Delete main records
        supabase.from('tasks').delete().eq('is_demo_data', true),
        supabase.from('invoices').delete().eq('is_demo_data', true),
        supabase.from('expenses').delete().eq('is_demo_data', true),
        supabase.from('documents').delete().eq('is_demo_data', true),
        supabase.from('projects').delete().eq('is_demo_data', true),
        supabase.from('contacts').delete().eq('is_demo_data', true),

        // Delete demo users (but keep admin users)
        supabase.from('users').delete().eq('is_demo_data', true),
      ];

      await Promise.all(deleteOperations);

      // Log the cleanup action
      await supabase.from('audit_logs').insert({
        action: 'demo_data_cleanup',
        description:
          'All demo data has been deleted and system switched to live mode',
        user_id: (await supabase.auth.getUser()).data.user?.id,
        metadata: {
          cleanup_date: new Date().toISOString(),
          system_mode: 'live',
        },
      });
    } catch (error) {
      console.error('Error deleting demo data:', error);
      throw new Error('Failed to delete demo data. Please try again.');
    }
  }

  /**
   * Mark existing data as demo data (for initial setup)
   */
  static async markExistingDataAsDemo(): Promise<void> {
    try {
      const markAsDemoOperations = [
        supabase
          .from('projects')
          .update({ is_demo_data: true })
          .neq('is_demo_data', false),
        supabase
          .from('contacts')
          .update({ is_demo_data: true })
          .neq('is_demo_data', false),
        supabase
          .from('tasks')
          .update({ is_demo_data: true })
          .neq('is_demo_data', false),
        supabase
          .from('invoices')
          .update({ is_demo_data: true })
          .neq('is_demo_data', false),
        supabase
          .from('expenses')
          .update({ is_demo_data: true })
          .neq('is_demo_data', false),
        supabase
          .from('documents')
          .update({ is_demo_data: true })
          .neq('is_demo_data', false),
        // Don't mark admin users as demo data
        supabase
          .from('users')
          .update({ is_demo_data: true })
          .eq('role', 'employee'),
      ];

      await Promise.all(markAsDemoOperations);
    } catch (error) {
      console.error('Error marking data as demo:', error);
      throw new Error('Failed to mark existing data as demo data');
    }
  }

  /**
   * Check if user has permission to manage demo data
   */
  static async checkDemoDataPermissions(): Promise<boolean> {
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
}
