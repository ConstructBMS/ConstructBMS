import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import ColorLegend from './ColorLegend';
import { TaskStatus, TaskTag } from '../services/taskBarColorService';

interface ColorLegendButtonProps {
  taskStatuses: TaskStatus[];
  taskTags: TaskTag[];
}

const ColorLegendButton: React.FC<ColorLegendButtonProps> = ({
  taskStatuses,
  taskTags
}) => {
  const { canAccess } = usePermissions();
  const [showLegend, setShowLegend] = useState(false);

  const canView = canAccess('programme.task.view');

  const handleShowLegend = () => {
    setShowLegend(true);
  };

  const handleCloseLegend = () => {
    setShowLegend(false);
  };

  if (!canView) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleShowLegend}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-md transition-colors duration-200"
        title="View task bar color legend and rules"
      >
        <InformationCircleIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Legend</span>
      </button>

      <ColorLegend
        isOpen={showLegend}
        onClose={handleCloseLegend}
        taskStatuses={taskStatuses}
        taskTags={taskTags}
      />
    </>
  );
};

export default ColorLegendButton; 