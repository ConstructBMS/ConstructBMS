import React, { useState, useEffect } from 'react';
import { XMarkIcon, CogIcon, PlusIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { CustomField, FieldTemplate } from './FieldTemplateDropdown';

interface ManageCustomFieldsModalProps {
  customFields: CustomField[];
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSaveFields: (fields: CustomField[]) => void;
  onSaveTemplate: (template: Omit<FieldTemplate, 'id'>) => void;
}

const ManageCustomFieldsModal: React.FC<ManageCustomFieldsModalProps> = ({
  isOpen,
  onClose,
  customFields,
  onSaveFields,
  onSaveTemplate,
  isDemoMode = false
}) => {
  const [fields, setFields] = useState<CustomField[]>(customFields);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  useEffect(() => {
    if (isOpen) {
      setFields(customFields);
    }
  }, [isOpen, customFields]);

  const handleAddField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'string',
      visible: true,
      demo: isDemoMode
    };
    setEditingField(newField);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField({ ...field });
  };

  const handleDeleteField = (fieldId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this field? This will also remove all values for this field from tasks.');
    if (confirmed) {
      const updatedFields = fields.filter(f => f.id !== fieldId);
      setFields(updatedFields);
    }
  };

  const handleSaveField = (field: CustomField) => {
    if (editingField) {
      // Update existing field
      const updatedFields = fields.map(f => f.id === field.id ? field : f);
      setFields(updatedFields);
    } else {
      // Add new field
      setFields([...fields, field]);
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      await onSaveFields(fields);
      onClose();
    } catch (error) {
      console.error('Failed to save custom fields:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) return;

    setIsLoading(true);
    try {
      const template: Omit<FieldTemplate, 'id'> = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        fields: fields,
        demo: isDemoMode
      };

      await onSaveTemplate(template);
      setShowTemplateDialog(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsLoading(false);
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CogIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Custom Fields</h2>
              <p className="text-sm text-gray-500">Define task-level properties for your project</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {!canEdit ? (
            <div className="text-center text-gray-500">
              <p className="text-sm">You don't have permission to manage custom fields.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Fields List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Custom Fields ({fields.length})</h3>
                  <div className="flex space-x-2">
                    {canEdit && fields.length > 0 && (
                      <button
                        onClick={() => setShowTemplateDialog(true)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Save as Template
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={handleAddField}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Field</span>
                      </button>
                    )}
                  </div>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CogIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No custom fields defined</p>
                    <p className="text-xs mt-1">Add fields to extend task properties</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{field.label}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getFieldTypeColor(field.type)}`}>
                                {getFieldTypeLabel(field.type)}
                              </span>
                              {field.demo && (
                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                  Demo
                                </span>
                              )}
                              <div className="flex items-center space-x-1">
                                {field.visible ? (
                                  <EyeIcon className="w-4 h-4 text-green-600" />
                                ) : (
                                  <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {field.visible ? 'Visible' : 'Hidden'}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              ID: {field.id}
                              {field.type === 'dropdown' && field.options && (
                                <div className="mt-1">
                                  Options: {field.options.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditField(field)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit field"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteField(field.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete field"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Field Editor */}
              {editingField && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {editingField.id.startsWith('field_') ? 'Add New Field' : 'Edit Field'}
                  </h4>
                  <FieldEditor
                    field={editingField}
                    onSave={handleSaveField}
                    onCancel={handleCancelEdit}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {fields.length} field{fields.length !== 1 ? 's' : ''} defined
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              {canEdit && (
                <button
                  onClick={handleSaveAll}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 'Saving...' : 'Save Fields'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Dialog */}
      {showTemplateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Save as Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Site Tasks, Office Deliverables"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this template is for..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTemplateDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={isLoading || !templateName.trim()}
                  className={`
                    px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md
                    hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    ${isLoading || !templateName.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Field Editor Component
interface FieldEditorProps {
  field: CustomField;
  onCancel: () => void;
  onSave: (field: CustomField) => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CustomField>(field);
  const [newOption, setNewOption] = useState('');

  const handleInputChange = (key: keyof CustomField, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddOption = () => {
    if (newOption.trim() && formData.options) {
      const updatedOptions = [...formData.options, newOption.trim()];
      handleInputChange('options', updatedOptions);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options) {
      const updatedOptions = formData.options.filter((_, i) => i !== index);
      handleInputChange('options', updatedOptions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    // Generate field ID if it's a new field
    const finalField = {
      ...formData,
      id: formData.id.startsWith('field_') ? `field_${Date.now()}` : formData.id
    };

    onSave(finalField);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Label *
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as CustomField['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="string">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="boolean">Yes/No</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>
      </div>

      {formData.type === 'dropdown' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dropdown Options
          </label>
          <div className="space-y-2">
            {formData.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const updatedOptions = [...(formData.options || [])];
                    updatedOptions[index] = e.target.value;
                    handleInputChange('options', updatedOptions);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="visible"
          checked={formData.visible}
          onChange={(e) => handleInputChange('visible', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="visible" className="text-sm text-gray-700">
          Show this field in the task grid
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Save Field
        </button>
      </div>
    </form>
  );
};

export default ManageCustomFieldsModal; 