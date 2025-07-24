import React, { useState } from 'react';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ProjectStatus = 'draft' | 'active' | 'on-hold' | 'completed' | 'archived';

interface ProjectProperties {
  title: string;
  client: string;
  address: string;
  notes: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  manager: string;
  budget: number;
}

interface ProjectPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (properties: ProjectProperties) => void;
  initialProperties: ProjectProperties;
  loading?: boolean;
}

const ProjectPropertiesModal: React.FC<ProjectPropertiesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProperties,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [properties, setProperties] = useState<ProjectProperties>(initialProperties);

  const canAdmin = canAccess('programme.admin');

  const statusOptions: Array<{
    value: ProjectStatus;
    label: string;
    description: string;
  }> = [
    {
      value: 'draft',
      label: 'Draft',
      description: 'Project in planning phase'
    },
    {
      value: 'active',
      label: 'Active',
      description: 'Project currently in progress'
    },
    {
      value: 'on-hold',
      label: 'On Hold',
      description: 'Project temporarily paused'
    },
    {
      value: 'completed',
      label: 'Completed',
      description: 'Project finished successfully'
    },
    {
      value: 'archived',
      label: 'Archived',
      description: 'Project archived for reference'
    }
  ];

  const handleInputChange = (field: keyof ProjectProperties, value: string | number) => {
    setProperties(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!properties.title.trim()) {
      alert('Please enter a project title');
      return;
    }
    onSave(properties);
  };

  const handleClose = () => {
    setProperties(initialProperties);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Cog6ToothIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Project Properties
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={properties.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                  placeholder="Enter project title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client
                </label>
                <input
                  type="text"
                  value={properties.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Manager
                </label>
                <input
                  type="text"
                  value={properties.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                  placeholder="Enter project manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget
                </label>
                <input
                  type="number"
                  value={properties.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Project Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Status
                </label>
                <select
                  value={properties.status}
                  onChange={(e) => handleInputChange('status', e.target.value as ProjectStatus)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={properties.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={properties.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Address
                </label>
                <input
                  type="text"
                  value={properties.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canAdmin}
                  placeholder="Enter project address"
                />
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Notes
            </label>
            <textarea
              value={properties.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!canAdmin}
              placeholder="Enter project notes and additional information"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canAdmin || loading || !properties.title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Saving...' : 'Save Properties'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectPropertiesModal; 