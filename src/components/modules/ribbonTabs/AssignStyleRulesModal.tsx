import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon, PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface StyleRule {
  id: string;
  name: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string;
  styleId: string;
  priority: number;
  projectId: string;
  userId: string;
  demo?: boolean;
}

interface AssignStyleRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleRules: StyleRule[];
  onStyleRulesChange: (rules: StyleRule[]) => void;
  barStyles: Array<{ id: string; name: string; fill: string; border: string; pattern: string }>;
  onSave: () => void;
  projectId: string;
  loading?: boolean;
}

const AssignStyleRulesModal: React.FC<AssignStyleRulesModalProps> = ({
  isOpen,
  onClose,
  styleRules,
  onStyleRulesChange,
  barStyles,
  onSave,
  projectId,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [localStyleRules, setLocalStyleRules] = useState<StyleRule[]>(styleRules);
  const [editingRule, setEditingRule] = useState<StyleRule | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const canEdit = canAccess('programme.format.edit');

  // Update local style rules when props change
  React.useEffect(() => {
    setLocalStyleRules(styleRules);
  }, [styleRules]);

  const fieldOptions = [
    { value: 'name', label: 'Task Name', description: 'Task name field' },
    { value: 'type', label: 'Task Type', description: 'Task type or category' },
    { value: 'status', label: 'Status', description: 'Task status' },
    { value: 'tag', label: 'Tag', description: 'Custom task tag' },
    { value: 'assignee', label: 'Assignee', description: 'Task assignee' },
    { value: 'priority', label: 'Priority', description: 'Task priority level' }
  ];

  const operatorOptions = [
    { value: 'equals', label: 'Equals', description: 'Exact match' },
    { value: 'contains', label: 'Contains', description: 'Contains text' },
    { value: 'starts_with', label: 'Starts with', description: 'Begins with text' },
    { value: 'ends_with', label: 'Ends with', description: 'Ends with text' },
    { value: 'greater_than', label: 'Greater than', description: 'Greater than value' },
    { value: 'less_than', label: 'Less than', description: 'Less than value' }
  ];

  const handleAddRule = () => {
    const newRule: Omit<StyleRule, 'id' | 'userId'> = {
      name: '',
      field: 'name',
      operator: 'equals',
      value: '',
      styleId: barStyles[0]?.id || '',
      priority: localStyleRules.length + 1,
      projectId
    };

    setEditingRule({
      ...newRule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current-user'
    });
    setShowAddForm(true);
  };

  const handleEditRule = (rule: StyleRule) => {
    setEditingRule(rule);
    setShowAddForm(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = localStyleRules.filter(rule => rule.id !== ruleId);
    // Reorder priorities
    const reorderedRules = updatedRules.map((rule, index) => ({
      ...rule,
      priority: index + 1
    }));
    setLocalStyleRules(reorderedRules);
  };

  const handleMoveRule = (ruleId: string, direction: 'up' | 'down') => {
    const currentIndex = localStyleRules.findIndex(rule => rule.id === ruleId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= localStyleRules.length) return;

    const updatedRules = [...localStyleRules];
    const temp = updatedRules[currentIndex];
    updatedRules[currentIndex] = updatedRules[newIndex];
    updatedRules[newIndex] = temp;

    // Update priorities
    updatedRules.forEach((rule, index) => {
      rule.priority = index + 1;
    });

    setLocalStyleRules(updatedRules);
  };

  const handleSaveRule = (rule: StyleRule) => {
    if (!rule.name.trim() || !rule.value.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const existingIndex = localStyleRules.findIndex(r => r.id === rule.id);
    let updatedRules: StyleRule[];

    if (existingIndex >= 0) {
      // Update existing rule
      updatedRules = [...localStyleRules];
      updatedRules[existingIndex] = rule;
    } else {
      // Add new rule
      rule.priority = localStyleRules.length + 1;
      updatedRules = [...localStyleRules, rule];
    }

    setLocalStyleRules(updatedRules);
    setEditingRule(null);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    onStyleRulesChange(localStyleRules);
    onSave();
    onClose();
  };

  const handleCancel = () => {
    setLocalStyleRules(styleRules); // Reset to original
    setEditingRule(null);
    setShowAddForm(false);
    onClose();
  };

  const getSelectedStyle = (styleId: string) => {
    return barStyles.find(style => style.id === styleId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Assign Style Rules
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* Style Rules List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Style Rules ({localStyleRules.length})
              </h3>
              {canEdit && (
                <button
                  onClick={handleAddRule}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Rule</span>
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {localStyleRules.map((rule, index) => {
                const selectedStyle = getSelectedStyle(rule.styleId);
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Priority */}
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Priority</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {rule.priority}
                        </span>
                      </div>
                      
                      {/* Rule Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {rule.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({rule.field} {rule.operator} "{rule.value}")
                          </span>
                        </div>
                        
                        {/* Applied Style Preview */}
                        {selectedStyle && (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-3 rounded border"
                              style={{
                                backgroundColor: selectedStyle.fill,
                                borderColor: selectedStyle.border,
                                borderStyle: selectedStyle.pattern === 'dashed' ? 'dashed' : 
                                           selectedStyle.pattern === 'dotted' ? 'dotted' : 'solid'
                              }}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedStyle.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Move Up/Down */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveRule(rule.id, 'up')}
                          disabled={!canEdit || index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveRule(rule.id, 'down')}
                          disabled={!canEdit || index === localStyleRules.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleEditRule(rule)}
                        disabled={!canEdit}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit rule"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={loading}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Delete rule"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {localStyleRules.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No style rules created yet.</p>
                  <p className="text-sm">Click "Add Rule" to create your first style rule.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Form */}
          {showAddForm && editingRule && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                {editingRule.id.startsWith('rule_') ? 'Add New Rule' : 'Edit Rule'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    placeholder="Enter rule name..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field
                  </label>
                  <select
                    value={editingRule.field}
                    onChange={(e) => setEditingRule({ ...editingRule, field: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  >
                    {fieldOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operator
                  </label>
                  <select
                    value={editingRule.operator}
                    onChange={(e) => setEditingRule({ ...editingRule, operator: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  >
                    {operatorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Value
                  </label>
                  <input
                    type="text"
                    value={editingRule.value}
                    onChange={(e) => setEditingRule({ ...editingRule, value: e.target.value })}
                    placeholder="Enter value to match..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apply Style
                  </label>
                  <select
                    value={editingRule.styleId}
                    onChange={(e) => setEditingRule({ ...editingRule, styleId: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  >
                    {barStyles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Rule Preview */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Rule Preview
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Name:</span> {editingRule.name || 'Rule Name'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Condition:</span> {editingRule.field} {editingRule.operator} "{editingRule.value}"
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Style:</span> {getSelectedStyle(editingRule.styleId)?.name || 'No style selected'}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => handleSaveRule(editingRule)}
                    disabled={!canEdit || loading || !editingRule.name.trim() || !editingRule.value.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingRule.id.startsWith('rule_') ? 'Add Rule' : 'Update Rule'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !canEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStyleRulesModal; 