import React, { useState, useEffect } from 'react';
import { PlusIcon, CogIcon, TagIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';
import {
  programmeCustomFieldsService,
  ProgrammeCustomField,
} from '../../services/programmeCustomFieldsService';
import CustomFieldsManagerModal from './CustomFieldsManagerModal';

const CustomFieldsDemo: React.FC = () => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [customFields, setCustomFields] = useState<ProgrammeCustomField[]>([]);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const canManage = canAccess('programme.customfields.manage');
  const canView = canAccess('programme.customfields.edit');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load custom fields
  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      const fields =
        await programmeCustomFieldsService.getProjectCustomFields('demo');
      setCustomFields(fields);
    } catch (error) {
      console.error('Error loading custom fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerClose = () => {
    setShowManagerModal(false);
    loadCustomFields(); // Refresh the list
  };

  const getFieldTypeDisplayName = (type: string): string => {
    return programmeCustomFieldsService.getFieldTypeDisplayName(type);
  };

  return (
    <div className='h-screen bg-gray-50 dark:bg-gray-900 overflow-auto'>
      <div className='p-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Custom Fields Demo
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage project-specific custom fields for tasks
          </p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className='mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
            <div className='flex items-center'>
              <CogIcon className='w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2' />
              <div>
                <h3 className='font-medium text-yellow-800 dark:text-yellow-200'>
                  Demo Mode
                </h3>
                <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                  Maximum 2 custom fields allowed. Only text and dropdown types
                  available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setShowManagerModal(true)}
              disabled={!canManage}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <PlusIcon className='w-4 h-4' />
              <span>Manage Custom Fields</span>
            </button>
          </div>
        </div>

        {/* Custom Fields List */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
              Project Custom Fields ({customFields.length})
            </h2>
          </div>

          {loading ? (
            <div className='p-6 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                Loading custom fields...
              </p>
            </div>
          ) : customFields.length === 0 ? (
            <div className='p-8 text-center'>
              <TagIcon className='w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No Custom Fields
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-4'>
                No custom fields have been defined for this project yet.
              </p>
              {canManage && (
                <button
                  onClick={() => setShowManagerModal(true)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Create Your First Field
                </button>
              )}
            </div>
          ) : (
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              {customFields.map(field => (
                <div key={field.id} className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                          {field.label}
                          {field.isRequired && (
                            <span className='text-red-500 ml-1'>*</span>
                          )}
                        </h3>
                        <span className='px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded'>
                          {getFieldTypeDisplayName(field.type)}
                        </span>
                        {field.demo && (
                          <span className='px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded'>
                            DEMO
                          </span>
                        )}
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400'>
                        <div>
                          <span className='font-medium'>Required:</span>{' '}
                          {field.isRequired ? 'Yes' : 'No'}
                        </div>
                        <div>
                          <span className='font-medium'>Grid Visible:</span>{' '}
                          {field.isVisibleInGrid ? 'Yes' : 'No'}
                        </div>
                        <div>
                          <span className='font-medium'>Modal Visible:</span>{' '}
                          {field.isVisibleInModal ? 'Yes' : 'No'}
                        </div>
                      </div>

                      {field.type === 'dropdown' &&
                        field.options &&
                        field.options.length > 0 && (
                          <div className='mt-3'>
                            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                              Options:
                            </span>
                            <div className='mt-1 flex flex-wrap gap-1'>
                              {field.options.map((option, index) => (
                                <span
                                  key={index}
                                  className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded'
                                >
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className='mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6'>
          <h3 className='text-lg font-medium text-blue-900 dark:text-blue-100 mb-3'>
            How to Use Custom Fields
          </h3>
          <div className='space-y-2 text-sm text-blue-800 dark:text-blue-200'>
            <p>
              • <strong>Create Fields:</strong> Use the "Manage Custom Fields"
              button to add new fields
            </p>
            <p>
              • <strong>Field Types:</strong> Choose from Text, Number, Date, or
              Dropdown
            </p>
            <p>
              • <strong>Visibility:</strong> Control whether fields appear in
              the task grid and/or modal
            </p>
            <p>
              • <strong>Required Fields:</strong> Mark fields as required to
              ensure data entry
            </p>
            <p>
              • <strong>Task Entry:</strong> Custom fields appear in the "Custom
              Fields" tab of task modals
            </p>
            <p>
              • <strong>Grid Display:</strong> Fields marked as "Grid Visible"
              appear as columns in task tables
            </p>
          </div>
        </div>
      </div>

      {/* Custom Fields Manager Modal */}
      <CustomFieldsManagerModal
        isOpen={showManagerModal}
        onClose={handleManagerClose}
        projectId='demo'
      />
    </div>
  );
};

export default CustomFieldsDemo;
