import React, { useState } from 'react';
import { ChevronDownIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface QuickAssignResource {
  id: string;
  name: string;
  type: 'labour' | 'material' | 'cost';
  defaultQuantity: number;
  defaultUnit: string;
  defaultRate: number;
  frequency: number; // how often used
}

interface QuickAssignDropdownProps {
  onQuickAssign: (resource: QuickAssignResource) => void;
  disabled?: boolean;
  loading?: boolean;
}

const QuickAssignDropdown: React.FC<QuickAssignDropdownProps> = ({
  onQuickAssign,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const hasPermission = canAccess('programme.resource.view');
  const isDisabled = disabled || !hasPermission || loading;

  // Mock frequently used resources - in real app this would come from service
  const frequentResources: QuickAssignResource[] = [
    {
      id: 'labour-1',
      name: 'Project Manager',
      type: 'labour',
      defaultQuantity: 8,
      defaultUnit: 'hrs',
      defaultRate: 75,
      frequency: 95
    },
    {
      id: 'labour-2',
      name: 'Site Engineer',
      type: 'labour',
      defaultQuantity: 8,
      defaultUnit: 'hrs',
      defaultRate: 45,
      frequency: 87
    },
    {
      id: 'material-1',
      name: 'Concrete (m³)',
      type: 'material',
      defaultQuantity: 1,
      defaultUnit: 'm³',
      defaultRate: 120,
      frequency: 78
    },
    {
      id: 'material-2',
      name: 'Steel Reinforcement',
      type: 'material',
      defaultQuantity: 1,
      defaultUnit: 'ton',
      defaultRate: 850,
      frequency: 65
    },
    {
      id: 'cost-1',
      name: 'Equipment Rental',
      type: 'cost',
      defaultQuantity: 1,
      defaultUnit: 'day',
      defaultRate: 200,
      frequency: 72
    }
  ];

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleResourceSelect = (resource: QuickAssignResource) => {
    onQuickAssign(resource);
    setIsOpen(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labour': return 'text-blue-600';
      case 'material': return 'text-green-600';
      case 'cost': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'labour': return '👷';
      case 'material': return '🏗️';
      case 'cost': return '💰';
      default: return '📋';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12
          border border-gray-300 bg-white hover:bg-gray-50
          transition-colors duration-200 rounded
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400'
          }
          ${loading ? 'animate-pulse' : ''}
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
        `}
        title="Assign a frequently used resource"
      >
        <div className="flex items-center justify-center w-full">
          <ClipboardDocumentListIcon className={`w-5 h-5 ${
            isDisabled ? 'text-gray-400' : 'text-green-600'
          }`} />
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${
            isDisabled ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <span className={`text-xs mt-1 ${
          isDisabled ? 'text-gray-400' : 'text-green-600'
        }`}>
          Quick
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Frequently Used Resources
            </h3>
          </div>
          <div className="py-1 max-h-60 overflow-y-auto">
            {frequentResources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => handleResourceSelect(resource)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="mr-2">{getTypeIcon(resource.type)}</span>
                  <div>
                    <div className={`font-medium ${getTypeColor(resource.type)}`}>
                      {resource.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {resource.defaultQuantity} {resource.defaultUnit} @ £{resource.defaultRate}/{resource.defaultUnit}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {resource.frequency}%
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click to assign with default settings
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAssignDropdown; 