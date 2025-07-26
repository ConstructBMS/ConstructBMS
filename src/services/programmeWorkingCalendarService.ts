import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

// Types for working calendars
export interface ProgrammeCalendar {
  createdAt: Date;
  createdBy?: string;
  demo?: boolean;
  id: string;
  name: string;
  projectId: string;
  // e.g. '08:00'
  shiftEnd: string;
  // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  shiftStart: string;
  updatedAt: Date;
  // e.g. '16:00'
  useGlobalHolidays: boolean;
  workdays: string[];
}

export interface CalendarException {
  calendarId: string;
  createdAt: Date;
  createdBy?: string;
  customShiftEnd?: string;
  customShiftStart?: string;
  date: string;
  demo?: boolean;
  description?: string;
  id: string;
  // YYYY-MM-DD format
  type: 'non-working' | 'custom-shift';
}

export interface GlobalHoliday {
  // YYYY-MM-DD format
  country: string;
  createdAt: Date;
  date: string;
  id: string;
  isActive: boolean;
  name: string;
  updatedAt: Date;
}

export interface WorkingTime {
  customShiftEnd?: string;
  customShiftStart?: string;
  description?: string;
  end: string;
  isCustomShift: boolean;
  isHoliday: boolean;
  isWorkingDay: boolean;
  start: string;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxCustomDates: 3,
  fixedShiftHours: { start: '08:00', end: '16:00' },
  tooltipMessage: 'Demo calendar – full control disabled',
  calendarStateTag: 'demo',
  editingRestrictions: [
    'Only 1 calendar editable',
    'Max 3 custom dates allowed',
    'Shift hours fixed (08:00–16:00)',
    'Limited holiday management',
  ],
};

class ProgrammeWorkingCalendarService {
  private isDemoMode = false;

  constructor() {
    // Initialize demo mode status asynchronously
    this.checkDemoMode().catch(error => {
      console.warn('Error initializing demo mode status:', error);
      this.isDemoMode = this.checkDemoModeManually();
    });
  }

  private async checkDemoMode() {
    try {
      // Check if demoModeService is available and has the isDemoMode method
      if (demoModeService && typeof demoModeService.isDemoMode === 'function') {
        this.isDemoMode = await demoModeService.isDemoMode();
      } else {
        // Fallback: check demo mode manually
        this.isDemoMode = this.checkDemoModeManually();
      }
    } catch (error) {
      console.warn('Error checking demo mode, using fallback:', error);
      this.isDemoMode = this.checkDemoModeManually();
    }
  }

  private checkDemoModeManually(): boolean {
    // Check environment variables, user role, or other indicators
    const envDemoMode =
      process.env.NODE_ENV === 'development' ||
      process.env.REACT_APP_DEMO_MODE === 'true';

    // Check localStorage for demo mode setting
    const localStorageDemoMode = localStorage.getItem('demo_mode') === 'true';

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlDemoMode = urlParams.get('demo') === 'true';

    return envDemoMode || localStorageDemoMode || urlDemoMode;
  }

  /**
   * Get demo mode restrictions
   */
  getDemoModeRestrictions(): string[] {
    return DEMO_MODE_CONFIG.editingRestrictions;
  }

  /**
   * Update demo mode status (can be called if demoModeService becomes available later)
   */
  async updateDemoModeStatus(): Promise<void> {
    await this.checkDemoMode();
  }

  /**
   * Get current demo mode status
   */
  getCurrentDemoModeStatus(): boolean {
    return this.isDemoMode;
  }

  /**
   * Get calendar for project
   */
  async getCalendarForProject(
    projectId: string
  ): Promise<ProgrammeCalendar | null> {
    try {
      const { data, error } = await supabase
        .from('programme_calendars')
        .select('*')
        .eq('project_id', projectId)
        .eq('name', 'Default')
        .single();

      if (error || !data) {
        // Create default calendar if none exists
        return this.createDefaultCalendar(projectId);
      }

      const calendar: ProgrammeCalendar = {
        id: data.id,
        projectId: data.project_id,
        name: data.name,
        workdays: data.workdays,
        shiftStart: data.shift_start,
        shiftEnd: data.shift_end,
        useGlobalHolidays: data.use_global_holidays,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        demo: data.demo,
      };

      // Apply demo mode restrictions
      if (this.isDemoMode) {
        calendar.shiftStart = DEMO_MODE_CONFIG.fixedShiftHours.start;
        calendar.shiftEnd = DEMO_MODE_CONFIG.fixedShiftHours.end;
        calendar.demo = true;
      }

      return calendar;
    } catch (error) {
      console.error('Error loading calendar:', error);
      return this.createDefaultCalendar(projectId);
    }
  }

  /**
   * Create default calendar for project
   */
  private async createDefaultCalendar(
    projectId: string
  ): Promise<ProgrammeCalendar> {
    const defaultCalendar: Omit<
      ProgrammeCalendar,
      'id' | 'createdAt' | 'updatedAt'
    > = {
      projectId,
      name: 'Default',
      workdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      shiftStart: this.isDemoMode
        ? DEMO_MODE_CONFIG.fixedShiftHours.start
        : '08:00',
      shiftEnd: this.isDemoMode
        ? DEMO_MODE_CONFIG.fixedShiftHours.end
        : '16:00',
      useGlobalHolidays: true,
      demo: this.isDemoMode,
    };

    const result = await this.saveCalendar(defaultCalendar);
    if (result.success && result.calendar) {
      return result.calendar;
    }

    // Return local copy if save failed
    return {
      ...defaultCalendar,
      id: `temp_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Save calendar
   */
  async saveCalendar(
    calendar: Omit<ProgrammeCalendar, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{
    calendar?: ProgrammeCalendar;
    error?: string;
    success: boolean;
  }> {
    try {
      // Check demo mode restrictions
      if (this.isDemoMode) {
        if (
          calendar.shiftStart !== DEMO_MODE_CONFIG.fixedShiftHours.start ||
          calendar.shiftEnd !== DEMO_MODE_CONFIG.fixedShiftHours.end
        ) {
          return {
            success: false,
            error: 'Shift hours are fixed in demo mode',
          };
        }
      }

      const now = new Date();
      const calendarData = {
        project_id: calendar.projectId,
        name: calendar.name,
        workdays: calendar.workdays,
        shift_start: calendar.shiftStart,
        shift_end: calendar.shiftEnd,
        use_global_holidays: calendar.useGlobalHolidays,
        created_by: calendar.createdBy || 'current-user',
        updated_at: now.toISOString(),
        demo: this.isDemoMode,
      };

      const { data, error } = await supabase
        .from('programme_calendars')
        .upsert(calendarData)
        .select()
        .single();

      if (error) throw error;

      const savedCalendar: ProgrammeCalendar = {
        id: data.id,
        projectId: data.project_id,
        name: data.name,
        workdays: data.workdays,
        shiftStart: data.shift_start,
        shiftEnd: data.shift_end,
        useGlobalHolidays: data.use_global_holidays,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        demo: data.demo,
      };

      return { success: true, calendar: savedCalendar };
    } catch (error) {
      console.error('Error saving calendar:', error);
      return { success: false, error: 'Failed to save calendar' };
    }
  }

  /**
   * Get calendar exceptions
   */
  async getCalendarExceptions(
    calendarId: string
  ): Promise<CalendarException[]> {
    try {
      const { data, error } = await supabase
        .from('programme_calendar_exceptions')
        .select('*')
        .eq('calendar_id', calendarId)
        .order('date', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        calendarId: item.calendar_id,
        date: item.date,
        type: item.type,
        customShiftStart: item.custom_shift_start,
        customShiftEnd: item.custom_shift_end,
        description: item.description,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        demo: item.demo,
      }));
    } catch (error) {
      console.error('Error loading calendar exceptions:', error);
      return [];
    }
  }

  /**
   * Add calendar exception
   */
  async addCalendarException(
    exception: Omit<CalendarException, 'id' | 'createdAt'>
  ): Promise<{
    error?: string;
    exception?: CalendarException;
    success: boolean;
  }> {
    try {
      // Check demo mode restrictions
      if (this.isDemoMode) {
        const existingExceptions = await this.getCalendarExceptions(
          exception.calendarId
        );
        if (existingExceptions.length >= DEMO_MODE_CONFIG.maxCustomDates) {
          return {
            success: false,
            error: `Maximum ${DEMO_MODE_CONFIG.maxCustomDates} custom dates allowed in demo mode`,
          };
        }
      }

      const exceptionData = {
        calendar_id: exception.calendarId,
        date: exception.date,
        type: exception.type,
        custom_shift_start: exception.customShiftStart,
        custom_shift_end: exception.customShiftEnd,
        description: exception.description,
        created_by: exception.createdBy || 'current-user',
        demo: this.isDemoMode,
      };

      const { data, error } = await supabase
        .from('programme_calendar_exceptions')
        .insert(exceptionData)
        .select()
        .single();

      if (error) throw error;

      const savedException: CalendarException = {
        id: data.id,
        calendarId: data.calendar_id,
        date: data.date,
        type: data.type,
        customShiftStart: data.custom_shift_start,
        customShiftEnd: data.custom_shift_end,
        description: data.description,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        demo: data.demo,
      };

      return { success: true, exception: savedException };
    } catch (error) {
      console.error('Error adding calendar exception:', error);
      return { success: false, error: 'Failed to add calendar exception' };
    }
  }

  /**
   * Remove calendar exception
   */
  async removeCalendarException(
    exceptionId: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('programme_calendar_exceptions')
        .delete()
        .eq('id', exceptionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing calendar exception:', error);
      return { success: false, error: 'Failed to remove calendar exception' };
    }
  }

  /**
   * Get global holidays
   */
  async getGlobalHolidays(): Promise<GlobalHoliday[]> {
    try {
      const { data, error } = await supabase
        .from('global_holidays')
        .select('*')
        .eq('is_active', true)
        .eq('country', 'GBR')
        .order('date', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        date: item.date,
        country: item.country,
        isActive: item.is_active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Error loading global holidays:', error);
      return [];
    }
  }

  /**
   * Check if a date is a working day
   */
  async isWorkingDay(date: Date, projectId: string): Promise<WorkingTime> {
    try {
      const calendar = await this.getCalendarForProject(projectId);
      if (!calendar) {
        return {
          start: '08:00',
          end: '16:00',
          isWorkingDay: true,
          isHoliday: false,
          isCustomShift: false,
        };
      }

      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = this.getDayOfWeek(date);

      // Check if it's a working day of the week
      const isWorkingDayOfWeek = calendar.workdays.includes(dayOfWeek);

      // Check for custom exceptions
      const exceptions = await this.getCalendarExceptions(calendar.id);
      const exception = exceptions.find(ex => ex.date === dateString);

      if (exception) {
        if (exception.type === 'non-working') {
          return {
            start: calendar.shiftStart,
            end: calendar.shiftEnd,
            isWorkingDay: false,
            isHoliday: false,
            isCustomShift: false,
            description: exception.description,
          };
        } else if (exception.type === 'custom-shift') {
          return {
            start: exception.customShiftStart || calendar.shiftStart,
            end: exception.customShiftEnd || calendar.shiftEnd,
            isWorkingDay: true,
            isHoliday: false,
            isCustomShift: true,
            customShiftStart: exception.customShiftStart,
            customShiftEnd: exception.customShiftEnd,
            description: exception.description,
          };
        }
      }

      // Check for global holidays
      if (calendar.useGlobalHolidays && isWorkingDayOfWeek) {
        const globalHolidays = await this.getGlobalHolidays();
        const isGlobalHoliday = globalHolidays.some(
          holiday => holiday.date === dateString
        );

        if (isGlobalHoliday) {
          return {
            start: calendar.shiftStart,
            end: calendar.shiftEnd,
            isWorkingDay: false,
            isHoliday: true,
            isCustomShift: false,
          };
        }
      }

      return {
        start: calendar.shiftStart,
        end: calendar.shiftEnd,
        isWorkingDay: isWorkingDayOfWeek,
        isHoliday: false,
        isCustomShift: false,
      };
    } catch (error) {
      console.error('Error checking working day:', error);
      return {
        start: '08:00',
        end: '16:00',
        isWorkingDay: true,
        isHoliday: false,
        isCustomShift: false,
      };
    }
  }

  /**
   * Get non-working days for a date range
   */
  async getNonWorkingDays(
    startDate: Date,
    endDate: Date,
    projectId: string
  ): Promise<Date[]> {
    const nonWorkingDays: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const workingTime = await this.isWorkingDay(currentDate, projectId);
      if (!workingTime.isWorkingDay) {
        nonWorkingDays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return nonWorkingDays;
  }

  /**
   * Get day of week abbreviation
   */
  private getDayOfWeek(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  /**
   * Get shift pattern display name
   */
  getShiftPatternDisplayName(workdays: string[]): string {
    if (
      workdays.length === 5 &&
      workdays.includes('Mon') &&
      workdays.includes('Fri')
    ) {
      return '5-Day Week (Mon-Fri)';
    } else if (
      workdays.length === 6 &&
      workdays.includes('Mon') &&
      workdays.includes('Sat')
    ) {
      return '6-Day Week (Mon-Sat)';
    } else if (workdays.length === 7) {
      return '7-Day Week';
    } else if (workdays.length === 1) {
      return `${workdays[0]} Only`;
    } else {
      return `${workdays.length}-Day Week`;
    }
  }

  /**
   * Format exception tooltip
   */
  formatExceptionTooltip(
    exception: CalendarException,
    isDemoMode: boolean
  ): string {
    const date = new Date(exception.date);
    const formattedDate = date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let tooltip = `${formattedDate}\n`;

    if (exception.type === 'non-working') {
      tooltip += 'Non-working day';
    } else if (exception.type === 'custom-shift') {
      tooltip += `Custom shift: ${exception.customShiftStart} - ${exception.customShiftEnd}`;
    }

    if (exception.description) {
      tooltip += `\n${exception.description}`;
    }

    if (isDemoMode && exception.demo) {
      tooltip += '\n\nDemo mode - limited editing';
    }

    return tooltip;
  }
}

export const programmeWorkingCalendarService =
  new ProgrammeWorkingCalendarService();
