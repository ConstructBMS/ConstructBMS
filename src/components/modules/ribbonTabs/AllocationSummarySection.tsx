import React from 'react';
import SummaryButton from './SummaryButton';
import ExportSummaryDropdown from './ExportSummaryDropdown';

interface AllocationSummarySectionProps {
  disabled?: boolean;
  loading?: {
    export?: boolean;
    resource?: boolean;
    task?: boolean;
  };
  onExportSummary: (format: 'csv' | 'xlsx' | 'pdf') => void;
  onViewResourceSummary: () => void;
  onViewTaskSummary: () => void;
}

const AllocationSummarySection: React.FC<AllocationSummarySectionProps> = ({
  onViewTaskSummary,
  onViewResourceSummary,
  onExportSummary,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <SummaryButton
          type="task"
          onClick={onViewTaskSummary}
          disabled={disabled}
          loading={loading.task || false}
        />
        <SummaryButton
          type="resource"
          onClick={onViewResourceSummary}
          disabled={disabled}
          loading={loading.resource || false}
        />
        <ExportSummaryDropdown
          onExport={onExportSummary}
          disabled={disabled}
          loading={loading.export || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Allocation Summary
      </div>
    </section>
  );
};

export default AllocationSummarySection; 