import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'table' | 'chart' | 'list' | 'custom';
  title: string;
  data?: any;
  config?: any;
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
  isDefault: true,
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
          { label: 'Create Estimate', action: 'navigate', target: '/estimates' },
          { label: 'View Reports', action: 'navigate', target: '/reports' },
        ],
      },
    },
    {
      id: 'business-overview',
      type: 'stats',
      title: 'Business Overview',
      data: {
        stats: [
          { label: 'Active Projects', value: '12', change: '+2', trend: 'up' },
          { label: 'Total Contacts', value: '156', change: '+8', trend: 'up' },
          { label: 'Pending Tasks', value: '23', change: '-5', trend: 'down' },
          {
            label: 'This Month Revenue',
            value: '$45,230',
            change: '+12%',
            trend: 'up',
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
          { label: 'Planning', value: 3, color: '#3b82f6' },
          { label: 'In Progress', value: 7, color: '#f59e0b' },
          { label: 'Review', value: 2, color: '#8b5cf6' },
          { label: 'Completed', value: 8, color: '#10b981' },
        ],
      },
    },
    {
      id: 'recent-activities',
      type: 'list',
      title: 'Recent Activities',
      data: {
        items: [
          { label: 'New project "Office Building" created', time: '2 hours ago', type: 'project' },
          { label: 'Contact "ABC Construction" added', time: '4 hours ago', type: 'contact' },
          { label: 'Task "Site Survey" completed', time: '6 hours ago', type: 'task' },
          { label: 'Invoice #INV-2024-001 sent', time: '1 day ago', type: 'invoice' },
          { label: 'Estimate for "Warehouse Project" approved', time: '2 days ago', type: 'estimate' },
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
          ['Warehouse Project', 'Material Delivery', '2024-01-22', 'In Progress'],
          ['Retail Space', 'Final Walkthrough', '2024-01-25', 'Scheduled'],
          ['Apartment Complex', 'Permit Submission', '2024-01-28', 'Draft'],
        ],
      },
    },
    {
      id: 'quick-actions',
      type: 'custom',
      title: 'Quick Actions',
      data: {
        message: 'Frequently used actions',
        actions: [
          { label: 'New Project', action: 'navigate', target: '/projects/new' },
          { label: 'Add Contact', action: 'navigate', target: '/contacts/new' },
          { label: 'Create Estimate', action: 'navigate', target: '/estimates/new' },
          { label: 'Generate Report', action: 'navigate', target: '/reports' },
          { label: 'Schedule Meeting', action: 'navigate', target: '/calendar' },
          { label: 'Upload Document', action: 'navigate', target: '/documents' },
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
          { label: 'Total Revenue', value: '$245,230', change: '+12%', trend: 'up' },
          { label: 'Total Expenses', value: '$189,450', change: '+8%', trend: 'up' },
          { label: 'Net Profit', value: '$55,780', change: '+18%', trend: 'up' },
          { label: 'Profit Margin', value: '22.7%', change: '+2.1%', trend: 'up' },
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
      },
    },
    {
      id: 'expense-breakdown',
      type: 'chart',
      title: 'Expense Breakdown',
      data: {
        type: 'pie',
        data: [
          { label: 'Materials', value: 18500, color: '#3b82f6' },
          { label: 'Labor', value: 12300, color: '#f59e0b' },
          { label: 'Equipment', value: 4200, color: '#8b5cf6' },
          { label: 'Overhead', value: 3800, color: '#10b981' },
          { label: 'Subcontractors', value: 5600, color: '#ef4444' },
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
      },
    },
    {
      id: 'outstanding-invoices',
      type: 'table',
      title: 'Outstanding Invoices',
      data: {
        columns: ['Invoice #', 'Client', 'Amount', 'Due Date', 'Status'],
        rows: [
          ['INV-2024-001', 'ABC Construction', '$12,500', '2024-01-15', 'Overdue'],
          ['INV-2024-002', 'XYZ Builders', '$8,750', '2024-01-20', 'Pending'],
          ['INV-2024-003', 'Metro Developers', '$15,200', '2024-01-25', 'Pending'],
          ['INV-2024-004', 'City Contractors', '$6,800', '2024-01-30', 'Pending'],
        ],
      },
    },
    {
      id: 'project-profitability',
      type: 'table',
      title: 'Project Profitability',
      data: {
        columns: ['Project', 'Budget', 'Actual Cost', 'Profit', 'Margin'],
        rows: [
          ['Office Building', '$150,000', '$142,500', '$7,500', '5.0%'],
          ['Warehouse Project', '$95,000', '$89,200', '$5,800', '6.1%'],
          ['Retail Space', '$75,000', '$78,500', '-$3,500', '-4.7%'],
          ['Apartment Complex', '$200,000', '$185,000', '$15,000', '7.5%'],
        ],
      },
    },
    {
      id: 'financial-actions',
      type: 'custom',
      title: 'Financial Actions',
      data: {
        message: 'Quick financial management actions',
        actions: [
          { label: 'Create Invoice', action: 'navigate', target: '/invoices/new' },
          { label: 'Record Expense', action: 'navigate', target: '/expenses/new' },
          { label: 'Generate Report', action: 'navigate', target: '/reports/financial' },
          { label: 'View Budgets', action: 'navigate', target: '/budgets' },
          { label: 'Payment Tracking', action: 'navigate', target: '/payments' },
          { label: 'Tax Reports', action: 'navigate', target: '/reports/tax' },
        ],
      },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'dashboard-store',
      version: 1,
      partialize: state => ({
        dashboards: state.dashboards,
        activeDashboardId: state.activeDashboardId,
      }),
    }
  )
);
