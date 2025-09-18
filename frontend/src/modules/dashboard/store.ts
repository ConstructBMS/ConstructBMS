import { create } from 'zustand';

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'table' | 'chart' | 'list' | 'custom';
  title: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardStore {
  dashboards: Dashboard[];
  activeDashboardId: string;
  setActiveDashboard: (id: string) => void;
  addDashboard: (
    dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
  deleteDashboard: (id: string) => void;
  addWidget: (dashboardId: string, widget: Omit<DashboardWidget, 'id'>) => void;
  updateWidget: (
    dashboardId: string,
    widgetId: string,
    updates: Partial<DashboardWidget>
  ) => void;
  deleteWidget: (dashboardId: string, widgetId: string) => void;
}

const createDefaultDashboard = (): Dashboard => ({
  id: 'default-dashboard',
  name: 'Home',
  description: 'Main dashboard with comprehensive overview widgets',
  isDefault: false,
  widgets: [
    {
      id: 'welcome-widget',
      type: 'custom',
      title: 'Welcome to ConstructBMS',
      data: {
        message:
          'Welcome to your construction business management system. Monitor your projects, track progress, and manage your business efficiently.',
        actions: [
          { label: 'View Projects', action: 'navigate', target: '/projects' },
          { label: 'Manage Contacts', action: 'navigate', target: '/contacts' },
          {
            label: 'Create Estimate',
            action: 'navigate',
            target: '/estimates',
          },
          { label: 'View Reports', action: 'navigate', target: '/reports' },
        ],
        gradient: 'from-blue-600 to-purple-600',
        icon: '🏗️',
      },
    },
    {
      id: 'business-overview',
      type: 'stats',
      title: 'Business Overview',
      data: {
        stats: [
          {
            label: 'Active Projects',
            value: '12',
            change: '+2',
            trend: 'up',
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
            icon: '🏗️',
          },
          {
            label: 'Total Contacts',
            value: '156',
            change: '+8',
            trend: 'up',
            color: 'bg-gradient-to-r from-green-500 to-green-600',
            icon: '👥',
          },
          {
            label: 'Pending Tasks',
            value: '23',
            change: '-5',
            trend: 'down',
            color: 'bg-gradient-to-r from-orange-500 to-orange-600',
            icon: '📋',
          },
          {
            label: 'This Month Revenue',
            value: '£45,230',
            change: '+12%',
            trend: 'up',
            color: 'bg-gradient-to-r from-purple-500 to-purple-600',
            icon: '💰',
          },
        ],
      },
    },
    {
      id: 'project-status',
      type: 'chart',
      title: 'Project Status Distribution',
      data: {
        type: 'pie',
        data: [
          {
            label: 'Planning',
            value: 3,
            color: '#3b82f6',
            gradient: 'from-blue-400 to-blue-600',
          },
          {
            label: 'In Progress',
            value: 7,
            color: '#f59e0b',
            gradient: 'from-yellow-400 to-orange-500',
          },
          {
            label: 'Review',
            value: 2,
            color: '#8b5cf6',
            gradient: 'from-purple-400 to-purple-600',
          },
          {
            label: 'Completed',
            value: 8,
            color: '#10b981',
            gradient: 'from-green-400 to-green-600',
          },
        ],
      },
    },
    {
      id: 'performance-metrics',
      type: 'chart',
      title: 'Performance Metrics',
      data: {
        type: 'bar',
        data: [
          { metric: 'Jan', efficiency: 85, quality: 92, delivery: 78 },
          { metric: 'Feb', efficiency: 88, quality: 94, delivery: 82 },
          { metric: 'Mar', efficiency: 91, quality: 96, delivery: 85 },
          { metric: 'Apr', efficiency: 89, quality: 93, delivery: 88 },
          { metric: 'May', efficiency: 93, quality: 97, delivery: 91 },
          { metric: 'Jun', efficiency: 95, quality: 98, delivery: 94 },
        ],
        efficiencyColor: '#3b82f6',
        qualityColor: '#10b981',
        deliveryColor: '#f59e0b',
        efficiencyGradient: 'from-blue-400 to-blue-600',
        qualityGradient: 'from-green-400 to-green-600',
        deliveryGradient: 'from-yellow-400 to-orange-500',
      },
    },
    {
      id: 'growth-analytics',
      type: 'chart',
      title: 'Growth Analytics',
      data: {
        type: 'line',
        data: [
          { month: 'Jan', revenue: 32000, projects: 3, clients: 8 },
          { month: 'Feb', revenue: 35000, projects: 4, clients: 12 },
          { month: 'Mar', revenue: 42000, projects: 5, clients: 15 },
          { month: 'Apr', revenue: 38000, projects: 4, clients: 18 },
          { month: 'May', revenue: 45000, projects: 6, clients: 22 },
          { month: 'Jun', revenue: 52000, projects: 7, clients: 28 },
        ],
        revenueColor: '#10b981',
        projectsColor: '#3b82f6',
        clientsColor: '#8b5cf6',
        revenueGradient: 'from-green-400 to-green-600',
        projectsGradient: 'from-blue-400 to-blue-600',
        clientsGradient: 'from-purple-400 to-purple-600',
      },
    },
    {
      id: 'recent-activities',
      type: 'list',
      title: 'Recent Activities',
      data: {
        items: [
          {
            label: 'New project "Office Building" created',
            time: '2 hours ago',
            type: 'project',
            icon: '🏢',
            color: 'bg-blue-100 text-blue-800',
          },
          {
            label: 'Contact "ABC Construction" added',
            time: '4 hours ago',
            type: 'contact',
            icon: '👤',
            color: 'bg-green-100 text-green-800',
          },
          {
            label: 'Task "Site Survey" completed',
            time: '6 hours ago',
            type: 'task',
            icon: '✅',
            color: 'bg-emerald-100 text-emerald-800',
          },
          {
            label: 'Invoice #INV-2024-001 sent',
            time: '1 day ago',
            type: 'invoice',
            icon: '📄',
            color: 'bg-purple-100 text-purple-800',
          },
          {
            label: 'Estimate for "Warehouse Project" approved',
            time: '2 days ago',
            type: 'estimate',
            icon: '📊',
            color: 'bg-yellow-100 text-yellow-800',
          },
        ],
      },
    },
    {
      id: 'upcoming-deadlines',
      type: 'table',
      title: 'Upcoming Deadlines',
      data: {
        columns: ['Project', 'Task', 'Due Date', 'Status'],
        rows: [
          ['Office Building', 'Foundation Inspection', '2024-01-20', 'Pending'],
          [
            'Warehouse Project',
            'Material Delivery',
            '2024-01-22',
            'In Progress',
          ],
          ['Retail Space', 'Final Walkthrough', '2024-01-25', 'Scheduled'],
          ['Apartment Complex', 'Permit Submission', '2024-01-28', 'Draft'],
        ],
        statusColors: {
          Pending: 'bg-yellow-100 text-yellow-800',
          'In Progress': 'bg-blue-100 text-blue-800',
          Scheduled: 'bg-green-100 text-green-800',
          Draft: 'bg-gray-100 text-gray-800',
        },
      },
    },
    {
      id: 'quick-actions',
      type: 'custom',
      title: 'Quick Actions',
      data: {
        message: 'Frequently used actions',
        actions: [
          {
            label: 'New Project',
            action: 'navigate',
            target: '/projects/new',
            icon: '🏗️',
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
          },
          {
            label: 'Add Contact',
            action: 'navigate',
            target: '/contacts/new',
            icon: '👥',
            color: 'bg-gradient-to-r from-green-500 to-green-600',
          },
          {
            label: 'Create Estimate',
            action: 'navigate',
            target: '/estimates/new',
            icon: '📊',
            color: 'bg-gradient-to-r from-purple-500 to-purple-600',
          },
          {
            label: 'Generate Report',
            action: 'navigate',
            target: '/reports',
            icon: '📈',
            color: 'bg-gradient-to-r from-orange-500 to-orange-600',
          },
          {
            label: 'Schedule Meeting',
            action: 'navigate',
            target: '/calendar',
            icon: '📅',
            color: 'bg-gradient-to-r from-pink-500 to-pink-600',
          },
          {
            label: 'Upload Document',
            action: 'navigate',
            target: '/documents',
            icon: '📄',
            color: 'bg-gradient-to-r from-teal-500 to-teal-600',
          },
        ],
      },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createFinancialDashboard = (): Dashboard => ({
  id: 'financial-dashboard',
  name: 'Financial',
  description: 'Comprehensive financial overview and metrics',
  widgets: [
    {
      id: 'financial-overview',
      type: 'stats',
      title: 'Financial Overview',
      data: {
        stats: [
          {
            label: 'Total Revenue',
            value: '£245,230',
            change: '+12%',
            trend: 'up',
            color: 'bg-gradient-to-r from-green-500 to-green-600',
            icon: '💰',
          },
          {
            label: 'Total Expenses',
            value: '£189,450',
            change: '+8%',
            trend: 'up',
            color: 'bg-gradient-to-r from-red-500 to-red-600',
            icon: '💸',
          },
          {
            label: 'Net Profit',
            value: '£55,780',
            change: '+18%',
            trend: 'up',
            color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
            icon: '📈',
          },
          {
            label: 'Profit Margin',
            value: '22.7%',
            change: '+2.1%',
            trend: 'up',
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
            icon: '📊',
          },
        ],
      },
    },
    {
      id: 'revenue-chart',
      type: 'chart',
      title: 'Revenue Trend (6 Months)',
      data: {
        type: 'line',
        data: [
          { month: 'Jan', revenue: 32000 },
          { month: 'Feb', revenue: 28000 },
          { month: 'Mar', revenue: 35000 },
          { month: 'Apr', revenue: 42000 },
          { month: 'May', revenue: 38000 },
          { month: 'Jun', revenue: 45000 },
        ],
        gradient: 'from-green-400 to-green-600',
        color: '#10b981',
      },
    },
    {
      id: 'expense-breakdown',
      type: 'chart',
      title: 'Expense Breakdown',
      data: {
        type: 'pie',
        data: [
          {
            label: 'Materials',
            value: 18500,
            color: '#3b82f6',
            gradient: 'from-blue-400 to-blue-600',
            icon: '🧱',
          },
          {
            label: 'Labor',
            value: 12300,
            color: '#f59e0b',
            gradient: 'from-yellow-400 to-orange-500',
            icon: '👷',
          },
          {
            label: 'Equipment',
            value: 4200,
            color: '#8b5cf6',
            gradient: 'from-purple-400 to-purple-600',
            icon: '🔧',
          },
          {
            label: 'Overhead',
            value: 3800,
            color: '#10b981',
            gradient: 'from-green-400 to-green-600',
            icon: '🏢',
          },
          {
            label: 'Subcontractors',
            value: 5600,
            color: '#ef4444',
            gradient: 'from-red-400 to-red-600',
            icon: '🤝',
          },
        ],
      },
    },
    {
      id: 'cash-flow',
      type: 'chart',
      title: 'Cash Flow Projection',
      data: {
        type: 'bar',
        data: [
          { month: 'Jan', inflow: 32000, outflow: 28000 },
          { month: 'Feb', inflow: 28000, outflow: 25000 },
          { month: 'Mar', inflow: 35000, outflow: 30000 },
          { month: 'Apr', inflow: 42000, outflow: 35000 },
          { month: 'May', inflow: 38000, outflow: 32000 },
          { month: 'Jun', inflow: 45000, outflow: 38000 },
        ],
        inflowColor: '#10b981',
        outflowColor: '#ef4444',
        inflowGradient: 'from-green-400 to-green-600',
        outflowGradient: 'from-red-400 to-red-600',
      },
    },
    {
      id: 'outstanding-invoices',
      type: 'table',
      title: 'Outstanding Invoices',
      data: {
        columns: ['Invoice #', 'Client', 'Amount', 'Due Date', 'Status'],
        rows: [
          [
            'INV-2024-001',
            'ABC Construction',
            '£12,500',
            '2024-01-15',
            'Overdue',
          ],
          ['INV-2024-002', 'XYZ Builders', '£8,750', '2024-01-20', 'Pending'],
          [
            'INV-2024-003',
            'Metro Developers',
            '£15,200',
            '2024-01-25',
            'Pending',
          ],
          [
            'INV-2024-004',
            'City Contractors',
            '£6,800',
            '2024-01-30',
            'Pending',
          ],
        ],
        statusColors: {
          Overdue: 'bg-red-100 text-red-800',
          Pending: 'bg-yellow-100 text-yellow-800',
          Paid: 'bg-green-100 text-green-800',
        },
      },
    },
    {
      id: 'project-profitability',
      type: 'table',
      title: 'Project Profitability',
      data: {
        columns: ['Project', 'Budget', 'Actual Cost', 'Profit', 'Margin'],
        rows: [
          ['Office Building', '£150,000', '£142,500', '£7,500', '5.0%'],
          ['Warehouse Project', '£95,000', '£89,200', '£5,800', '6.1%'],
          ['Retail Space', '£75,000', '£78,500', '-£3,500', '-4.7%'],
          ['Apartment Complex', '£200,000', '£185,000', '£15,000', '7.5%'],
        ],
        profitColors: {
          positive: 'bg-green-100 text-green-800',
          negative: 'bg-red-100 text-red-800',
        },
      },
    },
    {
      id: 'financial-actions',
      type: 'custom',
      title: 'Financial Actions',
      data: {
        message: 'Quick financial management actions',
        actions: [
          {
            label: 'Create Invoice',
            action: 'navigate',
            target: '/invoices/new',
            icon: '📄',
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
          },
          {
            label: 'Record Expense',
            action: 'navigate',
            target: '/expenses/new',
            icon: '💸',
            color: 'bg-gradient-to-r from-red-500 to-red-600',
          },
          {
            label: 'Generate Report',
            action: 'navigate',
            target: '/reports/financial',
            icon: '📊',
            color: 'bg-gradient-to-r from-purple-500 to-purple-600',
          },
          {
            label: 'View Budgets',
            action: 'navigate',
            target: '/budgets',
            icon: '💰',
            color: 'bg-gradient-to-r from-green-500 to-green-600',
          },
          {
            label: 'Payment Tracking',
            action: 'navigate',
            target: '/payments',
            icon: '💳',
            color: 'bg-gradient-to-r from-orange-500 to-orange-600',
          },
          {
            label: 'Tax Reports',
            action: 'navigate',
            target: '/reports/tax',
            icon: '📋',
            color: 'bg-gradient-to-r from-teal-500 to-teal-600',
          },
        ],
      },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
      dashboards: [createDefaultDashboard(), createFinancialDashboard()],
      activeDashboardId: 'default-dashboard',

      setActiveDashboard: (id: string) => {
        set({ activeDashboardId: id });
      },

      addDashboard: dashboardData => {
        const newDashboard: Dashboard = {
          ...dashboardData,
          id: `dashboard-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          dashboards: [...state.dashboards, newDashboard],
          activeDashboardId: newDashboard.id,
        }));
      },

      updateDashboard: (id: string, updates: Partial<Dashboard>) => {
        set(state => ({
          dashboards: state.dashboards.map(dashboard =>
            dashboard.id === id
              ? { ...dashboard, ...updates, updatedAt: new Date() }
              : dashboard
          ),
        }));
      },

      deleteDashboard: (id: string) => {
        const state = get();
        const dashboardToDelete = state.dashboards.find(d => d.id === id);

        // Don't allow deleting the default dashboard
        if (dashboardToDelete?.isDefault) {
          return;
        }

        set(state => {
          const newDashboards = state.dashboards.filter(d => d.id !== id);
          const newActiveId =
            state.activeDashboardId === id
              ? newDashboards[0]?.id || 'default-dashboard'
              : state.activeDashboardId;

          return {
            dashboards: newDashboards,
            activeDashboardId: newActiveId,
          };
        });
      },

      addWidget: (dashboardId: string, widgetData) => {
        const newWidget: DashboardWidget = {
          ...widgetData,
          id: `widget-${Date.now()}`,
        };

        set(state => ({
          dashboards: state.dashboards.map(dashboard =>
            dashboard.id === dashboardId
              ? {
                  ...dashboard,
                  widgets: [...dashboard.widgets, newWidget],
                  updatedAt: new Date(),
                }
              : dashboard
          ),
        }));
      },

      updateWidget: (
        dashboardId: string,
        widgetId: string,
        updates: Partial<DashboardWidget>
      ) => {
        set(state => ({
          dashboards: state.dashboards.map(dashboard =>
            dashboard.id === dashboardId
              ? {
                  ...dashboard,
                  widgets: dashboard.widgets.map(widget =>
                    widget.id === widgetId ? { ...widget, ...updates } : widget
                  ),
                  updatedAt: new Date(),
                }
              : dashboard
          ),
        }));
      },

      deleteWidget: (dashboardId: string, widgetId: string) => {
        set(state => ({
          dashboards: state.dashboards.map(dashboard =>
            dashboard.id === dashboardId
              ? {
                  ...dashboard,
                  widgets: dashboard.widgets.filter(
                    widget => widget.id !== widgetId
                  ),
                  updatedAt: new Date(),
                }
              : dashboard
          ),
        }));
      },
    })
);
