import { supabase } from './supabase';
import { ActivityItem } from '../types';

// Activity Stream Service - Now uses real database persistence
export class ActivityStreamService {
  private static instance: ActivityStreamService;
  private activities: ActivityItem[] = [];
  private listeners: ((activities: ActivityItem[]) => void)[] = [];

  static getInstance(): ActivityStreamService {
    if (!ActivityStreamService.instance) {
      ActivityStreamService.instance = new ActivityStreamService();
    }
    return ActivityStreamService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadActivities();
      this.setupRealtimeSubscription();
    } catch (error) {
      console.error('Failed to initialize activity stream:', error);
      // Fallback to demo data if database fails
      this.loadDemoData();
    }
  }

  private async loadActivities(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('activity_stream')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading activities:', error);
        throw error;
      }

      this.activities = data || [];
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load activities from database:', error);
      throw error;
    }
  }

  private loadDemoData(): void {
    this.activities = [
      {
        id: '1',
        type: 'task_completed',
        category: 'tasks',
        title: 'Task Completed',
        description: 'Design Homepage task has been completed',
        entityId: '1',
        entityName: 'Task',
        userId: null,
        userName: 'John Designer',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        priority: 'medium',
        read: false,
        actionable: true,
        actionUrl: '/tasks/1',
        metadata: { taskId: 1, projectId: 1 },
        icon: 'check-circle',
        color: 'green',
        isDemoData: true,
      },
      {
        id: '2',
        type: 'project_updated',
        category: 'projects',
        title: 'Project Updated',
        description: 'Website Redesign project progress updated to 65%',
        entityId: '1',
        entityName: 'Project',
        userId: null,
        userName: 'John Manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        priority: 'medium',
        read: false,
        actionable: true,
        actionUrl: '/projects/1',
        metadata: { projectId: 1, oldProgress: 50, newProgress: 65 },
        icon: 'chart-bar',
        color: 'blue',
        isDemoData: true,
      },
      {
        id: '3',
        type: 'opportunity_created',
        category: 'sales',
        title: 'New Opportunity',
        description: 'Enterprise Software License opportunity created',
        entityId: '1',
        entityName: 'Opportunity',
        userId: null,
        userName: 'John Sales',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        priority: 'high',
        read: false,
        actionable: true,
        actionUrl: '/opportunities/1',
        metadata: { opportunityId: 1, value: 50000 },
        icon: 'plus-circle',
        color: 'purple',
        isDemoData: true,
      },
    ];
    this.notifyListeners();
  }

  private setupRealtimeSubscription(): void {
    supabase
      .channel('activity_stream_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_stream',
        },
        payload => {
          console.log('Activity stream change:', payload);
          this.loadActivities();
        }
      )
      .subscribe();
  }

  async addActivity(
    activity: Omit<ActivityItem, 'id' | 'timestamp' | 'isDemoData'>
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('activity_stream')
        .insert({
          activity_id: `act_${Date.now()}`,
          type: activity.type,
          category: activity.category,
          title: activity.title,
          description: activity.description,
          entity_id: activity.entityId,
          entity_name: activity.entityName,
          user_id: activity.userId,
          user_name: activity.userName,
          priority: activity.priority,
          read: activity.read,
          actionable: activity.actionable,
          action_url: activity.actionUrl,
          metadata: activity.metadata,
          icon: activity.icon,
          color: activity.color,
          is_demo_data: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding activity:', error);
        throw error;
      }

      // Activity will be loaded via realtime subscription
    } catch (error) {
      console.error('Failed to add activity to database:', error);
      // Fallback to local storage for demo data
      const newActivity: ActivityItem = {
        ...activity,
        id: Date.now().toString(),
        timestamp: new Date(),
        isDemoData: true,
      };
      this.activities.unshift(newActivity);
      this.notifyListeners();
    }
  }

  async markAsRead(activityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_stream')
        .update({ read: true })
        .eq('id', activityId);

      if (error) {
        console.error('Error marking activity as read:', error);
        throw error;
      }

      // Update will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to mark activity as read:', error);
      // Fallback to local update
      const activity = this.activities.find(a => a.id === activityId);
      if (activity) {
        activity.read = true;
        this.notifyListeners();
      }
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_stream')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('Error marking all activities as read:', error);
        throw error;
      }

      // Updates will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to mark all activities as read:', error);
      // Fallback to local update
      this.activities.forEach(activity => {
        activity.read = true;
      });
      this.notifyListeners();
    }
  }

  getActivities(): ActivityItem[] {
    return this.activities;
  }

  getUnreadCount(): number {
    return this.activities.filter(activity => !activity.read).length;
  }

  subscribe(listener: (activities: ActivityItem[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.activities);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.activities));
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_stream')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Error deleting activity:', error);
        throw error;
      }

      // Deletion will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to delete activity:', error);
      // Fallback to local deletion
      this.activities = this.activities.filter(a => a.id !== activityId);
      this.notifyListeners();
    }
  }

  async clearAllActivities(): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_stream')
        .delete()
        .eq('is_demo_data', true);

      if (error) {
        console.error('Error clearing activities:', error);
        throw error;
      }

      // Clear will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to clear activities:', error);
      // Fallback to local clear
      this.activities = [];
      this.notifyListeners();
    }
  }
}

export const activityStreamService = ActivityStreamService.getInstance();
