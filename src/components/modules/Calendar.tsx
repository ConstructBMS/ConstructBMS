import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { calendarService, CalendarEvent } from '../../services/calendarService';

const demoEvents = [
  { id: 1, title: 'Project Kickoff', date: '2024-01-28', status: 'upcoming' },
  { id: 2, title: 'Design Review', date: '2024-01-29', status: 'upcoming' },
  { id: 3, title: 'Client Meeting', date: '2024-01-27', status: 'completed' },
];

const CalendarModule: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('calendarStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  // Load calendar events
  useEffect(() => {
    setCalendarEvents(calendarService.getEvents());
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('calendarStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Calendar</h1>
        <p className='text-gray-600'>View and manage events and schedules</p>
      </div>

      {/* Stats Cards */}
      <div className='mt-4'>
        <button
          onClick={toggleStats}
          className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4'
        >
          {statsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          Calendar Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Calendar className='h-8 w-8 text-archer-neon mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Events</p>
                <p className='text-2xl font-bold'>
                  {calendarEvents.length + demoEvents.length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Scheduled</p>
                <p className='text-2xl font-bold'>
                  {calendarEvents.filter(e => e.status === 'scheduled').length +
                    demoEvents.filter(e => e.status === 'upcoming').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Calendar className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Completed</p>
                <p className='text-2xl font-bold'>
                  {calendarEvents.filter(e => e.status === 'completed').length +
                    demoEvents.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Events</h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg text-sm font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Event
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Title
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Date
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Demo events */}
            {demoEvents.map(event => (
              <tr key={event.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{event.title}</td>
                <td className='px-4 py-2'>{event.date}</td>
                <td className='px-4 py-2 capitalize'>{event.status}</td>
              </tr>
            ))}
            {/* Calendar service events */}
            {calendarEvents.map(event => (
              <tr key={event.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>
                  <div className='flex items-center space-x-2'>
                    <span>{event.title}</span>
                    {event.createdFromEmail && (
                      <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                        From Email
                      </span>
                    )}
                  </div>
                </td>
                <td className='px-4 py-2'>
                  {event.date} at {event.time}
                </td>
                <td className='px-4 py-2 capitalize'>{event.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarModule;
