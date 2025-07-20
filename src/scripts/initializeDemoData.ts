// Comprehensive Demo Data Initialization Script
// Generates extensive test data for all Napwood features

import { demoDataService } from '../services/demoDataService';
import { astaIntegrationService } from '../services/astaIntegration';
import { advancedAnalyticsService } from '../services/advancedAnalytics';
import { mobileIntegrationService } from '../services/mobileIntegration';
import { aiAutomationService } from '../services/aiAutomation';
import { bimIntegrationService } from '../services/bimIntegration';
import { advancedBIService } from '../services/advancedBusinessIntelligence';

export async function initializeComprehensiveDemoData() {
  console.log('🚀 Initializing comprehensive demo data for Napwood...');

  try {
    // Initialize all services
    await initializeAllServices();

    // Generate comprehensive demo data
    const demoDataConfig = {
      projects: 15,
      tasksPerProject: 25,
      users: 50,
      customers: 30,
      contractors: 20,
      documents: 100,
      emails: 200,
      financialRecords: 500,
      timeEntries: 1000,
      includeAdvancedFeatures: true
    };

    console.log('📊 Generating demo data with config:', demoDataConfig);

    // Generate main demo data
    const summary = await demoDataService.generateDemoData(demoDataConfig);
    console.log('✅ Demo data generated:', summary);

    // Generate advanced features data
    await generateAdvancedFeaturesData();

    // Generate BIM models for projects
    await generateBIMModels();

    // Generate advanced analytics data
    await generateAdvancedAnalyticsData();

    // Generate mobile field data
    await generateMobileFieldData();

    // Generate AI automation data
    await generateAIAutomationData();

    // Generate business intelligence data
    await generateBusinessIntelligenceData();

    console.log('🎉 Comprehensive demo data initialization completed successfully!');
    console.log('📈 Generated data summary:');
    console.log('- Projects:', summary.projects);
    console.log('- Users:', summary.users);
    console.log('- Tasks:', summary.totalTasks);
    console.log('- Documents:', summary.documents);
    console.log('- Financial Records:', summary.financialRecords);
    console.log('- Time Entries:', summary.timeEntries);

    return summary;
  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
    throw error;
  }
}

async function initializeAllServices() {
  console.log('🔧 Initializing all services...');

  // Initialize Asta Powerproject integration
  await astaIntegrationService.initialize({
    enabled: true,
    autoSync: true,
    syncInterval: 15,
    bidirectional: true,
    conflictResolution: 'timestamp'
  });

  // Initialize advanced analytics
  await advancedAnalyticsService.initialize();

  // Initialize mobile integration
  await mobileIntegrationService.initialize();

  // Initialize AI automation
  await aiAutomationService.initialize();

  // Initialize BIM integration
  await bimIntegrationService.initialize({
    enabled: true,
    autoSync: true,
    syncInterval: 30,
    syncDirection: 'bidirectional',
    conflictResolution: 'timestamp'
  });

  // Initialize advanced business intelligence
  await advancedBIService.initialize();

  console.log('✅ All services initialized successfully');
}

async function generateAdvancedFeaturesData() {
  console.log('🚀 Generating advanced features data...');

  // Generate sample BIM models for projects
  const projects = await demoDataService.getAllDemoData();
  
  for (const project of projects.projects.slice(0, 5)) {
    // Create sample BIM file
    const bimFile = new File(['Sample BIM content'], `project_${project.id}_model.ifc`, {
      type: 'application/octet-stream'
    });

    try {
      await bimIntegrationService.uploadModel(bimFile, project.id);
      console.log(`✅ BIM model uploaded for project ${project.name}`);
    } catch (error) {
      console.log(`⚠️ Could not upload BIM model for project ${project.name}:`, error);
    }
  }

  // Generate mobile field data
  const fieldTasks = [];
  for (let i = 0; i < 50; i++) {
    fieldTasks.push({
      id: `field_task_${i}`,
      taskId: `task_${Math.floor(Math.random() * 100)}`,
      taskName: `Field Task ${i + 1}`,
      status: ['pending', 'in-progress', 'completed', 'blocked'][Math.floor(Math.random() * 4)],
      assignedTo: `user_${Math.floor(Math.random() * 50) + 1}`,
      location: {
        latitude: 51.5074 + (Math.random() - 0.5) * 0.1,
        longitude: -0.1278 + (Math.random() - 0.5) * 0.1,
        address: `Site ${i + 1}, London`
      },
      photos: [],
      notes: [],
      timeEntries: [],
      safetyChecks: [],
      qualityChecks: [],
      materials: [],
      equipment: [],
      lastSync: new Date()
    });
  }

  console.log(`✅ Generated ${fieldTasks.length} field tasks`);
}

async function generateBIMModels() {
  console.log('🏗️ Generating BIM models...');

  const projects = await demoDataService.getAllDemoData();
  
  for (const project of projects.projects.slice(0, 8)) {
    // Create different types of BIM files
    const fileTypes = ['ifc', 'rvt', 'skp', 'dwg'];
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    
    const bimFile = new File([`Sample ${fileType.toUpperCase()} content for ${project.name}`], 
      `project_${project.id}_model.${fileType}`, {
      type: 'application/octet-stream'
    });

    try {
      const model = await bimIntegrationService.uploadModel(bimFile, project.id);
      console.log(`✅ BIM model (${fileType.toUpperCase()}) created for project ${project.name}`);
      
      // Add some clashes to the model
      if (model.clashes.length === 0) {
        const clashTypes = ['hard', 'soft', 'workflow'];
        const severities = ['low', 'medium', 'high', 'critical'];
        
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
          await bimIntegrationService.addClash(model.id, {
            name: `Clash ${i + 1}`,
            type: clashTypes[Math.floor(Math.random() * clashTypes.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: 'open',
            elements: [`element_${i}`],
            description: `Sample clash description ${i + 1}`,
            location: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 50 },
            assignedTo: `user_${Math.floor(Math.random() * 50) + 1}`,
            dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
            resolution: '',
            cost: Math.random() * 10000
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not create BIM model for project ${project.name}:`, error);
    }
  }
}

async function generateAdvancedAnalyticsData() {
  console.log('📈 Generating advanced analytics data...');

  const projects = await demoDataService.getAllDemoData();
  
  for (const project of projects.projects.slice(0, 10)) {
    try {
      // Generate EVM data
      const evmData = advancedAnalyticsService.calculateEVM(project.tasks || []);
      
      // Generate KPI metrics
      const kpiMetrics = advancedAnalyticsService.calculateKPIs(project, project.tasks || []);
      
      // Generate predictions
      const predictions = await advancedAnalyticsService.generatePredictions(project, project.tasks || []);
      
      console.log(`✅ Analytics data generated for project ${project.name}`);
      console.log(`   - EVM data points: ${evmData.length}`);
      console.log(`   - KPI metrics: ${Object.keys(kpiMetrics).length}`);
      console.log(`   - Predictions: ${predictions.length}`);
    } catch (error) {
      console.log(`⚠️ Could not generate analytics for project ${project.name}:`, error);
    }
  }
}

async function generateMobileFieldData() {
  console.log('📱 Generating mobile field data...');

  // Generate offline queue items
  const offlineItems = [];
  for (let i = 0; i < 25; i++) {
    offlineItems.push({
      id: `offline_${i}`,
      type: ['task_update', 'photo_upload', 'time_entry', 'safety_check'][Math.floor(Math.random() * 4)],
      data: {
        taskId: `task_${Math.floor(Math.random() * 100)}`,
        userId: `user_${Math.floor(Math.random() * 50) + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        content: `Offline data item ${i + 1}`
      },
      status: 'pending',
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
    });
  }

  console.log(`✅ Generated ${offlineItems.length} offline queue items`);

  // Generate GPS tracking data
  const gpsData = [];
  for (let i = 0; i < 100; i++) {
    gpsData.push({
      id: `gps_${i}`,
      userId: `user_${Math.floor(Math.random() * 50) + 1}`,
      location: {
        latitude: 51.5074 + (Math.random() - 0.5) * 0.1,
        longitude: -0.1278 + (Math.random() - 0.5) * 0.1,
        accuracy: Math.random() * 10
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      projectId: `project_${Math.floor(Math.random() * 15) + 1}`
    });
  }

  console.log(`✅ Generated ${gpsData.length} GPS tracking points`);
}

async function generateAIAutomationData() {
  console.log('🤖 Generating AI automation data...');

  const projects = await demoDataService.getAllDemoData();
  
  for (const project of projects.projects.slice(0, 8)) {
    try {
      // Generate AI recommendations
      const recommendations = await aiAutomationService.generateRecommendations(
        project, 
        project.tasks || [], 
        []
      );
      
      // Generate predictive models
      const predictions = await aiAutomationService.generatePredictions(project, project.tasks || []);
      
      console.log(`✅ AI data generated for project ${project.name}`);
      console.log(`   - Recommendations: ${recommendations.length}`);
      console.log(`   - Predictions: ${predictions.length}`);
    } catch (error) {
      console.log(`⚠️ Could not generate AI data for project ${project.name}:`, error);
    }
  }

  // Generate automation workflows
  const workflows = [
    {
      id: 'workflow_1',
      name: 'Task Completion Notification',
      description: 'Automatically notify stakeholders when tasks are completed',
      trigger: 'task_completed',
      conditions: [{ field: 'task_status', operator: 'equals', value: 'completed' }],
      actions: [
        { type: 'notification', config: { recipients: ['project_manager'], template: 'task_completed' } },
        { type: 'email', config: { recipients: ['client'], template: 'progress_update' } }
      ],
      enabled: true
    },
    {
      id: 'workflow_2',
      name: 'Budget Alert',
      description: 'Alert when project spending exceeds thresholds',
      trigger: 'financial_update',
      conditions: [{ field: 'cost_variance', operator: 'greater_than', value: 0.1 }],
      actions: [
        { type: 'notification', config: { recipients: ['finance_manager'], template: 'budget_alert' } },
        { type: 'task', config: { title: 'Review Budget', assignee: 'project_manager' } }
      ],
      enabled: true
    }
  ];

  console.log(`✅ Generated ${workflows.length} automation workflows`);
}

async function generateBusinessIntelligenceData() {
  console.log('📊 Generating business intelligence data...');

  // Create sample dashboards
  const dashboards = [
    {
      name: 'Executive Overview',
      description: 'High-level project and financial overview for executives',
      category: 'executive',
      widgets: [
        { type: 'metric', title: 'Total Revenue', dataSource: 'financial_fact' },
        { type: 'chart', title: 'Project Progress', dataSource: 'projects_fact' },
        { type: 'table', title: 'Active Projects', dataSource: 'projects_fact' }
      ]
    },
    {
      name: 'Project Analytics',
      description: 'Detailed project performance analytics',
      category: 'project',
      widgets: [
        { type: 'chart', title: 'Task Completion Trend', dataSource: 'tasks_dim' },
        { type: 'gauge', title: 'Overall Progress', dataSource: 'projects_fact' },
        { type: 'table', title: 'Project Performance', dataSource: 'projects_fact' }
      ]
    },
    {
      name: 'Financial Dashboard',
      description: 'Comprehensive financial reporting and analysis',
      category: 'financial',
      widgets: [
        { type: 'metric', title: 'Total Budget', dataSource: 'financial_fact' },
        { type: 'chart', title: 'Revenue vs Expenses', dataSource: 'financial_fact' },
        { type: 'table', title: 'Financial Transactions', dataSource: 'financial_fact' }
      ]
    }
  ];

  for (const dashboard of dashboards) {
    try {
      await advancedBIService.createDashboard(dashboard);
      console.log(`✅ Created dashboard: ${dashboard.name}`);
    } catch (error) {
      console.log(`⚠️ Could not create dashboard ${dashboard.name}:`, error);
    }
  }

  // Generate sample analytics queries
  const queries = [
    {
      name: 'Project Performance Analysis',
      description: 'Comprehensive analysis of project performance metrics',
      sql: `
        SELECT 
          p.project_name,
          p.progress,
          p.budget,
          p.actual_cost,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
        FROM projects_fact p
        LEFT JOIN tasks_dim t ON p.project_id = t.project_id
        GROUP BY p.project_id, p.project_name, p.progress, p.budget, p.actual_cost
        ORDER BY p.progress DESC
      `
    },
    {
      name: 'Financial Performance Report',
      description: 'Detailed financial performance analysis',
      sql: `
        SELECT 
          DATE_TRUNC('month', transaction_date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
          SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses,
          SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_income
        FROM financial_fact
        WHERE transaction_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', transaction_date)
        ORDER BY month
      `
    }
  ];

  console.log(`✅ Generated ${queries.length} analytics queries`);
}

// Export the main initialization function
export default initializeComprehensiveDemoData; 
