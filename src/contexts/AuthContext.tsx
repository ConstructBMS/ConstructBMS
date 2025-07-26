import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { persistentStorage } from '../services/persistentStorage';

interface User {
  email: string;
  id: string;
  name: string;
  permissions: string[];
  role: 'super_admin' | 'admin' | 'employee';
}

interface AuthContextType {
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('useAuth: Context value:', context);
  if (context === undefined) {
    console.error('useAuth: Context is undefined - not within AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AuthProvider: Initializing...');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthProvider: Checking auth...');
        const token = await persistentStorage.getSetting('authToken', 'auth');
        if (token) {
          const demoUser: User = {
            id: '1',
            email: 'constructbms@gmail.com',
            name: 'Super Admin',
            role: 'super_admin',
            permissions: ['*'],
          };
          setUser(demoUser);
          console.log('AuthProvider: User set from token');
        } else {
          console.log('AuthProvider: No token found');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
        console.log('AuthProvider: Loading complete');
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Determine role based on email
      let role: 'super_admin' | 'admin' | 'employee' = 'employee';
      let name = email.split('@')[0];

      if (email === 'constructbms@gmail.com') {
        role = 'super_admin';
        name = 'ConstructBMS Admin';
      } else if (email.includes('admin')) {
        role = 'admin';
      }

      const demoUser: User = {
        id: '1',
        email,
        name,
        role,
        permissions: role === 'super_admin' ? ['*'] : ['read', 'write'],
      };
      await persistentStorage.setSetting('authToken', 'demo-token', 'auth');
      setUser(demoUser);
      console.log('Login successful:', { email, role, name });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await persistentStorage.setSetting('authToken', null, 'auth');
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
    setUser(null);
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'employee',
        permissions: ['read'],
      };
      await persistentStorage.setSetting('authToken', 'demo-token', 'auth');
      setUser(newUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Password reset requested for:', email);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return (
      user.permissions.includes('*') || user.permissions.includes(permission)
    );
  };

  const checkRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    resetPassword,
    checkPermission,
    checkRole,
  };

  console.log('AuthProvider: Rendering with value:', {
    isAuthenticated: !!user,
    isLoading,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
