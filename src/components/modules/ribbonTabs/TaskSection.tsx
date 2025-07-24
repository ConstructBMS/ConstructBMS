import React from 'react';
import TaskButton from './TaskButton';

interface TaskSectionProps {
  selectedTasksCount: number;
  onNewTask: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onProperties: () => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  selectedTasksCount,
  onNewTask,
  onDelete,
  onEdit,
  onProperties
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <TaskButton 
          type="new" 
          onClick={onNewTask}
        />
        <TaskButton 
          type="delete" 
          onClick={onDelete}
          selectedTasksCount={selectedTasksCount}
        />
        <TaskButton 
          type="edit" 
          onClick={onEdit}
          selectedTasksCount={selectedTasksCount}
        />
        <TaskButton 
          type="properties" 
          onClick={onProperties}
          selectedTasksCount={selectedTasksCount}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Task
      </div>
    </section>
  );
};

export default TaskSection; 