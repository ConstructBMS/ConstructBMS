const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5174/api';

export interface ProjectStatusData {
  label: string;
  value: number;
  color: string;
  gradient: string;
}

export interface RevenueTrendData {
  month: string;
  revenue: number;
}

export interface ExpenseBreakdownData {
  label: string;
  value: number;
  color: string;
  gradient: string;
  icon: string;
}

export interface CashFlowData {
  month: string;
  inflow: number;
  outflow: number;
}

export interface BusinessOverviewData {
  activeProjects: number;
  totalContacts: number;
  pendingTasks: number;
  monthlyRevenue: number;
}

class AnalyticsService {
  private async fetchWithAuth<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      // If unauthorized, try without auth (for demo purposes)
      if (response.status === 401 && token) {
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }

      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  }

  async getProjectStatusDistribution(): Promise<ProjectStatusData[]> {
    return this.fetchWithAuth<ProjectStatusData[]>('/analytics/project-status');
  }

  async getRevenueTrend(): Promise<RevenueTrendData[]> {
    return this.fetchWithAuth<RevenueTrendData[]>('/analytics/revenue-trend');
  }

  async getExpenseBreakdown(): Promise<ExpenseBreakdownData[]> {
    return this.fetchWithAuth<ExpenseBreakdownData[]>(
      '/analytics/expense-breakdown'
    );
  }

  async getCashFlowProjection(): Promise<CashFlowData[]> {
    return this.fetchWithAuth<CashFlowData[]>('/analytics/cash-flow');
  }

  async getBusinessOverview(): Promise<BusinessOverviewData> {
    return this.fetchWithAuth<BusinessOverviewData>(
      '/analytics/business-overview'
    );
  }
}

export const analyticsService = new AnalyticsService();
