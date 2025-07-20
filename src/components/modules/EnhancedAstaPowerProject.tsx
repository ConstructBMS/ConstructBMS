import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  BellIcon,
  UserCircleIcon,
  CogIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  LinkIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  FlagIcon,
  ScissorsIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

import AstaSidebar from './AstaSidebar';
import AstaHeader from './AstaHeader';
import AstaRibbon from './AstaRibbon';
import AdvancedAstaGantt from './AdvancedAstaGantt';
import type { 
  AdvancedGanttTask, 
  AdvancedGanttLink, 
  Resource, 
  ViewMode,
  CriticalPathAnalysis 
} from './AdvancedAstaGantt';
import AdvancedHomeTab from './ribbonTabs/AdvancedHomeTab';
import type {
  AdvancedTaskOperation,
  AdvancedScheduleOperation,
  AdvancedProjectOperation,
  AdvancedViewOperation,
  AdvancedFilterOperation,
  AdvancedSortOperation,
  AdvancedToolsOperation
} from './ribbonTabs/AdvancedHomeTab';
import { AutoSaveProvider } from '../../contexts/AutoSaveContext';
import AutoSaveStatus from './AutoSaveStatus';

// Enhanced interfaces for professional project management
export interface EnhancedProject {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'execution' | 'monitoring' | 'closing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  manager: string;
  client: string;
  budget: number;
  actualCost: number;
  progress: number;
  
  // Advanced features
  baseline?: {
    startDate: Date;
    endDate: Date;
    budget: number;
    tasks: AdvancedGanttTask[];
  };
  constraints: ProjectConstraint[];
  risks: ProjectRisk[];
  resources: Resource[];
  customFields: Record<string, any>;
}

export interface ProjectConstraint {
  id: string;
  type: 'start-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on' | 'as-soon-as-possible' | 'as-late-as-possible';
  date: Date;
  description: string;
  critical: boolean;
}

export interface ProjectRisk {
  id: string;
  name: string;
  description: string;
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'identified' | 'mitigated' | 'occurred' | 'closed';
}

export interface EnhancedViewMode extends ViewMode {
  showCriticalPath: boolean;
  showBaseline: boolean;
  showActuals: boolean;
  showConstraints: boolean;
  showDependencies: boolean;
  showResourceAllocation: boolean;
  showNotes: boolean;
  showCustomFields: boolean;
  showFloat: boolean;
  showSlack: boolean;
  showEarnedValue: boolean;
  showCostVariance: boolean;
  showScheduleVariance: boolean;
}

export interface EnhancedAstaPowerProjectProps {
  projectId: string;
  initialProject?: EnhancedProject;
  onProjectChange?: (project: EnhancedProject) => void;
  onViewModeChange?: (mode: string) => void;
}

const EnhancedAstaPowerProject: React.FC<EnhancedAstaPowerProjectProps> = ({
  projectId,
  initialProject,
  onProjectChange,
  onViewModeChange
}) => {
  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeProject, setActiveProject] = useState<EnhancedProject | null>(initialProject || null);
  const [viewMode, setViewMode] = useState<string>('gantt');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [userRole, setUserRole] = useState<'viewer' | 'scheduler' | 'project_manager' | 'admin'>('project_manager');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeRibbonTab, setActiveRibbonTab] = useState<string>('home');
  
  // Advanced Gantt state
  const [tasks, setTasks] = useState<AdvancedGanttTask[]>([]);
  const [links, setLinks] = useState<AdvancedGanttLink[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Enhanced view state
  const [enhancedViewMode, setEnhancedViewMode] = useState<EnhancedViewMode>({
    type: 'week',
    zoom: 100,
    showWeekends: true,
    showHolidays: true,
    workingTimeOnly: false,
    showCriticalPath: true,
    showBaseline: false,
    showActuals: false,
    showConstraints: false,
    showDependencies: true,
    showResourceAllocation: false,
    showNotes: false,
    showCustomFields: false,
    showFloat: false,
    showSlack: false,
    showEarnedValue: false,
    showCostVariance: false,
    showScheduleVariance: false
  });

  // Create a wrapper for view operations to handle type conversion
  const handleViewOperationWrapper = useCallback((operation: any) => {
    // Convert basic view operations to enhanced ones
    switch (operation.type) {
      case 'zoom-in':
        setEnhancedViewMode(prev => ({ ...prev, zoom: Math.min(prev.zoom + 25, 500) }));
        break;
      case 'zoom-out':
        setEnhancedViewMode(prev => ({ ...prev, zoom: Math.max(prev.zoom - 25, 25) }));
        break;
      case 'toggle-gridlines':
        // This is handled by the enhanced view mode
        break;
      case 'toggle-timeline-band':
        // This is handled by the enhanced view mode
        break;
      case 'toggle-task-links':
        setEnhancedViewMode(prev => ({ ...prev, showDependencies: !prev.showDependencies }));
        break;
      case 'toggle-float':
        setEnhancedViewMode(prev => ({ ...prev, showFloat: !prev.showFloat }));
        break;
      case 'reset-view':
        setEnhancedViewMode(prev => ({
          ...prev,
          zoom: 100,
          showGridlines: true,
          showTimelineBand: true,
          showTaskLinks: true,
          showFloat: false
        }));
        break;
      default:
        handleViewOperation(operation);
    }
  }, []);

  // Create a view state that matches the expected interface
  const viewStateForRibbon = useMemo(() => ({
    zoomLevel: enhancedViewMode.zoom,
    showGridlines: true, // Always show gridlines in enhanced mode
    showTimelineBand: true, // Always show timeline band in enhanced mode
    showTaskLinks: enhancedViewMode.showDependencies,
    showFloat: enhancedViewMode.showFloat
  }), [enhancedViewMode]);

  // Advanced features state
  const [criticalPathAnalysis, setCriticalPathAnalysis] = useState<CriticalPathAnalysis | null>(null);
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true);
  const [hasBaseline, setHasBaseline] = useState(false);
  const [hasActuals, setHasActuals] = useState(false);
  const [projectStatus, setProjectStatus] = useState<'planning' | 'execution' | 'monitoring' | 'closing'>('planning');
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    schedulePerformanceIndex: 1.0,
    costPerformanceIndex: 1.0,
    resourceUtilization: 0.75,
    criticalPathLength: 0,
    totalFloat: 0,
    projectHealth: 'green' as 'green' | 'yellow' | 'red'
  });

  // Load project data
  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject.id);
    }
  }, [activeProject]);

  const loadProjectData = async (projectId: string) => {
    setLoading(true);
    try {
      // Load tasks, links, resources, etc.
      // This would integrate with your existing services
      const demoTasks: AdvancedGanttTask[] = [
        {
          id: 'task-1',
          name: 'Project Planning',
          wbsId: '1.1',
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
          earlyStart: new Date('2024-01-01'),
          earlyFinish: new Date('2024-01-15'),
          lateStart: new Date('2024-01-01'),
          lateFinish: new Date('2024-01-15'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 120,
          cost: 12000,
          children: ['task-1-1', 'task-1-2']
        },
        {
          id: 'task-1-1',
          name: 'Requirements Analysis',
          wbsId: '1.1.1',
          parentId: 'task-1',
          type: 'task',
          start: new Date('2024-01-01'),
          end: new Date('2024-01-05'),
          duration: 5,
          progress: 100,
          status: 'completed',
          priority: 'high',
          assignee: 'Business Analyst',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-01-01'),
          earlyFinish: new Date('2024-01-05'),
          lateStart: new Date('2024-01-01'),
          lateFinish: new Date('2024-01-05'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 40,
          cost: 4000
        },
        {
          id: 'task-1-2',
          name: 'Design Phase',
          wbsId: '1.1.2',
          parentId: 'task-1',
          type: 'task',
          start: new Date('2024-01-06'),
          end: new Date('2024-01-15'),
          duration: 10,
          progress: 100,
          status: 'completed',
          priority: 'high',
          assignee: 'Designer',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-01-06'),
          earlyFinish: new Date('2024-01-15'),
          lateStart: new Date('2024-01-06'),
          lateFinish: new Date('2024-01-15'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 80,
          cost: 8000
        },
        {
          id: 'task-2',
          name: 'Development',
          wbsId: '1.2',
          parentId: null,
          type: 'summary',
          start: new Date('2024-01-16'),
          end: new Date('2024-03-15'),
          duration: 60,
          progress: 75,
          status: 'in-progress',
          priority: 'critical',
          assignee: 'Development Team',
          isCritical: true,
          expanded: true,
          earlyStart: new Date('2024-01-16'),
          earlyFinish: new Date('2024-03-15'),
          lateStart: new Date('2024-01-16'),
          lateFinish: new Date('2024-03-15'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 480,
          cost: 48000,
          children: ['task-2-1', 'task-2-2', 'task-2-3']
        },
        {
          id: 'task-2-1',
          name: 'Frontend Development',
          wbsId: '1.2.1',
          parentId: 'task-2',
          type: 'task',
          start: new Date('2024-01-16'),
          end: new Date('2024-02-15'),
          duration: 30,
          progress: 90,
          status: 'in-progress',
          priority: 'high',
          assignee: 'Frontend Developer',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-01-16'),
          earlyFinish: new Date('2024-02-15'),
          lateStart: new Date('2024-01-16'),
          lateFinish: new Date('2024-02-15'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 240,
          cost: 24000
        },
        {
          id: 'task-2-2',
          name: 'Backend Development',
          wbsId: '1.2.2',
          parentId: 'task-2',
          type: 'task',
          start: new Date('2024-01-16'),
          end: new Date('2024-02-28'),
          duration: 43,
          progress: 70,
          status: 'in-progress',
          priority: 'high',
          assignee: 'Backend Developer',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-01-16'),
          earlyFinish: new Date('2024-02-28'),
          lateStart: new Date('2024-01-16'),
          lateFinish: new Date('2024-02-28'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 344,
          cost: 34400
        },
        {
          id: 'task-2-3',
          name: 'Database Design',
          wbsId: '1.2.3',
          parentId: 'task-2',
          type: 'task',
          start: new Date('2024-01-16'),
          end: new Date('2024-01-31'),
          duration: 15,
          progress: 100,
          status: 'completed',
          priority: 'medium',
          assignee: 'Database Administrator',
          isCritical: false,
          expanded: false,
          earlyStart: new Date('2024-01-16'),
          earlyFinish: new Date('2024-01-31'),
          lateStart: new Date('2024-01-16'),
          lateFinish: new Date('2024-02-15'),
          totalFloat: 15,
          freeFloat: 15,
          criticalPath: false,
          work: 120,
          cost: 12000
        },
        {
          id: 'task-3',
          name: 'Testing',
          wbsId: '1.3',
          parentId: null,
          type: 'summary',
          start: new Date('2024-03-16'),
          end: new Date('2024-04-15'),
          duration: 30,
          progress: 0,
          status: 'not-started',
          priority: 'high',
          assignee: 'QA Team',
          isCritical: true,
          expanded: true,
          earlyStart: new Date('2024-03-16'),
          earlyFinish: new Date('2024-04-15'),
          lateStart: new Date('2024-03-16'),
          lateFinish: new Date('2024-04-15'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 240,
          cost: 24000,
          children: ['task-3-1', 'task-3-2']
        },
        {
          id: 'task-3-1',
          name: 'Unit Testing',
          wbsId: '1.3.1',
          parentId: 'task-3',
          type: 'task',
          start: new Date('2024-03-16'),
          end: new Date('2024-03-31'),
          duration: 15,
          progress: 0,
          status: 'not-started',
          priority: 'high',
          assignee: 'Developers',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-03-16'),
          earlyFinish: new Date('2024-03-31'),
          lateStart: new Date('2024-03-16'),
          lateFinish: new Date('2024-03-31'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 120,
          cost: 12000
        },
        {
          id: 'task-3-2',
          name: 'Integration Testing',
          wbsId: '1.3.2',
          parentId: 'task-3',
          type: 'task',
          start: new Date('2024-04-01'),
          end: new Date('2024-04-15'),
          duration: 15,
          progress: 0,
          status: 'not-started',
          priority: 'high',
          assignee: 'QA Engineers',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-04-01'),
          earlyFinish: new Date('2024-04-15'),
          lateStart: new Date('2024-04-01'),
          lateFinish: new Date('2024-04-15'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 120,
          cost: 12000
        },
        {
          id: 'task-4',
          name: 'Deployment',
          wbsId: '1.4',
          parentId: null,
          type: 'milestone',
          start: new Date('2024-04-16'),
          end: new Date('2024-04-16'),
          duration: 0,
          progress: 0,
          status: 'not-started',
          priority: 'critical',
          assignee: 'DevOps Team',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-04-16'),
          earlyFinish: new Date('2024-04-16'),
          lateStart: new Date('2024-04-16'),
          lateFinish: new Date('2024-04-16'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 8,
          cost: 800
        },
        {
          id: 'task-5',
          name: 'Commissioning',
          wbsId: '1.5',
          parentId: null,
          type: 'summary',
          start: new Date('2024-04-17'),
          end: new Date('2024-05-10'),
          duration: 24,
          progress: 0,
          status: 'not-started',
          priority: 'medium',
          assignee: 'Commissioning Team',
          isCritical: false,
          expanded: true,
          earlyStart: new Date('2024-04-17'),
          earlyFinish: new Date('2024-05-10'),
          lateStart: new Date('2024-04-17'),
          lateFinish: new Date('2024-05-10'),
          totalFloat: 5,
          freeFloat: 5,
          criticalPath: false,
          work: 160,
          cost: 16000,
          children: ['task-5-1', 'task-5-2']
        },
        {
          id: 'task-5-1',
          name: 'System Testing',
          wbsId: '1.5.1',
          parentId: 'task-5',
          type: 'task',
          start: new Date('2024-04-17'),
          end: new Date('2024-04-30'),
          duration: 14,
          progress: 0,
          status: 'not-started',
          priority: 'medium',
          assignee: 'QA Team',
          isCritical: false,
          expanded: false,
          earlyStart: new Date('2024-04-17'),
          earlyFinish: new Date('2024-04-30'),
          lateStart: new Date('2024-04-17'),
          lateFinish: new Date('2024-04-30'),
          totalFloat: 5,
          freeFloat: 5,
          criticalPath: false,
          work: 80,
          cost: 8000,
          baseline: {
            start: new Date('2024-04-15'),
            end: new Date('2024-04-28'),
            duration: 14,
            progress: 0
          },
          actuals: {
            start: new Date('2024-04-17'),
            progress: 0,
            cost: 0
          }
        },
        {
          id: 'task-5-2',
          name: 'Client Handover',
          wbsId: '1.5.2',
          parentId: 'task-5',
          type: 'milestone',
          start: new Date('2024-05-10'),
          end: new Date('2024-05-10'),
          duration: 0,
          progress: 0,
          status: 'not-started',
          priority: 'high',
          assignee: 'Project Manager',
          isCritical: true,
          expanded: false,
          earlyStart: new Date('2024-05-10'),
          earlyFinish: new Date('2024-05-10'),
          lateStart: new Date('2024-05-10'),
          lateFinish: new Date('2024-05-10'),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: true,
          work: 0,
          cost: 0,
          baseline: {
            start: new Date('2024-05-08'),
            end: new Date('2024-05-08'),
            duration: 0,
            progress: 0
          },
          actuals: {
            progress: 0,
            cost: 0
          }
        },
        // Add more tasks as needed for deep hierarchy and edge cases
      ];

      const demoLinks: AdvancedGanttLink[] = [
        {
          id: 'link-1',
          sourceTaskId: 'task-1-1',
          targetTaskId: 'task-1-2',
          type: 'finish-to-start',
          lag: 0,
          critical: true
        },
        {
          id: 'link-2',
          sourceTaskId: 'task-1-2',
          targetTaskId: 'task-2-1',
          type: 'finish-to-start',
          lag: 0,
          critical: true
        },
        {
          id: 'link-3',
          sourceTaskId: 'task-1-2',
          targetTaskId: 'task-2-2',
          type: 'finish-to-start',
          lag: 0,
          critical: true
        },
        {
          id: 'link-4',
          sourceTaskId: 'task-1-2',
          targetTaskId: 'task-2-3',
          type: 'finish-to-start',
          lag: 0,
          critical: false
        },
        {
          id: 'link-5',
          sourceTaskId: 'task-2-1',
          targetTaskId: 'task-3-1',
          type: 'finish-to-start',
          lag: 0,
          critical: true
        },
        {
          id: 'link-6',
          sourceTaskId: 'task-2-2',
          targetTaskId: 'task-3-1',
          type: 'finish-to-start',
          lag: 0,
          critical: true
        },
        {
          id: 'link-7',
          sourceTaskId: 'task-3-1',
          targetTaskId: 'task-3-2',
          type: 'finish-to-start',
          lag: 0,
          critical: true
        },
        {
          id: 'link-8',
          sourceTaskId: 'task-3-2',
          targetTaskId: 'task-4',
          type: 'finish-to-start',
          lag: 0,
          critical: true
        },
        { id: 'link-9', sourceTaskId: 'task-4', targetTaskId: 'task-5-1', type: 'finish-to-start', lag: 0, critical: false },
        { id: 'link-10', sourceTaskId: 'task-5-1', targetTaskId: 'task-5-2', type: 'finish-to-start', lag: 0, critical: true },
      ];

      const demoResources: Resource[] = [
        {
          id: 'resource-1',
          name: 'Project Manager',
          type: 'work',
          maxUnits: 100,
          costPerUnit: 100,
          calendar: {
            workingDays: [1, 2, 3, 4, 5],
            workingHours: { start: '09:00', end: '17:00' },
            holidays: [],
            exceptions: []
          },
          availability: [
            {
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              units: 100
            }
          ]
        },
        {
          id: 'resource-2',
          name: 'Frontend Developer',
          type: 'work',
          maxUnits: 100,
          costPerUnit: 80,
          calendar: {
            workingDays: [1, 2, 3, 4, 5],
            workingHours: { start: '09:00', end: '17:00' },
            holidays: [],
            exceptions: []
          },
          availability: [
            {
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              units: 100
            }
          ]
        },
        {
          id: 'resource-3',
          name: 'Backend Developer',
          type: 'work',
          maxUnits: 100,
          costPerUnit: 80,
          calendar: {
            workingDays: [1, 2, 3, 4, 5],
            workingHours: { start: '09:00', end: '17:00' },
            holidays: [],
            exceptions: []
          },
          availability: [
            {
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              units: 100
            }
          ]
        },
        {
          id: 'resource-4',
          name: 'Commissioning Engineer',
          type: 'work',
          maxUnits: 100,
          costPerUnit: 90,
          calendar: {
            workingDays: [1, 2, 3, 4, 5],
            workingHours: { start: '08:00', end: '16:00' },
            holidays: [],
            exceptions: []
          },
          availability: [
            {
              startDate: new Date('2024-04-17'),
              endDate: new Date('2024-05-10'),
              units: 100
            }
          ]
        }
      ];

      setTasks([...demoTasks]);
      setLinks([...demoLinks]);
      setResources([...demoResources]);
      
      // Calculate critical path
      const criticalTasks = demoTasks.filter(task => task.criticalPath);
      setCriticalPathAnalysis({
        criticalTasks: criticalTasks.map(t => t.id),
        totalFloat: {},
        freeFloat: {},
        projectDuration: 106, // days
        criticalPathDuration: 106,
        slackAnalysis: {}
      });

      // Update performance metrics
      setPerformanceMetrics({
        schedulePerformanceIndex: 1.0,
        costPerformanceIndex: 1.0,
        resourceUtilization: 0.85,
        criticalPathLength: 106,
        totalFloat: 15,
        projectHealth: 'green'
      });

    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Task operations
  const handleTaskOperation = useCallback((operation: AdvancedTaskOperation) => {
    console.log('Task operation:', operation);
    
    switch (operation.type) {
      case 'add-task':
        const newTask: AdvancedGanttTask = {
          id: `task-${Date.now()}`,
          name: 'New Task',
          wbsId: '1.1',
          parentId: selectedTaskId || null,
          type: 'task',
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          duration: 7,
          progress: 0,
          status: 'not-started',
          priority: 'medium',
          assignee: 'Unassigned',
          isCritical: false,
          expanded: false,
          earlyStart: new Date(),
          earlyFinish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lateStart: new Date(),
          lateFinish: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: false,
          work: 56,
          cost: 5600
        };
        setTasks(prev => [...prev, newTask]);
        setSelectedTaskId(newTask.id);
        break;
        
      case 'delete-task':
        if (selectedTaskId) {
          setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
          setLinks(prev => prev.filter(l => l.sourceTaskId !== selectedTaskId && l.targetTaskId !== selectedTaskId));
          setSelectedTaskId('');
        }
        break;
        
      case 'duplicate-task':
        if (selectedTaskId) {
          const taskToDuplicate = tasks.find(t => t.id === selectedTaskId);
          if (taskToDuplicate) {
            const duplicatedTask: AdvancedGanttTask = {
              ...taskToDuplicate,
              id: `task-${Date.now()}`,
              name: `${taskToDuplicate.name} (Copy)`,
              start: new Date(taskToDuplicate.start.getTime() + 7 * 24 * 60 * 60 * 1000),
              end: new Date(taskToDuplicate.end.getTime() + 7 * 24 * 60 * 60 * 1000),
              progress: 0,
              status: 'not-started'
            };
            setTasks(prev => [...prev, duplicatedTask]);
            setSelectedTaskId(duplicatedTask.id);
          }
        }
        break;
        
      case 'indent-task':
        if (selectedTaskId) {
          setTasks(prev => prev.map(t => {
            if (t.id === selectedTaskId) {
              // Find the previous sibling and make it the parent
              const currentIndex = prev.findIndex(task => task.id === selectedTaskId);
              const previousSibling = prev[currentIndex - 1];
              if (previousSibling && previousSibling.parentId === t.parentId) {
                return { ...t, parentId: previousSibling.id };
              }
            }
            return t;
          }));
        }
        break;
        
      case 'outdent-task':
        if (selectedTaskId) {
          setTasks(prev => prev.map(t => {
            if (t.id === selectedTaskId) {
              const parent = prev.find(p => p.id === t.parentId);
              return { ...t, parentId: parent?.parentId || null };
            }
            return t;
          }));
        }
        break;
        
      case 'add-milestone':
        const newMilestone: AdvancedGanttTask = {
          id: `milestone-${Date.now()}`,
          name: 'New Milestone',
          wbsId: '1.1',
          parentId: selectedTaskId || null,
          type: 'milestone',
          start: new Date(),
          end: new Date(),
          duration: 0,
          progress: 0,
          status: 'not-started',
          priority: 'high',
          assignee: 'Project Manager',
          isCritical: false,
          expanded: false,
          earlyStart: new Date(),
          earlyFinish: new Date(),
          lateStart: new Date(),
          lateFinish: new Date(),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: false,
          work: 0,
          cost: 0
        };
        setTasks(prev => [...prev, newMilestone]);
        setSelectedTaskId(newMilestone.id);
        break;
        
      case 'add-summary':
        const newSummaryTask: AdvancedGanttTask = {
          id: `summary-${Date.now()}`,
          name: 'New Summary Task',
          wbsId: '1.1',
          parentId: selectedTaskId || null,
          type: 'summary',
          start: new Date(),
          end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          duration: 14,
          progress: 0,
          status: 'not-started',
          priority: 'medium',
          assignee: 'Team Lead',
          isCritical: false,
          expanded: true,
          children: [],
          earlyStart: new Date(),
          earlyFinish: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          lateStart: new Date(),
          lateFinish: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          totalFloat: 0,
          freeFloat: 0,
          criticalPath: false,
          work: 112,
          cost: 11200
        };
        setTasks(prev => [...prev, newSummaryTask]);
        setSelectedTaskId(newSummaryTask.id);
        break;
        
      case 'link-tasks':
        // This would typically open a dialog to select tasks to link
        console.log('Link tasks operation - would open dialog');
        break;
        
      default:
        console.log('Unhandled task operation:', operation);
    }
  }, [selectedTaskId, tasks]);

  // Schedule operations
  const handleScheduleOperation = useCallback((operation: AdvancedScheduleOperation) => {
    console.log('Schedule operation:', operation);
    
    switch (operation.type) {
      case 'auto-schedule':
        setAutoScheduleEnabled(true);
        break;
      case 'manual-schedule':
        setAutoScheduleEnabled(false);
        break;
      case 'calculate-critical-path':
        // Critical path calculation logic
        break;
      case 'level-resources':
        // Resource leveling logic
        break;
      default:
        console.log('Unhandled schedule operation:', operation);
    }
  }, []);

  // Project operations
  const handleProjectOperation = useCallback((operation: AdvancedProjectOperation) => {
    console.log('Project operation:', operation);
    
    switch (operation.type) {
      case 'import-data':
        // Import data logic
        break;
      case 'export-data':
        // Export data logic
        break;
      case 'sync-asta':
        // Asta sync logic
        break;
      default:
        console.log('Unhandled project operation:', operation);
    }
  }, []);

  // View operations
  const handleViewOperation = useCallback((operation: AdvancedViewOperation) => {
    console.log('View operation:', operation);
    
    switch (operation.type) {
      case 'toggle-critical-path':
        setEnhancedViewMode(prev => ({ ...prev, showCriticalPath: !prev.showCriticalPath }));
        break;
      case 'toggle-baseline':
        setEnhancedViewMode(prev => ({ ...prev, showBaseline: !prev.showBaseline }));
        setHasBaseline(!hasBaseline);
        break;
      case 'toggle-actuals':
        setEnhancedViewMode(prev => ({ ...prev, showActuals: !prev.showActuals }));
        setHasActuals(!hasActuals);
        break;
      case 'toggle-dependencies':
        setEnhancedViewMode(prev => ({ ...prev, showDependencies: !prev.showDependencies }));
        break;
      default:
        console.log('Unhandled view operation:', operation);
    }
  }, [hasBaseline, hasActuals]);

  // Filter operations
  const handleFilterOperation = useCallback((operation: AdvancedFilterOperation) => {
    console.log('Filter operation:', operation);
    // Filter logic
  }, []);

  // Sort operations
  const handleSortOperation = useCallback((operation: AdvancedSortOperation) => {
    console.log('Sort operation:', operation);
    // Sort logic
  }, []);

  // Tools operations
  const handleToolsOperation = useCallback((operation: AdvancedToolsOperation) => {
    console.log('Tools operation:', operation);
    
    switch (operation.type) {
      case 'what-if-analysis':
        // What-if analysis logic
        break;
      case 'scenario-manager':
        // Scenario manager logic
        break;
      case 'risk-analysis':
        // Risk analysis logic
        break;
      case 'earned-value-analysis':
        // Earned value analysis logic
        break;
      case 'monte-carlo-simulation':
        // Monte Carlo simulation logic
        break;
      case 'ai-optimization':
        // AI optimization logic
        break;
      default:
        console.log('Unhandled tools operation:', operation);
    }
  }, []);

  // Task update handler
  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<AdvancedGanttTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  // Task selection handler
  const handleTaskSelect = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  // Sidebar navigation handler
  const handleSidebarNavigation = useCallback((itemId: string) => {
    console.log('Sidebar navigation:', itemId);
    setViewMode(itemId);
    onViewModeChange?.(itemId);
  }, [onViewModeChange]);

  // Ribbon tab change handler
  const handleRibbonTabChange = useCallback((tabId: string) => {
    setActiveRibbonTab(tabId);
  }, []);

  // Render different view modes
  const renderViewMode = () => {
    switch (viewMode) {
      case 'dashboard':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Tasks:</span>
                    <span className="font-semibold">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                    <span className="font-semibold text-green-600">{tasks.filter(t => t.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">In Progress:</span>
                    <span className="font-semibold text-blue-600">{tasks.filter(t => t.status === 'in-progress').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Critical Path:</span>
                    <span className="font-semibold text-red-600">{tasks.filter(t => t.isCritical).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SPI:</span>
                    <span className="font-semibold text-green-600">1.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CPI:</span>
                    <span className="font-semibold text-green-600">1.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Resource Utilization:</span>
                    <span className="font-semibold text-blue-600">85.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Critical Path Length:</span>
                    <span className="font-semibold text-red-600">106 days</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Task "Frontend Development" updated to 90% complete
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    New milestone "Deployment" added
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Resource allocation updated for "Backend Development"
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'timeline':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Timeline View</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Advanced timeline view with multiple bands and sophisticated filtering.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add Timeline Band
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Filter Tasks
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Export Timeline
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Timeline visualization will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'calendar':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Calendar View</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Professional calendar view with resource allocation and conflict detection.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Month View
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Week View
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Day View
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Calendar view will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'resources':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comprehensive resource allocation and management.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add Resource
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Resource Calendar
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Resource Leveling
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Resource management interface will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'costs':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comprehensive cost tracking with earned value analysis and forecasting.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Cost Analysis
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Earned Value
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Cost Forecasting
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Cost management interface will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'documents':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Document Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Document management and version control for project files.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Upload Document
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Create Folder
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Search Documents
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Document management interface will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'reports':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reports & Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Advanced reporting with customizable dashboards and real-time analytics.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Generate Report
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Custom Dashboard
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Export Data
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Reports and analytics interface will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'tasks':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Advanced task management with filtering, sorting, and bulk operations.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add Task
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Filter Tasks
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Bulk Edit
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Task management interface will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'tools':
        return (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Tools</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Advanced project management tools and utilities.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    What-if Analysis
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Risk Analysis
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Monte Carlo
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Project tools interface will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <AdvancedAstaGantt
            projectId={projectId}
            tasks={tasks}
            links={links}
            resources={resources}
            viewMode={{
              type: enhancedViewMode.type,
              zoom: enhancedViewMode.zoom,
              showWeekends: enhancedViewMode.showWeekends,
              showHolidays: enhancedViewMode.showHolidays,
              workingTimeOnly: enhancedViewMode.workingTimeOnly
            }}
            showCriticalPath={enhancedViewMode.showCriticalPath}
            showBaseline={enhancedViewMode.showBaseline}
            showActuals={enhancedViewMode.showActuals}
            showConstraints={enhancedViewMode.showConstraints}
            showDependencies={enhancedViewMode.showDependencies}
            showResourceAllocation={enhancedViewMode.showResourceAllocation}
            onTaskUpdate={handleTaskUpdate}
            onTaskSelect={handleTaskSelect}
            selectedTaskId={selectedTaskId}
            userRole={userRole}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  return (
    <AutoSaveProvider>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
        {/* Left Sidebar */}
        <AstaSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeProject={activeProject}
          userRole={userRole}
          onNavigation={handleSidebarNavigation}
          activeViewMode={viewMode}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
                      <AstaHeader
              activeProject={activeProject}
              autoSaveStatus={autoSaveStatus}
              userRole={userRole}
              onProjectChange={onProjectChange || (() => {})}
            />

          {/* Auto-Save Status Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <AutoSaveStatus className="text-sm" />
          </div>

          {/* Enhanced Ribbon */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <AstaRibbon
              activeTab={activeRibbonTab}
              userRole={userRole}
                              projectId={activeProject?.id || projectId}
              onViewOperation={handleViewOperationWrapper}
              currentViewState={viewStateForRibbon}
              onViewStateChange={(newState) => {
                setEnhancedViewMode(prev => ({
                  ...prev,
                  zoom: newState.zoomLevel || prev.zoom,
                  showDependencies: newState.showTaskLinks ?? prev.showDependencies,
                  showFloat: newState.showFloat ?? prev.showFloat
                }));
              }}
              onTaskOperation={handleTaskOperation}
              onAllocationOperation={() => {}}
              selectedTasks={selectedTaskId ? [selectedTaskId] : []}
              onTabChange={handleRibbonTabChange}
            />
          </div>

          {/* Performance Metrics Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">SPI:</span>
                  <span className={`font-medium ${performanceMetrics.schedulePerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {performanceMetrics.schedulePerformanceIndex.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">CPI:</span>
                  <span className={`font-medium ${performanceMetrics.costPerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {performanceMetrics.costPerformanceIndex.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">Resource Utilization:</span>
                  <span className="font-medium text-blue-600">
                    {(performanceMetrics.resourceUtilization * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">Critical Path:</span>
                  <span className="font-medium text-red-600">
                    {performanceMetrics.criticalPathLength} days
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Project Health:</span>
                <div className={`w-3 h-3 rounded-full ${
                  performanceMetrics.projectHealth === 'green' ? 'bg-green-500' :
                  performanceMetrics.projectHealth === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium capitalize">{performanceMetrics.projectHealth}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {renderViewMode()}
          </div>
        </div>
      </div>
    </AutoSaveProvider>
  );
};

export default EnhancedAstaPowerProject; 