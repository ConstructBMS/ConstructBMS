import React, { useState, useEffect } from 'react';
import { 
  FlagIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { programmeTaskFlagsService, type ProgrammeTaskFlag } from '../../services/programmeTaskFlagsService';
import { demoModeService } from '../../services/demoModeService';
import TaskFlagIndicator from './TaskFlagIndicator';
import TaskNotesTab from './TaskNotesTab';

// Sample task data for demo
const sampleTasks = [
  {
    id: 'demo-task-1',
    name: 'Foundation Excavation',
    status: 'in-progress',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    progress: 60
  },
  {
    id: 'demo-task-2',
    name: 'Steel Frame Installation',
    status: 'not-started',
    startDate: '2024-01-26',
    endDate: '2024-02-15',
    progress: 0
  },
  {
    id: 'demo-task-3',
    name: 'Roof Installation',
    status: 'not-started',
    startDate: '2024-02-16',
    endDate: '2024-03-05',
    progress: 0
  },
  {
    id: 'demo-task-4',
    name: 'Electrical Wiring',
    status: 'not-started',
    startDate: '2024-03-06',
    endDate: '2024-03-25',
    progress: 0
  },
  {
    id: 'demo-task-5',
    name: 'Final Inspection',
    status: 'not-started',
    startDate: '2024-03-26',
    endDate: '2024-03-30',
    progress: 0
  }
];

const ProgrammeFlagsDemo: React.FC = () => {
  const [flags, setFlags] = useState<ProgrammeTaskFlag[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Load flags and check demo mode on mount
  useEffect(() => {
    loadFlags();
    checkDemoMode();
  }, []);

  const loadFlags = async () => {
    const projectFlags = await programmeTaskFlagsService.getFlagsForProject('demo-project');
    setFlags(projectFlags);
  };

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.isDemoMode();
    setIsDemoMode(isDemo);
  };

  const handleFlagSave = async (flag: ProgrammeTaskFlag) => {
    setFlags(prev => {
      const existing = prev.find(f => f.taskId === flag.taskId);
      if (existing) {
        return prev.map(f => f.taskId === flag.taskId ? flag : f);
      } else {
        return [...prev, flag];
      }
    });
  };

  const handleFlagRemove = (taskId: string) => {
    setFlags(prev => prev.filter(f => f.taskId !== taskId));
  };

  const openNotesModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowNotesModal(true);
  };

  const getFlagColorIcon = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    const icons = {
      red: ExclamationTriangleIcon,
      yellow: ClockIcon,
      green: CheckCircleIcon,
      blue: InformationCircleIcon
    };
    return icons[color];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'not-started': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors['not-started'];
  };

  const demoConfig = programmeTaskFlagsService.getDemoModeConfig();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Programme Flags & Notes Demo
        </h1>
        <p className="text-gray-600">
          Visual indicators and inline comments for project tasks
        </p>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Demo Mode Restrictions:</p>
              <ul className="mt-1 space-y-1">
                {programmeTaskFlagsService.getDemoModeRestrictions().map((restriction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <FlagIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Flags</p>
              <p className="text-2xl font-bold text-gray-900">{flags.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Red Flags</p>
              <p className="text-2xl font-bold text-gray-900">
                {flags.filter(f => f.flagColor === 'red').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Yellow Flags</p>
              <p className="text-2xl font-bold text-gray-900">
                {flags.filter(f => f.flagColor === 'yellow').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Green Flags</p>
              <p className="text-2xl font-bold text-gray-900">
                {flags.filter(f => f.flagColor === 'green').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flag
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleTasks.map((task) => {
                const taskFlag = flags.find(f => f.taskId === task.id);
                const IconComponent = taskFlag ? getFlagColorIcon(taskFlag.flagColor) : null;
                
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.startDate} - {task.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <TaskFlagIndicator
                        taskId={task.id}
                        projectId="demo-project"
                        isDemoMode={isDemoMode}
                        showTooltip={true}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openNotesModal(task.id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        {taskFlag ? 'Edit' : 'Add'} Flag
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Task Notes & Flags
              </h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <PlusIcon className="w-6 h-6 transform rotate-45" />
              </button>
            </div>
            
            <div className="p-6">
              <TaskNotesTab
                taskId={selectedTaskId}
                projectId="demo-project"
                isDemoMode={isDemoMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammeFlagsDemo; 