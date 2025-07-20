import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
}) => {
  const { isAuthenticated, isLoading, checkPermission, checkRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-constructbms-blue mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission =>
      checkPermission(permission)
    );
    if (!hasPermission) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='text-red-500 text-6xl mb-4'>🚫</div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Access Denied
            </h1>
            <p className='text-gray-600 mb-4'>
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className='px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => checkRole(role));
    if (!hasRole) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='text-red-500 text-6xl mb-4'>🚫</div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Access Denied
            </h1>
            <p className='text-gray-600 mb-4'>
              You don't have the required role to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className='px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
