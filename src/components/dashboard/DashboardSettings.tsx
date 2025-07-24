import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  ViewColumnsIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
  SwatchIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import WidgetBuilder from './WidgetBuilder';
import LayoutDesigner from './LayoutDesigner';
import WidgetPlacement from './WidgetPlacement';
import { WIDGET_SIZES } from '../widgets/WidgetTypes';

interface DashboardSettingsProps {
  activeTab?: string;
  isLocked: boolean;
  onClose: () => void;
  onLoadDashboardState?: (state: any) => void;
  onToggleGrid: () => void;
  onToggleLock: () => void;
  onWidgetsChange?: (widgets: any[]) => void;
  showGrid: boolean;
  tabs?: any[];
  widgets?: any[];
}

type SettingsView = 'main' | 'widget-builder' | 'layout-designer' | 'widget-placement' | 'saved-layouts';

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  showGrid,
  onToggleGrid,
  isLocked,
  onToggleLock,
  onClose,
  onWidgetsChange,
  widgets = [],
  activeTab,
  tabs = [],
  onLoadDashboardState,
}) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [layoutName, setLayoutName] = useState('');
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  const [editingLayout, setEditingLayout] = useState<any>(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
    setCurrentView('layout-designer');
  };

  const handleCreateCustomLayout = () => {
    setSelectedLayout('custom');
    setCurrentView('layout-designer');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedLayout(null);
    setLayoutName('');
    setEditingLayout(null);
  };

  const handleLayoutNameSubmit = () => {
    if (layoutName.trim()) {
      setCurrentView('widget-placement');
    }
  };

  const handleWidgetPlacementSave = (placedWidgets: any[]) => {
    // Convert PlacedWidget objects to WidgetInstance objects
    const convertedWidgets = placedWidgets.map((placedWidget: any) => ({
      id: placedWidget.id,
      type: placedWidget.type,
      width: placedWidget.size.width,
      height: placedWidget.size.height,
      config: placedWidget.content || {},
    }));
    
    // Save the layout with widgets
    if (onWidgetsChange) {
      onWidgetsChange(convertedWidgets);
    }
    
    // Save to localStorage for layout management
    const layoutToSave = {
      id: `layout-${Date.now()}`,
      name: layoutName,
      widgets: convertedWidgets,
      createdAt: new Date().toISOString(),
    };
    
    const existingLayouts = JSON.parse(localStorage.getItem('savedLayouts') || '[]');
    existingLayouts.push(layoutToSave);
    localStorage.setItem('savedLayouts', JSON.stringify(existingLayouts));
    
    onClose(); // Close the modal after saving
  };

  const saveCurrentDashboardState = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (!currentTab) return;

    const dashboardState = {
      id: `dashboard-${Date.now()}`,
      name: `Dashboard - ${currentTab.label}`,
      activeTab: activeTab,
      tabs: tabs,
      widgets: widgets,
      createdAt: new Date().toISOString(),
    };
    
    const existingLayouts = JSON.parse(localStorage.getItem('savedLayouts') || '[]');
    existingLayouts.push(dashboardState);
    localStorage.setItem('savedLayouts', JSON.stringify(existingLayouts));
    loadSavedLayouts(); // Refresh the list
  };

  const loadSavedLayouts = () => {
    const layouts = JSON.parse(localStorage.getItem('savedLayouts') || '[]');
    setSavedLayouts(layouts);
  };

  const deleteSavedLayout = (layoutId: string) => {
    const updatedLayouts = savedLayouts.filter(layout => layout.id !== layoutId);
    localStorage.setItem('savedLayouts', JSON.stringify(updatedLayouts));
    setSavedLayouts(updatedLayouts);
  };

  const loadSavedLayout = (layout: any) => {
    // Check if this is a full dashboard state or just widgets
    if (layout.activeTab && layout.tabs) {
      // Full dashboard state
      if (onLoadDashboardState) {
        onLoadDashboardState(layout);
      }
    } else {
      // Just widgets (legacy format)
      if (onWidgetsChange) {
        onWidgetsChange(layout.widgets);
      }
    }
    onClose();
  };

  // Load saved layouts on component mount
  useEffect(() => {
    loadSavedLayouts();
  }, []);

  if (currentView === 'widget-builder') {
    return (
      <WidgetBuilder
        layoutName={layoutName}
        selectedLayout={selectedLayout}
        onBack={handleBackToMain}
        onClose={onClose}
        onWidgetsChange={onWidgetsChange || (() => {})}
        widgets={widgets}
      />
    );
  }

  if (currentView === 'layout-designer') {
    // Use current dashboard widgets when editing current layout, or saved layout widgets when editing a saved layout
    const existingWidgets = editingLayout ? editingLayout.widgets : widgets;

    return (
      <LayoutDesigner
        selectedLayout={selectedLayout}
        layoutName={layoutName}
        setLayoutName={setLayoutName}
        onBack={handleBackToMain}
        onClose={onClose}
        onSubmit={handleLayoutNameSubmit}
        existingWidgets={existingWidgets}
      />
    );
  }

  if (currentView === 'saved-layouts') {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='rounded-xl shadow-xl max-w-4xl w-full mx-4 bg-gray-900 max-h-[90vh] overflow-hidden'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-constructbms-blue/20 rounded-lg flex items-center justify-center'>
                <FolderIcon className='h-6 w-6 text-constructbms-blue' />
              </div>
              <div>
                <h2 className='text-xl font-semibold text-white'>
                  Saved Layouts
                </h2>
                <p className='text-sm text-gray-300'>
                  Manage your saved dashboard layouts
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={loadSavedLayouts}
                className='p-2 text-gray-400 hover:text-gray-300 transition-colors'
                title='Refresh layouts'
              >
                <ArrowPathIcon className='h-5 w-5' />
              </button>
              <button
                onClick={handleBackToMain}
                className='text-gray-400 hover:text-gray-300 transition-colors'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Current Dashboard Actions */}
          <div className='px-6 pt-4 border-b border-gray-700 space-y-3'>
            <button
              onClick={saveCurrentDashboardState}
              className='w-full px-4 py-3 bg-constructbms-blue text-white rounded-lg font-medium hover:bg-constructbms-green transition-colors flex items-center justify-center space-x-2'
            >
              <PlusIcon className='h-4 w-4' />
              <span>Save Current Dashboard</span>
            </button>
            <button
              onClick={() => {
                setSelectedLayout('custom');
                setLayoutName(`Edit ${tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}`);
                setEditingLayout(null); // No saved layout to edit
                setCurrentView('layout-designer');
              }}
              className='w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2'
            >
              <SwatchIcon className='h-4 w-4' />
              <span>Edit Current Layout</span>
            </button>
          </div>

          {/* Layouts List */}
          <div className='p-6 overflow-y-auto max-h-[60vh]'>
            {savedLayouts.length === 0 ? (
              <div className='text-center py-12'>
                <FolderIcon className='h-16 w-16 text-gray-600 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-300 mb-2'>No saved layouts</h3>
                <p className='text-gray-400 mb-4'>
                  Save your current dashboard or create new layouts
                </p>
                <button
                  onClick={handleBackToMain}
                  className='px-4 py-2 bg-constructbms-blue text-white rounded-lg font-medium hover:bg-constructbms-green transition-colors'
                >
                  Create New Layout
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {savedLayouts.map((layout) => (
                  <div
                    key={layout.id}
                    className='bg-gray-800 rounded-lg border border-gray-700 p-4 hover:bg-gray-750 transition-colors'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-white text-lg mb-1'>
                          {layout.name}
                        </h3>
                        <div className='text-sm text-gray-400 space-y-1'>
                          {layout.activeTab && layout.tabs ? (
                            <>
                              <p>Full Dashboard State</p>
                              <p>Active Tab: {layout.tabs.find((t: any) => t.id === layout.activeTab)?.label || layout.activeTab}</p>
                              <p>{layout.tabs.length} tabs, {layout.widgets?.length || 0} widgets</p>
                            </>
                          ) : (
                            <p>{layout.widgets?.length || 0} widgets</p>
                          )}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          Created: {new Date(layout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSavedLayout(layout.id)}
                        className='p-1 text-red-400 hover:text-red-300 transition-colors ml-2'
                        title='Delete layout'
                      >
                        <TrashIcon className='h-4 w-4' />
                      </button>
                    </div>
                    
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => loadSavedLayout(layout)}
                        className='flex-1 px-3 py-2 bg-constructbms-blue text-white rounded text-sm font-medium hover:bg-constructbms-green transition-colors'
                      >
                        Load Dashboard
                      </button>
                      {!layout.activeTab && (
                        <button
                          onClick={() => {
                            setSelectedLayout('custom');
                            setLayoutName(`Edit ${layout.name}`);
                            setEditingLayout(layout);
                            setCurrentView('layout-designer');
                          }}
                          className='px-3 py-2 bg-gray-600 text-gray-300 rounded text-sm font-medium hover:bg-gray-500 transition-colors'
                        >
                          Edit Widgets
                        </button>
                      )}
                      {layout.activeTab && (
                        <button
                          onClick={() => {
                            setSelectedLayout('custom');
                            setLayoutName(`Edit ${layout.name}`);
                            setEditingLayout(layout);
                            setCurrentView('layout-designer');
                          }}
                          className='px-3 py-2 bg-gray-600 text-gray-300 rounded text-sm font-medium hover:bg-gray-500 transition-colors'
                        >
                          Edit Widgets
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-gray-700 bg-gray-900'>
            <button
              onClick={handleBackToMain}
              className='w-full px-4 py-2 bg-constructbms-blue text-white rounded-lg font-medium hover:bg-constructbms-green transition-colors'
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'widget-placement') {
    // Get placeholders from the selected layout
    const predefinedLayouts = [
      {
        id: 'executive',
        placeholders: [
          { id: '1', size: WIDGET_SIZES.WIDE, x: 0, y: 0, type: 'placeholder' as const },
          { id: '2', size: WIDGET_SIZES.MEDIUM, x: 0, y: 2, type: 'placeholder' as const },
          { id: '3', size: WIDGET_SIZES.MEDIUM, x: 3, y: 2, type: 'placeholder' as const },
          { id: '4', size: WIDGET_SIZES.LARGE, x: 0, y: 4, type: 'placeholder' as const },
          { id: '5', size: { width: 2, height: 3 }, x: 4, y: 4, type: 'placeholder' as const },
          { id: '6', size: WIDGET_SIZES.WIDE, x: 0, y: 7, type: 'placeholder' as const },
        ],
      },
      {
        id: 'analytics',
        placeholders: [
          { id: '1', size: WIDGET_SIZES.LARGE, x: 0, y: 0, type: 'placeholder' as const },
          { id: '2', size: { width: 2, height: 3 }, x: 4, y: 0, type: 'placeholder' as const },
          { id: '3', size: WIDGET_SIZES.LARGE, x: 0, y: 3, type: 'placeholder' as const },
          { id: '4', size: { width: 2, height: 3 }, x: 4, y: 3, type: 'placeholder' as const },
          { id: '5', size: WIDGET_SIZES.WIDE, x: 0, y: 6, type: 'placeholder' as const },
          { id: '6', size: WIDGET_SIZES.MEDIUM, x: 0, y: 8, type: 'placeholder' as const },
          { id: '7', size: WIDGET_SIZES.MEDIUM, x: 3, y: 8, type: 'placeholder' as const },
        ],
      },
      {
        id: 'productivity',
        placeholders: [
          { id: '1', size: WIDGET_SIZES.TALL, x: 0, y: 0, type: 'placeholder' as const },
          { id: '2', size: { width: 4, height: 2 }, x: 2, y: 0, type: 'placeholder' as const },
          { id: '3', size: { width: 4, height: 2 }, x: 2, y: 2, type: 'placeholder' as const },
          { id: '4', size: WIDGET_SIZES.LARGE, x: 0, y: 4, type: 'placeholder' as const },
          { id: '5', size: { width: 2, height: 3 }, x: 4, y: 4, type: 'placeholder' as const },
          { id: '6', size: WIDGET_SIZES.WIDE, x: 0, y: 7, type: 'placeholder' as const },
          { id: '7', size: WIDGET_SIZES.MEDIUM, x: 0, y: 9, type: 'placeholder' as const },
          { id: '8', size: WIDGET_SIZES.MEDIUM, x: 3, y: 9, type: 'placeholder' as const },
        ],
      },
      {
        id: 'monitoring',
        placeholders: [
          { id: '1', size: WIDGET_SIZES.SQUARE, x: 0, y: 0, type: 'placeholder' as const },
          { id: '2', size: WIDGET_SIZES.SQUARE, x: 3, y: 0, type: 'placeholder' as const },
          { id: '3', size: WIDGET_SIZES.MEDIUM, x: 0, y: 3, type: 'placeholder' as const },
          { id: '4', size: WIDGET_SIZES.MEDIUM, x: 3, y: 3, type: 'placeholder' as const },
          { id: '5', size: WIDGET_SIZES.WIDE, x: 0, y: 5, type: 'placeholder' as const },
        ],
      },
    ];

    const selectedLayoutData = predefinedLayouts.find(l => l.id === selectedLayout);
    const placeholders = selectedLayoutData?.placeholders || [];

    return (
      <WidgetPlacement
        layoutName={layoutName}
        selectedLayout={selectedLayout}
        placeholders={placeholders}
        onBack={handleBackToMain}
        onClose={onClose}
        onSave={handleWidgetPlacementSave}
      />
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='rounded-xl shadow-xl max-w-2xl w-full mx-4 bg-gray-900 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-constructbms-blue/20 rounded-lg flex items-center justify-center'>
              <Cog6ToothIcon className='h-6 w-6 text-constructbms-blue' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-white'>
                Dashboard Settings
              </h2>
              <p className='text-sm text-gray-300'>
                Configure your dashboard layout and widgets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Settings Options */}
        <div className='p-6 space-y-4 overflow-y-auto max-h-[60vh]'>
          {/* Widget Builder */}
          <div className='flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-constructbms-blue/20 rounded-lg flex items-center justify-center'>
                <WrenchScrewdriverIcon className='h-5 w-5 text-constructbms-blue' />
              </div>
              <div>
                <h3 className='font-semibold text-white'>Widget Builder</h3>
                <p className='text-sm text-gray-300'>
                  Create custom widgets with metrics, statistics, and content
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('widget-builder')}
              className='px-4 py-2 bg-constructbms-blue text-white rounded-lg font-medium hover:bg-constructbms-green transition-colors flex items-center space-x-2'
            >
              <PlusIcon className='h-4 w-4' />
              <span>Build Widget</span>
            </button>
          </div>

          {/* Layout Designer */}
          <div className='flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-constructbms-blue/20 rounded-lg flex items-center justify-center'>
                <SwatchIcon className='h-5 w-5 text-constructbms-blue' />
              </div>
              <div>
                <h3 className='font-semibold text-white'>Layout Designer</h3>
                <p className='text-sm text-gray-300'>
                  Choose from pre-designed layouts or create custom arrangements
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateCustomLayout}
              className='px-4 py-2 bg-constructbms-blue text-white rounded-lg font-medium hover:bg-constructbms-green transition-colors flex items-center space-x-2'
            >
              <PlusIcon className='h-4 w-4' />
              <span>Design Layout</span>
            </button>
          </div>

          {/* Saved Layouts */}
          <div className='flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-constructbms-blue/20 rounded-lg flex items-center justify-center'>
                <FolderIcon className='h-5 w-5 text-constructbms-blue' />
              </div>
              <div>
                <h3 className='font-semibold text-white'>Saved Layouts</h3>
                <p className='text-sm text-gray-300'>
                  View, load, and manage your saved dashboard layouts
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('saved-layouts')}
              className='px-4 py-2 bg-constructbms-blue text-white rounded-lg font-medium hover:bg-constructbms-green transition-colors flex items-center space-x-2'
            >
              <span>Manage ({savedLayouts.length})</span>
            </button>
          </div>

          {/* Pre-designed Layouts */}
          <div className='space-y-3'>
            <h4 className='font-medium text-white text-sm'>Quick Layouts</h4>
            <div className='grid grid-cols-2 gap-3'>
              {[
                { id: 'executive', name: 'Executive Dashboard', description: 'High-level metrics and KPIs' },
                { id: 'analytics', name: 'Analytics Hub', description: 'Charts, graphs, and data visualization' },
                { id: 'productivity', name: 'Productivity Center', description: 'Tasks, projects, and team overview' },
                { id: 'monitoring', name: 'System Monitor', description: 'Performance metrics and alerts' },
              ].map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout.id)}
                  className='p-3 text-left bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 transition-colors'
                >
                  <h5 className='font-medium text-white text-sm'>{layout.name}</h5>
                  <p className='text-xs text-gray-300 mt-1'>{layout.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Settings */}
          <div className='space-y-3 pt-4 border-t border-gray-700'>
            <h4 className='font-medium text-white text-sm'>Display Settings</h4>
            
            {/* Lock/Unlock Widgets */}
            <div className='flex items-center justify-between p-3 bg-gray-800 rounded-lg'>
            <div className='flex items-center space-x-3'>
                {isLocked ? (
                  <LockClosedIcon className='h-4 w-4 text-red-400' />
                ) : (
                  <LockOpenIcon className='h-4 w-4 text-green-400' />
                )}
              <div>
                  <h5 className='font-medium text-white text-sm'>Widget Lock</h5>
                  <p className='text-xs text-gray-300'>
                    {isLocked ? 'Widgets are locked' : 'Widgets can be moved'}
                </p>
              </div>
            </div>
            <button
                onClick={onToggleLock}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isLocked
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>

            {/* Show/Hide Grid */}
            <div className='flex items-center justify-between p-3 bg-gray-800 rounded-lg'>
            <div className='flex items-center space-x-3'>
                <ViewColumnsIcon className='h-4 w-4 text-constructbms-blue' />
              <div>
                  <h5 className='font-medium text-white text-sm'>Grid Overlay</h5>
                  <p className='text-xs text-gray-300'>
                    {showGrid ? 'Grid is visible' : 'Grid is hidden'}
                </p>
              </div>
            </div>
            <button
                onClick={onToggleGrid}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  showGrid
                    ? 'bg-constructbms-blue/20 text-constructbms-blue hover:bg-constructbms-blue/30'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {showGrid ? 'Hide' : 'Show'}
            </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-700 bg-gray-900'>
          <button
            onClick={onClose}
            className='w-full px-4 py-2 bg-constructbms-blue text-white rounded-lg font-medium hover:bg-constructbms-green transition-colors'
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;
