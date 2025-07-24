import React, { useState } from 'react';
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface TaskStatusesSectionProps {
  availableStatuses: Array<{ color: string, id: string; name: string; }>;
  currentDefaultStatus: string;
  disabled?: boolean;
  loading?: {
    default?: boolean;
    edit?: boolean;
  };
  onOpenEditStatusList: () => void;
  onSetDefaultStatus: (status: string) => void;
}

const TaskStatusesSection: React.FC<TaskStatusesSectionProps> = ({
  onOpenEditStatusList,
  onSetDefaultStatus,
  currentDefaultStatus,
  availableStatuses,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();
  const [isDefaultDropdownOpen, setIsDefaultDropdownOpen] = useState(false);

  const canManage = canAccess('programme.admin.manage');
  const isDisabled = disabled || !canManage;

  const currentStatus = availableStatuses.find(status => status.id === currentDefaultStatus) || availableStatuses[0];

  const handleDefaultStatusChange = (statusId: string) => {
    onSetDefaultStatus(statusId);
    setIsDefaultDropdownOpen(false);
  };

  const handleDefaultDropdownToggle = () => {
    if (!isDisabled) {
      setIsDefaultDropdownOpen(!isDefaultDropdownOpen);
    }
  };

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <button
          onClick={onOpenEditStatusList}
          disabled={isDisabled || loading.edit}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.edit
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Edit task status list"
        >
          <CheckCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.edit && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <div className="relative">
          <button
            onClick={handleDefaultDropdownToggle}
            disabled={isDisabled || loading.default}
            className={`
              flex flex-col items-center justify-center w-12 h-12
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 rounded
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${isDisabled || loading.default
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            title="Set default task status"
          >
            <div className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentStatus?.color || '#6B7280' }}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {currentStatus?.name || 'Default'}
              </span>
            </div>
            <ChevronDownIcon className="w-3 h-3 text-gray-400 mt-1" />
            {loading.default && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>

          {isDefaultDropdownOpen && !isDisabled && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
              <div className="py-1">
                {availableStatuses.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleDefaultStatusChange(status.id)}
                    className={`
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                      ${status.id === currentDefaultStatus
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="font-medium">{status.name}</span>
                      {status.id === currentDefaultStatus && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">(Default)</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Task Statuses
      </div>
    </section>
  );
};

export default TaskStatusesSection; 