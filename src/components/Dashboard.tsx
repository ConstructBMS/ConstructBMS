import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Image, Type } from 'lucide-react';
import { useLogo } from '../contexts/LogoContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCards from './dashboard/StatsCards';
import ProjectsOverview from './dashboard/ProjectsOverview';
import RecentActivity from './dashboard/RecentActivity';
import TasksWidget from './dashboard/TasksWidget';
import RevenueChart from './dashboard/RevenueChart';
import QuickActions from './dashboard/QuickActions';
import DashboardTabs from './DashboardTabs';
import DashboardSettings from './dashboard/DashboardSettings';
import DemoDataInitializer from './DemoDataInitializer';
import ActivityStream from './modules/ActivityStream';
import PageBuilder from './PageBuilder';
import {
  getDashboardLayout,
  saveDashboardLayout,
} from '../services/dashboardLayoutService';
import { supabase } from '../services/supabase';

interface DashboardProps {
  activeModule?: string;
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

interface DashboardTab {
  icon: string;
  id: string;
  label: string;
  moduleKey: string;
  type: 'builtin' | 'custom';
  widgets?: any[];
}

interface WidgetInstance {
  // Grid row span
  config?: any;
  // Grid column span
  height: number;
  id: string; 
  type: string; 
  width: number;
}

// Quick Start Component
const QuickStart: React.FC<{
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}> = ({ onNavigateToModule }) => {
  const { logoSettings, updateMainLogo, updateSidebarLogo } = useLogo();
  const { user } = useAuth();
  const [showLogoSettings, setShowLogoSettings] = useState(false);

  const welcomeText = user?.firstName
    ? `Welcome back, ${user.firstName}!`
    : 'Welcome back!';

  return (
    <div className='space-y-6'>
      <div className='bg-constructbms-green rounded-xl p-6'>
        <h1 className='text-2xl font-bold mb-2 banner-text-dark'>
          {welcomeText}
        </h1>
        <p className='banner-text-dark-secondary'>
          Here's how things look today.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center mb-4'>
            <div className='w-10 h-10 bg-constructbms-green/10 rounded-lg flex items-center justify-center mr-3'>
              <span className='text-constructbms-green font-bold'>1</span>
            </div>
            <h3 className='font-semibold text-gray-900'>Set Up Your Profile</h3>
          </div>
          <p className='text-gray-600 mb-4'>
            Complete your profile information and preferences.
          </p>
          <button
            onClick={() => onNavigateToModule?.('general-settings')}
            className='text-constructbms-green hover:text-constructbms-blue font-medium'
          >
            Go to Settings →
          </button>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center mb-4'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3'>
              <span className='text-green-600 font-bold'>2</span>
            </div>
            <h3 className='font-semibold text-gray-900'>
              Create Your First Project
            </h3>
          </div>
          <p className='text-gray-600 mb-4'>
            Start managing your projects and tasks.
          </p>
          <button
            onClick={() => onNavigateToModule?.('projects')}
            className='text-green-600 hover:text-green-700 font-medium'
          >
            Create Project →
          </button>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center mb-4'>
            <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3'>
              <span className='text-purple-600 font-bold'>3</span>
            </div>
            <h3 className='font-semibold text-gray-900'>Invite Team Members</h3>
          </div>
          <p className='text-gray-600 mb-4'>
            Add team members and assign roles.
          </p>
          <button
            onClick={() => onNavigateToModule?.('user-management')}
            className='text-purple-600 hover:text-purple-700 font-medium'
          >
            Manage Users →
          </button>
        </div>
      </div>

      {/* Optional Logo Customization */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='font-semibold text-gray-900'>
              Customize Your Branding (Optional)
            </h3>
            <p className='text-gray-600 text-sm'>
              Add your company logo and customize the appearance
            </p>
          </div>
          <button
            onClick={() => setShowLogoSettings(!showLogoSettings)}
            className='text-constructbms-green hover:text-constructbms-blue font-medium text-sm'
          >
            {showLogoSettings ? 'Hide' : 'Customize'} →
          </button>
        </div>

        {showLogoSettings && (
          <div className='space-y-4 pt-4 border-t border-gray-100'>
            {/* Main Logo */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-gray-700'>
                Main Header Logo
              </h4>
              <div className='flex space-x-4'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='quickMainLogoType'
                    value='text'
                    checked={logoSettings.mainLogo.type === 'text'}
                    onChange={() => updateMainLogo({ type: 'text' })}
                    className='mr-2'
                  />
                  <Type className='h-4 w-4 mr-1' />
                  Text
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='quickMainLogoType'
                    value='image'
                    checked={logoSettings.mainLogo.type === 'image'}
                    onChange={() => updateMainLogo({ type: 'image' })}
                    className='mr-2'
                  />
                  <Image className='h-4 w-4 mr-1' />
                  Image
                </label>
              </div>

              {logoSettings.mainLogo.type === 'text' ? (
                <input
                  type='text'
                  value={logoSettings.mainLogo.text}
                  onChange={e => updateMainLogo({ text: e.target.value })}
                  placeholder='Enter company name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              ) : (
                <div className='space-y-2'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = event => {
                          const result = event.target?.result as string;
                          updateMainLogo({ imageUrl: result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-constructbms-green file:text-white hover:file:bg-constructbms-blue'
                  />
                  {logoSettings.mainLogo.imageUrl && (
                    <div className='flex items-center space-x-2'>
                      <img
                        src={logoSettings.mainLogo.imageUrl}
                        alt='Current logo'
                        className='h-6 w-auto max-w-24 object-contain border border-gray-200 rounded'
                      />
                      <button
                        onClick={() => updateMainLogo({ imageUrl: null })}
                        className='text-xs text-red-600 hover:text-red-700'
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Logo */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-gray-700'>
                Sidebar Logo
              </h4>
              <div className='flex space-x-4'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='quickSidebarLogoType'
                    value='icon'
                    checked={logoSettings.sidebarLogo.type === 'icon'}
                    onChange={() => updateSidebarLogo({ type: 'icon' })}
                    className='mr-2'
                  />
                  <Type className='h-4 w-4 mr-1' />
                  Default Icon
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='quickSidebarLogoType'
                    value='image'
                    checked={logoSettings.sidebarLogo.type === 'image'}
                    onChange={() => updateSidebarLogo({ type: 'image' })}
                    className='mr-2'
                  />
                  <Image className='h-4 w-4 mr-1' />
                  Custom Image
                </label>
              </div>

              {logoSettings.sidebarLogo.type === 'image' && (
                <div className='space-y-2'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = event => {
                          const result = event.target?.result as string;
                          updateSidebarLogo({ imageUrl: result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-constructbms-green file:text-white hover:file:bg-constructbms-blue'
                  />
                  {logoSettings.sidebarLogo.imageUrl && (
                    <div className='flex items-center space-x-2'>
                      <img
                        src={logoSettings.sidebarLogo.imageUrl}
                        alt='Current sidebar logo'
                        className='h-5 w-5 object-contain border border-gray-200 rounded'
                      />
                      <button
                        onClick={() => updateSidebarLogo({ imageUrl: null })}
                        className='text-xs text-red-600 hover:text-red-700'
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className='pt-4 border-t border-gray-100'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>
                Preview
              </h4>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <span className='text-xs text-gray-500'>Header:</span>
                  {logoSettings.mainLogo.type === 'image' &&
                  logoSettings.mainLogo.imageUrl ? (
                    <img
                      src={logoSettings.mainLogo.imageUrl}
                      alt='Main Logo Preview'
                      className='h-6 w-auto max-w-24 object-contain'
                    />
                  ) : (
                    <span className='text-sm font-bold text-gray-900'>
                      {logoSettings.mainLogo.text}
                    </span>
                  )}
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-xs text-gray-500'>Sidebar:</span>
                  {logoSettings.sidebarLogo.type === 'image' &&
                  logoSettings.sidebarLogo.imageUrl ? (
                    <img
                      src={logoSettings.sidebarLogo.imageUrl}
                      alt='Sidebar Logo Preview'
                      className='h-5 w-5 object-contain'
                    />
                  ) : (
                    <div className='h-5 w-5 bg-green-500 rounded flex items-center justify-center'>
                      <span className='text-white text-xs font-bold'>H</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {onNavigateToModule && <QuickActions onNavigateToModule={onNavigateToModule} />}
      {!onNavigateToModule && <QuickActions />}
    </div>
  );
};

// Main Dashboard Content Component
const DashboardContent: React.FC<{
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}> = ({ onNavigateToModule }) => {
  const [statsExpanded, setStatsExpanded] = useState(true);
  const { user } = useAuth();

  const welcomeText = user?.firstName
    ? `Welcome back, ${user.firstName}!`
    : 'Welcome back!';

  useEffect(() => {
    // Load saved state from localStorage
    const savedState = localStorage.getItem('dashboardStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('dashboardStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      {/* Demo Data Initializer */}
      <DemoDataInitializer />
      
      {/* Welcome Section */}
      <div className='bg-constructbms-green rounded-xl p-6'>
        <h1 className='text-2xl font-bold mb-2 banner-text-dark'>
          {welcomeText}
        </h1>
        <p className='banner-text-dark-secondary'>
          Here's how things look today.
        </p>
      </div>

      {/* Collapsible Stats Cards */}
      <div>
        <button
          onClick={toggleStats}
          className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-constructbms-green transition-colors mb-4'
        >
          {statsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          Dashboard Metrics
        </button>

        {statsExpanded && (
          <div className='animate-in slide-in-from-top-2 duration-200'>
            <StatsCards />
          </div>
        )}
      </div>

      {/* Main Dashboard Grid */}
      <RevenueChart />
      {onNavigateToModule ? <TasksWidget onNavigateToModule={onNavigateToModule} /> : <TasksWidget />}
      {onNavigateToModule ? <ProjectsOverview onNavigateToModule={onNavigateToModule} /> : <ProjectsOverview />}
      {onNavigateToModule ? <RecentActivity onNavigateToModule={onNavigateToModule} /> : <RecentActivity />}
    </div>
  );
};

// Default layout for the main dashboard tab
const defaultDashboardTabs: DashboardTab[] = [
  {
    id: 'quick-start',
    label: 'Quick Start',
    icon: 'lightning-bolt',
    moduleKey: 'quick-start',
    type: 'builtin',
  },
  {
    id: 'main-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    moduleKey: 'dashboard',
    type: 'builtin',
    widgets: [
      {
        id: 'stats-cards-1',
        type: 'stats-cards',
        width: 2, // Span 2 columns for wider stats cards
        height: 1,
        config: {},
      },
      {
        id: 'revenue-chart-1',
        type: 'revenue-chart',
        width: 1,
        height: 2, // Span 2 rows for taller chart
        config: {},
      },
      {
        id: 'tasks-widget-1',
        type: 'tasks-widget',
        width: 1,
        height: 2, // Span 2 rows for task list
        config: {},
      },
      {
        id: 'projects-overview-1',
        type: 'projects-overview',
        width: 2, // Span 2 columns for project overview
        height: 2, // Span 2 rows
        config: {},
      },
      {
        id: 'recent-activity-1',
        type: 'recent-activity',
        width: 2, // Span 2 columns for activity feed
        height: 2, // Span 2 rows
        config: {},
      },
      {
        id: 'performance-metrics-1',
        type: 'performance-metrics',
        width: 1,
        height: 1,
        config: {},
      },
      {
        id: 'email-overview-1',
        type: 'email-overview',
        width: 1,
        height: 1,
        config: {},
      },
    ],
  },
  {
    id: 'activity-stream',
    label: 'Activity Stream',
    icon: 'bars-3-bottom-left',
    moduleKey: 'activity-stream',
    type: 'builtin',
  },
];

const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToModule,
  activeModule,
}) => {
  const [activeTab, setActiveTab] = useState('main-dashboard');
  const [tabs, setTabs] = useState<DashboardTab[]>(defaultDashboardTabs);
  const [loading, setLoading] = useState(true);
  const [showWidgetPalette, setShowWidgetPalette] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load tabs from Supabase on mount
  useEffect(() => {
    async function loadTabs() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return;
      let loaded = await getDashboardLayout(userId);
      if (!loaded) {
        loaded = defaultDashboardTabs;
        await saveDashboardLayout(userId, loaded);
      }
      setTabs(loaded);
      setLoading(false);
    }
    loadTabs();
    // eslint-disable-next-line
  }, []);

  // Reset dashboard to default layout
  const resetToDefaultLayout = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;
    if (userId) {
      await saveDashboardLayout(userId, defaultDashboardTabs);
      setTabs(defaultDashboardTabs);
    }
  };

  // Set active tab based on activeModule prop
  useEffect(() => {
    if (activeModule) {
      switch (activeModule) {
        case 'quick-start':
          setActiveTab('quick-start');
          break;
        case 'main-dashboard':
        case 'dashboard':
          setActiveTab('main-dashboard');
          break;
        case 'activity-stream':
          setActiveTab('activity-stream');
          break;
        default:
          setActiveTab('main-dashboard');
      }
    }
  }, [activeModule]);

  // Save tabs to Supabase on any change
  const persistTabs = async (updatedTabs: DashboardTab[]) => {
    setTabs(updatedTabs);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;
    if (userId) {
      await saveDashboardLayout(userId, updatedTabs);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTabEdit = (tabId: string, newLabel: string) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, label: newLabel } : tab
    );
    persistTabs(updatedTabs);
  };

  const handleTabDelete = (tabId: string) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      if (activeTab === tabId && newTabs.length > 0 && newTabs[0]) {
        setActiveTab(newTabs[0].id);
      }
      persistTabs(newTabs);
    }
  };

  const handleTabAdd = () => {
    const newTabId = `custom-page-${Date.now()}`;
    const newTab: DashboardTab = {
      id: newTabId,
      label: 'New Page',
      icon: 'document',
      moduleKey: newTabId,
      type: 'custom',
      widgets: [],
    };
    const updatedTabs = [...tabs, newTab];
    setActiveTab(newTabId);
    persistTabs(updatedTabs);
  };

  const handleWidgetsChange = (tabId: string, widgets: WidgetInstance[]) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, widgets } : tab
    );
    persistTabs(updatedTabs);
  };



  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };



  // Check if current tab is a page builder tab
  const isPageBuilderTab = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    return activeTabData?.type === 'custom' || activeTab === 'main-dashboard';
  };

  const renderActiveTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (!currentTab) return null;
    switch (currentTab.type) {
      case 'builtin':
        switch (activeTab) {
          case 'quick-start':
            return onNavigateToModule ? <QuickStart onNavigateToModule={onNavigateToModule} /> : <QuickStart />;
          case 'dashboard':
            return onNavigateToModule ? <DashboardContent onNavigateToModule={onNavigateToModule} /> : <DashboardContent />;
          case 'activity-stream':
            return onNavigateToModule ? <ActivityStream onNavigateToModule={onNavigateToModule} /> : <ActivityStream />;
          default:
            return onNavigateToModule ? (
              <PageBuilder
                widgets={currentTab.widgets || []}
                onWidgetsChange={(widgets) => handleWidgetsChange(currentTab.id, widgets)}
                onNavigateToModule={onNavigateToModule}
                showWidgetPalette={showWidgetPalette}
                setShowWidgetPalette={setShowWidgetPalette}
                showGrid={showGrid}
                isLocked={isLocked}
                onToggleLock={handleToggleLock}
              />
            ) : (
              <PageBuilder
                widgets={currentTab.widgets || []}
                onWidgetsChange={(widgets) => handleWidgetsChange(currentTab.id, widgets)}
                showWidgetPalette={showWidgetPalette}
                setShowWidgetPalette={setShowWidgetPalette}
                showGrid={showGrid}
                isLocked={isLocked}
                onToggleLock={handleToggleLock}
              />
            );
        }
      case 'custom':
        return onNavigateToModule ? (
          <PageBuilder
            widgets={currentTab.widgets || []}
            onWidgetsChange={widgets => handleWidgetsChange(currentTab.id, widgets)}
            onNavigateToModule={onNavigateToModule}
            showWidgetPalette={showWidgetPalette}
            setShowWidgetPalette={setShowWidgetPalette}
            showGrid={showGrid}
            isLocked={isLocked}
            onToggleLock={handleToggleLock}
          />
        ) : (
          <PageBuilder
            widgets={currentTab.widgets || []}
            onWidgetsChange={widgets => handleWidgetsChange(currentTab.id, widgets)}
            showWidgetPalette={showWidgetPalette}
            setShowWidgetPalette={setShowWidgetPalette}
            showGrid={showGrid}
            isLocked={isLocked}
            onToggleLock={handleToggleLock}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className='p-8 text-center text-gray-500'>Loading dashboard...</div>
    );
  }

  return (
    <div className='space-y-6 overflow-visible'>
      {/* Tabbed Interface */}
      <DashboardTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onTabEdit={handleTabEdit}
        onTabDelete={handleTabDelete}
        onTabAdd={handleTabAdd}
        showPageBuilderControls={isPageBuilderTab()}
        onOpenSettings={handleOpenSettings}
      />

      {/* Tab Content */}
      {renderActiveTabContent()}

      {/* Settings Modal */}
      {showSettings && (
        <DashboardSettings
          showGrid={showGrid}
          onToggleGrid={handleToggleGrid}
          isLocked={isLocked}
          onToggleLock={handleToggleLock}
          onClose={handleCloseSettings}
          onWidgetsChange={(widgets) => {
            const currentTab = tabs.find(tab => tab.id === activeTab);
            if (currentTab) {
              handleWidgetsChange(currentTab.id, widgets);
            }
          }}
          widgets={tabs.find(tab => tab.id === activeTab)?.widgets || []}
          activeTab={activeTab}
          tabs={tabs}
          onLoadDashboardState={(state) => {
            // Load the full dashboard state
            setTabs(state.tabs);
            setActiveTab(state.activeTab);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
