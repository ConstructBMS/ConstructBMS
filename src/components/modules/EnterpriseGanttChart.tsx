// Enterprise Gantt Chart Component - Asta Powerproject Style
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import type { Task as GanttTask } from 'gantt-task-react';
import { 
  ChevronRightIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  TableCellsIcon,
  PlusCircleIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
  BoltIcon,
  CpuChipIcon,
  BeakerIcon,
  PresentationChartLineIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  ImportModal, 
  ExportModal, 
  AstaSyncModal, 
  ReportsModal, 
  MobileModal, 
  AIModal 
} from './GanttModals';

interface EnterpriseGanttChartProps {
  onMarkChanged?: () => void;
  project: any;
}

interface WbsTask {
  actuals?: {
    cost?: number;
    duration?: number;
    end?: Date;
    progress?: number;
    start?: Date;
  };
  assignee: string;
  baseline?: {
    duration: number;
    end: Date;
    progress: number;
    start: Date;
  };
  children?: WbsTask[];
  // Advanced PowerProject features
  constraints?: {
    date?: Date;
    type: 'start-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on' | 'as-soon-as-possible' | 'as-late-as-possible';
  };
  customFields?: Record<string, any>;
  dependencies?: Array<{
    id: string;
    lag?: number;
    type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  }>;
  duration: number;
  end: Date;
  expanded: boolean;
  id: string;
  isCritical: boolean;
  level?: number;
  name: string;
  notes?: string;
  parentId: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  resources?: Array<{
    cost?: number;
    id: string;
    name: string;
    type: 'work' | 'material' | 'cost';
    units: number;
  }>;
  start: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  type: 'summary' | 'task' | 'milestone';
  wbsId: string;
}

interface Resource {
  availability: number;
  calendar?: {
    holidays: Date[];
    workingDays: number[];
    workingHours: { end: string, start: string; };
  };
  costPerUnit?: number;
  currentUtilization: number;
  id: string;
  maxUnits: number;
  name: string;
  type: 'work' | 'material' | 'cost';
}

interface CriticalPathAnalysis {
  criticalPathDuration: number;
  criticalTasks: string[];
  freeFloat: Record<string, number>;
  projectDuration: number;
  totalFloat: Record<string, number>;
}

const EnterpriseGanttChart: React.FC<EnterpriseGanttChartProps> = ({ project, onMarkChanged }) => {
  // State for hierarchical data
  const [wbsTasks, setWbsTasks] = useState<WbsTask[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [loading, setLoading] = useState(true);

  // Advanced PowerProject features state
  const [resources, setResources] = useState<Resource[]>([]);
  const [criticalPathAnalysis, setCriticalPathAnalysis] = useState<CriticalPathAnalysis | null>(null);
  const [baselineMode, setBaselineMode] = useState(false);
  const [showResourceAllocation, setShowResourceAllocation] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showActuals, setShowActuals] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);

  // Ribbon toolbar state
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // View controls state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Schedule controls state
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [levelResources, setLevelResources] = useState(false);
  const [optimizeSchedule, setOptimizeSchedule] = useState(false);
  
  // Data controls state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [astaSyncModalOpen, setAstaSyncModalOpen] = useState(false);
  
  // Analytics controls state
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    schedulePerformanceIndex: 0,
    costPerformanceIndex: 0,
    resourceUtilization: 0,
    criticalPathVariance: 0
  });

  useEffect(() => {
    loadWbsTasks();
    loadResources();
  }, [project]);

  const loadWbsTasks = async () => {
    try {
      setLoading(true);
      
      // Check if tasks were previously cleared
      const tasksCleared = sessionStorage.getItem('gantt_tasks_cleared');
      if (tasksCleared === 'true') {
        setWbsTasks([]);
        setLoading(false);
        return;
      }

      // Load tasks from demo data service
      const { demoDataService } = await import('../../services/demoDataService');
      const allTasks = await demoDataService.getGanttTasks();
      
      // Filter tasks for current project
      const projectTasks = allTasks.filter((task: any) => task.projectId === project.id);
      
      // Convert to hierarchical structure with advanced features
      let hierarchicalTasks = buildHierarchicalTasks(projectTasks);
      
      // If no tasks found, create sample data with PowerProject features
      if (hierarchicalTasks.length === 0) {
        const sampleTasks = createSamplePowerProjectTasks();
        hierarchicalTasks = buildHierarchicalTasks(sampleTasks);
      }
      
      setWbsTasks(hierarchicalTasks);
      
      // Set default expanded state
      const expanded = new Set(hierarchicalTasks.map(task => task.id));
      setExpandedTasks(expanded);
      
      // Perform critical path analysis
      performCriticalPathAnalysis(hierarchicalTasks);
      
    } catch (error) {
      console.error('Error loading WBS tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const { demoDataService } = await import('../../services/demoDataService');
      const projectResources = await demoDataService.getProjectResources(project.id);
      setResources(projectResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      // Create sample resources
      setResources(createSampleResources());
    }
  };

  const createSamplePowerProjectTasks = (): any[] => {
    return [
      {
        id: '1',
        name: 'Project Planning',
        wbsId: '1.0',
        parentId: null,
        type: 'summary',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15'),
        duration: 15,
        progress: 100,
        status: 'completed',
        priority: 'high',
        assignee: 'Project Manager',
        isCritical: true,
        expanded: true,
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
        children: []
      },
      {
        id: '2',
        name: 'Requirements Analysis',
        wbsId: '1.1',
        parentId: '1',
        type: 'task',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-05'),
        duration: 5,
        progress: 100,
        status: 'completed',
        priority: 'critical',
        assignee: 'Business Analyst',
        isCritical: true,
        expanded: false,
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
        children: []
      },
      {
        id: '3',
        name: 'Design Phase',
        wbsId: '1.2',
        parentId: '1',
        type: 'task',
        start: new Date('2024-01-06'),
        end: new Date('2024-01-15'),
        duration: 10,
        progress: 80,
        status: 'in-progress',
        priority: 'high',
        assignee: 'Designer',
        isCritical: true,
        expanded: false,
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
        children: []
      },
      {
        id: '4',
        name: 'Development Phase',
        wbsId: '2.0',
        parentId: null,
        type: 'summary',
        start: new Date('2024-01-16'),
        end: new Date('2024-03-15'),
        duration: 60,
        progress: 30,
        status: 'in-progress',
        priority: 'high',
        assignee: 'Development Team',
        isCritical: true,
        expanded: true,
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
        children: []
      }
    ];
  };

  const createSampleResources = (): Resource[] => {
    return [
      {
        id: 'res1',
        name: 'Project Manager',
        type: 'work',
        maxUnits: 1,
        costPerUnit: 100,
        calendar: {
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '17:00' },
          holidays: []
        },
        availability: 1,
        currentUtilization: 0.8
      },
      {
        id: 'res2',
        name: 'Business Analyst',
        type: 'work',
        maxUnits: 1,
        costPerUnit: 80,
        calendar: {
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '17:00' },
          holidays: []
        },
        availability: 1,
        currentUtilization: 0.6
      },
      {
        id: 'res3',
        name: 'UI/UX Designer',
        type: 'work',
        maxUnits: 1,
        costPerUnit: 90,
        calendar: {
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '17:00' },
          holidays: []
        },
        availability: 1,
        currentUtilization: 0.9
      },
      {
        id: 'res4',
        name: 'Senior Developer',
        type: 'work',
        maxUnits: 1,
        costPerUnit: 120,
        calendar: {
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '17:00' },
          holidays: []
        },
        availability: 1,
        currentUtilization: 0.7
      },
      {
        id: 'res5',
        name: 'Junior Developer',
        type: 'work',
        maxUnits: 1,
        costPerUnit: 80,
        calendar: {
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '17:00' },
          holidays: []
        },
        availability: 1,
        currentUtilization: 0.5
      }
    ];
  };

  const performCriticalPathAnalysis = useCallback((tasks: WbsTask[]) => {
    // Simplified critical path analysis
    const criticalTasks: string[] = [];
    const totalFloat: Record<string, number> = {};
    const freeFloat: Record<string, number> = {};
    
    // Find critical tasks (tasks with zero float)
    tasks.forEach(task => {
      if (task.isCritical) {
        criticalTasks.push(task.id);
        totalFloat[task.id] = 0;
        freeFloat[task.id] = 0;
      } else {
        // Calculate float (simplified)
        totalFloat[task.id] = Math.random() * 5; // Random float for demo
        freeFloat[task.id] = Math.random() * 3;
      }
    });
    
    const projectDuration = Math.max(...tasks.map(t => t.end.getTime()));
    const criticalPathDuration = projectDuration;
    
    setCriticalPathAnalysis({
      criticalTasks,
      totalFloat,
      freeFloat,
      projectDuration,
      criticalPathDuration
    });
  }, []);

  const buildHierarchicalTasks = (flatTasks: any[]): WbsTask[] => {
    const taskMap = new Map<string, WbsTask>();
    const rootTasks: WbsTask[] = [];

    // First pass: create all tasks
    flatTasks.forEach(task => {
      taskMap.set(task.id, {
        ...task,
        children: [],
        level: 0
      });
    });

    // Second pass: build hierarchy
    flatTasks.forEach(task => {
      const currentTask = taskMap.get(task.id);
      if (currentTask) {
        if (task.parentId && taskMap.has(task.parentId)) {
          const parentTask = taskMap.get(task.parentId);
          if (parentTask) {
            parentTask.children = parentTask.children || [];
            parentTask.children.push(currentTask);
            currentTask.level = (parentTask.level || 0) + 1;
          }
        } else {
          rootTasks.push(currentTask);
        }
      }
    });

    return rootTasks;
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getFlattenedTasks = (tasks: WbsTask[], level = 0): WbsTask[] => {
    let flattened: WbsTask[] = [];
    tasks.forEach(task => {
      task.level = level;
      flattened.push(task);
      if (task.children && task.children.length > 0 && expandedTasks.has(task.id)) {
        flattened = flattened.concat(getFlattenedTasks(task.children, level + 1));
      }
    });
    return flattened;
  };

  const convertToGanttTasks = (tasks: WbsTask[]): GanttTask[] => {
    return tasks.map(task => ({
      id: task.id,
      name: task.name,
      start: task.start,
      end: task.end,
      progress: task.progress,
      type: task.type === 'summary' ? 'project' : task.type === 'milestone' ? 'milestone' : 'task',
      hideChildren: !expandedTasks.has(task.id),
      styles: {
        backgroundColor: task.isCritical ? '#ef4444' : task.status === 'completed' ? '#10b981' : '#3b82f6',
        progressColor: task.isCritical ? '#dc2626' : '#059669',
        progressSelectedColor: task.isCritical ? '#b91c1c' : '#047857'
      }
    }));
  };

  const handleTaskChange = (task: GanttTask) => {
    setWbsTasks(prevTasks => {
      const updateTask = (tasks: WbsTask[]): WbsTask[] => {
        return tasks.map(t => {
          if (t.id === task.id) {
            return {
              ...t,
              start: task.start,
              end: task.end,
              progress: task.progress
            };
          }
          if (t.children) {
            return { ...t, children: updateTask(t.children) };
          }
          return t;
        });
      };
      return updateTask(prevTasks);
    });
  };

  // Advanced PowerProject features
  const autoScheduleProject = useCallback(() => {
    if (!autoSchedule) return;
    
    // Implement forward/backward pass scheduling
    console.log('Auto-scheduling project...');
    // This would implement CPM scheduling algorithm
  }, [autoSchedule]);

  const handleLevelResources = useCallback(() => {
    if (!levelResources) return;
    
    // Implement resource leveling
    console.log('Leveling resources...');
    // This would implement resource leveling algorithm
  }, [levelResources]);

  const handleOptimizeSchedule = useCallback(() => {
    if (!optimizeSchedule) return;
    
    // Implement schedule optimization
    console.log('Optimizing schedule...');
    // This would implement various optimization algorithms
  }, [optimizeSchedule]);

  const calculatePerformanceMetrics = useCallback(() => {
    const tasks = getFlattenedTasks(wbsTasks);
    
    // Calculate SPI (Schedule Performance Index)
    const plannedValue = tasks.reduce((sum, task) => sum + (task.progress / 100), 0);
    const earnedValue = tasks.reduce((sum, task) => sum + (task.actuals?.progress || 0) / 100, 0);
    const schedulePerformanceIndex = earnedValue / plannedValue || 0;
    
    // Calculate CPI (Cost Performance Index)
    const actualCost = tasks.reduce((sum, task) => sum + (task.actuals?.cost || 0), 0);
    const plannedCost = tasks.reduce((sum, task) => sum + (task.baseline?.progress || 0) * 100, 0);
    const costPerformanceIndex = plannedCost / actualCost || 0;
    
    // Calculate resource utilization
    const resourceUtilization = resources.reduce((sum, res) => sum + res.currentUtilization, 0) / resources.length || 0;
    
    // Calculate critical path variance
    const criticalPathVariance = criticalPathAnalysis ? 
      (criticalPathAnalysis.projectDuration - criticalPathAnalysis.criticalPathDuration) / criticalPathAnalysis.projectDuration : 0;
    
    setPerformanceMetrics({
      schedulePerformanceIndex,
      costPerformanceIndex,
      resourceUtilization,
      criticalPathVariance
    });
  }, [wbsTasks, resources, criticalPathAnalysis]);

  useEffect(() => {
    calculatePerformanceMetrics();
  }, [calculatePerformanceMetrics]);

  // UI Handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 25));
  const handleToggleFilters = () => setShowFilters(!showFilters);
  const handleToggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  const handleToggleCriticalPath = () => setShowCriticalPath(!showCriticalPath);
  const handleToggleDependencies = () => setShowDependencies(!showDependencies);
  const handleToggleConstraints = () => setShowConstraints(!showConstraints);
  const handleToggleResourceAllocation = () => setShowResourceAllocation(!showResourceAllocation);
  const handleToggleBaseline = () => setBaselineMode(!baselineMode);
  const handleToggleActuals = () => setShowActuals(!showActuals);

  const handleImport = () => setImportModalOpen(true);
  const handleExport = () => setExportModalOpen(true);
  const handleAstaSync = () => setAstaSyncModalOpen(true);
  const handleReports = () => setReportsModalOpen(true);
  const handleMobile = () => setMobileModalOpen(true);
  const handleAI = () => setAiModalOpen(true);

  const flattenedTasks = useMemo(() => getFlattenedTasks(wbsTasks), [wbsTasks, expandedTasks]);
  const ganttTasks = useMemo(() => convertToGanttTasks(flattenedTasks), [flattenedTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  return (
    <div className="enterprise-gantt-chart">
      {/* PowerProject-Style Ribbon Toolbar */}
      <div className="ribbon-toolbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Home Tab */}
        <div className="ribbon-tab active">
          <div className="ribbon-group">
            <button className="ribbon-button" onClick={handleImport}>
              <DocumentArrowUpIcon className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button className="ribbon-button" onClick={handleExport}>
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="ribbon-button" onClick={handleAstaSync}>
              <CloudArrowUpIcon className="w-4 h-4" />
              <span>Asta Sync</span>
            </button>
          </div>
          
          <div className="ribbon-group">
            <button className="ribbon-button" onClick={handleToggleCriticalPath}>
              <BoltIcon className="w-4 h-4" />
              <span>Critical Path</span>
            </button>
            <button className="ribbon-button" onClick={handleToggleDependencies}>
              <ArrowsUpDownIcon className="w-4 h-4" />
              <span>Dependencies</span>
            </button>
            <button className="ribbon-button" onClick={handleToggleConstraints}>
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Constraints</span>
            </button>
          </div>
          
          <div className="ribbon-group">
            <button className="ribbon-button" onClick={handleToggleResourceAllocation}>
              <UserGroupIcon className="w-4 h-4" />
              <span>Resources</span>
            </button>
            <button className="ribbon-button" onClick={handleToggleBaseline}>
              <ChartBarIcon className="w-4 h-4" />
              <span>Baseline</span>
            </button>
            <button className="ribbon-button" onClick={handleToggleActuals}>
              <CheckCircleIcon className="w-4 h-4" />
              <span>Actuals</span>
            </button>
          </div>
        </div>

        {/* Schedule Tab */}
        <div className="ribbon-tab">
          <div className="ribbon-group">
            <button className="ribbon-button" onClick={autoScheduleProject}>
              <ArrowPathIcon className="w-4 h-4" />
              <span>Auto Schedule</span>
            </button>
            <button className="ribbon-button" onClick={handleLevelResources}>
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>Level Resources</span>
            </button>
            <button className="ribbon-button" onClick={handleOptimizeSchedule}>
              <SparklesIcon className="w-4 h-4" />
              <span>Optimize</span>
            </button>
          </div>
        </div>

        {/* View Tab */}
        <div className="ribbon-tab">
          <div className="ribbon-group">
            <button className="ribbon-button" onClick={handleZoomIn}>
              <PlusIcon className="w-4 h-4" />
              <span>Zoom In</span>
            </button>
            <button className="ribbon-button" onClick={handleZoomOut}>
              <MinusIcon className="w-4 h-4" />
              <span>Zoom Out</span>
            </button>
            <button className="ribbon-button" onClick={handleToggleFilters}>
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Analytics Tab */}
        <div className="ribbon-tab">
          <div className="ribbon-group">
            <button className="ribbon-button" onClick={handleReports}>
              <ChartPieIcon className="w-4 h-4" />
              <span>Reports</span>
            </button>
            <button className="ribbon-button" onClick={handleMobile}>
              <DevicePhoneMobileIcon className="w-4 h-4" />
              <span>Mobile</span>
            </button>
            <button className="ribbon-button" onClick={handleAI}>
              <CpuChipIcon className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics Dashboard */}
      <div className="performance-dashboard bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="metric-label">Schedule Performance</div>
            <div className={`metric-value ${performanceMetrics.schedulePerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}>
              {(performanceMetrics.schedulePerformanceIndex * 100).toFixed(1)}%
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Cost Performance</div>
            <div className={`metric-value ${performanceMetrics.costPerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}>
              {(performanceMetrics.costPerformanceIndex * 100).toFixed(1)}%
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Resource Utilization</div>
            <div className="metric-value text-blue-600">
              {(performanceMetrics.resourceUtilization * 100).toFixed(1)}%
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Critical Path</div>
            <div className="metric-value text-purple-600">
              {criticalPathAnalysis?.criticalTasks.length || 0} tasks
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-container" style={{ height: '600px' }}>
        <div className="enterprise-gantt" style={{ height: '100%' }}>
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode}
            onDateChange={handleTaskChange}
            onProgressChange={handleTaskChange}
            onDoubleClick={(task) => console.log('Double clicked task:', task)}
            onSelect={(task, isSelected) => {
              if (isSelected) {
                setSelectedTasks(prev => [...prev, task.id]);
              } else {
                setSelectedTasks(prev => prev.filter(id => id !== task.id));
              }
            }}
            onExpanderClick={(task) => toggleTaskExpansion(task.id)}
            listCellWidth=""
            columnWidth={65}
            ganttHeight={600}
          />
        </div>
      </div>

      {/* Modals */}
      <ImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
      <AstaSyncModal isOpen={astaSyncModalOpen} onClose={() => setAstaSyncModalOpen(false)} />
      <ReportsModal isOpen={reportsModalOpen} onClose={() => setReportsModalOpen(false)} />
      <MobileModal isOpen={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
      <AIModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
};

export default EnterpriseGanttChart; 