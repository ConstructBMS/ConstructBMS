import type { ComponentType } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  BellIcon,
  CogIcon,
  ChartPieIcon,
  ClockIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentIcon,
  FolderIcon,
  ShoppingCartIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
  BoltIcon,
  CloudIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

// Import all widget components
import StatsCards from '../dashboard/StatsCards';
import RevenueChart from '../dashboard/RevenueChart';
import TasksWidget from '../dashboard/TasksWidget';
import ProjectsOverview from '../dashboard/ProjectsOverview';
import RecentActivity from '../dashboard/RecentActivity';
import QuickActions from '../dashboard/QuickActions';

export interface WidgetConfig {
  category: string;
  component: ComponentType<any>;
  configurable: boolean;
  defaultSize: { height: number, width: number; 
};
  description: string;
  icon: ComponentType<any>;
  id: string;
  maxSize: { height: number, width: number; };
  minSize: { height: number, width: number; };
  tags: string[];
  title: string;
  type: string;
}

// Widget component registry
const widgetComponents: Record<string, ComponentType<any>> = {
  'stats-cards': StatsCards,
  'revenue-chart': RevenueChart,
  'tasks-widget': TasksWidget,
  'projects-overview': ProjectsOverview,
  'recent-activity': RecentActivity,
  'quick-actions': QuickActions,
  // Add more widgets here as they're created
};

// Widget configuration registry
export const widgetRegistry: WidgetConfig[] = [
  // Analytics Widgets
  {
    id: 'stats-cards',
    type: 'stats-cards',
    title: 'Statistics Cards',
    description: 'Display key metrics and statistics',
    icon: ChartBarIcon,
    component: StatsCards,
    defaultSize: { width: 3, height: 1 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 6, height: 2 },
    configurable: true,
    category: 'Analytics',
    tags: ['metrics', 'statistics', 'dashboard'],
  },
  {
    id: 'revenue-chart',
    type: 'revenue-chart',
    title: 'Revenue Chart',
    description: 'Visualize revenue trends and data',
    icon: ChartPieIcon,
    component: RevenueChart,
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 3 },
    configurable: true,
    category: 'Analytics',
    tags: ['chart', 'revenue', 'analytics'],
  },
  {
    id: 'performance-metrics',
    type: 'performance-metrics',
    title: 'Performance Metrics',
    description: 'Track system and business performance',
    icon: BoltIcon,
    component: () => null, // Placeholder
    defaultSize: { width: 2, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 4, height: 2 },
    configurable: true,
    category: 'Analytics',
    tags: ['performance', 'metrics', 'monitoring'],
  },

  // Productivity Widgets
  {
    id: 'tasks-widget',
    type: 'tasks-widget',
    title: 'Tasks Overview',
    description: 'Manage and view task progress',
    icon: CheckCircleIcon,
    component: TasksWidget,
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 4, height: 4 },
    configurable: true,
    category: 'Productivity',
    tags: ['tasks', 'productivity', 'management'],
  },
  {
    id: 'projects-overview',
    type: 'projects-overview',
    title: 'Projects Overview',
    description: 'Track project status and progress',
    icon: DocumentTextIcon,
    component: ProjectsOverview,
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 6, height: 3 },
    configurable: true,
    category: 'Productivity',
    tags: ['projects', 'management', 'overview'],
  },
  {
    id: 'recent-activity',
    type: 'recent-activity',
    title: 'Recent Activity',
    description: 'Show latest system activities',
    icon: ClockIcon,
    component: RecentActivity,
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 6, height: 3 },
    configurable: true,
    category: 'Monitoring',
    tags: ['activity', 'monitoring', 'feed'],
  },
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Quick Actions',
    description: 'Common actions and shortcuts',
    icon: CogIcon,
    component: QuickActions,
    defaultSize: { width: 3, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 6, height: 2 },
    configurable: true,
    category: 'Navigation',
    tags: ['actions', 'shortcuts', 'navigation'],
  },
];

// Utility functions for widget management
export const getWidgetConfig = (type: string): WidgetConfig | undefined => {
  return widgetRegistry.find(widget => widget.type === type);
};

export const getWidgetComponent = (type: string): ComponentType<any> | undefined => {
  return widgetComponents[type];
};

export const getWidgetsByCategory = (category: string): WidgetConfig[] => {
  return widgetRegistry.filter(widget => widget.category === category);
};

export const getWidgetsByTag = (tag: string): WidgetConfig[] => {
  return widgetRegistry.filter(widget => widget.tags.includes(tag));
};

export const getAllCategories = (): string[] => {
  return [...new Set(widgetRegistry.map(widget => widget.category))];
};

export const getAllTags = (): string[] => {
  const allTags = widgetRegistry.flatMap(widget => widget.tags);
  return [...new Set(allTags)];
};

// Widget styling constants
export const WIDGET_STYLES = {
  base: 'h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light dark:border-white/20',
  header: 'flex items-center justify-between px-4 py-2 silvery-fade-dark dark:silvery-fade-light',
  content: 'flex-1 p-4',
  loading: 'animate-pulse',
  error: 'text-red-500 dark:text-red-400',
  empty: 'text-gray-500 dark:text-gray-400',
} as const;

// Widget size presets for different grid systems
export const WIDGET_SIZES = {
  small: { width: 1, height: 1 },
  medium: { width: 2, height: 1 },
  large: { width: 3, height: 2 },
  wide: { width: 3, height: 1 },
  tall: { width: 1, height: 2 },
  full: { width: 6, height: 2 },
} as const;

export default widgetRegistry; 
