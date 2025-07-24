import React from 'react';
import ProjectInfoButton from './ProjectInfoButton';
import ProjectStatusDropdown from './ProjectStatusDropdown';
import type { ProjectStatus } from './ProjectStatusDropdown';

interface InformationSectionProps {
  currentStatus: ProjectStatus;
  onProjectDetails: () => void;
  onProjectNotes: () => void;
  onStatusChange: (status: ProjectStatus) => void;
  disabled?: boolean;
  loading?: {
    details?: boolean;
    notes?: boolean;
    status?: boolean;
  };
}

const InformationSection: React.FC<InformationSectionProps> = ({
  currentStatus,
  onProjectDetails,
  onProjectNotes,
  onStatusChange,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ProjectInfoButton
          type="details"
          onClick={onProjectDetails}
          disabled={disabled}
          loading={loading.details || false}
        />
        <ProjectInfoButton
          type="notes"
          onClick={onProjectNotes}
          disabled={disabled}
          loading={loading.notes || false}
        />
        <ProjectStatusDropdown
          currentStatus={currentStatus}
          onStatusChange={onStatusChange}
          disabled={disabled}
          loading={loading.status || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Information
      </div>
    </section>
  );
};

export default InformationSection; 