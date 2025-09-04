import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are configured
if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === 'https://your-project.supabase.co' ||
  supabaseAnonKey === 'your-anon-key'
) {
  console.warn(
    '⚠️ Supabase credentials not configured. Please set up your environment variables.'
  );
  console.warn('📝 Add your Supabase URL and anon key to .env.local file');
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // Check if credentials are properly configured
    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl === 'https://your-project.supabase.co' ||
      supabaseAnonKey === 'your-anon-key'
    ) {
      console.warn('Supabase not configured - using demo mode');
      return false;
    }

    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Table names for easy reference
export const TABLES = {
  USERS: 'users',
  MODULES: 'modules',
  MENU_ITEMS: 'menu_items',
  CLIENTS: 'clients',
  CONTRACTORS: 'contractors',
  CONSULTANTS: 'consultants',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  NOTES: 'notes',
  DOCUMENTS: 'documents',
  USER_MODULES: 'user_modules',
  USER_ROLES: 'user_roles',
} as const;
