// Advanced Analytics and Business Intelligence Service
// Professional reporting, EVM, and predictive analytics

export interface EVMData {
  actualCost: number;
  costPerformanceIndex: number;
  costVariance: number;
  earnedValue: number;
  estimateAtCompletion: number;
  plannedValue: number;
  schedulePerformanceIndex: number;
  scheduleVariance: number;
  taskId: string;
  taskName: string;
  varianceAtCompletion: number;
}

export interface KPIMetrics {
  costPerformance: number;
  overallHealth: 'green' | 'yellow' | 'red';
  projectId: string;
  projectName: string;
  qualityScore: number;
  resourceUtilization: number;
  riskLevel: 'low' | 'medium' | 'high';
  safetyScore: number;
  schedulePerformance: number;
}

export interface PredictiveAnalysis {
  completionDate: Date;
  confidence: number;
  costForecast: number;
  projectId: string;
  recommendations: string[];
  riskFactors: string[];
  scheduleForecast: number;
}

export interface PortfolioMetrics {
  activeProjects: number;
  averageCostPerformance: number;
  averageSchedulePerformance: number;
  completedProjects: number;
    high: number;
    low: number;
    medium: number;
  riskDistribution: {
};
  totalBudget: number;
  totalProjects: number;
  totalSpent: number;
}

class AdvancedAnalyticsService {
  // Calculate Earned Value Management metrics
  calculateEVM(tasks: any[]): EVMData[] {
    // Add null checks
    if (!tasks || !Array.isArray(tasks)) {
      return [];
    }
    
    return tasks.map(task => {
      if (!task) return null;
      
      const plannedValue = task.budgetedCost || 0;
      const earnedValue = (task.progress / 100) * plannedValue;
      const actualCost = task.actualCost || 0;
      
      const costVariance = earnedValue - actualCost;
      const scheduleVariance = earnedValue - plannedValue;
      
      const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 1;
      const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 1;
      
      const estimateAtCompletion = actualCost + (plannedValue - earnedValue) / costPerformanceIndex;
      const varianceAtCompletion = plannedValue - estimateAtCompletion;
      
      return {
        taskId: task.id || 'unknown',
        taskName: task.name || 'Unknown Task',
        plannedValue,
        earnedValue,
        actualCost,
        costVariance,
        scheduleVariance,
        costPerformanceIndex,
        schedulePerformanceIndex,
        estimateAtCompletion,
        varianceAtCompletion
      };
    }).filter(Boolean); // Remove null entries
  }

  // Generate EVM data for analytics
  generateEVMData(tasks: any[]): EVMData[] {
    return this.calculateEVM(tasks);
  }

  // Calculate KPI metrics for a project
  calculateKPIs(project: any, tasks: any[]): KPIMetrics {
    const evmData = this.calculateEVM(tasks);
    
    const avgSchedulePerformance = evmData.reduce((sum, evm) => sum + evm.schedulePerformanceIndex, 0) / evmData.length;
    const avgCostPerformance = evmData.reduce((sum, evm) => sum + evm.costPerformanceIndex, 0) / evmData.length;
    
    const totalBudget = evmData.reduce((sum, evm) => sum + evm.plannedValue, 0);
    const totalSpent = evmData.reduce((sum, evm) => sum + evm.actualCost, 0);
    const resourceUtilization = totalSpent / totalBudget;
    
    // Calculate quality and safety scores (placeholder logic)
    const qualityScore = Math.min(100, avgSchedulePerformance * 100);
    const safetyScore = 95; // Placeholder
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (avgCostPerformance < 0.9 || avgSchedulePerformance < 0.9) {
      riskLevel = 'high';
    } else if (avgCostPerformance < 0.95 || avgSchedulePerformance < 0.95) {
      riskLevel = 'medium';
    }
    
    // Determine overall health
    let overallHealth: 'green' | 'yellow' | 'red' = 'green';
    if (riskLevel === 'high' || qualityScore < 80) {
      overallHealth = 'red';
    } else if (riskLevel === 'medium' || qualityScore < 90) {
      overallHealth = 'yellow';
    }
    
    return {
      projectId: project.id,
      projectName: project.name,
      schedulePerformance: avgSchedulePerformance,
      costPerformance: avgCostPerformance,
      qualityScore,
      safetyScore,
      resourceUtilization,
      riskLevel,
      overallHealth
    };
  }

  // Generate predictive analysis
  generatePredictiveAnalysis(project: any, tasks: any[], historicalData: any[] = []): PredictiveAnalysis {
    const evmData = this.calculateEVM(tasks);
    const kpis = this.calculateKPIs(project, tasks);
    
    // Calculate completion date prediction
    const avgSchedulePerformance = kpis.schedulePerformance;
    const originalDuration = this.calculateProjectDuration(tasks);
    const predictedDuration = originalDuration / avgSchedulePerformance;
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + predictedDuration);
    
    // Calculate confidence based on performance consistency
    const performanceVariance = this.calculatePerformanceVariance(evmData);
    const confidence = Math.max(50, 100 - (performanceVariance * 100));
    
    // Identify risk factors
    const riskFactors: string[] = [];
    if (kpis.costPerformance < 0.9) riskFactors.push('Cost overrun');
    if (kpis.schedulePerformance < 0.9) riskFactors.push('Schedule delay');
    if (kpis.resourceUtilization > 1.1) riskFactors.push('Resource over-allocation');
    if (evmData.some(evm => evm.costVariance < -1000)) riskFactors.push('Significant cost variance');
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (kpis.costPerformance < 0.95) {
      recommendations.push('Review cost control measures and implement corrective actions');
    }
    if (kpis.schedulePerformance < 0.95) {
      recommendations.push('Analyze critical path and consider schedule compression techniques');
    }
    if (riskFactors.length > 0) {
      recommendations.push('Implement risk mitigation strategies for identified risk factors');
    }
    
    // Calculate forecasts
    const totalBudget = evmData.reduce((sum, evm) => sum + evm.plannedValue, 0);
    const costForecast = totalBudget / kpis.costPerformance;
    const scheduleForecast = originalDuration / kpis.schedulePerformance;
    
    return {
      projectId: project.id,
      completionDate,
      confidence,
      riskFactors,
      recommendations,
      costForecast,
      scheduleForecast
    };
  }

  // Calculate portfolio metrics
  calculatePortfolioMetrics(projects: any[]): PortfolioMetrics {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    let totalBudget = 0;
    let totalSpent = 0;
    let totalSchedulePerformance = 0;
    let totalCostPerformance = 0;
    let validProjects = 0;
    
    const riskDistribution = { low: 0, medium: 0, high: 0 };
    
    projects.forEach(project => {
      if (project.budget) totalBudget += project.budget;
      if (project.spent) totalSpent += project.spent;
      
      if (project.kpis) {
        totalSchedulePerformance += project.kpis.schedulePerformance;
        totalCostPerformance += project.kpis.costPerformance;
        validProjects++;
        
        riskDistribution[project.kpis.riskLevel]++;
      }
    });
    
    const averageSchedulePerformance = validProjects > 0 ? totalSchedulePerformance / validProjects : 0;
    const averageCostPerformance = validProjects > 0 ? totalCostPerformance / validProjects : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      averageSchedulePerformance,
      averageCostPerformance,
      riskDistribution
    };
  }

  // Generate executive dashboard data
  generateExecutiveDashboard(projects: any[]): any {
    const portfolioMetrics = this.calculatePortfolioMetrics(projects);
    
    // Top performing projects
    const topProjects = projects
      .filter(p => p.kpis)
      .sort((a, b) => b.kpis.overallHealth.localeCompare(a.kpis.overallHealth))
      .slice(0, 5);
    
    // Projects at risk
    const atRiskProjects = projects
      .filter(p => p.kpis && p.kpis.overallHealth === 'red')
      .slice(0, 5);
    
    // Recent activities
    const recentActivities = this.generateRecentActivities(projects);
    
    // Financial summary
    const financialSummary = {
      totalBudget: portfolioMetrics.totalBudget,
      totalSpent: portfolioMetrics.totalSpent,
      variance: portfolioMetrics.totalBudget - portfolioMetrics.totalSpent,
      variancePercentage: portfolioMetrics.totalBudget > 0 ? 
        ((portfolioMetrics.totalBudget - portfolioMetrics.totalSpent) / portfolioMetrics.totalBudget) * 100 : 0
    };
    
    return {
      portfolioMetrics,
      topProjects,
      atRiskProjects,
      recentActivities,
      financialSummary
    };
  }

  // Generate trend analysis
  generateTrendAnalysis(projects: any[], timeRange: 'week' | 'month' | 'quarter' = 'month'): any {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    const filteredProjects = projects.filter(p => 
      new Date(p.createdAt) >= startDate && new Date(p.createdAt) <= now
    );
    
    const trendData = {
      newProjects: filteredProjects.length,
      completedProjects: filteredProjects.filter(p => p.status === 'completed').length,
      averagePerformance: this.calculateAveragePerformance(filteredProjects),
      costTrend: this.calculateCostTrend(filteredProjects),
      scheduleTrend: this.calculateScheduleTrend(filteredProjects)
    };
    
    return trendData;
  }

  // Generate comprehensive reports
  generateReport(reportType: 'evm' | 'kpi' | 'portfolio' | 'trend', data: any): any {
    switch (reportType) {
      case 'evm':
        return this.generateEVMReport(data);
      case 'kpi':
        return this.generateKPIReport(data);
      case 'portfolio':
        return this.generatePortfolioReport(data);
      case 'trend':
        return this.generateTrendReport(data);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  // Export reports in various formats
  async exportReport(report: any, format: 'pdf' | 'excel' | 'csv' | 'json'): Promise<string> {
    switch (format) {
      case 'pdf':
        return this.exportToPDF(report);
      case 'excel':
        return this.exportToExcel(report);
      case 'csv':
        return this.exportToCSV(report);
      case 'json':
        return JSON.stringify(report, null, 2);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Helper methods
  private calculateProjectDuration(tasks: any[]): number {
    if (tasks.length === 0) return 0;
    
    const startDates = tasks.map(t => new Date(t.start));
    const endDates = tasks.map(t => new Date(t.end));
    
    const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
    
    return Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculatePerformanceVariance(evmData: EVMData[]): number {
    if (evmData.length === 0) return 0;
    
    const performances = evmData.map(evm => evm.costPerformanceIndex);
    const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
    
    return Math.sqrt(variance);
  }

  private generateRecentActivities(projects: any[]): any[] {
    // Generate recent activities from projects
    const activities: any[] = [];
    
    projects.forEach(project => {
      if (project.updatedAt) {
        activities.push({
          type: 'project_update',
          projectId: project.id,
          projectName: project.name,
          timestamp: project.updatedAt,
          description: `Project ${project.name} was updated`
        });
      }
    });
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  private calculateAveragePerformance(projects: any[]): number {
    const validProjects = projects.filter(p => p.kpis);
    if (validProjects.length === 0) return 0;
    
    const totalPerformance = validProjects.reduce((sum, p) => 
      sum + (p.kpis.schedulePerformance + p.kpis.costPerformance) / 2, 0
    );
    
    return totalPerformance / validProjects.length;
  }

  private calculateCostTrend(projects: any[]): number {
    // Calculate cost trend over time
    return 0; // Placeholder
  }

  private calculateScheduleTrend(projects: any[]): number {
    // Calculate schedule trend over time
    return 0; // Placeholder
  }

  private generateEVMReport(data: any): any {
    return {
      reportType: 'EVM',
      generatedAt: new Date(),
      data: data,
      summary: {
        totalTasks: data.length,
        averageCPI: data.reduce((sum: number, evm: EVMData) => sum + evm.costPerformanceIndex, 0) / data.length,
        averageSPI: data.reduce((sum: number, evm: EVMData) => sum + evm.schedulePerformanceIndex, 0) / data.length
      }
    };
  }

  private generateKPIReport(data: any): any {
    return {
      reportType: 'KPI',
      generatedAt: new Date(),
      data: data
    };
  }

  private generatePortfolioReport(data: any): any {
    return {
      reportType: 'Portfolio',
      generatedAt: new Date(),
      data: data
    };
  }

  private generateTrendReport(data: any): any {
    return {
      reportType: 'Trend',
      generatedAt: new Date(),
      data: data
    };
  }

  private async exportToPDF(report: any): Promise<string> {
    // Generate PDF report
    return 'PDF report generated';
  }

  private async exportToExcel(report: any): Promise<string> {
    // Generate Excel report
    return 'Excel report generated';
  }

  private async exportToCSV(report: any): Promise<string> {
    // Generate CSV report
    return 'CSV report generated';
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService(); 
