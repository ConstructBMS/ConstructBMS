import React from 'react';
import BaselineRibbonControls from './BaselineRibbonControls';
import { type Baseline } from '../../../services/baselineService';

interface BaselinesSectionProps {
  projectId: string;
  showBaseline: boolean;
  onShowBaselineChange: (show: boolean) => void;
  onBaselineSelect: (baseline: Baseline | null) => void;
  onOpenBaselineManager: () => void;
  currentTasks: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    percentComplete?: number;
    isMilestone?: boolean;
    parentId?: string;
  }>;
  disabled?: boolean;
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