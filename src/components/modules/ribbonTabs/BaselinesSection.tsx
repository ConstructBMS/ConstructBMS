import React from 'react';
import BaselineRibbonControls from './BaselineRibbonControls';
import { type Baseline } from '../../../services/baselineService';

interface BaselinesSectionProps {
  currentTasks: Array<{
    endDate: Date;
    id: string;
    isMilestone?: boolean;
    name: string;
    parentId?: string;
    percentComplete?: number;
    startDate: Date;
  }>;
  disabled?: boolean;
  onBaselineSelect: (baseline: Baseline | null) => void;
  onOpenBaselineManager: () => void;
  onShowBaselineChange: (show: boolean) => void;
  projectId: string;
  showBaseline: boolean;
}

const BaselinesSection: React.FC<BaselinesSectionProps> = ({
  projectId,
  showBaseline,
  onShowBaselineChange,
  onBaselineSelect,
  onOpenBaselineManager,
  currentTasks,
  disabled = false
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons">
        <BaselineRibbonControls
          projectId={projectId}
          showBaseline={showBaseline}
          onShowBaselineChange={onShowBaselineChange}
          onBaselineSelect={onBaselineSelect}
          onOpenBaselineManager={onOpenBaselineManager}
          currentTasks={currentTasks}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Baselines
      </div>
    </section>
  );
};

export default BaselinesSection; 