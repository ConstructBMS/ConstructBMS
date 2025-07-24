import React, { useState } from 'react';
import { PlusIcon, BookOpenIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface CustomFieldsSectionProps {
  onOpenAddField: () => void;
  onOpenFieldLibrary: () => void;
  onOpenFieldPosition: () => void;
  disabled?: boolean;
  loading?: {
    add?: boolean;
    library?: boolean;
    position?: boolean;
  };
}

const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({
  onOpenAddField,
  onOpenFieldLibrary,
  onOpenFieldPosition,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();

  const canManage = canAccess('programme.admin.manage');
  const isDisabled = disabled || !canManage;

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <button
          onClick={onOpenAddField}
          disabled={isDisabled || loading.add}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.add
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Add new custom field"
        >
          <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.add && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onOpenFieldLibrary}
          disabled={isDisabled || loading.library}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.library
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Browse field library"
        >
          <BookOpenIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.library && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onOpenFieldPosition}
          disabled={isDisabled || loading.position}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.position
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Reorder field positions"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.position && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Custom Fields
      </div>
    </section>
  );
};

export default CustomFieldsSection; 