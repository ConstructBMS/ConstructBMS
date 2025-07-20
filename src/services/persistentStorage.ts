import { supabase } from './supabase';

export interface PersistentSettings {
  category: string;
  created_at?: string;
  id?: string;
  key: string;
  organization_id?: string;
  updated_at?: string;
  user_id?: string;
  value: any;
}

export interface LogoSettings {
  mainLogo: {
    imageUrl?: string | null;
    text: string;
    type: 'text' | 'image';
  };
  sidebarLogo: {
    icon: string;
    imageUrl: string | null;
    type: 'icon' | 'image';
  };
}

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'auto';
}

export interface UserPreferences {
  [key: string]: any;
  activityStreamStatsExpanded: boolean;
  contractorsStatsExpanded: boolean;
  dashboardStatsExpanded: boolean;
  marketingStatsExpanded: boolean;
}

class PersistentStorageService {
  private async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  private async getOrganizationId() {
    // Generate a consistent UUID for the default organization
    // In a real app, this would come from the user's organization
    return '00000000-0000-0000-0000-000000000000';
  }

  async getSetting(key: string, category: string = 'general'): Promise<any> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.warn('No authenticated user found');
        return null;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', key)
        .eq('category', category)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        } else if (error.code === '42P01') {
          // Table doesn't exist
          console.error(
            'user_settings table does not exist. Please run the database migration.'
          );
          throw new Error(
            'Database table not found. Please run the migration script.'
          );
        } else {
          console.error('Error fetching setting:', error);
          throw error;
        }
      }

      return data?.value || null;
    } catch (error) {
      console.error('Error in getSetting:', error);
      throw error;
    }
  }

  async setSetting(
    key: string,
    value: any,
    category: string = 'general'
  ): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.warn('No authenticated user found');
        return false;
      }

      const organizationId = await this.getOrganizationId();

      const upsertData: any = {
        user_id: user.id,
        key,
        value,
        category,
        updated_at: new Date().toISOString(),
      };

      // Only include organization_id if it's not null
      if (organizationId !== null) {
        upsertData.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(upsertData, {
          onConflict: 'user_id,key,category',
        });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          console.error(
            'user_settings table does not exist. Please run the database migration.'
          );
          throw new Error(
            'Database table not found. Please run the migration script.'
          );
        } else {
          console.error('Error setting setting:', error);
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in setSetting:', error);
      throw error;
    }
  }

  async getLogoSettings(): Promise<LogoSettings | null> {
    const settings = await this.getSetting('logo_settings', 'appearance');
    return settings;
  }

  async setLogoSettings(settings: LogoSettings): Promise<boolean> {
    return await this.setSetting('logo_settings', settings, 'appearance');
  }

  async getThemeSettings(): Promise<ThemeSettings | null> {
    const settings = await this.getSetting('theme_settings', 'appearance');
    return settings;
  }

  async setThemeSettings(settings: ThemeSettings): Promise<boolean> {
    return await this.setSetting('theme_settings', settings, 'appearance');
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    const preferences = await this.getSetting(
      'user_preferences',
      'preferences'
    );
    return preferences;
  }

  async setUserPreferences(preferences: UserPreferences): Promise<boolean> {
    return await this.setSetting(
      'user_preferences',
      preferences,
      'preferences'
    );
  }

  async getEmailAccounts(): Promise<any[]> {
    const accounts = await this.getSetting('email_accounts', 'email');
    return accounts || [];
  }

  async setEmailAccounts(accounts: any[]): Promise<boolean> {
    return await this.setSetting('email_accounts', accounts, 'email');
  }

  async getStickyNotes(): Promise<any[]> {
    const notes = await this.getSetting('sticky_notes', 'notes');
    return notes || [];
  }

  async setStickyNotes(notes: any[]): Promise<boolean> {
    return await this.setSetting('sticky_notes', notes, 'notes');
  }

  async getActivityStream(): Promise<any[]> {
    const activities = await this.getSetting('activity_stream', 'activity');
    return activities || [];
  }

  async setActivityStream(activities: any[]): Promise<boolean> {
    return await this.setSetting('activity_stream', activities, 'activity');
  }

  async getDemoData(category: string): Promise<any> {
    const data = await this.getSetting(`demo_data_${category}`, 'demo');
    return data;
  }

  async setDemoData(category: string, data: any): Promise<boolean> {
    return await this.setSetting(`demo_data_${category}`, data, 'demo');
  }

  async clearDemoData(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('category', 'demo');

      if (error) {
        console.error('Error clearing demo data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearDemoData:', error);
      return false;
    }
  }

  async getProfileData(): Promise<any> {
    const profile = await this.getSetting('profile_data', 'profile');
    return profile;
  }

  async setProfileData(profileData: any): Promise<boolean> {
    return await this.setSetting('profile_data', profileData, 'profile');
  }

  async getAvatar(): Promise<string | null> {
    const avatar = await this.getSetting('avatar', 'profile');
    return avatar;
  }

  async setAvatar(avatarUrl: string): Promise<boolean> {
    return await this.setSetting('avatar', avatarUrl, 'profile');
  }

  // Helper method to check if database is ready
  async checkDatabaseReady(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      // Try a simple query to check if table exists
      const { error } = await supabase
        .from('user_settings')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        return false; // Table doesn't exist
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Test function to check persistent storage
  async testPersistentStorage(): Promise<{ error?: string, success: boolean; }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      // Test writing data
      const testData = { test: true, timestamp: new Date().toISOString() };
      const writeSuccess = await this.setSetting('test_key', testData, 'test');

      if (!writeSuccess) {
        return { success: false, error: 'Failed to write test data' };
      }

      // Test reading data
      const readData = await this.getSetting('test_key', 'test');

      if (!readData || readData.test !== true) {
        return { success: false, error: 'Failed to read test data' };
      }

      // Clean up test data
      await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('key', 'test_key')
        .eq('category', 'test');

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const persistentStorage = new PersistentStorageService();
