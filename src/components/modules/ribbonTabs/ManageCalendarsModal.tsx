import React, { useState, useEffect } from 'react';
import { XMarkIcon, CogIcon, PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Calendar } from './ApplyCalendarDropdown';

interface ManageCalendarsModalProps {
  calendars: Calendar[];
  isDemoMode?: boolean;
  isOpen: boolean;
  onClone: (calendar: Calendar) => void;
  onClose: () => void;
  onDelete: (calendarId: string) => void;
  onSave: (calendar: Calendar) => void;
}

const ManageCalendarsModal: React.FC<ManageCalendarsModalProps> = ({
  isOpen,
  onClose,
  calendars,
  onSave,
  onDelete,
  onClone,
  isDemoMode = false
}) => {
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');
  const canView = canAccess('programme.view');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (isOpen && calendars.length > 0) {
      setSelectedCalendar(calendars[0]);
    }
  }, [isOpen, calendars]);

  const handleCreateNew = () => {
    const newCalendar: Calendar = {
      id: `calendar_${Date.now()}`,
      name: 'New Calendar',
      description: '',
      workingDays: [2, 3, 4, 5, 6], // Monday to Friday
      workingHours: {
        start: '08:00',
        end: '17:00'
      },
      holidays: [],
      demo: isDemoMode
    };
    
    setEditingCalendar(newCalendar);
    setIsEditing(true);
  };

  const handleEdit = (calendar: Calendar) => {
    setEditingCalendar({ ...calendar });
    setIsEditing(true);
  };

  const handleClone = (calendar: Calendar) => {
    const clonedCalendar: Calendar = {
      ...calendar,
      id: `calendar_${Date.now()}`,
      name: `${calendar.name} (Copy)`,
      demo: isDemoMode
    };
    
    setEditingCalendar(clonedCalendar);
    setIsEditing(true);
  };

  const handleDelete = async (calendarId: string) => {
    if (!canEdit) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this calendar? This action cannot be undone.');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await onDelete(calendarId);
    } catch (error) {
      console.error('Failed to delete calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (calendar: Calendar) => {
    if (!canEdit) return;

    setIsLoading(true);
    try {
      await onSave(calendar);
      setIsEditing(false);
      setEditingCalendar(null);
    } catch (error) {
      console.error('Failed to save calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCalendar(null);
  };

  const getWorkingDaysLabel = (workingDays: number[]): string => {
    const selectedDays = workingDays.map(day => dayNames[day - 1].slice(0, 3));
    return selectedDays.join(', ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex">
        {/* Left Panel - Calendar List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Calendars</h2>
              {canEdit && (
                <button
                  onClick={handleCreateNew}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Create new calendar"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            {isDemoMode && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full mt-2">
                Demo Mode
              </span>
            )}
          </div>

          {/* Calendar List */}
          <div className="flex-1 overflow-y-auto">
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedCalendar?.id === calendar.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCalendar(calendar)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{calendar.name}</h3>
                      {calendar.isDefault && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                      {calendar.demo && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{calendar.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <div>Working days: {getWorkingDaysLabel(calendar.workingDays)}</div>
                      <div>Hours: {calendar.workingHours.start} - {calendar.workingHours.end}</div>
                      {calendar.holidays.length > 0 && (
                        <div>Holidays: {calendar.holidays.length} dates</div>
                      )}
                    </div>
                  </div>
                  
                  {canEdit && (
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(calendar);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit calendar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClone(calendar);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Clone calendar"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(calendar.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete calendar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {calendars.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <CogIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No calendars available</p>
                {canEdit && (
                  <p className="text-xs mt-1">Click the + button to create one</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Calendar Details or Editor */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Calendar' : 'Calendar Details'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isEditing && editingCalendar ? (
              <CalendarEditor
                calendar={editingCalendar}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={isLoading}
                canEdit={canEdit}
                isDemoMode={isDemoMode}
              />
            ) : selectedCalendar ? (
              <CalendarDetails
                calendar={selectedCalendar}
                onEdit={() => handleEdit(selectedCalendar)}
                canEdit={canEdit}
                dayNames={dayNames}
              />
            ) : (
              <div className="p-8 text-center text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Select a calendar to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Details Component
interface CalendarDetailsProps {
  calendar: Calendar;
  canEdit: boolean;
  dayNames: string[];
  onEdit: () => void;
}

const CalendarDetails: React.FC<CalendarDetailsProps> = ({
  calendar,
  onEdit,
  canEdit,
  dayNames
}) => {
  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Calendar Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{calendar.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{calendar.description || 'No description'}</p>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <p className="mt-1 text-sm text-gray-900">{calendar.workingHours.start}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <p className="mt-1 text-sm text-gray-900">{calendar.workingHours.end}</p>
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Working Days</h4>
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((dayName, index) => {
              const dayNumber = index + 1;
              const isWorking = calendar.workingDays.includes(dayNumber);
              
              return (
                <div
                  key={dayNumber}
                  className={`p-3 border rounded-lg text-center text-sm font-medium ${
                    isWorking
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-500 border-gray-300'
                  }`}
                >
                  {dayName.slice(0, 3)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Holidays */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Holidays ({calendar.holidays.length})
          </h4>
          {calendar.holidays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {calendar.holidays.map((holiday) => (
                <div
                  key={holiday}
                  className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700"
                >
                  {new Date(holiday).toLocaleDateString()}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No holidays defined</p>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Calendar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Calendar Editor Component
interface CalendarEditorProps {
  calendar: Calendar;
  canEdit: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onSave: (calendar: Calendar) => void;
}

const CalendarEditor: React.FC<CalendarEditorProps> = ({
  calendar,
  onSave,
  onCancel,
  isLoading,
  canEdit,
  isDemoMode
}) => {
  const [formData, setFormData] = useState<Calendar>(calendar);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleInputChange = (field: keyof Calendar, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingDayToggle = (dayNumber: number) => {
    const newWorkingDays = formData.workingDays.includes(dayNumber)
      ? formData.workingDays.filter(day => day !== dayNumber)
      : [...formData.workingDays, dayNumber].sort();
    
    handleInputChange('workingDays', newWorkingDays);
  };

  const handleAddHoliday = () => {
    const today = new Date().toISOString().split('T')[0];
    const newHolidays = [...formData.holidays, today];
    handleInputChange('holidays', newHolidays);
  };

  const handleRemoveHoliday = (holiday: string) => {
    const newHolidays = formData.holidays.filter(h => h !== holiday);
    handleInputChange('holidays', newHolidays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calendar Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!canEdit}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
              `}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={!canEdit}
              rows={3}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
              `}
            />
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Working Hours
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.workingHours.start}
                onChange={(e) => handleInputChange('workingHours', {
                  ...formData.workingHours,
                  start: e.target.value
                })}
                disabled={!canEdit}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={formData.workingHours.end}
                onChange={(e) => handleInputChange('workingHours', {
                  ...formData.workingHours,
                  end: e.target.value
                })}
                disabled={!canEdit}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
              />
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Working Days
          </label>
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((dayName, index) => {
              const dayNumber = index + 1;
              const isSelected = formData.workingDays.includes(dayNumber);
              
              return (
                <button
                  key={dayNumber}
                  type="button"
                  onClick={() => handleWorkingDayToggle(dayNumber)}
                  disabled={!canEdit}
                  className={`
                    p-3 border rounded-lg text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }
                    ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {dayName.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Holidays */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Holidays ({formData.holidays.length})
            </label>
            {canEdit && (
              <button
                type="button"
                onClick={handleAddHoliday}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add Holiday
              </button>
            )}
          </div>
          
          {formData.holidays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {formData.holidays.map((holiday) => (
                <div
                  key={holiday}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded"
                >
                  <span className="text-sm text-gray-700">
                    {new Date(holiday).toLocaleDateString()}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHoliday(holiday)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No holidays defined</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {canEdit && (
            <button
              type="submit"
              disabled={isLoading}
              className={`
                px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                hover:bg-blue-700 transition-colors
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? 'Saving...' : 'Save Calendar'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ManageCalendarsModal; 