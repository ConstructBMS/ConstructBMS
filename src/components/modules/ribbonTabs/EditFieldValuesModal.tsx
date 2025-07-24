import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, CheckIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { CustomField } from './FieldTemplateDropdown';

interface EditFieldValuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customFields: CustomField[];
  selectedTasks: string[];
  taskFieldValues: Record<string, Record<string, any>>;
  onSaveValues: (taskId: string, fieldId: string, value: any) => void;
  isDemoMode?: boolean;
}

const EditFieldValuesModal: React.FC<EditFieldValuesModalProps> = ({
  isOpen,
  onClose,
  customFields,
  selectedTasks,
  taskFieldValues,
  onSaveValues,
  isDemoMode = false
}) => {
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  useEffect(() => {
    if (isOpen) {
      setFieldValues(taskFieldValues);
    }
  }, [isOpen, taskFieldValues]);

  const handleFieldValueChange = (taskId: string, fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [fieldId]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      // Save all changed values
      for (const taskId of selectedTasks) {
        const taskValues = fieldValues[taskId] || {};
        for (const [fieldId, value] of Object.entries(taskValues)) {
          await onSaveValues(taskId, fieldId, value);
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to save field values:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldValue = (taskId: string, fieldId: string): any => {
    return fieldValues[taskId]?.[fieldId] ?? '';
  };

  const getMixedValueIndicator = (fieldId: string): boolean => {
    const values = selectedTasks.map(taskId => getFieldValue(taskId, fieldId));
    const uniqueValues = new Set(values);
    return uniqueValues.size > 1;
  };

  const renderFieldInput = (field: CustomField, taskId: string) => {
    const value = getFieldValue(taskId, field.id);
    const isMixed = getMixedValueIndicator(field.id);

    switch (field.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldValueChange(taskId, field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isMixed ? 'Mixed values' : 'Enter text...'}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldValueChange(taskId, field.id, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isMixed ? 'Mixed values' : 'Enter number...'}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldValueChange(taskId, field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'boolean':
        return (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => handleFieldValueChange(taskId, field.id, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{isMixed ? 'Mixed values' : 'Select...'}</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldValueChange(taskId, field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{isMixed ? 'Mixed values' : 'Select...'}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  const getFieldTypeLabel = (type: CustomField['type']): string => {
    const labels = {
      string: 'Text',
      number: 'Number',
      date: 'Date',
      boolean: 'Yes/No',
      dropdown: 'Dropdown'
    };
    return labels[type];
  };

  const getFieldTypeColor = (type: CustomField['type']): string => {
    const colors = {
      string: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-purple-100 text-purple-800',
      boolean: 'bg-yellow-100 text-yellow-800',
      dropdown: 'bg-orange-100 text-orange-800'
    };
    return colors[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <PencilIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Field Values</h2>
              <p className="text-sm text-gray-500">
                Update custom field values for {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!canEdit ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">You don't have permission to edit field values.</p>
            </div>
          ) : customFields.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <PencilIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No custom fields defined</p>
              <p className="text-xs mt-1">Create custom fields first using the Manage Fields button</p>
            </div>
          ) : selectedTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <PencilIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No tasks selected</p>
              <p className="text-xs mt-1">Select one or more tasks to edit their field values</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task ID
                      </th>
                      {customFields.map((field) => (
                        <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <span>{field.label}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getFieldTypeColor(field.type)}`}>
                              {getFieldTypeLabel(field.type)}
                            </span>
                            {field.demo && (
                              <span className="px-1 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Demo
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedTasks.map((taskId) => (
                      <tr key={taskId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {taskId}
                        </td>
                        {customFields.map((field) => (
                          <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {renderFieldInput(field, taskId)}
                              {getMixedValueIndicator(field.id) && (
                                <span className="text-orange-600" title="Mixed values across selected tasks">
                                  <XIcon className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="mt-6 bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Batch Editing Tips</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• Edit values for multiple tasks at once</div>
                  <div>• Mixed values are indicated with an orange X icon</div>
                  <div>• Changes are applied to all selected tasks</div>
                  <div>• Use the Manage Fields button to add new custom fields</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected • {customFields.length} field{customFields.length !== 1 ? 's' : ''} available
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              {canEdit && selectedTasks.length > 0 && customFields.length > 0 && (
                <button
                  onClick={handleSaveAll}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 'Saving...' : 'Save All Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFieldValuesModal; 