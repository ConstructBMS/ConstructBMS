import React from 'react';
import ConflictButton from './ConflictButton';

interface ResourceConflictsSectionProps {
  conflictsActive: boolean;
  disabled?: boolean;
  loading?: {
    resolve?: boolean;
    toggle?: boolean;
  };
  onResolveConflicts: () => void;
  onToggleConflicts: () => void;
}

const ResourceConflictsSection: React.FC<ResourceConflictsSectionProps> = ({
  onToggleConflicts,
  onResolveConflicts,
  conflictsActive,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ConflictButton
          type="toggle"
          isActive={conflictsActive}
          onClick={onToggleConflicts}
          disabled={disabled}
          loading={loading.toggle || false}
        />
        <ConflictButton
          type="resolve"
          onClick={onResolveConflicts}
          disabled={disabled || !conflictsActive}
          loading={loading.resolve || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Resource Conflicts
      </div>
    </section>
  );
};

export default ResourceConflictsSection; 