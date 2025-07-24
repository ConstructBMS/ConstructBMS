import React from 'react';
import ToolsButton from './ToolsButton';
import UndoRedoGroup from './UndoRedoGroup';

interface ToolsSectionProps {
  canRedo?: boolean;
  canUndo?: boolean;
  isProgressLineVisible?: boolean;
  isRescheduling?: boolean;
  onProgressToggle: () => void;
  onRedo: () => void;
  onReschedule: () => void;
  onUndo: () => void;
  projectId?: string;
}

const ToolsSection: React.FC<ToolsSectionProps> = ({
  onReschedule,
  onProgressToggle,
  onUndo,
  onRedo,
  isProgressLineVisible = false,
  canUndo = false,
  canRedo = false,
  isRescheduling = false,
  projectId = 'default'
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ToolsButton 
          type="reschedule" 
          onClick={onReschedule}
          disabled={isRescheduling}
        />
        <ToolsButton 
          type="progress" 
          onClick={onProgressToggle}
          isActive={isProgressLineVisible}
        />
        <UndoRedoGroup
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          projectId={projectId}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Tools
      </div>
    </section>
  );
};

export default ToolsSection; 