import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';

export interface ExportOptions {
  columnsToInclude: string[];
  dateRange: {
    end: Date;
    start: Date;
  };
  includeBaseline: boolean;
  includeCriticalPath: boolean;
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'Letter' | 'Legal';
  showLegend: boolean;
  showLogoHeader: boolean;
  zoomLevel: 'days' | 'weeks' | 'months';
}

export interface ExportSettings {
  demo?: boolean;
  id: string;
  options: ExportOptions;
  projectId: string;
  updatedAt: Date;
  userId: string;
}

export interface ExportResult {
  dataUrl?: string;
  error?: string;
  fileName?: string;
  success: boolean;
}

export interface GanttExportData {
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
  exportUser: string;
  projectName: string;
  tasks: Array<{
    endDate: Date;
    id: string;
    name: string;
    progress: number;
    startDate: Date;
    status: string;
    tags: string[];
    type: string;
  }>;
}

class ExportService {
  private readonly exportSettingsKey = 'programme_export_settings';
  private readonly maxDemoTasks = 10;

  /**
   * Get default export options
   */
  getDefaultExportOptions(): ExportOptions {
    return {
      dateRange: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      zoomLevel: 'weeks',
      columnsToInclude: ['name', 'status', 'startDate', 'endDate', 'progress'],
      showLegend: true,
      showLogoHeader: true,
      includeBaseline: false,
      includeCriticalPath: false,
      pageSize: 'A4',
      orientation: 'landscape'
    };
  }

  /**
   * Get export settings for a project
   */
  async getExportSettings(projectId: string): Promise<ExportSettings | null> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allSettings = await this.getAllExportSettings();
      
      return allSettings.find(setting => 
        setting.projectId === projectId && 
        (isDemoMode ? setting.demo : true)
      ) || null;
    } catch (error) {
      console.error('Error getting export settings:', error);
      return null;
    }
  }

  /**
   * Save export settings
   */
  async saveExportSettings(projectId: string, options: ExportOptions): Promise<{ error?: string, success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allSettings = await this.getAllExportSettings();
      
      // Demo mode restrictions
      if (isDemoMode) {
        // Limit date range to 7 days in demo mode
        const maxDateRange = 7 * 24 * 60 * 60 * 1000;
        if (options.dateRange.end.getTime() - options.dateRange.start.getTime() > maxDateRange) {
          return { success: false, error: 'Date range limited to 7 days in demo mode' };
        }
        
        // Limit columns in demo mode
        if (options.columnsToInclude.length > 3) {
          return { success: false, error: 'Maximum 3 columns allowed in demo mode' };
        }
      }
      
      const existingIndex = allSettings.findIndex(setting => setting.projectId === projectId);
      const newSetting: ExportSettings = {
        id: `export_settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        userId: 'current-user',
        options,
        updatedAt: new Date(),
        demo: isDemoMode
      };
      
      if (existingIndex >= 0) {
        allSettings[existingIndex] = newSetting;
      } else {
        allSettings.push(newSetting);
      }
      
      await persistentStorage.set(this.exportSettingsKey, allSettings);
      
      console.log('Export settings saved:', newSetting);
      return { success: true };
    } catch (error) {
      console.error('Error saving export settings:', error);
      return { success: false, error: 'Failed to save export settings' };
    }
  }

  /**
   * Export Gantt chart as PNG
   */
  async exportAsPNG(
    ganttElement: HTMLElement,
    options: ExportOptions,
    exportData: GanttExportData
  ): Promise<ExportResult> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode restrictions
      if (isDemoMode && exportData.tasks.length > this.maxDemoTasks) {
        return { 
          success: false, 
          error: `Maximum ${this.maxDemoTasks} tasks allowed in demo mode exports` 
        };
      }
      
      // Import html2canvas dynamically
      const html2canvas = await import('html2canvas');
      
      // Prepare element for export
      const exportElement = this.prepareElementForExport(ganttElement, options, exportData, isDemoMode);
      
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
      
      console.log('PNG export completed:', fileName);
      return { success: true, dataUrl, fileName };
    } catch (error) {
      console.error('Error exporting as PNG:', error);
      return { success: false, error: 'Failed to export as PNG' };
    }
  }

  /**
   * Export Gantt chart as PDF
   */
  async exportAsPDF(
    ganttElement: HTMLElement,
    options: ExportOptions,
    exportData: GanttExportData
  ): Promise<ExportResult> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode restrictions
      if (isDemoMode && exportData.tasks.length > this.maxDemoTasks) {
        return { 
          success: false, 
          error: `Maximum ${this.maxDemoTasks} tasks allowed in demo mode exports` 
        };
      }
      
      // Import required libraries dynamically
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      // Prepare element for export
      const exportElement = this.prepareElementForExport(ganttElement, options, exportData, isDemoMode);
      
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
      if (options.showLogoHeader) {
        this.addPDFHeader(pdf, exportData, pageWidth);
      }
      
      // Add footer
      this.addPDFFooter(pdf, exportData, pageWidth, pageHeight);
      
      // Generate filename
      const fileName = this.generateFileName(exportData.projectName, 'pdf');
      
      // Save the PDF
      pdf.save(fileName);
      
      console.log('PDF export completed:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      return { success: false, error: 'Failed to export as PDF' };
    }
  }

  /**
   * Prepare element for export
   */
  private prepareElementForExport(
    element: HTMLElement,
    options: ExportOptions,
    exportData: GanttExportData,
    isDemoMode: boolean
  ): HTMLElement {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply export-specific styling
    clone.style.backgroundColor = '#ffffff';
    clone.style.padding = '20px';
    clone.style.border = 'none';
    clone.style.boxShadow = 'none';
    
    // Add header if requested
    if (options.showLogoHeader) {
      const header = this.createExportHeader(exportData, isDemoMode);
      clone.insertBefore(header, clone.firstChild);
    }
    
    // Add legend if requested
    if (options.showLegend) {
      const legend = this.createExportLegend(exportData, isDemoMode);
      clone.appendChild(legend);
    }
    
    // Add demo watermark if in demo mode
    if (isDemoMode) {
      const watermark = this.createDemoWatermark();
      clone.appendChild(watermark);
    }
    
    // Apply date range filter
    this.applyDateRangeFilter(clone, options.dateRange);
    
    // Apply column filter
    this.applyColumnFilter(clone, options.columnsToInclude);
    
    return clone;
  }

  /**
   * Create export header
   */
  private createExportHeader(exportData: GanttExportData, isDemoMode: boolean): HTMLElement {
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${exportData.projectName}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Gantt Chart Export</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 14px;">Exported: ${exportData.exportDate.toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">By: ${exportData.exportUser}</p>
          ${isDemoMode ? '<p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">DEMO VERSION</p>' : ''}
        </div>
      </div>
    `;
    
    return header;
  }

  /**
   * Create export legend
   */
  private createExportLegend(exportData: GanttExportData, isDemoMode: boolean): HTMLElement {
    const legend = document.createElement('div');
    legend.style.cssText = `
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    legend.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #495057;">Legend</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 14px;">
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 12px; background: #3b82f6; margin-right: 8px; border-radius: 2px;"></div>
          <span>Task</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 12px; background: #8b5cf6; margin-right: 8px; border-radius: 2px;"></div>
          <span>Milestone</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 12px; background: #dc2626; margin-right: 8px; border-radius: 2px;"></div>
          <span>Critical Path</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 12px; background: #10b981; margin-right: 8px; border-radius: 2px;"></div>
          <span>Completed</span>
        </div>
        ${exportData.baseline ? `
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 12px; border: 2px dashed #6b7280; margin-right: 8px; border-radius: 2px;"></div>
          <span>Baseline</span>
        </div>
        ` : ''}
        ${isDemoMode ? `
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 12px; background: #fbbf24; margin-right: 8px; border-radius: 2px;"></div>
          <span>Demo Mode</span>
        </div>
        ` : ''}
      </div>
    `;
    
    return legend;
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
    watermark.textContent = 'DEMO';
    return watermark;
  }

  /**
   * Add PDF header
   */
  private addPDFHeader(pdf: any, exportData: GanttExportData, pageWidth: number): void {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(exportData.projectName, 10, 20);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exported: ${exportData.exportDate.toLocaleDateString()}`, pageWidth - 60, 20);
    pdf.text(`By: ${exportData.exportUser}`, pageWidth - 60, 25);
  }

  /**
   * Add PDF footer
   */
  private addPDFFooter(pdf: any, exportData: GanttExportData, pageWidth: number, pageHeight: number): void {
    const footerY = pageHeight - 10;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated by ConstructBMS - ${new Date().toLocaleString()}`, 10, footerY);
    pdf.text(`Page ${pdf.getCurrentPageInfo().pageNumber}`, pageWidth - 20, footerY);
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
   * Apply column filter
   */
  private applyColumnFilter(element: HTMLElement, columnsToInclude: string[]): void {
    // This would show/hide columns based on the selection
    // Implementation depends on the specific DOM structure
    console.log('Applying column filter:', columnsToInclude);
  }

  /**
   * Generate filename
   */
  private generateFileName(projectName: string, extension: string): string {
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitizedName}_Gantt_${timestamp}.${extension}`;
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
   * Get demo mode restrictions
   */
  getDemoModeRestrictions(): string[] {
    return [
      `Maximum ${this.maxDemoTasks} visible tasks exported`,
      'Exports include semi-transparent "DEMO" watermark',
      'Export options limited (no date range or zoom)',
      'Tooltip: "Upgrade to remove export limits"',
      'All entries tagged as demo'
    ];
  }

  /**
   * Get all export settings
   */
  private async getAllExportSettings(): Promise<ExportSettings[]> {
    try {
      const settings = await persistentStorage.get(this.exportSettingsKey);
      return settings || [];
    } catch (error) {
      console.error('Error getting all export settings:', error);
      return [];
    }
  }

  /**
   * Clear all export data (for demo mode reset)
   */
  async clearAllExportData(): Promise<void> {
    try {
      await persistentStorage.remove(this.exportSettingsKey);
      console.log('All export data cleared');
    } catch (error) {
      console.error('Error clearing export data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      if (isDemoMode) {
        await this.clearAllExportData();
        console.log('Demo export data reset');
      }
    } catch (error) {
      console.error('Error resetting demo export data:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService(); 