export interface CalendarEvent {
  attendees: string[];
  calendar: string;
  createdAt: Date;
  createdFromEmail?: string;
  date: string;
  description: string;
  duration: number;
  id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  time: string;
  title: string;
}

export interface Calendar {
  color: string;
  id: string;
  isDefault: boolean;
  name: string;
  type: 'default' | 'work' | 'personal' | 'project' | 'team';
}

class CalendarService {
  private events: CalendarEvent[] = [];
  private calendars: Calendar[] = [
    {
      id: 'default',
      name: 'Default Calendar',
      type: 'default',
      color: '#3B82F6',
      isDefault: true,
    },
    {
      id: 'work',
      name: 'Work Calendar',
      type: 'work',
      color: '#10B981',
      isDefault: false,
    },
    {
      id: 'personal',
      name: 'Personal Calendar',
      type: 'personal',
      color: '#F59E0B',
      isDefault: false,
    },
    {
      id: 'project',
      name: 'Project Calendar',
      type: 'project',
      color: '#8B5CF6',
      isDefault: false,
    },
    {
      id: 'team',
      name: 'Team Calendar',
      type: 'team',
      color: '#EF4444',
      isDefault: false,
    },
  ];

  // Create a new meeting/event
  createEvent(
    eventData: Omit<CalendarEvent, 'id' | 'status' | 'createdAt'>
  ): CalendarEvent {
    const event: CalendarEvent = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'scheduled',
      createdAt: new Date(),
    };

    this.events.push(event);

    // In a real application, this would save to a database
    console.log('Calendar event created:', event);

    return event;
  }

  // Get all events
  getEvents(): CalendarEvent[] {
    return this.events;
  }

  // Get events for a specific calendar
  getEventsByCalendar(calendarId: string): CalendarEvent[] {
    return this.events.filter(event => event.calendar === calendarId);
  }

  // Get all calendars
  getCalendars(): Calendar[] {
    return this.calendars;
  }

  // Get default calendar
  getDefaultCalendar(): Calendar {
    return this.calendars.find(cal => cal.isDefault) || this.calendars[0];
  }

  // Update event status
  updateEventStatus(
    eventId: string,
    status: CalendarEvent['status']
  ): CalendarEvent | null {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.status = status;
      return event;
    }
    return null;
  }

  // Delete event
  deleteEvent(eventId: string): boolean {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get events created from a specific email
  getEventsFromEmail(emailId: string): CalendarEvent[] {
    return this.events.filter(event => event.createdFromEmail === emailId);
  }
}

export const calendarService = new CalendarService();
