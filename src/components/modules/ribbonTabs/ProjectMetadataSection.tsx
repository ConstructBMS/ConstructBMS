import React, { useState } from 'react';
import { Cog6ToothIcon, ChevronDownIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ProjectStatus = 'draft' | 'active' | 'on-hold' | 'completed' | 'archived';

interface ProjectMetadataSectionProps {
  currentStatus: ProjectStatus;
  disabled?: boolean;
  loading?: {
    archive?: boolean;
    properties?: boolean;
    status?: boolean;
  };
  onArchiveProject: () => void;
  onChangeProjectStatus: (status: ProjectStatus) => void;
  onOpenProjectProperties: () => void;
}

const ProjectMetadataSection: React.FC<ProjectMetadataSectionProps> = ({
  onOpenProjectProperties,
  onChangeProjectStatus,
  onArchiveProject,
  currentStatus,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const canAdmin = canAccess('programme.admin');
  const isDisabled = disabled || !canAdmin;

  const statusOptions: Array<{
    color: string;
    description: string;
    label: string;
    value: ProjectStatus;
  }> = [
    {
      value: 'draft',
      label: 'Draft',
      description: 'Project in planning phase',
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      value: 'active',
      label: 'Active',
      description: 'Project currently in progress',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      value: 'on-hold',
      label: 'On Hold',
      description: 'Project temporarily paused',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      value: 'completed',
      label: 'Completed',
      description: 'Project finished successfully',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      value: 'archived',
      label: 'Archived',
      description: 'Project archived for reference',
      color: 'text-gray-500 dark:text-gray-500'
    }
  ];

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];

  const handleStatusChange = (status: ProjectStatus) => {
    onChangeProjectStatus(status);
    setIsStatusDropdownOpen(false);
  };

  const handleArchiveClick = () => {
    if (window.confirm('Are you sure you want to archive this project? This action can be reversed later.')) {
      onArchiveProject();
    }
  };

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <button
          onClick={onOpenProjectProperties}
          disabled={isDisabled || loading.properties}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.properties
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Edit project properties"
        >
          <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.properties && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => !isDisabled && setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            disabled={isDisabled || loading.status}
            className={`
              flex flex-col items-center justify-center w-12 h-12
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 rounded
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${isDisabled || loading.status
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            title="Change project status"
          >
            <div className={`text-xs font-medium ${currentStatusOption.color}`}>
              {currentStatusOption.label}
            </div>
            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
            {loading.status && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>

          {isStatusDropdownOpen && !isDisabled && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
              <div className="py-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                      ${option.value === currentStatus
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                    title={option.description}
                  >
                    <div className="flex flex-col">
                      <span className={`font-medium ${option.color}`}>{option.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleArchiveClick}
          disabled={isDisabled || loading.archive || currentStatus === 'archived'}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            rounded transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${currentStatus === 'archived'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }
            ${isDisabled || loading.archive || currentStatus === 'archived'
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
            }
          `}
          title={currentStatus === 'archived' ? 'Project already archived' : 'Archive project'}
        >
          <ArchiveBoxIcon className={`w-5 h-5 ${
            currentStatus === 'archived'
              ? 'text-gray-400'
              : 'text-gray-600 dark:text-gray-400'
          }`} />
          {loading.archive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Project Metadata
      </div>
    </section>
  );
};

export default ProjectMetadataSection; 