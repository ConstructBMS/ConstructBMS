import React, { useState } from 'react';
import {
  DocumentTextIcon,
  HomeIcon,
  EyeIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  DocumentDuplicateIcon,
  DocumentChartBarIcon,
  WrenchScrewdriverIcon,
  ViewColumnsIcon,
  PlusIcon,
  FolderOpenIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CameraIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FlagIcon,
  BookmarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  DocumentTextIcon as DocumentTextIconSolid,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  DocumentIcon,
  TableCellsIcon as TableCellsIconSolid,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon as DocumentArrowDownIconSolid,
  CogIcon as CogIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  EyeIcon as EyeIconSolid,
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/outline';
import { HomeRibbonTab } from './GanttRibbon/HomeRibbonTab';
import { ViewRibbonTab } from './GanttRibbon/ViewRibbonTab';
import { ProjectRibbonTab } from './GanttRibbon/ProjectRibbonTab';
import { AllocationRibbonTab } from './GanttRibbon/AllocationRibbonTab';
import { TaskTab } from './GanttRibbon/TaskTab';
import { Tab4D } from './GanttRibbon/Tab4D';
import { TabFormat } from './GanttRibbon/TabFormat';
import { TabReporting } from './GanttRibbon/TabReporting';
import { ToolsTab } from './GanttRibbon/ToolsTab';
import { LayoutTab } from './GanttRibbon/LayoutTab';
import { ScheduleTab } from './GanttRibbon/ScheduleTab';
import { ReportTab } from './GanttRibbon/ReportTab';

interface GanttRibbonProps {
  activeTab: string;
  layoutSettings: {
    rowHeight: number;
    showCriticalPath: boolean;
    showDependencies: boolean;
    showGrid: boolean;
    showProgress: boolean;
    showResources: boolean;
    zoomLevel: 'day' | 'week' | 'month';
  };
  onExpandCollapseAll?: (expand: boolean) => void;
  onLayoutSettingsChange: (settings: any) => void;
  onResetLayout?: () => void;
  onTabChange: (tab: string) => void;
  onTaskAction: (action: string, taskIds?: string[]) => void;
  selectedTasks: string[];
}

interface Tab {
  description?: string;
  icon: React.ComponentType<any>;
  id: string;
  label: string;
}

export const GanttRibbon: React.FC<GanttRibbonProps> = ({
  activeTab,
  onTabChange,
  selectedTasks,
  onTaskAction,
  layoutSettings,
  onLayoutSettingsChange,
  onExpandCollapseAll,
  onResetLayout,
}) => {
  // Define ribbon tabs with descriptions for tooltips
  const tabs: Tab[] = [
    {
      id: 'file',
      label: 'File',
      icon: DocumentTextIcon,
      description: 'File operations and project management',
    },
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      description: 'Basic task operations and formatting',
    },
    {
      id: 'view',
      label: 'View',
      icon: EyeIcon,
      description: 'Layout and display options',
    },
    {
      id: 'project',
      label: 'Project',
      icon: FolderIcon,
      description: 'Project settings and properties',
    },
    {
      id: 'task',
      label: 'Task',
      icon: CogIcon,
      description: 'Task management and editing',
    },
    {
      id: 'allocation',
      label: 'Allocation',
      icon: ChartBarIcon,
      description: 'Resource allocation and management',
    },
    {
      id: '4d',
      label: '4D',
      icon: DocumentDuplicateIcon,
      description: '4D modeling and visualization',
    },
    {
      id: 'format',
      label: 'Format',
      icon: PaintBrushIcon,
      description: 'Visual formatting and styling',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: CalendarIcon,
      description: 'Scheduling and constraints',
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: ViewColumnsIcon,
      description: 'Layout and arrangement tools',
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: WrenchScrewdriverIcon,
      description: 'Utility tools and filters',
    },
    {
      id: 'reporting',
      label: 'Reporting',
      icon: DocumentChartBarIcon,
      description: 'Reports and exports',
    },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeRibbonTab
            selectedTasks={selectedTasks}
            onAction={onTaskAction}
          />
        );
      case 'view':
        return (
          <ViewRibbonTab
            layoutSettings={layoutSettings}
            onLayoutSettingsChange={onLayoutSettingsChange}
            onExpandCollapseAll={onExpandCollapseAll}
            onResetLayout={onResetLayout}
          />
        );
      case 'project':
        return <ProjectRibbonTab />;
      case 'task':
        return <TaskTab />;
      case 'file':
        return (
          <div className='ribbon-tab-content'>
            {/* File Operations Section */}
            <div className='ribbon-section'>
              <div className='ribbon-section-header'>File Operations</div>
              <div className='ribbon-section-content'>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Create new project'
                  onClick={() => onTaskAction('new-project')}
                >
                  <PlusIcon className='w-4 h-4' />
                  <span>New</span>
                </button>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Open existing project'
                  onClick={() => onTaskAction('open-project')}
                >
                  <FolderOpenIcon className='w-4 h-4' />
                  <span>Open</span>
                </button>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Save current project'
                  onClick={() => onTaskAction('save-project')}
                >
                  <DocumentArrowDownIcon className='w-4 h-4' />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Export Section */}
            <div className='ribbon-section'>
              <div className='ribbon-section-header'>Export</div>
              <div className='ribbon-section-content'>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Print project'
                  onClick={() => onTaskAction('print-project')}
                >
                  <PrinterIcon className='w-4 h-4' />
                  <span>Print</span>
                </button>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Export to PDF'
                  onClick={() => onTaskAction('export-pdf')}
                >
                  <DocumentArrowDownIcon className='w-4 h-4' />
                  <span>PDF</span>
                </button>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Export to Excel'
                  onClick={() => onTaskAction('export-excel')}
                >
                  <TableCellsIcon className='w-4 h-4' />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Project Info Section */}
            <div className='ribbon-section'>
              <div className='ribbon-section-header'>Project Info</div>
              <div className='ribbon-section-content'>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Project properties'
                  onClick={() => onTaskAction('project-properties')}
                >
                  <InformationCircleIcon className='w-4 h-4' />
                  <span>Properties</span>
                </button>
                <button
                  className='ribbon-button flex items-center space-x-1'
                  title='Project status'
                  onClick={() => onTaskAction('project-status')}
                >
                  <CheckCircleIcon className='w-4 h-4' />
                  <span>Status</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'allocation':
        return <AllocationRibbonTab />;
      case '4d':
        return <Tab4D />;
      case 'format':
        return <TabFormat />;
      case 'schedule':
        return <ScheduleTab />;
      case 'layout':
        return <LayoutTab />;
      case 'tools':
        return <ToolsTab />;
      case 'reporting':
        return <ReportTab />;
      default:
        return null;
    }
  };

  return (
    <div className='ribbon-container'>
      {/* Tab Navigation */}
      <div className='ribbon-tab-navigation'>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`ribbon-tab ${isActive ? 'ribbon-tab-active' : 'ribbon-tab-inactive'}`}
              title={tab.description}
              aria-selected={isActive}
              role='tab'
            >
              <IconComponent className='h-4 w-4' />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};
