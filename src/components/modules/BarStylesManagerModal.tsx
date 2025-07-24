import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { barStylesService, BarStyleRule, BarStyle, BarStyleCondition } from '../../services/barStylesService';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface BarStylesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onStylesUpdated?: () => void;
}

interface RuleFormData {
  ruleName: string;
  condition: BarStyleCondition;
  style: BarStyle;
}

const BarStylesManagerModal: React.FC<BarStylesManagerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onStylesUpdated
}) => {
  const { user } = useAuth();
  const { canAccess } = usePermissions();
  const [rules, setRules] = useState<BarStyleRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BarStyleRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>({
    ruleName: '',
    condition: { field: 'isCritical', operator: '=', value: '' },
    style: { barColor: '#3B82F6', borderColor: '#1E40AF', textColor: '#FFFFFF', pattern: 'solid' }
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [previewTask, setPreviewTask] = useState<any>({
    name: 'Sample Task',
    isCritical: false,
    type: 'standard',
    status: 'not-started',
    tagId: '',
    assignee: '',
    priority: 'medium'
  });

  const hasManagePermission = canAccess('programme.barstyles.manage');
  const hasViewPermission = canAccess('programme.barstyles.view');

  // Load rules on mount
  useEffect(() => {
    if (isOpen && hasViewPermission) {
      loadRules();
    }
  }, [isOpen, projectId, hasViewPermission]);

  // Load bar style rules
  const loadRules = async () => {
    try {
      setLoading(true);
      const projectRules = await barStylesService.getBarStyleRules(projectId);
      setRules(projectRules);
    } catch (error) {
      console.error('Error loading bar style rules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      ruleName: '',
      condition: { field: 'isCritical', operator: '=', value: '' },
      style: { barColor: '#3B82F6', borderColor: '#1E40AF', textColor: '#FFFFFF', pattern: 'solid' }
    });
    setErrors([]);
    setEditingRule(null);
  };

  // Open form for new rule
  const handleAddRule = () => {
    resetForm();
    setShowForm(true);
  };

  // Open form for editing rule
  const handleEditRule = (rule: BarStyleRule) => {
    if (rule.isDefault && !hasManagePermission) return;
    
    setFormData({
      ruleName: rule.ruleName,
      condition: rule.condition,
      style: rule.style
    });
    setEditingRule(rule);
    setShowForm(true);
  };

  // Delete rule
  const handleDeleteRule = async (rule: BarStyleRule) => {
    if (rule.isDefault && !hasManagePermission) return;
    
    if (!confirm(`Are you sure you want to delete the rule "${rule.ruleName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await barStylesService.deleteBarStyleRule(rule.id);
      await loadRules();
      onStylesUpdated?.();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule');
    } finally {
      setLoading(false);
    }
  };

  // Toggle rule visibility
  const handleToggleRule = async (rule: BarStyleRule) => {
    if (rule.isDefault && !hasManagePermission) return;
    
    try {
      setLoading(true);
      await barStylesService.updateBarStyleRule(rule.id, { isDefault: !rule.isDefault });
      await loadRules();
      onStylesUpdated?.();
    } catch (error) {
      console.error('Error toggling rule:', error);
      alert('Failed to toggle rule');
    } finally {
      setLoading(false);
    }
  };

  // Save rule
  const handleSaveRule = async () => {
    // Validate form
    const validation = barStylesService.validateBarStyleRule({
      ruleName: formData.ruleName,
      condition: formData.condition,
      style: formData.style
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      
      if (editingRule) {
        await barStylesService.updateBarStyleRule(editingRule.id, {
          ruleName: formData.ruleName,
          condition: formData.condition,
          style: formData.style
        });
      } else {
        await barStylesService.createBarStyleRule({
          projectId,
          ruleName: formData.ruleName,
          condition: formData.condition,
          style: formData.style,
          createdBy: user?.id || '',
          isDefault: false,
          demo: false
        });
      }

      await loadRules();
      onStylesUpdated?.();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Failed to save rule');
    } finally {
      setLoading(false);
    }
  };

  // Get preview style for current task
  const getPreviewStyle = (): BarStyle => {
    const matchingRule = barStylesService.getBarStyleForTask(previewTask, rules);
    return matchingRule || { barColor: '#3B82F6', borderColor: '#1E40AF', textColor: '#FFFFFF', pattern: 'solid' };
  };

  // Update preview task
  const updatePreviewTask = (field: string, value: any) => {
    setPreviewTask(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Bar Styles
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Rules List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Style Rules ({rules.length})
                </h3>
                {hasManagePermission && (
                  <button
                    onClick={handleAddRule}
                    disabled={loading}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Rule
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-4 border rounded-lg ${
                        rule.isDefault
                          ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {rule.ruleName}
                            </h4>
                            {rule.isDefault && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                Default
                              </span>
                            )}
                            {rule.demo && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                                Demo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {rule.condition.field} {rule.condition.operator} "{rule.condition.value}"
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{
                                backgroundColor: rule.style.barColor,
                                borderColor: rule.style.borderColor,
                                borderStyle: rule.style.pattern === 'dashed' ? 'dashed' : 'solid'
                              }}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {rule.style.barColor}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {hasManagePermission && !rule.isDefault && (
                            <>
                              <button
                                onClick={() => handleEditRule(rule)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Edit rule"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule)}
                                className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                                title="Delete rule"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleRule(rule)}
                            disabled={!hasManagePermission}
                            className={`p-1 ${
                              rule.isDefault
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title={rule.isDefault ? 'Active' : 'Inactive'}
                          >
                            {rule.isDefault ? (
                              <EyeIcon className="w-4 h-4" />
                            ) : (
                              <EyeSlashIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Form or Preview */}
          <div className="w-1/2 overflow-y-auto">
            {showForm ? (
              <RuleForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                onSave={handleSaveRule}
                onCancel={() => {
                  setShowForm(false);
                  resetForm();
                }}
                loading={loading}
                editingRule={editingRule}
              />
            ) : (
              <RulePreview
                previewTask={previewTask}
                updatePreviewTask={updatePreviewTask}
                getPreviewStyle={getPreviewStyle}
                rules={rules}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Rule Form Component
interface RuleFormProps {
  formData: RuleFormData;
  setFormData: (data: RuleFormData) => void;
  errors: string[];
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  editingRule: BarStyleRule | null;
}

const RuleForm: React.FC<RuleFormProps> = ({
  formData,
  setFormData,
  errors,
  onSave,
  onCancel,
  loading,
  editingRule
}) => {
  const availableFields = barStylesService.getAvailableFields();
  const availableOperators = barStylesService.getAvailableOperators();
  const patternOptions = barStylesService.getPatternOptions();

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {editingRule ? 'Edit Rule' : 'Add New Rule'}
      </h3>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          {errors.map((error, index) => (
            <div key={index} className="text-red-600 text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {error}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {/* Rule Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rule Name
          </label>
          <input
            type="text"
            value={formData.ruleName}
            onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., Highlight Snagging Tasks"
          />
        </div>

        {/* Condition */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Condition
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            <select
              value={formData.condition.field}
              onChange={(e) => setFormData({
                ...formData,
                condition: { ...formData.condition, field: e.target.value }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {availableFields.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>

            <select
              value={formData.condition.operator}
              onChange={(e) => setFormData({
                ...formData,
                condition: { ...formData.condition, operator: e.target.value as any }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {availableOperators.map(op => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={formData.condition.value}
              onChange={(e) => setFormData({
                ...formData,
                condition: { ...formData.condition, value: e.target.value }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Value"
            />
          </div>
        </div>

        {/* Style */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Style
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Bar Color
              </label>
              <input
                type="color"
                value={formData.style.barColor}
                onChange={(e) => setFormData({
                  ...formData,
                  style: { ...formData.style, barColor: e.target.value }
                })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Border Color
              </label>
              <input
                type="color"
                value={formData.style.borderColor}
                onChange={(e) => setFormData({
                  ...formData,
                  style: { ...formData.style, borderColor: e.target.value }
                })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={formData.style.textColor}
                onChange={(e) => setFormData({
                  ...formData,
                  style: { ...formData.style, textColor: e.target.value }
                })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Pattern
              </label>
              <select
                value={formData.style.pattern}
                onChange={(e) => setFormData({
                  ...formData,
                  style: { ...formData.style, pattern: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {patternOptions.map(pattern => (
                  <option key={pattern.value} value={pattern.value}>
                    {pattern.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div
            className="px-4 py-2 rounded border-2 transition-all"
            style={{
              backgroundColor: formData.style.barColor,
              borderColor: formData.style.borderColor,
              color: formData.style.textColor,
              borderStyle: formData.style.pattern === 'dashed' ? 'dashed' : 'solid'
            }}
          >
            Sample Task Bar
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckCircleIcon className="w-4 h-4" />
            )}
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Rule Preview Component
interface RulePreviewProps {
  previewTask: any;
  updatePreviewTask: (field: string, value: any) => void;
  getPreviewStyle: () => BarStyle;
  rules: BarStyleRule[];
}

const RulePreview: React.FC<RulePreviewProps> = ({
  previewTask,
  updatePreviewTask,
  getPreviewStyle,
  rules
}) => {
  const previewStyle = getPreviewStyle();

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Live Preview
      </h3>

      <div className="space-y-4">
        {/* Task Properties */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Properties
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Critical Path
              </label>
              <select
                value={previewTask.isCritical.toString()}
                onChange={(e) => updatePreviewTask('isCritical', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Task Type
              </label>
              <select
                value={previewTask.type}
                onChange={(e) => updatePreviewTask('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="standard">Standard</option>
                <option value="milestone">Milestone</option>
                <option value="summary">Summary</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                value={previewTask.status}
                onChange={(e) => updatePreviewTask('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Tag
              </label>
              <input
                type="text"
                value={previewTask.tagId}
                onChange={(e) => updatePreviewTask('tagId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., snagging"
              />
            </div>
          </div>
        </div>

        {/* Preview Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Bar Preview
          </label>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div
              className="px-4 py-3 rounded border-2 transition-all"
              style={{
                backgroundColor: previewStyle.barColor,
                borderColor: previewStyle.borderColor,
                color: previewStyle.textColor,
                borderStyle: previewStyle.pattern === 'dashed' ? 'dashed' : 'solid'
              }}
            >
              {previewTask.name}
            </div>
          </div>
        </div>

        {/* Matching Rule Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Applied Rule
          </label>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            {(() => {
              const matchingRule = barStylesService.getBarStyleForTask(previewTask, rules);
              if (matchingRule) {
                const rule = rules.find(r => 
                  r.style.barColor === matchingRule.barColor && 
                  r.style.borderColor === matchingRule.borderColor
                );
                return rule ? (
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {rule.ruleName}
                    </div>
                    <div className="text-blue-700 dark:text-blue-200">
                      {rule.condition.field} {rule.condition.operator} "{rule.condition.value}"
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-blue-700 dark:text-blue-200">
                    Default style applied
                  </div>
                );
              } else {
                return (
                  <div className="text-sm text-blue-700 dark:text-blue-200">
                    No matching rule - default style applied
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarStylesManagerModal; 