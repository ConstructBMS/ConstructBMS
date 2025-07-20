import { supabase } from './supabase';
import { loggingService } from './loggingService';

// Types for layout persistence
export interface LayoutState {
  id?: string;
  userId: string;
  projectId?: string;
  sidebarCollapsed: boolean;
  viewMode: 'gantt' | 'timeline' | 'calendar' | 'resource' | 'cost';
  userRole: 'admin' | 'project_manager' | 'scheduler' | 'viewer';
  lastActive: Date;
  preferences: {
    autoSave: boolean;
    autoSaveInterval: number; // seconds
    theme: 'light' | 'dark' | 'auto';
    ribbonVisible: boolean;
    statusBarVisible: boolean;
    gridLines: boolean;
    criticalPathHighlight: boolean;
    resourceOverloadWarning: boolean;
  };
}

export interface ProjectState {
  id: string;
  name: string;
  client: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  lastModified: Date;
  createdBy: string;
  assignedTo?: string;
  budget?: number;
  actualCost?: number;
  progress: number;
}

class AstaLayoutService {
  private currentState: LayoutState | null = null;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  // Initialize layout state for a user
  async initializeLayout(userId: string): Promise<LayoutState> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    this.currentState = {
      userId,
      sidebarCollapsed: false,
      viewMode: 'gantt',
      userRole: 'project_manager',
      lastActive: new Date(),
      preferences: {
        autoSave: true,
        autoSaveInterval: 30,
        theme: 'auto',
        ribbonVisible: true,
        statusBarVisible: true,
        gridLines: true,
        criticalPathHighlight: true,
        resourceOverloadWarning: true
      }
    };

    // Start auto-save timer
    this.startAutoSave();

    return this.currentState;
  }

  // Save layout state to Supabase
  async saveLayoutState(): Promise<void> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    // Version: 2024-12-19-03-10 - All database calls disabled
    console.log('Simulating layout state save');
  }

  // Update layout state
  async updateLayoutState(updates: Partial<LayoutState>): Promise<void> {
    if (!this.currentState) return;

    this.currentState = { ...this.currentState, ...updates };
    this.currentState.lastActive = new Date();

    // Save immediately for critical updates
    if (updates.projectId || updates.viewMode || updates.userRole) {
      await this.saveLayoutState();
    }
  }

  // Get current layout state
  getCurrentState(): LayoutState | null {
    return this.currentState;
  }

  // Set active project
  async setActiveProject(project: ProjectState | null): Promise<void> {
    const updates: Partial<LayoutState> = {};
    if (project?.id) {
      updates.projectId = project.id;
    } else {
      updates.projectId = undefined as any;
    }
    await this.updateLayoutState(updates);
  }

  // Set view mode
  async setViewMode(viewMode: LayoutState['viewMode']): Promise<void> {
    await this.updateLayoutState({ viewMode });
  }

  // Set sidebar collapsed state
  async setSidebarCollapsed(collapsed: boolean): Promise<void> {
    await this.updateLayoutState({ sidebarCollapsed: collapsed });
  }

  // Set user role
  async setUserRole(role: LayoutState['userRole']): Promise<void> {
    await this.updateLayoutState({ userRole: role });
  }

  // Update preferences
  async updatePreferences(preferences: Partial<LayoutState['preferences']>): Promise<void> {
    if (!this.currentState) return;

    const updatedPreferences = { ...this.currentState.preferences, ...preferences };
    await this.updateLayoutState({ preferences: updatedPreferences });
  }

  // Start auto-save timer
  private startAutoSave(): void {
    if (!this.currentState?.preferences.autoSave) return;

    this.autoSaveTimer = setInterval(() => {
      this.saveLayoutState();
    }, this.currentState.preferences.autoSaveInterval * 1000);
  }

  // Stop auto-save timer
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Cleanup
  cleanup(): void {
    this.stopAutoSave();
    this.currentState = null;
  }

  // Load project data
  async loadProject(projectId: string): Promise<ProjectState | null> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return null;
  }

  // Save project data
  async saveProject(project: ProjectState): Promise<void> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    console.log(`Simulating project save: ${project.name}`);
  }

  // Get user's recent projects
  async getRecentProjects(userId: string, limit: number = 10): Promise<ProjectState[]> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return [];
  }

  // Export project data
  async exportProject(projectId: string, format: 'json' | 'xml' | 'csv' = 'json'): Promise<string> {
    try {
      const project = await this.loadProject(projectId);
      if (!project) throw new Error('Project not found');

      switch (format) {
        case 'json':
          return JSON.stringify(project, null, 2);
        case 'xml':
          return this.convertToXML(project);
        case 'csv':
          return this.convertToCSV(project);
        default:
          return JSON.stringify(project, null, 2);
      }
    } catch (error) {
      console.error('Failed to export project:', error);
      loggingService.error('AstaLayoutService.exportProject', error as Error);
      throw error;
    }
  }

  // Import project data
  async importProject(data: string, format: 'json' | 'xml' | 'csv' = 'json'): Promise<ProjectState> {
    try {
      let project: ProjectState;

      switch (format) {
        case 'json':
          project = JSON.parse(data);
          break;
        case 'xml':
          project = this.parseFromXML(data);
          break;
        case 'csv':
          project = this.parseFromCSV(data);
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Validate project data
      if (!project.name || !project.client) {
        throw new Error('Invalid project data');
      }

      // Save to database
      await this.saveProject(project);

      return project;
    } catch (error) {
      console.error('Failed to import project:', error);
      loggingService.error('AstaLayoutService.importProject', error as Error);
      throw error;
    }
  }

  // Helper methods for data conversion
  private convertToXML(project: ProjectState): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project>
  <id>${project.id}</id>
  <name>${project.name}</name>
  <client>${project.client}</client>
  <startDate>${project.startDate.toISOString()}</startDate>
  <endDate>${project.endDate.toISOString()}</endDate>
  <status>${project.status}</status>
  <progress>${project.progress}</progress>
</project>`;
  }

  private convertToCSV(project: ProjectState): string {
    return `id,name,client,startDate,endDate,status,progress
${project.id},"${project.name}","${project.client}",${project.startDate.toISOString()},${project.endDate.toISOString()},${project.status},${project.progress}`;
  }

  private parseFromXML(xmlData: string): ProjectState {
    // Simple XML parsing - in production, use a proper XML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    
    return {
      id: xmlDoc.querySelector('id')?.textContent || '',
      name: xmlDoc.querySelector('name')?.textContent || '',
      client: xmlDoc.querySelector('client')?.textContent || '',
      startDate: new Date(xmlDoc.querySelector('startDate')?.textContent || ''),
      endDate: new Date(xmlDoc.querySelector('endDate')?.textContent || ''),
      status: (xmlDoc.querySelector('status')?.textContent as any) || 'planning',
      lastModified: new Date(),
      createdBy: '',
      progress: parseFloat(xmlDoc.querySelector('progress')?.textContent || '0')
    };
  }

  private parseFromCSV(csvData: string): ProjectState {
    const lines = csvData.split('\n');
    const headers = lines[0]?.split(',') || [];
    const values = lines[1]?.split(',') || [];
    
    const project: any = {};
    headers.forEach((header, index) => {
      project[header.trim()] = values[index]?.trim().replace(/"/g, '') || '';
    });

    return {
      id: project.id || '',
      name: project.name || '',
      client: project.client || '',
      startDate: new Date(project.startDate || ''),
      endDate: new Date(project.endDate || ''),
      status: project.status || 'planning',
      lastModified: new Date(),
      createdBy: '',
      progress: parseFloat(project.progress || '0')
    };
  }
}

// Create singleton instance
export const astaLayoutService = new AstaLayoutService(); 