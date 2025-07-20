import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { astaHeaderService } from '../../services/astaHeaderService';

interface AstaHeaderProps {
  activeProject: any;
  autoSaveStatus: string;
  userRole: string;
  onProjectChange?: (project: any) => void;
}

const AstaHeader: React.FC<AstaHeaderProps> = ({
  activeProject,
  autoSaveStatus,
  userRole,
  onProjectChange
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeaderData();
  }, [userRole]);

  const loadHeaderData = async () => {
    try {
      setLoading(true);
      const [projects, profile] = await Promise.all([
        astaHeaderService.getAvailableProjects(),
        astaHeaderService.getUserProfile()
      ]);
      setAvailableProjects(projects);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load header data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (projectId: string) => {
    try {
      const project = await astaHeaderService.switchProject(projectId);
      if (onProjectChange) {
        onProjectChange(project);
      }
      setShowProjectDropdown(false);
    } catch (error) {
      console.error('Failed to switch project:', error);
    }
  };

  const handleUserAction = async (action: string) => {
    try {
      await astaHeaderService.handleUserAction(action);
      setShowUserMenu(false);
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <ArrowPathIcon className="w-4 h-4 animate-spin text-yellow-500" />;
      case 'saved':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'offline':
        return <XMarkIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <ArrowPathIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save Error';
      case 'offline':
        return 'Offline';
      default:
        return 'Auto-save';
    }
  };

  if (loading) {
    return (
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-constructbms-blue"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Project Info */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeProject?.name || 'No Project Selected'}
                </h1>
                {activeProject && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeProject.client} • {activeProject.status.charAt(0).toUpperCase() + activeProject.status.slice(1)}
                  </p>
                )}
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>
            
            {showProjectDropdown && (
              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Switch Project</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {availableProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectChange(project.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {project.client} • {project.status}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-sm text-constructbms-blue hover:text-constructbms-blue/80">
                    + Create New Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Auto-save Status */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            {getAutoSaveIcon()}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getAutoSaveText()}
            </span>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <BellIcon className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <UserCircleIcon className="w-6 h-6" />
              <span className="text-sm font-medium">
                {userProfile?.name || 'User'}
              </span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {userProfile?.email || 'user@example.com'}
                  </div>
                </div>
                
                <button
                  onClick={() => handleUserAction('profile')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  View Profile
                </button>
                
                <button
                  onClick={() => handleUserAction('settings')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Settings
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                <button
                  onClick={() => handleUserAction('logout')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AstaHeader; 