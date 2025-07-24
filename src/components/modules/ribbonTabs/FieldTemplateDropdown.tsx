import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface FieldTemplate {
  demo?: boolean;
  description: string;
  fields: CustomField[];
  id: string;
  name: string;
}

export interface CustomField {
  id: string;
  label: string;
  options?: string[];
  type: 'string' | 'number' | 'date' | 'boolean' | 'dropdown';
  visible: boolean;
}

interface FieldTemplateDropdownProps {
  disabled?: boolean;
  loading?: boolean;
  onApplyTemplate: (template: FieldTemplate) => void;
  templates: FieldTemplate[];
}

const FieldTemplateDropdown: React.FC<FieldTemplateDropdownProps> = ({
  templates,
  onApplyTemplate,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  const hasPermission = canAccess('programme.edit');
  const isDisabled = disabled || !hasPermission || loading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyTemplate = (template: FieldTemplate) => {
    const confirmed = window.confirm(
      `Apply template "${template.name}"? This will add ${template.fields.length} custom fields to your project.`
    );
    
    if (confirmed) {
      onApplyTemplate(template);
      setIsOpen(false);
    }
  };

  const handleButtonClick = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12 
          border border-gray-300 bg-white hover:bg-gray-50 
          transition-colors duration-200 rounded
          ${isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-gray-400'
          }
          ${isOpen ? 'bg-blue-50 border-blue-400' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Apply predefined field structure"
      >
        <DocumentTextIcon className={`w-5 h-5 ${isOpen ? 'text-blue-600' : 'text-gray-700'}`} />
        <span className={`text-xs font-medium mt-1 ${isOpen ? 'text-blue-600' : 'text-gray-600'}`}>
          Templates
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Field Templates</h3>
            <p className="text-xs text-gray-500 mt-1">
              Apply predefined sets of custom fields
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <div key={template.id} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {template.name}
                      </h4>
                      {template.demo && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <div>Fields: {template.fields.length}</div>
                      <div className="mt-1">
                        {template.fields.slice(0, 3).map(field => (
                          <span key={field.id} className="inline-block px-2 py-1 mr-1 mb-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {field.label} ({getFieldTypeLabel(field.type)})
                          </span>
                        ))}
                        {template.fields.length > 3 && (
                          <span className="text-gray-500">+{template.fields.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyTemplate(template)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ml-3"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No templates available</p>
              <p className="text-xs">Create templates in the Manage Fields dialog</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldTemplateDropdown; 