/**
 * Permission Guard Component
 *
 * This component provides route and UI protection based on permissions.
 * It can render children conditionally, show fallback content, or redirect
 * users based on their permission evaluation results.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { GuardProps, Resource, Action, Scope } from '../types/permissions';
import { useCan } from './hooks';

// ============================================================================
// Main Guard Component
// ============================================================================

/**
 * Permission Guard - Protects routes and UI elements based on permissions
 */
export function Guard({
  resource,
  action,
  scope = 'global',
  scopeId,
  fallback,
  redirectTo,
  children,
  context,
}: GuardProps): React.ReactElement | null {
  const location = useLocation();
  const { can, isLoading, error } = useCan({
    resource,
    action,
    scope,
    scopeId,
    context,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
        <span className='ml-2 text-sm text-muted-foreground'>
          Checking permissions...
        </span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='text-destructive text-sm font-medium'>
            Permission Error
          </div>
          <div className='text-muted-foreground text-xs mt-1'>{error}</div>
        </div>
      </div>
    );
  }

  // If user has permission, render children
  if (can) {
    return <>{children}</>;
  }

  // If redirect is specified, redirect to that route
  if (redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: render nothing (hide the content)
  return null;
}

// ============================================================================
// Specialized Guard Components
// ============================================================================

/**
 * Route Guard - Specifically for protecting routes
 */
export function RouteGuard({
  resource,
  action,
  scope = 'global',
  scopeId,
  redirectTo = '/unauthorized',
  children,
  context,
}: Omit<GuardProps, 'fallback'>): React.ReactElement {
  return (
    <Guard
      resource={resource}
      action={action}
      scope={scope}
      scopeId={scopeId}
      redirectTo={redirectTo}
      context={context}
    >
      {children}
    </Guard>
  );
}

/**
 * UI Guard - For conditionally showing UI elements
 */
export function UIGuard({
  resource,
  action,
  scope = 'global',
  scopeId,
  fallback = null,
  children,
  context,
}: Omit<GuardProps, 'redirectTo'>): React.ReactElement | null {
  return (
    <Guard
      resource={resource}
      action={action}
      scope={scope}
      scopeId={scopeId}
      fallback={fallback}
      context={context}
    >
      {children}
    </Guard>
  );
}

/**
 * Button Guard - For protecting action buttons
 */
export function ButtonGuard({
  resource,
  action,
  scope = 'global',
  scopeId,
  children,
  context,
  disabledFallback,
}: Omit<GuardProps, 'fallback' | 'redirectTo'> & {
  disabledFallback?: React.ReactNode;
}): React.ReactElement {
  const { can, isLoading, error } = useCan({
    resource,
    action,
    scope,
    scopeId,
    context,
  });

  if (isLoading) {
    return <div className='opacity-50 pointer-events-none'>{children}</div>;
  }

  if (error) {
    return <div className='opacity-50 pointer-events-none'>{children}</div>;
  }

  if (!can) {
    if (disabledFallback) {
      return <>{disabledFallback}</>;
    }

    return <div className='opacity-50 pointer-events-none'>{children}</div>;
  }

  return <>{children}</>;
}

// ============================================================================
// Higher-Order Components
// ============================================================================

/**
 * HOC for protecting components with permissions
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  resource: string,
  action: string,
  scope: string = 'global',
  scopeId?: string
) {
  return function PermissionWrappedComponent(props: P): React.ReactElement {
    return (
      <Guard
        resource={resource as Resource}
        action={action as Action}
        scope={scope as Scope}
        scopeId={scopeId}
      >
        <Component {...props} />
      </Guard>
    );
  };
}

/**
 * HOC for protecting routes with permissions
 */
export function withRoutePermission<P extends object>(
  Component: React.ComponentType<P>,
  resource: string,
  action: string,
  scope: string = 'global',
  scopeId?: string,
  redirectTo: string = '/unauthorized'
) {
  return function RoutePermissionWrappedComponent(
    props: P
  ): React.ReactElement {
    return (
      <RouteGuard
        resource={resource as Resource}
        action={action as Action}
        scope={scope as Scope}
        scopeId={scopeId}
        redirectTo={redirectTo}
      >
        <Component {...props} />
      </RouteGuard>
    );
  };
}

// ============================================================================
// Utility Components
// ============================================================================

/**
 * Permission-based conditional rendering
 */
export function PermissionConditional({
  resource,
  action,
  scope = 'global',
  scopeId,
  context,
  children,
  fallback = null,
}: {
  resource: string;
  action: string;
  scope?: string;
  scopeId?: string;
  context?: Record<string, unknown>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement | null {
  const { can } = useCan({
    resource: resource as Resource,
    action: action as Action,
    scope: scope as Scope,
    scopeId,
    context,
  });

  return can ? <>{children}</> : <>{fallback}</>;
}

/**
 * Permission-based loading state
 */
export function PermissionLoading({
  resource,
  action,
  scope = 'global',
  scopeId,
  context,
  children,
  loadingComponent,
}: {
  resource: string;
  action: string;
  scope?: string;
  scopeId?: string;
  context?: Record<string, unknown>;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}): React.ReactElement {
  const { can, isLoading } = useCan({
    resource: resource as Resource,
    action: action as Action,
    scope: scope as Scope,
    scopeId,
    context,
  });

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className='flex items-center justify-center p-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
          </div>
        )}
      </>
    );
  }

  return can ? <>{children}</> : null;
}

// ============================================================================
// Default Exports
// ============================================================================

export default Guard;
export { Guard as PermissionGuard };
