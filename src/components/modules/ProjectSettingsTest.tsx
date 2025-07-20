import React, { useState } from 'react';
import { Card } from '../ui';
import ProjectSettingsPanel from './ProjectSettingsPanel';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  CogIcon, 
  UserIcon, 
  ShieldCheckIcon,
  ShieldExclamationIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ProjectSettingsTest: React.FC = () => {
  const { currentRole, hasPermission } = usePermissions();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'project_manager' | 'admin'>('project_manager');
  const [demoProjectId] = useState('demo-project-1');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="w-5 h-5 text-red-600" />;
      case 'project_manager':
        return <ShieldExclamationIcon className="w-5 h-5 text-yellow-600" />;
      case 'viewer':
        return <EyeIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'project_manager':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'viewer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Settings saved:', settings);
    setShowSettings(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Project Settings Panel Test</h2>
        <p className="text-purple-100">
          Test the project settings panel with different user roles and permissions.
        </p>
      </div>

      {/* Role Selector */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Role
              </label>
              <div className="flex items-center gap-2">
                {getRoleIcon(currentRole || 'viewer')}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(currentRole || 'viewer')}`}>
                  {currentRole?.replace('_', ' ') || 'Not Set'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="project_manager">Project Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Permission Status */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permission Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">View Settings</h4>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${hasPermission('view_settings') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {hasPermission('view_settings') ? 'Allowed' : 'Denied'}
                </span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Edit Settings</h4>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${hasPermission('edit_settings') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {hasPermission('edit_settings') ? 'Allowed' : 'Denied'}
                </span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">View Projects</h4>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${hasPermission('view_projects') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {hasPermission('view_projects') ? 'Allowed' : 'Denied'}
                </span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Edit Projects</h4>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${hasPermission('edit_projects') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {hasPermission('edit_projects') ? 'Allowed' : 'Denied'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Test Controls */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Controls</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Open Project Settings
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Project ID: {demoProjectId}
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="text-yellow-800 dark:text-yellow-200">
                <div className="font-medium mb-2">Demo Mode Active</div>
                <div className="text-sm space-y-1">
                  <p>• Using demo project data</p>
                  <p>• Changes are simulated and not saved to database</p>
                  <p>• Real settings operations require actual database tables</p>
                  <p>• Check console for detailed operation logs</p>
                  <p>• Settings panel respects role-based permissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Role Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Capabilities</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {getRoleIcon('viewer')}
                <h4 className="font-medium text-gray-900 dark:text-white">Viewer</h4>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• View project settings</li>
                <li>• Cannot edit any settings</li>
                <li>• Read-only access</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {getRoleIcon('project_manager')}
                <h4 className="font-medium text-gray-900 dark:text-white">Project Manager</h4>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• View project settings</li>
                <li>• Edit most project settings</li>
                <li>• Cannot manage users/roles</li>
                <li>• Cannot delete projects</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {getRoleIcon('admin')}
                <h4 className="font-medium text-gray-900 dark:text-white">Admin</h4>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Full access to all settings</li>
                <li>• Can manage users and roles</li>
                <li>• Can delete projects</li>
                <li>• Complete system control</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Settings Panel */}
      <ProjectSettingsPanel
        projectId={demoProjectId}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default ProjectSettingsTest; 