import React from 'react';
import PropertiesButton from './PropertiesButton';
import FieldTemplateDropdown from './FieldTemplateDropdown';
import type { FieldTemplate } from './FieldTemplateDropdown';

interface PropertiesSectionProps {
  onManageFields: () => void;
  onEditValues: () => void;
  onApplyTemplate: (template: FieldTemplate) => void;
  templates: FieldTemplate[];
  disabled?: boolean;
  loading?: {
    manage?: boolean;
    edit?: boolean;
    templates?: boolean;
  };
  hasSelectedTasks?: boolean;
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