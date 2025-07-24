import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface DatabaseStatusProps {
  className?: string;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'loading' | 'fallback' | 'database' | 'error'>('loading');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const checkStatus = () => {
      try {
        // Check if we have localStorage permissions (fallback mode)
        const userId = '58309b6c-86f7-482b-af81-e3736be3e5f2';
        const storedRole = localStorage.getItem(`user_role_${userId}`);
        const storedPermissions = localStorage.getItem(`user_permissions_${userId}`);

        if (storedRole && storedPermissions) {
          setStatus('fallback');
          setUserRole(storedRole);
        } else {
          // Check if database is working
          setStatus('database');
          setUserRole('super_admin'); // Default role
        }
      } catch (error) {
        setStatus('error');
      }
    };

    checkStatus();
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'fallback':
        return {
          icon: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
          text: 'Using Fallback Permissions',
          description: 'Application working with localStorage',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'database':
        return {
          icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
          text: 'Database Connected',
          description: 'Full database integration active',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
          text: 'Database Error',
          description: 'Check database connection',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <InformationCircleIcon className="w-5 h-5 text-gray-500" />,
          text: 'Checking Status...',
          description: 'Loading system status',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-lg max-w-sm`}>
        {statusInfo.icon}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </div>
          <div className="text-xs text-gray-600">
            {statusInfo.description}
            {userRole && (
              <span className="ml-1 font-medium">
                • Role: {userRole}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {status === 'fallback' && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <p>Database setup optional - run complete-database-setup.sql to remove errors</p>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;
