import { useAuth } from '../contexts/AuthContext';

export interface Permissions {
  canCreate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
  canManageProjects: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canViewAnalytics: boolean;
}

export type Permission = string;
export type UserRole = 'admin' | 'user' | 'employee';

export const usePermissions = () => {
  const { user } = useAuth();

  // Default permissions for demo mode or when user is not authenticated
  const defaultPermissions: Permissions = {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: false,
    canManageProjects: true,
    canExport: true,
    canImport: true,
    canViewAnalytics: true,
    canManageSettings: false,
  };

  // If no user, return default permissions (for demo mode)
  if (!user) {
    return {
      ...defaultPermissions,
      hasPermission: (permission: Permission, projectId?: string) => true,
      canAccess: (permission: Permission, projectId?: string) => true,
      checkPermission: (permission: Permission, projectId?: string) => ({
        hasPermission: true,
        reason: null,
        requiredRole: null,
      }),
      currentRole: 'user' as UserRole,
    };
  }

  // For now, return default permissions for all authenticated users
  // In a real application, you would check user roles and permissions here
  const permissions = {
    ...defaultPermissions,
    canManageUsers: user.role === 'admin',
    canManageSettings: user.role === 'admin',
  };

  const hasPermission = (
    permission: Permission,
    projectId?: string
  ): boolean => {
    // For demo purposes, allow most permissions
    // In a real app, you would check against user roles and project-specific permissions
    if (
      permission.includes('manage_users') ||
      permission.includes('manage_roles')
    ) {
      return user.role === 'admin';
    }
    if (permission.includes('manage_settings')) {
      return user.role === 'admin';
    }
    return true; // Allow most other permissions for demo
  };

  const canAccess = (permission: Permission, projectId?: string): boolean => {
    // Alias for hasPermission for backward compatibility
    return hasPermission(permission, projectId);
  };

  const checkPermission = (permission: Permission, projectId?: string) => {
    const hasPerm = hasPermission(permission, projectId);
    return {
      hasPermission: hasPerm,
      reason: hasPerm ? null : `Permission '${permission}' requires admin role`,
      requiredRole: hasPerm ? null : ('admin' as UserRole),
    };
  };

  return {
    ...permissions,
    hasPermission,
    canAccess,
    checkPermission,
    currentRole: user.role as UserRole,
  };
};

// Higher-order component for permission-based rendering
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission,
  projectId?: string
) => {
  return (props: P) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission, projectId)) {
      return null;
    }

    return React.createElement(Component, props);
  };
};

// Hook for conditional rendering based on permissions
export const usePermissionRender = (
  permission: Permission,
  projectId?: string
) => {
  const { hasPermission, checkPermission } = usePermissions();
  const canRender = hasPermission(permission, projectId);
  const check = checkPermission(permission, projectId);

  return {
    canRender,
    check,
    render: (children: React.ReactNode) => (canRender ? children : null),
  };
};

// Hook for permission-based UI state
export const usePermissionUI = (permission: Permission, projectId?: string) => {
  const { hasPermission, checkPermission } = usePermissions();
  const check = checkPermission(permission, projectId);

  return {
    isEnabled: check.hasPermission,
    isDisabled: !check.hasPermission,
    tooltip: check.reason || undefined,
    requiredRole: check.requiredRole,
  };
};
