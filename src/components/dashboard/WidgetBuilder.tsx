import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ListBulletIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { WIDGET_SIZES } from '../widgets/WidgetTypes';

interface WidgetBuilderProps {
  layoutName: string;
  onBack: () => void;
  onClose: () => void;
  onWidgetsChange?: (widgets: any[]) => void;
  selectedLayout: string | null;
  widgets?: any[];
}

interface WidgetContent {
  config: any;
  id: string;
  title: string;
  type: 'metric' | 'statistic' | 'task-list' | 'project-list' | 'activity-feed' | 'chart' | 'calendar';
}

interface CustomWidget {
  contents: WidgetContent[];
  id: string;
  name: string;
  size: { height: number, width: number; };
}

const WidgetBuilder: React.FC<WidgetBuilderProps> = ({
  layoutName,
  selectedLayout,
  onBack,
  onClose,
  onWidgetsChange,
  widgets = [],
}) => {
  const [customWidgets, setCustomWidgets] = useState<CustomWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<CustomWidget | null>(null);
  const [showContentBuilder, setShowContentBuilder] = useState(false);
  const [view, setView] = useState<'predefined' | 'custom'>('predefined');

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const availableSizes = [
    { ...WIDGET_SIZES.SMALL, label: 'Small (2x2)' },
    { ...WIDGET_SIZES.MEDIUM, label: 'Medium (3x2)' },
    { ...WIDGET_SIZES.LARGE, label: 'Large (4x3)' },
    { ...WIDGET_SIZES.WIDE, label: 'Wide (6x2)' },
    { ...WIDGET_SIZES.TALL, label: 'Tall (2x4)' },
    { ...WIDGET_SIZES.SQUARE, label: 'Square (3x3)' },
  ];

  // Predefined widgets with appropriate content
  const predefinedWidgets = [
    {
      id: 'performance-metrics',
      name: 'Performance Metrics',
      size: WIDGET_SIZES.MEDIUM,
      icon: ChartBarIcon,
      description: 'Key performance indicators and metrics',
      contents: [
        {
          id: 'metrics-1',
          type: 'statistic',
          title: 'Performance Metrics',
          config: {
            metrics: [
              { label: 'Revenue', value: '$125,000', color: 'green', trend: 'up' },
              { label: 'Projects', value: '24', color: 'blue', trend: 'up' },
              { label: 'Tasks', value: '156', color: 'orange', trend: 'down' },
              { label: 'Team', value: '12', color: 'purple', trend: 'up' },
            ]
          }
        }
      ]
    },
    {
      id: 'task-list',
      name: 'Task List',
      size: WIDGET_SIZES.TALL,
      icon: CheckCircleIcon,
      description: 'Current tasks and to-dos',
      contents: [
        {
          id: 'tasks-1',
          type: 'task-list',
          title: 'Active Tasks',
          config: {
            tasks: [
              { id: 1, title: 'Review project proposal', status: 'in-progress', priority: 'high' },
              { id: 2, title: 'Update client documentation', status: 'pending', priority: 'medium' },
              { id: 3, title: 'Schedule team meeting', status: 'completed', priority: 'low' },
              { id: 4, title: 'Prepare quarterly report', status: 'in-progress', priority: 'high' },
              { id: 5, title: 'Review budget allocations', status: 'pending', priority: 'medium' },
            ],
            maxItems: 8
          }
        }
      ]
    },
    {
      id: 'project-overview',
      name: 'Project Overview',
      size: WIDGET_SIZES.LARGE,
      icon: BuildingOfficeIcon,
      description: 'Project status and progress',
      contents: [
        {
          id: 'projects-1',
          type: 'project-list',
          title: 'Active Projects',
          config: {
            projects: [
              { id: 1, name: 'Office Renovation', status: 'in-progress', progress: 75, budget: '$50,000' },
              { id: 2, name: 'New Building Construction', status: 'planning', progress: 25, budget: '$250,000' },
              { id: 3, name: 'Equipment Installation', status: 'completed', progress: 100, budget: '$15,000' },
              { id: 4, name: 'Safety System Upgrade', status: 'in-progress', progress: 60, budget: '$30,000' },
            ],
            maxItems: 6
          }
        }
      ]
    },
    {
      id: 'revenue-chart',
      name: 'Revenue Chart',
      size: WIDGET_SIZES.WIDE,
      icon: ChartPieIcon,
      description: 'Revenue trends and analytics',
      contents: [
        {
          id: 'chart-1',
          type: 'chart',
          title: 'Revenue Trends',
          config: {
            type: 'line',
            data: [45000, 52000, 48000, 61000, 58000, 67000, 72000],
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            color: 'blue'
          }
        }
      ]
    },
    {
      id: 'activity-feed',
      name: 'Activity Feed',
      size: WIDGET_SIZES.TALL,
      icon: ClockIcon,
      description: 'Recent activity and updates',
      contents: [
        {
          id: 'activity-1',
          type: 'activity-feed',
          title: 'Recent Activity',
          config: {
            activities: [
              { id: 1, action: 'Project completed', user: 'John Doe', time: '2 hours ago', type: 'success' },
              { id: 2, action: 'New task assigned', user: 'Jane Smith', time: '4 hours ago', type: 'info' },
              { id: 3, action: 'Budget updated', user: 'Mike Johnson', time: '6 hours ago', type: 'warning' },
              { id: 4, action: 'Team meeting scheduled', user: 'Sarah Wilson', time: '1 day ago', type: 'info' },
              { id: 5, action: 'Document uploaded', user: 'Tom Brown', time: '1 day ago', type: 'success' },
            ],
            maxItems: 10
          }
        }
      ]
    },
    {
      id: 'calendar',
      name: 'Calendar',
      size: WIDGET_SIZES.SQUARE,
      icon: CalendarIcon,
      description: 'Upcoming events and meetings',
      contents: [
        {
          id: 'calendar-1',
          type: 'calendar',
          title: 'Upcoming Events',
          config: {
            events: [
              { id: 1, title: 'Team Meeting', date: '2024-01-15', time: '10:00 AM', type: 'meeting' },
              { id: 2, title: 'Client Presentation', date: '2024-01-16', time: '2:00 PM', type: 'presentation' },
              { id: 3, title: 'Project Deadline', date: '2024-01-18', time: '5:00 PM', type: 'deadline' },
              { id: 4, title: 'Budget Review', date: '2024-01-20', time: '11:00 AM', type: 'review' },
            ],
            view: 'week'
          }
        }
      ]
    },
  ];

  const contentTypes = [
    { type: 'metric', label: 'Metric', icon: ChartBarIcon, description: 'Single value with label' },
    { type: 'statistic', label: 'Statistics', icon: CurrencyDollarIcon, description: 'Multiple metrics in a grid' },
    { type: 'task-list', label: 'Task List', icon: CheckCircleIcon, description: 'Scrollable list of tasks' },
    { type: 'project-list', label: 'Project List', icon: ListBulletIcon, description: 'List of projects with status' },
    { type: 'activity-feed', label: 'Activity Feed', icon: ClockIcon, description: 'Recent activity timeline' },
    { type: 'chart', label: 'Chart', icon: ChartBarIcon, description: 'Data visualization chart' },
    { type: 'calendar', label: 'Calendar', icon: CalendarIcon, description: 'Calendar view with events' },
  ];

  const handleCreateWidget = () => {
    const newWidget: CustomWidget = {
      id: `widget-${Date.now()}`,
      name: `Custom Widget ${customWidgets.length + 1}`,
      size: WIDGET_SIZES.MEDIUM,
      contents: [],
    };
    setCustomWidgets([...customWidgets, newWidget]);
    setSelectedWidget(newWidget);
    setShowContentBuilder(true);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setCustomWidgets(customWidgets.filter(w => w.id !== widgetId));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
      setShowContentBuilder(false);
    }
  };

  const handleDeleteContent = (widgetId: string, contentId: string) => {
    const widget = customWidgets.find(w => w.id === widgetId);
    if (!widget) return;

    const updatedWidget = {
      ...widget,
      contents: widget.contents.filter(c => c.id !== contentId),
    };

    setCustomWidgets(customWidgets.map(w => w.id === widgetId ? updatedWidget : w));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(updatedWidget);
    }
  };

  const handleAddContent = (widgetId: string, contentType: string) => {
    const widget = customWidgets.find(w => w.id === widgetId);
    if (!widget) return;

    const newContent: WidgetContent = {
      id: `content-${Date.now()}`,
      type: contentType as any,
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} ${widget.contents.length + 1}`,
      config: getDefaultConfig(contentType),
    };

    const updatedWidget = {
      ...widget,
      contents: [...widget.contents, newContent],
    };

    setCustomWidgets(customWidgets.map(w => w.id === widgetId ? updatedWidget : w));
    setSelectedWidget(updatedWidget);
  };

  const getDefaultConfig = (contentType: string) => {
    switch (contentType) {
      case 'metric':
        return { value: '0', label: 'Metric', color: 'blue', trend: 'up' };
      case 'statistic':
        return { metrics: [
          { label: 'Metric 1', value: '0', color: 'blue' },
          { label: 'Metric 2', value: '0', color: 'green' },
        ]};
      case 'task-list':
        return { tasks: [], maxItems: 5 };
      case 'project-list':
        return { projects: [], maxItems: 5 };
      case 'activity-feed':
        return { activities: [], maxItems: 10 };
      case 'chart':
        return { type: 'bar', data: [], labels: [] };
      case 'calendar':
        return { events: [], view: 'week' };
      default:
        return {};
    }
  };

  const handleSaveWidgets = () => {
    // Combine predefined and custom widgets
    const allWidgets = [
      ...predefinedWidgets.map(widget => ({
        id: widget.id,
        type: 'predefined-widget',
        width: widget.size.width,
        height: widget.size.height,
        config: {
          name: widget.name,
          contents: widget.contents,
        },
      })),
      ...customWidgets.map(widget => ({
        id: widget.id,
        type: 'custom-widget',
        width: widget.size.width,
        height: widget.size.height,
        config: {
          name: widget.name,
          contents: widget.contents,
        },
      }))
    ];

    onWidgetsChange?.(allWidgets);
    onClose();
  };

  const renderContentPreview = (content: WidgetContent) => {
    switch (content.type) {
      case 'metric':
        return (
          <div className='text-center p-4'>
            <div className='text-2xl font-bold text-blue-600'>{content.config.value}</div>
            <div className='text-sm text-gray-600'>{content.config.label}</div>
          </div>
        );
      case 'statistic':
        return (
          <div className='grid grid-cols-2 gap-2 p-2'>
            {content.config.metrics?.slice(0, 4).map((metric: any, index: number) => (
              <div key={index} className='text-center p-2 bg-gray-50 rounded'>
                <div className='text-sm font-semibold'>{metric.value}</div>
                <div className='text-xs text-gray-500'>{metric.label}</div>
              </div>
            ))}
          </div>
        );
      case 'task-list':
        return (
          <div className='p-2'>
            {content.config.tasks?.slice(0, 3).map((task: any) => (
              <div key={task.id} className='flex items-center space-x-2 py-1'>
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' : 
                  task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />
                <span className='text-xs truncate'>{task.title}</span>
              </div>
            ))}
          </div>
        );
      case 'project-list':
        return (
          <div className='p-2'>
            {content.config.projects?.slice(0, 2).map((project: any) => (
              <div key={project.id} className='mb-2'>
                <div className='text-xs font-medium truncate'>{project.name}</div>
                <div className='w-full bg-gray-200 rounded-full h-1'>
                  <div 
                    className='bg-blue-600 h-1 rounded-full' 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 'activity-feed':
        return (
          <div className='p-2'>
            {content.config.activities?.slice(0, 3).map((activity: any) => (
              <div key={activity.id} className='text-xs py-1 truncate'>
                {activity.action}
              </div>
            ))}
          </div>
        );
      case 'chart':
        return (
          <div className='p-2 text-center'>
            <div className='text-xs text-gray-500'>Chart Preview</div>
            <div className='w-full h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded'></div>
          </div>
        );
      case 'calendar':
        return (
          <div className='p-2'>
            {content.config.events?.slice(0, 2).map((event: any) => (
              <div key={event.id} className='text-xs py-1 truncate'>
                {event.title}
              </div>
            ))}
          </div>
        );
      default:
        return <div className='p-2 text-xs text-gray-500'>Preview not available</div>;
    }
  };

  const renderContentBuilder = () => {
    if (!selectedWidget) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setShowContentBuilder(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ArrowLeftIcon className='h-5 w-5 text-gray-600' />
              </button>
              <div>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Build Widget: {selectedWidget.name}
                </h2>
                <p className='text-sm text-gray-500'>
                  Add content to your widget
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowContentBuilder(false)}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>

          <div className='flex-1 flex h-0 min-h-0 overflow-hidden'>
            {/* Content Types Panel */}
            <div className='w-80 border-r border-gray-200 p-6 overflow-y-auto'>
              <h3 className='font-semibold text-gray-900 mb-4'>Add Content</h3>
              <div className='space-y-3'>
                {contentTypes.map((contentType) => (
                  <button
                    key={contentType.type}
                    onClick={() => handleAddContent(selectedWidget.id, contentType.type)}
                    className='w-full p-4 text-left border border-gray-200 rounded-lg transition-colors hover:border-blue-300 hover:bg-blue-50'
                  >
                    <div className='flex items-center space-x-3'>
                      <contentType.icon className='h-5 w-5 text-blue-600' />
                      <div>
                        <h4 className='font-medium text-gray-900'>{contentType.label}</h4>
                        <p className='text-sm text-gray-500'>{contentType.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Widget Preview */}
            <div className='flex-1 p-6 overflow-y-auto'>
              <h3 className='font-semibold text-gray-900 mb-4'>Widget Preview</h3>
              <div 
                className='border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white'
                style={{
                  width: `${selectedWidget.size.width * 100}px`,
                  height: `${selectedWidget.size.height * 80}px`,
                }}
              >
                {selectedWidget.contents.length === 0 ? (
                  <div className='h-full flex items-center justify-center text-gray-500'>
                    <p>Add content to your widget</p>
                  </div>
                ) : (
                  <div className='h-full overflow-y-auto'>
                    {selectedWidget.contents.map((content) => (
                      <div key={content.id} className='mb-3 border border-gray-200 rounded-lg bg-white'>
                        <div className='flex items-center justify-between p-3 border-b border-gray-100'>
                          <h4 className='font-medium text-gray-900'>{content.title}</h4>
                          <button 
                            onClick={() => handleDeleteContent(selectedWidget.id, content.id)}
                            className='text-red-500 hover:text-red-700 p-1'
                          >
                            <TrashIcon className='h-4 w-4' />
                          </button>
                        </div>
                        <div className='p-2'>
                          {renderContentPreview(content)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={onBack}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeftIcon className='h-5 w-5 text-gray-600' />
            </button>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Widget Builder
              </h2>
              <p className='text-sm text-gray-500'>
                Choose predefined widgets or create custom ones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        {/* View Toggle */}
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex space-x-1 bg-gray-100 rounded-lg p-1'>
            <button
              onClick={() => setView('predefined')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                view === 'predefined' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Predefined Widgets
            </button>
            <button
              onClick={() => setView('custom')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                view === 'custom' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Custom Widgets
            </button>
          </div>
        </div>

        <div className='flex-1 flex h-0 min-h-0 overflow-hidden'>
          {/* Widget List */}
          <div className='w-80 border-r border-gray-200 p-6 overflow-y-auto'>
            {view === 'predefined' ? (
              <>
                <h3 className='font-semibold text-gray-900 mb-4'>Predefined Widgets</h3>
                <div className='space-y-3'>
                  {predefinedWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className='p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50'
                      onClick={() => setSelectedWidget(widget as CustomWidget)}
                    >
                      <div className='flex items-center space-x-3 mb-2'>
                        <widget.icon className='h-5 w-5 text-blue-600' />
                        <h4 className='font-medium text-gray-900'>{widget.name}</h4>
                      </div>
                      <p className='text-sm text-gray-500 mb-2'>{widget.description}</p>
                      <p className='text-xs text-gray-400'>
                        {widget.size.width}×{widget.size.height} • {widget.contents.length} content items
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-gray-900'>Custom Widgets</h3>
                  <button
                    onClick={handleCreateWidget}
                    className='p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <PlusIcon className='h-4 w-4' />
                  </button>
                </div>
                
                <div className='space-y-3'>
                  {customWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedWidget?.id === widget.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedWidget(widget);
                        setShowContentBuilder(true);
                      }}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium text-gray-900'>{widget.name}</h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWidget(widget.id);
                          }}
                          className='text-red-500 hover:text-red-700 p-1'
                        >
                          <TrashIcon className='h-4 w-4' />
                        </button>
                      </div>
                      <p className='text-sm text-gray-500'>
                        {widget.size.width}×{widget.size.height} • {widget.contents.length} content items
                      </p>
                    </div>
                  ))}
                  
                  {customWidgets.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      <Cog6ToothIcon className='h-12 w-12 mx-auto mb-3 text-gray-300' />
                      <p>No custom widgets created yet</p>
                      <p className='text-sm'>Click the + button to create your first widget</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Main Content Area */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {selectedWidget ? (
              <div>
                <h3 className='font-semibold text-gray-900 mb-4'>
                  Widget: {selectedWidget.name}
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Widget Size</h4>
                    <div className='grid grid-cols-2 gap-2'>
                      {availableSizes.map((size) => (
                        <button
                          key={size.label}
                          onClick={() => setSelectedWidget({
                            ...selectedWidget,
                            size: { width: size.width, height: size.height }
                          })}
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            selectedWidget.size.width === size.width && selectedWidget.size.height === size.height
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className='font-medium text-sm'>{size.label}</div>
                          <div className='text-xs text-gray-500'>
                            {size.width}×{size.height} grid units
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Content Items</h4>
                    <div className='space-y-2'>
                      {selectedWidget.contents.map((content) => (
                        <div key={content.id} className='flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white'>
                          <div>
                            <div className='font-medium text-sm'>{content.title}</div>
                            <div className='text-xs text-gray-500'>{content.type}</div>
                          </div>
                          {view === 'custom' && (
                            <button 
                              onClick={() => handleDeleteContent(selectedWidget.id, content.id)}
                              className='text-red-500 hover:text-red-700 p-1'
                            >
                              <TrashIcon className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {selectedWidget.contents.length === 0 && (
                        <div className='text-center py-4 text-gray-500 text-sm'>
                          No content added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className='mt-6'>
                  <h4 className='font-medium text-gray-900 mb-2'>Preview</h4>
                  <div 
                    className='border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white'
                    style={{
                      width: `${selectedWidget.size.width * 100}px`,
                      height: `${selectedWidget.size.height * 80}px`,
                    }}
                  >
                    {selectedWidget.contents.length === 0 ? (
                      <div className='h-full flex items-center justify-center text-gray-500'>
                        <p>No content to preview</p>
                      </div>
                    ) : (
                      <div className='h-full overflow-y-auto'>
                        {selectedWidget.contents.map((content) => (
                          <div key={content.id} className='mb-2'>
                            {renderContentPreview(content)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-12 text-gray-500'>
                <Cog6ToothIcon className='h-16 w-16 mx-auto mb-4 text-gray-300' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No Widget Selected</h3>
                <p>Select a widget from the list to preview and configure it</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-200 flex justify-between'>
          <button
            onClick={onBack}
            className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            Back
          </button>
          <div className='space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWidgets}
              className='px-6 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-green transition-colors'
            >
              Save Widgets
            </button>
          </div>
        </div>
      </div>

      {showContentBuilder && renderContentBuilder()}
    </div>
  );
};

export default WidgetBuilder; 
