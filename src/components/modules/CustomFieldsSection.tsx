import React, { useState, useEffect } from 'react';
import { TagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { programmeCustomFieldsService, CustomFieldWithValue } from '../services/programmeCustomFieldsService';

interface CustomFieldsSectionProps {
  taskId?: string;
  projectId: string;
  onFieldChange?: (fieldId: string, value: any) => void;
}

const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({
  taskId,
  projectId,
  onFieldChange
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [customFields, setCustomFields] = useState<CustomFieldWithValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canEdit = canAccess('programme.task.edit');

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
    const loadCustomFields = async () => {
      try {
        setLoading(true);
        
        if (taskId) {
          // Edit mode: load existing values
          const fieldValues = await programmeCustomFieldsService.getTaskCustomFieldValues(taskId);
          setCustomFields(fieldValues);
        } else {
          // Create mode: load field definitions only
          const projectFields = await programmeCustomFieldsService.getVisibleProjectCustomFields(projectId);
          const fieldValues: CustomFieldWithValue[] = projectFields.map(field => ({
            ...field,
            value: undefined
          }));
          setCustomFields(fieldValues);
        }
      } catch (error) {
        console.error('Error loading custom fields:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomFields();
  }, [taskId, projectId]);

  // Handle field value change
  const handleFieldChange = async (fieldId: string, value: any) => {
    try {
      // Update local state
      setCustomFields(prev => prev.map(field => 
        field.fieldId === fieldId ? { ...field, value } : field
      ));
      
      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
      
      // Save to Supabase if task exists
      if (taskId) {
        const result = await programmeCustomFieldsService.saveTaskCustomFieldValue(taskId, fieldId, value);
        if (!result.success) {
          setErrors(prev => ({ ...prev, [fieldId]: result.error || 'Failed to save field' }));
        }
      }
      
      // Notify parent component
      onFieldChange?.(fieldId, value);
    } catch (error) {
      console.error('Error handling field change:', error);
      setErrors(prev => ({ ...prev, [fieldId]: 'Failed to update field' }));
    }
  };

  // Validate all fields
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    customFields.forEach(field => {
      if (field.isRequired && (field.value === null || field.value === undefined || field.value === '')) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Render field input based on type
  const renderFieldInput = (field: CustomFieldWithValue) => {
    const hasError = errors[field.id];
    const isDisabled = !canEdit || (isDemoMode && field.type !== 'text' && field.type !== 'dropdown');
    
    const baseInputClass = `
      w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200
      ${hasError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
      }
      ${isDisabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
    `;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            disabled={isDisabled}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={field.value as number || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value === '' ? null : Number(e.target.value))}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            disabled={isDisabled}
          />
        );
        
      case 'date':
        const dateValue = field.value instanceof Date 
          ? field.value.toISOString().split('T')[0]
          : field.value as string || '';
        
        return (
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value === '' ? null : new Date(e.target.value))}
            className={baseInputClass}
            disabled={isDisabled}
          />
        );
        
      case 'dropdown':
        return (
          <select
            value={field.value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value === '' ? null : e.target.value)}
            className={baseInputClass}
            disabled={isDisabled}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      default:
        return (
          <input
            type="text"
            value={field.value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            disabled={isDisabled}
          />
        );
    }
  };

  // Get field type display name
  const getFieldTypeDisplayName = (type: string): string => {
    return programmeCustomFieldsService.getFieldTypeDisplayName(type);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom Fields</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (customFields.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom Fields</h3>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <TagIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No custom fields defined for this project</p>
          {!isDemoMode && canAccess('programme.fields.manage') && (
            <p className="text-sm mt-2">Contact your administrator to add custom fields</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <TagIcon className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom Fields</h3>
        {isDemoMode && (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-md">
            DEMO MODE
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {customFields.map(field => (
          <div key={field.fieldId} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getFieldTypeDisplayName(field.type)}
                </span>
                {isDemoMode && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    DEMO FIELD
                  </span>
                )}
              </div>
            </div>
            
            {renderFieldInput(field)}
            
            {errors[field.id] && (
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{errors[field.id]}</span>
              </div>
            )}
            
            {isDemoMode && field.type !== 'text' && field.type !== 'dropdown' && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                {field.type} fields are disabled in demo mode
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isDemoMode && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Demo Mode Restrictions:</p>
              <ul className="mt-1 space-y-1">
                <li>• Maximum 3 custom fields allowed</li>
                <li>• Only text and dropdown types available</li>
                <li>• Field definitions cannot be edited</li>
                <li>• All data tagged as demo</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsSection; 