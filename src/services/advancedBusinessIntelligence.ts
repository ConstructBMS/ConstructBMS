// Advanced Business Intelligence Service
// Data warehousing, complex analytics, and advanced BI dashboards

export interface DataWarehouse {
  // GB
  dataRetention: number;
  description: string;
  id: string;
  lastUpdated: Date;
  name: string;
  refreshSchedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  size: number; 
  status: 'active' | 'building' | 'maintenance' | 'archived';
  tables: DataTable[];
  type: 'project' | 'financial' | 'operational' | 'customer' | 'comprehensive'; // days
}

export interface DataTable {
  // MB
  columns: DataColumn[];
  description: string;
  id: string;
  indexes: DataIndex[];
  lastUpdated: Date;
  name: string; 
  partitions: DataPartition[];
  rowCount: number;
  schema: string;
  size: number;
}

export interface DataColumn {
  description: string;
  foreignKey?: string;
  name: string;
  nullable: boolean;
  primaryKey: boolean;
  sampleValues: any[];
  type: 'string' | 'number' | 'date' | 'boolean' | 'json' | 'array';
}

export interface DataIndex {
  columns: string[];
  name: string;
  size: number;
  type: 'btree' | 'hash' | 'gin' | 'gist';
  unique: boolean;
}

export interface DataPartition {
  criteria: string;
  lastUpdated: Date;
  name: string;
  rowCount: number;
  size: number;
}

export interface BIDashboard {
  // seconds
  category: 'executive' | 'operational' | 'financial' | 'project' | 'custom';
  createdAt: Date;
  createdBy: string;
  description: string;
  filters: BIFilter[];
  id: string;
  isPublic: boolean;
  lastRefresh: Date; 
  layout: DashboardLayout;
  name: string;
  permissions: string[];
  refreshInterval: number;
  updatedAt: Date;
  widgets: BIWidget[];
}

export interface DashboardLayout {
  cellHeight: number;
  columns: number;
  gap: number;
  padding: number;
  rows: number;
  type: 'grid' | 'flexible' | 'responsive';
}

export interface BIWidget {
  configuration: WidgetConfiguration;
  dataSource: string;
  description: string;
  error?: string;
  id: string;
  lastRefresh: Date;
  position: { height: number, width: number; x: number; y: number; 
};
  query: string;
  refreshInterval: number;
  status: 'loading' | 'ready' | 'error';
  title: string;
  type: 'chart' | 'table' | 'metric' | 'gauge' | 'map' | 'heatmap' | 'funnel' | 'scatter' | 'timeline';
}

export interface WidgetConfiguration {
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  animate?: boolean;
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'radar' | 'polar' | 'bubble';
  colors?: string[];
  format?: string;
  groupBy?: string[];
  limit?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  sortBy?: string;
  threshold?: number;
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
}

export interface BIFilter {
  affects: string[];
  defaultValue?: any;
  field: string;
  id: string;
  name: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in' | 'not_in';
  required: boolean;
  type: 'date' | 'number' | 'string' | 'boolean' | 'list' | 'range';
  value: any; // widget IDs
}

export interface AnalyticsQuery {
  cacheEnabled: boolean;
  cacheExpiry: number;
  description: string;
  executionTime: number;
  id: string;
  lastExecuted: Date;
  name: string;
  parameters: QueryParameter[];
  resultSchema: DataColumn[];
  rowCount: number;
  sql: string; // minutes
}

export interface QueryParameter {
  defaultValue?: any;
  description: string;
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface DataPipeline {
  // cron expression
  dependencies: string[];
  description: string;
  id: string;
  lastRun: Date;
  name: string;
  nextRun: Date; 
  notifications: PipelineNotification[];
  performance: PipelinePerformance;
  schedule: string;
  status: 'active' | 'paused' | 'error' | 'maintenance';
  steps: PipelineStep[];
  type: 'etl' | 'elt' | 'streaming' | 'batch';
}

export interface PipelineStep {
  configuration: Record<string, any>;
  duration?: number;
  endTime?: Date;
  error?: string;
  id: string;
  name: string;
  order: number;
  recordsFailed?: number;
  recordsProcessed?: number;
  startTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  type: 'extract' | 'transform' | 'load' | 'validate' | 'notify';
}

export interface PipelineNotification {
  conditions: 'always' | 'on_success' | 'on_failure' | 'on_warning';
  enabled: boolean;
  recipients: string[];
  template: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
}

export interface PipelinePerformance {
  avgExecutionTime: number;
  lastWeekRuns: number;
  lastWeekSuccessRate: number;
  successRate: number;
  totalRecords: number;
  totalRuns: number;
}

export interface PredictiveModel {
  accuracy: number;
  algorithm: string;
  description: string;
  f1Score: number;
  features: string[];
  id: string;
  lastTrained: Date;
  name: string;
  nextTraining: Date;
  performance: ModelPerformance;
  precision: number;
  predictions: ModelPrediction[];
  recall: number;
  status: 'training' | 'active' | 'inactive' | 'error';
  target: string;
  trainingData: string;
  type: 'regression' | 'classification' | 'clustering' | 'time_series' | 'anomaly';
}

export interface ModelPrediction {
  actual?: any;
  confidence: number;
  error?: number;
  id: string;
  input: Record<string, any>;
  output: any;
  timestamp: Date;
}

export interface ModelPerformance {
  avgConfidence: number;
  avgError: number;
  correctPredictions: number;
  lastWeekAccuracy: number;
  totalPredictions: number;
  trend: 'improving' | 'stable' | 'declining';
}

class AdvancedBusinessIntelligenceService {
  private dataWarehouses: Map<string, DataWarehouse> = new Map();
  private dashboards: Map<string, BIDashboard> = new Map();
  private queries: Map<string, AnalyticsQuery> = new Map();
  private pipelines: Map<string, DataPipeline> = new Map();
  private models: Map<string, PredictiveModel> = new Map();

  // Initialize BI service
  async initialize() {
    await this.createDefaultDataWarehouses();
    await this.createDefaultDashboards();
    await this.createDefaultQueries();
    await this.createDefaultPipelines();
    await this.createDefaultModels();
    
    console.log('Advanced BI Service initialized');
  }

  // Create default data warehouses
  private async createDefaultDataWarehouses() {
    const warehouses: DataWarehouse[] = [
      {
        id: 'dw_projects',
        name: 'Project Data Warehouse',
        description: 'Comprehensive project analytics and reporting data',
        type: 'project',
        status: 'active',
        lastUpdated: new Date(),
        size: 25.5,
        tables: this.generateProjectTables(),
        refreshSchedule: 'daily',
        dataRetention: 1095 // 3 years
      },
      {
        id: 'dw_financials',
        name: 'Financial Data Warehouse',
        description: 'Financial analytics and reporting data',
        type: 'financial',
        status: 'active',
        lastUpdated: new Date(),
        size: 15.2,
        tables: this.generateFinancialTables(),
        refreshSchedule: 'daily',
        dataRetention: 1825 // 5 years
      },
      {
        id: 'dw_operations',
        name: 'Operational Data Warehouse',
        description: 'Operational metrics and performance data',
        type: 'operational',
        status: 'active',
        lastUpdated: new Date(),
        size: 8.7,
        tables: this.generateOperationalTables(),
        refreshSchedule: 'hourly',
        dataRetention: 730 // 2 years
      }
    ];

    for (const warehouse of warehouses) {
      this.dataWarehouses.set(warehouse.id, warehouse);
    }
  }

  // Generate project tables
  private generateProjectTables(): DataTable[] {
    return [
      {
        id: 'projects_fact',
        name: 'projects_fact',
        schema: 'analytics',
        description: 'Project fact table with key metrics',
        rowCount: 1250,
        size: 45.2,
        lastUpdated: new Date(),
        columns: [
          { name: 'project_id', type: 'string', nullable: false, primaryKey: true, description: 'Unique project identifier', sampleValues: ['proj_001', 'proj_002'] },
          { name: 'project_name', type: 'string', nullable: false, primaryKey: false, description: 'Project name', sampleValues: ['Office Building A', 'Residential Complex'] },
          { name: 'start_date', type: 'date', nullable: false, primaryKey: false, description: 'Project start date', sampleValues: ['2024-01-01', '2024-02-15'] },
          { name: 'end_date', type: 'date', nullable: true, primaryKey: false, description: 'Project end date', sampleValues: ['2024-12-31', '2025-06-30'] },
          { name: 'budget', type: 'number', nullable: false, primaryKey: false, description: 'Project budget', sampleValues: [500000, 1200000] },
          { name: 'actual_cost', type: 'number', nullable: true, primaryKey: false, description: 'Actual project cost', sampleValues: [450000, 1100000] },
          { name: 'progress', type: 'number', nullable: false, primaryKey: false, description: 'Project progress percentage', sampleValues: [75, 45] },
          { name: 'status', type: 'string', nullable: false, primaryKey: false, description: 'Project status', sampleValues: ['active', 'completed', 'on-hold'] }
        ],
        indexes: [
          { name: 'idx_projects_status', columns: ['status'], type: 'btree', unique: false, size: 2.1 },
          { name: 'idx_projects_dates', columns: ['start_date', 'end_date'], type: 'btree', unique: false, size: 3.5 }
        ],
        partitions: [
          { name: 'p_2024', criteria: 'start_date >= 2024-01-01 AND start_date < 2025-01-01', rowCount: 850, size: 30.8, lastUpdated: new Date() },
          { name: 'p_2023', criteria: 'start_date >= 2023-01-01 AND start_date < 2024-01-01', rowCount: 400, size: 14.4, lastUpdated: new Date() }
        ]
      },
      {
        id: 'tasks_dim',
        name: 'tasks_dim',
        schema: 'analytics',
        description: 'Task dimension table',
        rowCount: 8500,
        size: 125.6,
        lastUpdated: new Date(),
        columns: [
          { name: 'task_id', type: 'string', nullable: false, primaryKey: true, description: 'Unique task identifier', sampleValues: ['task_001', 'task_002'] },
          { name: 'task_name', type: 'string', nullable: false, primaryKey: false, description: 'Task name', sampleValues: ['Foundation Work', 'Electrical Installation'] },
          { name: 'project_id', type: 'string', nullable: false, primaryKey: false, foreignKey: 'projects_fact.project_id', description: 'Project reference', sampleValues: ['proj_001', 'proj_002'] },
          { name: 'assigned_to', type: 'string', nullable: true, primaryKey: false, description: 'Assigned team member', sampleValues: ['john_doe', 'jane_smith'] },
          { name: 'priority', type: 'string', nullable: false, primaryKey: false, description: 'Task priority', sampleValues: ['high', 'medium', 'low'] },
          { name: 'estimated_hours', type: 'number', nullable: true, primaryKey: false, description: 'Estimated hours', sampleValues: [40, 80, 120] },
          { name: 'actual_hours', type: 'number', nullable: true, primaryKey: false, description: 'Actual hours spent', sampleValues: [35, 85, 110] }
        ],
        indexes: [
          { name: 'idx_tasks_project', columns: ['project_id'], type: 'btree', unique: false, size: 8.2 },
          { name: 'idx_tasks_assigned', columns: ['assigned_to'], type: 'btree', unique: false, size: 6.5 }
        ],
        partitions: []
      }
    ];
  }

  // Generate financial tables
  private generateFinancialTables(): DataTable[] {
    return [
      {
        id: 'financial_fact',
        name: 'financial_fact',
        schema: 'analytics',
        description: 'Financial fact table',
        rowCount: 5000,
        size: 85.3,
        lastUpdated: new Date(),
        columns: [
          { name: 'transaction_id', type: 'string', nullable: false, primaryKey: true, description: 'Unique transaction identifier', sampleValues: ['txn_001', 'txn_002'] },
          { name: 'project_id', type: 'string', nullable: false, primaryKey: false, description: 'Project reference', sampleValues: ['proj_001', 'proj_002'] },
          { name: 'transaction_date', type: 'date', nullable: false, primaryKey: false, description: 'Transaction date', sampleValues: ['2024-01-15', '2024-02-20'] },
          { name: 'amount', type: 'number', nullable: false, primaryKey: false, description: 'Transaction amount', sampleValues: [5000, 15000, -2000] },
          { name: 'type', type: 'string', nullable: false, primaryKey: false, description: 'Transaction type', sampleValues: ['income', 'expense', 'payment'] },
          { name: 'category', type: 'string', nullable: false, primaryKey: false, description: 'Transaction category', sampleValues: ['materials', 'labor', 'equipment'] },
          { name: 'status', type: 'string', nullable: false, primaryKey: false, description: 'Transaction status', sampleValues: ['pending', 'completed', 'cancelled'] }
        ],
        indexes: [
          { name: 'idx_financial_project', columns: ['project_id'], type: 'btree', unique: false, size: 5.8 },
          { name: 'idx_financial_date', columns: ['transaction_date'], type: 'btree', unique: false, size: 7.2 }
        ],
        partitions: []
      }
    ];
  }

  // Generate operational tables
  private generateOperationalTables(): DataTable[] {
    return [
      {
        id: 'operations_fact',
        name: 'operations_fact',
        schema: 'analytics',
        description: 'Operational metrics fact table',
        rowCount: 15000,
        size: 45.8,
        lastUpdated: new Date(),
        columns: [
          { name: 'metric_id', type: 'string', nullable: false, primaryKey: true, description: 'Unique metric identifier', sampleValues: ['metric_001', 'metric_002'] },
          { name: 'project_id', type: 'string', nullable: false, primaryKey: false, description: 'Project reference', sampleValues: ['proj_001', 'proj_002'] },
          { name: 'metric_date', type: 'date', nullable: false, primaryKey: false, description: 'Metric date', sampleValues: ['2024-01-15', '2024-02-20'] },
          { name: 'metric_name', type: 'string', nullable: false, primaryKey: false, description: 'Metric name', sampleValues: ['productivity', 'quality_score', 'safety_incidents'] },
          { name: 'metric_value', type: 'number', nullable: false, primaryKey: false, description: 'Metric value', sampleValues: [85.5, 92.3, 0] },
          { name: 'unit', type: 'string', nullable: true, primaryKey: false, description: 'Metric unit', sampleValues: ['%', 'score', 'count'] }
        ],
        indexes: [
          { name: 'idx_operations_project', columns: ['project_id'], type: 'btree', unique: false, size: 3.2 },
          { name: 'idx_operations_metric', columns: ['metric_name'], type: 'btree', unique: false, size: 2.8 }
        ],
        partitions: []
      }
    ];
  }

  // Create default dashboards
  private async createDefaultDashboards() {
    const dashboards: BIDashboard[] = [
      {
        id: 'executive_dashboard',
        name: 'Executive Dashboard',
        description: 'High-level overview for executives',
        category: 'executive',
        layout: { type: 'grid', columns: 4, rows: 3, cellHeight: 200, gap: 10, padding: 20 },
        widgets: this.generateExecutiveWidgets(),
        filters: [
          {
            id: 'date_range',
            name: 'Date Range',
            type: 'date',
            field: 'transaction_date',
            operator: 'between',
            value: { start: '2024-01-01', end: '2024-12-31' },
            defaultValue: { start: '2024-01-01', end: '2024-12-31' },
            required: true,
            affects: ['widget_1', 'widget_2', 'widget_3']
          }
        ],
        refreshInterval: 300,
        lastRefresh: new Date(),
        permissions: ['executive', 'admin'],
        isPublic: false,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'project_analytics',
        name: 'Project Analytics',
        description: 'Detailed project performance analytics',
        category: 'project',
        layout: { type: 'grid', columns: 3, rows: 4, cellHeight: 250, gap: 15, padding: 20 },
        widgets: this.generateProjectWidgets(),
        filters: [
          {
            id: 'project_filter',
            name: 'Project',
            type: 'list',
            field: 'project_id',
            operator: 'in',
            value: [],
            defaultValue: [],
            required: false,
            affects: ['widget_4', 'widget_5', 'widget_6']
          }
        ],
        refreshInterval: 600,
        lastRefresh: new Date(),
        permissions: ['project_manager', 'admin'],
        isPublic: false,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const dashboard of dashboards) {
      this.dashboards.set(dashboard.id, dashboard);
    }
  }

  // Generate executive dashboard widgets
  private generateExecutiveWidgets(): BIWidget[] {
    return [
      {
        id: 'widget_1',
        type: 'metric',
        title: 'Total Revenue',
        description: 'Total revenue for selected period',
        position: { x: 0, y: 0, width: 1, height: 1 },
        dataSource: 'dw_financials',
        query: 'SELECT SUM(amount) as total_revenue FROM financial_fact WHERE type = "income" AND transaction_date BETWEEN :start_date AND :end_date',
        configuration: {
          format: 'currency',
          aggregation: 'sum',
          threshold: 1000000
        },
        refreshInterval: 300,
        lastRefresh: new Date(),
        status: 'ready'
      },
      {
        id: 'widget_2',
        type: 'chart',
        title: 'Revenue Trend',
        description: 'Revenue trend over time',
        position: { x: 1, y: 0, width: 2, height: 1 },
        dataSource: 'dw_financials',
        query: 'SELECT transaction_date, SUM(amount) as daily_revenue FROM financial_fact WHERE type = "income" GROUP BY transaction_date ORDER BY transaction_date',
        configuration: {
          chartType: 'line',
          colors: ['#3b82f6'],
          showLegend: false,
          showGrid: true,
          animate: true
        },
        refreshInterval: 300,
        lastRefresh: new Date(),
        status: 'ready'
      },
      {
        id: 'widget_3',
        type: 'chart',
        title: 'Project Status Distribution',
        description: 'Distribution of projects by status',
        position: { x: 3, y: 0, width: 1, height: 1 },
        dataSource: 'dw_projects',
        query: 'SELECT status, COUNT(*) as count FROM projects_fact GROUP BY status',
        configuration: {
          chartType: 'pie',
          colors: ['#10b981', '#f59e0b', '#ef4444'],
          showLegend: true,
          showLabels: true
        },
        refreshInterval: 300,
        lastRefresh: new Date(),
        status: 'ready'
      }
    ];
  }

  // Generate project analytics widgets
  private generateProjectWidgets(): BIWidget[] {
    return [
      {
        id: 'widget_4',
        type: 'table',
        title: 'Project Performance',
        description: 'Detailed project performance metrics',
        position: { x: 0, y: 0, width: 3, height: 2 },
        dataSource: 'dw_projects',
        query: 'SELECT project_name, budget, actual_cost, progress, status FROM projects_fact ORDER BY progress DESC',
        configuration: {
          limit: 10,
          sortBy: 'progress'
        },
        refreshInterval: 600,
        lastRefresh: new Date(),
        status: 'ready'
      },
      {
        id: 'widget_5',
        type: 'chart',
        title: 'Task Completion Trend',
        description: 'Task completion trend over time',
        position: { x: 0, y: 2, width: 2, height: 1 },
        dataSource: 'dw_projects',
        query: 'SELECT DATE(created_at) as date, COUNT(*) as completed_tasks FROM tasks_dim WHERE status = "completed" GROUP BY DATE(created_at) ORDER BY date',
        configuration: {
          chartType: 'bar',
          colors: ['#8b5cf6'],
          showLegend: false,
          showGrid: true
        },
        refreshInterval: 600,
        lastRefresh: new Date(),
        status: 'ready'
      },
      {
        id: 'widget_6',
        type: 'gauge',
        title: 'Overall Project Progress',
        description: 'Average project progress across all projects',
        position: { x: 2, y: 2, width: 1, height: 1 },
        dataSource: 'dw_projects',
        query: 'SELECT AVG(progress) as avg_progress FROM projects_fact WHERE status = "active"',
        configuration: {
          threshold: 75,
          format: 'percentage'
        },
        refreshInterval: 600,
        lastRefresh: new Date(),
        status: 'ready'
      }
    ];
  }

  // Create default queries
  private async createDefaultQueries() {
    const queries: AnalyticsQuery[] = [
      {
        id: 'q_revenue_analysis',
        name: 'Revenue Analysis',
        description: 'Comprehensive revenue analysis with trends and projections',
        sql: `
          WITH revenue_trends AS (
            SELECT 
              DATE_TRUNC('month', transaction_date) as month,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
              SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses,
              COUNT(*) as transaction_count
            FROM financial_fact 
            WHERE transaction_date BETWEEN :start_date AND :end_date
            GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY month
          )
          SELECT 
            month,
            revenue,
            expenses,
            revenue - expenses as profit,
            transaction_count,
            LAG(revenue) OVER (ORDER BY month) as prev_month_revenue,
            ((revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month)) * 100 as growth_rate
          FROM revenue_trends
        `,
        parameters: [
          { name: 'start_date', type: 'date', defaultValue: '2024-01-01', required: true, description: 'Start date for analysis' },
          { name: 'end_date', type: 'date', defaultValue: '2024-12-31', required: true, description: 'End date for analysis' }
        ],
        resultSchema: [],
        executionTime: 2.5,
        rowCount: 12,
        lastExecuted: new Date(),
        cacheEnabled: true,
        cacheExpiry: 60
      }
    ];

    for (const query of queries) {
      this.queries.set(query.id, query);
    }
  }

  // Create default pipelines
  private async createDefaultPipelines() {
    const pipelines: DataPipeline[] = [
      {
        id: 'pipeline_daily_refresh',
        name: 'Daily Data Refresh',
        description: 'Daily refresh of all data warehouses',
        type: 'etl',
        status: 'active',
        schedule: '0 2 * * *', // 2 AM daily
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
        steps: [
          {
            id: 'step_1',
            name: 'Extract Project Data',
            type: 'extract',
            order: 1,
            configuration: { source: 'projects', incremental: true },
            status: 'completed',
            startTime: new Date(),
            endTime: new Date(Date.now() + 5 * 60 * 1000),
            duration: 300,
            recordsProcessed: 1250,
            recordsFailed: 0
          },
          {
            id: 'step_2',
            name: 'Transform Project Data',
            type: 'transform',
            order: 2,
            configuration: { transformations: ['clean', 'enrich', 'aggregate'] },
            status: 'completed',
            startTime: new Date(Date.now() + 5 * 60 * 1000),
            endTime: new Date(Date.now() + 8 * 60 * 1000),
            duration: 180,
            recordsProcessed: 1250,
            recordsFailed: 0
          },
          {
            id: 'step_3',
            name: 'Load to Data Warehouse',
            type: 'load',
            order: 3,
            configuration: { target: 'dw_projects', mode: 'upsert' },
            status: 'completed',
            startTime: new Date(Date.now() + 8 * 60 * 1000),
            endTime: new Date(Date.now() + 10 * 60 * 1000),
            duration: 120,
            recordsProcessed: 1250,
            recordsFailed: 0
          }
        ],
        dependencies: [],
        notifications: [
          {
            type: 'email',
            recipients: ['admin@constructbms.com'],
            conditions: 'on_failure',
            template: 'Pipeline {{pipeline_name}} failed at {{timestamp}}',
            enabled: true
          }
        ],
        performance: {
          avgExecutionTime: 600,
          successRate: 98.5,
          totalRuns: 365,
          totalRecords: 456250,
          lastWeekRuns: 7,
          lastWeekSuccessRate: 100
        }
      }
    ];

    for (const pipeline of pipelines) {
      this.pipelines.set(pipeline.id, pipeline);
    }
  }

  // Create default predictive models
  private async createDefaultModels() {
    const models: PredictiveModel[] = [
      {
        id: 'model_project_completion',
        name: 'Project Completion Predictor',
        description: 'Predicts project completion dates based on historical data',
        type: 'regression',
        algorithm: 'Random Forest',
        status: 'active',
        accuracy: 87.5,
        precision: 85.2,
        recall: 89.1,
        f1Score: 87.1,
        trainingData: 'projects_fact',
        features: ['budget', 'team_size', 'complexity_score', 'weather_factor'],
        target: 'completion_date',
        lastTrained: new Date(),
        nextTraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        predictions: [],
        performance: {
          totalPredictions: 150,
          correctPredictions: 131,
          avgConfidence: 82.3,
          avgError: 3.2,
          lastWeekAccuracy: 89.5,
          trend: 'improving'
        }
      }
    ];

    for (const model of models) {
      this.models.set(model.id, model);
    }
  }

  // Execute analytics query
  async executeQuery(queryId: string, parameters: Record<string, any> = {}): Promise<any[]> {
    const query = this.queries.get(queryId);
    if (!query) {
      throw new Error(`Query ${queryId} not found`);
    }

    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, query.executionTime * 1000));

    // Return sample data based on query type
    if (queryId === 'q_revenue_analysis') {
      return this.generateRevenueAnalysisData(parameters);
    }

    return [];
  }

  // Generate sample revenue analysis data
  private generateRevenueAnalysisData(parameters: Record<string, any>): any[] {
    const months = [];
    const startDate = new Date(parameters.start_date || '2024-01-01');
    const endDate = new Date(parameters.end_date || '2024-12-31');
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const revenue = 500000 + Math.random() * 300000;
      const expenses = 300000 + Math.random() * 200000;
      const profit = revenue - expenses;
      const transactionCount = 50 + Math.floor(Math.random() * 100);
      
      months.push({
        month: month.toISOString().split('T')[0],
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(profit),
        transaction_count: transactionCount,
        prev_month_revenue: months.length > 0 ? months[months.length - 1].revenue : null,
        growth_rate: months.length > 0 ? ((revenue - months[months.length - 1].revenue) / months[months.length - 1].revenue * 100) : null
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  }

  // Get data warehouses
  getDataWarehouses(): DataWarehouse[] {
    return Array.from(this.dataWarehouses.values());
  }

  // Get dashboards
  getDashboards(): BIDashboard[] {
    return Array.from(this.dashboards.values());
  }

  // Get dashboard by ID
  getDashboard(dashboardId: string): BIDashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  // Get queries
  getQueries(): AnalyticsQuery[] {
    return Array.from(this.queries.values());
  }

  // Get pipelines
  getPipelines(): DataPipeline[] {
    return Array.from(this.pipelines.values());
  }

  // Get predictive models
  getModels(): PredictiveModel[] {
    return Array.from(this.models.values());
  }

  // Create custom dashboard
  createDashboard(dashboard: Omit<BIDashboard, 'id' | 'createdAt' | 'updatedAt'>): BIDashboard {
    const newDashboard: BIDashboard = {
      ...dashboard,
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.dashboards.set(newDashboard.id, newDashboard);
    return newDashboard;
  }

  // Update dashboard
  updateDashboard(dashboardId: string, updates: Partial<BIDashboard>): BIDashboard | undefined {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      Object.assign(dashboard, updates, { updatedAt: new Date() });
      return dashboard;
    }
    return undefined;
  }

  // Delete dashboard
  deleteDashboard(dashboardId: string): boolean {
    return this.dashboards.delete(dashboardId);
  }
}

// Create singleton instance
let advancedBIInstance: AdvancedBusinessIntelligenceService | null = null;

function getAdvancedBIInstance(): AdvancedBusinessIntelligenceService {
  if (!advancedBIInstance) {
    advancedBIInstance = new AdvancedBusinessIntelligenceService();
  }
  return advancedBIInstance;
}

// Export functions that use the singleton
export const advancedBIService = {
  initialize: () => getAdvancedBIInstance().initialize(),
  executeQuery: (queryId: string, parameters?: Record<string, any>) => 
    getAdvancedBIInstance().executeQuery(queryId, parameters),
  getDataWarehouses: () => getAdvancedBIInstance().getDataWarehouses(),
  getDashboards: () => getAdvancedBIInstance().getDashboards(),
  getDashboard: (dashboardId: string) => getAdvancedBIInstance().getDashboard(dashboardId),
  getQueries: () => getAdvancedBIInstance().getQueries(),
  getPipelines: () => getAdvancedBIInstance().getPipelines(),
  getModels: () => getAdvancedBIInstance().getModels(),
  createDashboard: (dashboard: Omit<BIDashboard, 'id' | 'createdAt' | 'updatedAt'>) => 
    getAdvancedBIInstance().createDashboard(dashboard),
  updateDashboard: (dashboardId: string, updates: Partial<BIDashboard>) => 
    getAdvancedBIInstance().updateDashboard(dashboardId, updates),
  deleteDashboard: (dashboardId: string) => getAdvancedBIInstance().deleteDashboard(dashboardId)
}; 
