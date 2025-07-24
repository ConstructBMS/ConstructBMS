import React from 'react';
import TaskFlagIndicator from './TaskFlagIndicator';

interface TimelineTaskFlagProps {
  isDemoMode: boolean;
  projectId: string;
  taskBarLeft: number;
  taskBarTop: number;
  taskBarWidth: number;
  taskId: string;
}

const TimelineTaskFlag: React.FC<TimelineTaskFlagProps> = ({
  taskId,
  projectId,
  isDemoMode,
  taskBarTop,
  taskBarLeft,
  taskBarWidth
}) => {
  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        top: taskBarTop - 8, // Position above the task bar
        left: taskBarLeft + taskBarWidth / 2 - 6, // Center on the task bar
        zIndex: 10
      }}
    >
      <TaskFlagIndicator
        taskId={taskId}
        projectId={projectId}
        isDemoMode={isDemoMode}
        showTooltip={true}
        size="sm"
        className="cursor-pointer hover:scale-110 transition-transform"
      />
    </div>
  );
};

export default TimelineTaskFlag; 