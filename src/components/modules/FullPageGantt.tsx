import React, { useState, useEffect, useMemo } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import type { Task } from 'gantt-task-react';
import { 
  DocumentArrowUpIcon, DocumentArrowDownIcon, CloudArrowUpIcon,
  BoltIcon, ArrowsUpDownIcon, ShieldCheckIcon, UserGroupIcon,
  ChartBarIcon, CheckCircleIcon, ArrowPathIcon, AdjustmentsHorizontalIcon,
  SparklesIcon, PlusIcon, MinusIcon, FunnelIcon, ChartPieIcon,
  DevicePhoneMobileIcon, CpuChipIcon, ChevronDownIcon, ChevronRightIcon,
  CalendarIcon, ClockIcon, UserIcon, BanknotesIcon,
  FolderIcon, CogIcon, ExclamationTriangleIcon, ChartBarSquareIcon,
  DocumentTextIcon, InformationCircleIcon, CurrencyDollarIcon,
  Square3Stack3DIcon, BuildingOfficeIcon, WrenchScrewdriverIcon,
  DocumentDuplicateIcon, ArchiveBoxIcon, CalendarDaysIcon,
  ClockIcon as ClockIconSolid, UserGroupIcon as UserGroupIconSolid,
  BuildingOffice2Icon, TruckIcon, WrenchIcon, PaintBrushIcon,
  Cog6ToothIcon, DocumentMagnifyingGlassIcon, ClipboardDocumentListIcon,
  TableCellsIcon, Bars3Icon, SquaresPlusIcon, Squares2X2Icon,
  ArrowUpTrayIcon, ArrowDownTrayIcon, EyeIcon, EyeSlashIcon,
  MagnifyingGlassIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon,
  DocumentIcon, FolderOpenIcon, ChartBarIcon as ChartBarIconSolid,
  UsersIcon, TrashIcon, PlusCircleIcon, MinusCircleIcon,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon,
  ChevronRightIcon, CalendarDaysIcon as CalendarDaysIconSolid,
  ClockIcon as ClockIconOutline, UserIcon as UserIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid, BanknotesIcon as BanknotesIconSolid,
  ChevronUpIcon, GlobeAltIcon
} from '@heroicons/react/24/outline';

interface FullPageGanttProps {
  project?: any;
}

interface GanttTask extends Task {
  projectId?: string;
  wbsId?: string;
  parentId?: string | null;
  isCritical?: boolean;
  constraints?: {
    type: 'start-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on' | 'as-soon-as-possible' | 'as-late-as-possible';
    date?: Date;
  };
  powerProjectDependencies?: Array<{
    id: string;
    type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
    lag?: number;
  }>;
  resources?: Array<{
    id: string;
    name: string;
    type: 'work' | 'material' | 'cost';
    units: number;
    cost?: number;
  }>;
  baseline?: {
    start: Date;
    end: Date;
    duration: number;
    progress: number;
  };
  actuals?: {
    start?: Date;
    end?: Date;
    duration?: number;
    progress?: number;
    cost?: number;
  };
  notes?: string;
  customFields?: Record<string, any>;
}

interface Resource {
  id: string;
  name: string;
  type: 'work' | 'material' | 'cost';
  maxUnits: number;
  costPerUnit?: number;
  calendar?: {
    workingDays: number[];
    workingHours: { start: string; end: string };
    holidays: Date[];
  };
  availability: number;
  currentUtilization: number;
}

const FullPageGantt: React.FC<FullPageGanttProps> = ({ project }) => {
  // State management
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showConstraints, setShowConstraints] = useState(false);
  const [showResourceAllocation, setShowResourceAllocation] = useState(false);
  const [baselineMode, setBaselineMode] = useState(false);
  const [showActuals, setShowActuals] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    schedulePerformanceIndex: 1.0,
    costPerformanceIndex: 1.0,
    resourceUtilization: 0.75
  });

  // Critical path analysis
  const [criticalPathAnalysis, setCriticalPathAnalysis] = useState({
    criticalTasks: [] as string[],
    totalFloat: {} as Record<string, number>,
    freeFloat: {} as Record<string, number>,
    projectDuration: 0,
    criticalPathDuration: 0
  });

  // Load initial data
  useEffect(() => {
    loadGanttData();
  }, [project]);

  const loadGanttData = async () => {
    try {
      setLoading(true);
      
      // Load tasks from demo data service
      const { demoDataService } = await import('../../services/demoDataService');
      const allTasks = await demoDataService.getGanttTasks();
      
      // Filter tasks for current project if specified
      const projectTasks = project ? allTasks.filter((task: any) => task.projectId === project.id) : allTasks;
      
      // Convert to Gantt format with PowerProject features
      const ganttTasks = projectTasks.map((task: any) => ({
        id: task.id,
        name: task.name,
        start: new Date(task.start),
        end: new Date(task.end),
        progress: task.progress || 0,
        type: 'task',
        hideChildren: false,
        projectId: task.projectId,
        wbsId: task.id,
        parentId: null,
        isCritical: Math.random() > 0.7, // Random critical path for demo
        constraints: {
          type: 'as-soon-as-possible' as const
        },
        dependencies: [],
        resources: [
          {
            id: 'res1',
            name: 'Project Manager',
            type: 'work' as const,
            units: 1,
            cost: 100
          }
        ],
        baseline: {
          start: new Date(task.start),
          end: new Date(task.end),
          duration: Math.ceil((new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 60 * 60 * 24)),
          progress: task.progress || 0
        },
        actuals: {
          start: new Date(task.start),
          end: undefined,
          duration: undefined,
          progress: task.progress || 0,
          cost: 0
        },
        notes: task.description || '',
        customFields: {}
      }));

      setTasks(ganttTasks);
      
      // Load resources
      const projectResources = await demoDataService.getProjectResources(project?.id || 'default');
      setResources(projectResources);
      
      // Set default expanded state
      const expanded = new Set(ganttTasks.map(task => task.id));
      setExpandedTasks(expanded);
      
      // Perform critical path analysis
      performCriticalPathAnalysis(ganttTasks);
      
    } catch (error) {
      console.error('Error loading Gantt data:', error);
      // Create sample data
      setTasks(createSamplePowerProjectTasks());
    } finally {
      setLoading(false);
    }
  };

  const createSamplePowerProjectTasks = (): GanttTask[] => {
    return [
      {
        id: '1',
        name: 'Project Planning',
        wbsId: '1.0',
        parentId: null,
        type: 'summary',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15'),
        progress: 100,
        hideChildren: false,
        isCritical: true,
        constraints: { type: 'as-soon-as-possible' },
        resources: [
          { id: 'res1', name: 'Project Manager', type: 'work', units: 1, cost: 100 }
        ],
        baseline: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-15'),
          duration: 15,
          progress: 100
        },
        actuals: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-15'),
          duration: 15,
          progress: 100,
          cost: 1500
        },
        notes: 'Project planning phase completed successfully',
        customFields: {}
      },
      {
        id: '2',
        name: 'Requirements Analysis',
        wbsId: '1.1',
        parentId: '1',
        type: 'task',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-05'),
        progress: 100,
        hideChildren: false,
        isCritical: true,
        dependencies: [
          { id: 'dep1', type: 'finish-to-start', lag: 0 }
        ],
        resources: [
          { id: 'res2', name: 'Business Analyst', type: 'work', units: 1, cost: 80 }
        ],
        baseline: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-05'),
          duration: 5,
          progress: 100
        },
        actuals: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-05'),
          duration: 5,
          progress: 100,
          cost: 400
        },
        notes: 'Requirements gathered and documented',
        customFields: {}
      },
      {
        id: '3',
        name: 'Design Phase',
        wbsId: '1.2',
        parentId: '1',
        type: 'task',
        start: new Date('2024-01-06'),
        end: new Date('2024-01-15'),
        progress: 80,
        hideChildren: false,
        isCritical: true,
        dependencies: [
          { id: 'dep2', type: 'finish-to-start', lag: 1 }
        ],
        constraints: { type: 'finish-no-later-than', date: new Date('2024-01-20') },
        resources: [
          { id: 'res3', name: 'UI/UX Designer', type: 'work', units: 1, cost: 90 }
        ],
        baseline: {
          start: new Date('2024-01-06'),
          end: new Date('2024-01-15'),
          duration: 10,
          progress: 80
        },
        actuals: {
          start: new Date('2024-01-06'),
          end: undefined,
          duration: undefined,
          progress: 80,
          cost: 720
        },
        notes: 'Design phase in progress - 80% complete',
        customFields: {}
      },
      {
        id: '4',
        name: 'Development Phase',
        wbsId: '2.0',
        parentId: null,
        type: 'summary',
        start: new Date('2024-01-16'),
        end: new Date('2024-03-15'),
        progress: 30,
        hideChildren: false,
        isCritical: true,
        dependencies: [
          { id: 'dep3', type: 'finish-to-start', lag: 0 }
        ],
        resources: [
          { id: 'res4', name: 'Senior Developer', type: 'work', units: 1, cost: 120 },
          { id: 'res5', name: 'Junior Developer', type: 'work', units: 1, cost: 80 }
        ],
        baseline: {
          start: new Date('2024-01-16'),
          end: new Date('2024-03-15'),
          duration: 60,
          progress: 30
        },
        actuals: {
          start: new Date('2024-01-16'),
          end: undefined,
          duration: undefined,
          progress: 30,
          cost: 3600
        },
        notes: 'Development phase started - 30% complete',
        customFields: {}
      }
    ];
  };

  const performCriticalPathAnalysis = (tasks: GanttTask[]) => {
    // Simplified critical path analysis
    const criticalTasks = tasks.filter(task => task.isCritical).map(task => task.id);
    const projectDuration = Math.max(...tasks.map(task => task.end.getTime()));
    const criticalPathDuration = Math.max(...criticalTasks.map(id => {
      const task = tasks.find(t => t.id === id);
      return task ? task.end.getTime() : 0;
    }));

    setCriticalPathAnalysis({
      criticalTasks,
      totalFloat: {},
      freeFloat: {},
      projectDuration: Math.ceil((projectDuration - Math.min(...tasks.map(t => t.start.getTime()))) / (1000 * 60 * 60 * 24)),
      criticalPathDuration: Math.ceil((criticalPathDuration - Math.min(...tasks.map(t => t.start.getTime()))) / (1000 * 60 * 60 * 24))
    });
  };

  const handleTaskChange = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
  };

  const handleTaskSelect = (task: Task, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTasks(prev => [...prev, task.id]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== task.id));
    }
  };

  const handleExpanderClick = (task: Task) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(task.id)) {
        newSet.delete(task.id);
      } else {
        newSet.add(task.id);
      }
      return newSet;
    });
  };

  // Ribbon toolbar handlers
  const handleImport = () => console.log('Import clicked');
  const handleExport = () => console.log('Export clicked');
  const handleAstaSync = () => console.log('Asta Sync clicked');
  const handleToggleCriticalPath = () => setShowCriticalPath(!showCriticalPath);
  const handleToggleDependencies = () => setShowDependencies(!showDependencies);
  const handleToggleConstraints = () => setShowConstraints(!showConstraints);
  const handleToggleResourceAllocation = () => setShowResourceAllocation(!showResourceAllocation);
  const handleToggleBaseline = () => setBaselineMode(!baselineMode);
  const handleToggleActuals = () => setShowActuals(!showActuals);
  const handleAutoSchedule = () => console.log('Auto Schedule clicked');
  const handleLevelResources = () => console.log('Level Resources clicked');
  const handleOptimizeSchedule = () => console.log('Optimize Schedule clicked');
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 25));
  const handleToggleFilters = () => console.log('Toggle Filters clicked');
  const handleReports = () => console.log('Reports clicked');
  const handleMobile = () => console.log('Mobile clicked');
  const handleAI = () => console.log('AI clicked');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  return (
    <div className="full-page-gantt h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* PowerProject-Style Title Bar */}
      <div className="title-bar bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-semibold">Powerproject - Bar Chart View - {project?.name || 'New Project'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm">
            Style Options
          </button>
          <button className="w-6 h-6 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center">
            ?
          </button>
        </div>
      </div>

      {/* PowerProject-Style Ribbon Toolbar */}
      <div className="ribbon-toolbar bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        {/* Main Tabs */}
        <div className="flex border-b border-gray-300 dark:border-gray-600">
          {['File', 'Home', 'View', 'Project', 'Allocation', 'BIM', 'Format', 'Add-Ins'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRibbonTab(tab.toLowerCase())}
              className={`px-4 py-2 text-sm font-medium border-r border-gray-300 dark:border-gray-600 ${
                activeRibbonTab === tab.toLowerCase()
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Ribbon Content */}
        <div className="p-4">
          {activeRibbonTab === 'home' && (
            <div className="flex space-x-6">
              {/* Clipboard Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Clipboard</div>
                <div className="flex space-x-1">
                  <button className="ribbon-button" title="Paste">
                    <DocumentIcon className="w-5 h-5" />
                    <span className="text-xs">Paste</span>
                  </button>
                  <button className="ribbon-button" title="Cut">
                    <DocumentIcon className="w-5 h-5" />
                    <span className="text-xs">Cut</span>
                  </button>
                  <button className="ribbon-button" title="Copy">
                    <DocumentIcon className="w-5 h-5" />
                    <span className="text-xs">Copy</span>
                  </button>
                </div>
              </div>

              {/* Font Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Font</div>
                <div className="flex items-center space-x-1">
                  <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700">
                    <option>Arial</option>
                  </select>
                  <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700">
                    <option>10</option>
                  </select>
                  <button className="ribbon-button" title="Bold">B</button>
                  <button className="ribbon-button" title="Italic">I</button>
                  <button className="ribbon-button" title="Underline">U</button>
                  <button className="ribbon-button" title="Strikethrough">S</button>
                </div>
              </div>

              {/* Schedule Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Schedule</div>
                <div className="flex space-x-1">
                  <button className="ribbon-button" title="Reschedule">
                    <ArrowPathIcon className="w-5 h-5" />
                    <span className="text-xs">Reschedule</span>
                  </button>
                  <button className="ribbon-button" title="Branch">
                    <Squares2X2Icon className="w-5 h-5" />
                    <span className="text-xs">Branch</span>
                  </button>
                </div>
              </div>

              {/* Hierarchy Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Hierarchy</div>
                <div className="flex space-x-1">
                  <button className="ribbon-button" title="Indent">
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                  <button className="ribbon-button" title="Outdent">
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button className="ribbon-button" title="Move Up">
                    <ChevronUpIcon className="w-5 h-5" />
                  </button>
                  <button className="ribbon-button" title="Move Down">
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Task Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Task</div>
                <div className="flex space-x-1">
                  <button className="ribbon-button" title="Make Into">
                    <DocumentIcon className="w-5 h-5" />
                    <span className="text-xs">Make Into</span>
                  </button>
                  <button className="ribbon-button" title="Assign">
                    <UserIcon className="w-5 h-5" />
                    <span className="text-xs">Assign</span>
                  </button>
                  <button className="ribbon-button" title="Split/Join">
                    <Bars3Icon className="w-5 h-5" />
                    <span className="text-xs">Split/Join</span>
                  </button>
                </div>
              </div>

              {/* Progress Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Progress</div>
                <div className="flex items-center space-x-2">
                  <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700">
                    <option>Project Report</option>
                  </select>
                  <span className="text-sm">0.00%</span>
                </div>
              </div>
            </div>
          )}

          {activeRibbonTab === 'view' && (
            <div className="flex space-x-6">
              {/* Views Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Views</div>
                <div className="flex space-x-1">
                  <button className="ribbon-button" title="New">
                    <PlusIcon className="w-5 h-5" />
                    <span className="text-xs">New</span>
                  </button>
                  <button className="ribbon-button" title="Properties">
                    <CogIcon className="w-5 h-5" />
                    <span className="text-xs">Properties</span>
                  </button>
                  <button className="ribbon-button" title="Save As">
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    <span className="text-xs">Save As</span>
                  </button>
                </div>
              </div>

              {/* View Data Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">View Data</div>
                <div className="flex space-x-1">
                  <button className="ribbon-button" title="Filter">
                    <FunnelIcon className="w-5 h-5" />
                    <span className="text-xs">Filter</span>
                  </button>
                  <button className="ribbon-button" title="Sort/Group">
                    <ArrowsUpDownIcon className="w-5 h-5" />
                    <span className="text-xs">Sort/Group</span>
                  </button>
                  <button className="ribbon-button" title="Table">
                    <TableCellsIcon className="w-5 h-5" />
                    <span className="text-xs">Table</span>
                  </button>
                  <button className="ribbon-button" title="Add Column">
                    <SquaresPlusIcon className="w-5 h-5" />
                    <span className="text-xs">Add Column</span>
                  </button>
                </div>
              </div>

              {/* Show Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Show</div>
                <div className="flex space-x-1">
                  <button className="ribbon-button" title="Library Explorer">
                    <FolderOpenIcon className="w-5 h-5" />
                    <span className="text-xs">Library Explorer</span>
                  </button>
                  <button className="ribbon-button" title="Timeline">
                    <CalendarDaysIcon className="w-5 h-5" />
                    <span className="text-xs">Timeline</span>
                  </button>
                  <button className="ribbon-button" title="New Histogram">
                    <ChartBarIcon className="w-5 h-5" />
                    <span className="text-xs">New Histogram</span>
                  </button>
                  <button className="ribbon-button" title="Delete Histogram">
                    <TrashIcon className="w-5 h-5" />
                    <span className="text-xs">Delete Histogram</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Tabs */}
      <div className="project-tabs bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        <div className="flex">
          <div className="tab active bg-white dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            Bar Chart View - {project?.name || 'New Project'}
            <button className="ml-2 text-gray-400 hover:text-gray-600">×</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Project Explorer */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 flex flex-col">
          {/* Project Tree */}
          <div className="flex-1 p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Objects</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                <ChevronRightIcon className="w-4 h-4" />
                <GlobeAltIcon className="w-4 h-4" />
                <span>{project?.name || 'New Project'}</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer bg-blue-100 dark:bg-blue-900">
                  <ChevronDownIcon className="w-4 h-4" />
                  <UserIcon className="w-4 h-4" />
                  <span>Programme</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Permanent Resources</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>Consumable Resources</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <BanknotesIcon className="w-4 h-4" />
                  <span>Cost Centres</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <FolderIcon className="w-4 h-4" />
                  <span>Code Libraries</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <CalendarIcon className="w-4 h-4" />
                  <span>Calendars</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <ClockIcon className="w-4 h-4" />
                  <span>Progress Periods</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <Squares2X2Icon className="w-4 h-4" />
                  <span>WBS</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                  <DocumentIcon className="w-4 h-4" />
                  <span>Task Pools</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Gantt Chart */}
        <div className="flex-1 flex flex-col">
          {/* Task Table and Gantt Chart */}
          <div className="flex-1 flex">
            {/* Task Table */}
            <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-300 dark:border-gray-600">
              <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                <div className="grid grid-cols-4 gap-1 p-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <div>Line</div>
                  <div>Name</div>
                  <div>Duration</div>
                  <div>Start</div>
                </div>
              </div>
              <div className="overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`grid grid-cols-4 gap-1 p-2 text-sm border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      selectedTasks.includes(task.id) ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => handleTaskSelect(task, !selectedTasks.includes(task.id))}
                  >
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpanderClick(task);
                        }}
                        className="w-4 h-4 flex items-center justify-center"
                      >
                        {expandedTasks.has(task.id) ? (
                          <ChevronDownIcon className="w-3 h-3" />
                        ) : (
                          <ChevronRightIcon className="w-3 h-3" />
                        )}
                      </button>
                      <span>{index + 1}</span>
                    </div>
                    <div className={`${task.type === 'summary' ? 'font-semibold' : 'ml-4'}`}>
                      {task.name}
                    </div>
                    <div>
                      {Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24))}d
                    </div>
                    <div>{task.start.toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="flex-1 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="h-full">
                <Gantt
                  tasks={tasks}
                  viewMode={viewMode}
                  onDateChange={handleTaskChange}
                  onProgressChange={handleTaskChange}
                  onDoubleClick={(task) => console.log('Double clicked task:', task)}
                  onSelect={handleTaskSelect}
                  onExpanderClick={handleExpanderClick}
                  listCellWidth=""
                  columnWidth={65}
                  ganttHeight={window.innerHeight - 300}
                  className="powerproject-gantt"
                />
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="status-bar bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>Progress</span>
              <div className="w-32 bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <span>Start Date</span>
              <span>Duration</span>
              <span>Finish Date</span>
              <span>Library</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>00/00/0000 100%</span>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </button>
              <span>100%</span>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <MagnifyingGlassPlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageGantt; 