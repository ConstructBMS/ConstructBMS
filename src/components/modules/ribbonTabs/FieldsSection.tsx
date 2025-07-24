import React from 'react';
import FieldsDropdown from './FieldsDropdown';
import type { FieldConfig } from './FieldsDropdown';

interface FieldsSectionProps {
  fields: FieldConfig[];
  onToggleField: (fieldId: string) => void;
  disabled?: boolean;
}

const FieldsSection: React.FC<FieldsSectionProps> = ({
  fields,
  onToggleField,
  disabled = false
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons">
        <FieldsDropdown
          fields={fields}
          onToggleField={onToggleField}
          disabled={disabled}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Fields
      </div>
    </section>
  );
};

export default FieldsSection; 