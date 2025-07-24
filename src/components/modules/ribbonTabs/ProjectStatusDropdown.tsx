import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Complete' | 'Cancelled';

export interface ProjectStatusOption {
  bgColor: string;
  borderColor: string;
  color: string;
  label: string;
  value: ProjectStatus;
}

interface ProjectStatusDropdownProps {
  currentStatus: ProjectStatus;
  disabled?: boolean;
  loading?: boolean;
  onStatusChange: (status: ProjectStatus) => void;
}

const ProjectStatusDropdown: React.FC<ProjectStatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  const hasPermission = canAccess('programme.edit');
  const isDisabled = disabled || !hasPermission || loading;

  const statusOptions: ProjectStatusOption[] = [
    {
      value: 'Not Started',
      label: 'Not Started',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300'
    },
    {
      value: 'In Progress',
      label: 'In Progress',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    {
      value: 'On Hold',
      label: 'On Hold',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300'
    },
    {
      value: 'Complete',
      label: 'Complete',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    },
    {
      value: 'Cancelled',
      label: 'Cancelled',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300'
    }
  ];

  const currentOption = statusOptions.find(option => option.value === currentStatus) ?? statusOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusSelect = (status: ProjectStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12 
          border ${currentOption.borderColor} ${currentOption.bgColor}
          hover:bg-opacity-80 transition-colors duration-200 rounded
          ${isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Change overall project status"
      >
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${currentOption.bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`} />
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${isOpen ? 'rotate-180' : ''} transition-transform duration-200 ${currentOption.color}`} />
        </div>
        <span className={`text-xs font-medium mt-1 ${currentOption.color}`}>
          Status
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <h3 className="text-xs font-medium text-gray-700 mb-2 px-2">Project Status</h3>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${option.value === currentStatus 
                    ? `${option.bgColor} ${option.color} font-medium` 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${option.bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusDropdown; 