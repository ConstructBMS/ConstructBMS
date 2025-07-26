import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import {
  taskCalendarService,
  TaskCalendar,
} from '../../services/taskCalendarService';
import { demoModeService } from '../../services/demoModeService';

interface CalendarManagerModalProps {
  isOpen: boolean;
  onCalendarChange?: () => void;
  onClose: () => void;
  projectId: string;
}

interface CalendarFormData {
  dailyHours: { end: string; start: string };
  holidays: string[];
  isGlobal: boolean;
  name: string;
  workingDays: string[];
}

const CalendarManagerModal: React.FC<CalendarManagerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onCalendarChange,
}) => {
  const { canAccess } = usePermissions();
  const [calendars, setCalendars] = useState<TaskCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<TaskCalendar | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess('programme.calendar.view');
  const canEdit = canAccess('programme.calendar.manage');
  const canAssign = canAccess('programme.calendar.assign');

  // Form state
  const [formData, setFormData] = useState<CalendarFormData>({
    name: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    dailyHours: { start: '08:00', end: '17:00' },
    holidays: [],
    isGlobal: false,
  });

  // Day options
  const dayOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' },
  ];

  // Load data on mount
  useEffect(() => {
    if (isOpen && projectId) {
      loadCalendars();
      checkDemoMode();
    }
  }, [isOpen, projectId]);

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.getDemoMode();
    setIsDemoMode(isDemo);
  };

  const loadCalendars = async () => {
    try {
      setLoading(true);
      setError(null);

      const projectCalendars =
        await taskCalendarService.getProjectCalendars(projectId);
      const globalCalendars = await taskCalendarService.getGlobalCalendars();

      setCalendars([...projectCalendars, ...globalCalendars]);
    } catch (error) {
      console.error('Error loading calendars:', error);
      setError('Failed to load calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      name: '',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      dailyHours: { start: '08:00', end: '17:00' },
      holidays: [],
      isGlobal: false,
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedCalendar(null);
    setError(null);
  };

  const handleEdit = (calendar: TaskCalendar) => {
    setFormData({
      name: calendar.name,
      workingDays: calendar.workingDays,
      dailyHours: calendar.dailyHours,
      holidays: calendar.holidays,
      isGlobal: calendar.isGlobal,
    });
    setSelectedCalendar(calendar);
    setIsEditing(true);
    setIsCreating(false);
    setError(null);
  };

  const handleDelete = async (calendar: TaskCalendar) => {
    if (!canEdit || isDemoMode) return;

    if (
      window.confirm(
        `Are you sure you want to delete the calendar "${calendar.name}"?`
      )
    ) {
      try {
        setSaving(true);
        const success = await taskCalendarService.deleteCalendar(calendar.id);

        if (success) {
          await loadCalendars();
          onCalendarChange?.();
        } else {
          setError('Failed to delete calendar');
        }
      } catch (error) {
        console.error('Error deleting calendar:', error);
        setError('Failed to delete calendar');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;

    try {
      setSaving(true);
      setError(null);

      let success = false;

      if (isCreating) {
        const newCalendar = await taskCalendarService.createCalendar({
          ...formData,
          projectId,
          createdBy: 'current-user', // This should come from auth context
        });
        success = !!newCalendar;
      } else if (isEditing && selectedCalendar) {
        success = await taskCalendarService.updateCalendar(
          selectedCalendar.id,
          formData
        );
      }

      if (success) {
        await loadCalendars();
        onCalendarChange?.();
        handleCancel();
      } else {
        setError('Failed to save calendar');
      }
    } catch (error) {
      console.error('Error saving calendar:', error);
      setError('Failed to save calendar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedCalendar(null);
    setFormData({
      name: '',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      dailyHours: { start: '08:00', end: '17:00' },
      holidays: [],
      isGlobal: false,
    });
    setError(null);
  };

  const handleWorkingDayToggle = (day: string) => {
    if (!canEdit || isDemoMode) return;

    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort((a, b) => {
            const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return order.indexOf(a) - order.indexOf(b);
          }),
    }));
  };

  const handleAddHoliday = () => {
    if (!canEdit || isDemoMode) return;

    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      holidays: [...prev.holidays, today],
    }));
  };

  const handleRemoveHoliday = (holiday: string) => {
    if (!canEdit || isDemoMode) return;

    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== holiday),
    }));
  };

  const getDemoModeConfig = () => {
    return taskCalendarService.getDemoModeConfig();
  };

  if (!isOpen) return null;

  const demoConfig = getDemoModeConfig();

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <CalendarIcon className='w-6 h-6 text-blue-600' />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Manage Calendars
            </h2>
            {isDemoMode && (
              <div className='flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs'>
                <ExclamationTriangleIcon className='w-3 h-3' />
                <span>Demo Mode</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        <div className='flex h-[calc(90vh-120px)]'>
          {/* Left Panel - Calendar List */}
          <div className='w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Calendars
              </h3>
              {canEdit && !isDemoMode && (
                <button
                  onClick={handleCreateNew}
                  className='flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700'
                >
                  <PlusIcon className='w-4 h-4' />
                  <span>New</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-2 text-gray-600 dark:text-gray-400'>
                  Loading...
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {calendars.map(calendar => (
                  <div
                    key={calendar.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCalendar?.id === calendar.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedCalendar(calendar)}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          {calendar.name}
                        </h4>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {calendar.workingDays.join(', ')} •{' '}
                          {calendar.dailyHours.start}-{calendar.dailyHours.end}
                        </p>
                        {calendar.isGlobal && (
                          <span className='inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded'>
                            Global
                          </span>
                        )}
                        {calendar.demo && (
                          <span className='inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded'>
                            Demo
                          </span>
                        )}
                      </div>
                      {canEdit && !calendar.demo && (
                        <div className='flex space-x-1'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleEdit(calendar);
                            }}
                            className='p-1 text-gray-400 hover:text-blue-600'
                          >
                            <PencilIcon className='w-4 h-4' />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(calendar);
                            }}
                            className='p-1 text-gray-400 hover:text-red-600'
                          >
                            <TrashIcon className='w-4 h-4' />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Calendar Details/Edit */}
          <div className='flex-1 p-4 overflow-y-auto'>
            {isCreating || isEditing ? (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                    {isCreating ? 'Create New Calendar' : 'Edit Calendar'}
                  </h3>

                  {error && (
                    <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
                      {error}
                    </div>
                  )}

                  {/* Calendar Name */}
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Calendar Name
                    </label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      disabled={!canEdit || isDemoMode}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                      placeholder='Enter calendar name'
                    />
                  </div>

                  {/* Working Days */}
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                      Working Days
                    </label>
                    <div className='grid grid-cols-7 gap-2'>
                      {dayOptions.map(day => {
                        const isSelected = formData.workingDays.includes(
                          day.value
                        );
                        return (
                          <button
                            key={day.value}
                            type='button'
                            onClick={() => handleWorkingDayToggle(day.value)}
                            disabled={!canEdit || isDemoMode}
                            className={`
                              p-3 border rounded-lg text-sm font-medium transition-colors
                              ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }
                              ${!canEdit || isDemoMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                          >
                            {day.label.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Hours */}
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Daily Hours
                    </label>
                    <div className='flex space-x-4'>
                      <div>
                        <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                          Start
                        </label>
                        <input
                          type='time'
                          value={formData.dailyHours.start}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              dailyHours: {
                                ...prev.dailyHours,
                                start: e.target.value,
                              },
                            }))
                          }
                          disabled={!canEdit || isDemoMode}
                          className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                        />
                      </div>
                      <div>
                        <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                          End
                        </label>
                        <input
                          type='time'
                          value={formData.dailyHours.end}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              dailyHours: {
                                ...prev.dailyHours,
                                end: e.target.value,
                              },
                            }))
                          }
                          disabled={!canEdit || isDemoMode}
                          className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Holidays */}
                  <div className='mb-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Holidays ({formData.holidays.length})
                      </label>
                      {canEdit && !isDemoMode && (
                        <button
                          type='button'
                          onClick={handleAddHoliday}
                          className='text-sm text-blue-600 hover:text-blue-700'
                        >
                          Add Holiday
                        </button>
                      )}
                    </div>
                    {formData.holidays.length > 0 ? (
                      <div className='grid grid-cols-2 gap-2'>
                        {formData.holidays.map(holiday => (
                          <div
                            key={holiday}
                            className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded'
                          >
                            <span className='text-sm text-gray-700 dark:text-gray-300'>
                              {new Date(holiday).toLocaleDateString()}
                            </span>
                            {canEdit && !isDemoMode && (
                              <button
                                onClick={() => handleRemoveHoliday(holiday)}
                                className='text-red-600 hover:text-red-700'
                              >
                                <XMarkIcon className='w-4 h-4' />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                        No holidays defined
                      </p>
                    )}
                  </div>

                  {/* Global Calendar Toggle */}
                  <div className='mb-6'>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={formData.isGlobal}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            isGlobal: e.target.checked,
                          }))
                        }
                        disabled={!canEdit || isDemoMode}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm text-gray-700 dark:text-gray-300'>
                        Make this calendar available globally
                      </span>
                    </label>
                  </div>

                  {/* Demo Mode Warning */}
                  {isDemoMode && (
                    <div className='p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm'>
                      <div className='flex items-center space-x-2'>
                        <ExclamationTriangleIcon className='w-4 h-4' />
                        <span>{demoConfig.tooltipMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='flex space-x-3'>
                    <button
                      onClick={handleSave}
                      disabled={!canEdit || saving || !formData.name.trim()}
                      className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {saving ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      ) : (
                        <CheckIcon className='w-4 h-4' />
                      )}
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedCalendar ? (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                    {selectedCalendar.name}
                  </h3>
                  {canEdit && !selectedCalendar.demo && (
                    <button
                      onClick={() => handleEdit(selectedCalendar)}
                      className='flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded'
                    >
                      <PencilIcon className='w-4 h-4' />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Calendar Details */}
                <div className='space-y-4'>
                  <div>
                    <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Working Days
                    </h4>
                    <div className='grid grid-cols-7 gap-2'>
                      {dayOptions.map(day => {
                        const isWorking = selectedCalendar.workingDays.includes(
                          day.value
                        );
                        return (
                          <div
                            key={day.value}
                            className={`p-3 border rounded-lg text-center text-sm font-medium ${
                              isWorking
                                ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {day.label.slice(0, 3)}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Daily Hours
                    </h4>
                    <div className='flex items-center space-x-2 text-gray-900 dark:text-white'>
                      <ClockIcon className='w-4 h-4' />
                      <span>
                        {selectedCalendar.dailyHours.start} -{' '}
                        {selectedCalendar.dailyHours.end}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Holidays ({selectedCalendar.holidays.length})
                    </h4>
                    {selectedCalendar.holidays.length > 0 ? (
                      <div className='grid grid-cols-2 gap-2'>
                        {selectedCalendar.holidays.map(holiday => (
                          <div
                            key={holiday}
                            className='p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300'
                          >
                            {new Date(holiday).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                        No holidays defined
                      </p>
                    )}
                  </div>

                  {selectedCalendar.isGlobal && (
                    <div className='p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg'>
                      <div className='flex items-center space-x-2'>
                        <CheckIcon className='w-4 h-4' />
                        <span>This calendar is available globally</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='text-center py-8'>
                <CalendarIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  Select a Calendar
                </h3>
                <p className='text-gray-500 dark:text-gray-400'>
                  Choose a calendar from the list to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarManagerModal;
