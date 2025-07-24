import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface Calendar {
  id: string;
  name: string;
  description: string;
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  holidays: string[];
  isDefault?: boolean;
  demo?: boolean;
}

interface ApplyCalendarDropdownProps {
  calendars: Calendar[];
  currentCalendar?: Calendar | undefined;
  onApplyToProject: (calendarId: string) => void;
  onApplyToTasks: (calendarId: string) => void;
  disabled?: boolean;
  loading?: boolean;
  hasSelectedTasks?: boolean;
}

const ApplyCalendarDropdown: React.FC<ApplyCalendarDropdownProps> = ({
  calendars,
  currentCalendar,
  onApplyToProject,
  onApplyToTasks,
  disabled = false,
  loading = false,
  hasSelectedTasks = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  const hasPermission = canAccess('programme.edit');
  const isDisabled = disabled || !hasPermission || loading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyToProject = (calendarId: string) => {
    onApplyToProject(calendarId);
    setIsOpen(false);
  };

  const handleApplyToTasks = (calendarId: string) => {
    onApplyToTasks(calendarId);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const getWorkingDaysLabel = (workingDays: number[]): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const selectedDays = workingDays.map(day => dayNames[day - 1]);
    return selectedDays.join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12 
          border border-gray-300 bg-white hover:bg-gray-50 
          transition-colors duration-200 rounded
          ${isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-gray-400'
          }
          ${isOpen ? 'bg-blue-50 border-blue-400' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Assign a calendar to project or tasks"
      >
        <CalendarIcon className={`w-5 h-5 ${isOpen ? 'text-blue-600' : 'text-gray-700'}`} />
        <span className={`text-xs font-medium mt-1 ${isOpen ? 'text-blue-600' : 'text-gray-600'}`}>
          Apply
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Apply Calendar</h3>
            <p className="text-xs text-gray-500 mt-1">
              Select a calendar to apply to the project or selected tasks
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {calendars.map((calendar) => (
              <div key={calendar.id} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {calendar.name}
                      </h4>
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
                    <p className="text-xs text-gray-600 mt-1">{calendar.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <div>Working days: {getWorkingDaysLabel(calendar.workingDays)}</div>
                      <div>Hours: {calendar.workingHours.start} - {calendar.workingHours.end}</div>
                      {calendar.holidays.length > 0 && (
                        <div>Holidays: {calendar.holidays.length} dates</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1 ml-3">
                    <button
                      onClick={() => handleApplyToProject(calendar.id)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      To Project
                    </button>
                    {hasSelectedTasks && (
                      <button
                        onClick={() => handleApplyToTasks(calendar.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        To Tasks
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {calendars.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No calendars available</p>
              <p className="text-xs">Create a calendar first</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplyCalendarDropdown; 