import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { WIDGET_SIZES } from '../widgets/WidgetTypes';

interface WidgetPlacementProps {
  layoutName: string;
  onBack: () => void;
  onClose: () => void;
  onSave: (widgets: PlacedWidget[]) => void;
  placeholders: LayoutPlaceholder[];
  selectedLayout: string | null;
}

interface LayoutPlaceholder {
  id: string;
  size: { height: number, width: number; };
  type: 'placeholder';
  x: number;
  y: number;
}

interface PlacedWidget {
  content: any;
  id: string;
  placeholderId: string;
  size: { height: number, width: number; };
  title: string;
  type: string;
}

interface PreMadeWidget {
  category: string;
  content: any;
  description: string;
  icon: React.ComponentType<any>;
  id: string;
  title: string;
  type: string;
}

const WidgetPlacement: React.FC<WidgetPlacementProps> = ({
  layoutName,
  selectedLayout,
  placeholders,
  onBack,
  onClose,
  onSave,
}) => {
  const [placedWidgets, setPlacedWidgets] = useState<PlacedWidget[]>([]);
  const [draggedWidget, setDraggedWidget] = useState<PreMadeWidget | null>(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Pre-made widgets that can be placed
  const preMadeWidgets: PreMadeWidget[] = [
    {
      id: 'stats-overview',
      type: 'stats-cards',
      title: 'Statistics Overview',
      description: 'Key metrics and statistics',
      icon: () => <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs">📊</div>,
      category: 'Analytics',
      content: {
        metrics: [
          { label: 'Revenue', value: '$125,000', color: 'green', trend: 'up' },
          { label: 'Projects', value: '24', color: 'blue', trend: 'up' },
          { label: 'Tasks', value: '156', color: 'orange', trend: 'down' },
          { label: 'Team', value: '12', color: 'purple', trend: 'up' },
        ]
      }
    },
    {
      id: 'revenue-chart',
      type: 'revenue-chart',
      title: 'Revenue Chart',
      description: 'Revenue trends and analytics',
      icon: () => <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs">📈</div>,
      category: 'Analytics',
      content: {
        type: 'line',
        data: [45000, 52000, 48000, 61000, 58000, 67000, 72000],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        color: 'blue'
      }
    },
    {
      id: 'task-list',
      type: 'task-list',
      title: 'Task List',
      description: 'Current tasks and to-dos',
      icon: () => <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs">✓</div>,
      category: 'Productivity',
      content: {
        tasks: [
          { id: 1, title: 'Review project proposal', status: 'in-progress', priority: 'high' },
          { id: 2, title: 'Update client documentation', status: 'pending', priority: 'medium' },
          { id: 3, title: 'Schedule team meeting', status: 'completed', priority: 'low' },
          { id: 4, title: 'Prepare quarterly report', status: 'in-progress', priority: 'high' },
          { id: 5, title: 'Review budget allocations', status: 'pending', priority: 'medium' },
          { id: 6, title: 'Update project timeline', status: 'in-progress', priority: 'high' },
          { id: 7, title: 'Client feedback review', status: 'pending', priority: 'medium' },
          { id: 8, title: 'Team performance review', status: 'completed', priority: 'low' },
        ],
        maxItems: 8
      }
    },
    {
      id: 'project-overview',
      type: 'project-list',
      title: 'Project Overview',
      description: 'Project status and progress',
      icon: () => <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs">🏢</div>,
      category: 'Productivity',
      content: {
        projects: [
          { id: 1, name: 'Office Renovation', status: 'in-progress', progress: 75, budget: '$50,000' },
          { id: 2, name: 'New Building Construction', status: 'planning', progress: 25, budget: '$250,000' },
          { id: 3, name: 'Equipment Installation', status: 'completed', progress: 100, budget: '$15,000' },
          { id: 4, name: 'Safety System Upgrade', status: 'in-progress', progress: 60, budget: '$30,000' },
          { id: 5, name: 'IT Infrastructure', status: 'planning', progress: 15, budget: '$75,000' },
          { id: 6, name: 'Landscaping Project', status: 'in-progress', progress: 45, budget: '$20,000' },
        ],
        maxItems: 6
      }
    },
    {
      id: 'activity-feed',
      type: 'activity-feed',
      title: 'Activity Feed',
      description: 'Recent activity and updates',
      icon: () => <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs">📢</div>,
      category: 'Communication',
      content: {
        activities: [
          { id: 1, action: 'Project completed', user: 'John Doe', time: '2 hours ago', type: 'success' },
          { id: 2, action: 'New task assigned', user: 'Jane Smith', time: '4 hours ago', type: 'info' },
          { id: 3, action: 'Budget updated', user: 'Mike Johnson', time: '6 hours ago', type: 'warning' },
          { id: 4, action: 'Team meeting scheduled', user: 'Sarah Wilson', time: '1 day ago', type: 'info' },
          { id: 5, action: 'Document uploaded', user: 'Tom Brown', time: '1 day ago', type: 'success' },
          { id: 6, action: 'Client feedback received', user: 'Lisa Davis', time: '2 days ago', type: 'info' },
          { id: 7, action: 'Equipment ordered', user: 'David Wilson', time: '2 days ago', type: 'success' },
          { id: 8, action: 'Safety inspection passed', user: 'Mark Johnson', time: '3 days ago', type: 'success' },
          { id: 9, action: 'New team member added', user: 'HR Team', time: '3 days ago', type: 'info' },
          { id: 10, action: 'Contract signed', user: 'Legal Team', time: '4 days ago', type: 'success' },
        ],
        maxItems: 10
      }
    },
    {
      id: 'calendar',
      type: 'calendar',
      title: 'Calendar',
      description: 'Upcoming events and meetings',
      icon: () => <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white text-xs">📅</div>,
      category: 'Communication',
      content: {
        events: [
          { id: 1, title: 'Team Meeting', date: '2024-01-15', time: '10:00 AM', type: 'meeting' },
          { id: 2, title: 'Client Presentation', date: '2024-01-16', time: '2:00 PM', type: 'presentation' },
          { id: 3, title: 'Project Deadline', date: '2024-01-18', time: '5:00 PM', type: 'deadline' },
          { id: 4, title: 'Budget Review', date: '2024-01-20', time: '11:00 AM', type: 'review' },
          { id: 5, title: 'Site Inspection', date: '2024-01-22', time: '9:00 AM', type: 'inspection' },
          { id: 6, title: 'Contract Negotiation', date: '2024-01-24', time: '3:00 PM', type: 'meeting' },
        ],
        view: 'week'
      }
    },
    {
      id: 'notifications',
      type: 'notifications',
      title: 'Notifications',
      description: 'System notifications and alerts',
      icon: () => <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs">🔔</div>,
      category: 'Communication',
      content: {
        notifications: [
          { id: 1, title: 'Project Update', message: 'Office renovation is 75% complete', type: 'info', time: '1 hour ago' },
          { id: 2, title: 'Budget Alert', message: 'Equipment budget is 90% used', type: 'warning', time: '3 hours ago' },
          { id: 3, title: 'Task Completed', message: 'Safety inspection passed successfully', type: 'success', time: '5 hours ago' },
          { id: 4, title: 'New Assignment', message: 'You have been assigned to IT project', type: 'info', time: '1 day ago' },
          { id: 5, title: 'System Maintenance', message: 'Scheduled maintenance tonight at 2 AM', type: 'warning', time: '1 day ago' },
          { id: 6, title: 'Contract Signed', message: 'New building contract has been signed', type: 'success', time: '2 days ago' },
        ],
        maxItems: 8
      }
    },
    {
      id: 'performance-metrics',
      type: 'performance-metrics',
      title: 'Performance Metrics',
      description: 'System and business performance',
      icon: () => <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center text-white text-xs">⚡</div>,
      category: 'Analytics',
      content: {
        metrics: [
          { label: 'CPU Usage', value: '65%', color: 'blue', trend: 'stable' },
          { label: 'Memory', value: '78%', color: 'orange', trend: 'up' },
          { label: 'Disk Space', value: '45%', color: 'green', trend: 'down' },
          { label: 'Network', value: '32%', color: 'purple', trend: 'stable' },
        ]
      }
    }
  ];

  const handleDragStart = (widget: PreMadeWidget) => {
    setDraggedWidget(widget);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, placeholder: LayoutPlaceholder) => {
    e.preventDefault();
    if (!draggedWidget) return;

    // Check if placeholder already has a widget
    const existingWidget = placedWidgets.find(w => w.placeholderId === placeholder.id);
    if (existingWidget) {
      // Replace existing widget
      setPlacedWidgets(placedWidgets.map(w => 
        w.placeholderId === placeholder.id 
          ? {
              id: `${draggedWidget.id}-${Date.now()}`,
              placeholderId: placeholder.id,
              type: draggedWidget.type,
              title: draggedWidget.title,
              content: draggedWidget.content,
              size: placeholder.size
            }
          : w
      ));
    } else {
      // Add new widget
      const newWidget: PlacedWidget = {
        id: `${draggedWidget.id}-${Date.now()}`,
        placeholderId: placeholder.id,
        type: draggedWidget.type,
        title: draggedWidget.title,
        content: draggedWidget.content,
        size: placeholder.size
      };
      setPlacedWidgets([...placedWidgets, newWidget]);
    }

    setDraggedWidget(null);
  };

  const handleRemoveWidget = (placeholderId: string) => {
    setPlacedWidgets(placedWidgets.filter(w => w.placeholderId !== placeholderId));
  };

  const handleSave = () => {
    onSave(placedWidgets);
  };

  const renderWidgetContent = (widget: PlacedWidget) => {
    const { type, content, size } = widget;
    
    // Determine if this is a list-type widget that should scroll
    const isListType = ['task-list', 'project-list', 'activity-feed', 'notifications', 'calendar'].includes(type);
    const shouldScroll = isListType && (size.height > 2 || size.width > 3);

    const contentClass = shouldScroll 
      ? 'overflow-y-auto max-h-full' 
      : 'overflow-hidden';

    switch (type) {
      case 'stats-cards':
        return (
          <div className={`grid grid-cols-2 gap-2 ${contentClass}`}>
            {content.metrics.map((metric: any, index: number) => (
              <div key={index} className="bg-gray-100 rounded p-2 text-center">
                <div className="text-lg font-bold text-gray-800">{metric.value}</div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        );

      case 'task-list':
        return (
          <div className={contentClass}>
            <div className="space-y-1">
              {content.tasks.slice(0, content.maxItems).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <span className="truncate">{task.title}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'project-list':
        return (
          <div className={contentClass}>
            <div className="space-y-2">
              {content.projects.slice(0, content.maxItems).map((project: any) => (
                <div key={project.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{project.name}</div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{project.progress}%</span>
                    <span>{project.budget}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'activity-feed':
        return (
          <div className={contentClass}>
            <div className="space-y-2">
              {content.activities.slice(0, content.maxItems).map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-gray-600">
                      {activity.user} • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className={contentClass}>
            <div className="space-y-2">
              {content.notifications.slice(0, content.maxItems).map((notification: any) => (
                <div key={notification.id} className="p-2 bg-gray-50 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{notification.title}</div>
                      <div className="text-xs text-gray-600">{notification.message}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      notification.type === 'success' ? 'bg-green-100 text-green-800' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className={contentClass}>
            <div className="space-y-2">
              {content.events.slice(0, content.maxItems).map((event: any) => (
                <div key={event.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-gray-600">
                    {event.date} • {event.time}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'presentation' ? 'bg-purple-100 text-purple-800' :
                    event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'performance-metrics':
        return (
          <div className={`grid grid-cols-2 gap-2 ${contentClass}`}>
            {content.metrics.map((metric: any, index: number) => (
              <div key={index} className="bg-gray-100 rounded p-2 text-center">
                <div className="text-lg font-bold text-gray-800">{metric.value}</div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Widget content
          </div>
        );
    }
  };

  const renderPlaceholder = (placeholder: LayoutPlaceholder) => {
    const placedWidget = placedWidgets.find(w => w.placeholderId === placeholder.id);
    
    const style = {
      gridColumn: `span ${placeholder.size.width}`,
      gridRow: `span ${placeholder.size.height}`,
    };

    return (
      <div
        key={placeholder.id}
        className={`relative border-2 border-dashed rounded-lg p-3 ${
          placedWidget 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        style={style}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, placeholder)}
      >
        {placedWidget ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm text-gray-800">{placedWidget.title}</h3>
              <button
                onClick={() => handleRemoveWidget(placeholder.id)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              {renderWidgetContent(placedWidget)}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Drop widget here
          </div>
        )}
      </div>
    );
  };

  const categories = [...new Set(preMadeWidgets.map(w => w.category))];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col'>
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
                Widget Placement - {layoutName}
              </h2>
              <p className='text-sm text-gray-500'>
                Drag widgets into placeholders to build your dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            title='Back to Dashboard Settings'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex h-0 min-h-0 overflow-hidden'>
          {/* Widget Palette */}
          <div className='w-80 border-r border-gray-200 p-6 overflow-y-auto'>
            <h3 className='font-semibold text-gray-900 mb-4'>Available Widgets</h3>
            
            {categories.map(category => (
              <div key={category} className='mb-6'>
                <h4 className='text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide'>{category}</h4>
                <div className='space-y-2'>
                  {preMadeWidgets
                    .filter(widget => widget.category === category)
                    .map(widget => (
                      <div
                        key={widget.id}
                        className='p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-move transition-colors'
                        draggable
                        onDragStart={() => handleDragStart(widget)}
                      >
                        <div className='flex items-center space-x-3'>
                          <widget.icon />
                          <div className='flex-1 min-w-0'>
                            <div className='font-medium text-sm text-gray-900'>{widget.title}</div>
                            <div className='text-xs text-gray-500'>{widget.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Layout Canvas */}
          <div className='flex-1 p-6 overflow-y-auto'>
            <div className='mb-4'>
              <h3 className='font-semibold text-gray-900 mb-2'>Layout Canvas</h3>
              <p className='text-sm text-gray-500'>
                Drag widgets from the palette into the placeholders below
              </p>
            </div>

            <div className='border-2 border-gray-300 rounded-lg p-4 bg-gray-50'>
              <div
                className='grid gap-4'
                style={{
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gridAutoRows: '120px',
                  minHeight: '600px',
                }}
              >
                {placeholders.map(renderPlaceholder)}
              </div>
            </div>
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
              onClick={onBack}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
            >
              Back to Settings
            </button>
            <button
              onClick={handleSave}
              disabled={placedWidgets.length === 0}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
            >
              <CheckIcon className='h-4 w-4' />
              <span>Save Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPlacement; 
