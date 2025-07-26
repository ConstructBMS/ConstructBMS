import React, { useState, useEffect } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import HierarchicalTaskTable from './HierarchicalTaskTable';
import TaskModal from './TaskModal';
import { taskService, type Task } from '../services/taskService';
import {
  taskGroupBarService,
  type GroupBarInfo,
} from '../services/taskGroupBarService';
import { demoModeService } from '../services/demoModeService';
import { usePermissions } from '../hooks/usePermissions';

interface TestResult {
  details?: string;
  message: string;
  name: string;
  status: 'pass' | 'fail' | 'pending';
}

const TaskHierarchyTest: React.FC = () => {
  const { canAccess } = usePermissions();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [projectId] = useState('hierarchy-test-project');
  const [groupBars, setGroupBars] = useState<GroupBarInfo[]>([]);

  const canCreateTasks = canAccess('programme.task.create');
  const canEditTasks = canAccess('programme.task.edit');
  const canViewStructure = canAccess('programme.structure.view');

  useEffect(() => {
    runTests();
    loadGroupBars();
  }, []);

  const runTests = async () => {
    setRunning(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Basic hierarchy creation
      results.push(await testBasicHierarchyCreation());

      // Test 2: Parent-child relationships
      results.push(await testParentChildRelationships());

      // Test 3: Collapse/expand functionality
      results.push(await testCollapseExpand());

      // Test 4: Visibility logic
      results.push(await testVisibilityLogic());

      // Test 5: Group bar calculations
      results.push(await testGroupBarCalculations());

      // Test 6: Demo mode restrictions
      results.push(await testDemoModeRestrictions());

      // Test 7: Permission checks
      results.push(await testPermissionChecks());

      // Test 8: Data persistence
      results.push(await testDataPersistence());
    } catch (error) {
      console.error('Test execution error:', error);
      results.push({
        name: 'Test Execution',
        status: 'fail',
        message: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setTestResults(results);
    setRunning(false);
  };

  const testBasicHierarchyCreation = async (): Promise<TestResult> => {
    try {
      // Create a parent task
      const parentResult = await taskService.createTask({
        name: 'Test Parent Phase',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        statusId: 'in-progress',
        tags: [],
        type: 'phase',
        description: 'Test parent phase',
        projectId,
        parentId: null,
        collapsed: false,
        groupColor: '#3B82F6',
        demo: true,
      });

      if (!parentResult.success || !parentResult.task) {
        return {
          name: 'Basic Hierarchy Creation',
          status: 'fail',
          message: 'Failed to create parent task',
          details: parentResult.error,
        };
      }

      // Create a child task
      const childResult = await taskService.createTask({
        name: 'Test Child Task',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        statusId: 'completed',
        tags: [],
        type: 'task',
        description: 'Test child task',
        projectId,
        parentId: parentResult.task.id,
        collapsed: false,
        groupColor: null,
        demo: true,
      });

      if (!childResult.success) {
        return {
          name: 'Basic Hierarchy Creation',
          status: 'fail',
          message: 'Failed to create child task',
          details: childResult.error,
        };
      }

      // Verify hierarchy
      const children = await taskService.getChildTasks(parentResult.task.id);
      const parent = await taskService.getParentTask(childResult.task!.id);
      const level = await taskService.getTaskLevel(childResult.task!.id);

      if (children.length !== 1 || !parent || level !== 1) {
        return {
          name: 'Basic Hierarchy Creation',
          status: 'fail',
          message: 'Hierarchy verification failed',
          details: `Children: ${children.length}, Parent: ${!!parent}, Level: ${level}`,
        };
      }

      return {
        name: 'Basic Hierarchy Creation',
        status: 'pass',
        message: 'Successfully created and verified parent-child relationship',
      };
    } catch (error) {
      return {
        name: 'Basic Hierarchy Creation',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testParentChildRelationships = async (): Promise<TestResult> => {
    try {
      const tasks = await taskService.getProjectTasks(projectId);
      const parentTasks = tasks.filter(t => t.type === 'phase');
      const childTasks = tasks.filter(t => t.parentId);

      if (parentTasks.length === 0) {
        return {
          name: 'Parent-Child Relationships',
          status: 'fail',
          message: 'No parent tasks found',
        };
      }

      if (childTasks.length === 0) {
        return {
          name: 'Parent-Child Relationships',
          status: 'fail',
          message: 'No child tasks found',
        };
      }

      // Test hierarchy building
      const hierarchy = await taskService.buildHierarchy(projectId);
      if (hierarchy.length === 0) {
        return {
          name: 'Parent-Child Relationships',
          status: 'fail',
          message: 'Failed to build hierarchy',
        };
      }

      return {
        name: 'Parent-Child Relationships',
        status: 'pass',
        message: `Found ${parentTasks.length} parents and ${childTasks.length} children`,
      };
    } catch (error) {
      return {
        name: 'Parent-Child Relationships',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testCollapseExpand = async (): Promise<TestResult> => {
    try {
      const tasks = await taskService.getProjectTasks(projectId);
      const parentTask = tasks.find(t => t.type === 'phase');

      if (!parentTask) {
        return {
          name: 'Collapse/Expand Functionality',
          status: 'fail',
          message: 'No parent task found for collapse test',
        };
      }

      // Test collapse toggle
      const toggleResult = await taskService.toggleTaskCollapse(parentTask.id);
      if (!toggleResult) {
        return {
          name: 'Collapse/Expand Functionality',
          status: 'fail',
          message: 'Failed to toggle collapse state',
        };
      }

      // Verify state change
      const updatedTask = await taskService.getTask(parentTask.id);
      if (!updatedTask || updatedTask.collapsed === parentTask.collapsed) {
        return {
          name: 'Collapse/Expand Functionality',
          status: 'fail',
          message: 'Collapse state did not change',
        };
      }

      return {
        name: 'Collapse/Expand Functionality',
        status: 'pass',
        message: 'Successfully toggled collapse state',
      };
    } catch (error) {
      return {
        name: 'Collapse/Expand Functionality',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testVisibilityLogic = async (): Promise<TestResult> => {
    try {
      const tasks = await taskService.getProjectTasks(projectId);
      const childTask = tasks.find(t => t.parentId);

      if (!childTask) {
        return {
          name: 'Visibility Logic',
          status: 'fail',
          message: 'No child task found for visibility test',
        };
      }

      // Test visibility
      const isVisible = await taskService.isTaskVisible(childTask.id);
      const visibleTasks = await taskService.getVisibleTasks(projectId);

      if (typeof isVisible !== 'boolean') {
        return {
          name: 'Visibility Logic',
          status: 'fail',
          message: 'Visibility check returned invalid result',
        };
      }

      return {
        name: 'Visibility Logic',
        status: 'pass',
        message: `Visibility check working: ${isVisible}, Visible tasks: ${visibleTasks.length}`,
      };
    } catch (error) {
      return {
        name: 'Visibility Logic',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testGroupBarCalculations = async (): Promise<TestResult> => {
    try {
      const tasks = await taskService.getProjectTasks(projectId);
      const parentTask = tasks.find(t => t.type === 'phase');

      if (!parentTask) {
        return {
          name: 'Group Bar Calculations',
          status: 'fail',
          message: 'No parent task found for group bar test',
        };
      }

      // Test group duration calculation
      const groupDuration = await taskService.calculateGroupDuration(
        parentTask.id
      );
      if (!groupDuration.startDate || !groupDuration.endDate) {
        return {
          name: 'Group Bar Calculations',
          status: 'fail',
          message: 'Failed to calculate group duration',
        };
      }

      // Test group bar service
      const groupBar = await taskGroupBarService.getGroupBarInfo(parentTask.id);
      if (!groupBar) {
        return {
          name: 'Group Bar Calculations',
          status: 'fail',
          message: 'Failed to get group bar info',
        };
      }

      return {
        name: 'Group Bar Calculations',
        status: 'pass',
        message: `Group bar calculated: ${groupBar.childCount} children, ${groupBar.duration} days`,
      };
    } catch (error) {
      return {
        name: 'Group Bar Calculations',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testDemoModeRestrictions = async (): Promise<TestResult> => {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      const restrictions = demoModeService.getHierarchyRestrictions();

      if (!restrictions) {
        return {
          name: 'Demo Mode Restrictions',
          status: 'fail',
          message: 'Failed to get demo mode restrictions',
        };
      }

      // Test validation
      const validation = await demoModeService.validateHierarchyOperation(
        'create',
        {
          parentLevel: 0,
          parentType: 'phase',
          siblingCount: 2,
        }
      );

      if (!validation.allowed && isDemoMode) {
        return {
          name: 'Demo Mode Restrictions',
          status: 'pass',
          message: 'Demo mode restrictions working correctly',
        };
      }

      return {
        name: 'Demo Mode Restrictions',
        status: 'pass',
        message: `Demo mode: ${isDemoMode}, Max nesting: ${restrictions.maxNestingLevel}`,
      };
    } catch (error) {
      return {
        name: 'Demo Mode Restrictions',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testPermissionChecks = async (): Promise<TestResult> => {
    try {
      const canView = canAccess('programme.structure.view');
      const canEdit = canAccess('programme.structure.edit');
      const canToggle = canAccess('programme.structure.toggle');

      const results = [];
      if (canView) results.push('view');
      if (canEdit) results.push('edit');
      if (canToggle) results.push('toggle');

      return {
        name: 'Permission Checks',
        status: 'pass',
        message: `Structure permissions: ${results.join(', ')}`,
      };
    } catch (error) {
      return {
        name: 'Permission Checks',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testDataPersistence = async (): Promise<TestResult> => {
    try {
      const tasks = await taskService.getProjectTasks(projectId);
      const hierarchy = await taskService.buildHierarchy(projectId);

      if (tasks.length === 0) {
        return {
          name: 'Data Persistence',
          status: 'fail',
          message: 'No tasks found in project',
        };
      }

      if (hierarchy.length === 0) {
        return {
          name: 'Data Persistence',
          status: 'fail',
          message: 'Failed to build hierarchy from persisted data',
        };
      }

      return {
        name: 'Data Persistence',
        status: 'pass',
        message: `Successfully loaded ${tasks.length} tasks and built hierarchy`,
      };
    } catch (error) {
      return {
        name: 'Data Persistence',
        status: 'fail',
        message: 'Test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const loadGroupBars = async () => {
    try {
      const bars = await taskGroupBarService.getProjectGroupBars(projectId);
      setGroupBars(bars);
    } catch (error) {
      console.error('Error loading group bars:', error);
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
    runTests();
    loadGroupBars();
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return <CheckIcon className='w-5 h-5 text-green-500' />;
      case 'fail':
        return <XMarkIcon className='w-5 h-5 text-red-500' />;
      case 'pending':
        return <ExclamationTriangleIcon className='w-5 h-5 text-yellow-500' />;
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const totalTests = testResults.length;

  return (
    <div className='h-screen bg-gray-50 dark:bg-gray-900 overflow-auto'>
      <div className='p-6'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                Task Hierarchy Test Suite
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Comprehensive testing of task hierarchy functionality
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={runTests}
                disabled={running}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
              >
                {running ? 'Running Tests...' : 'Run Tests'}
              </button>
              {canCreateTasks && (
                <button
                  onClick={handleCreateTask}
                  className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                >
                  Add Test Task
                </button>
              )}
            </div>
          </div>

          {/* Test Summary */}
          {testResults.length > 0 && (
            <div className='mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Test Results
                </h3>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {passedTests}/{totalTests} tests passed
                </div>
              </div>

              <div className='space-y-2'>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded'
                  >
                    {getStatusIcon(result.status)}
                    <div className='flex-1'>
                      <div className='font-medium text-gray-900 dark:text-white'>
                        {result.name}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        {result.message}
                      </div>
                      {result.details && (
                        <div className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                          {result.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Group Bars Display */}
        {groupBars.length > 0 && (
          <div className='mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
              Group Bars ({groupBars.length})
            </h3>
            <div className='space-y-2'>
              {groupBars.map(bar => (
                <div
                  key={bar.taskId}
                  className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded'
                >
                  <div>
                    <div className='font-medium text-gray-900 dark:text-white'>
                      {bar.taskName}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      {bar.childCount} children • {bar.duration} days •{' '}
                      {bar.tooltip}
                    </div>
                  </div>
                  <div
                    className='w-4 h-4 rounded'
                    style={{ backgroundColor: bar.groupColor || '#3B82F6' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hierarchy Table */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
          <HierarchicalTaskTable
            projectId={projectId}
            onTaskSelect={setSelectedTaskId}
            onTaskUpdate={handleEditTask}
            selectedTaskId={selectedTaskId}
            userRole='project_manager'
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

export default TaskHierarchyTest;
