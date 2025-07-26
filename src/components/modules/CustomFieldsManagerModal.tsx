import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';
import { programmeCustomFieldsService, ProgrammeCustomField } from '../../services/programmeCustomFieldsService';

interface CustomFieldsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface CustomFieldFormData {
  isRequired: boolean;
  isVisibleInGrid: boolean;
  isVisibleInModal: boolean;
  label: string;
  options: string[];
  type: 'text' | 'number' | 'date' | 'dropdown';
}

const CustomFieldsManagerModal: React.FC<CustomFieldsManagerModalProps> = ({
  isOpen,
  onClose,
  projectId
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [customFields, setCustomFields] = useState<ProgrammeCustomField[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingField, setEditingField] = useState<ProgrammeCustomField | null>(null);
  const [formData, setFormData] = useState<CustomFieldFormData>({
    label: '',
    type: 'text',
    options: [],
    isRequired: false,
    isVisibleInGrid: true,
    isVisibleInModal: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOption, setNewOption] = useState('');

  const canManage = canAccess('programme.customfields.manage');
  const canView = canAccess('programme.customfields.edit');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load custom fields
  useEffect(() => {
    if (isOpen) {
      loadCustomFields();
    }
  }, [isOpen, projectId]);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      const fields = await programmeCustomFieldsService.getProjectCustomFields(projectId);
      setCustomFields(fields);
    } catch (error) {
      console.error('Error loading custom fields:', error);
      setError('Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async () => {
    if (!canManage) return;

    try {
      setLoading(true);
      setError(null);

      const result = await programmeCustomFieldsService.createCustomField({
        projectId,
        label: formData.label,
        type: formData.type,
        options: formData.type === 'dropdown' ? formData.options : [],
        createdBy: 'current-user', // This should come from auth context
        isRequired: formData.isRequired,
        isVisibleInGrid: formData.isVisibleInGrid,
        isVisibleInModal: formData.isVisibleInModal,
        demo: isDemoMode
      });

      if (result.success && result.field) {
        setCustomFields(prev => [...prev, result.field!]);
        resetForm();
        setShowCreateForm(false);
      } else {
        setError(result.error || 'Failed to create custom field');
      }
    } catch (error) {
      console.error('Error creating custom field:', error);
      setError('Failed to create custom field');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async () => {
    if (!canManage || !editingField) return;

    try {
      setLoading(true);
      setError(null);

      const result = await programmeCustomFieldsService.updateCustomField(editingField.id, {
        label: formData.label,
        type: formData.type,
        options: formData.type === 'dropdown' ? formData.options : [],
        isRequired: formData.isRequired,
        isVisibleInGrid: formData.isVisibleInGrid,
        isVisibleInModal: formData.isVisibleInModal
      });

      if (result.success && result.field) {
        setCustomFields(prev => prev.map(field => 
          field.id === editingField.id ? result.field! : field
        ));
        resetForm();
        setEditingField(null);
      } else {
        setError(result.error || 'Failed to update custom field');
      }
    } catch (error) {
      console.error('Error updating custom field:', error);
      setError('Failed to update custom field');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!canManage) return;

    if (!confirm('Are you sure you want to delete this custom field? This will also delete all values for this field.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await programmeCustomFieldsService.deleteCustomField(fieldId);
      
      if (result.success) {
        setCustomFields(prev => prev.filter(field => field.id !== fieldId));
      } else {
        setError(result.error || 'Failed to delete custom field');
      }
    } catch (error) {
      console.error('Error deleting custom field:', error);
      setError('Failed to delete custom field');
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field: ProgrammeCustomField) => {
    setEditingField(field);
    setFormData({
      label: field.label,
      type: field.type,
      options: field.options || [],
      isRequired: field.isRequired,
      isVisibleInGrid: field.isVisibleInGrid,
      isVisibleInModal: field.isVisibleInModal
    });
  };

  const resetForm = () => {
    setFormData({
      label: '',
      type: 'text',
      options: [],
      isRequired: false,
      isVisibleInGrid: true,
      isVisibleInModal: true
    });
    setNewOption('');
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const getFieldTypeDisplayName = (type: string): string => {
    return programmeCustomFieldsService.getFieldTypeDisplayName(type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Custom Fields Manager
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700 p-3">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <div className="font-semibold">DEMO MODE</div>
              <div className="text-xs">
                Maximum 2 custom fields allowed. Only text and dropdown types available.
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || editingField) && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingField ? 'Edit Custom Field' : 'Create New Custom Field'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Field Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Tender Ref, Risk Level"
                    disabled={!canManage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Field Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'text' | 'number' | 'date' | 'dropdown',
                      options: e.target.value === 'dropdown' ? prev.options : []
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    disabled={!canManage || isDemoMode}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={!canManage}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Required</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVisibleInGrid}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVisibleInGrid: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={!canManage || isDemoMode}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Visible in Grid</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVisibleInModal}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVisibleInModal: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={!canManage}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Visible in Modal</span>
                  </label>
                </div>
              </div>

              {/* Dropdown Options */}
              {formData.type === 'dropdown' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dropdown Options *
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Add new option"
                      disabled={!canManage}
                      onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    />
                    <button
                      onClick={addOption}
                      disabled={!canManage || !newOption.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                        <button
                          onClick={() => removeOption(index)}
                          disabled={!canManage}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={editingField ? handleUpdateField : handleCreateField}
                  disabled={!canManage || loading || !formData.label.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (editingField ? 'Update Field' : 'Create Field')}
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(false);
                    setEditingField(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Custom Fields List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Project Custom Fields ({customFields.length})
              </h3>
              {canManage && !showCreateForm && !editingField && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={isDemoMode && customFields.length >= 2}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Field</span>
                </button>
              )}
            </div>

            {loading && !showCreateForm && !editingField ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : customFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No custom fields defined for this project</p>
                {canManage && (
                  <p className="text-sm mt-2">Click "Add Field" to create your first custom field</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {customFields.map(field => (
                  <div key={field.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {field.label}
                          {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded">
                          {getFieldTypeDisplayName(field.type)}
                        </span>
                        {field.demo && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          {field.isVisibleInGrid ? (
                            <EyeIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <EyeSlashIcon className="w-4 h-4 mr-1" />
                          )}
                          Grid
                        </span>
                        <span className="flex items-center">
                          {field.isVisibleInModal ? (
                            <EyeIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <EyeSlashIcon className="w-4 h-4 mr-1" />
                          )}
                          Modal
                        </span>
                        {field.type === 'dropdown' && field.options && (
                          <span>{field.options.length} options</span>
                        )}
                      </div>
                    </div>
                    
                    {canManage && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditField(field)}
                          disabled={isDemoMode}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          title="Edit field"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          disabled={isDemoMode}
                          className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50"
                          title="Delete field"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomFieldsManagerModal; 