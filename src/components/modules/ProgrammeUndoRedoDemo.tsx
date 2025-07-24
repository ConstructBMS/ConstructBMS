import React, { useState, useEffect } from 'react';
import { 
  ArrowUturnLeftIcon, 
  ArrowUturnRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ProgrammeUndoRedoProvider, useProgrammeUndoRedo } from '../../contexts/ProgrammeUndoRedoContext';
import { demoModeService } from '../../services/demoModeService';
import { usePermissions } from '../../hooks/usePermissions';

interface DemoTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

const UndoRedoDemoContent: React.FC = () => {
  const { canAccess } = usePermissions();
  const { 
    canUndo, 
    canRedo, 
    undoCount, 
    redoCount, 
    isDemoMode, 
    addAction, 
    undo, 
    redo 
  } = useProgrammeUndoRedo();
  
  const [tasks, setTasks] = useState<DemoTask[]>([
    {
      id: 'task-1',
      name: 'Site Preparation',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      duration: 5,
      progress: 0,
      status: 'not-started'
    },
    {
      id: 'task-2',
      name: 'Foundation Work',
      startDate: new Date('2024-01-06'),
      endDate: new Date('2024-01-15'),
      duration: 10,
      progress: 25,
      status: 'in-progress'
    },
    {
      id: 'task-3',
      name: 'Structural Framework',
      startDate: new Date('2024-01-16'),
      endDate: new Date('2024-02-05'),
      duration: 20,
      progress: 0,
      status: 'not-started'
    }
  ]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasPermission = canAccess('programme.edit.undo-redo');

  // Demo actions
  const addNewTask = async () => {
    if (!hasPermission) return;

    const newTask: DemoTask = {
      id: `task-${Date.now()}`,
      name: `New Task ${tasks.length + 1}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 7,
      progress: 0,
      status: 'not-started'
    };

    const beforeState = [...tasks];
    const afterState = [...tasks, newTask];

    const result = await addAction({
      actionType: 'task_create',
      projectId: 'demo-project',
      beforeState,
      afterState,
      taskId: newTask.id,
      description: `Create task "${newTask.name}"`
    });

    if (result.success) {
      setTasks(afterState);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!hasPermission) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const beforeState = [...tasks];
    const afterState = tasks.filter(t => t.id !== taskId);

    const result = await addAction({
      actionType: 'task_delete',
      projectId: 'demo-project',
      beforeState,
      afterState,
      taskId,
      description: `Delete task "${task.name}"`
    });

    if (result.success) {
      setTasks(afterState);
    }
  };

  const updateTaskProgress = async (taskId: string, progress: number) => {
    if (!hasPermission) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const beforeState = [...tasks];
    const afterState = tasks.map(t => 
      t.id === taskId ? { ...t, progress } : t
    );

    const result = await addAction({
      actionType: 'task_update',
      projectId: 'demo-project',
      beforeState,
      afterState,
      taskId,
      description: `Update progress for "${task.name}" to ${progress}%`
    });

    if (result.success) {
      setTasks(afterState);
    }
  };

  const moveTask = async (taskId: string, newStartDate: Date) => {
    if (!hasPermission) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newEndDate = new Date(newStartDate.getTime() + task.duration * 24 * 60 * 60 * 1000);
    
    const beforeState = [...tasks];
    const afterState = tasks.map(t => 
      t.id === taskId ? { ...t, startDate: newStartDate, endDate: newEndDate } : t
    );

    const result = await addAction({
      actionType: 'bar_move',
      projectId: 'demo-project',
      beforeState,
      afterState,
      taskId,
      description: `Move task "${task.name}" to ${newStartDate.toLocaleDateString()}`
    });

    if (result.success) {
      setTasks(afterState);
    }
  };

  const handleUndo = async () => {
    if (!hasPermission || !canUndo || loading) return;
    
    setLoading(true);
    try {
      const result = await undo();
      if (result.success && result.action) {
        // Update tasks based on the undone action
        if (result.action.beforeState) {
          setTasks(result.action.beforeState);
        }
        console.log(`Undone: ${result.action.description}`);
      }
    } catch (error) {
      console.error('Error undoing action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedo = async () => {
    if (!hasPermission || !canRedo || loading || isDemoMode) return;
    
    setLoading(true);
    try {
      const result = await redo();
      if (result.success && result.action) {
        // Update tasks based on the redone action
        if (result.action.afterState) {
          setTasks(result.action.afterState);
        }
        console.log(`Redone: ${result.action.description}`);
      }
    } catch (error) {
      console.error('Error redoing action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Undo/Redo Timeline Changes Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the undo/redo functionality with timeline changes. Make changes to tasks and use Ctrl+Z/Ctrl+Y or the buttons below.
        </p>
      </div>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 rounded-md">
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
            <span className="text-orange-800 dark:text-orange-200 font-medium">
              Demo Mode: Limited to 3 undo steps, redo disabled
            </span>
          </div>
        </div>
      )}

      {/* Undo/Redo Controls */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUndo}
              disabled={!hasPermission || !canUndo || loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                !hasPermission || !canUndo || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={canUndo ? `Undo last action (${undoCount} available)` : 'No actions to undo'}
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              <span>Undo</span>
              {undoCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-700 text-white text-xs rounded-full">
                  {undoCount}
                </span>
              )}
            </button>

            <button
              onClick={handleRedo}
              disabled={!hasPermission || !canRedo || loading || isDemoMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                !hasPermission || !canRedo || loading || isDemoMode
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={canRedo ? `Redo last undone action (${redoCount} available)` : 'No actions to redo'}
            >
              <ArrowUturnRightIcon className="w-4 h-4" />
              <span>Redo</span>
              {redoCount > 0 && !isDemoMode && (
                <span className="px-2 py-0.5 bg-green-700 text-white text-xs rounded-full">
                  {redoCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Keyboard Shortcuts:</span> Ctrl+Z (Undo), Ctrl+Y (Redo)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={addNewTask}
          disabled={!hasPermission}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Task</span>
        </button>

        <button
          onClick={() => updateTaskProgress('task-2', 50)}
          disabled={!hasPermission}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <PencilIcon className="w-4 h-4" />
          <span>Update Progress</span>
        </button>

        <button
          onClick={() => moveTask('task-3', new Date('2024-01-20'))}
          disabled={!hasPermission}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Move Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Timeline Tasks
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                selectedTaskId === task.id ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
              onClick={() => setSelectedTaskId(task.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.name}
                  </h3>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                    </span>
                    <span>{task.duration} days</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  disabled={!hasPermission}
                  className="ml-4 p-1 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  title="Delete task"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          How to test:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click "Add Task" to create a new task</li>
          <li>• Click "Update Progress" to change task progress</li>
          <li>• Click "Move Task" to change task dates</li>
          <li>• Use Undo/Redo buttons or Ctrl+Z/Ctrl+Y to reverse changes</li>
          <li>• In demo mode, you're limited to 3 undo steps and redo is disabled</li>
        </ul>
      </div>
    </div>
  );
};

const ProgrammeUndoRedoDemo: React.FC = () => {
  return (
    <ProgrammeUndoRedoProvider projectId="demo-project">
      <UndoRedoDemoContent />
    </ProgrammeUndoRedoProvider>
  );
};

export default ProgrammeUndoRedoDemo; 