import React, { useState, useEffect } from 'react';
import { PlusIcon, FolderIcon, DocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import HierarchicalTaskTable from './HierarchicalTaskTable';
import TaskModal from './TaskModal';
import { taskService, type Task } from '../../services/taskService';
import { demoModeService } from '../../services/demoModeService';
import { usePermissions } from '../../hooks/usePermissions';

const TaskHierarchyDemo: React.FC = () => {
  const { canAccess } = usePermissions();
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [projectId] = useState('hierarchy-demo-project');

  const canCreateTasks = canAccess('programme.task.create');
  const canEditTasks = canAccess('programme.task.edit');

  useEffect(() => {
    checkDemoMode();
    initializeDemoData();
  }, []);

  const checkDemoMode = async () => {
    const demoMode = await demoModeService.isDemoMode();
    setIsDemoMode(demoMode);
  };

  const initializeDemoData = async () => {
    try {
      const existingTasks = await taskService.getProjectTasks(projectId);
      
      // Only create demo data if no tasks exist
      if (existingTasks.length === 0) {
        await createDemoHierarchy();
      }
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  };

  const createDemoHierarchy = async () => {
    try {
      // Create parent phase
      const phaseResult = await taskService.createTask({
        name: 'Project Planning Phase',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        statusId: 'in-progress',
        tags: [],
        type: 'phase',
        description: 'Initial project planning and setup',
        projectId,
        parentId: null,
        collapsed: false,
        groupColor: '#3B82F6',
        demo: true
      });

      if (phaseResult.success && phaseResult.task) {
        const phaseId = phaseResult.task.id;

        // Create child tasks
        const childTasks = [
          {
            name: 'Requirements Analysis',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-15'),
            statusId: 'completed',
            type: 'task' as const,
            description: 'Analyze project requirements'
          },
          {
            name: 'System Design',
            startDate: new Date('2024-01-16'),
            endDate: new Date('2024-01-31'),
            statusId: 'in-progress',
            type: 'task' as const,
            description: 'Design system architecture'
          },
          {
            name: 'Design Review',
            startDate: new Date('2024-01-25'),
            endDate: new Date('2024-01-25'),
            statusId: 'not-started',
            type: 'milestone' as const,
            description: 'Review system design'
          }
        ];

        for (const childTask of childTasks) {
          await taskService.createTask({
            ...childTask,
            tags: [],
            projectId,
            parentId: phaseId,
            collapsed: false,
            groupColor: null,
            demo: true
          });
        }

        // Create another phase
        const phase2Result = await taskService.createTask({
          name: 'Development Phase',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-03-31'),
          statusId: 'not-started',
          tags: [],
          type: 'phase',
          description: 'Software development phase',
          projectId,
          parentId: null,
          collapsed: false,
          groupColor: '#10B981',
          demo: true
        });

        if (phase2Result.success && phase2Result.task) {
          const phase2Id = phase2Result.task.id;

          // Create child tasks for second phase
          const phase2ChildTasks = [
            {
              name: 'Frontend Development',
              startDate: new Date('2024-02-01'),
              endDate: new Date('2024-02-28'),
              statusId: 'not-started',
              type: 'task' as const,
              description: 'Develop frontend components'
            },
            {
              name: 'Backend Development',
              startDate: new Date('2024-02-15'),
              endDate: new Date('2024-03-15'),
              statusId: 'not-started',
              type: 'task' as const,
              description: 'Develop backend services'
            }
          ];

          for (const childTask of phase2ChildTasks) {
            await taskService.createTask({
              ...childTask,
              tags: [],
              projectId,
              parentId: phase2Id,
              collapsed: false,
              groupColor: null,
              demo: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error creating demo hierarchy:', error);
    }
  };

  const handleCreateTask = () => {
    setModalMode('create');
    setSelectedTaskId(undefined);
    setShowTaskModal(true);
  };

  const handleEditTask = (taskId: string) => {
    setModalMode('edit');
    setSelectedTaskId(taskId);
    setShowTaskModal(true);
  };

  const handleTaskSaved = (task: Task) => {
    setShowTaskModal(false);
    // Refresh the table
    window.location.reload();
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Task Hierarchy Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Demonstrate parent-child task relationships with collapsible sections
              </p>
            </div>
            <div className="flex space-x-3">
              {canCreateTasks && (
                <button
                  onClick={handleCreateTask}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              )}
            </div>
          </div>

          {/* Demo Mode Indicator */}
          {isDemoMode && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Demo Mode Active - Task nesting limited to 1 level, group bars in grey only
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
            How to Use Task Hierarchy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-1">Expand/Collapse</h4>
              <ul className="space-y-1">
                <li>• Click ▶️/🔽 to expand or collapse parent tasks</li>
                <li>• Child tasks are indented and grouped under parents</li>
                <li>• Collapsed parents hide all child tasks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Task Types</h4>
              <ul className="space-y-1">
                <li>• 📁 Phase: Group container for related tasks</li>
                <li>• 📄 Task: Regular work items</li>
                <li>• 🎯 Milestone: Zero-duration key dates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hierarchy Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <HierarchicalTaskTable
            projectId={projectId}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={handleEditTask}
            selectedTaskId={selectedTaskId}
            userRole="project_manager"
          />
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            taskId={selectedTaskId || null}
            projectId={projectId}
            mode={modalMode}
            onTaskSaved={handleTaskSaved}
          />
        )}
      </div>
    </div>
  );
};

export default TaskHierarchyDemo; 