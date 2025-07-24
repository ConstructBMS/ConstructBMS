import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { taskCalendarService, TaskCalendar } from '../../services/taskCalendarService';
import { demoModeService } from '../../services/demoModeService';

interface TaskScheduleTabProps {
  taskId: string;
  projectId: string;
  isDemoMode?: boolean;
}

const TaskScheduleTab: React.FC<TaskScheduleTabProps> = ({
  taskId,
  projectId,
  isDemoMode = false
}) => {
  const { canAccess } = usePermissions();
  const [availableCalendars, setAvailableCalendars] = useState<TaskCalendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<TaskCalendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess('programme.calendar.view');
  const canAssign = canAccess('programme.calendar.assign');

  // Load data on mount
  useEffect(() => {
    if (taskId && projectId) {
      loadCalendarData();
    }
  }, [taskId, projectId]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load available calendars
      const projectCalendars = await taskCalendarService.getProjectCalendars(projectId);
      const globalCalendars = await taskCalendarService.getGlobalCalendars();
      const allCalendars = [...projectCalendars, ...globalCalendars];
      
      setAvailableCalendars(allCalendars);

      // Load current task calendar assignment
      const assignment = await taskCalendarService.getTaskCalendarAssignment(taskId);
      if (assignment) {
        setSelectedCalendarId(assignment.calendarId);
        
        if (assignment.calendarId) {
          const calendar = await taskCalendarService.getCalendarById(assignment.calendarId);
          setSelectedCalendar(calendar);
        }
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarChange = async (calendarId: string | null) => {
    if (!canAssign) return;

    try {
      setSaving(true);
      setError(null);

      const success = await taskCalendarService.assignCalendarToTask(taskId, calendarId);
      
      if (success) {
        setSelectedCalendarId(calendarId);
        
        if (calendarId) {
          const calendar = await taskCalendarService.getCalendarById(calendarId);
          setSelectedCalendar(calendar);
        } else {
          setSelectedCalendar(null);
        }
      } else {
        setError('Failed to assign calendar to task');
      }
    } catch (error) {
      console.error('Error assigning calendar:', error);
      setError('Failed to assign calendar to task');
    } finally {
      setSaving(false);
    }
  };

  const getDayOfWeekLabel = (day: string): string => {
    const dayLabels: { [key: string]: string } = {
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday'
    };
    return dayLabels[day] || day;
  };

  const getHolidayLabel = (date: string): string => {
    const holidayDate = new Date(date);
    const today = new Date();
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return holidayDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Schedule</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Schedule</h3>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Calendar Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Assigned Calendar
        </label>
        <select
          value={selectedCalendarId || ''}
          onChange={(e) => handleCalendarChange(e.target.value || null)}
          disabled={!canAssign || saving || isDemoMode}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
        >
          <option value="">No Calendar Assigned</option>
          {availableCalendars.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.name} {calendar.isGlobal ? '(Global)' : ''}
            </option>
          ))}
        </select>
        {saving && (
          <p className="mt-1 text-sm text-gray-500">Saving...</p>
        )}
      </div>

      {/* Calendar Preview */}
      {selectedCalendar && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              {selectedCalendar.name}
            </h4>
            {selectedCalendar.isGlobal && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Global
              </span>
            )}
            {selectedCalendar.demo && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Demo
              </span>
            )}
          </div>

          {/* Working Days */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Working Days
            </h5>
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const isWorking = selectedCalendar.workingDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`p-2 text-center text-xs font-medium rounded ${
                      isWorking
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Hours */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Hours
            </h5>
            <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <ClockIcon className="w-4 h-4" />
              <span>
                {selectedCalendar.dailyHours.start} - {selectedCalendar.dailyHours.end}
              </span>
            </div>
          </div>

          {/* Holidays */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Holidays ({selectedCalendar.holidays.length})
            </h5>
            {selectedCalendar.holidays.length > 0 ? (
              <div className="space-y-1">
                {selectedCalendar.holidays.slice(0, 5).map((holiday) => (
                  <div
                    key={holiday}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {new Date(holiday).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {getHolidayLabel(holiday)}
                    </span>
                  </div>
                ))}
                {selectedCalendar.holidays.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{selectedCalendar.holidays.length - 5} more holidays
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No holidays defined
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Calendar Assigned */}
      {!selectedCalendar && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-1">
              No Calendar Assigned
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This task will use the default project calendar
            </p>
          </div>
        </div>
      )}

      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm">Demo Mode - Calendar assignment is limited</span>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">How Task Calendars Work</p>
            <ul className="space-y-1 text-xs">
              <li>• Tasks respect their assigned calendar for duration calculations</li>
              <li>• Non-working days are excluded from task schedules</li>
              <li>• Global calendars are available across all projects</li>
              <li>• Tasks without assigned calendars use the project default</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskScheduleTab; 