import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

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
        const token = localStorage.getItem('authToken');
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
      const demoUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'employee',
        permissions: ['*'],
      };
      localStorage.setItem('authToken', 'demo-token');
      setUser(demoUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
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
      localStorage.setItem('authToken', 'demo-token');
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
