import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

// Task Calendar interfaces
export interface TaskCalendar {
  createdAt: Date;
  // ['2025-08-26', ...]
  createdBy: string;
  // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  dailyHours: { end: string; start: string };
  demo: boolean;
  // e.g. { start: '08:00', end: '17:00' }
  holidays: string[];
  id: string;
  isGlobal: boolean;
  name: string;
  projectId: string;
  updatedAt: Date;
  workingDays: string[];
}

export interface TaskCalendarAssignment {
  calendarId: string | null;
  projectId: string;
  taskId: string;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxCalendars: 1,
  defaultCalendarName: 'Weekend Work',
  defaultWorkingDays: ['Sat', 'Sun'],
  defaultDailyHours: { start: '09:00', end: '17:00' },
  defaultHolidays: ['2025-12-25'],
  tooltipMessage: 'Demo – Only default calendar editable',
  editingDisabled: true,
};

class TaskCalendarService {
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
      this.isDemoMode = await demoModeService.getDemoMode();
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
   * Get all calendars for a project
   */
  async getProjectCalendars(projectId: string): Promise<TaskCalendar[]> {
    try {
      const { data, error } = await supabase
        .from('programme_calendars')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (error) throw error;

      const calendars = data?.map(this.mapDatabaseCalendarToTaskCalendar) || [];

      // Apply demo mode restrictions
      if (this.isDemoMode) {
        return calendars.slice(0, DEMO_MODE_CONFIG.maxCalendars);
      }

      return calendars;
    } catch (error) {
      console.error('Error loading project calendars:', error);
      return [];
    }
  }

  /**
   * Get global calendars
   */
  async getGlobalCalendars(): Promise<TaskCalendar[]> {
    try {
      const { data, error } = await supabase
        .from('programme_calendars')
        .select('*')
        .eq('is_global', true)
        .order('name');

      if (error) throw error;

      return data?.map(this.mapDatabaseCalendarToTaskCalendar) || [];
    } catch (error) {
      console.error('Error loading global calendars:', error);
      return [];
    }
  }

  /**
   * Get calendar by ID
   */
  async getCalendarById(calendarId: string): Promise<TaskCalendar | null> {
    try {
      const { data, error } = await supabase
        .from('programme_calendars')
        .select('*')
        .eq('id', calendarId)
        .single();

      if (error || !data) return null;

      return this.mapDatabaseCalendarToTaskCalendar(data);
    } catch (error) {
      console.error('Error loading calendar:', error);
      return null;
    }
  }

  /**
   * Create a new calendar
   */
  async createCalendar(
    calendar: Omit<TaskCalendar, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskCalendar | null> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      if (DEMO_MODE_CONFIG.editingDisabled) {
        console.warn('Calendar creation disabled in demo mode');
        return null;
      }

      const existingCalendars = await this.getProjectCalendars(
        calendar.projectId
      );
      if (existingCalendars.length >= DEMO_MODE_CONFIG.maxCalendars) {
        console.warn('Maximum calendars reached for demo mode');
        return null;
      }
    }

    try {
      const now = new Date();
      const calendarData = {
        project_id: calendar.projectId,
        name: calendar.name,
        working_days: calendar.workingDays,
        daily_hours: calendar.dailyHours,
        holidays: calendar.holidays,
        created_by: calendar.createdBy,
        is_global: calendar.isGlobal,
        demo: this.isDemoMode,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      const { data, error } = await supabase
        .from('programme_calendars')
        .insert(calendarData)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseCalendarToTaskCalendar(data);
    } catch (error) {
      console.error('Error creating calendar:', error);
      return null;
    }
  }

  /**
   * Update an existing calendar
   */
  async updateCalendar(
    calendarId: string,
    updates: Partial<TaskCalendar>
  ): Promise<boolean> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      if (DEMO_MODE_CONFIG.editingDisabled) {
        console.warn('Calendar editing disabled in demo mode');
        return false;
      }
    }

    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.workingDays !== undefined)
        updateData.working_days = updates.workingDays;
      if (updates.dailyHours !== undefined)
        updateData.daily_hours = updates.dailyHours;
      if (updates.holidays !== undefined)
        updateData.holidays = updates.holidays;
      if (updates.isGlobal !== undefined)
        updateData.is_global = updates.isGlobal;

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('programme_calendars')
        .update(updateData)
        .eq('id', calendarId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating calendar:', error);
      return false;
    }
  }

  /**
   * Delete a calendar
   */
  async deleteCalendar(calendarId: string): Promise<boolean> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      console.warn('Calendar deletion disabled in demo mode');
      return false;
    }

    try {
      const { error } = await supabase
        .from('programme_calendars')
        .delete()
        .eq('id', calendarId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting calendar:', error);
      return false;
    }
  }

  /**
   * Assign calendar to task
   */
  async assignCalendarToTask(
    taskId: string,
    calendarId: string | null
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update({ calendar_id: calendarId })
        .eq('id', taskId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error assigning calendar to task:', error);
      return false;
    }
  }

  /**
   * Get calendar assignment for task
   */
  async getTaskCalendarAssignment(
    taskId: string
  ): Promise<TaskCalendarAssignment | null> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select('id, calendar_id, project_id')
        .eq('id', taskId)
        .single();

      if (error || !data) return null;

      return {
        taskId: data.id,
        calendarId: data.calendar_id,
        projectId: data.project_id,
      };
    } catch (error) {
      console.error('Error getting task calendar assignment:', error);
      return null;
    }
  }

  /**
   * Check if a date is a working day for a specific calendar
   */
  async isWorkingDay(date: Date, calendarId: string): Promise<boolean> {
    try {
      const calendar = await this.getCalendarById(calendarId);
      if (!calendar) return true; // Default to working day if no calendar

      // Check if it's a working day of the week
      const dayOfWeek = this.getDayOfWeek(date);
      if (!calendar.workingDays.includes(dayOfWeek)) {
        return false;
      }

      // Check if it's a holiday
      const dateString = date.toISOString().split('T')[0];
      if (calendar.holidays.includes(dateString)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking working day:', error);
      return true; // Default to working day on error
    }
  }

  /**
   * Calculate working days between two dates for a specific calendar
   */
  async getWorkingDaysBetween(
    startDate: Date,
    endDate: Date,
    calendarId: string
  ): Promise<number> {
    try {
      let workingDays = 0;
      const current = new Date(startDate);

      while (current <= endDate) {
        if (await this.isWorkingDay(current, calendarId)) {
          workingDays++;
        }
        current.setDate(current.getDate() + 1);
      }

      return workingDays;
    } catch (error) {
      console.error('Error calculating working days:', error);
      return (
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      );
    }
  }

  /**
   * Add working days to a date for a specific calendar
   */
  async addWorkingDays(
    startDate: Date,
    workingDays: number,
    calendarId: string
  ): Promise<Date> {
    try {
      let current = new Date(startDate);
      let daysAdded = 0;

      while (daysAdded < workingDays) {
        current.setDate(current.getDate() + 1);
        if (await this.isWorkingDay(current, calendarId)) {
          daysAdded++;
        }
      }

      return current;
    } catch (error) {
      console.error('Error adding working days:', error);
      // Fallback to simple date addition
      const result = new Date(startDate);
      result.setDate(result.getDate() + workingDays);
      return result;
    }
  }

  /**
   * Create default demo calendar
   */
  async createDefaultDemoCalendar(
    projectId: string
  ): Promise<TaskCalendar | null> {
    if (!this.isDemoMode) return null;

    const defaultCalendar: Omit<
      TaskCalendar,
      'id' | 'createdAt' | 'updatedAt'
    > = {
      projectId,
      name: DEMO_MODE_CONFIG.defaultCalendarName,
      workingDays: DEMO_MODE_CONFIG.defaultWorkingDays,
      dailyHours: DEMO_MODE_CONFIG.defaultDailyHours,
      holidays: DEMO_MODE_CONFIG.defaultHolidays,
      createdBy: 'demo-user',
      isGlobal: false,
      demo: true,
    };

    return this.createCalendar(defaultCalendar);
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return {
      ...DEMO_MODE_CONFIG,
      isDemoMode: this.isDemoMode,
    };
  }

  /**
   * Helper method to map database calendar to TaskCalendar interface
   */
  private mapDatabaseCalendarToTaskCalendar(data: any): TaskCalendar {
    return {
      id: data.id,
      projectId: data.project_id,
      name: data.name,
      workingDays: data.working_days,
      dailyHours: data.daily_hours,
      holidays: data.holidays,
      createdBy: data.created_by,
      isGlobal: data.is_global,
      demo: data.demo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Helper method to get day of week string
   */
  private getDayOfWeek(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
}

export const taskCalendarService = new TaskCalendarService();
