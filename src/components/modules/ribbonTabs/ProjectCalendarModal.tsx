import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Calendar } from './ApplyCalendarDropdown';

interface ProjectCalendarModalProps {
  calendar: Calendar;
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (calendar: Calendar) => void;
}

const ProjectCalendarModal: React.FC<ProjectCalendarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  calendar,
  isDemoMode = false
}) => {
  const [formData, setFormData] = useState<Calendar>(calendar);
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');
  const canView = canAccess('programme.view');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (isOpen) {
      setFormData(calendar);
    }
  }, [isOpen, calendar]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        demo: isDemoMode
      });
      onClose();
    } catch (error) {
      console.error('Failed to save project calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(calendar);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Calendar</h2>
              <p className="text-sm text-gray-500">View and edit the programme's working calendar</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
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
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Working Days */}
          <div className="mt-6">
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
          <div className="mt-6">
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

          {/* Permission Notice */}
          {!canView && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                You don't have permission to view project calendar.
              </p>
            </div>
          )}

          {canView && !canEdit && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                You have view-only access. Contact an administrator to make changes.
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Saving...' : 'Save Calendar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCalendarModal; 