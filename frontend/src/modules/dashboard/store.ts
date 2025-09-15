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
  addDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
  deleteDashboard: (id: string) => void;
  addWidget: (dashboardId: string, widget: Omit<DashboardWidget, 'id'>) => void;
  updateWidget: (dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>) => void;
  deleteWidget: (dashboardId: string, widgetId: string) => void;
}

const createDefaultDashboard = (): Dashboard => ({
  id: 'default-dashboard',
  name: 'Home',
  description: 'Main dashboard with overview widgets',
  isDefault: true,
  widgets: [
    {
      id: 'welcome-widget',
      type: 'custom',
      title: 'Welcome to ConstructBMS',
      data: {
        message: 'Welcome to your construction business management system. Use the tabs above to navigate between different dashboards.',
        actions: [
          { label: 'View Projects', action: 'navigate', target: '/projects' },
          { label: 'Manage Contacts', action: 'navigate', target: '/contacts' },
        ],
      },
    },
    {
      id: 'quick-stats',
      type: 'stats',
      title: 'Quick Overview',
      data: {
        stats: [
          { label: 'Active Projects', value: '12', change: '+2', trend: 'up' },
          { label: 'Total Contacts', value: '156', change: '+8', trend: 'up' },
          { label: 'Pending Tasks', value: '23', change: '-5', trend: 'down' },
          { label: 'This Month Revenue', value: '$45,230', change: '+12%', trend: 'up' },
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
  description: 'Financial overview and metrics',
  widgets: [
    {
      id: 'revenue-chart',
      type: 'chart',
      title: 'Revenue Overview',
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
      type: 'stats',
      title: 'Expense Breakdown',
      data: {
        stats: [
          { label: 'Materials', value: '$18,500', change: '+5%', trend: 'up' },
          { label: 'Labor', value: '$12,300', change: '+2%', trend: 'up' },
          { label: 'Equipment', value: '$4,200', change: '-1%', trend: 'down' },
          { label: 'Overhead', value: '$3,800', change: '+3%', trend: 'up' },
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
      
      addDashboard: (dashboardData) => {
        const newDashboard: Dashboard = {
          ...dashboardData,
          id: `dashboard-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          dashboards: [...state.dashboards, newDashboard],
          activeDashboardId: newDashboard.id,
        }));
      },
      
      updateDashboard: (id: string, updates: Partial<Dashboard>) => {
        set((state) => ({
          dashboards: state.dashboards.map((dashboard) =>
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
        
        set((state) => {
          const newDashboards = state.dashboards.filter(d => d.id !== id);
          const newActiveId = state.activeDashboardId === id 
            ? (newDashboards[0]?.id || 'default-dashboard')
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
        
        set((state) => ({
          dashboards: state.dashboards.map((dashboard) =>
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
      
      updateWidget: (dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>) => {
        set((state) => ({
          dashboards: state.dashboards.map((dashboard) =>
            dashboard.id === dashboardId
              ? {
                  ...dashboard,
                  widgets: dashboard.widgets.map((widget) =>
                    widget.id === widgetId ? { ...widget, ...updates } : widget
                  ),
                  updatedAt: new Date(),
                }
              : dashboard
          ),
        }));
      },
      
      deleteWidget: (dashboardId: string, widgetId: string) => {
        set((state) => ({
          dashboards: state.dashboards.map((dashboard) =>
            dashboard.id === dashboardId
              ? {
                  ...dashboard,
                  widgets: dashboard.widgets.filter((widget) => widget.id !== widgetId),
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
      partialize: (state) => ({
        dashboards: state.dashboards,
        activeDashboardId: state.activeDashboardId,
      }),
    }
  )
);
