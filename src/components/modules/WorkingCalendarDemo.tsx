import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import WorkingCalendarModal from './WorkingCalendarModal';
import NonWorkingDayIndicator from './NonWorkingDayIndicator';
import {
  programmeWorkingCalendarService,
  type ProgrammeCalendar,
  type WorkingTime,
} from '../../services/programmeWorkingCalendarService';
import { demoModeService } from '../../services/demoModeService';

const WorkingCalendarDemo: React.FC = () => {
  const [calendar, setCalendar] = useState<ProgrammeCalendar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workingTime, setWorkingTime] = useState<WorkingTime | null>(null);
  const [loading, setLoading] = useState(false);

  const projectId = 'demo-project';

  // Load calendar on mount
  useEffect(() => {
    loadCalendarData();
  }, []);

  // Check working time for selected date
  useEffect(() => {
    if (selectedDate) {
      checkWorkingTime();
    }
  }, [selectedDate, calendar]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);

      // Check demo mode
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);

      // Load calendar
      const projectCalendar =
        await programmeWorkingCalendarService.getCalendarForProject(projectId);
      setCalendar(projectCalendar);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWorkingTime = async () => {
    try {
      const timeData = await programmeWorkingCalendarService.isWorkingDay(
        selectedDate,
        projectId
      );
      setWorkingTime(timeData);
    } catch (error) {
      console.error('Error checking working time:', error);
    }
  };

  const handleCalendarSave = (updatedCalendar: ProgrammeCalendar) => {
    setCalendar(updatedCalendar);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const getWorkingTimeStatus = () => {
    if (!workingTime) return { status: 'Loading...', color: 'text-gray-500' };

    if (workingTime.isWorkingDay) {
      return {
        status: `Working Day (${workingTime.start} - ${workingTime.end})`,
        color: 'text-green-600',
      };
    } else if (workingTime.isHoliday) {
      return {
        status: 'Bank Holiday',
        color: 'text-red-600',
      };
    } else {
      return {
        status: 'Non-working Day',
        color: 'text-gray-600',
      };
    }
  };

  const generateTimelineDays = () => {
    const days = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Start 7 days ago

    for (let i = 0; i < 21; i++) {
      // Show 3 weeks
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Working Calendar Demo
          </h2>
          <p className='text-gray-600 mt-1'>
            Manage project working days, holidays, and custom shifts
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          <CalendarIcon className='w-5 h-5' />
          <span>Edit Calendar</span>
        </button>
      </div>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
          <div className='flex items-start space-x-2'>
            <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600 mt-0.5' />
            <div className='text-sm text-yellow-800'>
              <p className='font-medium'>Demo Mode Active</p>
              <p className='mt-1'>
                Working calendar editing is limited. Only 3 custom exceptions
                allowed, shift hours are fixed to 08:00-16:00.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Summary */}
      {calendar && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white border border-gray-200 rounded-lg p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <CalendarIcon className='w-6 h-6 text-blue-600' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Working Pattern
              </h3>
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Pattern:</span>{' '}
                {programmeWorkingCalendarService.getShiftPatternDisplayName(
                  calendar.workdays
                )}
              </p>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Hours:</span>{' '}
                {calendar.shiftStart} - {calendar.shiftEnd}
              </p>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Global Holidays:</span>{' '}
                {calendar.useGlobalHolidays ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>

          <div className='bg-white border border-gray-200 rounded-lg p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <ClockIcon className='w-6 h-6 text-green-600' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Selected Date
              </h3>
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Date:</span>{' '}
                {selectedDate.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p
                className={`text-sm font-medium ${getWorkingTimeStatus().color}`}
              >
                {getWorkingTimeStatus().status}
              </p>
            </div>
          </div>

          <div className='bg-white border border-gray-200 rounded-lg p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <CheckIcon className='w-6 h-6 text-purple-600' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Quick Test
              </h3>
            </div>
            <div className='space-y-2'>
              <button
                onClick={() => handleDateChange(new Date())}
                className='w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
              >
                Test Today
              </button>
              <button
                onClick={() => handleDateChange(new Date('2024-12-25'))}
                className='w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
              >
                Test Christmas
              </button>
              <button
                onClick={() => handleDateChange(new Date('2024-01-01'))}
                className='w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
              >
                Test New Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Visualization */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Timeline View
        </h3>
        <div className='overflow-x-auto'>
          <div className='flex space-x-1 min-w-max'>
            {generateTimelineDays().map((date, index) => (
              <div
                key={index}
                onClick={() => handleDateChange(date)}
                className={`relative flex flex-col items-center p-2 border rounded-md cursor-pointer transition-colors ${
                  isSelectedDate(date)
                    ? 'bg-blue-100 border-blue-300'
                    : isToday(date)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className='text-xs text-gray-600 mb-1'>
                  {formatDate(date)}
                </span>
                <div className='w-8 h-8 flex items-center justify-center'>
                  {isToday(date) && (
                    <div className='w-2 h-2 bg-green-500 rounded-full' />
                  )}
                  {isSelectedDate(date) && !isToday(date) && (
                    <div className='w-2 h-2 bg-blue-500 rounded-full' />
                  )}
                </div>

                {/* Non-working day indicator */}
                <NonWorkingDayIndicator
                  date={date}
                  projectId={projectId}
                  className='absolute top-0 right-0 w-1 h-full'
                  showTooltip={false}
                />
              </div>
            ))}
          </div>
        </div>
        <div className='mt-4 flex items-center space-x-4 text-xs text-gray-600'>
          <div className='flex items-center space-x-1'>
            <div className='w-3 h-3 bg-green-500 rounded-full' />
            <span>Today</span>
          </div>
          <div className='flex items-center space-x-1'>
            <div className='w-3 h-3 bg-blue-500 rounded-full' />
            <span>Selected</span>
          </div>
          <div className='flex items-center space-x-1'>
            <div className='w-3 h-3 bg-gray-300 opacity-40' />
            <span>Non-working</span>
          </div>
        </div>
      </div>

      {/* Working Calendar Modal */}
      <WorkingCalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        onSave={handleCalendarSave}
      />
    </div>
  );
};

export default WorkingCalendarDemo;
