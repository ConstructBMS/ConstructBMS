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
  WrenchScrewdriverIcon
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

interface GanttRibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedTasks: string[];
  onTaskAction: (action: string, taskIds?: string[]) => void;
  layoutSettings: {
    zoomLevel: 'day' | 'week' | 'month';
    showGrid: boolean;
    showDependencies: boolean;
    rowHeight: number;
    showCriticalPath: boolean;
    showProgress: boolean;
    showResources: boolean;
  };
  onLayoutSettingsChange: (settings: any) => void;
  onExpandCollapseAll?: (expand: boolean) => void;
  onResetLayout?: () => void;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export const GanttRibbon: React.FC<GanttRibbonProps> = ({
  activeTab,
  onTabChange,
  selectedTasks,
  onTaskAction,
  layoutSettings,
  onLayoutSettingsChange,
  onExpandCollapseAll,
  onResetLayout
}) => {
  // Define ribbon tabs
  const tabs: Tab[] = [
    { id: 'file', label: 'File', icon: DocumentTextIcon },
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'view', label: 'View', icon: EyeIcon },
    { id: 'project', label: 'Project', icon: FolderIcon },
    { id: 'task', label: 'Task', icon: CogIcon },
    { id: 'allocation', label: 'Allocation', icon: ChartBarIcon },
    { id: '4d', label: '4D', icon: DocumentDuplicateIcon },
    { id: 'format', label: 'Format', icon: CogIcon },
    { id: 'tools', label: 'Tools', icon: WrenchScrewdriverIcon },
    { id: 'reporting', label: 'Reporting', icon: DocumentChartBarIcon }
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
          <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
            <div className="flex flex-col">
              <div className="flex space-x-1 mb-2">
                <button className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors">
                  <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
                  <span className="text-xs text-gray-700">New</span>
                </button>
                <button className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors">
                  <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
                  <span className="text-xs text-gray-700">Open</span>
                </button>
                <button className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors">
                  <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
                  <span className="text-xs text-gray-700">Save</span>
                </button>
              </div>
              <div className="text-xs text-gray-600 font-medium">File</div>
            </div>
          </div>
        );


      case 'allocation':
        return <AllocationRibbonTab />;
      case '4d':
        return <Tab4D />;
      case 'format':
        return <TabFormat />;
      case 'tools':
        return <ToolsTab />;
      case 'reporting':
        return <TabReporting />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 border-b border-gray-300">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="h-4 w-4" />
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