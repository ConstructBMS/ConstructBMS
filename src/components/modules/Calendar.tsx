import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  Users,
  AlertCircle,
} from 'lucide-react';
import { calendarService } from '../../services/calendarService';
import type { CalendarEvent } from '../../services/calendarService';
import { demoDataService } from '../../services/demoDataService';
import type { DemoCalendarEvent } from '../../services/demoDataService';
import { demoModeService } from '../../services/demoModeService';

const CalendarModule: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [demoEvents, setDemoEvents] = useState<DemoCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('calendarStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  // Load calendar data from database
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setLoading(true);
        
        // Check if we're in demo mode
        const isDemo = await demoModeService.isDemoMode();
        if (!isDemo) {
      
          setCalendarEvents([]);
          setDemoEvents([]);
          return;
        }

        // Load calendar events from database (only in demo mode)
        const eventsData = await demoDataService.getDemoCalendarEvents();
        setDemoEvents(eventsData || []);
        
        // Convert demo events to calendar service format
        const convertedEvents: CalendarEvent[] = (eventsData || []).map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start: new Date(event.start),
          end: new Date(event.end),
          location: event.location,
          attendees: event.attendees,
          type: event.type,
          priority: event.priority,
          status: event.status === 'in-progress' ? 'scheduled' : event.status,
          date: new Date(event.start).toLocaleDateString(),
          time: new Date(event.start).toLocaleTimeString(),
          duration: Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60)),
          calendar: 'default',
          createdAt: new Date(),
        }));
        
        setCalendarEvents(convertedEvents);
      } catch (error) {
        console.error('Failed to load calendar data:', error);
        setCalendarEvents([]);
        setDemoEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarData();
  }, []);

  // Listen for demo data refresh events
  useEffect(() => {
    const handleDemoDataRefresh = async () => {
      console.log('🔄 Calendar: Demo data refresh event received');
      try {
        // Check if we're still in demo mode
        const isDemo = await demoModeService.isDemoMode();
        if (!isDemo) {
      
          setCalendarEvents([]);
          setDemoEvents([]);
          return;
        }

        const eventsData = await demoDataService.getDemoCalendarEvents();
        setDemoEvents(eventsData || []);
        
        // Convert demo events to calendar service format
        const convertedEvents: CalendarEvent[] = (eventsData || []).map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start: new Date(event.start),
          end: new Date(event.end),
          location: event.location,
          attendees: event.attendees,
          type: event.type,
          priority: event.priority,
          status: event.status === 'in-progress' ? 'scheduled' : event.status,
          date: new Date(event.start).toLocaleDateString(),
          time: new Date(event.start).toLocaleTimeString(),
          duration: Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60)),
          calendar: 'default',
          createdAt: new Date(),
        }));
        
        setCalendarEvents(convertedEvents);
  
      } catch (error) {
        console.warn('Failed to refresh calendar data:', error);
        setCalendarEvents([]);
        setDemoEvents([]);
      }
    };

    window.addEventListener('demoDataRefreshed', handleDemoDataRefresh);
    
    return () => {
      window.removeEventListener('demoDataRefreshed', handleDemoDataRefresh);
    };
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('calendarStatsExpanded', JSON.stringify(newState));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'deadline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'scheduled':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Calendar</h1>
        <p className='text-gray-600'>Manage your schedule, meetings, and events</p>
      </div>

      {/* Stats Section */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900'>Calendar Overview</h2>
            <button
              onClick={toggleStats}
              className='text-gray-500 hover:text-gray-700 transition-colors'
            >
              {statsExpanded ? (
                <ChevronUp className='h-5 w-5' />
              ) : (
                <ChevronDown className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>
        
        {statsExpanded && (
          <div className='p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm opacity-90'>Total Events</p>
                  <p className='text-2xl font-bold'>{demoEvents.length}</p>
                </div>
                <Calendar className='h-8 w-8 opacity-80' />
              </div>
            </div>
            
            <div className='bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm opacity-90'>Meetings</p>
                  <p className='text-2xl font-bold'>{demoEvents.filter(e => e.type === 'meeting').length}</p>
                </div>
                <Users className='h-8 w-8 opacity-80' />
              </div>
            </div>
            
            <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm opacity-90'>Tasks</p>
                  <p className='text-2xl font-bold'>{demoEvents.filter(e => e.type === 'task').length}</p>
                </div>
                <CheckCircle className='h-8 w-8 opacity-80' />
              </div>
            </div>
            
            <div className='bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm opacity-90'>Today</p>
                  <p className='text-2xl font-bold'>
                    {demoEvents.filter(e => {
                      const today = new Date().toDateString();
                      const eventDate = new Date(e.start).toDateString();
                      return eventDate === today;
                    }).length}
                  </p>
                </div>
                <Clock className='h-8 w-8 opacity-80' />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {demoEvents.length === 0 && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
          <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No Calendar Events</h3>
          <p className='text-gray-600 mb-6'>
            No calendar events scheduled. Start by creating meetings, tasks, or reminders.
          </p>
          <div className='flex justify-center space-x-4'>
            <button className='bg-constructbms-blue text-black px-4 py-2 rounded-lg font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
              <Plus className='h-4 w-4 mr-2 inline' />
              Schedule Meeting
            </button>
            <button className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors'>
              <CheckCircle className='h-4 w-4 mr-2 inline' />
              Create Task
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      {demoEvents.length > 0 && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
                    ? 'border-constructbms-blue text-constructbms-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-constructbms-blue text-constructbms-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                List View ({demoEvents.length})
              </button>
            </nav>
          </div>

          <div className='p-6'>
            {activeTab === 'list' && (
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg font-semibold text-gray-900'>All Events</h3>
                  <button className='bg-constructbms-blue text-black px-4 py-2 rounded-lg font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
                    <Plus className='h-4 w-4 mr-2 inline' />
                    Add Event
                  </button>
                </div>
                
                <div className='space-y-3'>
                  {demoEvents.map((event) => (
                    <div key={event.id} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-3 mb-2'>
                            <h4 className='font-medium text-gray-900'>{event.title}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.type)}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                          
                          {event.description && (
                            <p className='text-sm text-gray-600 mb-3'>{event.description}</p>
                          )}
                          
                          <div className='flex items-center space-x-4 text-sm text-gray-500'>
                            <div className='flex items-center'>
                              <Clock className='h-4 w-4 mr-1' />
                              <span>
                                {new Date(event.start).toLocaleDateString()} at {new Date(event.start).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className='flex items-center'>
                                <MapPin className='h-4 w-4 mr-1' />
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            {event.attendees.length > 0 && (
                              <div className='flex items-center'>
                                <Users className='h-4 w-4 mr-1' />
                                <span>{event.attendees.length} attendees</span>
                              </div>
                            )}
                            
                            <span className={`font-medium ${getPriorityColor(event.priority)}`}>
                              {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                            </span>
                          </div>
                        </div>
                        
                        <div className='flex space-x-2'>
                          <button className='text-constructbms-blue hover:text-constructbms-black'>
                            <CheckCircle className='h-4 w-4' />
                          </button>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <AlertCircle className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'calendar' && (
              <div className='text-center py-8'>
                <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Calendar View</h3>
                <p className='text-gray-600'>
                  Calendar view will be implemented with a proper calendar component.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
