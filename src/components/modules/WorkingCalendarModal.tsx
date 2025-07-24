import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { programmeWorkingCalendarService, type ProgrammeCalendar, type CalendarException, type GlobalHoliday } from '../../services/programmeWorkingCalendarService';
import { demoModeService } from '../../services/demoModeService';

interface WorkingCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSave?: (calendar: ProgrammeCalendar) => void;
}

const WorkingCalendarModal: React.FC<WorkingCalendarModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSave
}) => {
  const { canAccess } = usePermissions();
  const [calendar, setCalendar] = useState<ProgrammeCalendar | null>(null);
  const [exceptions, setExceptions] = useState<CalendarException[]>([]);
  const [globalHolidays, setGlobalHolidays] = useState<GlobalHoliday[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = canAccess('programme.calendar.edit');
  const canView = canAccess('programme.calendar.view');

  // Day options for workdays
  const dayOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' }
  ];

  // Load data on mount
  useEffect(() => {
    if (isOpen && projectId) {
      loadCalendarData();
    }
  }, [isOpen, projectId]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check demo mode
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);

      // Load calendar
      const projectCalendar = await programmeWorkingCalendarService.getCalendarForProject(projectId);
      if (projectCalendar) {
        setCalendar(projectCalendar);
        
        // Load exceptions
        const calendarExceptions = await programmeWorkingCalendarService.getCalendarExceptions(projectCalendar.id);
        setExceptions(calendarExceptions);
      }

      // Load global holidays
      const holidays = await programmeWorkingCalendarService.getGlobalHolidays();
      setGlobalHolidays(holidays);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkdayToggle = (day: string) => {
    if (!calendar || !canEdit) return;

    const newWorkdays = calendar.workdays.includes(day)
      ? calendar.workdays.filter(d => d !== day)
      : [...calendar.workdays, day].sort((a, b) => {
          const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          return order.indexOf(a) - order.indexOf(b);
        });

    setCalendar({
      ...calendar,
      workdays: newWorkdays
    });
  };

  const handleShiftTimeChange = (field: 'shiftStart' | 'shiftEnd', value: string) => {
    if (!calendar || !canEdit) return;

    setCalendar({
      ...calendar,
      [field]: value
    });
  };

  const handleGlobalHolidaysToggle = () => {
    if (!calendar || !canEdit) return;

    setCalendar({
      ...calendar,
      useGlobalHolidays: !calendar.useGlobalHolidays
    });
  };

  const handleAddException = () => {
    if (!calendar || !canEdit) return;

    const today = new Date().toISOString().split('T')[0];
    const newException: Omit<CalendarException, 'id' | 'createdAt'> = {
      calendarId: calendar.id,
      date: today,
      type: 'non-working',
      description: ''
    };

    addCalendarException(newException);
  };

  const addCalendarException = async (exception: Omit<CalendarException, 'id' | 'createdAt'>) => {
    try {
      const result = await programmeWorkingCalendarService.addCalendarException(exception);
      
      if (result.success && result.exception) {
        setExceptions(prev => [...prev, result.exception!]);
      } else {
        setError(result.error || 'Failed to add exception');
      }
    } catch (error) {
      console.error('Error adding exception:', error);
      setError('Failed to add exception');
    }
  };

  const handleRemoveException = async (exceptionId: string) => {
    try {
      const result = await programmeWorkingCalendarService.removeCalendarException(exceptionId);
      
      if (result.success) {
        setExceptions(prev => prev.filter(ex => ex.id !== exceptionId));
      } else {
        setError(result.error || 'Failed to remove exception');
      }
    } catch (error) {
      console.error('Error removing exception:', error);
      setError('Failed to remove exception');
    }
  };

  const handleSave = async () => {
    if (!calendar || !canEdit) return;

    try {
      setSaving(true);
      setError(null);

      const result = await programmeWorkingCalendarService.saveCalendar({
        projectId: calendar.projectId,
        name: calendar.name,
        workdays: calendar.workdays,
        shiftStart: calendar.shiftStart,
        shiftEnd: calendar.shiftEnd,
        useGlobalHolidays: calendar.useGlobalHolidays,
        createdBy: calendar.createdBy
      });

      if (result.success && result.calendar) {
        setCalendar(result.calendar);
        if (onSave) {
          onSave(result.calendar);
        }
        onClose();
      } else {
        setError(result.error || 'Failed to save calendar');
      }
    } catch (error) {
      console.error('Error saving calendar:', error);
      setError('Failed to save calendar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExceptionTypeLabel = (type: 'non-working' | 'custom-shift'): string => {
    return type === 'non-working' ? 'Non-working' : 'Custom Shift';
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Working Calendar
            </h2>
            {isDemoMode && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Demo Mode Warning */}
          {isDemoMode && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Demo Mode Restrictions:</p>
                  <ul className="mt-1 space-y-1">
                    {programmeWorkingCalendarService.getDemoModeRestrictions().map((restriction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {calendar && (
            <div className="space-y-6">
              {/* Working Days */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Working Days</h3>
                <div className="grid grid-cols-7 gap-2">
                  {dayOptions.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => handleWorkdayToggle(day.value)}
                      disabled={!canEdit || isDemoMode}
                      className={`p-3 border rounded-md text-sm font-medium transition-colors ${
                        calendar.workdays.includes(day.value)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                      } ${
                        !canEdit || isDemoMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Pattern: {programmeWorkingCalendarService.getShiftPatternDisplayName(calendar.workdays)}
                </p>
              </div>

              {/* Shift Times */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shift Times</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={calendar.shiftStart}
                      onChange={(e) => handleShiftTimeChange('shiftStart', e.target.value)}
                      disabled={!canEdit || isDemoMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !canEdit || isDemoMode ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={calendar.shiftEnd}
                      onChange={(e) => handleShiftTimeChange('shiftEnd', e.target.value)}
                      disabled={!canEdit || isDemoMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !canEdit || isDemoMode ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Global Holidays */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Global Holidays</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useGlobalHolidays"
                    checked={calendar.useGlobalHolidays}
                    onChange={handleGlobalHolidaysToggle}
                    disabled={!canEdit}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="useGlobalHolidays" className="text-sm font-medium text-gray-700">
                    Include global holidays (UK Bank Holidays)
                  </label>
                </div>
                
                {calendar.useGlobalHolidays && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Holidays:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {globalHolidays.slice(0, 6).map((holiday) => (
                        <div key={holiday.id} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckIcon className="w-4 h-4 text-green-500" />
                          <span>{holiday.name}</span>
                          <span className="text-gray-400">({formatDate(holiday.date)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Exceptions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Custom Exceptions</h3>
                  {canEdit && (
                    <button
                      onClick={handleAddException}
                      disabled={isDemoMode && exceptions.length >= 3}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Exception</span>
                    </button>
                  )}
                </div>

                {exceptions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No custom exceptions defined</p>
                ) : (
                  <div className="space-y-2">
                    {exceptions.map((exception) => (
                      <div key={exception.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(exception.date)}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {getExceptionTypeLabel(exception.type)}
                            </span>
                            {exception.demo && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                DEMO
                              </span>
                            )}
                          </div>
                          {exception.description && (
                            <span className="text-sm text-gray-600">- {exception.description}</span>
                          )}
                          {exception.type === 'custom-shift' && exception.customShiftStart && exception.customShiftEnd && (
                            <span className="text-sm text-gray-600">
                              ({exception.customShiftStart} - {exception.customShiftEnd})
                            </span>
                          )}
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveException(exception.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isDemoMode && exceptions.length >= 3 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    Maximum 3 custom exceptions allowed in demo mode
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={saving || !calendar}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Calendar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkingCalendarModal; 