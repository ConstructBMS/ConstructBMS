import { supabase } from './supabaseAuth';
import { demoModeService } from './demoModeService';

export interface AuditLogEntry {
  actionType: string;
  after: any | null;
  before: any | null;
  createdAt: Date;
  demo: boolean;
  description: string;
  id: string;
  projectId: string;
  taskId: string | null;
  userId: string;
}

export interface AuditLogFilter {
  actionType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  projectId?: string;
  searchKeyword?: string;
  taskId?: string;
  userId?: string;
}

export interface AuditLogResult {
  error?: string;
  logs?: AuditLogEntry[];
  success: boolean;
  totalCount?: number;
}

export interface AuditLogStats {
  actionsByType: Record<string, number>;
  actionsByUser: Record<string, number>;
  recentActivity: AuditLogEntry[];
  totalActions: number;
}

class AuditTrailService {
  private readonly maxDemoLogs = 3;
  private readonly maxLogsPerPage = 50;

  /**
   * Log an audit entry
   */
  async logAction(
    projectId: string,
    taskId: string | null,
    actionType: string,
    description: string,
    before: any = null,
    after: any = null
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Apply demo mode restrictions
      if (isDemoMode) {
        const existingLogs = await this.getAuditLogs({
          projectId,
          limit: this.maxDemoLogs,
        });
        if (
          existingLogs.success &&
          existingLogs.logs &&
          existingLogs.logs.length >= this.maxDemoLogs
        ) {
          // Remove oldest log to make room for new one
          const oldestLog = existingLogs.logs[existingLogs.logs.length - 1];
          if (oldestLog) {
            await this.deleteAuditLog(oldestLog.id);
          }
        }
      }

      const auditEntry: Omit<AuditLogEntry, 'id' | 'createdAt'> = {
        projectId,
        taskId,
        userId: user.id,
        actionType,
        description,
        before,
        after,
        demo: isDemoMode,
      };

      const { error } = await supabase.from('programme_audit_logs').insert({
        project_id: auditEntry.projectId,
        task_id: auditEntry.taskId,
        user_id: auditEntry.userId,
        action_type: auditEntry.actionType,
        description: auditEntry.description,
        before: auditEntry.before,
        after: auditEntry.after,
        demo: auditEntry.demo,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      console.log('Audit log created:', actionType, taskId);
      return { success: true };
    } catch (error) {
      console.error('Error logging audit entry:', error);
      return { success: false, error: 'Failed to log audit entry' };
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(
    filter: AuditLogFilter & { limit?: number; offset?: number }
  ): Promise<AuditLogResult> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      let query = supabase
        .from('programme_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter.projectId) {
        query = query.eq('project_id', filter.projectId);
      }
      if (filter.taskId) {
        query = query.eq('task_id', filter.taskId);
      }
      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter.actionType) {
        query = query.eq('action_type', filter.actionType);
      }
      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo.toISOString());
      }

      // Demo mode: limit to demo logs only
      if (isDemoMode) {
        query = query.eq('demo', true);
      }

      // Apply pagination
      const limit = filter.limit || this.maxLogsPerPage;
      const offset = filter.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match interface
      const logs: AuditLogEntry[] = (data || []).map(row => ({
        id: row.id,
        projectId: row.project_id,
        taskId: row.task_id,
        userId: row.user_id,
        actionType: row.action_type,
        description: row.description,
        before: row.before,
        after: row.after,
        createdAt: new Date(row.created_at),
        demo: row.demo,
      }));

      // Apply search filter if provided
      let filteredLogs = logs;
      if (filter.searchKeyword) {
        const keyword = filter.searchKeyword.toLowerCase();
        filteredLogs = logs.filter(
          log =>
            log.description.toLowerCase().includes(keyword) ||
            log.actionType.toLowerCase().includes(keyword)
        );
      }

      return { success: true, logs: filteredLogs };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return { success: false, error: 'Failed to get audit logs' };
    }
  }

  /**
   * Get audit logs for a specific task
   */
  async getTaskAuditLogs(
    taskId: string,
    limit: number = 10
  ): Promise<AuditLogResult> {
    return await this.getAuditLogs({ taskId, limit });
  }

  /**
   * Get audit logs for a project
   */
  async getProjectAuditLogs(
    projectId: string,
    limit: number = 50
  ): Promise<AuditLogResult> {
    return await this.getAuditLogs({ projectId, limit });
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(
    projectId: string
  ): Promise<{ error?: string; stats?: AuditLogStats; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      let query = supabase
        .from('programme_audit_logs')
        .select('*')
        .eq('project_id', projectId);

      // Demo mode: limit to demo logs only
      if (isDemoMode) {
        query = query.eq('demo', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logs: AuditLogEntry[] = (data || []).map(row => ({
        id: row.id,
        projectId: row.project_id,
        taskId: row.task_id,
        userId: row.user_id,
        actionType: row.action_type,
        description: row.description,
        before: row.before,
        after: row.after,
        createdAt: new Date(row.created_at),
        demo: row.demo,
      }));

      // Calculate statistics
      const actionsByType: Record<string, number> = {};
      const actionsByUser: Record<string, number> = {};

      logs.forEach(log => {
        actionsByType[log.actionType] =
          (actionsByType[log.actionType] || 0) + 1;
        actionsByUser[log.userId] = (actionsByUser[log.userId] || 0) + 1;
      });

      const stats: AuditLogStats = {
        totalActions: logs.length,
        actionsByType,
        actionsByUser,
        recentActivity: logs.slice(0, 10), // Last 10 activities
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting audit stats:', error);
      return { success: false, error: 'Failed to get audit statistics' };
    }
  }

  /**
   * Delete an audit log (for demo mode cleanup)
   */
  private async deleteAuditLog(
    logId: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('programme_audit_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting audit log:', error);
      return { success: false, error: 'Failed to delete audit log' };
    }
  }

  /**
   * Get demo mode restrictions
   */
  getDemoModeRestrictions(): string[] {
    return [
      `Maximum ${this.maxDemoLogs} audit entries per project`,
      'User names redacted in logs',
      'Diff view hidden (shows "Demo redacted")',
      'Tooltip: "Upgrade for full audit history"',
      'All logs tagged as demo',
    ];
  }

  /**
   * Get action type icon
   */
  getActionTypeIcon(actionType: string): string {
    const iconMap: Record<string, string> = {
      task_create: '📝',
      task_update: '✏️',
      task_delete: '🗑️',
      task_move: '📤',
      task_resize: '📏',
      dependency_create: '🔗',
      dependency_delete: '🔓',
      milestone_create: '🎯',
      milestone_update: '🎯',
      flag_create: '🚩',
      flag_update: '🚩',
      flag_delete: '🚩',
      constraint_set: '🔒',
      constraint_clear: '🔓',
      status_change: '🔄',
      progress_update: '📊',
      resource_assign: '👤',
      resource_unassign: '👤',
      structure_change: '📁',
      calendar_update: '📅',
    };

    return iconMap[actionType] || '📋';
  }

  /**
   * Get action type display name
   */
  getActionTypeDisplayName(actionType: string): string {
    const displayMap: Record<string, string> = {
      task_create: 'Task Created',
      task_update: 'Task Updated',
      task_delete: 'Task Deleted',
      task_move: 'Task Moved',
      task_resize: 'Task Resized',
      dependency_create: 'Dependency Created',
      dependency_delete: 'Dependency Removed',
      milestone_create: 'Milestone Created',
      milestone_update: 'Milestone Updated',
      flag_create: 'Flag Added',
      flag_update: 'Flag Updated',
      flag_delete: 'Flag Removed',
      constraint_set: 'Constraint Set',
      constraint_clear: 'Constraint Cleared',
      status_change: 'Status Changed',
      progress_update: 'Progress Updated',
      resource_assign: 'Resource Assigned',
      resource_unassign: 'Resource Unassigned',
      structure_change: 'Structure Changed',
      calendar_update: 'Calendar Updated',
    };

    return displayMap[actionType] || actionType;
  }

  /**
   * Format audit log description for display
   */
  formatAuditDescription(
    log: AuditLogEntry,
    isDemoMode: boolean = false
  ): string {
    if (isDemoMode) {
      return `${this.getActionTypeDisplayName(log.actionType)} - Demo redacted`;
    }

    return log.description;
  }

  /**
   * Get user display name (with demo mode redaction)
   */
  async getUserDisplayName(
    userId: string,
    isDemoMode: boolean = false
  ): Promise<string> {
    if (isDemoMode) {
      return 'Demo User';
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return 'Unknown User';
      }

      return data.full_name || data.email || 'Unknown User';
    } catch (error) {
      console.error('Error getting user display name:', error);
      return 'Unknown User';
    }
  }
}

// Export singleton instance
export const auditTrailService = new AuditTrailService();
