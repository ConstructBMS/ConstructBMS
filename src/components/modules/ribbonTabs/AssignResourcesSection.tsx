import React from 'react';
import ResourceButton from './ResourceButton';
import QuickAssignDropdown from './QuickAssignDropdown';

interface QuickAssignResource {
  id: string;
  name: string;
  type: 'labour' | 'material' | 'cost';
  defaultQuantity: number;
  defaultUnit: string;
  defaultRate: number;
  frequency: number;
}

interface AssignResourcesSectionProps {
  onAssignResource: () => void;
  onUnassignResource: () => void;
  onQuickAssign: (resource: QuickAssignResource) => void;
  disabled?: boolean;
  loading?: {
    assign?: boolean;
    unassign?: boolean;
    quickAssign?: boolean;
  };
}

const AssignResourcesSection: React.FC<AssignResourcesSectionProps> = ({
  onAssignResource,
  onUnassignResource,
  onQuickAssign,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ResourceButton
          type="assign"
          onClick={onAssignResource}
          disabled={disabled}
          loading={loading.assign || false}
        />
        <ResourceButton
          type="unassign"
          onClick={onUnassignResource}
          disabled={disabled}
          loading={loading.unassign || false}
        />
        <QuickAssignDropdown
          onQuickAssign={onQuickAssign}
          disabled={disabled}
          loading={loading.quickAssign || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Assign Resources
      </div>
    </section>
  );
};

export default AssignResourcesSection; 