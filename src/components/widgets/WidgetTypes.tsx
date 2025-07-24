import React from 'react';
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

// Standardized widget sizes for consistent grid layout
export const WIDGET_SIZES = {
  SMALL: { width: 2, height: 2 },    // 2x2 grid units
  MEDIUM: { width: 3, height: 2 },   // 3x2 grid units  
  LARGE: { width: 4, height: 3 },    // 4x3 grid units
  WIDE: { width: 6, height: 2 },     // 6x2 grid units (half width)
  TALL: { width: 2, height: 4 },     // 2x4 grid units
  FULL_WIDTH: { width: 6, height: 3 }, // 6x3 grid units (full width)
  SQUARE: { width: 3, height: 3 },   // 3x3 grid units
} as const;

export interface WidgetConfig {
  // How content should behave
  aspectRatio?: number;
  category: string;
  configurable: boolean;
  contentHeight?: 'auto' | 'fixed' | 'scrollable';
  defaultSize: { height: number, width: number; 
};
  description: string;
  icon: React.ComponentType<any>;
  id: string;
  maxSize: { height: number, width: number; };
  minSize: { height: number, width: number; };
  title: string; 
  type: string; // Optional aspect ratio for consistent sizing
}

export const availableWidgets: WidgetConfig[] = [
  // Analytics Widgets
  {
    id: 'stats-cards',
    type: 'stats-cards',
    title: 'Statistics Cards',
    description: 'Display key metrics and statistics',
    icon: ChartBarIcon,
    defaultSize: WIDGET_SIZES.WIDE,
    minSize: WIDGET_SIZES.MEDIUM,
    maxSize: WIDGET_SIZES.FULL_WIDTH,
    configurable: true,
    category: 'Analytics',
    contentHeight: 'auto',
  },
  {
    id: 'revenue-chart',
    type: 'revenue-chart',
    title: 'Revenue Chart',
    description: 'Visualize revenue trends and data',
    icon: ChartPieIcon,
    defaultSize: WIDGET_SIZES.LARGE,
    minSize: WIDGET_SIZES.MEDIUM,
    maxSize: WIDGET_SIZES.FULL_WIDTH,
    configurable: true,
    category: 'Analytics',
    contentHeight: 'fixed',
    aspectRatio: 1.5,
  },
  {
    id: 'performance-metrics',
    type: 'performance-metrics',
    title: 'Performance Metrics',
    description: 'Track system and business performance',
    icon: BoltIcon,
    defaultSize: WIDGET_SIZES.SQUARE,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Analytics',
    contentHeight: 'auto',
  },
  {
    id: 'conversion-funnel',
    type: 'conversion-funnel',
    title: 'Conversion Funnel',
    description: 'Track customer conversion rates',
    icon: FireIcon,
    defaultSize: WIDGET_SIZES.TALL,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.TALL,
    configurable: true,
    category: 'Analytics',
    contentHeight: 'scrollable',
  },

  // Productivity Widgets
  {
    id: 'tasks-widget',
    type: 'tasks-widget',
    title: 'Tasks Overview',
    description: 'Manage and view task progress',
    icon: CheckCircleIcon,
    defaultSize: WIDGET_SIZES.TALL,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.TALL,
    configurable: true,
    category: 'Productivity',
    contentHeight: 'scrollable',
  },
  {
    id: 'projects-overview',
    type: 'projects-overview',
    title: 'Projects Overview',
    description: 'Track project status and progress',
    icon: DocumentTextIcon,
    defaultSize: WIDGET_SIZES.LARGE,
    minSize: WIDGET_SIZES.MEDIUM,
    maxSize: WIDGET_SIZES.FULL_WIDTH,
    configurable: true,
    category: 'Productivity',
    contentHeight: 'scrollable',
  },
  {
    id: 'time-tracking',
    type: 'time-tracking',
    title: 'Time Tracking',
    description: 'Monitor time spent on tasks and projects',
    icon: ClockIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Productivity',
    contentHeight: 'auto',
  },
  {
    id: 'goals-progress',
    type: 'goals-progress',
    title: 'Goals Progress',
    description: 'Track progress towards business goals',
    icon: StarIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Productivity',
    contentHeight: 'auto',
  },

  // Communication Widgets
  {
    id: 'email-overview',
    type: 'email-overview',
    title: 'Email Overview',
    description: 'Monitor email activity and inbox status',
    icon: EnvelopeIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Communication',
    contentHeight: 'auto',
  },
  {
    id: 'chat-activity',
    type: 'chat-activity',
    title: 'Chat Activity',
    description: 'View recent chat messages and conversations',
    icon: PhoneIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.TALL,
    configurable: true,
    category: 'Communication',
    contentHeight: 'scrollable',
  },
  {
    id: 'meeting-schedule',
    type: 'meeting-schedule',
    title: 'Meeting Schedule',
    description: 'View upcoming meetings and appointments',
    icon: CalendarIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Communication',
    contentHeight: 'scrollable',
  },

  // Monitoring Widgets
  {
    id: 'recent-activity',
    type: 'recent-activity',
    title: 'Recent Activity',
    description: 'Show latest system activities',
    icon: ClockIcon,
    defaultSize: WIDGET_SIZES.LARGE,
    minSize: WIDGET_SIZES.MEDIUM,
    maxSize: WIDGET_SIZES.FULL_WIDTH,
    configurable: true,
    category: 'Monitoring',
    contentHeight: 'scrollable',
  },
  {
    id: 'notifications-widget',
    type: 'notifications-widget',
    title: 'Notifications',
    description: 'Display system notifications and alerts',
    icon: BellIcon,
    defaultSize: WIDGET_SIZES.TALL,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.TALL,
    configurable: true,
    category: 'Monitoring',
    contentHeight: 'scrollable',
  },
  {
    id: 'system-health',
    type: 'system-health',
    title: 'System Health',
    description: 'Monitor system performance and status',
    icon: HeartIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Monitoring',
    contentHeight: 'auto',
  },
  {
    id: 'error-logs',
    type: 'error-logs',
    title: 'Error Logs',
    description: 'View system errors and warnings',
    icon: ExclamationTriangleIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.TALL,
    configurable: true,
    category: 'Monitoring',
    contentHeight: 'scrollable',
  },

  // Navigation Widgets
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Quick Actions',
    description: 'Common actions and shortcuts',
    icon: CogIcon,
    defaultSize: WIDGET_SIZES.WIDE,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.FULL_WIDTH,
    configurable: true,
    category: 'Navigation',
    contentHeight: 'auto',
  },

  // Team & Collaboration Widgets
  {
    id: 'team-overview',
    type: 'team-overview',
    title: 'Team Overview',
    description: 'View team members and their status',
    icon: UserGroupIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Team',
    contentHeight: 'scrollable',
  },

  // Calendar & Scheduling Widgets
  {
    id: 'calendar-widget',
    type: 'calendar-widget',
    title: 'Calendar',
    description: 'View upcoming events and appointments',
    icon: CalendarIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Calendar',
    contentHeight: 'scrollable',
  },

  // Financial Widgets
  {
    id: 'financial-overview',
    type: 'financial-overview',
    title: 'Financial Overview',
    description: 'Track revenue, expenses, and profit',
    icon: CurrencyDollarIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.LARGE,
    configurable: true,
    category: 'Finance',
    contentHeight: 'auto',
  },

  // Notification Widgets
  {
    id: 'notifications-widget',
    type: 'notifications-widget',
    title: 'Notifications',
    description: 'System notifications and alerts',
    icon: BellIcon,
    defaultSize: WIDGET_SIZES.MEDIUM,
    minSize: WIDGET_SIZES.SMALL,
    maxSize: WIDGET_SIZES.TALL,
    configurable: true,
    category: 'Notifications',
    contentHeight: 'scrollable',
  },
];

export const getWidgetByType = (type: string): WidgetConfig | undefined => {
  return availableWidgets.find(widget => widget.type === type);
};

export const getWidgetsByCategory = (category: string): WidgetConfig[] => {
  return availableWidgets.filter(widget => widget.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(availableWidgets.map(widget => widget.category))];
};
