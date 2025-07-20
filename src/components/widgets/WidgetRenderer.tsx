import { useEffect, useState } from 'react';
import { getWidgetConfig, getWidgetComponent, WIDGET_STYLES } from './WidgetRegistry';
import WidgetBase from './WidgetBase';
import { demoDataService } from '../../services/demoData';
import { availableWidgets } from './WidgetTypes';

interface WidgetRendererProps {
  config?: any;
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
  type: string;
}

const WidgetRenderer = ({
  type,
  config,
  onNavigateToModule,
}: WidgetRendererProps) => {
  // Get widget configuration
  const widgetConfig = getWidgetConfig(type);
  const WidgetComponent = getWidgetComponent(type);
  const availableWidgetConfig = availableWidgets.find(w => w.type === type);

  // Get content height behavior
  const contentHeight = availableWidgetConfig?.contentHeight || 'auto';

  // If we have a registered widget component, use it
  if (WidgetComponent && widgetConfig) {
    return (
      <WidgetBase
        title={widgetConfig.title}
        icon={widgetConfig.icon}
        showSettings={widgetConfig.configurable}
        onSettingsClick={() => console.log('Widget settings clicked')}
        contentHeight={contentHeight}
      >
        <WidgetComponent {...(onNavigateToModule && { onNavigateToModule })} />
      </WidgetBase>
    );
  }

  // Fallback to switch statement for legacy widgets
  switch (type) {

    case 'team-overview':
      return (
        <div className={`h-full flex flex-col ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-blue-600 font-bold text-sm'>TH</span>
                </div>
                <div>
                  <p className='font-medium text-gray-900 dark:text-white'>Tom Harvey</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Project Manager</p>
                </div>
              </div>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Online
              </span>
            </div>
            <div className='flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-purple-600 font-bold text-sm'>JS</span>
                </div>
                <div>
                  <p className='font-medium text-gray-900 dark:text-white'>Jane Smith</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Developer</p>
                </div>
              </div>
              <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                Away
              </span>
            </div>
          </div>
        </div>
      );

    case 'calendar-widget':
      return (
        <div className={`h-full flex flex-col ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className='space-y-3'>
            <div className='p-3 border-l-4 border-blue-500 rounded-lg border border-gray-200 dark:border-gray-600'>
              <p className='font-medium text-gray-900 dark:text-white'>Team Meeting</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Today, 2:00 PM</p>
            </div>
            <div className='p-3 border-l-4 border-green-500 rounded-lg border border-gray-200 dark:border-gray-600'>
              <p className='font-medium text-gray-900 dark:text-white'>Project Review</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Tomorrow, 10:00 AM</p>
            </div>
            <div className='p-3 border-l-4 border-purple-500 rounded-lg border border-gray-200 dark:border-gray-600'>
              <p className='font-medium text-gray-900 dark:text-white'>Client Call</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Friday, 3:30 PM</p>
            </div>
          </div>
        </div>
      );

    case 'financial-overview':
      return (
        <div className={`h-full flex flex-col ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className='space-y-4'>
            <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-gray-600 dark:text-white'>Monthly Revenue</span>
              <span className='font-semibold text-green-600 dark:text-green-400'>£45,230</span>
            </div>
            <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-gray-600 dark:text-white'>Expenses</span>
              <span className='font-semibold text-red-600 dark:text-red-400'>£12,450</span>
            </div>
            <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-gray-600 dark:text-white'>Profit</span>
              <span className='font-semibold text-blue-600 dark:text-blue-400'>£32,780</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-green-500 h-2 rounded-full'
                style={{ width: '72%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    case 'notifications-widget':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light dark:border-white/20 ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center mb-4 px-4 py-2 silvery-fade-dark dark:silvery-fade-light">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Notifications</h3>
          </div>
          <div className='space-y-2 px-4 pb-4'>
            <div className='flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  New project assigned
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>2 minutes ago</p>
              </div>
            </div>
            <div className='flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  Task deadline approaching
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>15 minutes ago</p>
              </div>
            </div>
            <div className='flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  Invoice approved
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      );

    // New widget types from WidgetPlacement
    case 'stats-cards':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Statistics Overview</h3>
          </div>
          <div className='grid grid-cols-2 gap-2 px-4 pb-4'>
            <div className='bg-gray-100 dark:bg-gray-700 rounded p-2 text-center'>
              <div className='text-lg font-bold text-gray-800 dark:text-white'>£125,000</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Revenue</div>
            </div>
            <div className='bg-gray-100 dark:bg-gray-700 rounded p-2 text-center'>
              <div className='text-lg font-bold text-gray-800 dark:text-white'>24</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Projects</div>
            </div>
            <div className='bg-gray-100 dark:bg-gray-700 rounded p-2 text-center'>
              <div className='text-lg font-bold text-gray-800 dark:text-white'>156</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Tasks</div>
            </div>
            <div className='bg-gray-100 dark:bg-gray-700 rounded p-2 text-center'>
              <div className='text-lg font-bold text-gray-800 dark:text-white'>12</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Team</div>
            </div>
          </div>
        </div>
      );

    case 'task-list': {
      const [tasks, setTasks] = useState<any[]>([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const loadTasks = async () => {
          try {
            const demoDataService = (await import('../../services/demoData')).demoDataService;
            const tasksData = await demoDataService.getTasks();
            setTasks(tasksData.slice(0, 5)); // Show first 5 tasks
            setLoading(false);
          } catch (error) {
            console.error('Error loading tasks:', error);
            setLoading(false);
          }
        };
        loadTasks();
      }, []);

      if (loading) {
        return (
          <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light`}>
            <div className="flex items-center mb-4 px-4 py-2">
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Task List</h3>
            </div>
            <div className='space-y-1 px-4 pb-4 overflow-y-auto flex-1'>
              <div className='animate-pulse space-y-1'>
                <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded'></div>
                <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded'></div>
                <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded'></div>
                <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded'></div>
                <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded'></div>
              </div>
            </div>
          </div>
        );
      }

      const getPriorityColor = (priority: string) => {
        switch (priority) {
          case 'high':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          case 'medium':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          case 'low':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
      };

      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Task List</h3>
          </div>
          <div className='space-y-1 px-4 pb-4 overflow-y-auto flex-1'>
            {tasks.map((task) => (
              <div 
                key={task.id}
                className='flex items-center justify-between p-2 rounded text-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                onClick={() => {
                  onNavigateToModule?.('tasks', { openTask: task });
                }}
              >
                <span className='truncate text-gray-900 dark:text-white'>{task.title}</span>
                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'project-list': {
      const [projects, setProjects] = useState<any[]>([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const loadProjects = async () => {
          try {
            const demoDataService = (await import('../../services/demoData')).demoDataService;
            const projectsData = await demoDataService.getProjects();
            setProjects(projectsData.slice(0, 3)); // Show first 3 projects
            setLoading(false);
          } catch (error) {
            console.error('Error loading projects:', error);
            setLoading(false);
          }
        };
        loadProjects();
      }, []);

      if (loading) {
        return (
          <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light`}>
            <div className="flex items-center mb-4 px-4 py-2">
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Project Overview</h3>
            </div>
            <div className='space-y-2 px-4 pb-4 overflow-y-auto flex-1'>
              <div className='animate-pulse space-y-2'>
                <div className='h-16 bg-gray-200 dark:bg-gray-700 rounded'></div>
                <div className='h-16 bg-gray-200 dark:bg-gray-700 rounded'></div>
                <div className='h-16 bg-gray-200 dark:bg-gray-700 rounded'></div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Project Overview</h3>
          </div>
          <div className='space-y-2 px-4 pb-4 overflow-y-auto flex-1'>
            {projects.map((project) => (
              <div 
                key={project.id}
                className='p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                onClick={() => {
                  onNavigateToModule?.('projects', { openProject: project });
                }}
              >
                <div className='font-medium text-sm text-gray-900 dark:text-white'>{project.name}</div>
                <div className='flex items-center justify-between text-xs text-gray-600 dark:text-gray-400'>
                  <span>{Math.round(project.progress)}%</span>
                  <span>£{(project.budget / 1000).toFixed(0)}K</span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1'>
                  <div className='bg-blue-600 h-1 rounded-full' style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'activity-feed':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Recent Activity</h3>
          </div>
          <div className='space-y-2 px-4 pb-4 overflow-y-auto flex-1'>
            <div 
              className='flex items-start space-x-2 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              onClick={() => onNavigateToModule?.('projects')}
            >
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium text-gray-900 dark:text-white'>Project completed</div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>John Doe • 2 hours ago</div>
              </div>
            </div>
            <div 
              className='flex items-start space-x-2 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              onClick={() => onNavigateToModule?.('tasks')}
            >
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium text-gray-900 dark:text-white'>New task assigned</div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>Jane Smith • 4 hours ago</div>
              </div>
            </div>
            <div 
              className='flex items-start space-x-2 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              onClick={() => onNavigateToModule?.('finance')}
            >
              <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2'></div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium text-gray-900 dark:text-white'>Budget updated</div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>Mike Johnson • 6 hours ago</div>
              </div>
            </div>
            <div 
              className='flex items-start space-x-2 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              onClick={() => onNavigateToModule?.('calendar')}
            >
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium text-gray-900 dark:text-white'>Team meeting scheduled</div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>Sarah Wilson • 1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'calendar':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Calendar Events</h3>
          </div>
          <div className='space-y-2 px-4 pb-4'>
            <div className='p-2 rounded border border-gray-200 dark:border-gray-600'>
              <div className='font-medium text-sm text-gray-900 dark:text-white'>Team Meeting</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>2024-01-15 • 10:00 AM</div>
              <span className='inline-block px-2 py-1 rounded text-xs mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>meeting</span>
            </div>
            <div className='p-2 rounded border border-gray-200 dark:border-gray-600'>
              <div className='font-medium text-sm text-gray-900 dark:text-white'>Client Presentation</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>2024-01-16 • 2:00 PM</div>
              <span className='inline-block px-2 py-1 rounded text-xs mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>presentation</span>
            </div>
            <div className='p-2 rounded border border-gray-200 dark:border-gray-600'>
              <div className='font-medium text-sm text-gray-900 dark:text-white'>Project Deadline</div>
              <div className='text-xs text-gray-600 dark:text-gray-400'>2024-01-18 • 5:00 PM</div>
              <span className='inline-block px-2 py-1 rounded text-xs mt-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'>deadline</span>
            </div>
          </div>
        </div>
      );

    case 'notifications':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Notifications</h3>
          </div>
          <div className='space-y-2 px-4 pb-4 overflow-y-auto flex-1'>
            <div 
              className='p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              onClick={() => onNavigateToModule?.('projects')}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-900 dark:text-white'>Project Update</div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>Office renovation is 75% complete</div>
                </div>
                <span className='px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>info</span>
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-500 mt-1'>1 hour ago</div>
            </div>
            <div 
              className='p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              onClick={() => onNavigateToModule?.('finance')}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-900 dark:text-white'>Budget Alert</div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>Equipment budget is 90% used</div>
                </div>
                <span className='px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>warning</span>
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-500 mt-1'>3 hours ago</div>
            </div>
            <div 
              className='p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              onClick={() => onNavigateToModule?.('tasks')}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-900 dark:text-white'>Task Completed</div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>Safety inspection passed successfully</div>
                </div>
                <span className='px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>success</span>
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-500 mt-1'>5 hours ago</div>
            </div>
          </div>
        </div>
      );

    case 'revenue-chart':
      return (
        <div className={`h-full flex flex-col ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-400 dark:text-white mb-2'>📈</div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Revenue Chart</div>
              <div className='text-xs text-gray-500 dark:text-gray-500 mt-1'>Chart visualization</div>
            </div>
          </div>
        </div>
      );

    // Analytics Widgets
    case 'performance-metrics':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Performance Metrics</h3>
          </div>
          <div className='grid grid-cols-2 gap-4 px-4 pb-4'>
            <div className='text-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='text-2xl font-bold text-gray-400 dark:text-white'>0%</div>
              <div className='text-sm text-gray-600 dark:text-white'>Uptime</div>
            </div>
            <div className='text-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='text-2xl font-bold text-gray-400 dark:text-white'>0s</div>
              <div className='text-sm text-gray-600 dark:text-white'>Response Time</div>
            </div>
            <div className='text-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='text-2xl font-bold text-gray-400 dark:text-white'>0</div>
              <div className='text-sm text-gray-600 dark:text-white'>Active Users</div>
            </div>
            <div className='text-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='text-2xl font-bold text-gray-400 dark:text-white'>0%</div>
              <div className='text-sm text-gray-600 dark:text-white'>Satisfaction</div>
            </div>
          </div>
        </div>
      );

    case 'conversion-funnel':
      return (
        <div className={`h-full flex flex-col ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className='space-y-3'>
            <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Visitors</span>
              <span className='font-semibold text-gray-900 dark:text-white'>10,000</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-blue-500 h-2 rounded-full'
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Leads</span>
              <span className='font-semibold text-gray-900 dark:text-white'>1,200</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-blue-500 h-2 rounded-full'
                style={{ width: '12%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Customers</span>
              <span className='font-semibold text-gray-900 dark:text-white'>240</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-purple-500 h-2 rounded-full'
                style={{ width: '2.4%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    // Communication Widgets
    case 'email-overview': {
      const [stats, setStats] = useState<{ drafts: number, inbox: number; sentToday: number; unread: number; } | null>(null);
      const [loading, setLoading] = useState(true);
      useEffect(() => {
        let mounted = true;
        
        const loadEmailStats = async () => {
          try {
            const isInDemoMode = await demoDataService.isDemoMode();
            if (isInDemoMode) {
              const data = await demoDataService.getEmailStats();
              if (mounted) {
                setStats(data);
                setLoading(false);
              }
            } else {
              // Not in demo mode, show default stats
              if (mounted) {
                setStats({ inbox: 0, unread: 0, sentToday: 0, drafts: 0 });
                setLoading(false);
              }
            }
          } catch (error) {
            console.warn('Failed to load email stats:', error);
            if (mounted) {
              setStats({ inbox: 0, unread: 0, sentToday: 0, drafts: 0 });
              setLoading(false);
            }
          }
        };
        
        loadEmailStats();
        return () => {
          mounted = false;
        };
      }, []);

      if (loading) {
      return (
          <div className={`h-full flex flex-col ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
            <div className='animate-pulse space-y-3'>
              <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
              <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
              <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
          </div>
          </div>
        );
      }

      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Email Overview</h3>
          </div>
          <div className='space-y-3 px-4 pb-4'>
                <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Inbox</span>
              <span className='font-semibold text-gray-900 dark:text-white'>{stats?.inbox || 0}</span>
                </div>
                <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Unread</span>
              <span className='font-semibold text-red-600 dark:text-red-400'>{stats?.unread || 0}</span>
                </div>
                <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Sent Today</span>
              <span className='font-semibold text-green-600 dark:text-green-400'>{stats?.sentToday || 0}</span>
                </div>
                <div className='flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Drafts</span>
              <span className='font-semibold text-yellow-600 dark:text-yellow-400'>{stats?.drafts || 0}</span>
                </div>
          </div>
        </div>
      );
    }

    case 'chat-activity':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 p-2 bg-gray-50 rounded'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Support Team</p>
                <p className='text-xs text-gray-500'>Last message: 2 min ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 bg-gray-50 rounded'>
              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Development</p>
                <p className='text-xs text-gray-500'>
                  Last message: 15 min ago
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 bg-gray-50 rounded'>
              <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Marketing</p>
                <p className='text-xs text-gray-500'>
                  Last message: 1 hour ago
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    // Monitoring Widgets
    case 'system-health':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>System Health</h3>
          </div>
          <div className='space-y-4 px-4 pb-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>CPU Usage</span>
              <span className='font-semibold text-gray-400 dark:text-gray-300'>0%</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-gray-400 dark:bg-gray-500 h-2 rounded-full'
                style={{ width: '0%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>Memory</span>
              <span className='font-semibold text-gray-400 dark:text-gray-300'>0%</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-gray-400 dark:bg-gray-500 h-2 rounded-full'
                style={{ width: '0%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>Disk Space</span>
              <span className='font-semibold text-gray-400 dark:text-gray-300'>0%</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-gray-400 dark:bg-gray-500 h-2 rounded-full'
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    case 'error-logs':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='p-3 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-sm font-medium text-red-900'>
                Database Connection Failed
              </p>
              <p className='text-xs text-red-700'>2 minutes ago</p>
            </div>
            <div className='p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
              <p className='text-sm font-medium text-yellow-900'>
                High Memory Usage
              </p>
              <p className='text-xs text-yellow-700'>15 minutes ago</p>
            </div>
            <div className='p-3 bg-blue-50 border-l-4 border-blue-500 rounded'>
              <p className='text-sm font-medium text-blue-900'>
                Backup Completed
              </p>
              <p className='text-xs text-blue-700'>1 hour ago</p>
            </div>
          </div>
        </div>
      );

    // Finance Widgets
    case 'expense-tracker':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Office Supplies</span>
              <span className='font-semibold text-red-600'>£450</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Software Licenses</span>
              <span className='font-semibold text-red-600'>£1,200</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Travel</span>
              <span className='font-semibold text-red-600'>£800</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Marketing</span>
              <span className='font-semibold text-red-600'>£2,100</span>
            </div>
            <div className='border-t pt-2'>
              <div className='flex justify-between items-center font-semibold'>
                <span>Total</span>
                <span className='text-red-600'>£4,550</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'budget-overview':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-constructbms-dark-2 dark:text-gray-400'>Q1 Budget</span>
                <span className='text-sm font-semibold text-constructbms-dark-1 dark:text-white'>£50,000</span>
              </div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-constructbms-dark-2 dark:text-gray-400'>Spent</span>
                <span className='text-sm font-semibold text-red-600'>
                  £32,450
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-constructbms-primary h-2 rounded-full'
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-bold text-constructbms-primary'>£17,550</div>
              <div className='text-sm text-constructbms-dark-2 dark:text-gray-400'>Remaining</div>
            </div>
          </div>
        </div>
      );

    // Document Widgets
    case 'document-library':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-blue-100 rounded flex items-center justify-center'>
                <span className='text-blue-600 text-xs'>PDF</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Q1 Report</p>
                <p className='text-xs text-constructbms-dark-2 dark:text-gray-400'>Updated 2 days ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-green-100 rounded flex items-center justify-center'>
                <span className='text-green-600 text-xs'>DOC</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Project Proposal</p>
                <p className='text-xs text-constructbms-dark-2 dark:text-gray-400'>Updated 1 week ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-purple-100 rounded flex items-center justify-center'>
                <span className='text-purple-600 text-xs'>XLS</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Budget Spreadsheet</p>
                <p className='text-xs text-constructbms-dark-2 dark:text-gray-400'>Updated 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      );

    // IT Widgets
    case 'server-status':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                <span className='font-medium'>Web Server</span>
              </div>
              <span className='text-sm text-green-600'>Online</span>
            </div>
            <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                <span className='font-medium'>Database</span>
              </div>
              <span className='text-sm text-green-600'>Online</span>
            </div>
            <div className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-yellow-500 rounded-full mr-3'></div>
                <span className='font-medium'>Backup Server</span>
              </div>
              <span className='text-sm text-yellow-600'>Maintenance</span>
            </div>
          </div>
        </div>
      );

    case 'backup-status':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Last Backup</span>
              <span className='font-semibold text-green-600'>2 hours ago</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Next Backup</span>
              <span className='font-semibold text-blue-600'>22 hours</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Backup Size</span>
              <span className='font-semibold'>2.4 GB</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Status</span>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Success
              </span>
            </div>
          </div>
        </div>
      );

    case 'security-alerts':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='p-3 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-sm font-medium text-red-900'>
                Failed Login Attempt
              </p>
              <p className='text-xs text-red-700'>
                Multiple attempts from IP: 192.168.1.100
              </p>
            </div>
            <div className='p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
              <p className='text-sm font-medium text-yellow-900'>
                SSL Certificate Expiring
              </p>
              <p className='text-xs text-yellow-700'>Expires in 15 days</p>
            </div>
            <div className='p-3 bg-green-50 border-l-4 border-green-500 rounded'>
              <p className='text-sm font-medium text-green-900'>
                Security Scan Complete
              </p>
              <p className='text-xs text-green-700'>No vulnerabilities found</p>
            </div>
          </div>
        </div>
      );

    // Marketing Widgets
    case 'campaign-performance':
      return (
        <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center mb-4 px-4 py-2">
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Campaign Performance</h3>
          </div>
          <div className='space-y-4 px-4 pb-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>Email Campaign</span>
              <span className='font-semibold text-gray-400 dark:text-gray-300'>0%</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-gray-400 dark:bg-gray-500 h-2 rounded-full'
                style={{ width: '0%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>Social Media</span>
              <span className='font-semibold text-gray-400 dark:text-gray-300'>0%</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-gray-400 dark:bg-gray-500 h-2 rounded-full'
                style={{ width: '0%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>PPC Ads</span>
              <span className='font-semibold text-gray-400 dark:text-gray-300'>0%</span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-gray-400 dark:bg-gray-500 h-2 rounded-full'
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    case 'social-media-feed':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-6 h-6 bg-blue-500 rounded'></div>
                <span className='text-sm font-medium'>Twitter</span>
              </div>
              <p className='text-sm text-gray-700'>
                New product launch getting great feedback! #innovation
              </p>
            </div>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-6 h-6 bg-blue-600 rounded'></div>
                <span className='text-sm font-medium'>LinkedIn</span>
              </div>
              <p className='text-sm text-gray-700'>
                Excited to announce our latest partnership...
              </p>
            </div>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-6 h-6 bg-blue-400 rounded'></div>
                <span className='text-sm font-medium'>Facebook</span>
              </div>
              <p className='text-sm text-gray-700'>
                Behind the scenes of our latest project...
              </p>
            </div>
          </div>
        </div>
      );

    // Weather Widget
    case 'weather-widget':
      return (
        <div className='h-full flex flex-col'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>22°C</div>
            <div className='text-sm text-gray-600 mb-4'>London, UK</div>
            <div className='flex justify-between text-sm'>
              <div>
                <div className='text-gray-600'>Humidity</div>
                <div className='font-semibold'>65%</div>
              </div>
              <div>
                <div className='text-gray-600'>Wind</div>
                <div className='font-semibold'>12 km/h</div>
              </div>
              <div>
                <div className='text-gray-600'>UV Index</div>
                <div className='font-semibold'>3</div>
              </div>
            </div>
          </div>
        </div>
      );

    // Custom Widgets
    case 'custom-html':
      return (
        <div className='h-full flex flex-col'>
          <div className='text-center text-gray-500'>
            <p className='text-sm'>Configure custom HTML content</p>
            <p className='text-xs mt-2'>Click the settings icon to edit</p>
          </div>
        </div>
      );

    case 'iframe-widget':
      return (
        <div className='h-full flex flex-col'>
          <div className='text-center text-gray-500'>
            <p className='text-sm'>Configure external website URL</p>
            <p className='text-xs mt-2'>Click the settings icon to edit</p>
          </div>
        </div>
      );

    // Additional widgets
    case 'time-tracking':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>6h 23m</div>
              <div className='text-sm text-gray-600'>Today</div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Project A</span>
                <span className='font-semibold'>3h 45m</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Project B</span>
                <span className='font-semibold'>2h 38m</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'goals-progress':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-constructbms-dark-2 dark:text-gray-400'>Q1 Revenue Target</span>
                <span className='text-sm font-semibold text-constructbms-dark-1 dark:text-white'>78%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-constructbms-primary h-2 rounded-full'
                  style={{ width: '78%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-constructbms-dark-2 dark:text-gray-400'>
                  Customer Acquisition
                </span>
                <span className='text-sm font-semibold text-constructbms-dark-1 dark:text-white'>92%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-constructbms-primary h-2 rounded-full'
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'meeting-schedule':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Weekly Standup</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Today, 9:00 AM</p>
            </div>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Client Review</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Tomorrow, 2:00 PM</p>
            </div>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Team Retrospective</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Friday, 3:30 PM</p>
            </div>
          </div>
        </div>
      );

    case 'deadlines':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Project Alpha</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Due: Today</p>
            </div>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Beta Testing</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Due: Tomorrow</p>
            </div>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Documentation</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Due: Next Week</p>
            </div>
          </div>
        </div>
      );

    case 'team-availability':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <span className='font-medium text-gray-900 dark:text-white'>Tom Harvey</span>
              <span className='px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full'>
                Available
              </span>
            </div>
            <div className='flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <span className='font-medium text-gray-900 dark:text-white'>Jane Smith</span>
              <span className='px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded-full'>
                In Meeting
              </span>
            </div>
            <div className='flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <span className='font-medium text-gray-900 dark:text-white'>Mike Johnson</span>
              <span className='px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs rounded-full'>
                Offline
              </span>
            </div>
          </div>
        </div>
      );

    case 'favorites':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-2'>
              <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
                <div className='w-6 h-6 bg-blue-100 rounded flex items-center justify-center'>
                  <span className='text-blue-600 text-xs'>P</span>
                </div>
                <span className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Projects</span>
              </div>
              <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
                <div className='w-6 h-6 bg-green-100 rounded flex items-center justify-center'>
                  <span className='text-green-600 text-xs'>T</span>
                </div>
                <span className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Tasks</span>
              </div>
              <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
                <div className='w-6 h-6 bg-purple-100 rounded flex items-center justify-center'>
                  <span className='text-purple-600 text-xs'>C</span>
                </div>
                <span className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Calendar</span>
              </div>
            </div>
        </div>
      );

    case 'recent-documents':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
              <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
                <div className='w-8 h-8 bg-blue-100 rounded flex items-center justify-center'>
                  <span className='text-blue-600 text-xs'>PDF</span>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Monthly Report</p>
                  <p className='text-xs text-constructbms-dark-2 dark:text-gray-400'>Opened 2 hours ago</p>
                </div>
              </div>
              <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
                <div className='w-8 h-8 bg-green-100 rounded flex items-center justify-center'>
                  <span className='text-green-600 text-xs'>DOC</span>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Meeting Notes</p>
                  <p className='text-xs text-constructbms-dark-2 dark:text-gray-400'>Opened 1 day ago</p>
                </div>
              </div>
              <div className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer'>
                <div className='w-8 h-8 bg-purple-100 rounded flex items-center justify-center'>
                  <span className='text-purple-600 text-xs'>XLS</span>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-constructbms-dark-1 dark:text-white'>Budget 2024</p>
                  <p className='text-xs text-constructbms-dark-2 dark:text-gray-400'>Opened 3 days ago</p>
                </div>
              </div>
            </div>
        </div>
      );

    case 'inventory-status':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Product A</span>
              <span className='font-semibold text-green-600'>In Stock</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Product B</span>
              <span className='font-semibold text-yellow-600'>Low Stock</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Product C</span>
              <span className='font-semibold text-red-600'>Out of Stock</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Total Items</span>
              <span className='font-semibold'>1,247</span>
            </div>
          </div>
        </div>
      );

    case 'maintenance-schedule':
      return (
        <div className='h-full flex flex-col'>
          <div className='space-y-3'>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Server Maintenance</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Scheduled: Tomorrow, 2:00 AM
              </p>
            </div>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Backup System</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Last: Today, 1:00 AM</p>
            </div>
            <div className='p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <p className='font-medium text-gray-900 dark:text-white'>Security Updates</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Due: This weekend</p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className='h-full flex flex-col'>
          <p className='text-constructbms-dark-2 dark:text-gray-400'>Widget type "{type}" not found</p>
        </div>
      );
  }
};

export default WidgetRenderer;
