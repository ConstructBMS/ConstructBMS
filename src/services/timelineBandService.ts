import { supabase } from './supabase';

export interface TimelinePhase {
  color: string;
  created_at: string;
  created_by?: string;
  description?: string;
  end_date: string;
  id: string;
  is_active: boolean;
  name: string;
  project_id: string;
  sequence: number;
  start_date: string;
  updated_at: string;
}

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface TimelineScale {
  // pixels per unit
  labelFormat: string;
  level: ZoomLevel; 
  majorTickInterval: number;
  minorTickInterval: number;
  unitWidth: number;
}

export interface TimelineConfig {
  created_at: string;
  end_date: string;
  project_id: string;
  show_holidays: boolean;
  show_today_marker: boolean;
  show_weekends: boolean;
  start_date: string;
  updated_at: string;
  zoom_level: ZoomLevel;
}

class TimelineBandService {
  // Get timeline phases for a project
  async getTimelinePhases(projectId: string): Promise<TimelinePhase[]> {
    try {
      const { data, error } = await supabase
        .from('timeline_phases')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('sequence');

      if (error) {
        console.warn('Failed to fetch timeline phases from database:', error);
        return this.getDemoTimelinePhases(projectId);
      }

      return data || [];
    } catch (error) {
      console.warn('Get timeline phases failed:', error);
      return this.getDemoTimelinePhases(projectId);
    }
  }

  // Create new timeline phase
  async createTimelinePhase(phase: Omit<TimelinePhase, 'id' | 'created_at' | 'updated_at'>): Promise<TimelinePhase | null> {
    try {
      const { data, error } = await supabase
        .from('timeline_phases')
        .insert(phase)
        .select()
        .single();

      if (error) {
        console.warn('Failed to create timeline phase in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Create timeline phase failed:', error);
      return null;
    }
  }

  // Update timeline phase
  async updateTimelinePhase(phaseId: string, updates: Partial<TimelinePhase>): Promise<TimelinePhase | null> {
    try {
      const { data, error } = await supabase
        .from('timeline_phases')
        .update(updates)
        .eq('id', phaseId)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update timeline phase in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Update timeline phase failed:', error);
      return null;
    }
  }

  // Delete timeline phase
  async deleteTimelinePhase(phaseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('timeline_phases')
        .delete()
        .eq('id', phaseId);

      if (error) {
        console.warn('Failed to delete timeline phase from database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Delete timeline phase failed:', error);
      return false;
    }
  }

  // Get timeline configuration
  async getTimelineConfig(projectId: string): Promise<TimelineConfig | null> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.warn('No authenticated user found');
        return this.getDefaultTimelineConfig(projectId);
      }

      // Query by user_id first, then check if project_id matches
      const { data, error } = await supabase
        .from('asta_layout_states')
        .select('preferences, project_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('Failed to fetch timeline config from database:', error);
        return this.getDefaultTimelineConfig(projectId);
      }

      const preferences = data?.preferences || {};
      return {
        project_id: projectId,
        zoom_level: preferences.timeline_zoom_level || 'week',
        start_date: preferences.timeline_start_date || new Date().toISOString().split('T')[0],
        end_date: preferences.timeline_end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        show_today_marker: preferences.show_today_marker !== false,
        show_weekends: preferences.show_weekends !== false,
        show_holidays: preferences.show_holidays !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Get timeline config failed:', error);
      return this.getDefaultTimelineConfig(projectId);
    }
  }

  // Update timeline configuration
  async updateTimelineConfig(projectId: string, config: Partial<TimelineConfig>): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.warn('No authenticated user found');
        return false;
      }

      const { data: existingData } = await supabase
        .from('asta_layout_states')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      const currentPreferences = existingData?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        timeline_zoom_level: config.zoom_level,
        timeline_start_date: config.start_date,
        timeline_end_date: config.end_date,
        show_today_marker: config.show_today_marker,
        show_weekends: config.show_weekends,
        show_holidays: config.show_holidays
      };

      const { error } = await supabase
        .from('asta_layout_states')
        .upsert({
          user_id: user.id,
          project_id: projectId,
          preferences: updatedPreferences
        });

      if (error) {
        console.warn('Failed to update timeline config in database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Update timeline config failed:', error);
      return false;
    }
  }

  // Get zoom level configuration
  getZoomLevelConfig(level: ZoomLevel): TimelineScale {
    const configs: Record<ZoomLevel, TimelineScale> = {
      day: {
        level: 'day',
        unitWidth: 40,
        labelFormat: 'MMM D',
        majorTickInterval: 7,
        minorTickInterval: 1
      },
      week: {
        level: 'week',
        unitWidth: 60,
        labelFormat: 'MMM D',
        majorTickInterval: 4,
        minorTickInterval: 1
      },
      month: {
        level: 'month',
        unitWidth: 80,
        labelFormat: 'MMM YYYY',
        majorTickInterval: 3,
        minorTickInterval: 1
      },
      quarter: {
        level: 'quarter',
        unitWidth: 100,
        labelFormat: 'Q[Q] YYYY',
        majorTickInterval: 1,
        minorTickInterval: 1
      },
      year: {
        level: 'year',
        unitWidth: 120,
        labelFormat: 'YYYY',
        majorTickInterval: 1,
        minorTickInterval: 1
      }
    };

    return configs[level];
  }

  // Generate timeline ticks
  generateTimelineTicks(startDate: Date, endDate: Date, scale: TimelineScale): Date[] {
    const ticks: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      ticks.push(new Date(current));
      
      switch (scale.level) {
        case 'day':
          current.setDate(current.getDate() + scale.minorTickInterval);
          break;
        case 'week':
          current.setDate(current.getDate() + (7 * scale.minorTickInterval));
          break;
        case 'month':
          current.setMonth(current.getMonth() + scale.minorTickInterval);
          break;
        case 'quarter':
          current.setMonth(current.getMonth() + (3 * scale.minorTickInterval));
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + scale.minorTickInterval);
          break;
      }
    }
    
    return ticks;
  }

  // Calculate date position
  calculateDatePosition(date: Date, startDate: Date, scale: TimelineScale): number {
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (scale.level) {
      case 'day':
        return diffDays * scale.unitWidth;
      case 'week':
        return (diffDays / 7) * scale.unitWidth;
      case 'month':
        return (diffDays / 30.44) * scale.unitWidth;
      case 'quarter':
        return (diffDays / 91.31) * scale.unitWidth;
      case 'year':
        return (diffDays / 365.25) * scale.unitWidth;
      default:
        return diffDays * scale.unitWidth;
    }
  }

  // Format date label
  formatDateLabel(date: Date, format: string): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return format
      .replace('MMM', months[date.getMonth()] || '')
      .replace('MMMM', monthNames[date.getMonth()] || '')
      .replace('D', date.getDate().toString())
      .replace('DD', date.getDate().toString().padStart(2, '0'))
      .replace('YYYY', date.getFullYear().toString())
      .replace('Q[Q]', `Q${Math.floor(date.getMonth() / 3) + 1}`);
  }

  // Check if date is weekend
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  // Check if date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Get today's position
  getTodayPosition(startDate: Date, scale: TimelineScale): number {
    return this.calculateDatePosition(new Date(), startDate, scale);
  }

  // Get demo timeline phases
  private getDemoTimelinePhases(projectId: string): TimelinePhase[] {
    return [
      {
        id: crypto.randomUUID(),
        project_id: projectId,
        name: 'Planning',
        description: 'Project planning and design phase',
        start_date: '2024-01-15',
        end_date: '2024-02-15',
        color: '#3b82f6',
        sequence: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        project_id: projectId,
        name: 'Foundation',
        description: 'Foundation and structural work',
        start_date: '2024-02-16',
        end_date: '2024-03-31',
        color: '#10b981',
        sequence: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        project_id: projectId,
        name: 'Construction',
        description: 'Main construction phase',
        start_date: '2024-04-01',
        end_date: '2024-08-31',
        color: '#f59e0b',
        sequence: 3,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        project_id: projectId,
        name: 'Finishing',
        description: 'Interior finishing and QA',
        start_date: '2024-09-01',
        end_date: '2024-11-30',
        color: '#8b5cf6',
        sequence: 4,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        project_id: projectId,
        name: 'Handover',
        description: 'Final inspection and handover',
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        color: '#ef4444',
        sequence: 5,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Get default timeline configuration
  private getDefaultTimelineConfig(projectId: string): TimelineConfig {
    return {
      project_id: projectId,
      zoom_level: 'week',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      show_today_marker: true,
      show_weekends: true,
      show_holidays: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

export const timelineBandService = new TimelineBandService(); 