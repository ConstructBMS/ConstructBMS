import { persistentStorage } from './persistentStorage';

export interface IfcFile {
  demo?: boolean;
  fileName: string;
  filePath: string;
  fileSize: number;
  id: string;
  projectId: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface IfcElement {
  demo?: boolean;
  id: string;
  level: string;
  material?: string;
  name: string;
  properties?: Record<string, any>;
  type: string;
}

export interface TaskIfcMapping {
  autoMatched: boolean;
  createdAt: Date;
  demo?: boolean;
  id: string;
  ifcElementId: string;
  ifcElementName: string;
  projectId: string;
  taskId: string;
  taskName: string;
}

export interface IfcConfig {
  autoMatchEnabled: boolean;
  currentModelId?: string;
  demo?: boolean;
}

class IfcService {
  private configKey = 'ifcConfig';
  private filesKey = 'ifcFiles';
  private elementsKey = 'ifcElements';
  private mappingsKey = 'ifcTaskMappings';

  // Default configuration
  private defaultConfig: IfcConfig = {
    currentModelId: undefined,
    autoMatchEnabled: true,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<IfcConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting IFC config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<IfcConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('IFC config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating IFC config:', error);
      throw error;
    }
  }

  /**
   * Upload IFC file
   */
  async uploadIfcFile(file: File, projectId: string): Promise<IfcFile> {
    try {
      const config = await this.getConfig();
      
      // Validate file
      if (!file.name.toLowerCase().endsWith('.ifc')) {
        throw new Error('Invalid file format. Only .IFC files are supported.');
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 100MB.');
      }

      // Create file record
      const ifcFile: IfcFile = {
        id: `ifc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        fileName: file.name,
        filePath: `ifc_models/${projectId}/${file.name}`,
        fileSize: file.size,
        uploadedBy: 'current_user', // Would come from auth context
        uploadedAt: new Date(),
        demo: config.demo
      };

      // Store file metadata
      const files = await this.getIfcFiles(projectId);
      files.push(ifcFile);
      await persistentStorage.set(`${this.filesKey}_${projectId}`, files);

      // Update config with current model
      await this.updateConfig({ currentModelId: ifcFile.id });

      // Parse IFC elements (mock implementation)
      await this.parseIfcElements(ifcFile.id, projectId);

      console.log('IFC file uploaded successfully:', ifcFile);
      return ifcFile;
    } catch (error) {
      console.error('Error uploading IFC file:', error);
      throw error;
    }
  }

  /**
   * Parse IFC elements from uploaded file
   */
  async parseIfcElements(fileId: string, projectId: string): Promise<IfcElement[]> {
    try {
      const config = await this.getConfig();
      
      // Mock IFC elements - in real implementation, this would parse the actual IFC file
      const mockElements: IfcElement[] = [
        { id: 'wall_001', name: 'Exterior Wall A', type: 'Wall', level: 'Ground Floor', material: 'Concrete', demo: config.demo },
        { id: 'wall_002', name: 'Interior Wall B', type: 'Wall', level: 'Ground Floor', material: 'Drywall', demo: config.demo },
        { id: 'floor_001', name: 'Ground Floor Slab', type: 'Floor', level: 'Ground Floor', material: 'Concrete', demo: config.demo },
        { id: 'floor_002', name: 'First Floor Slab', type: 'Floor', level: 'First Floor', material: 'Concrete', demo: config.demo },
        { id: 'column_001', name: 'Column A1', type: 'Column', level: 'Ground Floor', material: 'Steel', demo: config.demo },
        { id: 'column_002', name: 'Column A2', type: 'Column', level: 'First Floor', material: 'Steel', demo: config.demo },
        { id: 'beam_001', name: 'Beam B1', type: 'Beam', level: 'First Floor', material: 'Steel', demo: config.demo },
        { id: 'beam_002', name: 'Beam B2', type: 'Beam', level: 'First Floor', material: 'Steel', demo: config.demo },
        { id: 'door_001', name: 'Main Entrance Door', type: 'Door', level: 'Ground Floor', material: 'Aluminum', demo: config.demo },
        { id: 'window_001', name: 'Window W1', type: 'Window', level: 'Ground Floor', material: 'Glass', demo: config.demo }
      ];

      // Store elements
      await persistentStorage.set(`${this.elementsKey}_${projectId}`, mockElements);

      console.log('IFC elements parsed:', mockElements.length);
      return mockElements;
    } catch (error) {
      console.error('Error parsing IFC elements:', error);
      return [];
    }
  }

  /**
   * Get IFC files for project
   */
  async getIfcFiles(projectId: string): Promise<IfcFile[]> {
    try {
      const files = await persistentStorage.get(`${this.filesKey}_${projectId}`);
      return files || [];
    } catch (error) {
      console.error('Error getting IFC files:', error);
      return [];
    }
  }

  /**
   * Get IFC elements for project
   */
  async getIfcElements(projectId: string): Promise<IfcElement[]> {
    try {
      const elements = await persistentStorage.get(`${this.elementsKey}_${projectId}`);
      return elements || [];
    } catch (error) {
      console.error('Error getting IFC elements:', error);
      return [];
    }
  }

  /**
   * Sync tasks to IFC elements
   */
  async syncTasksToIfc(mappings: Omit<TaskIfcMapping, 'id' | 'projectId' | 'createdAt'>[], projectId: string): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Create mapping records
      const mappingRecords: TaskIfcMapping[] = mappings.map(mapping => ({
        ...mapping,
        id: `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        createdAt: new Date(),
        demo: config.demo
      }));

      // Store mappings
      const existingMappings = await this.getTaskMappings(projectId);
      const updatedMappings = [...existingMappings, ...mappingRecords];
      await persistentStorage.set(`${this.mappingsKey}_${projectId}`, updatedMappings);

      console.log('Task-IFC mappings synced:', mappingRecords.length);
    } catch (error) {
      console.error('Error syncing tasks to IFC:', error);
      throw error;
    }
  }

  /**
   * Get task mappings for project
   */
  async getTaskMappings(projectId: string): Promise<TaskIfcMapping[]> {
    try {
      const mappings = await persistentStorage.get(`${this.mappingsKey}_${projectId}`);
      return mappings || [];
    } catch (error) {
      console.error('Error getting task mappings:', error);
      return [];
    }
  }

  /**
   * Unlink IFC model
   */
  async unlinkModel(projectId: string): Promise<void> {
    try {
      // Remove all IFC data for project
      await persistentStorage.remove(`${this.filesKey}_${projectId}`);
      await persistentStorage.remove(`${this.elementsKey}_${projectId}`);
      await persistentStorage.remove(`${this.mappingsKey}_${projectId}`);
      
      // Reset config
      await this.updateConfig({ currentModelId: undefined });

      console.log('IFC model unlinked for project:', projectId);
    } catch (error) {
      console.error('Error unlinking IFC model:', error);
      throw error;
    }
  }

  /**
   * Auto-match tasks to IFC elements
   */
  async autoMatchTasks(tasks: any[], elements: IfcElement[]): Promise<TaskIfcMapping[]> {
    try {
      const config = await this.getConfig();
      const mappings: TaskIfcMapping[] = [];

      tasks.forEach(task => {
        const matchedElement = this.findMatchingElement(task.name, elements);
        if (matchedElement) {
          mappings.push({
            id: `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            taskId: task.id,
            taskName: task.name,
            ifcElementId: matchedElement.id,
            ifcElementName: matchedElement.name,
            projectId: 'current_project', // Would come from context
            autoMatched: true,
            createdAt: new Date(),
            demo: config.demo
          });
        }
      });

      return mappings;
    } catch (error) {
      console.error('Error auto-matching tasks:', error);
      return [];
    }
  }

  /**
   * Find matching IFC element for task
   */
  private findMatchingElement(taskName: string, elements: IfcElement[]): IfcElement | null {
    const keywords = taskName.toLowerCase().split(' ');
    
    for (const element of elements) {
      const elementName = element.name.toLowerCase();
      const elementType = element.type.toLowerCase();
      
      // Check if any keyword matches element name or type
      for (const keyword of keywords) {
        if (elementName.includes(keyword) || elementType.includes(keyword)) {
          return element;
        }
      }
    }
    
    return null;
  }

  /**
   * Clear all IFC data
   */
  async clearAll(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All IFC data cleared');
    } catch (error) {
      console.error('Error clearing IFC data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const config = await this.getConfig();
      if (config.demo) {
        await this.clearAll();
        await this.updateConfig({ demo: false });
        console.log('Demo IFC data reset');
      }
    } catch (error) {
      console.error('Error resetting demo IFC data:', error);
      throw error;
    }
  }
}

export const ifcService = new IfcService(); 