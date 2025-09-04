import React, { createContext, useContext, useEffect, useState } from 'react';

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
    throw new Error('useAuth must be used within an AuthProvider');
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

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we're in demo mode (no Supabase configured)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const isDemo =
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl === 'https://your-project.supabase.co' ||
        supabaseAnonKey === 'your-anon-key';

      setIsDemoMode(isDemo);

      if (isDemo) {
        // Demo mode - check for demo user in localStorage
        const demoUser = localStorage.getItem('demoUser');
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
    if (isDemoMode) {
      // Demo mode - simulate successful login
      const demoUser: User = {
        id: 'demo-user-123',
        email: email,
        user_metadata: {
          name: email.split('@')[0],
        },
        app_metadata: {
          role: 'admin',
        },
      };
      setUser(demoUser);
      // Store demo user in localStorage for persistence
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      return;
    }

    try {
      // Use our backend API for authentication
      const apiUrl = 'http://localhost:5174'; // Hardcoded for debugging
      const fullUrl = `${apiUrl}/api/auth/login`;
      console.log('API URL:', apiUrl);
      console.log('Full URL:', fullUrl);
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Create a user object that matches our User interface
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
      console.log('👤 User signed in successfully:', user);

      // Store the token for future API calls
      localStorage.setItem('authToken', data.data.token);
      console.log('🔐 Token stored in localStorage');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (isDemoMode) {
      // Demo mode - simulate successful signup
      const demoUser: User = {
        id: 'demo-user-123',
        email: email,
        user_metadata: {
          name: name,
        },
        app_metadata: {
          role: 'user',
        },
      };
      setUser(demoUser);
      // Store demo user in localStorage for persistence
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      return;
    }

    try {
      // Use our backend API for registration
      const apiUrl = 'http://localhost:5174'; // Hardcoded for debugging
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Create a user object that matches our User interface
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

      // Store the token for future API calls
      localStorage.setItem('authToken', data.data.token);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      // Demo mode - simulate signout
      localStorage.removeItem('demoUser');
      setUser(null);
      return;
    }

    try {
      // Clear the stored token
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
