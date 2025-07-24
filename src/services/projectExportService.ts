import type { Task } from './ganttTaskService';
import type { Baseline } from './baselineService';

export interface ProjectExport {
  baselines?: Baseline[];
  exportedAt: Date;
  metadata: {
    exportFormat: 'json' | 'xml' | 'csv';
    projectEndDate: Date;
    projectStartDate: Date;
    totalCost: number;
    totalDuration: number;
    totalTasks: number;
  };
  projectDescription?: string;
  projectName: string;
  tasks: Task[];
  version: string;
}

export interface ExportOptions {
  filename?: string;
  format?: 'json' | 'xml' | 'csv';
  includeBaselines?: boolean;
  includeMetadata?: boolean;
}

export class ProjectExportService {
  private static instance: ProjectExportService;

  static getInstance(): ProjectExportService {
    if (!ProjectExportService.instance) {
      ProjectExportService.instance = new ProjectExportService();
    }
    return ProjectExportService.instance;
  }

  /**
   * Export project to JSON format
   */
  exportToJSON(
    tasks: Task[],
    projectName: string = 'Project',
    projectDescription?: string,
    options: ExportOptions = {}
  ): string {
    const exportData: ProjectExport = {
      version: '1.0',
      exportedAt: new Date(),
      projectName,
      ...(projectDescription && { projectDescription }),
      tasks,
      metadata: {
        totalTasks: tasks.length,
        totalDuration: this.getProjectDuration(tasks),
        totalCost: this.getProjectCost(tasks),
        projectStartDate: this.getProjectStartDate(tasks),
        projectEndDate: this.getProjectEndDate(tasks),
        exportFormat: 'json'
      }
    };

    if (options.includeBaselines) {
      // Import baseline service to get baselines
      import('./baselineService').then(({ baselineService }) => {
        exportData.baselines = baselineService.getAllBaselines();
      });
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export project to XML format
   */
  exportToXML(
    tasks: Task[],
    projectName: string = 'Project',
    projectDescription?: string,
    options: ExportOptions = {}
  ): string {
    const projectStartDate = this.getProjectStartDate(tasks);
    const projectEndDate = this.getProjectEndDate(tasks);
    const totalDuration = this.getProjectDuration(tasks);
    const totalCost = this.getProjectCost(tasks);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<project version="1.0" exportedAt="${new Date().toISOString()}">
  <metadata>
    <name>${this.escapeXml(projectName)}</name>
    ${projectDescription ? `<description>${this.escapeXml(projectDescription)}</description>` : ''}
    <totalTasks>${tasks.length}</totalTasks>
    <totalDuration>${totalDuration}</totalDuration>
    <totalCost>${totalCost}</totalCost>
    <projectStartDate>${projectStartDate.toISOString()}</projectStartDate>
    <projectEndDate>${projectEndDate.toISOString()}</projectEndDate>
    <exportFormat>xml</exportFormat>
  </metadata>
  <tasks>`;

    tasks.forEach(task => {
      xml += `
    <task id="${task.id}">
      <name>${this.escapeXml(task.name)}</name>
      <startDate>${task.startDate.toISOString()}</startDate>
      <endDate>${task.endDate.toISOString()}</endDate>
      <duration>${task.duration}</duration>
      <percentComplete>${task.percentComplete}</percentComplete>
      <status>${task.status}</status>
      <level>${task.level}</level>
      ${task.parentId ? `<parentId>${task.parentId}</parentId>` : ''}
      ${task.taskType ? `<taskType>${task.taskType}</taskType>` : ''}
      ${task.priority ? `<priority>${task.priority}</priority>` : ''}
      ${task.assignedTo ? `<assignedTo>${this.escapeXml(task.assignedTo)}</assignedTo>` : ''}
      ${task.cost ? `<cost>${task.cost}</cost>` : ''}
      ${task.notes ? `<notes>${this.escapeXml(task.notes)}</notes>` : ''}
      ${task.children && task.children.length > 0 ? `<children>${task.children.map(id => `<child>${id}</child>`).join('')}</children>` : ''}
      ${task.predecessors && task.predecessors.length > 0 ? `<predecessors>${task.predecessors.map(id => `<predecessor>${id}</predecessor>`).join('')}</predecessors>` : ''}
      ${task.successors && task.successors.length > 0 ? `<successors>${task.successors.map(id => `<successor>${id}</successor>`).join('')}</successors>` : ''}
      ${task.resources && task.resources.length > 0 ? `<resources>${task.resources.map(id => `<resource>${id}</resource>`).join('')}</resources>` : ''}
      ${task.constraints ? `<constraints type="${task.constraints.type}">${task.constraints.date.toISOString()}</constraints>` : ''}
    </task>`;
    });

    xml += `
  </tasks>
</project>`;

    return xml;
  }

  /**
   * Export project to CSV format
   */
  exportToCSV(
    tasks: Task[],
    projectName: string = 'Project',
    options: ExportOptions = {}
  ): string {
    const headers = [
      'ID',
      'Name',
      'Start Date',
      'End Date',
      'Duration',
      'Percent Complete',
      'Status',
      'Level',
      'Parent ID',
      'Task Type',
      'Priority',
      'Assigned To',
      'Cost',
      'Predecessors',
      'Successors',
      'Resources',
      'Notes'
    ];

    const csvRows = [headers.join(',')];

    tasks.forEach(task => {
      const row = [
        task.id,
        `"${task.name.replace(/"/g, '""')}"`,
        task.startDate.toISOString().split('T')[0],
        task.endDate.toISOString().split('T')[0],
        task.duration,
        task.percentComplete,
        task.status,
        task.level,
        task.parentId || '',
        task.taskType || '',
        task.priority || '',
        `"${(task.assignedTo || '').replace(/"/g, '""')}"`,
        task.cost || 0,
        `"${(task.predecessors || []).join(';')}"`,
        `"${(task.successors || []).join(';')}"`,
        `"${(task.resources || []).join(';')}"`,
        `"${(task.notes || '').replace(/"/g, '""')}"`
      ];

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Import project from JSON
   */
  async importFromJSON(jsonData: string): Promise<{ projectDescription?: string, projectName: string; tasks: Task[]; }> {
    try {
      const data: ProjectExport = JSON.parse(jsonData);
      
      // Validate required fields
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid project data: tasks array is required');
      }

      // Convert date strings back to Date objects
      const tasks = data.tasks.map(task => ({
        ...task,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        ...(task.constraints && {
          constraints: {
            ...task.constraints,
            date: new Date(task.constraints.date)
          }
        })
      }));

      return {
        tasks,
        projectName: data.projectName || 'Imported Project',
        ...(data.projectDescription && { projectDescription: data.projectDescription })
      };
    } catch (error) {
      throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import project from XML
   */
  async importFromXML(xmlData: string): Promise<{ projectDescription?: string, projectName: string; tasks: Task[]; }> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
      
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML format');
      }

      const projectName = xmlDoc.querySelector('metadata name')?.textContent || 'Imported Project';
      const projectDescription = xmlDoc.querySelector('metadata description')?.textContent;

      const taskElements = xmlDoc.querySelectorAll('task');
      const tasks: Task[] = [];

      taskElements.forEach(taskElement => {
        const task: Task = {
          id: taskElement.getAttribute('id') || '',
          name: taskElement.querySelector('name')?.textContent || '',
          startDate: new Date(taskElement.querySelector('startDate')?.textContent || ''),
          endDate: new Date(taskElement.querySelector('endDate')?.textContent || ''),
          duration: parseInt(taskElement.querySelector('duration')?.textContent || '0'),
          percentComplete: parseInt(taskElement.querySelector('percentComplete')?.textContent || '0'),
          status: (taskElement.querySelector('status')?.textContent as any) || 'not-started',
          level: parseInt(taskElement.querySelector('level')?.textContent || '0'),
          parentId: taskElement.querySelector('parentId')?.textContent,
          taskType: (taskElement.querySelector('taskType')?.textContent as any),
          priority: (taskElement.querySelector('priority')?.textContent as any),
          assignedTo: taskElement.querySelector('assignedTo')?.textContent,
          cost: parseFloat(taskElement.querySelector('cost')?.textContent || '0'),
          notes: taskElement.querySelector('notes')?.textContent,
          predecessors: Array.from(taskElement.querySelectorAll('predecessors predecessor')).map(el => el.textContent || ''),
          successors: Array.from(taskElement.querySelectorAll('successors successor')).map(el => el.textContent || ''),
          resources: Array.from(taskElement.querySelectorAll('resources resource')).map(el => el.textContent || ''),
          children: Array.from(taskElement.querySelectorAll('children child')).map(el => el.textContent || ''),
          isExpanded: true,
          isSelected: false
        };

        // Handle constraints
        const constraintsElement = taskElement.querySelector('constraints');
        if (constraintsElement) {
          task.constraints = {
            type: (constraintsElement.getAttribute('type') as any) || 'start-no-earlier-than',
            date: new Date(constraintsElement.textContent || '')
          };
        }

        tasks.push(task);
      });

      return {
        tasks,
        projectName,
        projectDescription
      };
    } catch (error) {
      throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import project from CSV
   */
  async importFromCSV(csvData: string): Promise<{ projectName: string, tasks: Task[]; }> {
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const tasks: Task[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        const task: Task = {
          id: values[0] || '',
          name: values[1]?.replace(/^"|"$/g, '') || '',
          startDate: new Date(values[2] || ''),
          endDate: new Date(values[3] || ''),
          duration: parseInt(values[4]) || 0,
          percentComplete: parseInt(values[5]) || 0,
          status: (values[6] as any) || 'not-started',
          level: parseInt(values[7]) || 0,
          parentId: values[8] || undefined,
          taskType: (values[9] as any),
          priority: (values[10] as any),
          assignedTo: values[11]?.replace(/^"|"$/g, ''),
          cost: parseFloat(values[12]) || 0,
          predecessors: values[13]?.replace(/^"|"$/g, '').split(';').filter(Boolean) || [],
          successors: values[14]?.replace(/^"|"$/g, '').split(';').filter(Boolean) || [],
          resources: values[15]?.replace(/^"|"$/g, '').split(';').filter(Boolean) || [],
          notes: values[16]?.replace(/^"|"$/g, ''),
          isExpanded: true,
          isSelected: false
        };

        tasks.push(task);
      }

      return {
        tasks,
        projectName: 'Imported Project'
      };
    } catch (error) {
      throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download project file
   */
  downloadProject(
    tasks: Task[],
    projectName: string = 'Project',
    projectDescription?: string,
    options: ExportOptions = {}
  ): void {
    const format = options.format || 'json';
    let content: string;
    let filename = options.filename || `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;

    switch (format) {
      case 'json':
        content = this.exportToJSON(tasks, projectName, projectDescription, options);
        break;
      case 'xml':
        content = this.exportToXML(tasks, projectName, projectDescription, options);
        break;
      case 'csv':
        content = this.exportToCSV(tasks, projectName, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const blob = new Blob([content], { type: this.getMimeType(format) });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get MIME type for export format
   */
  private getMimeType(format: string): string {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      case 'csv':
        return 'text/csv';
      default:
        return 'text/plain';
    }
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Parse CSV line with proper handling of quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  /**
   * Get project start date
   */
  private getProjectStartDate(tasks: Task[]): Date {
    if (tasks.length === 0) return new Date();
    
    const startDates = tasks.map(task => task.startDate);
    return new Date(Math.min(...startDates.map(date => date.getTime())));
  }

  /**
   * Get project end date
   */
  private getProjectEndDate(tasks: Task[]): Date {
    if (tasks.length === 0) return new Date();
    
    const endDates = tasks.map(task => task.endDate);
    return new Date(Math.max(...endDates.map(date => date.getTime())));
  }

  /**
   * Get project duration
   */
  private getProjectDuration(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const startDate = this.getProjectStartDate(tasks);
    const endDate = this.getProjectEndDate(tasks);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Get project total cost
   */
  private getProjectCost(tasks: Task[]): number {
    return tasks.reduce((total, task) => total + (task.cost || 0), 0);
  }
}

export const projectExportService = ProjectExportService.getInstance(); 