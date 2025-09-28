import React, { createContext, useContext, useEffect, useState } from 'react';
import { DemoModeInitService } from '../services/demo-mode-init.service';

// Define the user type based on Supabase's actual user structure
interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
  app_metadata?: {
    role?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider. Context:', context);
    // Return a fallback context to prevent crashes during development
    return {
      user: null,
      loading: false,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
      isDemoMode: true,
    };
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  console.log('AuthProvider rendering with user:', user, 'loading:', loading);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we're in demo mode (no Supabase configured)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Always use demo mode for development/testing
      const isDemo = true;
      setIsDemoMode(isDemo);

      if (isDemo) {
        // Demo mode - create or use demo user
        let demoUser = localStorage.getItem('demoUser');
        if (!demoUser) {
          // Create a demo user if none exists
          const newDemoUser: User = {
            id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for demo user
            email: 'demo@constructbms.com',
            user_metadata: {
              name: 'Demo User',
            },
            app_metadata: {
              role: 'super_admin',
            },
          };
          localStorage.setItem('demoUser', JSON.stringify(newDemoUser));
          demoUser = JSON.stringify(newDemoUser);
        }

        if (demoUser) {
          setUser(JSON.parse(demoUser));
        }
        setLoading(false);
        return;
      }

      // Production mode - check for stored token
      const token = localStorage.getItem('authToken');
      console.log(
        '🔐 Checking for stored token:',
        token ? 'Found' : 'Not found'
      );

      if (token) {
        try {
          // Verify token with backend
          const apiUrl = 'http://localhost:5174';
          console.log('🔐 Verifying token with backend...');
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Token verified successfully:', data);
            const user: User = {
              id: data.data.user.id,
              email: data.data.user.email,
              user_metadata: {
                name: data.data.user.name,
              },
              app_metadata: {
                role: data.data.user.role,
              },
            };
            setUser(user);
            console.log('👤 User session restored:', user);

            // Initialize demo mode after successful authentication
            try {
              await DemoModeInitService.initializeDemoMode();
            } catch (error) {
              console.error('Error initializing demo mode:', error);
            }
          } else {
            // Token is invalid, remove it
            console.log('❌ Token invalid, removing from storage');
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        console.log('🔐 No stored token found');
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Always use demo mode for development/testing
    const demoUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for demo user
      email: email || 'demo@constructbms.com',
      user_metadata: {
        name: email ? email.split('@')[0] : 'Demo User',
      },
      app_metadata: {
        role: 'super_admin',
      },
    };
    setUser(demoUser);
    // Store demo user in localStorage for persistence
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    return;
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Always use demo mode for development/testing
    const demoUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for demo user
      email: email,
      user_metadata: {
        name: name,
      },
      app_metadata: {
        role: 'super_admin',
      },
    };
    setUser(demoUser);
    // Store demo user in localStorage for persistence
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    return;
  };

  const signOut = async () => {
    // Always use demo mode for development/testing
    localStorage.removeItem('demoUser');
    setUser(null);
    return;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isDemoMode,
  };

  console.log('AuthProvider providing value:', value);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
