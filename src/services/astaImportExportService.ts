import { supabase } from './supabase';
import { demoModeService } from './demoModeService';
import { auditTrailService } from './auditTrailService';
import { persistentStorage } from './persistentStorage';

// Asta field mapping interfaces
export interface AstaTask {
  id: string;
  name: string;
  startDate: string;
  finishDate: string;
  duration: number;
  percentComplete: number;
  isMilestone: boolean;
  dependencies: string[];
  calendarId?: string;
  structureLevel: number;
  originalId: string;
  originalStructure: string;
  sourceFileName: string;
  importedAt: string;
}

export interface AstaImportMetadata {
  taskId: string;
  importedFrom: 'Asta';
  originalId: string;
  originalStructure: string;
  sourceFileName: string;
  importedAt: string;
  demo: boolean;
}

export interface AstaExportSettings {
  fileType: 'xer' | 'mpx' | 'csv' | 'json';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeConstraints: boolean;
  includeBaselines: boolean;
  includeNotes: boolean;
  includeResources: boolean;
  includeCalendars: boolean;
  demo: boolean;
}

export interface ParsedAstaProgramme {
  projectName: string;
  taskCount: number;
  tasks: AstaTask[];
  constraints: any[];
  calendars: any[];
  resources: any[];
  importedFrom: 'Asta';
  demo: boolean;
}

export interface ImportExportResult {
  success: boolean;
  data?: any;
  errors: string[];
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  errors: string[];
}

class AstaImportExportService {
  private readonly maxDemoTasks = 10;
  private readonly maxDemoExports = 3;

  /**
   * Import Asta programme data with field mapping
   */
  async importAstaData(
    parsedData: ParsedAstaProgramme,
    projectId: string = 'demo'
  ): Promise<ImportExportResult> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode restrictions
      if (isDemoMode && parsedData.tasks.length > this.maxDemoTasks) {
        return {
          success: false,
          errors: [`Demo mode limited to ${this.maxDemoTasks} tasks. File contains ${parsedData.tasks.length} tasks.`]
        };
      }

      // Get current project data
      const currentTasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const projectConfig = await persistentStorage.getSetting(`project_${projectId}`, 'config') || {};

      // Map Asta fields to ConstructBMS task schema
      const importedTasks = parsedData.tasks.map((task, index) => ({
        id: `imported_${Date.now()}_${index}`,
        name: task.name,
        startDate: task.startDate,
        finishDate: task.finishDate,
        duration: task.duration,
        percentComplete: task.percentComplete,
        isMilestone: task.isMilestone,
        dependencies: task.dependencies,
        calendarId: task.calendarId,
        structureLevel: task.structureLevel,
        // Store original import metadata
        importedFrom: 'Asta',
        originalId: task.originalId,
        originalStructure: task.originalStructure,
        sourceFileName: task.sourceFileName,
        importedAt: task.importedAt,
        demo: isDemoMode,
        createdAt: new Date().toISOString()
      }));

      // Merge with existing tasks
      const updatedTasks = [...currentTasks, ...importedTasks];

      // Save updated tasks
      await persistentStorage.setSetting(`tasks_${projectId}`, updatedTasks, 'tasks');

      // Update project config
      projectConfig.lastImport = {
        source: 'asta',
        date: new Date().toISOString(),
        taskCount: importedTasks.length,
        projectName: parsedData.projectName,
        demo: isDemoMode
      };

      await persistentStorage.setSetting(`project_${projectId}`, projectConfig, 'config');

      // Log import activity to Supabase audit trail
      await this.logImportActivity(projectId, parsedData, importedTasks.length);

      // Log to audit trail service
      await auditTrailService.logAction(
        projectId,
        null,
        'asta_import',
        `Imported ${importedTasks.length} tasks from Asta file: ${parsedData.projectName}`,
        null,
        { importedTasks: importedTasks.length, sourceFile: parsedData.projectName }
      );

      if (isDemoMode) {
        console.log('Demo Asta data imported:', importedTasks.length, 'tasks');
      }

      return {
        success: true,
        data: {
          tasksImported: importedTasks.length,
          totalTasks: updatedTasks.length,
          demo: isDemoMode
        },
        errors: []
      };
    } catch (error) {
      console.error('Failed to import Asta data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Export programme to Asta-compatible format
   */
  async exportToAsta(
    settings: AstaExportSettings,
    projectId: string = 'demo'
  ): Promise<ExportResult> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode restrictions
      if (isDemoMode) {
        const exportCount = await this.getDemoExportCount(projectId);
        if (exportCount >= this.maxDemoExports) {
          return {
            success: false,
            fileName: '',
            fileSize: 0,
            errors: [`Demo mode limited to ${this.maxDemoExports} exports per session.`]
          };
        }
      }

      // Get current programme data
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const projectConfig = await persistentStorage.getSetting(`project_${projectId}`, 'config') || {};
      const baselines = await persistentStorage.getSetting(`baselines_${projectId}`, 'baselines') || [];
      const calendars = await persistentStorage.getSetting(`calendars_${projectId}`, 'calendars') || [];

      // Filter tasks by date range
      const filteredTasks = tasks.filter((task: any) => {
        const taskStart = new Date(task.startDate);
        return taskStart >= settings.dateRange.start && taskStart <= settings.dateRange.end;
      });

      // Generate Asta-compatible data
      const astaData = this.generateAstaData(filteredTasks, projectConfig, baselines, calendars, settings);

      // Create file blob
      const blob = this.createAstaFile(astaData, settings.fileType);
      const fileName = this.generateFileName(projectConfig.name || 'Project', settings.fileType);

      // Trigger download
      this.downloadFile(blob, fileName);

      // Log export activity
      await this.logExportActivity(projectId, settings, fileName, filteredTasks.length);

      // Log to audit trail service
      await auditTrailService.logAction(
        projectId,
        null,
        'asta_export',
        `Exported ${filteredTasks.length} tasks to Asta format: ${fileName}`,
        null,
        { exportedTasks: filteredTasks.length, fileName, format: settings.fileType }
      );

      if (isDemoMode) {
        await this.incrementDemoExportCount(projectId);
        console.log('Demo programme exported to Asta:', fileName);
      }

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        errors: []
      };
    } catch (error) {
      console.error('Failed to export to Asta:', error);
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Parse Asta file (CSV, MPX, JSON)
   */
  async parseAstaFile(file: File): Promise<ParsedAstaProgramme> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
          
          let parsedData: ParsedAstaProgramme;
          
          switch (fileExtension) {
            case '.csv':
              parsedData = this.parseCSV(content, file.name);
              break;
            case '.json':
              parsedData = this.parseJSON(content, file.name);
              break;
            case '.mpx':
              parsedData = this.parseMPX(content, file.name);
              break;
            default:
              throw new Error(`Unsupported file format: ${fileExtension}`);
          }
          
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Get import/export history
   */
  async getImportExportHistory(projectId: string = 'demo'): Promise<{
    imports: any[];
    exports: any[];
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const imports = activityLog.filter((log: any) => log.type === 'asta_import');
      const exports = activityLog.filter((log: any) => log.type === 'asta_export');

      return { imports, exports };
    } catch (error) {
      console.error('Failed to get import/export history:', error);
      return { imports: [], exports: [] };
    }
  }

  // Private helper methods

  private generateAstaData(tasks: any[], projectConfig: any, baselines: any[], calendars: any[], settings: AstaExportSettings): any {
    return {
      project: {
        name: projectConfig.name || 'Project',
        startDate: projectConfig.startDate,
        endDate: projectConfig.endDate,
        generatedBy: 'ConstructBMS',
        generatedAt: new Date().toISOString(),
        demo: settings.demo
      },
      tasks: settings.includeConstraints ? tasks : tasks.map(({ constraints, ...task }) => task),
      baselines: settings.includeBaselines ? baselines : [],
      calendars: settings.includeCalendars ? calendars : [],
      settings: {
        dateFormat: 'dd/mm/yyyy',
        includeNotes: settings.includeNotes,
        includeResources: settings.includeResources
      }
    };
  }

  private createAstaFile(data: any, fileType: string): Blob {
    let content: string;
    let mimeType: string;

    switch (fileType) {
      case 'xer':
        content = this.generateXER(data);
        mimeType = 'application/xml';
        break;
      case 'mpx':
        content = this.generateMPX(data);
        mimeType = 'application/octet-stream';
        break;
      case 'csv':
        content = this.generateCSV(data);
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        break;
      default:
        content = this.generateCSV(data);
        mimeType = 'text/csv';
    }

    return new Blob([content], { type: mimeType });
  }

  private generateXER(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<AstaProject>
  <ProjectInfo>
    <Name>${data.project.name}</Name>
    <ExportDate>${data.project.generatedAt}</ExportDate>
    <Version>1.0</Version>
  </ProjectInfo>
  
  <Tasks>
    ${data.tasks.map((task: any) => `
    <Task>
      <ID>${task.id}</ID>
      <Name>${task.name}</Name>
      <StartDate>${task.startDate}</StartDate>
      <EndDate>${task.finishDate}</EndDate>
      <Duration>${task.duration || 0}</Duration>
      <Progress>${task.percentComplete || 0}</Progress>
      <IsMilestone>${task.isMilestone ? 'true' : 'false'}</IsMilestone>
    </Task>`).join('')}
  </Tasks>
</AstaProject>`;
  }

  private generateMPX(data: any): string {
    // Simplified MPX format
    return `Microsoft Project
Version,14
ProjectName,${data.project.name}
StartDate,${data.project.startDate}
EndDate,${data.project.endDate}
Tasks
${data.tasks.map((task: any) => 
  `${task.id},${task.name},${task.startDate},${task.finishDate},${task.duration},${task.percentComplete}`
).join('\n')}`;
  }

  private generateCSV(data: any): string {
    const headers = ['Task ID', 'Name', 'Start Date', 'Finish Date', 'Duration', 'Progress', 'Is Milestone'];
    const rows = data.tasks.map((task: any) => [
      task.id,
      task.name,
      task.startDate,
      task.finishDate,
      task.duration || 0,
      task.percentComplete || 0,
      task.isMilestone ? 'Yes' : 'No'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private parseCSV(content: string, fileName: string): ParsedAstaProgramme {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const tasks: AstaTask[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const task: AstaTask = {
        id: values[0] || '',
        name: values[1] || '',
        startDate: values[2] || new Date().toISOString(),
        finishDate: values[3] || new Date().toISOString(),
        duration: parseInt(values[4]) || 0,
        percentComplete: parseInt(values[5]) || 0,
        isMilestone: values[6] === 'Yes',
        dependencies: [],
        structureLevel: 0,
        originalId: values[0] || '',
        originalStructure: '',
        sourceFileName: fileName,
        importedAt: new Date().toISOString()
      };
      tasks.push(task);
    }

    return {
      projectName: fileName.replace(/\.[^/.]+$/, ''),
      taskCount: tasks.length,
      tasks,
      constraints: [],
      calendars: [],
      resources: [],
      importedFrom: 'Asta',
      demo: false
    };
  }

  private parseJSON(content: string, fileName: string): ParsedAstaProgramme {
    const data = JSON.parse(content);
    return {
      projectName: data.projectName || fileName.replace(/\.[^/.]+$/, ''),
      taskCount: data.tasks?.length || 0,
      tasks: data.tasks || [],
      constraints: data.constraints || [],
      calendars: data.calendars || [],
      resources: data.resources || [],
      importedFrom: 'Asta',
      demo: false
    };
  }

  private parseMPX(content: string, fileName: string): ParsedAstaProgramme {
    // Simplified MPX parser
    const lines = content.split('\n');
    const tasks: AstaTask[] = [];
    let inTasksSection = false;

    for (const line of lines) {
      if (line.startsWith('Tasks')) {
        inTasksSection = true;
        continue;
      }
      if (inTasksSection && line.trim()) {
        const values = line.split(',');
        const task: AstaTask = {
          id: values[0] || '',
          name: values[1] || '',
          startDate: values[2] || new Date().toISOString(),
          finishDate: values[3] || new Date().toISOString(),
          duration: parseInt(values[4]) || 0,
          percentComplete: parseInt(values[5]) || 0,
          isMilestone: false,
          dependencies: [],
          structureLevel: 0,
          originalId: values[0] || '',
          originalStructure: '',
          sourceFileName: fileName,
          importedAt: new Date().toISOString()
        };
        tasks.push(task);
      }
    }

    return {
      projectName: fileName.replace(/\.[^/.]+$/, ''),
      taskCount: tasks.length,
      tasks,
      constraints: [],
      calendars: [],
      resources: [],
      importedFrom: 'Asta',
      demo: false
    };
  }

  private generateFileName(projectName: string, fileType: string): string {
    const date = new Date().toISOString().split('T')[0];
    const extension = fileType === 'xer' ? '.xer' : fileType === 'mpx' ? '.mpx' : fileType === 'json' ? '.json' : '.csv';
    return `${projectName}_${date}${extension}`;
  }

  private downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private async logImportActivity(projectId: string, parsedData: ParsedAstaProgramme, taskCount: number): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `asta_import_${Date.now()}`,
        type: 'asta_import',
        source: 'Asta',
        projectName: parsedData.projectName,
        taskCount,
        timestamp: new Date().toISOString(),
        demo: parsedData.demo
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log import activity:', error);
    }
  }

  private async logExportActivity(projectId: string, settings: AstaExportSettings, fileName: string, taskCount: number): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `asta_export_${Date.now()}`,
        type: 'asta_export',
        format: settings.fileType,
        fileName,
        taskCount,
        timestamp: new Date().toISOString(),
        demo: settings.demo
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  }

  async getDemoExportCount(projectId: string): Promise<number> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      const today = new Date().toISOString().split('T')[0];
      return activityLog.filter((log: any) => 
        log.type === 'asta_export' && 
        log.timestamp.startsWith(today) &&
        log.demo
      ).length;
    } catch (error) {
      return 0;
    }
  }

  private async incrementDemoExportCount(projectId: string): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      const exportCount = await this.getDemoExportCount(projectId);
      
      // Update or create demo export count
      const demoExportCount = activityLog.find((log: any) => log.type === 'demo_export_count');
      if (demoExportCount) {
        demoExportCount.count = exportCount + 1;
      } else {
        activityLog.push({
          id: `demo_export_count_${Date.now()}`,
          type: 'demo_export_count',
          count: 1,
          timestamp: new Date().toISOString()
        });
      }

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to increment demo export count:', error);
    }
  }
}

export const astaImportExportService = new AstaImportExportService(); 