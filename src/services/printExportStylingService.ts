import { persistentStorage } from './persistentStorage';

export type PageLayout = 'A4P' | 'A4L' | 'A3L';
export type ExportTheme = 'default' | 'monochrome' | 'light' | 'dark' | 'custom';

export interface PrintExportStylingSettings {
  demo?: boolean;
  exportTheme: ExportTheme;
  pageLayout: PageLayout;
}

export interface PrintExportStylingConfig {
  autoPreview: boolean;
  defaultFormat: 'pdf' | 'png' | 'jpg';
  // in MB
  demo?: boolean;
  enabled: boolean; 
  maxFileSize: number;
}

// Default ConstructBMS print/export styling settings
const defaultSettings: PrintExportStylingSettings = {
  pageLayout: 'A4L',
  exportTheme: 'default'
};

class PrintExportStylingService {
  private configKey = 'printExportStylingConfig';
  private settingsKey = 'printExportStylingSettings';

  // Default configuration
  private defaultConfig: PrintExportStylingConfig = {
    enabled: true,
    autoPreview: true,
    defaultFormat: 'pdf',
    maxFileSize: 50,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<PrintExportStylingConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting print export styling config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<PrintExportStylingConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Print export styling config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating print export styling config:', error);
      throw error;
    }
  }

  /**
   * Get print/export styling settings for project
   */
  async getPrintExportStylingSettings(projectId: string): Promise<PrintExportStylingSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting print export styling settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save print/export styling settings for project
   */
  async savePrintExportStylingSettings(projectId: string, settings: Partial<PrintExportStylingSettings>): Promise<void> {
    try {
      const config = await this.getConfig();
      const currentSettings = await this.getPrintExportStylingSettings(projectId);
      
      // Apply demo mode limits
      if (config.demo) {
        const limitedSettings = { ...currentSettings, ...settings };
        
        // Lock to A4 Landscape in demo mode
        if (limitedSettings.pageLayout !== 'A4L') {
          limitedSettings.pageLayout = 'A4L';
        }
        
        // Lock to Monochrome theme in demo mode
        if (limitedSettings.exportTheme !== 'monochrome') {
          limitedSettings.exportTheme = 'monochrome';
        }
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...currentSettings,
          ...settings
        });
      }
      
      console.log('Print export styling settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving print export styling settings:', error);
      throw error;
    }
  }

  /**
   * Get CSS for print/export styling
   */
  generatePrintExportStylingCSS(settings: PrintExportStylingSettings): string {
    const layoutStyles = this.getLayoutStyles(settings.pageLayout);
    const themeStyles = this.getThemeStyles(settings.exportTheme);
    
    return `
      /* Print/Export Styling */
      
      /* Export Container */
      .export-container {
        ${layoutStyles.container}
        ${themeStyles.container}
        position: relative;
        overflow: hidden;
        page-break-inside: avoid;
      }
      
      /* Page Layout Styles */
      .export-page {
        ${layoutStyles.page}
        ${themeStyles.page}
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* Header Styles */
      .export-header {
        ${themeStyles.header}
        padding: 20px;
        border-bottom: 1px solid ${themeStyles.border};
        margin-bottom: 20px;
      }
      
      .export-header h1 {
        ${themeStyles.title}
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: bold;
      }
      
      .export-header p {
        ${themeStyles.subtitle}
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
      }
      
      /* Timeline Styles */
      .export-timeline {
        ${themeStyles.timeline}
        padding: 20px;
      }
      
      .export-timeline-header {
        ${themeStyles.timelineHeader}
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        font-size: 14px;
        font-weight: 500;
      }
      
      .export-timeline-bars {
        ${themeStyles.timelineBars}
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .export-timeline-bar {
        ${themeStyles.timelineBar}
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 8px 0;
      }
      
      .export-timeline-bar-label {
        ${themeStyles.timelineBarLabel}
        min-width: 120px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .export-timeline-bar-track {
        ${themeStyles.timelineBarTrack}
        flex: 1;
        height: 20px;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
      }
      
      .export-timeline-bar-fill {
        ${themeStyles.timelineBarFill}
        height: 100%;
        border-radius: 4px;
        position: absolute;
        top: 0;
        left: 0;
        transition: width 0.3s ease;
      }
      
      /* Footer Styles */
      .export-footer {
        ${themeStyles.footer}
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        text-align: center;
        font-size: 10px;
        opacity: 0.6;
        border-top: 1px solid ${themeStyles.border};
        padding-top: 10px;
      }
      
      /* Print-specific styles */
      @media print {
        .export-container {
          width: 100% !important;
          height: auto !important;
          page-break-inside: avoid;
        }
        
        .export-page {
          page-break-after: always;
        }
        
        .export-page:last-child {
          page-break-after: avoid;
        }
      }
      
      /* Export-specific variables */
      :root {
        --export-page-layout: "${settings.pageLayout}";
        --export-theme: "${settings.exportTheme}";
        --export-page-width: ${layoutStyles.width}mm;
        --export-page-height: ${layoutStyles.height}mm;
      }
    `;
  }

  /**
   * Get layout styles for page layout
   */
  private getLayoutStyles(layout: PageLayout) {
    switch (layout) {
      case 'A4P':
        return {
          container: 'width: 210mm; height: 297mm;',
          page: 'width: 210mm; height: 297mm;',
          width: 210,
          height: 297
        };
      case 'A4L':
        return {
          container: 'width: 297mm; height: 210mm;',
          page: 'width: 297mm; height: 210mm;',
          width: 297,
          height: 210
        };
      case 'A3L':
        return {
          container: 'width: 420mm; height: 297mm;',
          page: 'width: 420mm; height: 297mm;',
          width: 420,
          height: 297
        };
      default:
        return {
          container: 'width: 210mm; height: 297mm;',
          page: 'width: 210mm; height: 297mm;',
          width: 210,
          height: 297
        };
    }
  }

  /**
   * Get theme styles for export theme
   */
  private getThemeStyles(theme: ExportTheme) {
    switch (theme) {
      case 'monochrome':
        return {
          container: 'background-color: #ffffff; color: #000000;',
          page: 'background-color: #ffffff; color: #000000;',
          header: 'background-color: #ffffff; color: #000000;',
          title: 'color: #000000;',
          subtitle: 'color: #000000;',
          timeline: 'background-color: #ffffff; color: #000000;',
          timelineHeader: 'color: #000000;',
          timelineBars: 'background-color: #ffffff;',
          timelineBar: 'border-bottom: 1px solid #000000;',
          timelineBarLabel: 'color: #000000;',
          timelineBarTrack: 'background-color: #f0f0f0;',
          timelineBarFill: 'background-color: #000000;',
          footer: 'color: #000000;',
          border: '#000000'
        };
      case 'light':
        return {
          container: 'background-color: #ffffff; color: #374151;',
          page: 'background-color: #ffffff; color: #374151;',
          header: 'background-color: #ffffff; color: #374151;',
          title: 'color: #111827;',
          subtitle: 'color: #6b7280;',
          timeline: 'background-color: #ffffff; color: #374151;',
          timelineHeader: 'color: #374151;',
          timelineBars: 'background-color: #ffffff;',
          timelineBar: 'border-bottom: 1px solid #e5e7eb;',
          timelineBarLabel: 'color: #374151;',
          timelineBarTrack: 'background-color: #f3f4f6;',
          timelineBarFill: 'background-color: #3b82f6;',
          footer: 'color: #6b7280;',
          border: '#e5e7eb'
        };
      case 'dark':
        return {
          container: 'background-color: #1f2937; color: #f9fafb;',
          page: 'background-color: #1f2937; color: #f9fafb;',
          header: 'background-color: #1f2937; color: #f9fafb;',
          title: 'color: #ffffff;',
          subtitle: 'color: #d1d5db;',
          timeline: 'background-color: #1f2937; color: #f9fafb;',
          timelineHeader: 'color: #f9fafb;',
          timelineBars: 'background-color: #1f2937;',
          timelineBar: 'border-bottom: 1px solid #4b5563;',
          timelineBarLabel: 'color: #f9fafb;',
          timelineBarTrack: 'background-color: #374151;',
          timelineBarFill: 'background-color: #60a5fa;',
          footer: 'color: #9ca3af;',
          border: '#4b5563'
        };
      default:
        return {
          container: 'background-color: #ffffff; color: #374151;',
          page: 'background-color: #ffffff; color: #374151;',
          header: 'background-color: #ffffff; color: #374151;',
          title: 'color: #111827;',
          subtitle: 'color: #6b7280;',
          timeline: 'background-color: #ffffff; color: #374151;',
          timelineHeader: 'color: #374151;',
          timelineBars: 'background-color: #ffffff;',
          timelineBar: 'border-bottom: 1px solid #e5e7eb;',
          timelineBarLabel: 'color: #374151;',
          timelineBarTrack: 'background-color: #f3f4f6;',
          timelineBarFill: 'background-color: #3b82f6;',
          footer: 'color: #6b7280;',
          border: '#e5e7eb'
        };
    }
  }

  /**
   * Apply print/export styling to DOM
   */
  applyPrintExportStyling(settings: PrintExportStylingSettings): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-print-export-styling');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-print-export-styling';
      styleTag.textContent = this.generatePrintExportStylingCSS(settings);
      
      document.head.appendChild(styleTag);
      
      // Update export data attributes
      const exportElements = document.querySelectorAll('.export-container, .gantt-export');
      exportElements.forEach(element => {
        element.setAttribute('data-page-layout', settings.pageLayout);
        element.setAttribute('data-export-theme', settings.exportTheme);
      });
      
      console.log('Print export styling applied to DOM');
    } catch (error) {
      console.error('Error applying print export styling to DOM:', error);
    }
  }

  /**
   * Get page layout label
   */
  getPageLayoutLabel(layout: PageLayout): string {
    const labels = {
      A4P: 'A4 Portrait',
      A4L: 'A4 Landscape',
      A3L: 'A3 Landscape'
    };
    return labels[layout];
  }

  /**
   * Get page layout description
   */
  getPageLayoutDescription(layout: PageLayout): string {
    const descriptions = {
      A4P: 'Standard portrait orientation',
      A4L: 'Wide landscape orientation',
      A3L: 'Large format landscape'
    };
    return descriptions[layout];
  }

  /**
   * Get page layout dimensions
   */
  getPageLayoutDimensions(layout: PageLayout): { height: number; orientation: string, width: number; } {
    const dimensions = {
      A4P: { width: 210, height: 297, orientation: 'Portrait' },
      A4L: { width: 297, height: 210, orientation: 'Landscape' },
      A3L: { width: 420, height: 297, orientation: 'Landscape' }
    };
    return dimensions[layout];
  }

  /**
   * Get export theme label
   */
  getExportThemeLabel(theme: ExportTheme): string {
    const labels = {
      default: 'Default',
      monochrome: 'Monochrome',
      light: 'Light',
      dark: 'Dark',
      custom: 'Custom'
    };
    return labels[theme];
  }

  /**
   * Get export theme description
   */
  getExportThemeDescription(theme: ExportTheme): string {
    const descriptions = {
      default: 'Standard ConstructBMS theme',
      monochrome: 'High contrast black and white',
      light: 'Clean light background',
      dark: 'Dark background theme',
      custom: 'User-defined theme'
    };
    return descriptions[theme];
  }

  /**
   * Validate print/export styling settings
   */
  validatePrintExportStylingSettings(settings: PrintExportStylingSettings): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate page layout
    if (!['A4P', 'A4L', 'A3L'].includes(settings.pageLayout)) {
      errors.push('Invalid page layout option');
    }
    
    // Validate export theme
    if (!['default', 'monochrome', 'light', 'dark', 'custom'].includes(settings.exportTheme)) {
      errors.push('Invalid export theme option');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for print/export styling
   */
  getPrintExportStylingPreview(settings: PrintExportStylingSettings, projectName: string): string {
    const dimensions = this.getPageLayoutDimensions(settings.pageLayout);
    const theme = this.getThemeStyles(settings.exportTheme);
    
    return `
      <div class="print-export-styling-preview" style="
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background-color: white;
        margin: 8px 0;
        overflow: hidden;
      ">
        <div style="
          padding: 8px 12px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 500;
          font-size: 12px;
          color: #374151;
        ">
          Export Preview - ${this.getPageLayoutLabel(settings.pageLayout)} / ${this.getExportThemeLabel(settings.exportTheme)}
        </div>
        <div style="
          position: relative;
          height: 120px;
          background: ${theme.container.split(';')[0].split(':')[1].trim()};
          color: ${theme.page.split(';')[1].split(':')[1].trim()};
          overflow: hidden;
          padding: 12px;
        ">
          <!-- Header -->
          <div style="
            border-bottom: 1px solid ${theme.border};
            margin-bottom: 8px;
            padding-bottom: 8px;
          ">
            <div style="
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 4px;
              color: ${theme.title.split(':')[1].trim()};
            ">
              ${projectName}
            </div>
            <div style="
              font-size: 10px;
              opacity: 0.8;
              color: ${theme.subtitle.split(':')[1].trim()};
            ">
              Construction Programme
            </div>
          </div>
          
          <!-- Timeline Preview -->
          <div style="font-size: 10px;">
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              color: ${theme.timelineHeader.split(':')[1].trim()};
            ">
              <span>Timeline</span>
              <span style="color: ${theme.timelineBarFill.split(':')[1].trim()};">2024</span>
            </div>
            
            <!-- Sample Bars -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              {['Site Prep', 'Foundation', 'Structure'].map((task, index) => (
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  border-bottom: 1px solid ${theme.border};
                  padding-bottom: 2px;
                ">
                  <div style="
                    width: 40px;
                    font-size: 8px;
                    color: ${theme.timelineBarLabel.split(':')[1].trim()};
                  ">
                    ${task}
                  </div>
                  <div style="
                    flex: 1;
                    height: 8px;
                    background-color: ${theme.timelineBarTrack.split(':')[1].trim()};
                    border-radius: 2px;
                    position: relative;
                  ">
                    <div style="
                      height: 100%;
                      background-color: ${theme.timelineBarFill.split(':')[1].trim()};
                      border-radius: 2px;
                      width: ${30 + (index * 20)}%;
                      position: absolute;
                      left: ${index * 5}%;
                    "></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <!-- Footer -->
          <div style="
            position: absolute;
            bottom: 4px;
            left: 12px;
            right: 12px;
            text-align: center;
            font-size: 8px;
            opacity: 0.6;
            color: ${theme.footer.split(':')[1].trim()};
          ">
            ConstructBMS - Professional Construction Management
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Export print/export styling as CSS
   */
  exportPrintExportStylingAsCSS(settings: PrintExportStylingSettings): string {
    return `/* ConstructBMS Print/Export Styling */
${this.generatePrintExportStylingCSS(settings)}

/* Usage Examples */
.export-container {
  /* Apply print/export styling */
}

/* Custom Variables */
:root {
  --export-page-layout: "${settings.pageLayout}";
  --export-theme: "${settings.exportTheme}";
  --export-page-width: ${this.getPageLayoutDimensions(settings.pageLayout).width}mm;
  --export-page-height: ${this.getPageLayoutDimensions(settings.pageLayout).height}mm;
}

/* Print Media Query */
@media print {
  .export-container {
    width: 100% !important;
    height: auto !important;
  }
}
`;
  }

  /**
   * Reset print/export styling settings to defaults
   */
  async resetPrintExportStylingSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Print export styling settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting print export styling settings:', error);
      throw error;
    }
  }

  /**
   * Clear all print/export styling settings
   */
  async clearAllPrintExportStylingSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All print export styling settings cleared');
    } catch (error) {
      console.error('Error clearing print export styling settings:', error);
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
        await this.clearAllPrintExportStylingSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo print export styling data reset');
      }
    } catch (error) {
      console.error('Error resetting demo print export styling data:', error);
      throw error;
    }
  }
}

export const printExportStylingService = new PrintExportStylingService(); 