import React, { useState, useEffect } from 'react';
import { taskCalendarService, TaskCalendar } from '../services/taskCalendarService';

interface TimelineNonWorkingDaysProps {
  projectId: string;
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  height: number;
  onCalendarChange?: () => void;
}

interface NonWorkingDay {
  date: Date;
  type: 'weekend' | 'holiday';
  label: string;
  calendarId?: string;
}

const TimelineNonWorkingDays: React.FC<TimelineNonWorkingDaysProps> = ({
  projectId,
  startDate,
  endDate,
  dayWidth,
  height,
  onCalendarChange
}) => {
  const [nonWorkingDays, setNonWorkingDays] = useState<NonWorkingDay[]>([]);
  const [calendars, setCalendars] = useState<TaskCalendar[]>([]);
  const [loading, setLoading] = useState(false);

  // Load calendars and calculate non-working days
  useEffect(() => {
    loadNonWorkingDays();
  }, [projectId, startDate, endDate]);

  const loadNonWorkingDays = async () => {
    try {
      setLoading(true);

      // Load project calendars
      const projectCalendars = await taskCalendarService.getProjectCalendars(projectId);
      const globalCalendars = await taskCalendarService.getGlobalCalendars();
      const allCalendars = [...projectCalendars, ...globalCalendars];
      setCalendars(allCalendars);

      // Calculate non-working days for each calendar
      const allNonWorkingDays: NonWorkingDay[] = [];
      
      for (const calendar of allCalendars) {
        const calendarNonWorkingDays = await calculateNonWorkingDaysForCalendar(
          calendar,
          startDate,
          endDate
        );
        allNonWorkingDays.push(...calendarNonWorkingDays);
      }

      // Remove duplicates and sort by date
      const uniqueNonWorkingDays = removeDuplicateNonWorkingDays(allNonWorkingDays);
      setNonWorkingDays(uniqueNonWorkingDays);
    } catch (error) {
      console.error('Error loading non-working days:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNonWorkingDaysForCalendar = async (
    calendar: TaskCalendar,
    start: Date,
    end: Date
  ): Promise<NonWorkingDay[]> => {
    const nonWorkingDays: NonWorkingDay[] = [];
    const current = new Date(start);

    while (current <= end) {
      const isWorking = await taskCalendarService.isWorkingDay(current, calendar.id);
      
      if (!isWorking) {
        const dayOfWeek = current.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        
        // Check if it's a holiday
        const dateString = current.toISOString().split('T')[0];
        const isHoliday = calendar.holidays.includes(dateString);

        if (isHoliday) {
          nonWorkingDays.push({
            date: new Date(current),
            type: 'holiday',
            label: `Holiday - ${calendar.name}`,
            calendarId: calendar.id
          });
        } else if (isWeekend) {
          nonWorkingDays.push({
            date: new Date(current),
            type: 'weekend',
            label: `Weekend - ${calendar.name}`,
            calendarId: calendar.id
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return nonWorkingDays;
  };

  const removeDuplicateNonWorkingDays = (days: NonWorkingDay[]): NonWorkingDay[] => {
    const uniqueDays = new Map<string, NonWorkingDay>();
    
    days.forEach(day => {
      const dateKey = day.date.toISOString().split('T')[0];
      if (!uniqueDays.has(dateKey)) {
        uniqueDays.set(dateKey, day);
      } else {
        // If multiple calendars have non-working days on the same date,
        // prioritize holidays over weekends
        const existing = uniqueDays.get(dateKey)!;
        if (day.type === 'holiday' && existing.type === 'weekend') {
          uniqueDays.set(dateKey, day);
        }
      }
    });

    return Array.from(uniqueDays.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getDayPosition = (date: Date): number => {
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * dayWidth;
  };

  const getDayLabel = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getTooltipContent = (day: NonWorkingDay): string => {
    const dateStr = day.date.toLocaleDateString();
    const dayLabel = getDayLabel(day.date);
    
    if (day.type === 'holiday') {
      return `No work - Public Holiday (${dayLabel})`;
    } else {
      return `No work - Weekend (${dayLabel})`;
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  return (
    <div className="timeline-non-working-days absolute inset-0 pointer-events-none">
      {nonWorkingDays.map((day, index) => {
        const left = getDayPosition(day.date);
        const isWeekend = day.type === 'weekend';
        
        return (
          <div
            key={`${day.date.toISOString()}-${index}`}
            className="absolute top-0 bottom-0 pointer-events-auto group"
            style={{
              left: `${left}px`,
              width: `${dayWidth}px`
            }}
            title={getTooltipContent(day)}
          >
            {/* Non-working day background */}
            <div
              className={`w-full h-full ${
                isWeekend 
                  ? 'bg-gray-100 dark:bg-gray-700 opacity-50' 
                  : 'bg-red-100 dark:bg-red-900/20 opacity-60'
              }`}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {getTooltipContent(day)}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineNonWorkingDays; 