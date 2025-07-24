import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/outline';
import { calendarService, type WorkingCalendar, type Holiday } from '../../services/calendarService';
import CalendarEditorModal from './CalendarEditorModal';
import { toastService } from './ToastNotification';

// Sample date range for demo
const DEMO_DATE_RANGE = {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
};

const TimelineCalendarDemo: React.FC = () => {
  const [calendar, setCalendar] = useState<WorkingCalendar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(calendarService.isInDemoMode());
  const [showNonWorkingDays, setShowNonWorkingDays] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [testTaskStart, setTestTaskStart] = useState<string>('2024-01-15');
  const [testTaskDuration, setTestTaskDuration] = useState<number>(5);

  // Load calendar on mount
  useEffect(() => {
    loadCalendar();
  }, []);

  // Load calendar for project
  const loadCalendar = async () => {
    const projectCalendar = await calendarService.getCalendarForProject('demo-project');
    setCalendar(projectCalendar);
    setIsDemoMode(calendarService.isInDemoMode());
  };

  // Handle calendar save
  const handleCalendarSave = (updatedCalendar: WorkingCalendar) => {
    setCalendar(updatedCalendar);
  };

  // Get demo mode configuration
  const demoConfig = calendarService.getDemoModeConfig();

  // Get non-working days for display
  const nonWorkingDays = calendar 
    ? calendarService.getNonWorkingDays(DEMO_DATE_RANGE.start, DEMO_DATE_RANGE.end, 'demo-project')
    : [];

  // Get holidays for display
  const holidays = calendar
    ? calendarService.getHolidaysInRange(DEMO_DATE_RANGE.start, DEMO_DATE_RANGE.end, 'demo-project')
    : [];

  // Test calendar-aware task calculation
  const testTaskEnd = calendar
    ? calendarService.addWorkingDays(new Date(testTaskStart), testTaskDuration, 'demo-project')
    : new Date(testTaskStart);

  // Check if selected date is working day
  const isSelectedDateWorking = calendar
    ? calendarService.isWorkingDay(selectedDate, 'demo-project')
    : true;

  // Get working days between two dates
  const workingDaysBetween = calendar
    ? calendarService.getWorkingDaysBetween(new Date(testTaskStart), testTaskEnd, 'demo-project')
    : testTaskDuration;

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get day of week label
  const getDayLabel = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Generate sample calendar grid
  const generateCalendarGrid = () => {
    const grid: Array<{ date: Date; isWorking: boolean; isHoliday: boolean; label?: string }> = [];
    const current = new Date(DEMO_DATE_RANGE.start);
    
    while (current <= DEMO_DATE_RANGE.end) {
      const isWorking = calendar ? calendarService.isWorkingDay(current, 'demo-project') : true;
      const holiday = holidays.find(h => h.date === current.toISOString().split('T')[0]);
      
      grid.push({
        date: new Date(current),
        isWorking,
        isHoliday: !!holiday,
        label: holiday?.label
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Timeline Calendar Grid Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <ExclamationTriangleIconSolid className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>

          {/* Show Non-Working Days Toggle */}
          <button
            onClick={() => setShowNonWorkingDays(!showNonWorkingDays)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showNonWorkingDays
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {showNonWorkingDays ? 'Hide Non-Working' : 'Show Non-Working'}
          </button>

          {/* Edit Calendar Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Edit Calendar
          </button>
        </div>
      </div>

      {/* Demo Info */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Demo Mode Active
          </h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Working days locked to: {demoConfig.lockedWorkingDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}</li>
            <li>• Maximum holidays: {demoConfig.maxHolidays}</li>
            <li>• Tooltip message: "{demoConfig.tooltipMessage}"</li>
            <li>• Calendar state tagged: {demoConfig.calendarStateTag}</li>
            <li>• Editing disabled: {demoConfig.editingDisabled ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      )}

      {/* Calendar Statistics */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Calendar Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Working Days
            </label>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {calendar?.workingDays.length || 5}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {calendar?.workingDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Holidays
            </label>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {holidays.filter(h => h.type === 'holiday').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Custom holidays defined
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Non-Working Days
            </label>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {nonWorkingDays.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Weekends + holidays
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calendar Name
            </label>
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {calendar?.name || 'Default Calendar'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {calendar?.demo ? 'Demo Calendar' : 'Production Calendar'}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar-Aware Task Testing */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Calendar-Aware Task Testing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              Task Duration Calculator
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={testTaskStart}
                  onChange={(e) => setTestTaskStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Duration (Working Days)
                </label>
                <input
                  type="number"
                  value={testTaskDuration}
                  onChange={(e) => setTestTaskDuration(parseInt(e.target.value) || 1)}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded border">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>End Date:</strong> {formatDate(testTaskEnd)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Working Days:</strong> {workingDaysBetween}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Calendar Days:</strong> {Math.ceil((testTaskEnd.getTime() - new Date(testTaskStart).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              Date Validation
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Test Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded border">
                <div className="flex items-center space-x-2">
                  {isSelectedDateWorking ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    isSelectedDateWorking 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {isSelectedDateWorking ? 'Working Day' : 'Non-Working Day'}
                  </span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {formatDate(selectedDate)} ({getDayLabel(selectedDate)})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid Preview */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Calendar Grid Preview {showNonWorkingDays && '(Non-working days highlighted)'}
        </h2>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {/* Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-100 dark:bg-gray-700 p-2 text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{day}</div>
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarGrid.slice(0, 35).map((day, index) => {
              const isNonWorking = !day.isWorking;
              const isHoliday = day.isHoliday;
              
              return (
                <div
                  key={index}
                  className={`p-2 text-center min-h-[60px] flex flex-col justify-between ${
                    showNonWorkingDays && isNonWorking
                      ? 'bg-slate-200 dark:bg-slate-700 opacity-60'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                  title={isHoliday ? `Non-Working Day: ${day.label}` : undefined}
                >
                  <div className={`text-sm ${
                    isNonWorking 
                      ? 'text-gray-500 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  {isHoliday && (
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {day.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holiday List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Holidays & Non-Working Days
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Custom Holidays
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {holidays.filter(h => h.type === 'holiday').length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No custom holidays defined
                </p>
              ) : (
                holidays.filter(h => h.type === 'holiday').map((holiday) => (
                  <div
                    key={holiday.date}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
                  >
                    <div>
                      <div className="text-sm font-medium text-red-900 dark:text-red-100">
                        {formatDate(new Date(holiday.date))}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300">
                        {holiday.label}
                      </div>
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      Holiday
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Weekend Days
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {holidays.filter(h => h.type === 'weekend').slice(0, 10).map((weekend) => (
                <div
                  key={weekend.date}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(new Date(weekend.date))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {weekend.label}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Weekend
                  </div>
                </div>
              ))}
              {holidays.filter(h => h.type === 'weekend').length > 10 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  +{holidays.filter(h => h.type === 'weekend').length - 10} more weekends
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Features */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Calendar Features
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Visual display of weekends and holidays with greyed background</li>
          <li>• Project-specific working calendars with global fallback</li>
          <li>• Calendar-aware task logic (resizing, dragging, snapping)</li>
          <li>• Supabase storage for calendar data</li>
          <li>• Demo mode constraints and limitations</li>
          <li>• Bar dragging/snapping skips non-working days</li>
          <li>• Start/end dates auto-adjust to working days</li>
          <li>• Task duration calculated in working days</li>
          <li>• Holiday tooltips with labels and descriptions</li>
          <li>• Working day validation and adjustment</li>
        </ul>
      </div>

      {/* Calendar Editor Modal */}
      <CalendarEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId="demo-project"
        existingCalendar={calendar}
        onSave={handleCalendarSave}
      />
    </div>
  );
};

export default TimelineCalendarDemo; 