import { supabase } from './supabase';

// Calendar interfaces
export interface WorkingCalendar {
  createdAt: Date;
  // ['2025-08-26', '2025-12-25']
  createdBy: string;
  demo?: boolean;
  // [1,2,3,4,5] = Mon–Fri
  holidays: string[]; 
  id: string; 
  name: string;
  projectId: string;
  updatedAt: Date;
  workingDays: number[];
}

export interface Holiday {
  date: string; // YYYY-MM-DD format
  label: string;
  type: 'holiday' | 'weekend' | 'custom';
}

export interface CalendarPreferences {
  demo: boolean;
  projectId: string;
  selectedCalendarId: string | null;
  showNonWorkingDays: boolean;
  userId: string;
}

// Default calendar configuration
const DEFAULT_CALENDAR: WorkingCalendar = {
  id: 'default',
  projectId: 'global',
  name: 'Default Working Calendar',
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  holidays: [],
  createdBy: 'system',
  createdAt: new Date(),
  updatedAt: new Date(),
  demo: false
};

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxHolidays: 2,
  lockedWorkingDays: [1, 2, 3, 4, 5], // Mon-Fri only
  tooltipMessage: 'DEMO CALENDAR – Limited Editing',
  calendarStateTag: 'demo',
  editingDisabled: true
};

class CalendarService {
  private calendars: Map<string, WorkingCalendar> = new Map();
  private preferences: CalendarPreferences;
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
    this.preferences = {
      userId: 'current-user',
      projectId: 'current-project',
      showNonWorkingDays: true,
      selectedCalendarId: null,
      demo: this.isDemoMode
    };
    
    // Initialize with default calendar
    this.calendars.set('default', DEFAULT_CALENDAR);
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Get calendar for project
   */
  async getCalendarForProject(projectId: string): Promise<WorkingCalendar> {
    try {
      const { data, error } = await supabase
        .from('programme_calendars')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        // Return default calendar if none exists
        return DEFAULT_CALENDAR;
      }

      const calendar: WorkingCalendar = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Apply demo mode restrictions
      if (this.isDemoMode) {
        calendar.workingDays = DEMO_MODE_CONFIG.lockedWorkingDays;
        calendar.holidays = calendar.holidays.slice(0, DEMO_MODE_CONFIG.maxHolidays);
        calendar.demo = true;
      }

      this.calendars.set(projectId, calendar);
      return calendar;
    } catch (error) {
      console.error('Error loading calendar:', error);
      return DEFAULT_CALENDAR;
    }
  }

  /**
   * Save calendar for project
   */
  async saveCalendar(calendar: Omit<WorkingCalendar, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      if (DEMO_MODE_CONFIG.editingDisabled) {
        console.warn('Calendar editing disabled in demo mode');
        return false;
      }
      if (calendar.holidays.length > DEMO_MODE_CONFIG.maxHolidays) {
        console.warn('Too many holidays for demo mode');
        return false;
      }
    }

    try {
      const now = new Date();
             const calendarData = {
         project_id: calendar.projectId,
         name: calendar.name || 'Working Calendar',
         working_days: calendar.workingDays,
         holidays: calendar.holidays,
         created_by: calendar.createdBy || 'current-user',
         updated_by: 'current-user', // This should come from auth context
         created_at: now.toISOString(),
         updated_at: now.toISOString(),
         demo: this.isDemoMode
       };

      const { error } = await supabase
        .from('programme_calendars')
        .upsert(calendarData);

      if (error) throw error;

      // Update local cache
      const savedCalendar: WorkingCalendar = {
        ...calendar,
        id: calendar.projectId,
        createdAt: now,
        updatedAt: now,
        demo: this.isDemoMode
      };
      this.calendars.set(calendar.projectId, savedCalendar);

      return true;
    } catch (error) {
      console.error('Error saving calendar:', error);
      return false;
    }
  }

  /**
   * Check if a date is a working day
   */
  isWorkingDay(date: Date, projectId: string = 'current-project'): boolean {
    const calendar = this.calendars.get(projectId) || DEFAULT_CALENDAR;
    
    // Check if it's a working day of the week
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (!calendar.workingDays.includes(dayOfWeek)) {
      return false;
    }

    // Check if it's a holiday
    const dateString = date.toISOString().split('T')[0] || '';
    if (calendar.holidays.includes(dateString)) {
      return false;
    }

    return true;
  }

  /**
   * Get next working day
   */
  getNextWorkingDay(date: Date, projectId: string = 'current-project'): Date {
    let nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    while (!this.isWorkingDay(nextDate, projectId)) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate;
  }

  /**
   * Get previous working day
   */
  getPreviousWorkingDay(date: Date, projectId: string = 'current-project'): Date {
    let prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    
    while (!this.isWorkingDay(prevDate, projectId)) {
      prevDate.setDate(prevDate.getDate() - 1);
    }
    
    return prevDate;
  }

  /**
   * Adjust date to nearest working day
   */
  adjustToWorkingDay(date: Date, projectId: string = 'current-project'): Date {
    if (this.isWorkingDay(date, projectId)) {
      return date;
    }

    // Try next working day first
    const nextWorkingDay = this.getNextWorkingDay(date, projectId);
    const prevWorkingDay = this.getPreviousWorkingDay(date, projectId);

    // Choose the closer one
    const nextDiff = Math.abs(nextWorkingDay.getTime() - date.getTime());
    const prevDiff = Math.abs(prevWorkingDay.getTime() - date.getTime());

    return nextDiff <= prevDiff ? nextWorkingDay : prevWorkingDay;
  }

  /**
   * Calculate working days between two dates
   */
  getWorkingDaysBetween(startDate: Date, endDate: Date, projectId: string = 'current-project'): number {
    let workingDays = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (this.isWorkingDay(current, projectId)) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }

  /**
   * Add working days to a date
   */
  addWorkingDays(date: Date, workingDays: number, projectId: string = 'current-project'): Date {
    let result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < workingDays) {
      result = this.getNextWorkingDay(result, projectId);
      addedDays++;
    }
    
    return result;
  }

  /**
   * Get holidays for a date range
   */
  getHolidaysInRange(startDate: Date, endDate: Date, projectId: string = 'current-project'): Holiday[] {
    const calendar = this.calendars.get(projectId) || DEFAULT_CALENDAR;
    const holidays: Holiday[] = [];
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateString = current.toISOString().split('T')[0] || '';
      
      if (calendar.holidays.includes(dateString)) {
        holidays.push({
          date: dateString,
          label: this.getHolidayLabel(dateString),
          type: 'holiday'
        });
      } else if (!this.isWorkingDay(current, projectId)) {
        holidays.push({
          date: dateString,
          label: this.getWeekendLabel(current),
          type: 'weekend'
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return holidays;
  }

  /**
   * Get holiday label
   */
  private getHolidayLabel(dateString: string): string {
    const date = new Date(dateString);
    const month = date.getMonth();
    const day = date.getDate();
    
    // Common holidays (simplified)
    if (month === 0 && day === 1) return 'New Year\'s Day';
    if (month === 6 && day === 4) return 'Independence Day';
    if (month === 11 && day === 25) return 'Christmas Day';
    if (month === 11 && day === 26) return 'Boxing Day';
    
    return 'Holiday';
  }

  /**
   * Get weekend label
   */
  private getWeekendLabel(date: Date): string {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 'Sunday' : 'Saturday';
  }

  /**
   * Get non-working days for rendering
   */
  getNonWorkingDays(startDate: Date, endDate: Date, projectId: string = 'current-project'): Date[] {
    const nonWorkingDays: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (!this.isWorkingDay(current, projectId)) {
        nonWorkingDays.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    
    return nonWorkingDays;
  }

  /**
   * Load calendar preferences
   */
  async loadPreferences(userId: string, projectId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('calendar_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        return;
      }

      this.preferences = {
        userId: data.user_id || 'current-user',
        projectId: data.project_id || 'current-project',
        showNonWorkingDays: data.show_non_working_days ?? true,
        selectedCalendarId: data.selected_calendar_id || null,
        demo: this.isDemoMode
      };
    } catch (error) {
      console.error('Error loading calendar preferences:', error);
    }
  }

  /**
   * Save calendar preferences
   */
  async savePreferences(): Promise<void> {
    try {
      const { error } = await supabase
        .from('calendar_preferences')
        .upsert({
          user_id: this.preferences.userId,
          project_id: this.preferences.projectId,
          show_non_working_days: this.preferences.showNonWorkingDays,
          selected_calendar_id: this.preferences.selectedCalendarId,
          demo: this.isDemoMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving calendar preferences:', error);
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(updates: Partial<CalendarPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): CalendarPreferences {
    return { ...this.preferences };
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Check if current mode is demo
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Get default calendar
   */
  getDefaultCalendar(): WorkingCalendar {
    return DEFAULT_CALENDAR;
  }

  /**
   * Get calendar change callback
   */
  onCalendarChange?: (calendar: WorkingCalendar) => void;

  /**
   * Cleanup
   */
  destroy(): void {
    this.calendars.clear();
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
