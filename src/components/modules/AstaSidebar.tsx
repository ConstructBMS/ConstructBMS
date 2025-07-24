import React, { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
// Remove the import since we're not using the service

interface AstaSidebarProps {
  activeProject: any;
  activeViewMode?: string;
  collapsed: boolean;
  onNavigation?: (itemId: string) => void;
  onToggleCollapse: () => void;
  userRole: string;
}

const AstaSidebar: React.FC<AstaSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activeProject,
  userRole,
  onNavigation,
  activeViewMode
}) => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSidebarConfig();
  }, [userRole]);

  // Update menu items when activeViewMode changes
  useEffect(() => {
    setMenuItems(getDefaultMenuItems());
  }, [activeViewMode]);

  const loadSidebarConfig = async () => {
    try {
      setLoading(true);
      // Use default config for now
      setMenuItems(getDefaultMenuItems());
    } catch (error) {
      console.error('Failed to load sidebar config:', error);
      // Fallback to default config
      setMenuItems(getDefaultMenuItems());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMenuItems = () => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'ChartBarIcon',
      active: activeViewMode === 'dashboard',
      visible: true
    },
    {
      id: 'gantt',
      label: 'Gantt Chart',
      icon: 'CalendarIcon',
      active: activeViewMode === 'gantt',
      visible: true
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: 'CalendarIcon',
      active: activeViewMode === 'timeline',
      visible: true
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: 'CalendarIcon',
      active: activeViewMode === 'calendar',
      visible: true
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: 'UserGroupIcon',
      active: activeViewMode === 'resources',
      visible: true
    },
    {
      id: 'costs',
      label: 'Costs',
      icon: 'CurrencyDollarIcon',
      active: activeViewMode === 'costs',
      visible: true
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'DocumentTextIcon',
      active: activeViewMode === 'documents',
      visible: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'PresentationChartLineIcon',
      active: activeViewMode === 'reports',
      visible: true
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'ClipboardDocumentListIcon',
      active: activeViewMode === 'tasks',
      visible: true
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: 'WrenchScrewdriverIcon',
      active: activeViewMode === 'tools',
      visible: true
    }
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      ChartBarIcon,
      CalendarIcon,
      UserGroupIcon,
      CurrencyDollarIcon,
      DocumentTextIcon,
      PresentationChartLineIcon,
      ClipboardDocumentListIcon,
      WrenchScrewdriverIcon,
      Cog6ToothIcon
    };
    return iconMap[iconName] || ChartBarIcon;
  };

  const handleMenuItemClick = async (itemId: string) => {
    try {
      // Call the parent navigation handler if provided
      if (onNavigation) {
        onNavigation(itemId);
      } else {
        console.log('Navigation to:', itemId);
      }
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-constructbms-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-constructbms-blue to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="ml-2 font-semibold text-white">Asta</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-300" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-300" />
          )}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {menuItems
            .filter(item => item.visible)
            .map((item) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? 'text-constructbms-blue bg-constructbms-blue/10 border border-constructbms-blue/20'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-700 transition-colors">
          <CogIcon className="w-5 h-5 mr-3" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </div>
  );
};

export default AstaSidebar; 