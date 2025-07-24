import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  SignalIcon, 
  SignalSlashIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useProgrammeCollaboration } from '../../contexts/ProgrammeCollaborationContext';
import type { ProgrammePresence } from '../../services/programmeCollaborationService';

interface ProgrammePresenceIndicatorProps {
  projectId: string;
  className?: string;
}

const ProgrammePresenceIndicator: React.FC<ProgrammePresenceIndicatorProps> = ({
  projectId,
  className = ''
}) => {
  const { 
    presence, 
    isConnected, 
    getOtherUsers, 
    getCurrentUserPresence,
    initializeCollaboration 
  } = useProgrammeCollaboration();
  
  const [showDetails, setShowDetails] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize collaboration when component mounts
  React.useEffect(() => {
    if (!isInitialized && projectId) {
      initializeCollaboration(projectId);
      setIsInitialized(true);
    }
  }, [projectId, isInitialized, initializeCollaboration]);

  const otherUsers = getOtherUsers();
  const currentUser = getCurrentUserPresence();
  const totalUsers = presence.length;

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = (isOnline: boolean): string => {
    return isOnline ? 'text-green-500' : 'text-gray-400';
  };

  const getStatusIcon = (isOnline: boolean) => {
    return isOnline ? (
      <SignalIcon className="w-3 h-3" />
    ) : (
      <SignalSlashIcon className="w-3 h-3" />
    );
  };

  if (!isConnected) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <SignalSlashIcon className="w-4 h-4" />
        <span className="text-sm">Offline</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <UserGroupIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Live with {otherUsers.length} other{otherUsers.length !== 1 ? 's' : ''}
        </span>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(true)}`} />
      </button>

      {/* Details dropdown */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Active Users ({totalUsers})
              </h3>
              <div className="flex items-center space-x-1">
                <SignalIcon className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>

            {/* Current user */}
            {currentUser && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {currentUser.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {currentUser.userName}
                      </span>
                      {currentUser.demo && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      <span>Just now</span>
                    </div>
                  </div>
                  <div className={getStatusColor(currentUser.isOnline)}>
                    {getStatusIcon(currentUser.isOnline)}
                  </div>
                </div>
              </div>
            )}

            {/* Other users */}
            <div className="space-y-2">
              {otherUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {user.userAvatar ? (
                      <img 
                        src={user.userAvatar} 
                        alt={user.userName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {user.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.userName}
                      </span>
                      {user.demo && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatTimeAgo(user.lastSeen)}</span>
                    </div>
                  </div>
                  <div className={getStatusColor(user.isOnline)}>
                    {getStatusIcon(user.isOnline)}
                  </div>
                </div>
              ))}
            </div>

            {otherUsers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No other users online</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default ProgrammePresenceIndicator; 