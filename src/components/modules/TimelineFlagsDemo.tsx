import React, { useState, useEffect } from 'react';
import { 
  FlagIcon, 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/outline';
import { flagService, type TaskFlag } from '../../services/flagService';
import TaskFlagComponent from './TaskFlag';
import FlagEditorModal from './FlagEditorModal';
import { toastService } from './ToastNotification';

// Sample task data
const sampleTasks = [
  {
    id: '1',
    name: 'Project Planning',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    progress: 100
  },
  {
    id: '2',
    name: 'UI Design',
    status: 'in_progress',
    startDate: '2024-01-16',
    endDate: '2024-02-15',
    progress: 60
  },
  {
    id: '3',
    name: 'Backend Development',
    status: 'in_progress',
    startDate: '2024-01-20',
    endDate: '2024-03-15',
    progress: 40
  },
  {
    id: '4',
    name: 'Frontend Development',
    status: 'not_started',
    startDate: '2024-02-01',
    endDate: '2024-03-30',
    progress: 0
  },
  {
    id: '5',
    name: 'Testing Phase',
    status: 'on_hold',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    progress: 0
  },
  {
    id: '6',
    name: 'Deployment',
    status: 'not_started',
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    progress: 0
  }
];

const TimelineFlagsDemo: React.FC = () => {
  const [flags, setFlags] = useState<TaskFlag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedFlag, setSelectedFlag] = useState<TaskFlag | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(flagService.isInDemoMode());
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);

  // Load flags on mount
  useEffect(() => {
    loadFlags();
  }, []);

  // Load flags for project
  const loadFlags = async () => {
    const projectFlags = await flagService.getFlagsForProject('demo-project');
    setFlags(projectFlags);
    setIsDemoMode(flagService.isInDemoMode());
  };

  // Handle flag save
  const handleFlagSave = (flag: TaskFlag) => {
    setFlags(prev => {
      const existing = prev.find(f => f.taskId === flag.taskId);
      if (existing) {
        return prev.map(f => f.taskId === flag.taskId ? flag : f);
      } else {
        return [...prev, flag];
      }
    });
  };

  // Handle flag removal
  const handleFlagRemove = (taskId: string) => {
    setFlags(prev => prev.filter(f => f.taskId !== taskId));
  };

  // Open flag editor
  const openFlagEditor = (taskId: string, existingFlag?: TaskFlag | null) => {
    setSelectedTaskId(taskId);
    setSelectedFlag(existingFlag || null);
    setIsModalOpen(true);
  };

  // Get demo mode configuration
  const demoConfig = flagService.getDemoModeConfig();

  // Filter tasks based on flag preferences
  const filteredTasks = showOnlyFlagged 
    ? sampleTasks.filter(task => flags.some(flag => flag.taskId === task.id))
    : sampleTasks;

  // Get flag count by type
  const getFlagCountByType = (type: string) => {
    return flags.filter(flag => flag.type === type).length;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FlagIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Timeline Flags & Notes Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <ExclamationTriangleIconSolid className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>

          {/* Show Only Flagged Toggle */}
          <button
            onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showOnlyFlagged
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <FlagIcon className="w-4 h-4 mr-2" />
            {showOnlyFlagged ? 'Show All' : 'Show Flagged Only'}
          </button>
        </div>
      </div>

      {/* Demo Info */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Demo Mode Active
          </h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Maximum flags per project: {demoConfig.maxFlagsPerProject}</li>
            <li>• Allowed flag types: {demoConfig.allowedTypes.join(', ')}</li>
            <li>• Maximum note length: {demoConfig.maxNoteLength} characters</li>
            <li>• Tooltip message: "{demoConfig.tooltipMessage}"</li>
            <li>• Flag state tagged: {demoConfig.flagStateTag}</li>
          </ul>
        </div>
      )}

      {/* Flag Statistics */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Flag Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Flags
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {flags.length}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Risk Flags
            </label>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {getFlagCountByType('risk')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority Flags
            </label>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {getFlagCountByType('priority')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issue Flags
            </label>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {getFlagCountByType('issue')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Info Flags
            </label>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {getFlagCountByType('info')}
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Tasks {showOnlyFlagged && `(Flagged: ${filteredTasks.length}/${sampleTasks.length})`}
        </h2>
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FlagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No flagged tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {showOnlyFlagged ? 'Try showing all tasks or add some flags.' : 'Add flags to tasks to see them here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const taskFlag = flags.find(flag => flag.taskId === task.id);
              
              return (
                <div
                  key={task.id}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {task.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          task.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Start:</span> {task.startDate}
                        </div>
                        <div>
                          <span className="font-medium">End:</span> {task.endDate}
                        </div>
                        <div>
                          <span className="font-medium">Progress:</span> {task.progress}%
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Existing Flag */}
                      {taskFlag && (
                        <TaskFlagComponent
                          taskId={task.id}
                          flag={taskFlag}
                          onRemove={() => handleFlagRemove(task.id)}
                        />
                      )}
                      
                      {/* Add Flag Button */}
                      <button
                        onClick={() => openFlagEditor(task.id, taskFlag || null)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={taskFlag ? 'Edit flag' : 'Add flag'}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Flag Examples */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Try These Flag Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div>
            <h4 className="font-medium mb-1">Flag Types</h4>
            <ul className="space-y-1 text-xs">
              <li>• Risk - High-risk tasks requiring attention</li>
              <li>• Priority - High-priority tasks</li>
              <li>• Issue - Tasks with issues or blockers</li>
              <li>• Info - Informational notes</li>
              <li>• Custom - Custom flag type</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Features</h4>
            <ul className="space-y-1 text-xs">
              <li>• Hover tooltips with notes and metadata</li>
              <li>• Color-coded flag types</li>
              <li>• Click to remove flags</li>
              <li>• Filter by flagged tasks only</li>
              <li>• Supabase persistence</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Flag Features
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Per-task coloured flags (priority, risk, issue, etc.)</li>
          <li>• Hoverable note bubbles shown on timeline</li>
          <li>• Customisable flag colours and icons</li>
          <li>• Optional flag filters in View ribbon</li>
          <li>• Supabase persistence</li>
          <li>• Demo mode support with limitations</li>
          <li>• Real-time flag statistics</li>
          <li>• Interactive flag management</li>
        </ul>
      </div>

      {/* Flag Editor Modal */}
      <FlagEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={selectedTaskId}
        existingFlag={selectedFlag}
        onSave={handleFlagSave}
      />
    </div>
  );
};

export default TimelineFlagsDemo; 