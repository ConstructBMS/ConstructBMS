import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  SwatchIcon,
  StarIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import TabColouring from './TabColouring';
import { tabColouringService } from '../../services/tabColouringService';
import type { AstaView, TabColor } from '../../services/tabColouringService';

const TabColouringTest: React.FC = () => {
  const [projectId, setProjectId] = useState<string>('demo-project-1');
  const [userRole, setUserRole] = useState<string>('editor');
  const [loading, setLoading] = useState<boolean>(true);
  const [views, setViews] = useState<AstaView[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showViewDetails, setShowViewDetails] = useState<boolean>(false);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, [projectId]);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      const projectViews = await tabColouringService.getProjectViews(projectId);
      setViews(projectViews);
      
      // Set first view as selected
      if (projectViews.length > 0) {
        setSelectedViewId(projectViews[0].id);
      }
      
      setLastUpdate('Demo data loaded');
    } catch (error) {
      console.error('Failed to load demo data:', error);
      setErrorMessage('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view: AstaView) => {
    setSelectedViewId(view.id);
    setLastUpdate(`Selected view: ${view.name}`);
  };

  const handleViewCreate = (view: AstaView) => {
    setViews(prev => [...prev, view]);
    setLastUpdate(`Created view: ${view.name}`);
    setInfoMessage(`View "${view.name}" created successfully`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const handleViewUpdate = (view: AstaView) => {
    setViews(prev => prev.map(v => v.id === view.id ? view : v));
    setLastUpdate(`Updated view: ${view.name}`);
    setInfoMessage(`View "${view.name}" updated successfully`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const handleViewDelete = (viewId: string) => {
    const deletedView = views.find(v => v.id === viewId);
    setViews(prev => prev.filter(v => v.id !== viewId));
    
    if (selectedViewId === viewId) {
      setSelectedViewId(views.length > 1 ? views[0].id : '');
    }
    
    setLastUpdate(`Deleted view: ${deletedView?.name || 'Unknown'}`);
    setInfoMessage(`View "${deletedView?.name || 'Unknown'}" deleted successfully`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const handleCreateTestView = async () => {
    try {
      const newView = await tabColouringService.createView({
        project_id: projectId,
        name: 'Test View',
        description: 'A test view created from the test interface',
        view_type: 'gantt',
        tab_color: 'pink',
        is_default: false,
        sort_order: views.length + 1
      });

      if (newView) {
        setViews(prev => [...prev, newView]);
        setLastUpdate('Test view created');
        setInfoMessage('Test view created successfully');
        setTimeout(() => setInfoMessage(null), 3000);
      }
    } catch (error) {
      console.error('Test view creation failed:', error);
      setErrorMessage('Failed to create test view');
    }
  };

  const handleDeleteAllViews = async () => {
    if (!confirm('Are you sure you want to delete all views?')) return;

    try {
      for (const view of views) {
        await tabColouringService.deleteView(view.id);
      }
      setViews([]);
      setSelectedViewId('');
      setLastUpdate('All views deleted');
      setInfoMessage('All views deleted successfully');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (error) {
      console.error('Delete all views failed:', error);
      setErrorMessage('Failed to delete all views');
    }
  };

  const handleValidateViews = async () => {
    try {
      const issues: string[] = [];

      // Check for duplicate names
      const names = views.map(v => v.name.toLowerCase());
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        issues.push(`Duplicate view names: ${[...new Set(duplicates)].join(', ')}`);
      }

      // Check for multiple default views
      const defaultViews = views.filter(v => v.is_default);
      if (defaultViews.length > 1) {
        issues.push(`Multiple default views: ${defaultViews.map(v => v.name).join(', ')}`);
      }

      // Check for invalid sort orders
      const sortOrders = views.map(v => v.sort_order);
      const invalidSort = sortOrders.some((order, index) => order !== index + 1);
      if (invalidSort) {
        issues.push('Invalid sort order sequence');
      }

      if (issues.length === 0) {
        setInfoMessage('All views are valid');
      } else {
        setErrorMessage(`Validation issues found:\n${issues.join('\n')}`);
      }
      setTimeout(() => {
        setInfoMessage(null);
        setErrorMessage(null);
      }, 5000);
    } catch (error) {
      console.error('View validation failed:', error);
      setErrorMessage('Failed to validate views');
    }
  };

  const getViewStats = () => {
    const viewTypes = views.reduce((acc, view) => {
      acc[view.view_type] = (acc[view.view_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colorCounts = views.reduce((acc, view) => {
      acc[view.tab_color] = (acc[view.tab_color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: views.length,
      defaultCount: views.filter(v => v.is_default).length,
      viewTypes,
      colorCounts
    };
  };

  const getViewTypeIcon = (viewType: AstaView['view_type']) => {
    switch (viewType) {
      case 'gantt':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'timeline':
        return <CalendarIcon className="w-4 h-4" />;
      case 'calendar':
        return <CalendarIcon className="w-4 h-4" />;
      case 'resource':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'cost':
        return <CurrencyDollarIcon className="w-4 h-4" />;
      case 'custom':
        return <ViewColumnsIcon className="w-4 h-4" />;
      default:
        return <ViewColumnsIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  const stats = getViewStats();
  const selectedView = views.find(v => v.id === selectedViewId);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tab Colouring Test</h1>
          <p className="text-gray-600">Test the Tab Colouring system with view management, color assignments, and Asta PowerProject styling</p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">User Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Project ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Project ID</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="demo-project-1">Demo Project 1</option>
                <option value="demo-project-2">Demo Project 2</option>
                <option value="demo-project-3">Demo Project 3</option>
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Actions</label>
              <div className="space-y-1">
                <button
                  onClick={loadDemoData}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                  Reload Data
                </button>
                <button
                  onClick={handleCreateTestView}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Test View
                </button>
              </div>
            </div>

            {/* View Operations */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">View Operations</label>
              <div className="space-y-1">
                <button
                  onClick={handleValidateViews}
                  className="w-full px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                >
                  <CheckIcon className="w-4 h-4 inline mr-1" />
                  Validate Views
                </button>
                <button
                  onClick={handleDeleteAllViews}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  <TrashIcon className="w-4 h-4 inline mr-1" />
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Views: <span className="font-medium text-gray-900">{stats.total}</span>
              </span>
              <span className="text-gray-600">
                Default: <span className="font-medium text-gray-900">{stats.defaultCount}</span>
              </span>
              <span className="text-gray-600">
                Project: <span className="font-medium text-blue-600">{projectId}</span>
              </span>
              <span className="text-gray-600">
                User Role: <span className="font-medium text-gray-900">{userRole}</span>
              </span>
              <span className="text-gray-600">
                Selected: <span className="font-medium text-gray-900">{selectedView?.name || 'None'}</span>
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                Last: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* View Statistics */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">View Statistics</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowViewDetails(!showViewDetails)}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                {showViewDetails ? <EyeSlashIcon className="w-4 h-4 mr-1" /> : <EyeIcon className="w-4 h-4 mr-1" />}
                {showViewDetails ? 'Hide Details' : 'Show Details'}
              </button>
              <button
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                <SwatchIcon className="w-4 h-4 mr-1" />
                Color Palette
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-700">Total Views</div>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm font-medium text-green-700">Default Views</div>
              <div className="text-2xl font-bold text-green-900">{stats.defaultCount}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-700">View Types</div>
              <div className="text-lg font-bold text-purple-900">{Object.keys(stats.viewTypes).length}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-700">Colors Used</div>
              <div className="text-lg font-bold text-orange-900">{Object.keys(stats.colorCounts).length}</div>
            </div>
          </div>

          {/* View Details */}
          {showViewDetails && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">View Types Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(stats.viewTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-1">
                        {getViewTypeIcon(type as AstaView['view_type'])}
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Color Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {Object.entries(stats.colorCounts).map(([color, count]) => {
                    const colorOption = tabColouringService.getTabColorOption(color as TabColor);
                    return (
                      <div key={color} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded ${colorOption?.bgClass}`} />
                          <span className="text-sm font-medium capitalize">{color}</span>
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Color Palette */}
          {showColorPalette && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Available Colors</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {tabColouringService.getTabColorOptions().map((color) => (
                  <div key={color.value} className="flex items-center space-x-2 p-2 bg-white rounded border">
                    <div className={`w-4 h-4 rounded ${color.bgClass}`} />
                    <div>
                      <div className="text-sm font-medium">{color.label}</div>
                      <div className="text-xs text-gray-500">{color.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Colouring Component */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Tab Colouring Interface</h3>
            <p className="text-sm text-gray-600 mt-1">
              Interactive tab colouring system with view management and color assignments
            </p>
          </div>
          
          <div className="p-4">
            <TabColouring
              projectId={projectId}
              userRole={userRole}
              onViewChange={handleViewChange}
              onViewCreate={handleViewCreate}
              onViewUpdate={handleViewUpdate}
              onViewDelete={handleViewDelete}
              selectedViewId={selectedViewId}
            />
          </div>
        </div>

        {/* Selected View Details */}
        {selectedView && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected View Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View Name</label>
                <p className="text-gray-900 font-medium">{selectedView.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View Type</label>
                <div className="flex items-center space-x-2">
                  {getViewTypeIcon(selectedView.view_type)}
                  <span className="text-gray-900 capitalize">{selectedView.view_type}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tab Color</label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: tabColouringService.getTabColorOption(selectedView.tab_color)?.bgClass.replace('bg-', '#') || '#3b82f6' }}
                  />
                  <span className="text-gray-900 capitalize">{selectedView.tab_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  {selectedView.is_default ? (
                    <>
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-900">Default View</span>
                    </>
                  ) : (
                    <>
                      <StarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">Standard View</span>
                    </>
                  )}
                </div>
              </div>
              {selectedView.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedView.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">How to Use Tab Colouring</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click on view tabs to select and switch between views</li>
                <li>• Use the color dropdown to assign different colors to tabs</li>
                <li>• Create new views with different types (Gantt, Timeline, Resource, etc.)</li>
                <li>• Set a default view that opens automatically</li>
                <li>• Edit view properties including name, description, and color</li>
                <li>• Reorder views by dragging and dropping</li>
                <li>• Colors are saved in the database and persist across sessions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              <div className="whitespace-pre-line">{errorMessage}</div>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              {infoMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabColouringTest; 