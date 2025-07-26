import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  HomeIcon,
  EyeIcon,
  FolderIcon,
  UsersIcon,
  PaintBrushIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  CalendarIcon,
  CogIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  FlagIcon,
  TagIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import AstaRibbon from './AstaRibbon';

interface AstaPowerProjectScaffoldProps {
  projectId?: string;
  onBack?: () => void;
}

const AstaPowerProjectScaffold: React.FC<AstaPowerProjectScaffoldProps> = ({
  projectId = 'demo-project-1',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentViewMode, setCurrentViewMode] = useState('gantt');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [projectDetails, setProjectDetails] = useState({
    id: projectId,
    name: 'Office Building Construction',
    client: 'ABC Corporation',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    status: 'active' as const,
    progress: 35,
    manager: 'John Smith',
    budget: 2500000,
    actualCost: 875000,
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log('Tab changed to:', tabId);
  };

  const handleViewOperation = (operation: string) => {
    console.log('View operation:', operation);
  };

  const handleViewStateChange = (state: any) => {
    console.log('View state changed:', state);
  };

  const handleOutputOperation = (operation: string) => {
    console.log('Output operation:', operation);
  };

  const handleOutputStateChange = (state: any) => {
    console.log('Output state changed:', state);
  };

  const handleTaskOperation = (operation: string) => {
    console.log('Task operation:', operation);
  };

  const handleAllocationOperation = (operation: string) => {
    console.log('Allocation operation:', operation);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Project Overview */}
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                <h3 className='text-lg font-semibold mb-4'>Project Overview</h3>
                <div className='space-y-3'>
                  <div>
                    <label className='text-sm text-gray-600 dark:text-gray-400'>
                      Project Name
                    </label>
                    <p className='font-medium'>{projectDetails.name}</p>
                  </div>
                  <div>
                    <label className='text-sm text-gray-600 dark:text-gray-400'>
                      Client
                    </label>
                    <p className='font-medium'>{projectDetails.client}</p>
                  </div>
                  <div>
                    <label className='text-sm text-gray-600 dark:text-gray-400'>
                      Progress
                    </label>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{ width: `${projectDetails.progress}%` }}
                      ></div>
                    </div>
                    <p className='text-sm mt-1'>{projectDetails.progress}%</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
                <div className='space-y-3'>
                  <button className='w-full flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'>
                    <PlusIcon className='w-5 h-5' />
                    <span>Add New Task</span>
                  </button>
                  <button className='w-full flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors'>
                    <UsersIcon className='w-5 h-5' />
                    <span>Assign Resources</span>
                  </button>
                  <button className='w-full flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors'>
                    <ChartBarIcon className='w-5 h-5' />
                    <span>View Reports</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                <h3 className='text-lg font-semibold mb-4'>Recent Activity</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm'>
                      Task "Foundation Work" completed
                    </span>
                  </div>
                  <div className='flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span className='text-sm'>
                      Resource "Crane Operator" assigned
                    </span>
                  </div>
                  <div className='flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded'>
                    <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                    <span className='text-sm'>Baseline "Phase 1" created</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'view':
        return (
          <div className='p-6'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold mb-4'>View Options</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <button className='p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'>
                  <EyeIcon className='w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400' />
                  <span className='text-sm font-medium'>Gantt Chart</span>
                </button>
                <button className='p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                  <CalendarIcon className='w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400' />
                  <span className='text-sm font-medium'>Calendar</span>
                </button>
                <button className='p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                  <UsersIcon className='w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400' />
                  <span className='text-sm font-medium'>Resource</span>
                </button>
                <button className='p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                  <ChartBarIcon className='w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400' />
                  <span className='text-sm font-medium'>Network</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'project':
        return (
          <div className='p-6'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold mb-4'>Project Settings</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Project Name
                  </label>
                  <input
                    type='text'
                    value={projectDetails.name}
                    onChange={e =>
                      setProjectDetails(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Client
                  </label>
                  <input
                    type='text'
                    value={projectDetails.client}
                    onChange={e =>
                      setProjectDetails(prev => ({
                        ...prev,
                        client: e.target.value,
                      }))
                    }
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Start Date
                  </label>
                  <input
                    type='date'
                    value={projectDetails.startDate.toISOString().split('T')[0]}
                    onChange={e =>
                      setProjectDetails(prev => ({
                        ...prev,
                        startDate: new Date(e.target.value),
                      }))
                    }
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    End Date
                  </label>
                  <input
                    type='date'
                    value={projectDetails.endDate.toISOString().split('T')[0]}
                    onChange={e =>
                      setProjectDetails(prev => ({
                        ...prev,
                        endDate: new Date(e.target.value),
                      }))
                    }
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className='p-6'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold mb-4'>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tab
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                This tab is under development. More features will be added soon.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='h-screen flex flex-col bg-gray-50 dark:bg-gray-900'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center gap-4'>
            {onBack && (
              <button
                onClick={onBack}
                className='flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
              >
                <ArrowLeftIcon className='w-5 h-5' />
                <span>Back to Programme Manager</span>
              </button>
            )}
            <div className='h-6 w-px bg-gray-300 dark:bg-gray-600'></div>
            <div>
              <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                {projectDetails.name}
              </h1>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {projectDetails.client} • {projectDetails.status}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Progress
              </p>
              <p className='font-semibold text-gray-900 dark:text-white'>
                {projectDetails.progress}%
              </p>
            </div>
            <div className='w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full'
                style={{ width: `${projectDetails.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Asta Ribbon */}
      <AstaRibbon
        activeTab={activeTab}
        userRole='project_manager'
        projectId={projectId}
        onViewOperation={handleViewOperation}
        currentViewState={{ mode: currentViewMode }}
        onViewStateChange={handleViewStateChange}
        onOutputOperation={handleOutputOperation}
        currentOutputState={{}}
        onOutputStateChange={handleOutputStateChange}
        onTaskOperation={handleTaskOperation}
        onAllocationOperation={handleAllocationOperation}
        selectedTasks={selectedTasks}
        onTabChange={handleTabChange}
      />

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>{renderMainContent()}</div>
    </div>
  );
};

export default AstaPowerProjectScaffold;
