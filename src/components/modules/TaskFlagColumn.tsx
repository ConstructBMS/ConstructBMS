import React from 'react';
import TaskFlagIndicator from './TaskFlagIndicator';

interface TaskFlagColumnProps {
  taskId: string;
  projectId: string;
  isDemoMode: boolean;
}

const TaskFlagColumn: React.FC<TaskFlagColumnProps> = ({
  taskId,
  projectId,
  isDemoMode
}) => {
  return (
    <div className="flex items-center justify-center">
      <TaskFlagIndicator
        taskId={taskId}
        projectId={projectId}
        isDemoMode={isDemoMode}
        showTooltip={true}
        size="sm"
        className="cursor-pointer"
      />
    </div>
  );
};

export default TaskFlagColumn; 