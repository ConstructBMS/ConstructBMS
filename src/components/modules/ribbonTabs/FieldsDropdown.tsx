import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface FieldConfig {
  id: string;
  isRequired?: boolean;
  isVisible: boolean;
  label: string;
}

interface FieldsDropdownProps {
  disabled?: boolean;
  fields: FieldConfig[];
  onToggleField: (fieldId: string) => void;
}

const FieldsDropdown: React.FC<FieldsDropdownProps> = ({
  fields,
  onToggleField,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  // Check if user has permission
  const hasPermission = canAccess('programme.view');
  const isDisabled = disabled || !hasPermission;

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

  const handleToggle = (fieldId: string) => {
    onToggleField(fieldId);
  };

  const handleButtonClick = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const visibleFieldsCount = fields.filter(field => field.isVisible).length;
  const totalFieldsCount = fields.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12 
          border border-gray-300 bg-white hover:bg-gray-50 
          transition-colors duration-200 rounded
          ${isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-gray-400'
          }
          ${isOpen ? 'bg-blue-50 border-blue-400' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Show or hide grid columns"
      >
        <div className="relative">
          <TableCellsIcon className={`w-5 h-5 ${isOpen ? 'text-blue-600' : 'text-gray-700'}`} />
          {visibleFieldsCount < totalFieldsCount && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center">
              {totalFieldsCount - visibleFieldsCount}
            </div>
          )}
        </div>
        <div className="flex items-center mt-1">
          <span className={`text-xs font-medium ${isOpen ? 'text-blue-600' : 'text-gray-600'}`}>
            Fields
          </span>
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${isOpen ? 'text-blue-600 rotate-180' : 'text-gray-600'} transition-transform duration-200`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Manage Fields</h3>
            <p className="text-xs text-gray-500 mt-1">
              {visibleFieldsCount} of {totalFieldsCount} fields visible
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className={`text-sm ${field.isRequired ? 'font-medium' : 'text-gray-700'}`}>
                    {field.label}
                  </span>
                  {field.isRequired && (
                    <span className="ml-1 text-xs text-red-500">*</span>
                  )}
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={field.isVisible}
                    onChange={() => handleToggle(field.id)}
                    disabled={field.isRequired}
                  />
                  <div className={`
                    w-9 h-5 rounded-full transition-colors duration-200
                    ${field.isVisible 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                    }
                    ${field.isRequired ? 'opacity-50' : ''}
                  `}>
                    <div className={`
                      w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200
                      ${field.isVisible ? 'translate-x-4' : 'translate-x-0.5'}
                      ${field.isRequired ? 'opacity-50' : ''}
                    `} />
                  </div>
                </label>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  fields.forEach(field => {
                    if (!field.isRequired && !field.isVisible) {
                      handleToggle(field.id);
                    }
                  });
                }}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Show All
              </button>
              <button
                onClick={() => {
                  fields.forEach(field => {
                    if (!field.isRequired && field.isVisible) {
                      handleToggle(field.id);
                    }
                  });
                }}
                className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hide All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldsDropdown; 