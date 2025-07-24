import { demoModeService } from './demoModeService';
import { supabase } from './supabaseAuth';

export interface TimelinePrintOptions {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A3' | 'A4' | 'fit-to-width';
  includeBranding: boolean;
  includeFilters: boolean;
  timeRange: 'current-view' | 'custom';
  customDateRange?: {
    start: Date;
    end: Date;
  };
  pageBreaks: 'auto' | 'manual';
  includeProjectHeader: boolean;
  includeFooter: boolean;
  includePageNumbers: boolean;
  demo: boolean;
}

export interface TimelinePrintData {
  projectId: string;
  projectName: string;
  projectIdDisplay: string;
  printDate: Date;
  tasks: any[];
  filters: any;
  currentView: any;
  branding: {
    logo?: string;
    companyName: string;
    poweredBy: string;
  };
}

export interface TimelinePrintResult {
  success: boolean;
  error?: string;
  previewHtml?: string;
  printMetadata?: {
    totalPages: number;
    totalTasks: number;
    dateRange: string;
    demo: boolean;
  };
}

class TimelinePrintService {
  private readonly defaultOptions: TimelinePrintOptions = {
    orientation: 'landscape',
    pageSize: 'A4',
    includeBranding: true,
    includeFilters: true,
    timeRange: 'current-view',
    pageBreaks: 'auto',
    includeProjectHeader: true,
    includeFooter: true,
    includePageNumbers: true,
    demo: false
  };

  /**
   * Get default print options
   */
  getDefaultOptions(): TimelinePrintOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Generate print preview HTML
   */
  async generatePrintPreview(
    options: TimelinePrintOptions,
    data: TimelinePrintData
  ): Promise<TimelinePrintResult> {
    try {
      // Check demo mode restrictions
      if (!this.canPrintInDemoMode(options, data)) {
        return {
          success: false,
          error: 'Print not allowed with current options in demo mode'
        };
      }

      // Apply demo mode restrictions
      const restrictedOptions = this.applyDemoModeRestrictions(options);
      const restrictedData = this.applyDemoModeDataRestrictions(data);

      // Generate print CSS
      const printCSS = this.generatePrintCSS(restrictedOptions);
      
      // Generate print HTML
      const printHTML = this.generatePrintHTML(restrictedOptions, restrictedData);

      // Calculate print metadata
      const printMetadata = this.calculatePrintMetadata(restrictedOptions, restrictedData);

      return {
        success: true,
        previewHtml: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Timeline Print Preview - ${data.projectName}</title>
              <style>${printCSS}</style>
            </head>
            <body>
              ${printHTML}
            </body>
          </html>
        `,
        printMetadata
      };
    } catch (error) {
      console.error('Error generating print preview:', error);
      return {
        success: false,
        error: 'Failed to generate print preview'
      };
    }
  }

  /**
   * Open browser print dialog
   */
  async openPrintDialog(
    options: TimelinePrintOptions,
    data: TimelinePrintData
  ): Promise<TimelinePrintResult> {
    try {
      const previewResult = await this.generatePrintPreview(options, data);
      
      if (!previewResult.success) {
        return previewResult;
      }

      // Create print window
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        return {
          success: false,
          error: 'Failed to open print window'
        };
      }

      // Write content to print window
      printWindow.document.write(previewResult.previewHtml!);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        // Trigger print dialog
        printWindow.print();
        
        // Close window after print
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };

      // Log print activity
      await this.logPrintActivity(data.projectId, options, previewResult.printMetadata);

      return {
        success: true,
        printMetadata: previewResult.printMetadata
      };
    } catch (error) {
      console.error('Error opening print dialog:', error);
      return {
        success: false,
        error: 'Failed to open print dialog'
      };
    }
  }

  /**
   * Check if print is allowed in demo mode
   */
  private canPrintInDemoMode(options: TimelinePrintOptions, data: TimelinePrintData): boolean {
    if (!options.demo) return true;

    // Demo mode restrictions
    if (data.tasks.length > 10) {
      return false;
    }

    if (options.pageSize !== 'A4') {
      return false;
    }

    if (!options.includeBranding) {
      return false;
    }

    return true;
  }

  /**
   * Apply demo mode restrictions to options
   */
  private applyDemoModeRestrictions(options: TimelinePrintOptions): TimelinePrintOptions {
    if (!options.demo) return options;

    return {
      ...options,
      pageSize: 'A4', // Force A4 in demo mode
      includeBranding: true, // Force branding in demo mode
      includePageNumbers: true // Force page numbers in demo mode
    };
  }

  /**
   * Apply demo mode restrictions to data
   */
  private applyDemoModeDataRestrictions(data: TimelinePrintData): TimelinePrintData {
    if (!data.demo) return data;

    return {
      ...data,
      tasks: data.tasks.slice(0, 10), // Limit to 10 tasks in demo mode
      branding: {
        ...data.branding,
        poweredBy: 'DEMO VERSION - NOT FOR DISTRIBUTION'
      }
    };
  }

  /**
   * Generate print CSS
   */
  private generatePrintCSS(options: TimelinePrintOptions): string {
    const pageSize = options.pageSize === 'fit-to-width' ? 'A4' : options.pageSize;
    const isLandscape = options.orientation === 'landscape';

    return `
      @page {
        size: ${pageSize} ${isLandscape ? 'landscape' : 'portrait'};
        margin: 15mm;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
        }

        .no-print {
          display: none !important;
        }

        .timeline-print-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
        }

        .timeline-print-header {
          page-break-after: avoid;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }

        .timeline-print-content {
          page-break-inside: avoid;
        }

        .timeline-print-footer {
          page-break-before: avoid;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          font-size: 10px;
          text-align: center;
        }

        .timeline-print-page-break {
          page-break-before: always;
        }

        .timeline-print-watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          font-weight: bold;
          color: rgba(255, 0, 0, 0.1);
          z-index: 1000;
          pointer-events: none;
        }

        .timeline-print-task-row {
          page-break-inside: avoid;
          margin-bottom: 8px;
        }

        .timeline-print-task-bar {
          height: 20px;
          background: #3b82f6;
          border-radius: 3px;
          position: relative;
        }

        .timeline-print-task-bar.critical {
          background: #ef4444;
        }

        .timeline-print-task-bar.completed {
          background: #10b981;
        }

        .timeline-print-grid {
          background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .timeline-print-time-header {
          background: #f3f4f6;
          border-bottom: 1px solid #d1d5db;
          padding: 8px 0;
          font-weight: 600;
        }

        .timeline-print-filters {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 15px;
          font-size: 11px;
        }

        .timeline-print-branding {
          text-align: center;
          font-size: 10px;
          color: #6b7280;
          margin-top: 10px;
        }
      }

      /* Screen styles for preview */
      @media screen {
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
          margin: 20px;
        }

        .timeline-print-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          padding: 20px;
        }

        .timeline-print-watermark {
          display: none;
        }
      }
    `;
  }

  /**
   * Generate print HTML
   */
  private generatePrintHTML(options: TimelinePrintOptions, data: TimelinePrintData): string {
    const watermark = options.demo ? '<div class="timeline-print-watermark">DEMO VERSION - NOT FOR DISTRIBUTION</div>' : '';
    
    return `
      ${watermark}
      <div class="timeline-print-container">
        ${this.generateHeader(options, data)}
        ${this.generateFilters(options, data)}
        ${this.generateTimeline(options, data)}
        ${this.generateFooter(options, data)}
      </div>
    `;
  }

  /**
   * Generate header section
   */
  private generateHeader(options: TimelinePrintOptions, data: TimelinePrintData): string {
    if (!options.includeProjectHeader) return '';

    return `
      <div class="timeline-print-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${data.projectName}</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Project ID: ${data.projectIdDisplay}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px;">Printed: ${data.printDate.toLocaleDateString()}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Time: ${data.printDate.toLocaleTimeString()}</p>
          </div>
        </div>
        ${options.includeBranding ? `
          <div class="timeline-print-branding">
            Powered by ${data.branding.poweredBy}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate filters section
   */
  private generateFilters(options: TimelinePrintOptions, data: TimelinePrintData): string {
    if (!options.includeFilters || !data.filters) return '';

    const filterItems = Object.entries(data.filters)
      .filter(([_, value]) => value && value !== 'all')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    if (!filterItems) return '';

    return `
      <div class="timeline-print-filters">
        <strong>Active Filters:</strong> ${filterItems}
      </div>
    `;
  }

  /**
   * Generate timeline section
   */
  private generateTimeline(options: TimelinePrintOptions, data: TimelinePrintData): string {
    const tasks = data.tasks.slice(0, options.demo ? 10 : data.tasks.length);
    
    return `
      <div class="timeline-print-content">
        <div class="timeline-print-time-header">
          <div style="display: grid; grid-template-columns: 200px 1fr; gap: 10px;">
            <div>Task</div>
            <div>Timeline</div>
          </div>
        </div>
        <div class="timeline-print-grid">
          ${tasks.map((task, index) => this.generateTaskRow(task, index, options)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate task row
   */
  private generateTaskRow(task: any, index: number, options: TimelinePrintOptions): string {
    const isCritical = task.critical || false;
    const isCompleted = task.progress === 100;
    const barClass = isCritical ? 'critical' : isCompleted ? 'completed' : '';
    
    return `
      <div class="timeline-print-task-row">
        <div style="display: grid; grid-template-columns: 200px 1fr; gap: 10px; align-items: center;">
          <div style="font-weight: ${task.type === 'summary' ? 'bold' : 'normal'};">
            ${task.name}
          </div>
          <div class="timeline-print-task-bar ${barClass}" style="width: 100%;">
            <div style="position: absolute; top: 2px; left: 5px; font-size: 10px; color: white;">
              ${task.progress || 0}%
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate footer section
   */
  private generateFooter(options: TimelinePrintOptions, data: TimelinePrintData): string {
    if (!options.includeFooter) return '';

    const footerContent = [];
    
    if (options.includePageNumbers) {
      footerContent.push('<span>Page 1</span>');
    }
    
    if (options.demo) {
      footerContent.push('Demo print view – Upgrade for full export');
    }
    
    footerContent.push(`Total Tasks: ${data.tasks.length}`);

    return `
      <div class="timeline-print-footer">
        ${footerContent.join(' • ')}
      </div>
    `;
  }

  /**
   * Calculate print metadata
   */
  private calculatePrintMetadata(options: TimelinePrintOptions, data: TimelinePrintData) {
    const totalTasks = options.demo ? Math.min(data.tasks.length, 10) : data.tasks.length;
    const dateRange = options.timeRange === 'custom' && options.customDateRange
      ? `${options.customDateRange.start.toLocaleDateString()} - ${options.customDateRange.end.toLocaleDateString()}`
      : 'Current View';

    return {
      totalPages: 1, // Simplified calculation
      totalTasks,
      dateRange,
      demo: options.demo
    };
  }

  /**
   * Log print activity
   */
  private async logPrintActivity(
    projectId: string,
    options: TimelinePrintOptions,
    metadata?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('print_activity').insert({
        project_id: projectId,
        user_id: user.id,
        print_options: options,
        print_metadata: metadata,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log print activity:', error);
    }
  }
}

export const timelinePrintService = new TimelinePrintService(); 