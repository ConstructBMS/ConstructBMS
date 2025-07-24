import { supabase } from './supabase';

export interface PrintSettings {
  border: boolean;
  dateRange: {
    end: string;
    start: string;
  };
  footer: {
    enabled: boolean;
    showDate: boolean;
    showPageNumbers: boolean;
  };
  frame: boolean;
  header: {
    enabled: boolean;
    showDate: boolean;
    title: string;
  };
  includeNotes: boolean;
  includeTaskTable: boolean;
  includeTimeline: boolean;
  margins: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  orientation: 'portrait' | 'landscape';
  paperSize: PaperSize;
}

export interface PrintProfile {
  created_at: string;
  description?: string;
  id: string;
  is_default: boolean;
  is_shared: boolean;
  name: string;
  project_id?: string;
  settings: PrintSettings;
  updated_at: string;
  user_id?: string;
}

export type PaperSize = 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom';

export interface PaperSizeOption {
  // mm
  description: string;
  // mm
  height: number;
  label: string; 
  value: PaperSize; 
  width: number;
}

export interface ExportOptions {
  // 1-3
  filename: string;
  format: 'pdf' | 'png' | 'jpg'; 
  quality: number; 
  // 1-100
  scale: number;
}

class PrintProfileService {
  // Get all paper size options
  getPaperSizeOptions(): PaperSizeOption[] {
    return [
      { value: 'A4', label: 'A4', width: 210, height: 297, description: 'Standard office paper' },
      { value: 'A3', label: 'A3', width: 297, height: 420, description: 'Large format printing' },
      { value: 'A2', label: 'A2', width: 420, height: 594, description: 'Poster size' },
      { value: 'A1', label: 'A1', width: 594, height: 841, description: 'Large poster' },
      { value: 'A0', label: 'A0', width: 841, height: 1189, description: 'Very large format' },
      { value: 'Letter', label: 'Letter', width: 216, height: 279, description: 'US standard' },
      { value: 'Legal', label: 'Legal', width: 216, height: 356, description: 'US legal size' },
      { value: 'Tabloid', label: 'Tabloid', width: 279, height: 432, description: 'US tabloid' },
      { value: 'Custom', label: 'Custom', width: 210, height: 297, description: 'Custom dimensions' }
    ];
  }

  // Get paper size option by value
  getPaperSizeOption(size: PaperSize): PaperSizeOption | undefined {
    return this.getPaperSizeOptions().find(option => option.value === size);
  }

  // Get default print settings
  getDefaultSettings(): PrintSettings {
    return {
      paperSize: 'A4',
      orientation: 'portrait',
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      includeTimeline: true,
      includeTaskTable: true,
      includeNotes: false,
      border: true,
      frame: false,
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        enabled: true,
        title: 'Project Schedule',
        showDate: true
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        showDate: true
      }
    };
  }

  // Get print profiles for a user/project
  async getPrintProfiles(userId?: string, projectId?: string): Promise<PrintProfile[]> {
    try {
      let query = supabase
        .from('print_profiles')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Failed to fetch print profiles from database:', error);
        return this.getDemoPrintProfiles(userId, projectId);
      }

      return data || [];
    } catch (error) {
      console.warn('Get print profiles failed:', error);
      return this.getDemoPrintProfiles(userId, projectId);
    }
  }

  // Create new print profile
  async createPrintProfile(profile: Omit<PrintProfile, 'id' | 'created_at' | 'updated_at'>): Promise<PrintProfile | null> {
    try {
      const { data, error } = await supabase
        .from('print_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.warn('Failed to create print profile in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Create print profile failed:', error);
      return null;
    }
  }

  // Update print profile
  async updatePrintProfile(profileId: string, updates: Partial<PrintProfile>): Promise<PrintProfile | null> {
    try {
      const { data, error } = await supabase
        .from('print_profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update print profile in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Update print profile failed:', error);
      return null;
    }
  }

  // Delete print profile
  async deletePrintProfile(profileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('print_profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        console.warn('Failed to delete print profile from database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Delete print profile failed:', error);
      return false;
    }
  }

  // Set default print profile
  async setDefaultPrintProfile(userId: string, profileId: string): Promise<boolean> {
    try {
      // First, unset all default profiles for this user
      await supabase
        .from('print_profiles')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the specified profile as default
      const { error } = await supabase
        .from('print_profiles')
        .update({ is_default: true })
        .eq('id', profileId);

      if (error) {
        console.warn('Failed to set default print profile in database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Set default print profile failed:', error);
      return false;
    }
  }

  // Get default print profile for user
  async getDefaultPrintProfile(userId: string): Promise<PrintProfile | null> {
    try {
      const { data, error } = await supabase
        .from('print_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        console.warn('Failed to fetch default print profile from database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Get default print profile failed:', error);
      return null;
    }
  }

  // Export to PDF (placeholder implementation)
  async exportToPDF(settings: PrintSettings, content: any): Promise<string | null> {
    try {
      // This would integrate with a PDF library like jsPDF or html2pdf
      console.log('Exporting to PDF with settings:', settings);
      
      // Placeholder: return a mock PDF URL
      return 'data:application/pdf;base64,mock-pdf-data';
    } catch (error) {
      console.error('PDF export failed:', error);
      return null;
    }
  }

  // Export to image (placeholder implementation)
  async exportToImage(settings: PrintSettings, content: any, format: 'png' | 'jpg'): Promise<string | null> {
    try {
      // This would integrate with html2canvas or similar
      console.log(`Exporting to ${format.toUpperCase()} with settings:`, settings);
      
      // Placeholder: return a mock image URL
      return `data:image/${format};base64,mock-image-data`;
    } catch (error) {
      console.error('Image export failed:', error);
      return null;
    }
  }

  // Generate print preview HTML
  generatePrintPreview(settings: PrintSettings, content: any): string {
    const paperSize = this.getPaperSizeOption(settings.paperSize);
    const isLandscape = settings.orientation === 'landscape';
    
    const width = isLandscape ? paperSize?.height : paperSize?.width;
    const height = isLandscape ? paperSize?.width : paperSize?.height;
    
    return `
      <div class="print-preview" style="
        width: ${width}mm;
        height: ${height}mm;
        margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
        border: ${settings.border ? '1px solid #000' : 'none'};
        padding: ${settings.frame ? '10px' : '0'};
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      ">
        ${settings.header.enabled ? `
          <div class="print-header" style="
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
            margin-bottom: 20px;
            text-align: center;
          ">
            <h1 style="margin: 0; font-size: 18px;">${settings.header.title}</h1>
            ${settings.header.showDate ? `<p style="margin: 5px 0 0 0; font-size: 12px;">${new Date().toLocaleDateString()}</p>` : ''}
          </div>
        ` : ''}
        
        <div class="print-content">
          ${settings.includeTimeline ? '<div class="timeline-section">[Timeline Content]</div>' : ''}
          ${settings.includeTaskTable ? '<div class="task-table-section">[Task Table Content]</div>' : ''}
          ${settings.includeNotes ? '<div class="notes-section">[Notes Content]</div>' : ''}
        </div>
        
        ${settings.footer.enabled ? `
          <div class="print-footer" style="
            border-top: 1px solid #ccc;
            padding-top: 10px;
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
          ">
            ${settings.footer.showPageNumbers ? '<span>Page 1</span>' : ''}
            ${settings.footer.showDate ? `<span style="margin-left: 20px;">${new Date().toLocaleDateString()}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Validate print settings
  validatePrintSettings(settings: PrintSettings): string[] {
    const errors: string[] = [];

    if (!settings.paperSize) {
      errors.push('Paper size is required');
    }

    if (!settings.dateRange.start || !settings.dateRange.end) {
      errors.push('Date range is required');
    }

    if (new Date(settings.dateRange.start) > new Date(settings.dateRange.end)) {
      errors.push('Start date must be before end date');
    }

    if (settings.margins.top < 0 || settings.margins.right < 0 || 
        settings.margins.bottom < 0 || settings.margins.left < 0) {
      errors.push('Margins must be non-negative');
    }

    if (!settings.includeTimeline && !settings.includeTaskTable && !settings.includeNotes) {
      errors.push('At least one content type must be selected');
    }

    return errors;
  }

  // Get demo print profiles
  private getDemoPrintProfiles(userId?: string, projectId?: string): PrintProfile[] {
    return [
      {
        id: 'profile-1',
        name: 'Standard A4 Portrait',
        description: 'Default A4 portrait layout with all components',
        user_id: userId,
        project_id: projectId,
        settings: this.getDefaultSettings(),
        is_default: true,
        is_shared: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'profile-2',
        name: 'Landscape Gantt',
        description: 'Landscape layout optimized for Gantt charts',
        user_id: userId,
        project_id: projectId,
        settings: {
          ...this.getDefaultSettings(),
          paperSize: 'A3',
          orientation: 'landscape',
          includeTaskTable: false,
          frame: true,
          margins: { top: 15, right: 15, bottom: 15, left: 15 },
          header: { enabled: true, title: 'Gantt Chart', showDate: true },
          footer: { enabled: true, showPageNumbers: true, showDate: false }
        },
        is_default: false,
        is_shared: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'profile-3',
        name: 'Task Table Only',
        description: 'Portrait layout showing only task table',
        user_id: userId,
        project_id: projectId,
        settings: {
          ...this.getDefaultSettings(),
          includeTimeline: false,
          includeNotes: true,
          border: false,
          margins: { top: 25, right: 25, bottom: 25, left: 25 },
          header: { enabled: false, title: '', showDate: false }
        },
        is_default: false,
        is_shared: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export const printProfileService = new PrintProfileService(); 