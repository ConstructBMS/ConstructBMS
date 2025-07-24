import { persistentStorage } from './persistentStorage';

export interface TaskIfcLink {
  id: string;
  taskId: string;
  taskName: string;
  ifcElementId: string;
  ifcElementName: string;
  ifcElementType: string;
  startDate: Date;
  endDate: Date;
  linkStatus: 'active' | 'broken';
  autoMatched: boolean;
  projectId: string;
  createdAt: Date;
  demo?: boolean;
}

export interface TaskModelLinkConfig {
  maxLinksPerPage: number;
  enableAutoValidation: boolean;
  demo?: boolean;
}

class TaskModelLinkService {
  private configKey = 'taskModelLinkConfig';
  private linksKey = 'taskIfcLinks';

  // Default configuration
  private defaultConfig: TaskModelLinkConfig = {
    maxLinksPerPage: 10,
    enableAutoValidation: true,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<TaskModelLinkConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting task model link config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<TaskModelLinkConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Task model link config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating task model link config:', error);
      throw error;
    }
  }

  /**
   * Get all task-IFC links for project
   */
  async getTaskIfcLinks(projectId: string): Promise<TaskIfcLink[]> {
    try {
      const links = await persistentStorage.get(`${this.linksKey}_${projectId}`);
      if (links) {
        return links.map((link: any) => ({
          ...link,
          startDate: new Date(link.startDate),
          endDate: new Date(link.endDate),
          createdAt: new Date(link.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting task-IFC links:', error);
      return [];
    }
  }

  /**
   * Get task-IFC links with validation
   */
  async getValidatedTaskIfcLinks(projectId: string, tasks: any[], ifcElements: any[]): Promise<TaskIfcLink[]> {
    try {
      const links = await this.getTaskIfcLinks(projectId);
      const config = await this.getConfig();
      
      // Validate links
      const validatedLinks = links.map(link => {
        const task = tasks.find(t => t.id === link.taskId);
        const ifcElement = ifcElements.find(e => e.id === link.ifcElementId);
        
        const isValid = task && ifcElement;
        const linkStatus: 'active' | 'broken' = isValid ? 'active' : 'broken';
        
        return {
          ...link,
          taskName: task?.name || link.taskName,
          ifcElementName: ifcElement?.name || link.ifcElementName,
          ifcElementType: ifcElement?.type || link.ifcElementType,
          linkStatus
        };
      });

      // Limit links in demo mode
      if (config.demo && validatedLinks.length > 5) {
        return validatedLinks.slice(0, 5);
      }

      return validatedLinks;
    } catch (error) {
      console.error('Error getting validated task-IFC links:', error);
      return [];
    }
  }

  /**
   * Update task-IFC link
   */
  async updateTaskIfcLink(linkId: string, newIfcElementId: string, projectId: string, ifcElements: any[]): Promise<void> {
    try {
      const config = await this.getConfig();
      const links = await this.getTaskIfcLinks(projectId);
      
      const linkIndex = links.findIndex(link => link.id === linkId);
      if (linkIndex === -1) {
        throw new Error('Link not found');
      }

      const newIfcElement = ifcElements.find(e => e.id === newIfcElementId);
      if (!newIfcElement) {
        throw new Error('IFC element not found');
      }

      // Update link
      links[linkIndex] = {
        ...links[linkIndex],
        ifcElementId: newIfcElementId,
        ifcElementName: newIfcElement.name,
        ifcElementType: newIfcElement.type,
        linkStatus: 'active',
        autoMatched: false,
        demo: config.demo
      };

      // Store updated links
      await persistentStorage.set(`${this.linksKey}_${projectId}`, links);
      
      console.log('Task-IFC link updated:', links[linkIndex]);
    } catch (error) {
      console.error('Error updating task-IFC link:', error);
      throw error;
    }
  }

  /**
   * Remove task-IFC link
   */
  async removeTaskIfcLink(linkId: string, projectId: string): Promise<void> {
    try {
      const links = await this.getTaskIfcLinks(projectId);
      const updatedLinks = links.filter(link => link.id !== linkId);
      
      await persistentStorage.set(`${this.linksKey}_${projectId}`, updatedLinks);
      
      console.log('Task-IFC link removed:', linkId);
    } catch (error) {
      console.error('Error removing task-IFC link:', error);
      throw error;
    }
  }

  /**
   * Search task-IFC links
   */
  async searchTaskIfcLinks(projectId: string, searchTerm: string): Promise<TaskIfcLink[]> {
    try {
      const links = await this.getTaskIfcLinks(projectId);
      const term = searchTerm.toLowerCase();
      
      return links.filter(link => 
        link.taskName.toLowerCase().includes(term) ||
        link.ifcElementName.toLowerCase().includes(term) ||
        link.ifcElementType.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching task-IFC links:', error);
      return [];
    }
  }

  /**
   * Filter task-IFC links by status
   */
  async filterTaskIfcLinks(projectId: string, status: 'all' | 'active' | 'broken'): Promise<TaskIfcLink[]> {
    try {
      const links = await this.getTaskIfcLinks(projectId);
      
      if (status === 'all') {
        return links;
      }
      
      return links.filter(link => link.linkStatus === status);
    } catch (error) {
      console.error('Error filtering task-IFC links:', error);
      return [];
    }
  }

  /**
   * Validate all links
   */
  async validateAllLinks(projectId: string, tasks: any[], ifcElements: any[]): Promise<void> {
    try {
      const config = await this.getConfig();
      if (!config.enableAutoValidation) return;

      const links = await this.getTaskIfcLinks(projectId);
      let hasChanges = false;

      const updatedLinks = links.map(link => {
        const task = tasks.find(t => t.id === link.taskId);
        const ifcElement = ifcElements.find(e => e.id === link.ifcElementId);
        
        const isValid = task && ifcElement;
        const newStatus: 'active' | 'broken' = isValid ? 'active' : 'broken';
        
        if (link.linkStatus !== newStatus) {
          hasChanges = true;
          return {
            ...link,
            linkStatus: newStatus
          };
        }
        
        return link;
      });

      if (hasChanges) {
        await persistentStorage.set(`${this.linksKey}_${projectId}`, updatedLinks);
        console.log('All task-IFC links validated');
      }
    } catch (error) {
      console.error('Error validating task-IFC links:', error);
      throw error;
    }
  }

  /**
   * Get link statistics
   */
  async getLinkStatistics(projectId: string): Promise<{
    total: number;
    active: number;
    broken: number;
    autoMatched: number;
    manualMatched: number;
  }> {
    try {
      const links = await this.getTaskIfcLinks(projectId);
      
      return {
        total: links.length,
        active: links.filter(l => l.linkStatus === 'active').length,
        broken: links.filter(l => l.linkStatus === 'broken').length,
        autoMatched: links.filter(l => l.autoMatched).length,
        manualMatched: links.filter(l => !l.autoMatched).length
      };
    } catch (error) {
      console.error('Error getting link statistics:', error);
      return {
        total: 0,
        active: 0,
        broken: 0,
        autoMatched: 0,
        manualMatched: 0
      };
    }
  }

  /**
   * Clear all links
   */
  async clearAllLinks(projectId: string): Promise<void> {
    try {
      await persistentStorage.remove(`${this.linksKey}_${projectId}`);
      console.log('All task-IFC links cleared for project:', projectId);
    } catch (error) {
      console.error('Error clearing task-IFC links:', error);
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
        await persistentStorage.remove(this.configKey);
        await this.updateConfig({ demo: false });
        console.log('Demo task model link data reset');
      }
    } catch (error) {
      console.error('Error resetting demo task model link data:', error);
      throw error;
    }
  }
}

export const taskModelLinkService = new TaskModelLinkService(); 