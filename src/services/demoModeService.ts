import { supabase } from './supabaseAuth';

/**
 * Enterprise-grade demo mode management service
 * Handles persistent server-side demo mode flag
 */
export class DemoModeService {
  private static instance: DemoModeService;
  private cachedMode: boolean | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DemoModeService {
    if (!DemoModeService.instance) {
      DemoModeService.instance = new DemoModeService();
    }
    return DemoModeService.instance;
  }

  /**
   * Get current demo mode status from server
   * Uses caching to avoid excessive database calls
   */
  async getDemoMode(): Promise<boolean> {
    try {
      // Check cache first
      if (this.cachedMode !== null && Date.now() < this.cacheExpiry) {
        return this.cachedMode;
      }

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.warn('No authenticated user found for demo mode check');
        return false;
      }

      // Query user's demo mode status from database
      const { data, error } = await supabase
        .from('users')
        .select('demo_mode')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Demo mode column not found in users table, defaulting to demo mode. Run the database migration first.');
        // Default to demo mode for new users or when column doesn't exist
        return true;
      }

      const isDemoMode = data?.demo_mode ?? true; // Default to demo mode

      // Update cache
      this.cachedMode = isDemoMode;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log(`📊 Demo mode status: ${isDemoMode ? 'DEMO' : 'LIVE'}`);
      return isDemoMode;
    } catch (error) {
      console.error('Error in getDemoMode:', error);
      return false; // Default to live mode on error
    }
  }

  /**
   * Set demo mode status (server-side)
   */
  async setDemoMode(isDemo: boolean): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('No authenticated user found');
      }

      // Update user's demo mode status
      const { error } = await supabase
        .from('users')
        .update({ 
          demo_mode: isDemo,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update cache
      this.cachedMode = isDemo;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log(`🔄 Demo mode set to: ${isDemo ? 'DEMO' : 'LIVE'}`);
    } catch (error) {
      console.error('Error setting demo mode:', error);
      throw error;
    }
  }

  /**
   * Clear demo data and transition to live mode
   * This is the main action users take to "start fresh"
   */
  async clearDemoDataAndTransitionToLive(): Promise<void> {
    try {
      console.log('🔄 Starting demo data clear and live mode transition...');

      // Step 1: Clear all demo data from database
      await this.clearAllDemoData();

      // Step 2: Set demo mode to false (live mode)
      await this.setDemoMode(false);

      // Step 3: Clear any cached demo data
      this.clearCache();

      console.log('✅ Successfully transitioned to live mode');
    } catch (error) {
      console.error('Error transitioning to live mode:', error);
      throw error;
    }
  }

  /**
   * Clear all demo data from database
   */
  private async clearAllDemoData(): Promise<void> {
    try {
      console.log('🧹 Clearing all demo data...');

      // List of demo tables to clear
      const demoTables = [
        'demo_customers',
        'demo_projects',
        'demo_tasks',
        'demo_deals',
        'demo_opportunities',
        'demo_emails',
        'demo_activities',
        'demo_notifications',
        'demo_chat_messages',
        'demo_chat_channels',
        'demo_metrics'
      ];

      // Clear each demo table
      for (const tableName of demoTables) {
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

          if (error && !error.message?.includes('does not exist')) {
            console.warn(`Warning clearing ${tableName}:`, error);
          } else {
            console.log(`✅ Cleared ${tableName}`);
          }
        } catch (error) {
          console.warn(`Warning clearing ${tableName}:`, error);
        }
      }

      // Clear demo settings from user_settings table
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('user_settings')
            .delete()
            .eq('user_id', user.id)
            .eq('category', 'demo');

          if (error && !error.message?.includes('does not exist')) {
            console.warn('Warning clearing demo settings:', error);
          } else {
            console.log('✅ Cleared demo settings');
          }
        }
      } catch (error) {
        console.warn('Warning clearing demo settings:', error);
      }

      console.log('✅ All demo data cleared');
    } catch (error) {
      console.error('Error clearing demo data:', error);
      throw error;
    }
  }

  /**
   * Clear the demo mode cache
   */
  private clearCache(): void {
    this.cachedMode = null;
    this.cacheExpiry = 0;
  }

  /**
   * Force refresh the demo mode status (clear cache and re-fetch)
   */
  async refreshDemoMode(): Promise<boolean> {
    this.clearCache();
    return await this.getDemoMode();
  }

  /**
   * Check if user is in demo mode (with caching)
   */
  async isDemoMode(): Promise<boolean> {
    return await this.getDemoMode();
  }

  /**
   * Check if user is in live mode (with caching)
   */
  async isLiveMode(): Promise<boolean> {
    return !(await this.getDemoMode());
  }
}

// Export singleton instance
export const demoModeService = DemoModeService.getInstance(); 
