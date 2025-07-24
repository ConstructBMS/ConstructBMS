import React from 'react';
import { DocumentArrowDownIcon, DocumentDuplicateIcon, ClockIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ProjectSaveSectionProps {
  autoSaveEnabled: boolean;
  disabled?: boolean;
  loading?: {
    autoSave?: boolean;
    save?: boolean;
    template?: boolean;
  };
  onSaveAsTemplate: () => void;
  onSaveChanges: () => void;
  onToggleAutoSave: () => void;
}

const ProjectSaveSection: React.FC<ProjectSaveSectionProps> = ({
  onSaveChanges,
  onSaveAsTemplate,
  onToggleAutoSave,
  autoSaveEnabled,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();

  const canSave = canAccess('programme.save');
  const isDisabled = disabled || !canSave;

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <button
          onClick={onSaveChanges}
          disabled={isDisabled || loading.save}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600
            rounded transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
            ${isDisabled || loading.save
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-green-100 dark:hover:bg-green-800'
            }
          `}
          title="Save all changes to project"
        >
          <DocumentArrowDownIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          {loading.save && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onSaveAsTemplate}
          disabled={isDisabled || loading.template}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600
            rounded transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.template
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800'
            }
          `}
          title="Save project as reusable template"
        >
          <DocumentDuplicateIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {loading.template && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onToggleAutoSave}
          disabled={isDisabled || loading.autoSave}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            rounded transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${autoSaveEnabled
              ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600'
              : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }
            ${isDisabled || loading.autoSave
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
            }
          `}
          title={`${autoSaveEnabled ? 'Disable' : 'Enable'} automatic saving`}
        >
          <ClockIcon className={`w-5 h-5 ${
            autoSaveEnabled
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`} />
          {loading.autoSave && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Project Save
      </div>
    </section>
  );
};

export default ProjectSaveSection; 