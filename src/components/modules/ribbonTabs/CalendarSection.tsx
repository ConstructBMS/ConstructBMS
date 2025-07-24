import React from 'react';
import CalendarButton from './CalendarButton';
import ApplyCalendarDropdown from './ApplyCalendarDropdown';
import type { Calendar } from './ApplyCalendarDropdown';

interface CalendarSectionProps {
  calendars: Calendar[];
  currentCalendar?: Calendar;
  onProjectCalendar: () => void;
  onManageCalendars: () => void;
  onApplyToProject: (calendarId: string) => void;
  onApplyToTasks: (calendarId: string) => void;
  disabled?: boolean;
  loading?: {
    project?: boolean;
    manage?: boolean;
    apply?: boolean;
  };
  hasSelectedTasks?: boolean;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  calendars,
  currentCalendar,
  onProjectCalendar,
  onManageCalendars,
  onApplyToProject,
  onApplyToTasks,
  disabled = false,
  loading = {},
  hasSelectedTasks = false
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <CalendarButton
          type="project"
          onClick={onProjectCalendar}
          disabled={disabled}
          loading={loading.project || false}
        />
        <CalendarButton
          type="manage"
          onClick={onManageCalendars}
          disabled={disabled}
          loading={loading.manage || false}
        />
        <ApplyCalendarDropdown
          calendars={calendars}
          currentCalendar={currentCalendar || undefined}
          onApplyToProject={onApplyToProject}
          onApplyToTasks={onApplyToTasks}
          disabled={disabled}
          loading={loading.apply || false}
          hasSelectedTasks={hasSelectedTasks}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Calendar
      </div>
    </section>
  );
};

export default CalendarSection; 