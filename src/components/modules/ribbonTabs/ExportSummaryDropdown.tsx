import React, { useState } from 'react';
import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ExportSummaryDropdownProps {
  disabled?: boolean;
  loading?: boolean;
  onExport: (format: 'csv' | 'xlsx' | 'pdf') => void;
}

const ExportSummaryDropdown: React.FC<ExportSummaryDropdownProps> = ({
  onExport,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canExport = canAccess('programme.resource.export');
  const isDisabled = disabled || !canExport || loading;

  const exportOptions = [
    { id: 'csv', label: 'Export as CSV', format: 'csv' as const },
    { id: 'xlsx', label: 'Export as Excel', format: 'xlsx' as const },
    { id: 'pdf', label: 'Export as PDF', format: 'pdf' as const }
  ];

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (!isDisabled) {
      onExport(format);
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
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
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Download resource summary data"
      >
        <ArrowDownTrayIcon
          className={`w-5 h-5 ${
            isDisabled
              ? 'text-gray-400'
              : 'text-purple-600'
          }`}
        />
        <span className={`text-xs font-medium mt-1 ${
          isDisabled
            ? 'text-gray-400'
            : 'text-purple-600'
        }`}>
          Export
        </span>
        <ChevronDownIcon
          className={`w-3 h-3 mt-0.5 ${
            isDisabled
              ? 'text-gray-400'
              : 'text-purple-600'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.format)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportSummaryDropdown; 