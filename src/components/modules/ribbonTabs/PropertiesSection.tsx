import React from 'react';
import PropertiesButton from './PropertiesButton';
import FieldTemplateDropdown from './FieldTemplateDropdown';
import type { FieldTemplate } from './FieldTemplateDropdown';

interface PropertiesSectionProps {
  disabled?: boolean;
  hasSelectedTasks?: boolean;
  loading?: {
    edit?: boolean;
    manage?: boolean;
    templates?: boolean;
  };
  onApplyTemplate: (template: FieldTemplate) => void;
  onEditValues: () => void;
  onManageFields: () => void;
  templates: FieldTemplate[];
}

const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  onManageFields,
  onEditValues,
  onApplyTemplate,
  templates,
  disabled = false,
  loading = {},
  hasSelectedTasks = false
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <PropertiesButton
          type="manage"
          onClick={onManageFields}
          disabled={disabled}
          loading={loading.manage || false}
        />
        <PropertiesButton
          type="edit"
          onClick={onEditValues}
          disabled={disabled || !hasSelectedTasks}
          loading={loading.edit || false}
        />
        <FieldTemplateDropdown
          templates={templates}
          onApplyTemplate={onApplyTemplate}
          disabled={disabled}
          loading={loading.templates || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Properties
      </div>
    </section>
  );
};

export default PropertiesSection; 