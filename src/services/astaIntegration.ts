// Asta Powerproject Integration Service
// Enhanced integration with bidirectional sync and conflict resolution

export interface AstaSyncConfig {
  // minutes
  autoSync: boolean;
  bidirectional: boolean; 
  conflictResolution: 'napwood-wins' | 'asta-wins' | 'manual' | 'timestamp';
  enabled: boolean;
  lastSyncTime?: Date;
  syncInterval: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'conflict';
}

export interface AstaResource {
  availability: {
    costPerHour?: number;
    end: Date;
    hoursPerDay: number;
    start: Date;
};
  id: string;
  location?: string;
  name: string;
  skills?: string[];
  type: 'labor' | 'equipment' | 'material';
}

export interface AstaCostData {
  actualCost: number;
  budgetedCost: number;
  costPerformanceIndex: number;
  costVariance: number;
  earnedValue: number;
  forecastCost: number;
  taskId: string;
}

export interface AstaRiskData {
  // 0-100
  assignedTo?: string;
  description: string;
  id: string;
  impact: 'low' | 'medium' | 'high'; 
  mitigation: string;
  probability: number;
  status: 'open' | 'mitigated' | 'closed';
  taskId: string;
}

export interface AstaChangeOrder {
  // days
  approvedBy?: string;
  approvedDate?: Date;
  costImpact: number;
  description: string;
  id: string; 
  scheduleImpact: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedDate: Date;
  taskId: string;
}

class AstaIntegrationService {
  private syncConfig: AstaSyncConfig = {
    enabled: false,
    syncInterval: 15,
    bidirectional: true,
    conflictResolution: 'timestamp',
    autoSync: false,
    syncStatus: 'idle'
  };

  private syncQueue: Array<{
    action: 'create' | 'update' | 'delete';
    data: any;
    id: string;
    timestamp: Date;
    type: 'task' | 'resource' | 'cost' | 'risk';
  }> = [];

  // Initialize Asta integration
  async initialize(config: Partial<AstaSyncConfig> = {}) {
    this.syncConfig = { ...this.syncConfig, ...config };
    
    if (this.syncConfig.autoSync) {
      this.startAutoSync();
    }
    
    console.log('Asta Integration initialized:', this.syncConfig);
  }

  // Start automatic synchronization
  private startAutoSync() {
    if (this.syncConfig.autoSync && this.syncConfig.syncInterval > 0) {
      setInterval(() => {
        this.performSync();
      }, this.syncConfig.syncInterval * 60 * 1000);
    }
  }

  // Perform bidirectional sync
  async performSync() {
    if (!this.syncConfig.enabled) return;

    try {
      this.syncConfig.syncStatus = 'syncing';
      
      // Sync from Asta to ConstructBMS
      if (this.syncConfig.bidirectional) {
        await this.syncFromAsta();
      }
      
      // Sync from ConstructBMS to Asta
      await this.syncToAsta();
      
      // Process sync queue
      await this.processSyncQueue();
      
      this.syncConfig.lastSyncTime = new Date();
      this.syncConfig.syncStatus = 'idle';
      
      console.log('Asta sync completed successfully');
    } catch (error) {
      this.syncConfig.syncStatus = 'error';
      console.error('Asta sync failed:', error);
      throw error;
    }
  }

  // Sync data from Asta Powerproject to ConstructBMS
  private async syncFromAsta() {
    // This would connect to Asta Powerproject API or database
    // For now, we'll simulate the sync process
    
    const astaData = await this.fetchAstaData();
    
    for (const item of astaData) {
      await this.processAstaItem(item);
    }
  }

  // Process individual Asta item
  private async processAstaItem(item: any) {
    // Process individual items from Asta
    console.log('Processing Asta item:', item);
  }

  // Sync data from ConstructBMS to Asta Powerproject
  private async syncToAsta() {
    // Get changes from ConstructBMS that need to be synced to Asta
    const constructbmsChanges = await this.getConstructbmsChanges();
    
    for (const change of constructbmsChanges) {
      await this.sendToAsta(change);
    }
  }

  // Process sync queue for conflict resolution
  private async processSyncQueue() {
    for (const item of this.syncQueue) {
      try {
        await this.resolveConflict(item);
        this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
      } catch (error) {
        console.error('Failed to process sync item:', item, error);
      }
    }
  }

  // Resolve conflicts based on configuration
  private async resolveConflict(item: any) {
    switch (this.syncConfig.conflictResolution) {
              case 'napwood-wins':
          await this.applyNapwoodVersion(item);
        break;
      case 'asta-wins':
        await this.applyAstaVersion(item);
        break;
      case 'timestamp':
        await this.resolveByTimestamp(item);
        break;
      case 'manual':
        await this.flagForManualResolution(item);
        break;
    }
  }

  // Enhanced CSV import with advanced mapping
  async importAstaCSV(csvData: string, mapping: Record<string, string> = {}) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const defaultMapping: Record<string, string> = {
      'Task Name': 'name',
      'Start Date': 'start',
      'End Date': 'end',
      'Duration': 'duration',
      'Progress': 'progress',
      'Resource': 'resource',
      'Cost': 'cost',
      'Risk Level': 'riskLevel',
      'Dependencies': 'dependencies'
    };

    const finalMapping = { ...defaultMapping, ...mapping };
    
    const tasks = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const task: any = {};
      
      headers.forEach((header, index) => {
        const constructbmsField = finalMapping[header];
        if (constructbmsField && values[index]) {
          task[constructbmsField] = this.parseValue(values[index], constructbmsField);
        }
      });
      
      if (task.name) {
        tasks.push(task);
      }
    }
    
    return tasks;
  }

  // Enhanced CSV export with comprehensive data
  async exportAstaCSV(tasks: any[], includeResources = true, includeCosts = true, includeRisks = true) {
    const headers = ['Task Name', 'Start Date', 'End Date', 'Duration', 'Progress', 'Resource', 'Cost', 'Risk Level', 'Dependencies'];
    
    let csvContent = headers.join(',') + '\n';
    
    for (const task of tasks) {
      const row = [
        task.name || '',
        this.formatDate(task.start),
        this.formatDate(task.end),
        task.duration || '',
        task.progress || 0,
        task.resource || '',
        task.cost || 0,
        task.riskLevel || 'low',
        task.dependencies || ''
      ];
      
      csvContent += row.join(',') + '\n';
    }
    
    return csvContent;
  }

  // Export to Asta Powerproject XML format
  async exportAstaXML(tasks: any[], resources: AstaResource[] = [], costs: AstaCostData[] = []) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AstaProject>
  <ProjectInfo>
    <Name>ConstructBMS Project Export</Name>
    <ExportDate>${new Date().toISOString()}</ExportDate>
    <Version>1.0</Version>
  </ProjectInfo>
  
  <Tasks>
    ${tasks.map(task => `
    <Task>
      <ID>${task.id}</ID>
      <Name>${task.name}</Name>
      <StartDate>${this.formatDate(task.start)}</StartDate>
      <EndDate>${this.formatDate(task.end)}</EndDate>
      <Duration>${task.duration || 0}</Duration>
      <Progress>${task.progress || 0}</Progress>
      <Resource>${task.resource || ''}</Resource>
      <Cost>${task.cost || 0}</Cost>
    </Task>`).join('')}
  </Tasks>
  
  <Resources>
    ${resources.map(resource => `
    <Resource>
      <ID>${resource.id}</ID>
      <Name>${resource.name}</Name>
      <Type>${resource.type}</Type>
      <Availability>
        <StartDate>${this.formatDate(resource.availability.start)}</StartDate>
        <EndDate>${this.formatDate(resource.availability.end)}</EndDate>
        <HoursPerDay>${resource.availability.hoursPerDay}</HoursPerDay>
      </Availability>
    </Resource>`).join('')}
  </Resources>
  
  <Costs>
    ${costs.map(cost => `
    <Cost>
      <TaskID>${cost.taskId}</TaskID>
      <BudgetedCost>${cost.budgetedCost}</BudgetedCost>
      <ActualCost>${cost.actualCost}</ActualCost>
      <EarnedValue>${cost.earnedValue}</EarnedValue>
      <CostVariance>${cost.costVariance}</CostVariance>
    </Cost>`).join('')}
  </Costs>
</AstaProject>`;

    return xml;
  }

  // Resource management integration
  async syncResources(resources: AstaResource[]) {
    // Sync resource data between ConstructBMS and Asta
    for (const resource of resources) {
      await this.updateResource(resource);
    }
  }

  // Cost data integration
  async syncCostData(costData: AstaCostData[]) {
    // Sync cost information
    for (const cost of costData) {
      await this.updateCostData(cost);
    }
  }

  // Risk management integration
  async syncRisks(risks: AstaRiskData[]) {
    // Sync risk register
    for (const risk of risks) {
      await this.updateRisk(risk);
    }
  }

  // Change order management
  async syncChangeOrders(changeOrders: AstaChangeOrder[]) {
    // Sync change orders
    for (const changeOrder of changeOrders) {
      await this.updateChangeOrder(changeOrder);
    }
  }

  // Helper methods
  private parseValue(value: string, field: string): any {
    switch (field) {
      case 'start':
      case 'end':
        return new Date(value);
      case 'progress':
      case 'duration':
      case 'cost':
        return parseFloat(value) || 0;
      default:
        return value;
    }
  }

  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private async fetchAstaData() {
    // Simulate fetching data from Asta
    return [];
  }

  private async getConstructbmsChanges() {
    // Get changes from ConstructBMS that need syncing
    return [];
  }

  private async sendToAsta(change: any) {
    // Send change to Asta Powerproject
    console.log('Sending to Asta:', change);
  }

  private async applyNapwoodVersion(item: any) {
    // Apply Napwood's version
    console.log('Applying Napwood version:', item);
  }

  private async applyAstaVersion(item: any) {
    // Apply Asta's version
    console.log('Applying Asta version:', item);
  }

  private async resolveByTimestamp(item: any) {
    // Resolve by timestamp
    console.log('Resolving by timestamp:', item);
  }

  private async flagForManualResolution(item: any) {
    // Flag for manual resolution
    console.log('Flagging for manual resolution:', item);
  }

  private async updateResource(resource: AstaResource) {
    // Update resource in ConstructBMS
    console.log('Updating resource:', resource);
  }

  private async updateCostData(cost: AstaCostData) {
    // Update cost data in ConstructBMS
    console.log('Updating cost data:', cost);
  }

  private async updateRisk(risk: AstaRiskData) {
    // Update risk in ConstructBMS
    console.log('Updating risk:', risk);
  }

  private async updateChangeOrder(changeOrder: AstaChangeOrder) {
    // Update change order in ConstructBMS
    console.log('Updating change order:', changeOrder);
  }

  // Get sync status
  getSyncStatus() {
    return this.syncConfig;
  }

  // Update sync configuration
  updateSyncConfig(config: Partial<AstaSyncConfig>) {
    this.syncConfig = { ...this.syncConfig, ...config };
    
    if (this.syncConfig.autoSync) {
      this.startAutoSync();
    }
  }
}

export const astaIntegrationService = new AstaIntegrationService(); 
