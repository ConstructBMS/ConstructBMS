import {
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Filter,
  FolderOpen,
  GanttChart,
  Grid3X3,
  Home,
  Layers,
  List,
  Plus,
  Save,
  Search,
  Settings,
  Share2,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

interface ProgrammeItem {
  id: string;
  name: string;
  type: 'project' | 'phase' | 'task' | 'milestone';
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  critical: boolean;
  dependencies: string[];
  resources: string[];
  children?: ProgrammeItem[];
  expanded?: boolean;
}

interface Task {
  id: string;
  name: string;
  programmeId: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  critical: boolean;
  dependencies: string[];
  resources: string[];
  notes: string;
}

const ProgrammeManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'insert' | 'view' | 'format' | 'tools'
  >('home');
  const [leftPaneWidth, setLeftPaneWidth] = useState(300);
  const [middlePaneWidth, setMiddlePaneWidth] = useState(400);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample programme data
  const programmeData: ProgrammeItem[] = [
    {
      id: '1',
      name: 'Office Building Renovation',
      type: 'project',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      duration: 167,
      progress: 65,
      status: 'in_progress',
      critical: true,
      dependencies: [],
      resources: ['Project Manager', 'Construction Team'],
      expanded: true,
      children: [
        {
          id: '1.1',
          name: 'Phase 1: Site Preparation',
          type: 'phase',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          duration: 31,
          progress: 100,
          status: 'completed',
          critical: true,
          dependencies: [],
          resources: ['Site Team'],
          expanded: true,
          children: [
            {
              id: '1.1.1',
              name: 'Site Survey & Demolition',
              type: 'task',
              startDate: '2024-01-15',
              endDate: '2024-01-25',
              duration: 10,
              progress: 100,
              status: 'completed',
              critical: true,
              dependencies: [],
              resources: ['Survey Team', 'Demolition Crew'],
            },
            {
              id: '1.1.2',
              name: 'Foundation Preparation',
              type: 'task',
              startDate: '2024-01-26',
              endDate: '2024-02-15',
              duration: 20,
              progress: 100,
              status: 'completed',
              critical: true,
              dependencies: ['1.1.1'],
              resources: ['Foundation Team'],
            },
          ],
        },
        {
          id: '1.2',
          name: 'Phase 2: Structural Work',
          type: 'phase',
          startDate: '2024-02-16',
          endDate: '2024-04-15',
          duration: 59,
          progress: 75,
          status: 'in_progress',
          critical: true,
          dependencies: ['1.1'],
          resources: ['Structural Team'],
          expanded: true,
          children: [
            {
              id: '1.2.1',
              name: 'Steel Framework',
              type: 'task',
              startDate: '2024-02-16',
              endDate: '2024-03-15',
              duration: 28,
              progress: 100,
              status: 'completed',
              critical: true,
              dependencies: ['1.1.2'],
              resources: ['Steel Team'],
            },
            {
              id: '1.2.2',
              name: 'Concrete Work',
              type: 'task',
              startDate: '2024-03-16',
              endDate: '2024-04-15',
              duration: 30,
              progress: 50,
              status: 'in_progress',
              critical: true,
              dependencies: ['1.2.1'],
              resources: ['Concrete Team'],
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Residential Complex',
      type: 'project',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      duration: 305,
      progress: 25,
      status: 'in_progress',
      critical: false,
      dependencies: [],
      resources: ['Project Manager', 'Design Team'],
      expanded: false,
      children: [
        {
          id: '2.1',
          name: 'Design Phase',
          type: 'phase',
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          duration: 91,
          progress: 75,
          status: 'in_progress',
          critical: true,
          dependencies: [],
          resources: ['Architects', 'Engineers'],
          expanded: false,
        },
      ],
    },
  ];

  const tasks: Task[] = [
    {
      id: '1.1.1',
      name: 'Site Survey & Demolition',
      programmeId: '1.1.1',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      duration: 10,
      progress: 100,
      status: 'completed',
      critical: true,
      dependencies: [],
      resources: ['Survey Team', 'Demolition Crew'],
      notes: 'Site survey completed. Demolition of old structures finished.',
    },
    {
      id: '1.1.2',
      name: 'Foundation Preparation',
      programmeId: '1.1.2',
      startDate: '2024-01-26',
      endDate: '2024-02-15',
      duration: 20,
      progress: 100,
      status: 'completed',
      critical: true,
      dependencies: ['1.1.1'],
      resources: ['Foundation Team'],
      notes: 'Foundation excavation and preparation completed successfully.',
    },
    {
      id: '1.2.1',
      name: 'Steel Framework',
      programmeId: '1.2.1',
      startDate: '2024-02-16',
      endDate: '2024-03-15',
      duration: 28,
      progress: 100,
      status: 'completed',
      critical: true,
      dependencies: ['1.1.2'],
      resources: ['Steel Team'],
      notes: 'Steel framework erection completed on schedule.',
    },
    {
      id: '1.2.2',
      name: 'Concrete Work',
      programmeId: '1.2.2',
      startDate: '2024-03-16',
      endDate: '2024-04-15',
      duration: 30,
      progress: 50,
      status: 'in_progress',
      critical: true,
      dependencies: ['1.2.1'],
      resources: ['Concrete Team'],
      notes: 'Concrete pouring in progress. Currently at 50% completion.',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'not_started':
        return 'text-gray-600 bg-gray-100';
      case 'on_hold':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className='w-4 h-4' />;
      case 'phase':
        return <Layers className='w-4 h-4' />;
      case 'task':
        return <CheckSquare className='w-4 h-4' />;
      case 'milestone':
        return <Zap className='w-4 h-4' />;
      default:
        return <FolderOpen className='w-4 h-4' />;
    }
  };

  const renderRibbon = () => (
    <div className='bg-white border-b border-gray-200 shadow-sm'>
      {/* Ribbon Tabs */}
      <div className='flex border-b border-gray-200'>
        {[
          { id: 'home', name: 'Home', icon: Home },
          { id: 'insert', name: 'Insert', icon: Plus },
          { id: 'view', name: 'View', icon: Eye },
          { id: 'format', name: 'Format', icon: Grid3X3 },
          { id: 'tools', name: 'Tools', icon: Settings },
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as 'home' | 'insert' | 'view' | 'format' | 'tools'
                )
              }
              className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <IconComponent className='w-4 h-4' />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Ribbon Content */}
      <div className='p-4'>
        {activeTab === 'home' && (
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <button className='flex items-center px-3 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700'>
                <Plus className='w-4 h-4 mr-2' />
                New Project
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Save className='w-4 h-4 mr-2' />
                Save
              </button>
            </div>

            <div className='flex items-center space-x-2'>
              <button className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'>
                <Copy className='w-4 h-4' />
              </button>
              <button className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'>
                <Trash2 className='w-4 h-4' />
              </button>
              <button className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'>
                <Share2 className='w-4 h-4' />
              </button>
            </div>

            <div className='flex items-center space-x-2'>
              <button className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'>
                <Search className='w-4 h-4' />
              </button>
              <button className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'>
                <Filter className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Plus className='w-4 h-4 mr-2' />
                New Task
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Zap className='w-4 h-4 mr-2' />
                New Milestone
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Layers className='w-4 h-4 mr-2' />
                New Phase
              </button>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <GanttChart className='w-4 h-4 mr-2' />
                Gantt View
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <List className='w-4 h-4 mr-2' />
                List View
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Grid3X3 className='w-4 h-4 mr-2' />
                Grid View
              </button>
            </div>
          </div>
        )}

        {activeTab === 'format' && (
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Settings className='w-4 h-4 mr-2' />
                Format Options
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Grid3X3 className='w-4 h-4 mr-2' />
                Layout
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Settings className='w-4 h-4 mr-2' />
                Options
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Users className='w-4 h-4 mr-2' />
                Resources
              </button>
              <button className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                <Calendar className='w-4 h-4 mr-2' />
                Calendar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProgrammeTree = () => (
    <div className='h-full bg-white border-r border-gray-200'>
      <div className='p-4 border-b border-gray-200'>
        <h3 className='font-semibold text-gray-900'>Programme Tree</h3>
        <div className='mt-2 relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Search programme...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          />
        </div>
      </div>

      <div className='overflow-y-auto h-[calc(100vh-300px)]'>
        {programmeData.map(item => (
          <div key={item.id} className='programme-tree-item'>
            {renderTreeItem(item, 0)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTreeItem = (item: ProgrammeItem, level: number) => (
    <div key={item.id}>
      <div
        className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 cursor-pointer ${
          selectedItem === item.id
            ? 'bg-primary-50 border-r-2 border-primary-600'
            : ''
        }`}
        onClick={() => setSelectedItem(item.id)}
        style={{ paddingLeft: `${level * 20 + 16}px` }}
      >
        {item.children && item.children.length > 0 && (
          <button
            onClick={e => {
              e.stopPropagation();
              item.expanded = !item.expanded;
              // Force re-render
              setSelectedItem(selectedItem);
            }}
            className='p-1 hover:bg-gray-200 rounded'
          >
            {item.expanded ? (
              <ChevronDown className='w-3 h-3' />
            ) : (
              <ChevronRight className='w-3 h-3' />
            )}
          </button>
        )}

        <div
          className={`text-gray-600 ${!item.children || item.children.length === 0 ? 'ml-6' : ''}`}
        >
          {getTypeIcon(item.type)}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='text-sm font-medium text-gray-900 truncate'>
            {item.name}
          </div>
          <div className='text-xs text-gray-500'>
            {item.startDate} - {item.endDate} ({item.duration} days)
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <div className='w-16 bg-gray-200 rounded-full h-1.5'>
            <div
              className='bg-primary-600 h-1.5 rounded-full'
              style={{ width: `${item.progress}%` }}
            ></div>
          </div>
          <span className='text-xs text-gray-500'>{item.progress}%</span>
        </div>
      </div>

      {item.expanded && item.children && (
        <div>
          {item.children.map(child => renderTreeItem(child, level + 1))}
        </div>
      )}
    </div>
  );

  const renderTaskList = () => (
    <div className='h-full bg-white border-r border-gray-200'>
      <div className='p-4 border-b border-gray-200'>
        <h3 className='font-semibold text-gray-900'>Task List</h3>
        <div className='text-sm text-gray-500 mt-1'>
          {tasks.length} tasks •{' '}
          {tasks.filter(t => t.status === 'completed').length} completed
        </div>
      </div>

      <div className='overflow-y-auto h-[calc(100vh-300px)]'>
        <table className='w-full'>
          <thead className='bg-gray-50 sticky top-0'>
            <tr>
              <th className='text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Task
              </th>
              <th className='text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Duration
              </th>
              <th className='text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Progress
              </th>
              <th className='text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Critical
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr
                key={task.id}
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  selectedItem === task.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => setSelectedItem(task.id)}
              >
                <td className='py-2 px-4'>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      {task.name}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {task.startDate} - {task.endDate}
                    </div>
                  </div>
                </td>
                <td className='py-2 px-4 text-sm text-gray-600'>
                  {task.duration} days
                </td>
                <td className='py-2 px-4'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-16 bg-gray-200 rounded-full h-1.5'>
                      <div
                        className='bg-primary-600 h-1.5 rounded-full'
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className='text-xs text-gray-600'>
                      {task.progress}%
                    </span>
                  </div>
                </td>
                <td className='py-2 px-4'>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </td>
                <td className='py-2 px-4'>
                  {task.critical ? (
                    <span className='inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600'>
                      Critical
                    </span>
                  ) : (
                    <span className='text-gray-400'>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGanttChart = () => (
    <div className='h-full bg-white'>
      <div className='p-4 border-b border-gray-200'>
        <h3 className='font-semibold text-gray-900'>Gantt Chart</h3>
        <div className='text-sm text-gray-500 mt-1'>
          Timeline view of all tasks and dependencies
        </div>
      </div>

      <div className='p-4'>
        <div className='space-y-4'>
          {tasks.map(task => (
            <div key={task.id} className='gantt-task'>
              <div className='flex items-center space-x-4'>
                <div className='w-32 text-sm font-medium text-gray-900'>
                  {task.name}
                </div>
                <div className='flex-1'>
                  <div className='relative bg-gray-100 rounded h-6'>
                    <div
                      className={`absolute top-0 left-0 h-full rounded ${
                        task.status === 'completed'
                          ? 'bg-green-500'
                          : task.status === 'in_progress'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                      }`}
                      style={{
                        width: `${task.progress}%`,
                        left: `${getTaskPosition(task.startDate)}%`,
                      }}
                    ></div>
                    <div className='absolute inset-0 flex items-center justify-center text-xs text-white font-medium'>
                      {task.progress}%
                    </div>
                  </div>
                </div>
                <div className='w-20 text-xs text-gray-500 text-right'>
                  {task.duration} days
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getTaskPosition = (startDate: string) => {
    // Simple calculation for demo - in real app this would be based on actual dates
    const start = new Date(startDate);
    const projectStart = new Date('2024-01-15');
    const totalDays = 167; // Total project duration
    const daysFromStart = Math.floor(
      (start.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, (daysFromStart / totalDays) * 100);
  };

  const renderBottomPane = () => (
    <div className='h-32 bg-white border-t border-gray-200'>
      <div className='p-4'>
        <h3 className='font-semibold text-gray-900 mb-2'>Details</h3>
        {selectedItem && (
          <div className='text-sm text-gray-600'>
            {(() => {
              const task = tasks.find(t => t.id === selectedItem);
              if (task) {
                return (
                  <div>
                    <div className='font-medium'>{task.name}</div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {task.notes}
                    </div>
                  </div>
                );
              }
              return <div>Select an item to view details</div>;
            })()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* Ribbon Toolbar */}
      {renderRibbon()}

      {/* Main Content Area */}
      <div className='flex-1 flex'>
        {/* Left Pane - Programme Tree */}
        <div style={{ width: leftPaneWidth }}>{renderProgrammeTree()}</div>

        {/* Resizer */}
        <div
          className='w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400'
          onMouseDown={e => {
            const startX = e.clientX;
            const startWidth = leftPaneWidth;

            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = startWidth + (e.clientX - startX);
              setLeftPaneWidth(Math.max(200, Math.min(500, newWidth)));
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Middle Pane - Task List */}
        <div style={{ width: middlePaneWidth }}>{renderTaskList()}</div>

        {/* Resizer */}
        <div
          className='w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400'
          onMouseDown={e => {
            const startX = e.clientX;
            const startWidth = middlePaneWidth;

            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = startWidth + (e.clientX - startX);
              setMiddlePaneWidth(Math.max(300, Math.min(600, newWidth)));
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Right Pane - Gantt Chart */}
        <div className='flex-1'>{renderGanttChart()}</div>
      </div>

      {/* Bottom Pane */}
      {renderBottomPane()}
    </div>
  );
};

export default ProgrammeManager;
