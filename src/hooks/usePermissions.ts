import { useAuth } from '../contexts/AuthContext';

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export const usePermissions = () => {
  const { user } = useAuth();

  const canAccess = (permissionKey: string): boolean => {
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      'admin': [
        'gantt.home.cut',
        'gantt.home.copy',
        'gantt.home.paste',
        'gantt.home.delete',
        'gantt.home.insert-task',
        'gantt.home.insert-summary',
        'gantt.home.indent',
        'gantt.home.outdent',
        'gantt.home.link',
        'gantt.home.unlink',
        'gantt.home.expand',
        'gantt.home.collapse',
        'gantt.home.undo',
        'gantt.home.redo',
        'gantt.file.new',
        'gantt.file.open',
        'gantt.file.save',
        'gantt.file.export',
        'gantt.view.zoom',
        'gantt.view.toggle',
        'gantt.project.info',
        'gantt.project.calendar',
        'gantt.allocation.resource',
        'gantt.allocation.level',
        'gantt.4d.view',
        'gantt.format.style',
        'gantt.format.layout'
      ],
      'employee': [
        'gantt.home.copy',
        'gantt.home.paste',
        'gantt.home.expand',
        'gantt.home.collapse',
        'gantt.view.zoom',
        'gantt.view.toggle',
        'gantt.project.info',
        'gantt.4d.view'
      ],
      'viewer': [
        'gantt.home.expand',
        'gantt.home.collapse',
        'gantt.view.zoom',
        'gantt.view.toggle',
        'gantt.project.info',
        'gantt.4d.view'
      ]
    };

    // Check if user's role has the permission
    const userRolePermissions = rolePermissions[user.role] || [];
    return userRolePermissions.includes(permissionKey);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const getUserRole = (): string | null => {
    return user?.role || null;
  };

  const getAvailablePermissions = (): string[] => {
    if (!user) return [];

         const rolePermissions: Record<string, string[]> = {
       'super-admin': ['*'], // All permissions
       'admin': [
         'gantt.home.cut',
         'gantt.home.copy',
         'gantt.home.paste',
         'gantt.home.delete',
         'gantt.home.insert-task',
         'gantt.home.insert-summary',
         'gantt.home.indent',
         'gantt.home.outdent',
         'gantt.home.link',
         'gantt.home.unlink',
         'gantt.home.expand',
         'gantt.home.collapse',
         'gantt.home.undo',
         'gantt.home.redo',
         'gantt.file.new',
         'gantt.file.open',
         'gantt.file.save',
         'gantt.file.export',
         'gantt.view.zoom-day',
         'gantt.view.zoom-week',
         'gantt.view.zoom-month',
         'gantt.view.toggle-grid',
         'gantt.view.toggle-dependencies',
         'gantt.view.toggle-critical-path',
         'gantt.view.toggle-progress',
         'gantt.view.toggle-resources',
         'gantt.view.row-height-small',
         'gantt.view.row-height-medium',
         'gantt.view.row-height-large',
         'gantt.view.layout-options',
         'gantt.view.filters',
         'gantt.project.properties',
         'gantt.project.start-end',
         'gantt.project.calendar',
         'gantt.project.baselines',
         'gantt.project.milestones',
         'gantt.allocation.assign',
         'gantt.allocation.unassign',
         'gantt.allocation.work',
         'gantt.allocation.rates',
         'gantt.allocation.availability',
         'gantt.allocation.view',
         'gantt.allocation.tools',
         'gantt.allocation.leveling',
         'gantt.4d.link',
         'gantt.4d.unlink',
         'gantt.4d.show',
         'gantt.4d.hide',
         'gantt.4d.simulate',
         'gantt.4d.timeline',
         'gantt.4d.bim-view',
         'gantt.4d.refresh',
         'gantt.format.bar-style',
         'gantt.format.bar-color',
         'gantt.format.font-style',
         'gantt.format.text-visibility',
         'gantt.format.row-height',
         'gantt.format.column-width',
         'gantt.format.grid',
         'gantt.format.dependencies',
         'gantt.format.advanced',
         'gantt.format.templates',
         'gantt.report.print',
         'gantt.report.export-pdf',
         'gantt.report.export-image',
         'gantt.report.export-jpeg',
         'gantt.report.export-excel',
         'gantt.report.export-csv',
         'gantt.report.save-template',
         'gantt.report.load-template',
         'gantt.report.report-builder',
         'gantt.report.schedule-report',
         'gantt.report.share-report',
         'gantt.report.publish-report'
       ],
      'employee': [
        'gantt.home.copy',
        'gantt.home.paste',
        'gantt.home.expand',
        'gantt.home.collapse',
        'gantt.view.zoom',
        'gantt.view.toggle',
        'gantt.project.info',
        'gantt.4d.view'
      ],
      'viewer': [
        'gantt.home.expand',
        'gantt.home.collapse',
        'gantt.view.zoom',
        'gantt.view.toggle',
        'gantt.project.info',
        'gantt.4d.view'
      ]
    };

    return rolePermissions[user.role] || [];
  };

  // Gantt-specific permission helpers
  const canEditTasks = (): boolean => {
    return canAccess('gantt.home.cut') || canAccess('gantt.home.delete');
  };

  const canInsertTasks = (): boolean => {
    return canAccess('gantt.home.insert-task') || canAccess('gantt.home.insert-summary');
  };

  const canModifyStructure = (): boolean => {
    return canAccess('gantt.home.indent') || canAccess('gantt.home.outdent') || 
           canAccess('gantt.home.link') || canAccess('gantt.home.unlink');
  };

  const canManageProject = (): boolean => {
    return canAccess('gantt.file.new') || canAccess('gantt.file.save') || 
           canAccess('gantt.project.info');
  };

  const canViewOnly = (): boolean => {
    return !canEditTasks() && !canInsertTasks() && !canModifyStructure();
  };

  return {
    canAccess,
    hasRole,
    hasAnyRole,
    getUserRole,
    getAvailablePermissions,
    canEditTasks,
    canInsertTasks,
    canModifyStructure,
    canManageProject,
    canViewOnly,
    user
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
export const usePermissionRender = (permission: Permission, projectId?: string) => {
  const { hasPermission, checkPermission } = usePermissions();
  const canRender = hasPermission(permission, projectId);
  const check = checkPermission(permission, projectId);
  
  return {
    canRender,
    check,
    render: (children: React.ReactNode) => canRender ? children : null
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
    requiredRole: check.requiredRole
  };
}; 