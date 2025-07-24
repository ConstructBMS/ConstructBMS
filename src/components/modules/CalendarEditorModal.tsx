import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { calendarService, type WorkingCalendar } from '../../services/calendarService';
import { toastService } from './ToastNotification';

interface CalendarEditorModalProps {
  className?: string;
  existingCalendar?: WorkingCalendar | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (calendar: WorkingCalendar) => void;
  projectId: string;
}

const CalendarEditorModal: React.FC<CalendarEditorModalProps> = ({
  isOpen,
  onClose,
  projectId,
  existingCalendar,
  onSave,
  className = ''
}) => {
  const [calendarName, setCalendarName] = useState<string>('');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState<string>('');
  const [newHolidayLabel, setNewHolidayLabel] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(calendarService.isInDemoMode());

  // Day options
  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Initialize form with existing calendar or defaults
  useEffect(() => {
    if (existingCalendar) {
      setCalendarName(existingCalendar.name);
      setWorkingDays(existingCalendar.workingDays);
      setHolidays(existingCalendar.holidays);
    } else {
      const defaultCalendar = calendarService.getDefaultCalendar();
      setCalendarName(defaultCalendar.name);
      setWorkingDays(defaultCalendar.workingDays);
      setHolidays(defaultCalendar.holidays);
    }
  }, [existingCalendar]);

  // Get demo mode configuration
  const demoConfig = calendarService.getDemoModeConfig();

  // Handle working day toggle
  const handleWorkingDayToggle = (dayValue: number) => {
    if (isDemoMode) {
      toastService.warning('Demo Mode', 'Working days are locked in demo mode');
      return;
    }

    setWorkingDays(prev => {
      if (prev.includes(dayValue)) {
        return prev.filter(day => day !== dayValue);
      } else {
        return [...prev, dayValue].sort();
      }
    });
  };

  // Handle add holiday
  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayLabel.trim()) {
      toastService.error('Error', 'Please enter both date and label');
      return;
    }

    if (isDemoMode && holidays.length >= demoConfig.maxHolidays) {
      toastService.warning('Demo Mode', `Maximum ${demoConfig.maxHolidays} holidays allowed`);
      return;
    }

    if (holidays.includes(newHolidayDate)) {
      toastService.error('Error', 'Holiday date already exists');
      return;
    }

    setHolidays(prev => [...prev, newHolidayDate]);
    setNewHolidayDate('');
    setNewHolidayLabel('');
  };

  // Handle remove holiday
  const handleRemoveHoliday = (date: string) => {
    setHolidays(prev => prev.filter(h => h !== date));
  };

  // Handle save
  const handleSave = async () => {
    if (isSaving) return;

    if (!calendarName.trim()) {
      toastService.error('Error', 'Calendar name is required');
      return;
    }

    if (workingDays.length === 0) {
      toastService.error('Error', 'At least one working day must be selected');
      return;
    }

    setIsSaving(true);
    try {
      const calendarData = {
        projectId,
        name: calendarName.trim(),
        workingDays,
        holidays,
        createdBy: 'current-user' // This should come from auth context
      };

      const success = await calendarService.saveCalendar(calendarData);
      if (success) {
        toastService.success('Success', existingCalendar ? 'Calendar updated successfully' : 'Calendar created successfully');
        if (onSave) {
          // Get the updated calendar
          const updatedCalendar = await calendarService.getCalendarForProject(projectId);
          onSave(updatedCalendar);
        }
        onClose();
      } else {
        if (isDemoMode) {
          toastService.warning('Demo Mode', 'Calendar editing is limited in demo mode');
        } else {
          toastService.error('Error', 'Failed to save calendar');
        }
      }
    } catch (error) {
      console.error('Error saving calendar:', error);
      toastService.error('Error', 'Failed to save calendar');
    } finally {
      setIsSaving(false);
    }
  };

  // Format holiday date for display
  const formatHolidayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96 max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {existingCalendar ? 'Edit Calendar' : 'Create Calendar'}
            </h3>
            {isDemoMode && (
              <div className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs rounded-md">
                Demo
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800">
            <div className="flex items-center text-sm text-orange-700 dark:text-orange-300">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              <span>{demoConfig.tooltipMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Calendar Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calendar Name
            </label>
            <input
              type="text"
              value={calendarName}
              onChange={(e) => setCalendarName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter calendar name"
              disabled={isDemoMode}
            />
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Working Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dayOptions.map((day) => (
                <label
                  key={day.value}
                  className={`flex items-center p-2 rounded border cursor-pointer transition-colors ${
                    workingDays.includes(day.value)
                      ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700'
                      : 'bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                  } ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={workingDays.includes(day.value)}
                    onChange={() => handleWorkingDayToggle(day.value)}
                    disabled={isDemoMode}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {day.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Holidays */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Holidays ({holidays.length}/{isDemoMode ? demoConfig.maxHolidays : 'Unlimited'})
            </label>
            
            {/* Add Holiday */}
            {(!isDemoMode || holidays.length < demoConfig.maxHolidays) && (
              <div className="flex space-x-2 mb-3">
                <input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={isDemoMode}
                />
                <input
                  type="text"
                  value={newHolidayLabel}
                  onChange={(e) => setNewHolidayLabel(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Holiday label"
                  disabled={isDemoMode}
                />
                <button
                  onClick={handleAddHoliday}
                  disabled={isDemoMode}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Holiday List */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {holidays.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No holidays defined
                </p>
              ) : (
                holidays.map((date) => (
                  <div
                    key={date}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatHolidayDate(date)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {calendarService.getHolidaysInRange(new Date(date), new Date(date), projectId)[0]?.label || 'Holiday'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveHoliday(date)}
                      disabled={isDemoMode}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      title="Remove holiday"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isDemoMode}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md"
            >
              {isSaving ? 'Saving...' : (existingCalendar ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEditorModal; 