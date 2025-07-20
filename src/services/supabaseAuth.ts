import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl =
  import.meta.env['VITE_SUPABASE_URL'] ||
  'https://rleprzlnxhhckdzbptzm.supabase.co';
const supabaseAnonKey =
  import.meta.env['VITE_SUPABASE_ANON_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZXByemxueGhoY2tkemJwdHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NjMxOTcsImV4cCI6MjA2NzAzOTE5N30.Aw-dM-8TKqUfBTm7Er-apo6xvhKTfDW98l1pK_kdWRA';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types for the user roles response
export interface UserRole {
    description: string;
    id: string;
    is_active: boolean;
    is_system_role: boolean;
    name: string;
    permissions: string[];
  role_id: string;
  roles: {
};
}

// Function to get the current user's JWT token
export const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

// Function to make authenticated REST API calls
export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    // Get the current user's JWT token
    const token = await getCurrentUserToken();

    if (!token) {
      throw new Error('No authentication token available');
    }

    // Prepare headers with both apikey and Authorization
    const headers = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Make the request
    const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('REST API error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authenticated request failed:', error);
    throw error;
  }
};

// Function to get user roles with proper authentication
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  try {
    const endpoint = `user_roles?select=role_id,roles(id,name,description,permissions,is_system_role,is_active)&user_id=eq.${userId}`;

    const roles = await makeAuthenticatedRequest(endpoint);
    return roles;
  } catch (error) {
    console.error('❌ Failed to load user roles:', error);
    throw error;
  }
};

// Function to sign in with proper error handling
export const signInWithPassword = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign-in error:', error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Sign-in failed:', error);
    throw error;
  }
};

// Function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Sign-out error:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('Sign-out failed:', error);
    throw error;
  }
};

// Function to get current user
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ Get user error:', error.message);
      throw error;
    }

    return user;
  } catch (error) {
    console.error('Get current user failed:', error);
    throw error;
  }
};

// Function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    return false;
  }
};
