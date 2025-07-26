import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';
import { demoModeService } from '../../../services/demoModeService';

// Import all ribbon tab components
import FileTab from './FileTab';
import AdminTab from './AdminTab';

// Import all section components for Format tab
import CriticalPathHighlightingSection from './CriticalPathHighlightingSection';
import MilestoneStylingSection from './MilestoneStylingSection';
import GanttZoomScaleSection from './GanttZoomScaleSection';
import TaskRowStylingSection from './TaskRowStylingSection';
import GridColumnControlsSection from './GridColumnControlsSection';
import TimelineGridlinesMarkersSection from './TimelineGridlinesMarkersSection';
import PrintExportStylingSection from './PrintExportStylingSection';
import CustomBarStylesSection from './CustomBarStylesSection';

// Import all modals
import ManageTagsModal from './ManageTagsModal';
import ImportProjectModal from './ImportProjectModal';
import ProjectPropertiesModal from './ProjectPropertiesModal';
import ManageColumnsModal from './ManageColumnsModal';
import CustomDateMarkerModal from './CustomDateMarkerModal';
import ExportPreviewModal from './ExportPreviewModal';
import ManageBarStylesModal from './ManageBarStylesModal';
import AssignStyleRulesModal from './AssignStyleRulesModal';

// Import all services
import { criticalPathHighlightingService } from '../../../services/criticalPathHighlightingService';
import { milestoneStylingService } from '../../../services/milestoneStylingService';
import { ganttZoomScaleService } from '../../../services/ganttZoomScaleService';
import { taskRowStylingService } from '../../../services/taskRowStylingService';
import { gridColumnControlsService } from '../../../services/gridColumnControlsService';
import { timelineGridlinesMarkersService } from '../../../services/timelineGridlinesMarkersService';
import { printExportStylingService } from '../../../services/printExportStylingService';
import { customBarStylesService } from '../../../services/customBarStylesService';
import { fileTabService } from '../../../services/fileTabService';
import { adminTabService } from '../../../services/adminTabService';

// Import icons
import {
  DocumentIcon,
  HomeIcon,
  FolderIcon,
  EyeIcon,
  UserGroupIcon,
  CubeIcon,
  PaintBrushIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export interface RibbonTab {
  component?: React.ComponentType<any>;
  icon: React.ComponentType<any>;
  id: string;
  label: string;
  permission?: string;
  props?: any;
}

export interface RibbonState {
  activeTab: string;
  // File tab states
  autoSaveEnabled: boolean;
  availableStatuses: Array<{ color: string, id: string; name: string; }>;
  columnOrder: string[];
  
  criticalPathColor: string;
  // Format tab states
  criticalPathEnabled: boolean;
  // Admin tab states
  currentColorPalette: string;
  currentDefaultStatus: string;
  currentThemePreset: string;
  exportTheme: string;
  gridlineStyle: string;
  highlightActiveRow: boolean;
  isDemoMode: boolean;
  lastSyncTime?: string;
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  milestoneColor: string;
  milestoneIcon: string;
  milestoneShowLabel: boolean;
  pageLayout: string;
  projectId: string;
  
  projectStatus: string;
  rowBorder: string;
  rowStriping: boolean;
  showTodayMarker: boolean;
  
  syncStatus: 'success' | 'error' | 'pending' | 'none';
  timeScale: string;
  userId: string;
  visibleColumns: string[];
  
  zoomLevel: number;
}

const IntegratedRibbonSystem: React.FC = () => {
  const { canAccess } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL or default to 'home'
  const getActiveTabFromURL = () => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1] || '';
    const validTabs = ['file', 'home', 'project', 'view', 'allocation', '4d', 'format', 'admin'];
    return validTabs.includes(lastSegment) ? lastSegment : 'home';
  };

  // Initialize state
  const [state, setState] = useState<RibbonState>({
    activeTab: getActiveTabFromURL(),
    projectId: 'demo-project-1',
    userId: 'current-user',
    isDemoMode: false,
    
    // Format tab defaults
    criticalPathEnabled: false,
    criticalPathColor: '#EF4444',
    milestoneIcon: 'diamond',
    milestoneColor: '#6B7280',
    milestoneShowLabel: true,
    zoomLevel: 1,
    timeScale: 'weekly',
    rowStriping: true,
    rowBorder: 'bottom',
    highlightActiveRow: true,
    visibleColumns: ['task', 'startDate', 'endDate', 'duration', 'progress', 'status'],
    columnOrder: ['task', 'startDate', 'endDate', 'duration', 'progress', 'status'],
    showTodayMarker: true,
    gridlineStyle: 'dotted',
    pageLayout: 'A4 Landscape',
    exportTheme: 'Default',
    
    // File tab defaults
    autoSaveEnabled: false,
    projectStatus: 'active',
    syncStatus: 'none',
    
    // Admin tab defaults
    currentColorPalette: 'default',
    currentDefaultStatus: 'not-started',
    availableStatuses: [
      { id: 'not-started', name: 'Not Started', color: '#6B7280' },
      { id: 'in-progress', name: 'In Progress', color: '#3B82F6' },
      { id: 'completed', name: 'Completed', color: '#10B981' },
      { id: 'on-hold', name: 'On Hold', color: '#F59E0B' }
    ],
    currentThemePreset: 'default',
    
    // Loading states
    loading: {}
  });

  // Modal states
  const [modals, setModals] = useState({
    manageTags: false,
    importProject: false,
    projectProperties: false,
    manageColumns: false,
    customDateMarker: false,
    exportPreview: false,
    manageBarStyles: false,
    assignStyleRules: false
  });

  // Define ribbon tabs with permissions
  const ribbonTabs: RibbonTab[] = [
    {
      id: 'file',
      label: 'File',
      icon: DocumentIcon,
      component: FileTab,
      permission: 'programme.save'
    },
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon
    },
    {
      id: 'project',
      label: 'Project',
      icon: FolderIcon
    },
    {
      id: 'view',
      label: 'View',
      icon: EyeIcon
    },
    {
      id: 'allocation',
      label: 'Allocation',
      icon: UserGroupIcon
    },
    {
      id: '4d',
      label: '4D',
      icon: CubeIcon
    },
    {
      id: 'format',
      label: 'Format',
      icon: PaintBrushIcon,
      permission: 'programme.format.view'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Cog6ToothIcon,
      component: AdminTab,
      permission: 'programme.admin.manage'
    }
  ];

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setState(prev => ({ ...prev, isDemoMode: isDemo }));
    };
    checkDemoMode();
  }, []);

  // Update active tab when URL changes
  useEffect(() => {
    const newActiveTab = getActiveTabFromURL();
    if (newActiveTab !== state.activeTab) {
      setState(prev => ({ ...prev, activeTab: newActiveTab }));
    }
  }, [location.pathname]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [state.projectId, state.isDemoMode]);

  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, initial: true } }));
      
      // Load Format tab data
      const criticalPathConfig = await criticalPathHighlightingService.getConfig();
      const milestoneConfig = await milestoneStylingService.getConfig();
      const zoomConfig = await ganttZoomScaleService.getConfig();
      const rowConfig = await taskRowStylingService.getConfig();
      const gridConfig = await gridColumnControlsService.getConfig();
      const timelineConfig = await timelineGridlinesMarkersService.getConfig();
      const exportConfig = await printExportStylingService.getConfig();
      
      // Load File tab data
      const fileConfig = await fileTabService.getConfig();
      
      // Load Admin tab data
      const adminConfig = await adminTabService.getConfig();
      const statuses = await adminTabService.getTaskStatuses(state.projectId);
      const tags = await adminTabService.getProjectTags(state.projectId);
      
      setState(prev => ({
        ...prev,
        // Format tab data
        criticalPathEnabled: criticalPathConfig.showCriticalPath,
        criticalPathColor: criticalPathConfig.criticalColor,
        milestoneIcon: milestoneConfig.milestoneStyle.icon,
        milestoneColor: milestoneConfig.milestoneStyle.color,
        milestoneShowLabel: milestoneConfig.milestoneStyle.showLabel,
        zoomLevel: zoomConfig.zoomLevel,
        timeScale: zoomConfig.timeScale,
        rowStriping: rowConfig.striping,
        rowBorder: rowConfig.rowBorder,
        highlightActiveRow: rowConfig.highlightActive,
        visibleColumns: gridConfig.visibleColumns,
        columnOrder: gridConfig.columnOrder,
        showTodayMarker: timelineConfig.showToday,
        gridlineStyle: timelineConfig.gridlineStyle,
        pageLayout: exportConfig.pageLayout,
        exportTheme: exportConfig.theme,
        
        // File tab data
        autoSaveEnabled: fileConfig.autoSaveEnabled,
        projectStatus: fileConfig.projectStatus || 'active',
        
        // Admin tab data
        availableStatuses: statuses,
        currentDefaultStatus: statuses.find(s => s.isDefault)?.id || 'not-started',
        
        loading: { ...prev.loading, initial: false }
      }));
    } catch (error) {
      console.error('Error loading initial data:', error);
      setState(prev => ({ ...prev, loading: { ...prev.loading, initial: false } }));
    }
  };

  const handleTabChange = (tabId: string) => {
    const tab = ribbonTabs.find(t => t.id === tabId);
    if (tab && (!tab.permission || canAccess(tab.permission))) {
      setState(prev => ({ ...prev, activeTab: tabId }));
      navigate(`/programme-manager/${tabId}`);
    }
  };

  const setLoading = (key: string, loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: loading }
    }));
  };

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  // Format tab handlers
  const handleCriticalPathToggle = async () => {
    try {
      setLoading('criticalPath', true);
      const newEnabled = !state.criticalPathEnabled;
      await criticalPathHighlightingService.updateConfig({
        showCriticalPath: newEnabled,
        criticalColor: state.criticalPathColor
      });
      setState(prev => ({ ...prev, criticalPathEnabled: newEnabled }));
    } catch (error) {
      console.error('Error toggling critical path:', error);
    } finally {
      setLoading('criticalPath', false);
    }
  };

  const handleCriticalPathColorChange = async (color: string) => {
    try {
      setLoading('criticalPathColor', true);
      await criticalPathHighlightingService.updateConfig({
        showCriticalPath: state.criticalPathEnabled,
        criticalColor: color
      });
      setState(prev => ({ ...prev, criticalPathColor: color }));
    } catch (error) {
      console.error('Error changing critical path color:', error);
    } finally {
      setLoading('criticalPathColor', false);
    }
  };

  const handleMilestoneStyleChange = async (field: string, value: any) => {
    try {
      setLoading('milestone', true);
      const newConfig = {
        milestoneStyle: {
          icon: field === 'icon' ? value : state.milestoneIcon,
          color: field === 'color' ? value : state.milestoneColor,
          showLabel: field === 'showLabel' ? value : state.milestoneShowLabel
        }
      };
      await milestoneStylingService.updateConfig(newConfig);
      setState(prev => ({
        ...prev,
        milestoneIcon: field === 'icon' ? value : prev.milestoneIcon,
        milestoneColor: field === 'color' ? value : prev.milestoneColor,
        milestoneShowLabel: field === 'showLabel' ? value : prev.milestoneShowLabel
      }));
    } catch (error) {
      console.error('Error changing milestone style:', error);
    } finally {
      setLoading('milestone', false);
    }
  };

  const handleZoomChange = async (field: string, value: any) => {
    try {
      setLoading('zoom', true);
      const newConfig = {
        zoomLevel: field === 'zoomLevel' ? value : state.zoomLevel,
        timeScale: field === 'timeScale' ? value : state.timeScale
      };
      await ganttZoomScaleService.updateConfig(newConfig);
      setState(prev => ({
        ...prev,
        zoomLevel: field === 'zoomLevel' ? value : prev.zoomLevel,
        timeScale: field === 'timeScale' ? value : prev.timeScale
      }));
    } catch (error) {
      console.error('Error changing zoom settings:', error);
    } finally {
      setLoading('zoom', false);
    }
  };

  const handleRowStylingChange = async (field: string, value: any) => {
    try {
      setLoading('rowStyling', true);
      const newConfig = {
        striping: field === 'striping' ? value : state.rowStriping,
        rowBorder: field === 'rowBorder' ? value : state.rowBorder,
        highlightActive: field === 'highlightActive' ? value : state.highlightActiveRow
      };
      await taskRowStylingService.updateConfig(newConfig);
      setState(prev => ({
        ...prev,
        rowStriping: field === 'striping' ? value : prev.rowStriping,
        rowBorder: field === 'rowBorder' ? value : prev.rowBorder,
        highlightActiveRow: field === 'highlightActive' ? value : prev.highlightActiveRow
      }));
    } catch (error) {
      console.error('Error changing row styling:', error);
    } finally {
      setLoading('rowStyling', false);
    }
  };

  // File tab handlers
  const handleSaveChanges = async () => {
    try {
      setLoading('save', true);
      await fileTabService.saveProject(state.projectId);
      console.log('Project saved successfully');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading('save', false);
    }
  };

  const handleSaveAsTemplate = async () => {
    try {
      setLoading('template', true);
      await fileTabService.saveAsTemplate(state.projectId);
      console.log('Project saved as template');
    } catch (error) {
      console.error('Error saving as template:', error);
    } finally {
      setLoading('template', false);
    }
  };

  const handleToggleAutoSave = async () => {
    try {
      setLoading('autoSave', true);
      const newAutoSave = !state.autoSaveEnabled;
      await fileTabService.updateConfig({ autoSaveEnabled: newAutoSave });
      setState(prev => ({ ...prev, autoSaveEnabled: newAutoSave }));
    } catch (error) {
      console.error('Error toggling auto-save:', error);
    } finally {
      setLoading('autoSave', false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      setLoading(`export_${type}`, true);
      await fileTabService.exportProject(state.projectId, type);
      console.log(`Project exported as ${type}`);
    } catch (error) {
      console.error(`Error exporting as ${type}:`, error);
    } finally {
      setLoading(`export_${type}`, false);
    }
  };

  // Admin tab handlers
  const handleColorPaletteChange = async (palette: string) => {
    try {
      setLoading('palette', true);
      await adminTabService.updateConfig({ currentColorPalette: palette });
      setState(prev => ({ ...prev, currentColorPalette: palette }));
    } catch (error) {
      console.error('Error changing color palette:', error);
    } finally {
      setLoading('palette', false);
    }
  };

  const handleDefaultStatusChange = async (statusId: string) => {
    try {
      setLoading('defaultStatus', true);
      const updatedStatuses = state.availableStatuses.map(status => ({
        ...status,
        isDefault: status.id === statusId
      }));
      await adminTabService.saveTaskStatuses(state.projectId, updatedStatuses);
      setState(prev => ({ 
        ...prev, 
        currentDefaultStatus: statusId,
        availableStatuses: updatedStatuses
      }));
    } catch (error) {
      console.error('Error changing default status:', error);
    } finally {
      setLoading('defaultStatus', false);
    }
  };

  const handleThemePresetChange = async (preset: string) => {
    try {
      setLoading('themePreset', true);
      await adminTabService.updateConfig({ currentThemePreset: preset });
      setState(prev => ({ ...prev, currentThemePreset: preset }));
    } catch (error) {
      console.error('Error changing theme preset:', error);
    } finally {
      setLoading('themePreset', false);
    }
  };

  // Render ribbon tabs
  const renderRibbonTabs = () => (
    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {ribbonTabs.map((tab) => {
        const hasPermission = !tab.permission || canAccess(tab.permission);
        const isActive = state.activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={!hasPermission}
            className={`
              flex items-center space-x-2 px-4 py-2 text-sm font-medium
              border-b-2 transition-colors duration-200
              ${isActive
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
              ${!hasPermission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Render active tab content
  const renderActiveTabContent = () => {
    const activeTab = ribbonTabs.find(tab => tab.id === state.activeTab);
    
    if (!activeTab) return null;
    
    // Check permissions
    if (activeTab.permission && !canAccess(activeTab.permission)) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <p>You don't have permission to access this tab.</p>
        </div>
      );
    }

    // Render custom tab components
    if (activeTab.component) {
      const TabComponent = activeTab.component;
      return <TabComponent {...activeTab.props} />;
    }

    // Render Format tab with sections
    if (state.activeTab === 'format') {
      return (
        <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto min-h-[100px]">
          <CriticalPathHighlightingSection
            enabled={state.criticalPathEnabled}
            color={state.criticalPathColor}
            onToggle={handleCriticalPathToggle}
            onColorChange={handleCriticalPathColorChange}
            disabled={state.isDemoMode}
            loading={state.loading.criticalPath || state.loading.criticalPathColor}
          />
          
          <MilestoneStylingSection
            icon={state.milestoneIcon}
            color={state.milestoneColor}
            showLabel={state.milestoneShowLabel}
            onIconChange={(icon) => handleMilestoneStyleChange('icon', icon)}
            onColorChange={(color) => handleMilestoneStyleChange('color', color)}
            onLabelToggle={(showLabel) => handleMilestoneStyleChange('showLabel', showLabel)}
            disabled={state.isDemoMode}
            loading={state.loading.milestone}
          />
          
          <GanttZoomScaleSection
            zoomLevel={state.zoomLevel}
            timeScale={state.timeScale}
            onZoomIn={() => handleZoomChange('zoomLevel', Math.min(state.zoomLevel + 1, 5))}
            onZoomOut={() => handleZoomChange('zoomLevel', Math.max(state.zoomLevel - 1, 1))}
            onTimeScaleChange={(timeScale) => handleZoomChange('timeScale', timeScale)}
            disabled={state.isDemoMode}
            loading={state.loading.zoom}
          />
          
          <TaskRowStylingSection
            striping={state.rowStriping}
            rowBorder={state.rowBorder}
            highlightActive={state.highlightActiveRow}
            onStripingToggle={(striping) => handleRowStylingChange('striping', striping)}
            onBorderChange={(rowBorder) => handleRowStylingChange('rowBorder', rowBorder)}
            onHighlightToggle={(highlightActive) => handleRowStylingChange('highlightActive', highlightActive)}
            disabled={state.isDemoMode}
            loading={state.loading.rowStyling}
          />
          
          <GridColumnControlsSection
            onOpenManageColumns={() => openModal('manageColumns')}
            onColumnPresetChange={() => {}}
            onResetColumns={() => {}}
            disabled={state.isDemoMode}
            loading={state.loading.gridColumns}
          />
          
          <TimelineGridlinesMarkersSection
            showToday={state.showTodayMarker}
            gridlineStyle={state.gridlineStyle}
            onTodayToggle={() => {}}
            onCustomDateMarker={() => openModal('customDateMarker')}
            onGridlineStyleChange={() => {}}
            disabled={state.isDemoMode}
            loading={state.loading.timeline}
          />
          
          <PrintExportStylingSection
            pageLayout={state.pageLayout}
            exportTheme={state.exportTheme}
            onPageLayoutChange={() => {}}
            onExportThemeChange={() => {}}
            onExportPreview={() => openModal('exportPreview')}
            disabled={state.isDemoMode}
            loading={state.loading.export}
          />
          
          <CustomBarStylesSection
            onOpenManageBarStyles={() => openModal('manageBarStyles')}
            onOpenAssignStyleRules={() => openModal('assignStyleRules')}
            onResetBarStyles={() => {}}
            disabled={state.isDemoMode}
            loading={state.loading.barStyles}
          />
        </div>
      );
    }

    // Render File tab with sections
    if (state.activeTab === 'file') {
      return (
        <FileTab
          onSaveChanges={handleSaveChanges}
          onSaveAsTemplate={handleSaveAsTemplate}
          onToggleAutoSave={handleToggleAutoSave}
          onImportProject={() => openModal('importProject')}
          onExportPDF={() => handleExport('pdf')}
          onExportCSV={() => handleExport('csv')}
          onExportImage={() => handleExport('image')}
          onSyncWithAsta={() => {}}
          onViewSyncLog={() => {}}
          onOpenProjectProperties={() => openModal('projectProperties')}
          onChangeProjectStatus={() => {}}
          onArchiveProject={() => {}}
          autoSaveEnabled={state.autoSaveEnabled}
          currentStatus={state.projectStatus as any}
          lastSyncTime={state.lastSyncTime}
          syncStatus={state.syncStatus}
          projectId={state.projectId}
          projectName={state.projectName}
          onTaskOperation={handleTaskOperation}
          disabled={state.isDemoMode}
          loading={state.loading}
        />
      );
    }

    // Render Admin tab with sections
    if (state.activeTab === 'admin') {
      return (
        <AdminTab
          onOpenManageTags={() => openModal('manageTags')}
          onColorPaletteChange={handleColorPaletteChange}
          onOpenEditStatusList={() => {}}
          onSetDefaultStatus={handleDefaultStatusChange}
          onThemePresetChange={handleThemePresetChange}
          onOpenManageTheme={() => {}}
          onOpenAddField={() => {}}
          onOpenFieldLibrary={() => {}}
          onOpenFieldPosition={() => {}}
          currentColorPalette={state.currentColorPalette}
          currentDefaultStatus={state.currentDefaultStatus}
          availableStatuses={state.availableStatuses}
          currentThemePreset={state.currentThemePreset}
          disabled={state.isDemoMode}
          loading={state.loading}
        />
      );
    }

    // Default tab content
    return (
      <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto min-h-[100px]">
        <p className="text-gray-500 dark:text-gray-400">
          {activeTab.label} tab content will be implemented here.
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {renderRibbonTabs()}
      {renderActiveTabContent()}
      
      {/* Modals */}
      <ManageTagsModal
        isOpen={modals.manageTags}
        onClose={() => closeModal('manageTags')}
        tags={[]}
        onTagsChange={() => {}}
        onSave={() => {}}
        projectId={state.projectId}
        loading={state.loading.manageTags}
      />
      
      <ImportProjectModal
        isOpen={modals.importProject}
        onClose={() => closeModal('importProject')}
        onImport={() => {}}
        loading={state.loading.import}
      />
      
      <ProjectPropertiesModal
        isOpen={modals.projectProperties}
        onClose={() => closeModal('projectProperties')}
        onSave={() => {}}
        projectId={state.projectId}
        loading={state.loading.projectProperties}
      />
      
      <ManageColumnsModal
        isOpen={modals.manageColumns}
        onClose={() => closeModal('manageColumns')}
        onSave={() => {}}
        visibleColumns={state.visibleColumns}
        columnOrder={state.columnOrder}
        loading={state.loading.manageColumns}
      />
      
      <CustomDateMarkerModal
        isOpen={modals.customDateMarker}
        onClose={() => closeModal('customDateMarker')}
        onSave={() => {}}
        loading={state.loading.customDateMarker}
      />
      
      <ExportPreviewModal
        isOpen={modals.exportPreview}
        onClose={() => closeModal('exportPreview')}
        onExport={() => {}}
        pageLayout={state.pageLayout}
        exportTheme={state.exportTheme}
        loading={state.loading.exportPreview}
      />
      
      <ManageBarStylesModal
        isOpen={modals.manageBarStyles}
        onClose={() => closeModal('manageBarStyles')}
        onSave={() => {}}
        projectId={state.projectId}
        loading={state.loading.manageBarStyles}
      />
      
      <AssignStyleRulesModal
        isOpen={modals.assignStyleRules}
        onClose={() => closeModal('assignStyleRules')}
        onSave={() => {}}
        projectId={state.projectId}
        loading={state.loading.assignStyleRules}
      />
    </div>
  );
};

export default IntegratedRibbonSystem; 