import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  ArrowsUpDownIcon,
  SwatchIcon,
  ViewColumnsIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { tabColouringService } from '../../services/tabColouringService';
import type { 
  AstaView, 
  TabColor, 
  TabColorOption
} from '../../services/tabColouringService';

interface TabColouringProps {
  onViewChange?: (view: AstaView) => void;
  onViewCreate?: (view: AstaView) => void;
  onViewDelete?: (viewId: string) => void;
  onViewUpdate?: (view: AstaView) => void;
  projectId: string;
  selectedViewId?: string;
  userRole: string;
}

interface ViewEditState {
  description: string;
  name: string;
  tabColor: TabColor;
  viewId: string | null;
  viewType: AstaView['view_type'];
}

const TabColouring: React.FC<TabColouringProps> = ({
  projectId,
  userRole,
  onViewChange,
  onViewCreate,
  onViewUpdate,
  onViewDelete,
  selectedViewId
}) => {
  const [views, setViews] = useState<AstaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState<ViewEditState>({
    viewId: null,
    name: '',
    description: '',
    viewType: 'gantt',
    tabColor: 'blue'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState<string | null>(null);

  const canEdit = userRole !== 'viewer';
  const colorOptions = tabColouringService.getTabColorOptions();

  // Load views on mount
  useEffect(() => {
    loadViews();
  }, [projectId]);

  const loadViews = async () => {
    try {
      setLoading(true);
      const projectViews = await tabColouringService.getProjectViews(projectId);
      setViews(projectViews);
    } catch (error) {
      console.error('Failed to load views:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view selection
  const handleViewSelect = (view: AstaView) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Handle view creation
  const handleCreateView = async () => {
    const newView = await tabColouringService.createView({
      project_id: projectId,
      name: editState.name,
      description: editState.description,
      view_type: editState.viewType,
      tab_color: editState.tabColor,
      is_default: false,
      sort_order: views.length + 1
    });

    if (newView) {
      setViews(prev => [...prev, newView]);
      setShowEditModal(false);
      resetEditState();
      
      if (onViewCreate) {
        onViewCreate(newView);
      }
    }
  };

  // Handle view update
  const handleUpdateView = async () => {
    if (!editState.viewId) return;

    const updatedView = await tabColouringService.updateView(editState.viewId, {
      name: editState.name,
      description: editState.description,
      view_type: editState.viewType,
      tab_color: editState.tabColor
    });

    if (updatedView) {
      setViews(prev => prev.map(v => v.id === editState.viewId ? updatedView : v));
      setShowEditModal(false);
      resetEditState();
      
      if (onViewUpdate) {
        onViewUpdate(updatedView);
      }
    }
  };

  // Handle view deletion
  const handleDeleteView = async (viewId: string) => {
    if (!confirm('Are you sure you want to delete this view?')) return;

    const success = await tabColouringService.deleteView(viewId);
    if (success) {
      setViews(prev => prev.filter(v => v.id !== viewId));
      
      if (onViewDelete) {
        onViewDelete(viewId);
      }
    }
  };

  // Handle setting default view
  const handleSetDefault = async (viewId: string) => {
    const success = await tabColouringService.setDefaultView(projectId, viewId);
    if (success) {
      setViews(prev => prev.map(v => ({
        ...v,
        is_default: v.id === viewId
      })));
    }
  };

  // Open edit modal
  const openEditModal = (view?: AstaView) => {
    if (view) {
      setEditState({
        viewId: view.id,
        name: view.name,
        description: view.description || '',
        viewType: view.view_type,
        tabColor: view.tab_color
      });
    } else {
      resetEditState();
    }
    setShowEditModal(true);
  };

  // Reset edit state
  const resetEditState = () => {
    setEditState({
      viewId: null,
      name: '',
      description: '',
      viewType: 'gantt',
      tabColor: 'blue'
    });
  };

  // Get view type icon
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

  // Get view type label
  const getViewTypeLabel = (viewType: AstaView['view_type']) => {
    switch (viewType) {
      case 'gantt':
        return 'Gantt';
      case 'timeline':
        return 'Timeline';
      case 'calendar':
        return 'Calendar';
      case 'resource':
        return 'Resource';
      case 'cost':
        return 'Cost';
      case 'custom':
        return 'Custom';
      default:
        return 'Custom';
    }
  };

  // Get tab color classes
  const getTabColorClasses = (color: TabColor, isSelected: boolean = false) => {
    const colorOption = tabColouringService.getTabColorOption(color);
    if (!colorOption) return '';

    if (isSelected) {
      return `${colorOption.bgClass} text-white border-2 border-white shadow-lg`;
    }

    return `bg-white border-2 ${colorOption.borderClass} text-gray-700 hover:${colorOption.bgClass} hover:text-white transition-colors`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SwatchIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tab Colouring</h3>
          <span className="text-sm text-gray-500">({views.length} views)</span>
        </div>
        
        {canEdit && (
          <button
            onClick={() => openEditModal()}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add View
          </button>
        )}
      </div>

      {/* Views List */}
      <div className="p-4 space-y-2">
        {views.map((view) => {
          const isSelected = selectedViewId === view.id;
          const colorOption = tabColouringService.getTabColorOption(view.tab_color);
          const isExpanded = expandedView === view.id;

          return (
            <div
              key={view.id}
              className={`border rounded-lg transition-all duration-200 ${
                isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
              }`}
            >
              {/* View Header */}
              <div
                className={`flex items-center justify-between p-3 cursor-pointer ${getTabColorClasses(view.tab_color, isSelected)}`}
                onClick={() => handleViewSelect(view)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getViewTypeIcon(view.view_type)}
                    <span className="text-sm font-medium">{getViewTypeLabel(view.view_type)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: colorOption?.bgClass.replace('bg-', '#') || '#3b82f6' }}
                    />
                    <span className="font-semibold">{view.name}</span>
                    {view.is_default && (
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {view.description && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedView(isExpanded ? null : view.id);
                      }}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                  )}
                  
                  {canEdit && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(view.id);
                        }}
                        className={`p-1 rounded ${
                          view.is_default 
                            ? 'text-yellow-600 hover:text-yellow-700' 
                            : 'text-gray-400 hover:text-yellow-600'
                        }`}
                        title={view.is_default ? 'Default view' : 'Set as default'}
                      >
                        {view.is_default ? <StarIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(view);
                        }}
                        className="p-1 text-gray-600 hover:text-gray-800"
                        title="Edit view"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view.id);
                        }}
                        className="p-1 text-gray-600 hover:text-red-600"
                        title="Delete view"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && view.description && (
                <div className="px-3 pb-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mt-2">{view.description}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Type: {getViewTypeLabel(view.view_type)}</span>
                    <span>Color: {colorOption?.label}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {views.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <SwatchIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No views configured</p>
            {canEdit && (
              <button
                onClick={() => openEditModal()}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Create your first view
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editState.viewId ? 'Edit View' : 'Add View'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View Name *
                </label>
                <input
                  type="text"
                  value={editState.name}
                  onChange={(e) => setEditState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter view name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editState.description}
                  onChange={(e) => setEditState(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter view description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View Type *
                </label>
                <select
                  value={editState.viewType}
                  onChange={(e) => setEditState(prev => ({ ...prev, viewType: e.target.value as AstaView['view_type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gantt">Gantt Chart</option>
                  <option value="timeline">Timeline</option>
                  <option value="calendar">Calendar</option>
                  <option value="resource">Resource</option>
                  <option value="cost">Cost</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tab Color *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(showColorPicker ? null : 'color')}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: tabColouringService.getTabColorOption(editState.tabColor)?.bgClass.replace('bg-', '#') || '#3b82f6' }}
                      />
                      <span>{tabColouringService.getTabColorOption(editState.tabColor)?.label}</span>
                    </div>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>

                  {showColorPicker === 'color' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="p-2 grid grid-cols-2 gap-1">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => {
                              setEditState(prev => ({ ...prev, tabColor: color.value }));
                              setShowColorPicker(null);
                            }}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-left"
                          >
                            <div className={`w-4 h-4 rounded border border-gray-300 ${color.bgClass}`} />
                            <div>
                              <div className="font-medium text-sm">{color.label}</div>
                              <div className="text-xs text-gray-500">{color.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={editState.viewId ? handleUpdateView : handleCreateView}
                  disabled={!editState.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {editState.viewId ? 'Update View' : 'Create View'}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setShowColorPicker(null);
                    resetEditState();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabColouring; 