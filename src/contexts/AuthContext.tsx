import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, User, Role } from '../types/auth';
import { Permissions, SystemRoles } from '../types/auth';
import {
  supabase,
  getUserRoles,
  signInWithPassword,
  signOut,
  getCurrentUser,
} from '../services/supabaseAuth';
import { supabaseServices } from '../services/supabaseService';
import { persistentStorage } from '../services/persistentStorage';

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
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Supabase is configured
  const isSupabaseConfigured = () => {
    const url = import.meta.env['VITE_SUPABASE_URL'] || '';
    const key = import.meta.env['VITE_SUPABASE_ANON_KEY'] || '';
    const isConfigured =
      url &&
      key &&
      url !== 'https://your-project.supabase.co' &&
      url !== 'https://localhost' &&
      key !== 'your-anon-key-here' &&
      key !== 'disabled-for-local-dev' &&
      !url.includes('your-project') &&
      !key.includes('your-anon-key');

    return isConfigured;
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          console.warn('Supabase not configured. Using demo mode.');

          // Check for persisted demo user session
          const savedDemoUser = localStorage.getItem('demo_user_session');
          if (savedDemoUser) {
            try {
              const {
                user: demoUser,
                roles: demoRoles,
                permissions: demoPermissions,
              } = JSON.parse(savedDemoUser);
              setUser(demoUser);
              setRoles(demoRoles);
              setPermissions(demoPermissions);
              setIsAuthenticated(true);
            } catch (parseError) {
              console.error('Error parsing saved demo session:', parseError);
              localStorage.removeItem('demo_user_session');
            }
          }

          setIsLoading(false);
          return;
        }

        const supabaseUser = await getCurrentUser();

        if (supabaseUser) {
          await loadUserDataWithFallback(supabaseUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener only if Supabase is configured
    let subscription: any = null;
    if (isSupabaseConfigured()) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserDataWithFallback(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setRoles([]);
            setPermissions([]);
            setIsAuthenticated(false);
          }
        }
      );
      subscription = authSubscription;
    }

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Database health check function
  const checkDatabaseHealth = async (): Promise<{
    error?: string;
    healthy: boolean;
  }> => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Health check timeout after 5 seconds')),
          5000
        );
      });

      const healthPromise = supabase
        .from('user_settings')
        .select('id')
        .limit(1);

      await Promise.race([healthPromise, timeoutPromise]);
      return { healthy: true };
    } catch (error: any) {
      return { healthy: false, error: error.message };
    }
  };

  // Simplified user loading that doesn't block the app
  const loadUserDataWithFallback = async (authUser: any) => {
    // Create a basic user object from auth data immediately
    const basicUser: User = {
      id: authUser.id,
      email: authUser.email,
      firstName: authUser.user_metadata?.first_name || '',
      lastName: authUser.user_metadata?.last_name || '',
      role: 'employee' as SystemRoles, // Default role
      organizationId: '',
      isActive: true,
      avatarUrl: authUser.user_metadata?.avatar_url || '',
      createdAt: authUser.created_at,
      updatedAt: authUser.updated_at || authUser.created_at,
      customPermissions: {},
      customRules: [],
      profileCompleted: true,
      twoFactorEnabled: false,
    };

    // Set the basic user immediately so the app can load
    setUser(basicUser);
    setRoles([]);
    setPermissions([]);
    setIsAuthenticated(true);

    // Now try to load full user data in the background
    try {
      // Check database health first
      const healthCheck = await checkDatabaseHealth();
      if (!healthCheck.healthy) {
        return;
      }

      // Load actual user data from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!userError && userData) {
        // Update user with actual database data
        const updatedUser: User = {
          ...basicUser,
          role: userData.role as SystemRoles,
          organizationId: userData.organization_id || '',
          firstName: userData.first_name || basicUser.firstName,
          lastName: userData.last_name || basicUser.lastName,
          avatarUrl: userData.avatar_url || basicUser.avatarUrl,
          updatedAt: userData.updated_at || basicUser.updatedAt,
        };

        setUser(updatedUser);

        // Load user roles using the new authenticated REST API service
        try {
          const rolesData = await getUserRoles(authUser.id);

          if (rolesData && rolesData.length > 0) {
            // Convert the new UserRole structure to Role structure
            const userRoles: Role[] = rolesData.map((ur: any) => ({
              id: `role-${ur.role}`,
              name: ur.role,
              description: `${ur.role} role`,
              level: ur.role as SystemRoles,
              permissions: ur.permissions.reduce(
                (acc: Record<Permissions, boolean>, perm: string) => {
                  acc[perm as Permissions] = true;
                  return acc;
                },
                {} as Record<Permissions, boolean>
              ),
              customRules: [],
              isSystemRole: true,
              isActive: true,
              organizationId: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              userCount: 1,
              priority: 1,
            }));

            setRoles(userRoles);

            // Set permissions based on roles
            const allPermissions = rolesData.flatMap(
              (ur: any) => ur.permissions || []
            );
            setPermissions(allPermissions);
          } else {
            // Fallback to demo roles if no roles found
            console.log('⚠️ No roles found, using fallback');
            const demoRoles: Role[] = [
              {
                id: 'demo-role-1',
                name: updatedUser.role,
                description: 'User Role',
                level: updatedUser.role,
                permissions: {} as Record<Permissions, boolean>,
                customRules: [],
                isSystemRole: true,
                isActive: true,
                organizationId: 'demo-org',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'system',
                userCount: 1,
                priority: 1,
              },
            ];

            setRoles(demoRoles);
            setPermissions(['read', 'write', 'delete']);
          }
        } catch (rolesError) {
          console.error('Failed to load user roles:', rolesError);
          // Fallback to demo roles if roles loading fails
          console.log('⚠️ Roles loading failed, using fallback');
          const demoRoles: Role[] = [
            {
              id: 'demo-role-1',
              name: updatedUser.role,
              description: 'User Role',
              level: updatedUser.role,
              permissions: {} as Record<Permissions, boolean>,
              customRules: [],
              isSystemRole: true,
              isActive: true,
              organizationId: 'demo-org',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              userCount: 1,
              priority: 1,
            },
          ];

          setRoles(demoRoles);
          setPermissions(['read', 'write', 'delete']);
        }
      } else {
        console.log(
          '⚠️ Could not load user data from database, using fallback'
        );
        // Use fallback data
        setUser(basicUser);

        const demoRoles: Role[] = [
          {
            id: 'demo-role-1',
            name: 'admin',
            description: 'Demo Administrator',
            level: 'admin' as SystemRoles,
            permissions: {} as Record<Permissions, boolean>,
            customRules: [],
            isSystemRole: true,
            isActive: true,
            organizationId: 'demo-org',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            userCount: 1,
            priority: 1,
          },
        ];

        setRoles(demoRoles);
        setPermissions(['read', 'write', 'delete']);
      }

      // Try to load profile data from persistent storage
      try {
        const profileData = await persistentStorage.getProfileData();
        const avatarData = await persistentStorage.getAvatar();

        if (profileData || avatarData) {
          setUser(prev =>
            prev
              ? {
                  ...prev,
                  ...profileData,
                  avatarUrl: avatarData || prev.avatarUrl,
                }
              : null
          );
        }
      } catch (profileError) {
        console.warn('Failed to load profile data:', profileError);
      }
    } catch (error) {
      console.warn('Background user data loading failed:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Demo mode - use predefined demo user
        const demoUser: User = {
          id: 'demo-user-123',
          email: email,
          firstName: 'Demo',
          lastName: 'User',
          role: SystemRoles.SUPER_ADMIN,
          organizationId: 'demo-org-123',
          isActive: true,
          avatarUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customPermissions: {},
          customRules: [],
          profileCompleted: true,
          twoFactorEnabled: false,
        };

        const demoRoles: Role[] = [
          {
            id: 'demo-role-123',
            name: 'super_admin',
            description: 'Demo Super Administrator',
            level: SystemRoles.SUPER_ADMIN,
            permissions: {} as Record<Permissions, boolean>,
            customRules: [],
            isSystemRole: true,
            isActive: true,
            organizationId: 'demo-org-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            userCount: 1,
            priority: 1,
          },
        ];

        const demoPermissions = ['*']; // Full permissions for demo

        // Persist demo session to localStorage
        const demoSession = {
          user: demoUser,
          roles: demoRoles,
          permissions: demoPermissions,
        };
        localStorage.setItem('demo_user_session', JSON.stringify(demoSession));

        setUser(demoUser);
        setRoles(demoRoles);
        setPermissions(demoPermissions);
        setIsAuthenticated(true);
        return;
      }

      // Use the new authentication service
      const data = await signInWithPassword(email, password);

      if (data.user) {
        // Pass the user data directly instead of calling getCurrentUserWithRoles
        await loadUserDataWithFallback(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await signOut();
      } else {
        // Clear demo session from localStorage
        localStorage.removeItem('demo_user_session');
      }

      setUser(null);
      setRoles([]);
      setPermissions([]);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermission = (permission: string): boolean => {
    // Super admin with '*' permissions has access to everything
    if (permissions.includes('*')) {
      return true;
    }
    return permissions.includes(permission);
  };

  const checkRole = (role: string): boolean => {
    // Super admin with '*' permissions has all roles
    if (permissions.includes('*')) {
      return true;
    }
    return roles.some(r => r.name === role);
  };

  const hasAnyRole = (roleList: string[]): boolean => {
    // Super admin with '*' permissions has all roles
    if (permissions.includes('*')) {
      return true;
    }
    return roles.some(r => roleList.includes(r.name));
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // Super admin with '*' permissions has access to everything
    if (permissions.includes('*')) {
      return true;
    }
    return permissionList.some(p => permissions.includes(p));
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    if (!user) return;

    try {
      // Update user state immediately for better UX
      const updatedUser = {
        ...user,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
      setUser(updatedUser);

      // Save to persistent storage
      await persistentStorage.setProfileData(profileData);

      // If avatar is included, save it separately
      if (profileData.avatarUrl) {
        await persistentStorage.setAvatar(profileData.avatarUrl);
      }

      // TODO: In production, update Supabase here
      // await supabaseServices.users.updateProfile(user.id, profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Revert user state on error
      setUser(user);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Demo mode - simulate password reset
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        return;
      }

      // Use Supabase password reset with standard redirect URL
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    roles,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUserProfile,
    resetPassword,
    checkPermission,
    checkRole,
    hasAnyRole,
    hasAnyPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
