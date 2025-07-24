import { supabase } from './supabase';
import { demoModeService } from './demoModeService';
import { multiProjectService, type ProjectInfo, type MultiProjectTask } from './multiProjectService';

export interface TimelineExportOptions {
  dateRange?: {
    end: Date;
    start: Date;
  };
  filters?: {
    assignee?: string[];
    priority?: string[];
    status?: string[];
    tags?: string[];
  };
  format: 'pdf' | 'png';
  includeBaseline: boolean;
  includeCriticalPath: boolean;
  includeDependencies: boolean;
  includeLogo: boolean;
  includeMilestones: boolean;
  multiProject?: {
    enabled: boolean;
    groupByProject: boolean;
    selectedProjects: string[];
  };
  orientation: 'portrait' | 'landscape';
  pageSize: 'A3' | 'A4' | 'A5';
  showFiltersAndDate: boolean;
  zoomLevel: 'days' | 'weeks' | 'months' | 'quarters';
}

export interface TimelineExportData {
  baseline?: {
    name: string;
    tasks: Array<{
      baselineEndDate: Date;
      baselineStartDate: Date;
      taskId: string;
    }>;
  };
  criticalPath?: {
    taskIds: string[];
  };
  dependencies: Array<{
    sourceId: string;
    targetId: string;
    type: string;
  }>;
  exportDate: Date;
  exportOptions: TimelineExportOptions;
  exportUser: string;
  filters: {
    assignee: string[];
    priority: string[];
    status: string[];
    tags: string[];
  };
  milestones: Array<{
    date: Date;
    id: string;
    name: string;
    projectId?: string;
    type: string;
  }>;
  multiProject?: {
    groupedTasks: { project: ProjectInfo; tasks: any[] }[];
    projects: ProjectInfo[];
  };
  projectId: string;
  projectName: string;
  tasks: Array<{
    assignee: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
    progress: number;
    priority: string;
    id: string;
    tags: string[];
    type: string;
    projectId?: string;
    projectName?: string;
    projectColor?: string;
  }>;
}

export interface TimelineExportResult {
  dataUrl?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
  success: boolean;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxTasksVisible: 10,
  maxProjectsViewable: 2,
  watermarkText: 'DEMO EXPORT',
  pngDisabled: true,
  pageSizeFixed: 'A4' as const,
  brandingRequired: true,
  tooltipMessage: 'Upgrade for full export features'
};

class TimelineExportService {
  private isDemoMode = false;

  constructor() {
    this.checkDemoMode();
  }

  private async checkDemoMode(): Promise<void> {
    this.isDemoMode = await demoModeService.isDemoMode();
  }

  /**
   * Get default export options
   */
  getDefaultExportOptions(): TimelineExportOptions {
    return {
      format: 'pdf',
      orientation: 'landscape',
      pageSize: 'A4',
      includeLogo: true,
      showFiltersAndDate: true,
      includeBaseline: false,
      includeCriticalPath: false,
      includeMilestones: true,
      includeDependencies: true,
      zoomLevel: 'weeks',
      multiProject: {
        enabled: false,
        selectedProjects: [],
        groupByProject: true
      }
    };
  }

  /**
   * Get demo mode restrictions
   */
  getDemoModeRestrictions(): string[] {
    return [
      `Maximum ${DEMO_MODE_CONFIG.maxTasksVisible} tasks visible in export`,
      'PNG export disabled (PDF only)',
      'Page size fixed to A4',
      'Branding cannot be disabled',
      'Watermarked with "DEMO EXPORT"',
      'Multi-project limited to 2 projects'
    ];
  }

  /**
   * Check if export is allowed in demo mode
   */
  canExportInDemoMode(options: TimelineExportOptions): boolean {
    if (!this.isDemoMode) return true;

    // Check format restriction
    if (options.format === 'png') {
      return false;
    }

    // Check page size restriction
    if (options.pageSize !== 'A4') {
      return false;
    }

    // Check branding requirement
    if (!options.includeLogo) {
      return false;
    }

    return true;
  }

  /**
   * Get timeline data for export
   */
  async getTimelineExportData(
    projectId: string,
    options: TimelineExportOptions
  ): Promise<TimelineExportData> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const exportUser = user?.email || 'Unknown User';

      // Get project info
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!projectData) {
        throw new Error('Project not found');
      }

      // Get tasks
      let tasksQuery = supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      // Apply filters if specified
      if (options.filters) {
        if (options.filters.status?.length) {
          tasksQuery = tasksQuery.in('status', options.filters.status);
        }
        if (options.filters.priority?.length) {
          tasksQuery = tasksQuery.in('priority', options.filters.priority);
        }
        if (options.filters.assignee?.length) {
          tasksQuery = tasksQuery.in('assigned_to', options.filters.assignee);
        }
      }

      const { data: tasksData } = await tasksQuery;

      // Get milestones if enabled
      let milestones: any[] = [];
      if (options.includeMilestones) {
        const { data: milestonesData } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', projectId);
        milestones = milestonesData || [];
      }

      // Get dependencies if enabled
      let dependencies: any[] = [];
      if (options.includeDependencies) {
        const { data: dependenciesData } = await supabase
          .from('task_dependencies')
          .select('*')
          .eq('project_id', projectId);
        dependencies = dependenciesData || [];
      }

      // Get baseline if enabled
      let baseline: any = null;
      if (options.includeBaseline) {
        const { data: baselineData } = await supabase
          .from('baselines')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .single();
        
        if (baselineData) {
          const { data: baselineTasksData } = await supabase
            .from('baseline_tasks')
            .select('*')
            .eq('baseline_id', baselineData.id);
          
          baseline = {
            ...baselineData,
            tasks: baselineTasksData || []
          };
        }
      }

      // Get critical path if enabled
      let criticalPath: any = null;
      if (options.includeCriticalPath) {
        // This would be calculated based on task dependencies
        // For now, we'll use a placeholder
        criticalPath = {
          taskIds: tasksData?.filter((task: any) => task.is_critical)?.map((task: any) => task.id) || []
        };
      }

      // Handle multi-project data
      let multiProjectData: any = null;
      if (options.multiProject?.enabled) {
        const selectedProjects = options.multiProject.selectedProjects;
        const projects = await multiProjectService.getAccessibleProjects();
        const filteredProjects = projects.filter(p => selectedProjects.includes(p.id));
        
        if (filteredProjects.length > 0) {
          const allTasks = await multiProjectService.getTasksForProjects(selectedProjects);
          const groupedTasks = multiProjectService.getTasksGroupedByProject();
          
          multiProjectData = {
            projects: filteredProjects,
            groupedTasks
          };
        }
      }

      // Apply demo mode restrictions
      let finalTasks = tasksData || [];
      if (this.isDemoMode && finalTasks.length > DEMO_MODE_CONFIG.maxTasksVisible) {
        finalTasks = finalTasks.slice(0, DEMO_MODE_CONFIG.maxTasksVisible);
      }

      const exportData: TimelineExportData = {
        projectName: projectData.name,
        projectId: projectData.id,
        exportDate: new Date(),
        exportUser,
        exportOptions: options,
        tasks: finalTasks.map((task: any) => ({
          id: task.id,
          name: task.name,
          startDate: new Date(task.start_date),
          endDate: new Date(task.end_date),
          status: task.status,
          progress: task.progress || 0,
          priority: task.priority,
          assignee: task.assigned_to,
          tags: task.tags || [],
          type: task.type,
          projectId: task.project_id,
          projectName: projectData.name,
          projectColor: '#3B82F6'
        })),
        milestones: milestones.map((milestone: any) => ({
          id: milestone.id,
          name: milestone.name,
          date: new Date(milestone.date),
          type: milestone.type,
          projectId: milestone.project_id
        })),
        dependencies: dependencies.map((dep: any) => ({
          sourceId: dep.source_task_id,
          targetId: dep.target_task_id,
          type: dep.dependency_type
        })),
        baseline,
        criticalPath,
        filters: options.filters || {
          status: [],
          priority: [],
          tags: [],
          assignee: []
        },
        multiProject: multiProjectData
      };

      return exportData;
    } catch (error) {
      console.error('Error getting timeline export data:', error);
      throw error;
    }
  }

  /**
   * Export timeline as PDF
   */
  async exportAsPDF(
    ganttElement: HTMLElement,
    options: TimelineExportOptions,
    exportData: TimelineExportData
  ): Promise<TimelineExportResult> {
    try {
      // Check demo mode restrictions
      if (!this.canExportInDemoMode(options)) {
        return {
          success: false,
          error: 'Export not allowed in demo mode with current options'
        };
      }

      // Import required libraries
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Prepare element for export
      const exportElement = this.prepareElementForExport(ganttElement, options, exportData);

      // Capture the element
      const canvas = await html2canvas.default(exportElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: exportElement.scrollWidth,
        height: exportElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Create PDF
      const pdf = new jsPDF.default({
        orientation: options.orientation,
        unit: 'mm',
        format: options.pageSize
      });

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 0.95);
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Add header
      if (options.includeLogo) {
        this.addPDFHeader(pdf, exportData, pageWidth);
      }

      // Add footer
      if (options.showFiltersAndDate) {
        this.addPDFFooter(pdf, exportData, pageWidth, pageHeight);
      }

      // Generate filename
      const fileName = this.generateFileName(exportData.projectName, 'pdf');

      // Save the PDF
      pdf.save(fileName);

      console.log('Timeline PDF export completed:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting timeline as PDF:', error);
      return { success: false, error: 'Failed to export as PDF' };
    }
  }

  /**
   * Export timeline as PNG
   */
  async exportAsPNG(
    ganttElement: HTMLElement,
    options: TimelineExportOptions,
    exportData: TimelineExportData
  ): Promise<TimelineExportResult> {
    try {
      // Check demo mode restrictions
      if (this.isDemoMode) {
        return {
          success: false,
          error: 'PNG export disabled in demo mode'
        };
      }

      // Import html2canvas
      const html2canvas = await import('html2canvas');

      // Prepare element for export
      const exportElement = this.prepareElementForExport(ganttElement, options, exportData);

      // Capture the element
      const canvas = await html2canvas.default(exportElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: exportElement.scrollWidth,
        height: exportElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png', 0.95);

      // Generate filename
      const fileName = this.generateFileName(exportData.projectName, 'png');

      // Download the file
      this.downloadFile(dataUrl, fileName);

      console.log('Timeline PNG export completed:', fileName);
      return { success: true, dataUrl, fileName };
    } catch (error) {
      console.error('Error exporting timeline as PNG:', error);
      return { success: false, error: 'Failed to export as PNG' };
    }
  }

  /**
   * Prepare element for export
   */
  private prepareElementForExport(
    element: HTMLElement,
    options: TimelineExportOptions,
    exportData: TimelineExportData
  ): HTMLElement {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Apply export-specific styling
    clone.style.backgroundColor = '#ffffff';
    clone.style.padding = '20px';
    clone.style.border = 'none';
    clone.style.boxShadow = 'none';

    // Add header if requested
    if (options.includeLogo) {
      const header = this.createExportHeader(exportData);
      clone.insertBefore(header, clone.firstChild);
    }

    // Add demo watermark if in demo mode
    if (this.isDemoMode) {
      const watermark = this.createDemoWatermark();
      clone.appendChild(watermark);
    }

    // Apply date range filter if specified
    if (options.dateRange) {
      this.applyDateRangeFilter(clone, options.dateRange);
    }

    // Apply zoom level
    this.applyZoomLevel(clone, options.zoomLevel);

    return clone;
  }

  /**
   * Create export header
   */
  private createExportHeader(exportData: TimelineExportData): HTMLElement {
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const logoHtml = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <div style="width: 40px; height: 40px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 20px; font-weight: bold; color: #667eea;">C</span>
        </div>
        <div>
          <h2 style="margin: 0; font-size: 18px; font-weight: 600;">ConstructBMS</h2>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">Programme Manager v2</p>
        </div>
      </div>
    `;

    const projectInfo = exportData.multiProject?.enabled 
      ? `Multi-Project Timeline (${exportData.multiProject.projects.length} projects)`
      : exportData.projectName;

    header.innerHTML = `
      ${logoHtml}
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${projectInfo}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Timeline Export</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 14px;">Exported: ${exportData.exportDate.toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">By: ${exportData.exportUser}</p>
          ${this.isDemoMode ? '<p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">DEMO EXPORT</p>' : ''}
        </div>
      </div>
    `;

    return header;
  }

  /**
   * Create demo watermark
   */
  private createDemoWatermark(): HTMLElement {
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48px;
      font-weight: bold;
      color: rgba(251, 191, 36, 0.3);
      pointer-events: none;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    watermark.textContent = DEMO_MODE_CONFIG.watermarkText;
    return watermark;
  }

  /**
   * Add PDF header
   */
  private addPDFHeader(pdf: any, exportData: TimelineExportData, pageWidth: number): void {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    
    const projectName = exportData.multiProject?.enabled 
      ? `Multi-Project Timeline (${exportData.multiProject.projects.length} projects)`
      : exportData.projectName;
    
    pdf.text(projectName, 10, 20);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exported: ${exportData.exportDate.toLocaleDateString()}`, pageWidth - 60, 20);
    pdf.text(`By: ${exportData.exportUser}`, pageWidth - 60, 25);
    
    if (this.isDemoMode) {
      pdf.setFontSize(8);
      pdf.setTextColor(251, 191, 36);
      pdf.text('DEMO EXPORT', pageWidth - 40, 30);
      pdf.setTextColor(0, 0, 0);
    }
  }

  /**
   * Add PDF footer
   */
  private addPDFFooter(pdf: any, exportData: TimelineExportData, pageWidth: number, pageHeight: number): void {
    const footerY = pageHeight - 10;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated by ConstructBMS - ${new Date().toLocaleString()}`, 10, footerY);
    pdf.text(`Page ${pdf.getCurrentPageInfo().pageNumber}`, pageWidth - 20, footerY);
    
    // Add filters info if available
    if (exportData.filters) {
      const activeFilters = [];
      if (exportData.filters.status.length) activeFilters.push(`Status: ${exportData.filters.status.join(', ')}`);
      if (exportData.filters.priority.length) activeFilters.push(`Priority: ${exportData.filters.priority.join(', ')}`);
      if (exportData.filters.tags.length) activeFilters.push(`Tags: ${exportData.filters.tags.join(', ')}`);
      
      if (activeFilters.length > 0) {
        pdf.text(`Filters: ${activeFilters.join(' | ')}`, 10, footerY - 5);
      }
    }
  }

  /**
   * Apply date range filter
   */
  private applyDateRangeFilter(element: HTMLElement, dateRange: { end: Date, start: Date; }): void {
    // This would filter tasks based on the date range
    // Implementation depends on the specific DOM structure
    console.log('Applying date range filter:', dateRange);
  }

  /**
   * Apply zoom level
   */
  private applyZoomLevel(element: HTMLElement, zoomLevel: string): void {
    // This would adjust the timeline scale based on zoom level
    // Implementation depends on the specific DOM structure
    console.log('Applying zoom level:', zoomLevel);
  }

  /**
   * Generate filename
   */
  private generateFileName(projectName: string, extension: string): string {
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${sanitizedName}_Timeline_${timestamp}_${time}.${extension}`;
  }

  /**
   * Download file
   */
  private downloadFile(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Save export settings to Supabase
   */
  async saveExportSettings(projectId: string, options: TimelineExportOptions): Promise<{ error?: string, success: boolean; }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('timeline_export_settings')
        .upsert({
          user_id: user.id,
          project_id: projectId,
          settings: options,
          demo: this.isDemoMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error saving timeline export settings:', error);
      return { success: false, error: 'Failed to save settings' };
    }
  }

  /**
   * Load export settings from Supabase
   */
  async loadExportSettings(projectId: string): Promise<TimelineExportOptions | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('timeline_export_settings')
        .select('settings')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (error || !data) return null;

      return data.settings;
    } catch (error) {
      console.error('Error loading timeline export settings:', error);
      return null;
    }
  }
}

export const timelineExportService = new TimelineExportService(); 