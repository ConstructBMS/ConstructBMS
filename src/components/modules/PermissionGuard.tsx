import React from 'react';
import { usePermissions, type Permission } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  permission: Permission;
  projectId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  className?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  projectId,
  children,
  fallback = null,
  showTooltip = false,
  className = ''
}) => {
  const { hasPermission, checkPermission } = usePermissions();
  const check = checkPermission(permission, projectId);

  if (check.hasPermission) {
    return <>{children}</>;
  }

  if (showTooltip && check.reason) {
    return (
      <div className={`relative group ${className}`}>
        {fallback}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {check.reason}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
};

// Permission-based button component
interface PermissionButtonProps {
  permission: Permission;
  projectId?: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  projectId,
  onClick,
  children,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  showTooltip = true
}) => {
  const { hasPermission, checkPermission } = usePermissions();
  const check = checkPermission(permission, projectId);
  const isDisabled = disabled || !check.hasPermission;

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  if (showTooltip && !check.hasPermission && check.reason) {
    return (
      <div className="relative group">
        <button
          className={buttonClasses}
          onClick={handleClick}
          disabled={isDisabled}
        >
          {children}
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {check.reason}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

// Permission-based input component
interface PermissionInputProps {
  permission: Permission;
  projectId?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  disabled?: boolean;
  showTooltip?: boolean;
}

export const PermissionInput: React.FC<PermissionInputProps> = ({
  permission,
  projectId,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  disabled = false,
  showTooltip = true
}) => {
  const { hasPermission, checkPermission } = usePermissions();
  const check = checkPermission(permission, projectId);
  const isDisabled = disabled || !check.hasPermission;

  const inputClasses = `w-full px-3 py-2 border rounded-md transition-colors ${
    isDisabled 
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
      : 'bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
  } ${className}`;

  if (showTooltip && !check.hasPermission && check.reason) {
    return (
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          className={inputClasses}
        />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {check.reason}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={isDisabled}
      className={inputClasses}
    />
  );
};

export default PermissionGuard; 