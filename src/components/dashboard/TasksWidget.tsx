import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Plus } from 'lucide-react';
import { dataSourceService } from '../../services/dataSourceService';
import { activityStreamService } from '../../services/activityStream';

interface TaskDisplay {
  assignee: string;
  completed: boolean;
  dueDate: string;
  id: number;
  priority: 'low' | 'medium' | 'high';
  project: string;
  status: string;
  title: string;
}

interface TasksWidgetProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-400';
    case 'medium':
      return 'bg-yellow-400';
    case 'low':
      return 'bg-green-400';
    default:
      return 'bg-gray-300';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-700';
    case 'Blocked':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

const TasksWidget: React.FC<TasksWidgetProps> = ({ onNavigateToModule }) => {
  const [tasks, setTasks] = useState<TaskDisplay[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const loadTasks = async () => {
    try {
      const allTasks = await dataSourceService.getTasks();
      const displayTasks = allTasks
        .slice(0, 6) // Show only first 6 tasks
        .map((task: any) => ({
          id: task.id,
          title: task.title,
          project: task.project,
          assignee: task.assignee,
          priority: task.priority,
          dueDate: task.dueDate,
          completed: task.status === 'completed',
          status: task.status,
        }));

      setTasks(displayTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const toggleTask = async (taskId: number) => {
    try {
      // Update the task in the data source service
      const allTasks = await dataSourceService.getTasks();
      const task = allTasks.find((t: any) => t.id === taskId);
      const updatedTasks = allTasks.map((task: any) =>
        task.id === taskId
          ? {
              ...task,
              status:
                task.status === 'completed'
                  ? ('pending' as const)
                  : ('completed' as const),
            }
          : task
      );

      await dataSourceService.saveTasks(updatedTasks);

      // Log activity if task was completed
      if (task && task.status !== 'completed') {
        await activityStreamService.addActivity({
          type: 'task',
          category: 'completed',
          title: 'Task Completed',
          description: `Task "${task.title}" has been completed`,
          entityId: task.id.toString(),
          entityName: task.title,
          userId: '1',
          userName: 'Tom ConstructBMS',
          priority: 'medium',
          actionable: true,
          actionUrl: `/tasks/${task.id}`,
          icon: 'CheckCircle',
          color: 'green',
          read: false,
        });
      }

      loadTasks(); // Reload tasks to reflect changes
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const addNewTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        const allTasks = await dataSourceService.getTasks();
        const newTask = {
          id: Date.now(),
          title: newTaskTitle,
          description: '',
          project: 'New Project',
          projectId: 1,
          assignee: 'Unassigned',
          priority: 'medium' as const,
          status: 'pending' as const,
          dueDate: new Date().toISOString().split('T')[0],
          tags: [],
          estimatedHours: 0,
          actualHours: 0,
          isDemoData: true,
          createdAt: new Date().toISOString(),
          demoId: `demo-task-${Date.now()}`,
        };

        const updatedTasks = [...allTasks, newTask];
        await dataSourceService.saveTasks(updatedTasks);

        // Log activity for new task
        await activityStreamService.addActivity({
          type: 'task',
          category: 'created',
          title: 'New Task Created',
          description: `Task "${newTaskTitle}" has been created`,
          entityId: newTask.id.toString(),
          entityName: newTaskTitle,
          userId: '1',
          userName: 'Tom ConstructBMS',
          priority: 'medium',
          actionable: true,
          actionUrl: `/tasks/${newTask.id}`,
          icon: 'CheckSquare',
          color: 'blue',
          read: false,
        });

        loadTasks(); // Reload tasks to reflect changes

        setNewTaskTitle('');
        setShowAddTask(false);
      } catch (error) {
        console.error('Error adding new task:', error);
      }
    }
  };

  const handleViewAllTasks = () => {
    if (onNavigateToModule) {
      onNavigateToModule('tasks');
    } else {
      // Fallback for when navigation is not available
      alert('Navigating to Tasks module...');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
    }
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 space-y-3'>
        {tasks.slice(0, 5).map((task, index) => (
          <div
            key={index}
            className='flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            onClick={() => {
              onNavigateToModule?.('tasks', { openTask: { id: task.id, title: task.title, status: task.status, priority: task.priority, assignee: task.assignee, dueDate: task.dueDate } });
            }}
          >
            <div
              className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`}
            />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                {task.title}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Due {task.dueDate}
              </p>
            </div>
            <div className='flex items-center space-x-2 flex-shrink-0'>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}
              >
                {task.status}
              </span>
              {task.assignee && (
                <div className='w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-medium'>
                  {task.assignee.charAt(0)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksWidget;
