import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

export interface ProgrammePresence {
  createdAt: Date;
  demo: boolean;
  id: string;
  isOnline: boolean;
  lastSeen: Date;
  projectId: string;
  updatedAt: Date;
  userAvatar?: string;
  userEmail: string;
  userId: string;
  userName: string;
}

export interface TaskLock {
  createdAt: Date;
  demo: boolean;
  expiresAt: Date;
  id: string;
  lockedAt: Date;
  lockedBy: string;
  lockedByUser: string;
  projectId: string;
  taskId: string;
}

export interface CollaborationState {
  error: string | null;
  isConnected: boolean;
  presence: ProgrammePresence[];
  taskLocks: TaskLock[];
}

class ProgrammeCollaborationService {
  private presenceChannel: any = null;
  private taskLocksChannel: any = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentProjectId: string | null = null;
  private currentUserId: string | null = null;
  private isDemoMode: boolean = false;

  // Event listeners
  private listeners: {
    [event: string]: ((data: any) => void)[];
  } = {};

  constructor() {
    this.setupDemoModeCheck();
  }

  private async setupDemoModeCheck() {
    this.isDemoMode = await demoModeService.isDemoMode();
  }

  /**
   * Initialize collaboration for a project
   */
  async initializeCollaboration(projectId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      this.currentProjectId = projectId;
      this.currentUserId = user.id;

      // Join presence
      await this.joinPresence(projectId, user);
      
      // Setup realtime subscriptions
      this.setupRealtimeSubscriptions(projectId);
      
      // Start heartbeat
      this.startHeartbeat(projectId);

      this.emit('collaborationInitialized', { projectId, user });
    } catch (error) {
      console.error('Error initializing collaboration:', error);
      this.emit('error', { error: error instanceof Error ? error.message : 'Failed to initialize collaboration' });
    }
  }

  /**
   * Join presence for a project
   */
  private async joinPresence(projectId: string, user: any): Promise<void> {
    const isDemoMode = await demoModeService.isDemoMode();
    
    const presenceData = {
      user_id: user.id,
      project_id: projectId,
      user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
      user_email: user.email,
      user_avatar: user.user_metadata?.avatar_url,
      last_seen: new Date().toISOString(),
      is_online: true,
      demo: isDemoMode
    };

    const { error } = await supabase
      .from('programme_presence')
      .upsert(presenceData, { onConflict: 'user_id,project_id' });

    if (error) throw error;
  }

  /**
   * Setup realtime subscriptions
   */
  private setupRealtimeSubscriptions(projectId: string): void {
    // Presence subscription
    this.presenceChannel = supabase
      .channel(`programme_presence_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'programme_presence',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          this.handlePresenceChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Programme presence real-time subscription connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Programme presence real-time subscription failed');
        }
      });

    // Task locks subscription
    this.taskLocksChannel = supabase
      .channel(`programme_task_locks_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'programme_task_locks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          this.handleTaskLockChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Programme task locks real-time subscription connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Programme task locks real-time subscription failed');
        }
      });
  }

  /**
   * Handle presence changes
   */
  private handlePresenceChange(payload: any): void {
    const presence: ProgrammePresence = {
      id: payload.new.id,
      userId: payload.new.user_id,
      projectId: payload.new.project_id,
      userName: payload.new.user_name,
      userEmail: payload.new.user_email,
      userAvatar: payload.new.user_avatar,
      lastSeen: new Date(payload.new.last_seen),
      isOnline: payload.new.is_online,
      demo: payload.new.demo,
      createdAt: new Date(payload.new.created_at),
      updatedAt: new Date(payload.new.updated_at)
    };

    if (payload.eventType === 'INSERT') {
      this.emit('userJoined', presence);
    } else if (payload.eventType === 'UPDATE') {
      this.emit('userUpdated', presence);
    } else if (payload.eventType === 'DELETE') {
      this.emit('userLeft', presence);
    }
  }

  /**
   * Handle task lock changes
   */
  private handleTaskLockChange(payload: any): void {
    const taskLock: TaskLock = {
      id: payload.new.id,
      taskId: payload.new.task_id,
      projectId: payload.new.project_id,
      lockedBy: payload.new.locked_by,
      lockedByUser: payload.new.locked_by_user,
      lockedAt: new Date(payload.new.locked_at),
      expiresAt: new Date(payload.new.expires_at),
      demo: payload.new.demo,
      createdAt: new Date(payload.new.created_at)
    };

    if (payload.eventType === 'INSERT') {
      this.emit('taskLocked', taskLock);
    } else if (payload.eventType === 'DELETE') {
      this.emit('taskUnlocked', taskLock);
    }
  }

  /**
   * Start heartbeat to keep presence active
   */
  private startHeartbeat(projectId: string): void {
    this.heartbeatInterval = setInterval(async () => {
      if (!this.currentUserId || !this.currentProjectId) return;

      try {
        await supabase
          .from('programme_presence')
          .update({
            last_seen: new Date().toISOString(),
            is_online: true
          })
          .eq('user_id', this.currentUserId)
          .eq('project_id', projectId);
      } catch (error) {
        console.error('Error updating presence heartbeat:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  /**
   * Lock a task for editing
   */
  async lockTask(taskId: string): Promise<{ error?: string; lock?: TaskLock, success: boolean; }> {
    try {
      if (!this.currentUserId || !this.currentProjectId) {
        return { success: false, error: 'Not connected to project' };
      }

      // Check if task is already locked
      const existingLock = await this.getTaskLock(taskId);
      if (existingLock && existingLock.lockedBy !== this.currentUserId) {
        return { 
          success: false, 
          error: `Task is currently being edited by ${existingLock.lockedByUser}` 
        };
      }

      // Demo mode restrictions
      if (this.isDemoMode) {
        const activeLocks = await this.getProjectTaskLocks(this.currentProjectId);
        if (activeLocks.length >= 1) {
          return { success: false, error: 'Maximum 1 task lock allowed in demo mode' };
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const lockData = {
        task_id: taskId,
        project_id: this.currentProjectId,
        locked_by: this.currentUserId,
        locked_by_user: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
        locked_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        demo: this.isDemoMode
      };

      const { data: lock, error } = await supabase
        .from('programme_task_locks')
        .insert(lockData)
        .select()
        .single();

      if (error) throw error;

      const taskLock: TaskLock = {
        id: lock.id,
        taskId: lock.task_id,
        projectId: lock.project_id,
        lockedBy: lock.locked_by,
        lockedByUser: lock.locked_by_user,
        lockedAt: new Date(lock.locked_at),
        expiresAt: new Date(lock.expires_at),
        demo: lock.demo,
        createdAt: new Date(lock.created_at)
      };

      return { success: true, lock: taskLock };
    } catch (error) {
      console.error('Error locking task:', error);
      return { success: false, error: 'Failed to lock task' };
    }
  }

  /**
   * Unlock a task
   */
  async unlockTask(taskId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      if (!this.currentUserId || !this.currentProjectId) {
        return { success: false, error: 'Not connected to project' };
      }

      const { error } = await supabase
        .from('programme_task_locks')
        .delete()
        .eq('task_id', taskId)
        .eq('locked_by', this.currentUserId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error unlocking task:', error);
      return { success: false, error: 'Failed to unlock task' };
    }
  }

  /**
   * Get task lock
   */
  async getTaskLock(taskId: string): Promise<TaskLock | null> {
    try {
      const { data: lock, error } = await supabase
        .from('programme_task_locks')
        .select('*')
        .eq('task_id', taskId)
        .single();

      if (error || !lock) return null;

      // Check if lock has expired
      if (new Date(lock.expires_at) < new Date()) {
        // Auto-delete expired lock
        await supabase
          .from('programme_task_locks')
          .delete()
          .eq('id', lock.id);
        return null;
      }

      return {
        id: lock.id,
        taskId: lock.task_id,
        projectId: lock.project_id,
        lockedBy: lock.locked_by,
        lockedByUser: lock.locked_by_user,
        lockedAt: new Date(lock.locked_at),
        expiresAt: new Date(lock.expires_at),
        demo: lock.demo,
        createdAt: new Date(lock.created_at)
      };
    } catch (error) {
      console.error('Error getting task lock:', error);
      return null;
    }
  }

  /**
   * Get all task locks for a project
   */
  async getProjectTaskLocks(projectId: string): Promise<TaskLock[]> {
    try {
      const { data: locks, error } = await supabase
        .from('programme_task_locks')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      // Filter out expired locks
      const validLocks = locks.filter(lock => new Date(lock.expires_at) > new Date());

      // Auto-delete expired locks
      const expiredLocks = locks.filter(lock => new Date(lock.expires_at) <= new Date());
      if (expiredLocks.length > 0) {
        const expiredIds = expiredLocks.map(lock => lock.id);
        await supabase
          .from('programme_task_locks')
          .delete()
          .in('id', expiredIds);
      }

      return validLocks.map(lock => ({
        id: lock.id,
        taskId: lock.task_id,
        projectId: lock.project_id,
        lockedBy: lock.locked_by,
        lockedByUser: lock.locked_by_user,
        lockedAt: new Date(lock.locked_at),
        expiresAt: new Date(lock.expires_at),
        demo: lock.demo,
        createdAt: new Date(lock.created_at)
      }));
    } catch (error) {
      console.error('Error getting project task locks:', error);
      return [];
    }
  }

  /**
   * Get all presence for a project
   */
  async getProjectPresence(projectId: string): Promise<ProgrammePresence[]> {
    try {
      const { data: presence, error } = await supabase
        .from('programme_presence')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_online', true);

      if (error) throw error;

      // Demo mode: limit to 1 other user
      let filteredPresence = presence;
      if (this.isDemoMode) {
        filteredPresence = presence.slice(0, 2); // Current user + 1 other
      }

      return filteredPresence.map(p => ({
        id: p.id,
        userId: p.user_id,
        projectId: p.project_id,
        userName: p.user_name,
        userEmail: p.user_email,
        userAvatar: p.user_avatar,
        lastSeen: new Date(p.last_seen),
        isOnline: p.is_online,
        demo: p.demo,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at)
      }));
    } catch (error) {
      console.error('Error getting project presence:', error);
      return [];
    }
  }

  /**
   * Leave collaboration
   */
  async leaveCollaboration(): Promise<void> {
    try {
      if (this.currentUserId && this.currentProjectId) {
        // Update presence to offline
        await supabase
          .from('programme_presence')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('user_id', this.currentUserId)
          .eq('project_id', this.currentProjectId);

        // Unlock any tasks locked by this user
        await supabase
          .from('programme_task_locks')
          .delete()
          .eq('locked_by', this.currentUserId)
          .eq('project_id', this.currentProjectId);
      }

      // Cleanup subscriptions
      if (this.presenceChannel) {
        this.presenceChannel.unsubscribe();
        this.presenceChannel = null;
      }

      if (this.taskLocksChannel) {
        this.taskLocksChannel.unsubscribe();
        this.taskLocksChannel = null;
      }

      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      this.currentProjectId = null;
      this.currentUserId = null;

      this.emit('collaborationLeft', {});
    } catch (error) {
      console.error('Error leaving collaboration:', error);
    }
  }

  /**
   * Event handling
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: string, data: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.leaveCollaboration();
  }
}

// Export singleton instance
export const programmeCollaborationService = new ProgrammeCollaborationService(); 