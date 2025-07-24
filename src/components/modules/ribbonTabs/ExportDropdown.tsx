import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ExportFormat = 'excel' | 'json';

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
  loading?: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExport,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  const canView = canAccess('programme.view');
  const isDisabled = disabled || !canView || loading;

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

  const handleExport = (format: ExportFormat) => {
    if (!isDisabled) {
      onExport(format);
      setIsOpen(false);
    }
  };

  const exportOptions = [
    {
      format: 'excel' as ExportFormat,
      label: 'Export to Excel',
      description: 'Download as .xlsx file',
      icon: '📊'
    },
    {
      format: 'json' as ExportFormat,
      label: 'Export to JSON',
      description: 'Download as .json file',
      icon: '📄'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
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
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Export programme to Excel or JSON"
      >
        <DocumentArrowDownIcon className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`} />
        <div className="flex items-center">
          <span className={`text-xs font-medium mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
            Export
          </span>
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <span className="text-lg">{option.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown; 