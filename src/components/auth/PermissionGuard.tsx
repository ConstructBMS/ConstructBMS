import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permissions?: string[];
  requireAll?: boolean;
  roles?: string[]; // If true, user must have ALL permissions/roles, otherwise ANY
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  fallback = null,
  requireAll = false,
}) => {
  const { checkPermission, checkRole, hasAnyRole, hasAnyPermission } =
    useAuth();

  const hasPermission = () => {
    if (permissions.length === 0 && roles.length === 0) {
      return true; // No restrictions
    }

    let hasPerm = true;
    let hasRole = true;

    if (permissions.length > 0) {
      if (requireAll) {
        hasPerm = permissions.every(permission => checkPermission(permission));
      } else {
        hasPerm = hasAnyPermission(permissions);
      }
    }

    if (roles.length > 0) {
      if (requireAll) {
        hasRole = roles.every(role => checkRole(role));
      } else {
        hasRole = hasAnyRole(roles);
      }
    }

    return hasPerm && hasRole;
  };

  if (hasPermission()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGuard;
