import {
  CheckSquare,
  Clock,
  FolderOpen,
  GanttChart,
  Plus,
  Settings,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  progress: number;
  criticalPath: boolean;
  dependencies: string[];
  resources: string[];
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed' | 'delayed';
  critical: boolean;
}

interface Task {
  id: string;
  name: string;
  projectId: string;
  duration: number;
  startDate: string;
  endDate: string;
  dependencies: string[];
  resources: string[];
  progress: number;
  critical: boolean;
}

const ProjectProgramManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'gantt' | 'resources' | 'critical-path' | 'milestones'
  >('overview');

  // Sample data for demonstration
  const projects: Project[] = [
    {
      id: '1',
      name: 'Office Building Renovation',
      status: 'in_progress',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 65,
      criticalPath: true,
      dependencies: ['2'],
      resources: ['Construction Team A', 'Project Manager'],
      milestones: [
        {
          id: 'm1',
          name: 'Foundation Complete',
          date: '2024-02-15',
          status: 'completed',
          critical: true,
        },
        {
          id: 'm2',
          name: 'Structural Work',
          date: '2024-04-15',
          status: 'in_progress',
          critical: true,
        },
        {
          id: 'm3',
          name: 'Interior Finishing',
          date: '2024-06-15',
          status: 'pending',
          critical: false,
        },
      ],
    },
    {
      id: '2',
      name: 'Residential Complex',
      status: 'planning',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      progress: 25,
      criticalPath: false,
      dependencies: [],
      resources: ['Design Team', 'Planning Consultant'],
      milestones: [
        {
          id: 'm4',
          name: 'Design Approval',
          date: '2024-04-01',
          status: 'pending',
          critical: true,
        },
        {
          id: 'm5',
          name: 'Permits Obtained',
          date: '2024-05-01',
          status: 'pending',
          critical: true,
        },
      ],
    },
    {
      id: '3',
      name: 'Shopping Center',
      status: 'completed',
      startDate: '2023-09-01',
      endDate: '2024-01-30',
      progress: 100,
      criticalPath: false,
      dependencies: [],
      resources: ['Construction Team B', 'Project Manager'],
      milestones: [
        {
          id: 'm6',
          name: 'Construction Complete',
          date: '2024-01-15',
          status: 'completed',
          critical: true,
        },
        {
          id: 'm7',
          name: 'Grand Opening',
          date: '2024-01-30',
          status: 'completed',
          critical: false,
        },
      ],
    },
  ];

  const tasks: Task[] = [
    {
      id: 't1',
      name: 'Site Preparation',
      projectId: '1',
      duration: 14,
      startDate: '2024-01-15',
      endDate: '2024-01-29',
      dependencies: [],
      resources: ['Construction Team A'],
      progress: 100,
      critical: true,
    },
    {
      id: 't2',
      name: 'Foundation Work',
      projectId: '1',
      duration: 21,
      startDate: '2024-01-30',
      endDate: '2024-02-20',
      dependencies: ['t1'],
      resources: ['Construction Team A'],
      progress: 100,
      critical: true,
    },
    {
      id: 't3',
      name: 'Structural Framework',
      projectId: '1',
      duration: 35,
      startDate: '2024-02-21',
      endDate: '2024-03-28',
      dependencies: ['t2'],
      resources: ['Construction Team A'],
      progress: 75,
      critical: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'planning':
        return 'text-yellow-600 bg-yellow-100';
      case 'on_hold':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className='space-y-6'>
      {/* Project Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='card'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-blue-500'>
              <FolderOpen className='w-6 h-6 text-white' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Projects
              </p>
              <p className='text-2xl font-bold'>{projects.length}</p>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-green-500'>
              <CheckSquare className='w-6 h-6 text-white' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Active Projects
              </p>
              <p className='text-2xl font-bold'>
                {projects.filter(p => p.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-purple-500'>
              <Target className='w-6 h-6 text-white' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Critical Path</p>
              <p className='text-2xl font-bold'>
                {projects.filter(p => p.criticalPath).length}
              </p>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='flex items-center'>
            <div className='p-3 rounded-lg bg-orange-500'>
              <Clock className='w-6 h-6 text-white' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>On Hold</p>
              <p className='text-2xl font-bold'>
                {projects.filter(p => p.status === 'on_hold').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold'>Active Projects</h2>
          <button className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700'>
            <Plus className='w-4 h-4 mr-2' />
            New Project
          </button>
        </div>

        <div className='space-y-4'>
          {projects.map(project => (
            <div
              key={project.id}
              className='border rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h3 className='text-lg font-semibold'>{project.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                    {project.criticalPath && (
                      <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600'>
                        Critical Path
                      </span>
                    )}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                    <div>
                      <span className='font-medium'>Timeline:</span>{' '}
                      {project.startDate} - {project.endDate}
                    </div>
                    <div>
                      <span className='font-medium'>Progress:</span>{' '}
                      {project.progress}%
                    </div>
                    <div>
                      <span className='font-medium'>Resources:</span>{' '}
                      {project.resources.length}
                    </div>
                  </div>

                  <div className='mt-3'>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-primary-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className='flex space-x-2'>
                  <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                    <GanttChart className='w-5 h-5' />
                  </button>
                  <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                    <Settings className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGanttChart = () => (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold'>Gantt Chart View</h2>
        <div className='flex space-x-2'>
          <button className='px-3 py-2 text-sm border rounded hover:bg-gray-50'>
            Week
          </button>
          <button className='px-3 py-2 text-sm border rounded hover:bg-gray-50'>
            Month
          </button>
          <button className='px-3 py-2 text-sm border rounded hover:bg-gray-50'>
            Quarter
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <div className='min-w-[800px]'>
          {/* Gantt Chart Header */}
          <div className='grid grid-cols-12 gap-2 mb-4 text-sm font-medium text-gray-600'>
            <div className='col-span-3'>Task/Project</div>
            <div className='col-span-1 text-center'>Start</div>
            <div className='col-span-1 text-center'>End</div>
            <div className='col-span-1 text-center'>Duration</div>
            <div className='col-span-1 text-center'>Progress</div>
            <div className='col-span-1 text-center'>Critical</div>
            <div className='col-span-1 text-center'>Dependencies</div>
            <div className='col-span-1 text-center'>Resources</div>
            <div className='col-span-1 text-center'>Status</div>
            <div className='col-span-1 text-center'>Actions</div>
          </div>

          {/* Gantt Chart Rows */}
          {tasks.map(task => (
            <div
              key={task.id}
              className='grid grid-cols-12 gap-2 py-3 border-b hover:bg-gray-50'
            >
              <div className='col-span-3 font-medium'>{task.name}</div>
              <div className='col-span-1 text-center text-sm'>
                {task.startDate}
              </div>
              <div className='col-span-1 text-center text-sm'>
                {task.endDate}
              </div>
              <div className='col-span-1 text-center text-sm'>
                {task.duration} days
              </div>
              <div className='col-span-1 text-center'>
                <div className='w-16 bg-gray-200 rounded-full h-2 mx-auto'>
                  <div
                    className='bg-primary-600 h-2 rounded-full'
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
                <span className='text-xs text-gray-500'>{task.progress}%</span>
              </div>
              <div className='col-span-1 text-center'>
                {task.critical ? (
                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600'>
                    Critical
                  </span>
                ) : (
                  <span className='text-gray-400'>-</span>
                )}
              </div>
              <div className='col-span-1 text-center text-sm'>
                {task.dependencies.length}
              </div>
              <div className='col-span-1 text-center text-sm'>
                {task.resources.length}
              </div>
              <div className='col-span-1 text-center'>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('in_progress')}`}
                >
                  Active
                </span>
              </div>
              <div className='col-span-1 text-center'>
                <button className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                  <Settings className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold'>Resource Management</h2>
        <button className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700'>
          <Plus className='w-4 h-4 mr-2' />
          Add Resource
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='border rounded-lg p-4'>
          <div className='flex items-center space-x-3 mb-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Users className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h3 className='font-semibold'>Construction Team A</h3>
              <p className='text-sm text-gray-600'>5 members</p>
            </div>
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Availability:</span>
              <span className='font-medium text-green-600'>85%</span>
            </div>
            <div className='flex justify-between'>
              <span>Current Project:</span>
              <span className='font-medium'>Office Building</span>
            </div>
            <div className='flex justify-between'>
              <span>Utilization:</span>
              <span className='font-medium text-blue-600'>92%</span>
            </div>
          </div>
        </div>

        <div className='border rounded-lg p-4'>
          <div className='flex items-center space-x-3 mb-3'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <Users className='w-5 h-5 text-green-600' />
            </div>
            <div>
              <h3 className='font-semibold'>Design Team</h3>
              <p className='text-sm text-gray-600'>3 members</p>
            </div>
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Availability:</span>
              <span className='font-medium text-green-600'>90%</span>
            </div>
            <div className='flex justify-between'>
              <span>Current Project:</span>
              <span className='font-medium'>Residential Complex</span>
            </div>
            <div className='flex justify-between'>
              <span>Utilization:</span>
              <span className='font-medium text-blue-600'>78%</span>
            </div>
          </div>
        </div>

        <div className='border rounded-lg p-4'>
          <div className='flex items-center space-x-3 mb-3'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <Users className='w-5 h-5 text-purple-600' />
            </div>
            <div>
              <h3 className='font-semibold'>Project Manager</h3>
              <p className='text-sm text-gray-600'>1 member</p>
            </div>
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Availability:</span>
              <span className='font-medium text-yellow-600'>70%</span>
            </div>
            <div className='flex justify-between'>
              <span>Current Project:</span>
              <span className='font-medium'>Multiple</span>
            </div>
            <div className='flex justify-between'>
              <span>Utilization:</span>
              <span className='font-medium text-blue-600'>95%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCriticalPath = () => (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold'>Critical Path Analysis</h2>
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-gray-600'>Critical Path Duration:</span>
          <span className='text-lg font-bold text-red-600'>156 days</span>
        </div>
      </div>

      <div className='space-y-4'>
        {projects
          .filter(p => p.criticalPath)
          .map(project => (
            <div
              key={project.id}
              className='border-l-4 border-red-500 pl-4 py-3'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-semibold text-red-700'>{project.name}</h3>
                  <p className='text-sm text-gray-600'>
                    {project.startDate} - {project.endDate} ({project.duration}{' '}
                    days)
                  </p>
                </div>
                <div className='text-right'>
                  <div className='text-sm text-gray-600'>Progress</div>
                  <div className='text-lg font-bold text-red-600'>
                    {project.progress}%
                  </div>
                </div>
              </div>

              <div className='mt-3'>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-red-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className='mt-3 flex flex-wrap gap-2'>
                {project.milestones
                  .filter(m => m.critical)
                  .map(milestone => (
                    <span
                      key={milestone.id}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}
                    >
                      <Target className='w-3 h-3 mr-1' />
                      {milestone.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold'>Milestone Tracking</h2>
        <button className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700'>
          <Plus className='w-4 h-4 mr-2' />
          Add Milestone
        </button>
      </div>

      <div className='space-y-4'>
        {projects
          .flatMap(project =>
            project.milestones.map(milestone => ({
              ...milestone,
              projectName: project.name,
              projectStatus: project.status,
            }))
          )
          .map(milestone => (
            <div
              key={milestone.id}
              className='border rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h3 className='font-semibold'>{milestone.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}
                    >
                      {milestone.status}
                    </span>
                    {milestone.critical && (
                      <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600'>
                        Critical
                      </span>
                    )}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                    <div>
                      <span className='font-medium'>Project:</span>{' '}
                      {milestone.projectName}
                    </div>
                    <div>
                      <span className='font-medium'>Due Date:</span>{' '}
                      {milestone.date}
                    </div>
                    <div>
                      <span className='font-medium'>Project Status:</span>{' '}
                      {milestone.projectStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className='flex space-x-2'>
                  <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                    <CheckSquare className='w-5 h-5' />
                  </button>
                  <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                    <Settings className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold'>Project Program Manager</h1>
        <p className='text-gray-600'>
          Manage projects, resources, and critical paths with Asta
          Powerproject-style functionality
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8'>
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'gantt', name: 'Gantt Chart', icon: GanttChart },
            { id: 'resources', name: 'Resources', icon: Users },
            { id: 'critical-path', name: 'Critical Path', icon: Zap },
            { id: 'milestones', name: 'Milestones', icon: Target },
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | 'overview'
                      | 'gantt'
                      | 'resources'
                      | 'critical-path'
                      | 'milestones'
                  )
                }
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className='w-4 h-4' />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='min-h-[600px]'>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'gantt' && renderGanttChart()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'critical-path' && renderCriticalPath()}
        {activeTab === 'milestones' && renderMilestones()}
      </div>
    </div>
  );
};

export default ProjectProgramManager;
