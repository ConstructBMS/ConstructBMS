import React, { useState, useEffect } from 'react';
import LayoutSection from './LayoutSection';
import FiltersSection from './FiltersSection';
import FloatSlackSection from './FloatSlackSection';
import ViewsSection from './ViewsSection';
import TimelineDisplaySection from './TimelineDisplaySection';
import GroupingCollapseSection from './GroupingCollapseSection';
import BarLabelsSection from './BarLabelsSection';
import ResetLayoutModal from './ResetLayoutModal';
import ManageFiltersModal from './ManageFiltersModal';
import SaveViewModal from './SaveViewModal';
import ManageViewsModal from './ManageViewsModal';
import ConfigureBarLabelsModal from './ConfigureBarLabelsModal';
import ResetBarLabelsModal from './ResetBarLabelsModal';
import type { LayoutConfig } from '../../../services/layoutService';
import type { Filter } from './FilterDropdown';
import type { FloatConfig } from '../../../services/floatService';
import type { View, ViewConfig } from '../../../services/viewService';
import type { TimelineConfig, Task as TimelineTask } from '../../../services/timelineDisplayService';
import type { GroupingConfig, Task as GroupingTask } from '../../../services/groupingService';
import type { BarLabelConfig, BarLabelPreset } from '../../../services/barLabelService';
import { LayoutService } from '../../../services/layoutService';
import { filterService } from '../../../services/filterService';
import { FloatService } from '../../../services/floatService';
import { ViewService } from '../../../services/viewService';
import { TimelineDisplayService } from '../../../services/timelineDisplayService';
import { GroupingService } from '../../../services/groupingService';
import { BarLabelService } from '../../../services/barLabelService';
import { ImportExportService } from '../../../services/importExportService';

interface ViewTabProps {
  activeRibbonTab: string;
  canEdit: boolean;
  onTaskOperation: (operation: any) => void;
  selectedTasks: string[];
  userRole: string;
}

const ViewTab: React.FC<ViewTabProps> = ({
  canEdit,
  onTaskOperation,
  selectedTasks,
  userRole,
  activeRibbonTab
}) => {
  // Layout state
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    splitView: true,
    fullscreen: false,
    paneSizes: {
      taskList: 40,
      timeline: 60
    },
    collapsedSections: [],
    scrollPositions: {
      taskList: { x: 0, y: 0 },
      timeline: { x: 0, y: 0 }
    },
    zoomLevel: 1
  });

  // Filters state
  const [filters, setFilters] = useState<Filter[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);

  // Float/Slack state
  const [floatConfig, setFloatConfig] = useState<FloatConfig>({
    showTotalFloat: false,
    showFreeFloat: false,
    highlightNegativeFloat: false
  });

  // Views state
  const [views, setViews] = useState<View[]>([]);
  const [activeView, setActiveView] = useState<View | null>(null);
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewConfig>({
    filters: [],
    visibleFields: ['name', 'startDate', 'finishDate', 'duration', 'percentComplete'],
    zoomLevel: 'week',
    timelineRange: { start: new Date(), end: new Date() },
    floatOptions: { total: false, free: false, highlightNegative: false }
  });

  // Timeline Display state
  const [timelineConfig, setTimelineConfig] = useState<TimelineConfig>({
    zoomLevel: 'week',
    scrollPosition: { x: 0, y: 0 },
    visibleRange: { start: new Date(), end: new Date() }
  });
  const [demoTasks, setDemoTasks] = useState<TimelineTask[]>([
    {
      id: '1',
      name: 'Project Setup',
      startDate: '2024-01-01',
      finishDate: '2024-01-05',
      duration: 5,
      percentComplete: 100,
      isVisible: true
    },
    {
      id: '2',
      name: 'Design Phase',
      startDate: '2024-01-06',
      finishDate: '2024-01-20',
      duration: 15,
      percentComplete: 75,
      isVisible: true
    },
    {
      id: '3',
      name: 'Construction',
      startDate: '2024-01-21',
      finishDate: '2024-02-20',
      duration: 30,
      percentComplete: 25,
      isVisible: true
    },
    {
      id: '4',
      name: 'Testing',
      startDate: '2024-02-21',
      finishDate: '2024-03-05',
      duration: 13,
      percentComplete: 0,
      isVisible: true
    }
  ]);

  // Grouping & Collapse state
  const [groupingConfig, setGroupingConfig] = useState<GroupingConfig>({
    collapsedSummaries: {},
    summariesCollapsed: false
  });
  const [groupingTasks, setGroupingTasks] = useState<GroupingTask[]>([
    {
      id: 'summary-1',
      name: 'Phase 1: Planning',
      isSummary: true,
      children: ['task-1', 'task-2'],
      isVisible: true
    },
    {
      id: 'task-1',
      name: 'Project Setup',
      isSummary: false,
      parentId: 'summary-1',
      isVisible: true
    },
    {
      id: 'task-2',
      name: 'Requirements Analysis',
      isSummary: false,
      parentId: 'summary-1',
      isVisible: true
    },
    {
      id: 'summary-2',
      name: 'Phase 2: Development',
      isSummary: true,
      children: ['task-3', 'task-4'],
      isVisible: true
    },
    {
      id: 'task-3',
      name: 'Design Implementation',
      isSummary: false,
      parentId: 'summary-2',
      isVisible: true
    },
    {
      id: 'task-4',
      name: 'Code Development',
      isSummary: false,
      parentId: 'summary-2',
      isVisible: true
    },
    {
      id: 'summary-3',
      name: 'Phase 3: Testing',
      isSummary: true,
      children: ['task-5'],
      isVisible: true
    },
    {
      id: 'task-5',
      name: 'System Testing',
      isSummary: false,
      parentId: 'summary-3',
      isVisible: true
    }
  ]);

  // Bar Labels state
  const [barLabelConfig, setBarLabelConfig] = useState<BarLabelConfig>({
    top: 'taskId',
    center: 'taskName',
    bottom: 'none'
  });
  const [barLabelPresets, setBarLabelPresets] = useState<BarLabelPreset[]>([]);
  const [activeBarLabelPreset, setActiveBarLabelPreset] = useState<BarLabelPreset | null>(null);

  // Modal states
  const [isResetLayoutModalOpen, setIsResetLayoutModalOpen] = useState(false);
  const [isManageFiltersModalOpen, setIsManageFiltersModalOpen] = useState(false);
  const [isSaveViewModalOpen, setIsSaveViewModalOpen] = useState(false);
  const [isManageViewsModalOpen, setIsManageViewsModalOpen] = useState(false);
  const [isConfigureBarLabelsModalOpen, setIsConfigureBarLabelsModalOpen] = useState(false);
  const [isResetBarLabelsModalOpen, setIsResetBarLabelsModalOpen] = useState(false);

  // Loading states
  const [layoutLoading, setLayoutLoading] = useState({
    split: false,
    reset: false,
    fullscreen: false
  });
  const [filtersLoading, setFiltersLoading] = useState({
    apply: false,
    manage: false,
    clear: false
  });
  const [floatLoading, setFloatLoading] = useState({
    total: false,
    free: false,
    negative: false
  });
  const [viewsLoading, setViewsLoading] = useState({
    apply: false,
    save: false,
    manage: false
  });
  const [timelineLoading, setTimelineLoading] = useState({
    zoomIn: false,
    zoomOut: false,
    fitToView: false,
    scrollToToday: false
  });
  const [groupingLoading, setGroupingLoading] = useState({
    expand: false,
    collapse: false,
    toggle: false
  });
  const [barLabelLoading, setBarLabelLoading] = useState({
    configure: false,
    preset: false,
    reset: false
  });

  // Load layout configuration on mount
  useEffect(() => {
    const loadLayoutConfig = async () => {
      try {
        // Load layout configuration
        const result = await LayoutService.getLayoutConfig('demo');
        
        if (result.success && result.data) {
          setLayoutConfig(result.data);
        }

        // Load filters
        const filtersResult = await filterService.getFilters('demo');
        if (filtersResult.success && filtersResult.data) {
          setFilters(filtersResult.data);
        }

        // Load active filter
        const activeFilterResult = await filterService.getActiveFilter('demo');
        setActiveFilter(activeFilterResult);

        // Load float configuration
        const floatConfigResult = await FloatService.getFloatConfig('demo');
        setFloatConfig(floatConfigResult);

        // Load views
        const viewsResult = await ViewService.getViews('demo');
        setViews(viewsResult);

        // Load active view
        const activeViewResult = await ViewService.getActiveView('demo');
        setActiveView(activeViewResult);

        // Load current view configuration
        const currentConfigResult = await ViewService.getCurrentViewConfig('demo');
        setCurrentViewConfig(currentConfigResult);

        // Load timeline configuration
        const timelineConfigResult = await TimelineDisplayService.getTimelineConfig('demo');
        setTimelineConfig(timelineConfigResult);

        // Load grouping configuration
        const groupingConfigResult = await GroupingService.getGroupingConfig('demo');
        setGroupingConfig(groupingConfigResult);

        // Load bar label configuration
        const barLabelConfigResult = await BarLabelService.getBarLabelConfig('demo');
        setBarLabelConfig(barLabelConfigResult);

        // Load bar label presets
        const barLabelPresetsResult = await BarLabelService.getBarLabelPresets('demo');
        setBarLabelPresets(barLabelPresetsResult);

        // Get active preset
        const activePresetResult = await BarLabelService.getActivePreset(barLabelConfigResult, 'demo');
        setActiveBarLabelPreset(activePresetResult);
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    };

    loadLayoutConfig();
  }, []);

  // Apply layout changes to UI
  useEffect(() => {
    // Apply split view state
    if (layoutConfig.splitView) {
      document.body.classList.add('split-view-active');
    } else {
      document.body.classList.remove('split-view-active');
    }

    // Apply fullscreen state
    if (layoutConfig.fullscreen) {
      document.body.classList.add('fullscreen-mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
    }

    // Apply pane sizes
    const taskListPane = document.querySelector('.task-list-pane') as HTMLElement;
    const timelinePane = document.querySelector('.timeline-pane') as HTMLElement;
    
    if (taskListPane && timelinePane) {
      taskListPane.style.width = `${layoutConfig.paneSizes.taskList}%`;
      timelinePane.style.width = `${layoutConfig.paneSizes.timeline}%`;
    }

    // Apply zoom level
    const timelineContainer = document.querySelector('.timeline-container') as HTMLElement;
    if (timelineContainer) {
      timelineContainer.style.transform = `scale(${layoutConfig.zoomLevel})`;
    }
  }, [layoutConfig]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 or Ctrl + Shift + F for fullscreen
      if (event.key === 'F11' || (event.ctrlKey && event.shiftKey && event.key === 'F')) {
        event.preventDefault();
        handleToggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Layout handlers
  const handleToggleSplit = async () => {
    setLayoutLoading(prev => ({ ...prev, split: true }));
    try {
      const result = await LayoutService.toggleSplitView('demo');
      
      if (result.success && result.data) {
        setLayoutConfig(result.data);
        
        // Log activity
        await LayoutService.logLayoutActivity('toggle_split', {
          splitView: result.data.splitView
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'toggle_split_view', 
            splitView: result.data.splitView 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to toggle split view:', error);
    } finally {
      setLayoutLoading(prev => ({ ...prev, split: false }));
    }
  };

  const handleResetLayout = () => {
    setIsResetLayoutModalOpen(true);
  };

  const handleConfirmResetLayout = async () => {
    setLayoutLoading(prev => ({ ...prev, reset: true }));
    try {
      const result = await LayoutService.resetLayout('demo');
      
      if (result.success && result.data) {
        setLayoutConfig(result.data);
        
        // Log activity
        await LayoutService.logLayoutActivity('reset_layout', {
          resetTo: 'defaults'
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'reset_layout', 
            resetTo: 'defaults' 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to reset layout:', error);
    } finally {
      setLayoutLoading(prev => ({ ...prev, reset: false }));
    }
  };

  const handleToggleFullscreen = async () => {
    setLayoutLoading(prev => ({ ...prev, fullscreen: true }));
    try {
      const result = await LayoutService.toggleFullscreen('demo');
      
      if (result.success && result.data) {
        setLayoutConfig(result.data);
        
        // Log activity
        await LayoutService.logLayoutActivity('toggle_fullscreen', {
          fullscreen: result.data.fullscreen
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'toggle_fullscreen', 
            fullscreen: result.data.fullscreen 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    } finally {
      setLayoutLoading(prev => ({ ...prev, fullscreen: false }));
    }
  };

  // Filter handlers
  const handleApplyFilter = async (filter: Filter) => {
    setFiltersLoading(prev => ({ ...prev, apply: true }));
    try {
      // Get current tasks (this would come from props in a real app)
      const currentTasks = [
        { id: '1', name: 'Task 1', startDate: '2024-01-01', percentComplete: 50, isCritical: true },
        { id: '2', name: 'Task 2', startDate: '2024-01-05', percentComplete: 0, isCritical: false },
        { id: '3', name: 'Task 3', startDate: '2024-01-10', percentComplete: 100, isCritical: true }
      ];

      const result = await filterService.applyFilter(filter, currentTasks, 'demo');
      
      if (result.success) {
        setActiveFilter(filter);
        setFilteredTasks(result.filteredTasks);
        
        // Log activity
        await filterService.logFilterActivity('apply', {
          filterName: filter.name,
          filteredCount: result.filteredCount,
          totalTasks: result.totalTasks
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'apply_filter', 
            filterName: filter.name,
            filteredCount: result.filteredCount
          } 
        });
      }
    } catch (error) {
      console.error('Failed to apply filter:', error);
    } finally {
      setFiltersLoading(prev => ({ ...prev, apply: false }));
    }
  };

  const handleManageFilters = () => {
    setIsManageFiltersModalOpen(true);
  };

  const handleSaveFilter = async (filter: Omit<Filter, 'id' | 'createdAt'>) => {
    try {
      const result = await filterService.saveFilter(filter, 'demo');
      
      if (result.success && result.data) {
        setFilters(result.data);
        
        // Log activity
        await filterService.logFilterActivity('create', {
          filterName: filter.name,
          rulesCount: filter.rules.length
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'create_filter', 
            filterName: filter.name
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const handleUpdateFilter = async (filter: Filter) => {
    try {
      const result = await filterService.updateFilter(filter, 'demo');
      
      if (result.success && result.data) {
        setFilters(result.data);
        
        // Update active filter if it's the one being edited
        if (activeFilter?.id === filter.id) {
          setActiveFilter(filter);
        }
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'update_filter', 
            filterName: filter.name
          } 
        });
      }
    } catch (error) {
      console.error('Failed to update filter:', error);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    try {
      const result = await filterService.deleteFilter(filterId, 'demo');
      
      if (result.success && result.data) {
        setFilters(result.data);
        
        // Clear active filter if it's the one being deleted
        if (activeFilter?.id === filterId) {
          setActiveFilter(null);
          setFilteredTasks([]);
        }
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'delete_filter', 
            filterId
          } 
        });
      }
    } catch (error) {
      console.error('Failed to delete filter:', error);
    }
  };

  const handleClearFilter = async () => {
    setFiltersLoading(prev => ({ ...prev, clear: true }));
    try {
      const result = await filterService.clearFilter('demo');
      
      if (result.success) {
        setActiveFilter(null);
        setFilteredTasks([]);
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'clear_filter'
          } 
        });
      }
    } catch (error) {
      console.error('Failed to clear filter:', error);
    } finally {
      setFiltersLoading(prev => ({ ...prev, clear: false }));
    }
  };

  const handleCreateFilter = () => {
    setIsManageFiltersModalOpen(true);
  };

  // Float/Slack handlers
  const handleToggleTotalFloat = async () => {
    setFloatLoading(prev => ({ ...prev, total: true }));
    try {
      const result = await FloatService.toggleTotalFloat('demo');
      
      if (result.success && result.data) {
        setFloatConfig(result.data);
        
        // Log activity
        await FloatService.logFloatActivity('toggle_total_float', {
          showTotalFloat: result.data.showTotalFloat
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'toggle_total_float', 
            showTotalFloat: result.data.showTotalFloat 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to toggle total float:', error);
    } finally {
      setFloatLoading(prev => ({ ...prev, total: false }));
    }
  };

  const handleToggleFreeFloat = async () => {
    setFloatLoading(prev => ({ ...prev, free: true }));
    try {
      const result = await FloatService.toggleFreeFloat('demo');
      
      if (result.success && result.data) {
        setFloatConfig(result.data);
        
        // Log activity
        await FloatService.logFloatActivity('toggle_free_float', {
          showFreeFloat: result.data.showFreeFloat
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'toggle_free_float', 
            showFreeFloat: result.data.showFreeFloat 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to toggle free float:', error);
    } finally {
      setFloatLoading(prev => ({ ...prev, free: false }));
    }
  };

  const handleToggleNegativeFloat = async () => {
    setFloatLoading(prev => ({ ...prev, negative: true }));
    try {
      const result = await FloatService.toggleNegativeFloat('demo');
      
      if (result.success && result.data) {
        setFloatConfig(result.data);
        
        // Log activity
        await FloatService.logFloatActivity('toggle_negative_float', {
          highlightNegativeFloat: result.data.highlightNegativeFloat
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'toggle_negative_float', 
            highlightNegativeFloat: result.data.highlightNegativeFloat 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to toggle negative float:', error);
    } finally {
      setFloatLoading(prev => ({ ...prev, negative: false }));
    }
  };

  // Views handlers
  const handleApplyView = async (view: View) => {
    setViewsLoading(prev => ({ ...prev, apply: true }));
    try {
      const result = await ViewService.setActiveView(view.id, 'demo');
      
      if (result.success && result.data) {
        setActiveView(result.data);
        
        // Apply view configuration
        await ViewService.applyViewConfig(view.config, 'demo');
        
        // Update current config
        setCurrentViewConfig(view.config);
        
        // Log activity
        await ViewService.logViewActivity('apply_view', {
          viewName: view.name,
          viewId: view.id
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'apply_view', 
            viewName: view.name,
            viewId: view.id
          } 
        });
      }
    } catch (error) {
      console.error('Failed to apply view:', error);
    } finally {
      setViewsLoading(prev => ({ ...prev, apply: false }));
    }
  };

  const handleSaveView = () => {
    setIsSaveViewModalOpen(true);
  };

  const handleSaveViewData = async (viewName: string, isShared: boolean, config: ViewConfig) => {
    setViewsLoading(prev => ({ ...prev, save: true }));
    try {
      const result = await ViewService.saveView(viewName, config, isShared, 'demo', 'demo-user');
      
      if (result.success && result.data) {
        // Refresh views list
        const updatedViews = await ViewService.getViews('demo');
        setViews(updatedViews);
        
        // Log activity
        await ViewService.logViewActivity('save_view', {
          viewName,
          isShared,
          viewId: result.data.id
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'save_view', 
            viewName,
            viewId: result.data.id
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save view:', error);
    } finally {
      setViewsLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleManageViews = () => {
    setIsManageViewsModalOpen(true);
  };

  const handleUpdateView = async (view: View) => {
    try {
      const result = await ViewService.updateView(view, 'demo');
      
      if (result.success) {
        // Refresh views list
        const updatedViews = await ViewService.getViews('demo');
        setViews(updatedViews);
        
        // Update active view if it was the one updated
        if (activeView?.id === view.id) {
          setActiveView(view);
        }
        
        // Log activity
        await ViewService.logViewActivity('update_view', {
          viewName: view.name,
          viewId: view.id
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'update_view', 
            viewName: view.name,
            viewId: view.id
          } 
        });
      }
    } catch (error) {
      console.error('Failed to update view:', error);
    }
  };

  const handleDeleteView = async (viewId: string) => {
    try {
      const result = await ViewService.deleteView(viewId, 'demo');
      
      if (result.success) {
        // Refresh views list
        const updatedViews = await ViewService.getViews('demo');
        setViews(updatedViews);
        
        // Clear active view if it was the one deleted
        if (activeView?.id === viewId) {
          setActiveView(null);
        }
        
        // Log activity
        await ViewService.logViewActivity('delete_view', {
          viewId
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'delete_view', 
            viewId
          } 
        });
      }
    } catch (error) {
      console.error('Failed to delete view:', error);
    }
  };

  const handleSetDefault = async (viewId: string) => {
    try {
      const result = await ViewService.setDefaultView(viewId, 'demo');
      
      if (result.success) {
        // Refresh views list
        const updatedViews = await ViewService.getViews('demo');
        setViews(updatedViews);
        
        // Log activity
        await ViewService.logViewActivity('set_default_view', {
          viewId
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'set_default_view', 
            viewId
          } 
        });
      }
    } catch (error) {
      console.error('Failed to set default view:', error);
    }
  };

  // Timeline Display handlers
  const handleZoomIn = async () => {
    setTimelineLoading(prev => ({ ...prev, zoomIn: true }));
    try {
      const result = await TimelineDisplayService.zoomIn('demo');
      
      if (result.success && result.data) {
        setTimelineConfig(result.data);
        
        // Log activity
        await TimelineDisplayService.logTimelineActivity('zoom_in', {
          zoomLevel: result.data.zoomLevel
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'zoom_in', 
            zoomLevel: result.data.zoomLevel
          } 
        });
      }
    } catch (error) {
      console.error('Failed to zoom in:', error);
    } finally {
      setTimelineLoading(prev => ({ ...prev, zoomIn: false }));
    }
  };

  const handleZoomOut = async () => {
    setTimelineLoading(prev => ({ ...prev, zoomOut: true }));
    try {
      const result = await TimelineDisplayService.zoomOut('demo');
      
      if (result.success && result.data) {
        setTimelineConfig(result.data);
        
        // Log activity
        await TimelineDisplayService.logTimelineActivity('zoom_out', {
          zoomLevel: result.data.zoomLevel
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'zoom_out', 
            zoomLevel: result.data.zoomLevel
          } 
        });
      }
    } catch (error) {
      console.error('Failed to zoom out:', error);
    } finally {
      setTimelineLoading(prev => ({ ...prev, zoomOut: false }));
    }
  };

  const handleFitToView = async () => {
    setTimelineLoading(prev => ({ ...prev, fitToView: true }));
    try {
      const result = await TimelineDisplayService.fitToView(demoTasks, 'demo');
      
      if (result.success && result.data) {
        setTimelineConfig(result.data);
        
        // Log activity
        await TimelineDisplayService.logTimelineActivity('fit_to_view', {
          taskCount: demoTasks.length,
          zoomLevel: result.data.zoomLevel
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'fit_to_view', 
            taskCount: demoTasks.length
          } 
        });
      }
    } catch (error) {
      console.error('Failed to fit to view:', error);
    } finally {
      setTimelineLoading(prev => ({ ...prev, fitToView: false }));
    }
  };

  const handleScrollToToday = async () => {
    setTimelineLoading(prev => ({ ...prev, scrollToToday: true }));
    try {
      const result = await TimelineDisplayService.scrollToToday('demo');
      
      if (result.success && result.data) {
        setTimelineConfig(result.data);
        
        // Log activity
        await TimelineDisplayService.logTimelineActivity('scroll_to_today', {
          today: new Date().toISOString()
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'scroll_to_today'
          } 
        });
      }
    } catch (error) {
      console.error('Failed to scroll to today:', error);
    } finally {
      setTimelineLoading(prev => ({ ...prev, scrollToToday: false }));
    }
  };

  // Grouping & Collapse handlers
  const handleExpandSelected = async () => {
    setGroupingLoading(prev => ({ ...prev, expand: true }));
    try {
      // Get selected summary tasks (in a real app, this would come from selection state)
      const selectedSummaryTaskIds = groupingTasks
        .filter(task => task.isSummary && task.isVisible)
        .slice(0, 2) // Demo: expand first 2 summary tasks
        .map(task => task.id);

      if (selectedSummaryTaskIds.length === 0) {
        console.log('No summary tasks selected for expansion');
        return;
      }

      const result = await GroupingService.expandSelected(selectedSummaryTaskIds, 'demo');
      
      if (result.success && result.data) {
        setGroupingConfig(result.data);
        
        // Log activity
        await GroupingService.logGroupingActivity('expand_selected', {
          taskIds: selectedSummaryTaskIds,
          expandedCount: selectedSummaryTaskIds.length
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'expand_selected', 
            taskIds: selectedSummaryTaskIds
          } 
        });
      }
    } catch (error) {
      console.error('Failed to expand selected:', error);
    } finally {
      setGroupingLoading(prev => ({ ...prev, expand: false }));
    }
  };

  const handleCollapseSelected = async () => {
    setGroupingLoading(prev => ({ ...prev, collapse: true }));
    try {
      // Get selected summary tasks (in a real app, this would come from selection state)
      const selectedSummaryTaskIds = groupingTasks
        .filter(task => task.isSummary && task.isVisible)
        .slice(0, 2) // Demo: collapse first 2 summary tasks
        .map(task => task.id);

      if (selectedSummaryTaskIds.length === 0) {
        console.log('No summary tasks selected for collapse');
        return;
      }

      const result = await GroupingService.collapseSelected(selectedSummaryTaskIds, 'demo');
      
      if (result.success && result.data) {
        setGroupingConfig(result.data);
        
        // Log activity
        await GroupingService.logGroupingActivity('collapse_selected', {
          taskIds: selectedSummaryTaskIds,
          collapsedCount: selectedSummaryTaskIds.length
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'collapse_selected', 
            taskIds: selectedSummaryTaskIds
          } 
        });
      }
    } catch (error) {
      console.error('Failed to collapse selected:', error);
    } finally {
      setGroupingLoading(prev => ({ ...prev, collapse: false }));
    }
  };

  const handleToggleAll = async () => {
    setGroupingLoading(prev => ({ ...prev, toggle: true }));
    try {
      const result = await GroupingService.toggleAllSummaries(undefined, 'demo');
      
      if (result.success && result.data) {
        setGroupingConfig(result.data);
        
        // Log activity
        await GroupingService.logGroupingActivity('toggle_all_summaries', {
          summariesCollapsed: result.data.summariesCollapsed
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'toggle_all_summaries', 
            summariesCollapsed: result.data.summariesCollapsed
          } 
        });
      }
    } catch (error) {
      console.error('Failed to toggle all summaries:', error);
    } finally {
      setGroupingLoading(prev => ({ ...prev, toggle: false }));
    }
  };

  // Bar Labels handlers
  const handleConfigureBarLabels = () => {
    setIsConfigureBarLabelsModalOpen(true);
  };

  const handleSaveBarLabelConfig = async (config: BarLabelConfig) => {
    setBarLabelLoading(prev => ({ ...prev, configure: true }));
    try {
      const result = await BarLabelService.saveBarLabelConfig(config, 'demo');
      
      if (result.success && result.data) {
        setBarLabelConfig(result.data);
        
        // Get active preset for new config
        const activePresetResult = await BarLabelService.getActivePreset(result.data, 'demo');
        setActiveBarLabelPreset(activePresetResult);
        
        // Log activity
        await BarLabelService.logBarLabelActivity('configure_labels', {
          top: result.data.top,
          center: result.data.center,
          bottom: result.data.bottom
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'configure_bar_labels', 
            config: result.data
          } 
        });
      }
    } catch (error) {
      console.error('Failed to save bar label config:', error);
    } finally {
      setBarLabelLoading(prev => ({ ...prev, configure: false }));
    }
  };

  const handleApplyBarLabelPreset = async (preset: BarLabelPreset) => {
    setBarLabelLoading(prev => ({ ...prev, preset: true }));
    try {
      const result = await BarLabelService.applyBarLabelPreset(preset, 'demo');
      
      if (result.success && result.data) {
        setBarLabelConfig(result.data);
        setActiveBarLabelPreset(preset);
        
        // Log activity
        await BarLabelService.logBarLabelActivity('apply_preset', {
          presetName: preset.name,
          presetId: preset.id
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'apply_bar_label_preset', 
            presetName: preset.name
          } 
        });
      }
    } catch (error) {
      console.error('Failed to apply bar label preset:', error);
    } finally {
      setBarLabelLoading(prev => ({ ...prev, preset: false }));
    }
  };

  const handleResetBarLabels = () => {
    setIsResetBarLabelsModalOpen(true);
  };

  const handleConfirmResetBarLabels = async () => {
    setBarLabelLoading(prev => ({ ...prev, reset: true }));
    try {
      const result = await BarLabelService.resetBarLabels('demo');
      
      if (result.success && result.data) {
        setBarLabelConfig(result.data);
        setActiveBarLabelPreset(null);
        
        // Log activity
        await BarLabelService.logBarLabelActivity('reset_to_default', {
          resetTo: 'default'
        }, 'demo');
        
        // Dispatch operation
        onTaskOperation({ 
          type: 'add', 
          data: { 
            action: 'reset_bar_labels'
          } 
        });
      }
    } catch (error) {
      console.error('Failed to reset bar labels:', error);
    } finally {
      setBarLabelLoading(prev => ({ ...prev, reset: false }));
    }
  };

  // Only render when View tab is active
  if (activeRibbonTab !== 'View') {
    return null;
  }

  return (
    <div className="ribbon-tab-content">
      <div className="ribbon-sections">
        {/* Layout Section */}
        <LayoutSection
          splitView={layoutConfig.splitView}
          fullscreen={layoutConfig.fullscreen}
          onToggleSplit={handleToggleSplit}
          onResetLayout={handleResetLayout}
          onToggleFullscreen={handleToggleFullscreen}
          loading={layoutLoading}
        />

        {/* Filters Section */}
        <FiltersSection
          filters={filters}
          activeFilter={activeFilter}
          onApplyFilter={handleApplyFilter}
          onManageFilters={handleManageFilters}
          onClearFilter={handleClearFilter}
          onCreateFilter={handleCreateFilter}
          loading={filtersLoading}
        />

        {/* Float/Slack Section */}
        <FloatSlackSection
          showTotalFloat={floatConfig.showTotalFloat}
          showFreeFloat={floatConfig.showFreeFloat}
          highlightNegativeFloat={floatConfig.highlightNegativeFloat}
          onToggleTotalFloat={handleToggleTotalFloat}
          onToggleFreeFloat={handleToggleFreeFloat}
          onToggleNegativeFloat={handleToggleNegativeFloat}
          loading={floatLoading}
        />

        {/* Views Section */}
        <ViewsSection
          views={views}
          activeView={activeView}
          onApplyView={handleApplyView}
          onSaveView={handleSaveView}
          onManageViews={handleManageViews}
          loading={viewsLoading}
        />

        {/* Timeline Display Section */}
        <TimelineDisplaySection
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToView={handleFitToView}
          onScrollToToday={handleScrollToToday}
          loading={timelineLoading}
        />

        {/* Grouping & Collapse Section */}
        <GroupingCollapseSection
          summariesCollapsed={groupingConfig.summariesCollapsed}
          onExpandSelected={handleExpandSelected}
          onCollapseSelected={handleCollapseSelected}
          onToggleAll={handleToggleAll}
          loading={groupingLoading}
        />

        {/* Bar Labels Section */}
        <BarLabelsSection
          presets={barLabelPresets}
          activePreset={activeBarLabelPreset}
          onConfigureLabels={handleConfigureBarLabels}
          onApplyPreset={handleApplyBarLabelPreset}
          onResetLabels={handleResetBarLabels}
          loading={barLabelLoading}
        />
      </div>

      {/* Reset Layout Modal */}
      <ResetLayoutModal
        isOpen={isResetLayoutModalOpen}
        onClose={() => setIsResetLayoutModalOpen(false)}
        onConfirm={handleConfirmResetLayout}
        isDemoMode={true}
      />

      {/* Manage Filters Modal */}
      <ManageFiltersModal
        isOpen={isManageFiltersModalOpen}
        onClose={() => setIsManageFiltersModalOpen(false)}
        filters={filters}
        onSaveFilter={handleSaveFilter}
        onUpdateFilter={handleUpdateFilter}
        onDeleteFilter={handleDeleteFilter}
        isDemoMode={true}
      />

      {/* Save View Modal */}
      <SaveViewModal
        isOpen={isSaveViewModalOpen}
        onClose={() => setIsSaveViewModalOpen(false)}
        onSave={handleSaveViewData}
        currentConfig={currentViewConfig}
        isDemoMode={true}
      />

      {/* Manage Views Modal */}
      <ManageViewsModal
        isOpen={isManageViewsModalOpen}
        onClose={() => setIsManageViewsModalOpen(false)}
        views={views}
        onUpdateView={handleUpdateView}
        onDeleteView={handleDeleteView}
        onSetDefault={handleSetDefault}
        isDemoMode={true}
      />

      {/* Configure Bar Labels Modal */}
      <ConfigureBarLabelsModal
        isOpen={isConfigureBarLabelsModalOpen}
        onClose={() => setIsConfigureBarLabelsModalOpen(false)}
        onSave={handleSaveBarLabelConfig}
        currentConfig={barLabelConfig}
        isDemoMode={true}
      />

      {/* Reset Bar Labels Modal */}
      <ResetBarLabelsModal
        isOpen={isResetBarLabelsModalOpen}
        onClose={() => setIsResetBarLabelsModalOpen(false)}
        onConfirm={handleConfirmResetBarLabels}
        isDemoMode={true}
      />
    </div>
  );
};

export default ViewTab; 