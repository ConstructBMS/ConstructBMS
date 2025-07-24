import { persistentStorage } from './persistentStorage';
import type { ParsedProgramme } from '../components/modules/ribbonTabs/ImportAstaModal';
import type { AstaExportSettings } from '../components/modules/ribbonTabs/ExportAstaModal';

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

export class ImportExportService {
  /**
   * Import Asta programme data
   */
  static async importAstaData(
    parsedData: ParsedProgramme,
    projectId: string = 'demo'
  ): Promise<ImportExportResult> {
    try {
      // Get current project data
      const currentTasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const projectConfig = await persistentStorage.getSetting(`project_${projectId}`, 'config') || {};

      // Convert parsed data to our format
      const importedTasks = parsedData.sampleTasks.map((task, index) => ({
        id: `imported_${Date.now()}_${index}`,
        name: task.name,
        startDate: task.startDate,
        duration: task.duration,
        finishDate: this.calculateFinishDate(task.startDate, task.duration),
        progress: 0,
        level: 0,
        order: currentTasks.length + index,
        importedFrom: 'asta',
        demo: projectId.includes('demo'),
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
        demo: projectId.includes('demo')
      };

      await persistentStorage.setSetting(`project_${projectId}`, projectConfig, 'config');

      // Log import activity
      await this.logImportActivity(projectId, parsedData);

      if (projectId.includes('demo')) {
        console.log('Demo Asta data imported:', importedTasks.length, 'tasks');
      }

      return {
        success: true,
        data: {
          tasksImported: importedTasks.length,
          totalTasks: updatedTasks.length
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
   * Export programme to Asta format
   */
  static async exportToAsta(
    settings: AstaExportSettings,
    projectId: string = 'demo'
  ): Promise<ExportResult> {
    try {
      // Get current programme data
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const projectConfig = await persistentStorage.getSetting(`project_${projectId}`, 'config') || {};
      const baselines = await persistentStorage.getSetting(`baselines_${projectId}`, 'baselines') || [];
      const calendars = await persistentStorage.getSetting(`calendars_${projectId}`, 'calendars') || [];

      // Generate Asta-compatible data
      const astaData = this.generateAstaData(tasks, projectConfig, baselines, calendars, settings);

      // Create file blob
      const blob = this.createAstaFile(astaData, settings.fileType);
      const fileName = this.generateFileName(projectConfig.name || 'Project', settings.fileType);

      // Trigger download
      this.downloadFile(blob, fileName);

      // Log export activity
      await this.logExportActivity(projectId, settings, fileName);

      if (projectId.includes('demo')) {
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
   * Export programme to Excel
   */
  static async exportToExcel(projectId: string = 'demo'): Promise<ExportResult> {
    try {
      // Get current programme data
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const projectConfig = await persistentStorage.getSetting(`project_${projectId}`, 'config') || {};

      // Generate Excel data
      const excelData = this.generateExcelData(tasks, projectConfig);
      
      // Create Excel file (simplified - in real app would use a library like xlsx)
      const blob = new Blob([JSON.stringify(excelData, null, 2)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const fileName = `${projectConfig.name || 'Project'}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Trigger download
      this.downloadFile(blob, fileName);

      // Log export activity
      await this.logExportActivity(projectId, { fileType: 'excel' }, fileName);

      if (projectId.includes('demo')) {
        console.log('Demo programme exported to Excel:', fileName);
      }

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        errors: []
      };
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Export programme to JSON
   */
  static async exportToJSON(projectId: string = 'demo'): Promise<ExportResult> {
    try {
      // Get all programme data
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const projectConfig = await persistentStorage.getSetting(`project_${projectId}`, 'config') || {};
      const baselines = await persistentStorage.getSetting(`baselines_${projectId}`, 'baselines') || [];
      const calendars = await persistentStorage.getSetting(`calendars_${projectId}`, 'calendars') || [];
      const customFields = await persistentStorage.getSetting(`customFields_${projectId}`, 'customFields') || [];

      // Create complete programme snapshot
      const programmeData = {
        project: projectConfig,
        tasks,
        baselines,
        calendars,
        customFields,
        exportInfo: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'ConstructBMS',
          version: '1.0',
          demo: projectId.includes('demo')
        }
      };

      // Create JSON file
      const blob = new Blob([JSON.stringify(programmeData, null, 2)], {
        type: 'application/json'
      });
      
      const fileName = `${projectConfig.name || 'Project'}_${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      this.downloadFile(blob, fileName);

      // Log export activity
      await this.logExportActivity(projectId, { fileType: 'json' }, fileName);

      if (projectId.includes('demo')) {
        console.log('Demo programme exported to JSON:', fileName);
      }

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        errors: []
      };
    } catch (error) {
      console.error('Failed to export to JSON:', error);
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get import/export history
   */
  static async getImportExportHistory(projectId: string = 'demo'): Promise<{
    imports: any[];
    exports: any[];
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const imports = activityLog.filter((log: any) => log.type === 'import');
      const exports = activityLog.filter((log: any) => log.type === 'export');

      return { imports, exports };
    } catch (error) {
      console.error('Failed to get import/export history:', error);
      return { imports: [], exports: [] };
    }
  }

  /**
   * Clear demo import/export data
   */
  static async clearDemoImportExportData(projectId: string = 'demo'): Promise<ImportExportResult> {
    try {
      // Remove imported tasks
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const liveTasks = tasks.filter((task: any) => !task.importedFrom || !task.demo);

      await persistentStorage.setSetting(`tasks_${projectId}`, liveTasks, 'tasks');

      // Clear import/export logs
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      const liveActivityLog = activityLog.filter((log: any) => !log.demo);

      await persistentStorage.setSetting(`activityLog_${projectId}`, liveActivityLog, 'activity');

      console.log('Demo import/export data cleared');

      return {
        success: true,
        errors: []
      };
    } catch (error) {
      console.error('Failed to clear demo import/export data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Helper methods
   */
  private static calculateFinishDate(startDate: string, duration: number): string {
    const start = new Date(startDate);
    const finish = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    return finish.toISOString().split('T')[0];
  }

  private static generateAstaData(tasks: any[], projectConfig: any, baselines: any[], calendars: any[], settings: AstaExportSettings): any {
    // This is a simplified implementation
    // In a real app, this would generate proper Asta-compatible XML/PP format
    return {
      project: {
        name: projectConfig.name || 'Project',
        startDate: projectConfig.startDate,
        endDate: projectConfig.endDate,
        generatedBy: 'ConstructBMS',
        generatedAt: new Date().toISOString()
      },
      tasks: settings.includeConstraints ? tasks : tasks.map(({ constraints, ...task }) => task),
      baselines: settings.includeBaselines ? baselines : [],
      calendars: settings.includeCalendars ? calendars : [],
      settings: {
        dateFormat: settings.dateFormat,
        includeNotes: settings.includeNotes,
        includeResources: settings.includeResources
      }
    };
  }

  private static createAstaFile(data: any, fileType: string): Blob {
    let content: string;
    let mimeType: string;

    switch (fileType) {
      case 'xml':
        content = this.generateXML(data);
        mimeType = 'application/xml';
        break;
      case 'csv':
        content = this.generateCSV(data);
        mimeType = 'text/csv';
        break;
      case 'pp':
        content = this.generatePP(data);
        mimeType = 'application/octet-stream';
        break;
      default:
        content = this.generateXML(data);
        mimeType = 'application/xml';
    }

    return new Blob([content], { type: mimeType });
  }

  private static generateXML(data: any): string {
    // Simplified XML generation
    return `<?xml version="1.0" encoding="UTF-8"?>
<asta>
  <project>
    <name>${data.project.name}</name>
    <startDate>${data.project.startDate}</startDate>
    <endDate>${data.project.endDate}</endDate>
  </project>
  <tasks>
    ${data.tasks.map((task: any) => `
    <task>
      <id>${task.id}</id>
      <name>${task.name}</name>
      <startDate>${task.startDate}</startDate>
      <duration>${task.duration}</duration>
    </task>`).join('')}
  </tasks>
</asta>`;
  }

  private static generateCSV(data: any): string {
    const headers = ['ID', 'Name', 'Start Date', 'Duration', 'Finish Date'];
    const rows = data.tasks.map((task: any) => [
      task.id,
      task.name,
      task.startDate,
      task.duration,
      task.finishDate
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private static generatePP(data: any): string {
    // Simplified PP format (would be more complex in real implementation)
    return JSON.stringify(data, null, 2);
  }

  private static generateExcelData(tasks: any[], projectConfig: any): any {
    // Simplified Excel data structure
    return {
      project: projectConfig,
      tasks: tasks.map(task => ({
        ID: task.id,
        Name: task.name,
        'Start Date': task.startDate,
        Duration: task.duration,
        'Finish Date': task.finishDate,
        Progress: task.progress || 0,
        Level: task.level || 0
      }))
    };
  }

  private static generateFileName(projectName: string, fileType: string): string {
    const date = new Date().toISOString().split('T')[0];
    const extension = fileType === 'pp' ? '.pp' : fileType === 'xml' ? '.xml' : '.csv';
    return `${projectName}_${date}${extension}`;
  }

  private static downloadFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static async logImportActivity(projectId: string, parsedData: ParsedProgramme): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `import_${Date.now()}`,
        type: 'import',
        source: 'asta',
        projectName: parsedData.projectName,
        taskCount: parsedData.taskCount,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log import activity:', error);
    }
  }

  private static async logExportActivity(projectId: string, settings: any, fileName: string): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `export_${Date.now()}`,
        type: 'export',
        format: settings.fileType || 'unknown',
        fileName,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  }
} 