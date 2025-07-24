import { persistentStorage } from './persistentStorage';
import type { ProjectDetails } from '../components/modules/ribbonTabs/ProjectDetailsModal';
import type { ProjectNotes } from '../components/modules/ribbonTabs/ProjectNotesModal';
import type { ProjectStatus } from '../components/modules/ribbonTabs/ProjectStatusDropdown';

export interface ProjectInformation {
  details: ProjectDetails;
  notes: ProjectNotes;
  status: ProjectStatus;
  statusHistory: Array<{
    status: ProjectStatus;
    changedAt: string;
    changedBy: string;
    demo?: boolean;
  }>;
  demo?: boolean;
}

export interface ProjectInformationResult {
  success: boolean;
  data?: ProjectInformation;
  errors: string[];
}

export class ProjectInformationService {
  private static readonly DEFAULT_DETAILS: ProjectDetails = {
    name: 'New Project',
    description: '',
    startDate: new Date().toISOString().split('T')[0] || '',
    endDate: '',
    owner: '',
    client: '',
    referenceId: 'PRJ-2024-001'
  };

  private static readonly DEFAULT_NOTES: ProjectNotes = {
    content: '',
    lastEdited: '',
    editor: ''
  };

  private static readonly DEFAULT_STATUS: ProjectStatus = 'Not Started';

  /**
   * Get project information
   */
  static async getProjectInformation(projectId: string = 'default'): Promise<ProjectInformationResult> {
    try {
      const savedInfo = await persistentStorage.getSetting(`project_info_${projectId}`, 'project');
      
      if (savedInfo && typeof savedInfo === 'object') {
        const info = savedInfo as ProjectInformation;
        return {
          success: true,
          data: info,
          errors: []
        };
      }
      
      // Return default information
      const defaultInfo: ProjectInformation = {
        details: { ...this.DEFAULT_DETAILS },
        notes: { ...this.DEFAULT_NOTES },
        status: this.DEFAULT_STATUS,
        statusHistory: []
      };
      
      return {
        success: true,
        data: defaultInfo,
        errors: []
      };
    } catch (error) {
      console.error('Failed to get project information:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Save project information
   */
  static async saveProjectInformation(
    info: ProjectInformation, 
    projectId: string = 'default'
  ): Promise<boolean> {
    try {
      await persistentStorage.setSetting(`project_info_${projectId}`, info, 'project');
      
      // Log demo state changes
      if (projectId.includes('demo')) {
        console.log('Demo project information updated:', info);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save project information:', error);
      return false;
    }
  }

  /**
   * Update project details
   */
  static async updateProjectDetails(
    details: ProjectDetails, 
    projectId: string = 'default'
  ): Promise<ProjectInformationResult> {
    try {
      const currentInfo = await this.getProjectInformation(projectId);
      
      if (!currentInfo.success || !currentInfo.data) {
        return {
          success: false,
          errors: ['Failed to load current project information']
        };
      }

      // Handle demo mode reference ID
      let updatedDetails = { ...details };
      if (details.demo && !details.referenceId.includes('(demo)')) {
        updatedDetails.referenceId = `${details.referenceId} (demo)`;
      }

      const updatedInfo: ProjectInformation = {
        ...currentInfo.data,
        details: updatedDetails
      };

      const success = await this.saveProjectInformation(updatedInfo, projectId);
      
      if (success) {
        console.log('Demo project details updated:', updatedDetails);
      }

      return {
        success,
        data: updatedInfo,
        errors: []
      };
    } catch (error) {
      console.error('Failed to update project details:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update project notes
   */
  static async updateProjectNotes(
    notes: ProjectNotes, 
    projectId: string = 'default'
  ): Promise<ProjectInformationResult> {
    try {
      const currentInfo = await this.getProjectInformation(projectId);
      
      if (!currentInfo.success || !currentInfo.data) {
        return {
          success: false,
          errors: ['Failed to load current project information']
        };
      }

      const updatedInfo: ProjectInformation = {
        ...currentInfo.data,
        notes
      };

      const success = await this.saveProjectInformation(updatedInfo, projectId);
      
      if (success) {
        console.log('Demo project notes updated:', notes);
      }

      return {
        success,
        data: updatedInfo,
        errors: []
      };
    } catch (error) {
      console.error('Failed to update project notes:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Change project status
   */
  static async changeProjectStatus(
    status: ProjectStatus, 
    projectId: string = 'default'
  ): Promise<ProjectInformationResult> {
    try {
      const currentInfo = await this.getProjectInformation(projectId);
      
      if (!currentInfo.success || !currentInfo.data) {
        return {
          success: false,
          errors: ['Failed to load current project information']
        };
      }

      // Add to status history
      const statusEntry = {
        status,
        changedAt: new Date().toISOString(),
        changedBy: 'Current User', // In a real app, this would come from auth context
        demo: projectId.includes('demo')
      };

      const updatedInfo: ProjectInformation = {
        ...currentInfo.data,
        status,
        statusHistory: [
          statusEntry,
          ...currentInfo.data.statusHistory
        ].slice(0, 10) // Keep last 10 status changes
      };

      const success = await this.saveProjectInformation(updatedInfo, projectId);
      
      if (success) {
        console.log('Demo project status changed to:', status);
      }

      return {
        success,
        data: updatedInfo,
        errors: []
      };
    } catch (error) {
      console.error('Failed to change project status:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get project details only
   */
  static async getProjectDetails(projectId: string = 'default'): Promise<ProjectDetails | null> {
    try {
      const result = await this.getProjectInformation(projectId);
      return result.success && result.data ? result.data.details : null;
    } catch (error) {
      console.error('Failed to get project details:', error);
      return null;
    }
  }

  /**
   * Get project notes only
   */
  static async getProjectNotes(projectId: string = 'default'): Promise<ProjectNotes | null> {
    try {
      const result = await this.getProjectInformation(projectId);
      return result.success && result.data ? result.data.notes : null;
    } catch (error) {
      console.error('Failed to get project notes:', error);
      return null;
    }
  }

  /**
   * Get project status only
   */
  static async getProjectStatus(projectId: string = 'default'): Promise<ProjectStatus> {
    try {
      const result = await this.getProjectInformation(projectId);
      return result.success && result.data ? result.data.status : this.DEFAULT_STATUS;
    } catch (error) {
      console.error('Failed to get project status:', error);
      return this.DEFAULT_STATUS;
    }
  }

  /**
   * Get status history
   */
  static async getStatusHistory(projectId: string = 'default'): Promise<Array<{
    status: ProjectStatus;
    changedAt: string;
    changedBy: string;
    demo?: boolean;
  }>> {
    try {
      const result = await this.getProjectInformation(projectId);
      return result.success && result.data ? result.data.statusHistory : [];
    } catch (error) {
      console.error('Failed to get status history:', error);
      return [];
    }
  }

  /**
   * Reset project information to defaults
   */
  static async resetProjectInformation(projectId: string = 'default'): Promise<boolean> {
    try {
      const defaultInfo: ProjectInformation = {
        details: { ...this.DEFAULT_DETAILS },
        notes: { ...this.DEFAULT_NOTES },
        status: this.DEFAULT_STATUS,
        statusHistory: []
      };

      const success = await this.saveProjectInformation(defaultInfo, projectId);
      
      if (success) {
        console.log('Demo project information reset to defaults');
      }

      return success;
    } catch (error) {
      console.error('Failed to reset project information:', error);
      return false;
    }
  }

  /**
   * Validate project details
   */
  static validateProjectDetails(details: ProjectDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!details.name.trim()) {
      errors.push('Project name is required');
    }
    
    if (details.startDate && details.endDate) {
      const startDate = new Date(details.startDate);
      const endDate = new Date(details.endDate);
      
      if (startDate > endDate) {
        errors.push('Start date cannot be after end date');
      }
    }
    
    if (details.referenceId && details.referenceId.length > 50) {
      errors.push('Reference ID must be 50 characters or less');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default project information
   */
  static getDefaultProjectInformation(): ProjectInformation {
    return {
      details: { ...this.DEFAULT_DETAILS },
      notes: { ...this.DEFAULT_NOTES },
      status: this.DEFAULT_STATUS,
      statusHistory: []
    };
  }
} 