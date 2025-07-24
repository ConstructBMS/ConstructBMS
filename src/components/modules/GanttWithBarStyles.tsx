import React, { useState } from 'react';
import { PaintBrushIcon } from '@heroicons/react/24/outline';
import GanttCanvas, { GanttTask, GanttLink } from './GanttCanvas';
import BarStylesManagerModal from './BarStylesManagerModal';
import { useBarStyles } from '../../hooks/useBarStyles';

interface GanttWithBarStylesProps {
  tasks: GanttTask[];
  links: GanttLink[];
  projectId: string;
  userRole: string;
  startDate: Date;
  endDate: Date;
  zoomLevel?: number;
  showGridlines?: boolean;
  showTaskLinks?: boolean;
  showFloat?: boolean;
  showCriticalPath?: boolean;
  criticalOnly?: boolean;
  onTaskSelect?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  selectedTaskId?: string;
}

const GanttWithBarStyles: React.FC<GanttWithBarStylesProps> = ({
  tasks,
  links,
  projectId,
  userRole,
  startDate,
  endDate,
  zoomLevel = 7,
  showGridlines = true,
  showTaskLinks = true,
  showFloat = false,
  showCriticalPath = true,
  criticalOnly = false,
  onTaskSelect,
  onTaskUpdate,
  selectedTaskId
}) => {
  const [showBarStylesModal, setShowBarStylesModal] = useState(false);
  
  const { refreshRules } = useBarStyles({ 
    projectId, 
    enabled: true 
  });

  const handleStylesUpdated = () => {
    refreshRules();
  };

  const canManageBarStyles = userRole !== 'viewer';

  return (
    <div className="relative">
      {/* Bar Styles Toolbar */}
      {canManageBarStyles && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowBarStylesModal(true)}
            className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Manage Bar Styles"
          >
            <PaintBrushIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bar Styles
            </span>
          </button>
        </div>
      )}

      {/* Gantt Canvas */}
      <GanttCanvas
        tasks={tasks}
        links={links}
        startDate={startDate}
        endDate={endDate}
        zoomLevel={zoomLevel}
        showGridlines={showGridlines}
        showTaskLinks={showTaskLinks}
        showFloat={showFloat}
        showCriticalPath={showCriticalPath}
        criticalOnly={criticalOnly}
        onTaskSelect={onTaskSelect}
        onTaskUpdate={onTaskUpdate}
        selectedTaskId={selectedTaskId}
        userRole={userRole}
        projectId={projectId}
      />

      {/* Bar Styles Manager Modal */}
      <BarStylesManagerModal
        isOpen={showBarStylesModal}
        onClose={() => setShowBarStylesModal(false)}
        projectId={projectId}
        onStylesUpdated={handleStylesUpdated}
      />
    </div>
  );
};

export default GanttWithBarStyles; 