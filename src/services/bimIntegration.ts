// 4D BIM Integration Service
// Building Information Modeling with time dimension integration

export interface BIMModel {
    architect: string;
    buildingName: string;
    buildingType: string;
  clashes: BIMClash[];
    contractor: string;
  elements: BIMElement[];
    engineer: string;
  fileSize: number;
  fileType: 'ifc' | 'revit' | 'sketchup' | 'autocad' | 'bimx';
    floors: number;
  id: string;
  lastModified: Date;
  metadata: {
    projectId: string;
    totalArea: number;
};
  name: string;
  schedules: BIMSchedule[];
  status: 'uploading' | 'processing' | 'ready' | 'error';
  uploadDate: Date;
  version: string;
  views: BIMView[];
}

export interface BIMElement {
    area: number;
  category: string;
  cost: number;
    dimensions: { depth: number, endDate?: Date; family: string; 
  geometry: {
};
  height: number;
  position: { x: number; y: number; z: number };
    volume: number;
    width: number;
  };
  id: string;
  level: string;
  materials: BIMMaterial[];
  name: string;
  progress: number;
  properties: Record<string, any>;
  resources: string[]; 
  room: string;
  startDate?: Date;
  // Linked task IDs
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  systems: string[];
  tasks: string[];
  type: 'wall' | 'floor' | 'ceiling' | 'door' | 'window' | 'column' | 'beam' | 'furniture' | 'equipment' | 'system';
}

export interface BIMSchedule {
  // Task IDs
  // BIM element IDs
  cost: number;
  dependencies: string[];
  duration: number;
  elements: string[]; 
  endDate: Date; 
  id: string;
  name: string;
  progress: number;
  resources: string[];
  startDate: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  tasks: string[];
  type: 'construction' | 'installation' | 'inspection' | 'maintenance';
}

export interface BIMClash {
  // BIM element IDs involved
  assignedTo: string;
  cost: number;
  createdAt: Date;
  description: string;
  dueDate: Date;
  elements: string[]; 
  id: string;
  location: { x: number; y: number; z: number 
};
  name: string;
  resolution: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'reviewed' | 'resolved' | 'approved';
  type: 'hard' | 'soft' | 'workflow';
  updatedAt: Date;
}

export interface BIMView {
  annotations: BIMAnnotation[];
  camera: {
    position: { x: number; y: number; z: number 
};
    target: { x: number; y: number; z: number };
    up: { x: number; y: number; z: number };
  };
  filters: BIMFilter[];
  id: string;
  name: string;
  screenshots: string[];
  type: '3d' | 'plan' | 'section' | 'elevation' | 'detail';
  visibleElements: string[];
}

export interface BIMFilter {
  color: string;
  criteria: Record<string, any>;
  id: string;
  name: string;
  opacity: number;
  type: 'category' | 'level' | 'system' | 'status' | 'custom';
  visible: boolean;
}

export interface BIMAnnotation {
  author: string;
  content: string;
  createdAt: Date;
  id: string;
  position: { x: number; y: number; z: number 
};
  status: 'active' | 'resolved' | 'archived';
  type: 'text' | 'dimension' | 'markup' | 'issue';
}

export interface BIMMaterial {
  availability: 'in-stock' | 'ordered' | 'out-of-stock';
  cost: number;
    density: number;
    fireRating: string;
  id: string;
  name: string;
  properties: {
    sustainability: string;
    thermalConductivity: number;
};
  supplier: string;
  type: string;
}

export interface BIMSyncConfig {
  // minutes
  autoSync: boolean;
  conflictResolution: 'bim-wins' | 'tasks-wins' | 'manual' | 'timestamp';
  enabled: boolean; 
  lastSyncTime?: Date;
  syncDirection: 'bim-to-tasks' | 'tasks-to-bim' | 'bidirectional';
  syncInterval: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'conflict';
}

class BIMIntegrationService {
  private models: Map<string, BIMModel> = new Map();
  private syncConfig: BIMSyncConfig = {
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    syncDirection: 'bidirectional',
    conflictResolution: 'timestamp',
    syncStatus: 'idle'
  };

  // Initialize BIM integration
  async initialize(config: Partial<BIMSyncConfig> = {}) {
    this.syncConfig = { ...this.syncConfig, ...config };
    
    if (this.syncConfig.autoSync) {
      this.startAutoSync();
    }
    
    console.log('BIM Integration initialized:', this.syncConfig);
  }

  // Upload and process BIM model
  async uploadModel(file: File, projectId: string): Promise<BIMModel> {
    const model: BIMModel = {
      id: `bim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      version: '1.0',
      fileType: this.detectFileType(file.name),
      fileSize: file.size,
      uploadDate: new Date(),
      lastModified: new Date(),
      status: 'uploading',
      metadata: {
        projectId,
        buildingName: 'Sample Building',
        floors: 5,
        totalArea: 50000,
        buildingType: 'Commercial',
        architect: 'Sample Architect',
        engineer: 'Sample Engineer',
        contractor: 'Sample Contractor'
      },
      elements: [],
      schedules: [],
      clashes: [],
      views: []
    };

    // Simulate file processing
    await this.processBIMFile(model);
    
    this.models.set(model.id, model);
    return model;
  }

  // Process BIM file and extract elements
  private async processBIMFile(model: BIMModel) {
    model.status = 'processing';
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate sample elements based on file type
    model.elements = this.generateSampleElements(model);
    model.schedules = this.generateSampleSchedules(model);
    model.clashes = this.generateSampleClashes(model);
    model.views = this.generateSampleViews(model);
    
    model.status = 'ready';
    model.lastModified = new Date();
  }

  // Generate sample BIM elements
  private generateSampleElements(model: BIMModel): BIMElement[] {
    const elements: BIMElement[] = [];
    
    // Generate walls
    for (let i = 0; i < 20; i++) {
      elements.push({
        id: `wall_${i}`,
        name: `Wall ${i + 1}`,
        type: 'wall',
        category: 'Walls',
        family: 'Basic Wall',
        level: `Level ${Math.floor(i / 4) + 1}`,
        room: `Room ${i + 1}`,
        geometry: {
          position: { x: i * 5, y: 0, z: Math.floor(i / 4) * 3 },
          dimensions: { width: 4, height: 3, depth: 0.2 },
          volume: 2.4,
          area: 12
        },
        properties: {
          material: 'Concrete',
          thickness: 200,
          fireRating: 'A1',
          acousticRating: '45dB'
        },
        materials: [{
          id: `mat_${i}`,
          name: 'Concrete',
          type: 'Structural',
          properties: {
            density: 2400,
            thermalConductivity: 1.4,
            fireRating: 'A1',
            sustainability: 'High'
          },
          cost: 50,
          supplier: 'Concrete Co.',
          availability: 'in-stock'
        }],
        systems: ['Structural', 'Fire Protection'],
        tasks: [`task_${i}`],
        status: i < 5 ? 'completed' : i < 10 ? 'in-progress' : 'not-started',
        progress: i < 5 ? 100 : i < 10 ? 60 : 0,
        startDate: new Date(2024, 0, 1 + i),
        endDate: new Date(2024, 0, 15 + i),
        cost: 5000 + i * 100,
        resources: [`resource_${i}`]
      });
    }

    // Generate floors
    for (let i = 0; i < 5; i++) {
      elements.push({
        id: `floor_${i}`,
        name: `Floor ${i + 1}`,
        type: 'floor',
        category: 'Floors',
        family: 'Basic Floor',
        level: `Level ${i + 1}`,
        room: '',
        geometry: {
          position: { x: 0, y: 0, z: i * 3 },
          dimensions: { width: 50, height: 0.3, depth: 30 },
          volume: 450,
          area: 1500
        },
        properties: {
          material: 'Concrete Slab',
          thickness: 300,
          loadCapacity: '5kN/m²'
        },
        materials: [{
          id: `mat_floor_${i}`,
          name: 'Concrete Slab',
          type: 'Structural',
          properties: {
            density: 2400,
            thermalConductivity: 1.4,
            fireRating: 'A1',
            sustainability: 'High'
          },
          cost: 75,
          supplier: 'Concrete Co.',
          availability: 'in-stock'
        }],
        systems: ['Structural'],
        tasks: [`task_floor_${i}`],
        status: i < 2 ? 'completed' : i < 3 ? 'in-progress' : 'not-started',
        progress: i < 2 ? 100 : i < 3 ? 80 : 0,
        startDate: new Date(2024, 0, 1 + i * 10),
        endDate: new Date(2024, 0, 20 + i * 10),
        cost: 150000 + i * 10000,
        resources: [`resource_floor_${i}`]
      });
    }

    return elements;
  }

  // Generate sample schedules
  private generateSampleSchedules(model: BIMModel): BIMSchedule[] {
    return [
      {
        id: 'schedule_1',
        name: 'Foundation Construction',
        type: 'construction',
        elements: ['floor_0'],
        tasks: ['task_floor_0'],
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 20),
        duration: 20,
        dependencies: [],
        resources: ['resource_floor_0'],
        cost: 150000,
        status: 'completed',
        progress: 100
      },
      {
        id: 'schedule_2',
        name: 'Structural Framework',
        type: 'construction',
        elements: ['wall_0', 'wall_1', 'wall_2', 'wall_3'],
        tasks: ['task_0', 'task_1', 'task_2', 'task_3'],
        startDate: new Date(2024, 0, 15),
        endDate: new Date(2024, 1, 15),
        duration: 32,
        dependencies: ['schedule_1'],
        resources: ['resource_0', 'resource_1', 'resource_2', 'resource_3'],
        cost: 25000,
        status: 'in-progress',
        progress: 60
      }
    ];
  }

  // Generate sample clashes
  private generateSampleClashes(model: BIMModel): BIMClash[] {
    return [
      {
        id: 'clash_1',
        name: 'Wall-Duct Intersection',
        type: 'hard',
        severity: 'high',
        status: 'open',
        elements: ['wall_5', 'duct_1'],
        description: 'Wall intersects with HVAC duct at Level 2',
        location: { x: 25, y: 0, z: 6 },
        assignedTo: 'engineer_1',
        dueDate: new Date(2024, 1, 15),
        resolution: '',
        cost: 5000,
        createdAt: new Date(2024, 0, 10),
        updatedAt: new Date(2024, 0, 10)
      },
      {
        id: 'clash_2',
        name: 'Electrical Conduit Conflict',
        type: 'soft',
        severity: 'medium',
        status: 'reviewed',
        elements: ['conduit_1', 'beam_1'],
        description: 'Electrical conduit conflicts with structural beam',
        location: { x: 15, y: 0, z: 9 },
        assignedTo: 'electrician_1',
        dueDate: new Date(2024, 1, 20),
        resolution: 'Reroute conduit around beam',
        cost: 2000,
        createdAt: new Date(2024, 0, 8),
        updatedAt: new Date(2024, 0, 12)
      }
    ];
  }

  // Generate sample views
  private generateSampleViews(model: BIMModel): BIMView[] {
    return [
      {
        id: 'view_1',
        name: '3D Overview',
        type: '3d',
        camera: {
          position: { x: 50, y: 50, z: 30 },
          target: { x: 25, y: 25, z: 7.5 },
          up: { x: 0, y: 0, z: 1 }
        },
        filters: [],
        visibleElements: model.elements.map(e => e.id),
        annotations: [],
        screenshots: []
      },
      {
        id: 'view_2',
        name: 'Ground Floor Plan',
        type: 'plan',
        camera: {
          position: { x: 25, y: 25, z: 0.1 },
          target: { x: 25, y: 25, z: 0 },
          up: { x: 0, y: 1, z: 0 }
        },
        filters: [{
          id: 'filter_1',
          name: 'Ground Floor Only',
          type: 'level',
          criteria: { level: 'Level 1' },
          color: '#3b82f6',
          opacity: 1,
          visible: true
        }],
        visibleElements: model.elements.filter(e => e.level === 'Level 1').map(e => e.id),
        annotations: [],
        screenshots: []
      }
    ];
  }

  // Sync BIM with project tasks
  async syncWithTasks(projectId: string, tasks: any[]) {
    if (!this.syncConfig.enabled) return;

    try {
      this.syncConfig.syncStatus = 'syncing';
      
      const projectModels = Array.from(this.models.values()).filter(m => m.metadata.projectId === projectId);
      
      for (const model of projectModels) {
        await this.syncModelWithTasks(model, tasks);
      }
      
      this.syncConfig.lastSyncTime = new Date();
      this.syncConfig.syncStatus = 'idle';
      
      console.log('BIM sync completed successfully');
    } catch (error) {
      this.syncConfig.syncStatus = 'error';
      console.error('BIM sync failed:', error);
      throw error;
    }
  }

  // Sync individual model with tasks
  private async syncModelWithTasks(model: BIMModel, tasks: any[]) {
    for (const element of model.elements) {
      const linkedTask = tasks.find(t => t.id === element.tasks[0]);
      if (linkedTask) {
        // Update element progress based on task progress
        element.progress = linkedTask.progress || 0;
        element.status = this.mapTaskStatusToElementStatus(linkedTask.status);
        
        // Update task with BIM information
        linkedTask.bimElement = {
          id: element.id,
          name: element.name,
          type: element.type,
          geometry: element.geometry
        };
      }
    }
  }

  // Map task status to BIM element status
  private mapTaskStatusToElementStatus(taskStatus: string): 'not-started' | 'in-progress' | 'completed' | 'on-hold' {
    switch (taskStatus) {
      case 'completed': return 'completed';
      case 'in-progress': return 'in-progress';
      case 'on-hold': return 'on-hold';
      default: return 'not-started';
    }
  }

  // Detect BIM file type
  private detectFileType(filename: string): 'ifc' | 'revit' | 'sketchup' | 'autocad' | 'bimx' {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'ifc': return 'ifc';
      case 'rvt': return 'revit';
      case 'skp': return 'sketchup';
      case 'dwg': case 'dxf': return 'autocad';
      case 'bimx': return 'bimx';
      default: return 'ifc';
    }
  }

  // Get BIM models for project
  getProjectModels(projectId: string): BIMModel[] {
    return Array.from(this.models.values()).filter(m => m.metadata.projectId === projectId);
  }

  // Get BIM model by ID
  getModel(modelId: string): BIMModel | undefined {
    return this.models.get(modelId);
  }

  // Update BIM element
  updateElement(modelId: string, elementId: string, updates: Partial<BIMElement>) {
    const model = this.models.get(modelId);
    if (model) {
      const element = model.elements.find(e => e.id === elementId);
      if (element) {
        Object.assign(element, updates);
        model.lastModified = new Date();
      }
    }
  }

  // Add BIM clash
  addClash(modelId: string, clash: Omit<BIMClash, 'id' | 'createdAt' | 'updatedAt'>) {
    const model = this.models.get(modelId);
    if (model) {
      const newClash: BIMClash = {
        ...clash,
        id: `clash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      model.clashes.push(newClash);
      model.lastModified = new Date();
    }
  }

  // Get sync configuration
  getSyncConfig(): BIMSyncConfig {
    return { ...this.syncConfig };
  }

  // Update sync configuration
  updateSyncConfig(config: Partial<BIMSyncConfig>) {
    this.syncConfig = { ...this.syncConfig, ...config };
    
    if (this.syncConfig.autoSync) {
      this.startAutoSync();
    }
  }

  // Start automatic sync
  private startAutoSync() {
    if (this.syncConfig.autoSync && this.syncConfig.syncInterval > 0) {
      setInterval(() => {
        // This would sync with actual project data
        console.log('Auto BIM sync triggered');
      }, this.syncConfig.syncInterval * 60 * 1000);
    }
  }
}

// Create singleton instance
let bimIntegrationInstance: BIMIntegrationService | null = null;

function getBIMIntegrationInstance(): BIMIntegrationService {
  if (!bimIntegrationInstance) {
    bimIntegrationInstance = new BIMIntegrationService();
  }
  return bimIntegrationInstance;
}

// Export functions that use the singleton
export const bimIntegrationService = {
  initialize: (config?: Partial<BIMSyncConfig>) => getBIMIntegrationInstance().initialize(config),
  uploadModel: (file: File, projectId: string) => getBIMIntegrationInstance().uploadModel(file, projectId),
  syncWithTasks: (projectId: string, tasks: any[]) => getBIMIntegrationInstance().syncWithTasks(projectId, tasks),
  getProjectModels: (projectId: string) => getBIMIntegrationInstance().getProjectModels(projectId),
  getModel: (modelId: string) => getBIMIntegrationInstance().getModel(modelId),
  updateElement: (modelId: string, elementId: string, updates: Partial<BIMElement>) => 
    getBIMIntegrationInstance().updateElement(modelId, elementId, updates),
  addClash: (modelId: string, clash: Omit<BIMClash, 'id' | 'createdAt' | 'updatedAt'>) => 
    getBIMIntegrationInstance().addClash(modelId, clash),
  getSyncConfig: () => getBIMIntegrationInstance().getSyncConfig(),
  updateSyncConfig: (config: Partial<BIMSyncConfig>) => getBIMIntegrationInstance().updateSyncConfig(config)
}; 
