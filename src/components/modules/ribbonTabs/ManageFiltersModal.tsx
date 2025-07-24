import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Filter, FilterRule } from './FilterDropdown';

interface ManageFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filter[];
  onSaveFilter: (filter: Omit<Filter, 'id' | 'createdAt'>) => void;
  onUpdateFilter: (filter: Filter) => void;
  onDeleteFilter: (filterId: string) => void;
  isDemoMode?: boolean;
}

const ManageFiltersModal: React.FC<ManageFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onSaveFilter,
  onUpdateFilter,
  onDeleteFilter,
  isDemoMode = false
}) => {
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  // Available fields for filter rules
  const availableFields = [
    { value: 'name', label: 'Task Name' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'finishDate', label: 'Finish Date' },
    { value: 'percentComplete', label: '% Complete' },
    { value: 'duration', label: 'Duration' },
    { value: 'isCritical', label: 'Critical Path' },
    { value: 'hasConstraints', label: 'Has Constraints' },
    { value: 'isMilestone', label: 'Is Milestone' },
    { value: 'level', label: 'WBS Level' },
    { value: 'assignedTo', label: 'Assigned To' },
    { value: 'status', label: 'Status' }
  ];

  // Available operators
  const availableOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'lessThanOrEqual', label: 'Less Than or Equal' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' }
  ];

  useEffect(() => {
    if (isOpen && !editingFilter) {
      resetForm();
    }
  }, [isOpen, editingFilter]);

  const resetForm = () => {
    setFilterName('');
    setFilterRules([]);
    setIsCreating(false);
    setEditingFilter(null);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingFilter(null);
    setFilterName('');
    setFilterRules([]);
  };

  const handleEditFilter = (filter: Filter) => {
    setEditingFilter(filter);
    setIsCreating(false);
    setFilterName(filter.name);
    setFilterRules([...filter.rules]);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }

    if (filterRules.length === 0) {
      alert('Please add at least one filter rule');
      return;
    }

    if (editingFilter) {
      onUpdateFilter({
        ...editingFilter,
        name: filterName,
        rules: filterRules
      });
    } else {
      onSaveFilter({
        name: filterName,
        type: 'custom',
        rules: filterRules,
        createdBy: 'Demo User',
        shared: false,
        demo: isDemoMode
      });
    }

    resetForm();
  };

  const handleDeleteFilter = (filterId: string) => {
    if (confirm('Are you sure you want to delete this filter?')) {
      onDeleteFilter(filterId);
    }
  };

  const addRule = () => {
    setFilterRules([
      ...filterRules,
      { field: 'name', operator: 'equals', value: '' }
    ]);
  };

  const updateRule = (index: number, field: keyof FilterRule, value: any) => {
    const updatedRules = [...filterRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setFilterRules(updatedRules);
  };

  const removeRule = (index: number) => {
    setFilterRules(filterRules.filter((_, i) => i !== index));
  };

  const getValueInput = (rule: FilterRule, index: number) => {
    const field = availableFields.find(f => f.value === rule.field);
    
    if (field?.value === 'isCritical' || field?.value === 'hasConstraints' || field?.value === 'isMilestone') {
      return (
        <select
          value={rule.value as string}
          onChange={(e) => updateRule(index, 'value', e.target.value === 'true')}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    if (field?.value === 'startDate' || field?.value === 'finishDate') {
      return (
        <input
          type="date"
          value={rule.value as string}
          onChange={(e) => updateRule(index, 'value', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      );
    }

    if (field?.value === 'percentComplete' || field?.value === 'duration' || field?.value === 'level') {
      return (
        <input
          type="number"
          value={rule.value as number}
          onChange={(e) => updateRule(index, 'value', parseFloat(e.target.value) || 0)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
        />
      );
    }

    return (
      <input
        type="text"
        value={rule.value as string}
        onChange={(e) => updateRule(index, 'value', e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Enter value"
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Filters</h2>
              <p className="text-sm text-gray-500">Create and edit custom filters</p>
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

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Existing Filters */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Saved Filters</h3>
              {canEdit && (
                <button
                  onClick={handleCreateNew}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filters.filter(f => f.type === 'custom').map((filter) => (
                <div
                  key={filter.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    editingFilter?.id === filter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleEditFilter(filter)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{filter.name}</div>
                      <div className="text-sm text-gray-500">
                        {filter.rules.length} rule{filter.rules.length !== 1 ? 's' : ''}
                      </div>
                      {filter.demo && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                          Demo
                        </span>
                      )}
                    </div>
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFilter(filter.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Delete filter"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {filters.filter(f => f.type === 'custom').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No custom filters yet</p>
                  {canEdit && (
                    <button
                      onClick={handleCreateNew}
                      className="mt-2 text-blue-600 hover:text-blue-700"
                    >
                      Create your first filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Filter Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!canEdit ? (
              <div className="text-center text-gray-500">
                <p>You don't have permission to manage filters.</p>
              </div>
            ) : (isCreating || editingFilter) ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter filter name"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Filter Rules
                    </label>
                    <button
                      onClick={addRule}
                      className="flex items-center space-x-1 px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <PlusIcon className="w-3 h-3" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filterRules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded">
                        <select
                          value={rule.field}
                          onChange={(e) => updateRule(index, 'field', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {availableFields.map(field => (
                            <option key={field.value} value={field.value}>
                              {field.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={rule.operator}
                          onChange={(e) => updateRule(index, 'operator', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {availableOperators.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        {getValueInput(rule, index)}

                        <button
                          onClick={() => removeRule(index)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Remove rule"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {filterRules.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
                        <p>No rules added yet</p>
                        <button
                          onClick={addRule}
                          className="mt-2 text-blue-600 hover:text-blue-700"
                        >
                          Add your first rule
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFilter}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingFilter ? 'Update Filter' : 'Save Filter'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a filter to edit or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFiltersModal; 