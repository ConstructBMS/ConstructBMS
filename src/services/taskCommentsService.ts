import { supabase } from './supabaseAuth';
import { demoModeService } from './demoModeService';

export interface TaskComment {
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: Date;
  demo: boolean;
  id: string;
  parentCommentId?: string | null;
  taskId: string;
  updatedAt: Date;
}

export interface TaskHistoryEntry {
  changedBy: string;
  createdAt: Date;
  demo: boolean;
  fieldChanged: string;
  id: string;
  newValue?: string;
  previousValue?: string;
  taskId: string;
}

export interface CommentResult {
  comment?: TaskComment;
  error?: string;
  success: boolean;
}

export interface HistoryResult {
  entries?: TaskHistoryEntry[];
  error?: string;
  success: boolean;
}

class TaskCommentsService {
  private readonly maxDemoComments = 5;
  private readonly maxDemoHistoryEntries = 3;

  /**
   * Add a comment to a task
   */
  async addComment(
    taskId: string,
    content: string,
    parentCommentId?: string
  ): Promise<CommentResult> {
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

      // Check demo mode restrictions
      if (isDemoMode) {
        const existingComments = await this.getTaskComments(taskId);
        if (
          existingComments.success &&
          existingComments.comments &&
          existingComments.comments.length >= this.maxDemoComments
        ) {
          return {
            success: false,
            error:
              'DEMO LIMIT - Maximum 5 comments per task allowed in demo mode',
          };
        }
      }

      // Get user role
      const userRole = await this.getUserRole(user.id);

      const commentData = {
        task_id: taskId,
        author_id: user.id,
        author_name:
          user.user_metadata?.full_name || user.email || 'Unknown User',
        author_role: userRole,
        content: content.trim(),
        parent_comment_id: parentCommentId || null,
        demo: isDemoMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('programme_task_comments')
        .insert(commentData)
        .select()
        .single();

      if (error) throw error;

      const comment: TaskComment = {
        id: data.id,
        taskId: data.task_id,
        authorId: data.author_id,
        authorName: data.author_name,
        authorRole: data.author_role,
        content: data.content,
        parentCommentId: data.parent_comment_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        demo: data.demo,
      };

      console.log('Comment added:', comment.id, taskId);
      return { success: true, comment };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: 'Failed to add comment' };
    }
  }

  /**
   * Get comments for a task
   */
  async getTaskComments(
    taskId: string
  ): Promise<{ comments?: TaskComment[]; error?: string; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      let query = supabase
        .from('programme_task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      // Demo mode: limit to demo comments only
      if (isDemoMode) {
        query = query.eq('demo', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const comments: TaskComment[] = (data || []).map(row => ({
        id: row.id,
        taskId: row.task_id,
        authorId: row.author_id,
        authorName: row.author_name,
        authorRole: row.author_role,
        content: row.content,
        parentCommentId: row.parent_comment_id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        demo: row.demo,
      }));

      return { success: true, comments };
    } catch (error) {
      console.error('Error getting task comments:', error);
      return { success: false, error: 'Failed to get comments' };
    }
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    content: string
  ): Promise<CommentResult> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('programme_task_comments')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('author_id', user.id) // Only allow updating own comments
        .select()
        .single();

      if (error) throw error;

      const comment: TaskComment = {
        id: data.id,
        taskId: data.task_id,
        authorId: data.author_id,
        authorName: data.author_name,
        authorRole: data.author_role,
        content: data.content,
        parentCommentId: data.parent_comment_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        demo: data.demo,
      };

      return { success: true, comment };
    } catch (error) {
      console.error('Error updating comment:', error);
      return { success: false, error: 'Failed to update comment' };
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(
    commentId: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('programme_task_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id); // Only allow deleting own comments

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: 'Failed to delete comment' };
    }
  }

  /**
   * Log a task history entry
   */
  async logTaskHistory(
    taskId: string,
    fieldChanged: string,
    previousValue?: string,
    newValue?: string
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

      // Check demo mode restrictions
      if (isDemoMode) {
        const existingHistory = await this.getTaskHistory(taskId);
        if (
          existingHistory.success &&
          existingHistory.entries &&
          existingHistory.entries.length >= this.maxDemoHistoryEntries
        ) {
          // Remove oldest entry to make room for new one
          const oldestEntry =
            existingHistory.entries[existingHistory.entries.length - 1];
          if (oldestEntry) {
            await this.deleteHistoryEntry(oldestEntry.id);
          }
        }
      }

      const historyData = {
        task_id: taskId,
        changed_by: user.id,
        field_changed: fieldChanged,
        previous_value: previousValue || null,
        new_value: newValue || null,
        demo: isDemoMode,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('programme_task_history')
        .insert(historyData);

      if (error) throw error;

      console.log('Task history logged:', fieldChanged, taskId);
      return { success: true };
    } catch (error) {
      console.error('Error logging task history:', error);
      return { success: false, error: 'Failed to log task history' };
    }
  }

  /**
   * Get task history
   */
  async getTaskHistory(taskId: string): Promise<HistoryResult> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      let query = supabase
        .from('programme_task_history')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      // Demo mode: limit to demo entries only
      if (isDemoMode) {
        query = query.eq('demo', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const entries: TaskHistoryEntry[] = (data || []).map(row => ({
        id: row.id,
        taskId: row.task_id,
        changedBy: row.changed_by,
        fieldChanged: row.field_changed,
        previousValue: row.previous_value,
        newValue: row.new_value,
        createdAt: new Date(row.created_at),
        demo: row.demo,
      }));

      return { success: true, entries };
    } catch (error) {
      console.error('Error getting task history:', error);
      return { success: false, error: 'Failed to get task history' };
    }
  }

  /**
   * Delete a history entry (for demo mode cleanup)
   */
  private async deleteHistoryEntry(entryId: string): Promise<void> {
    try {
      await supabase.from('programme_task_history').delete().eq('id', entryId);
    } catch (error) {
      console.error('Error deleting history entry:', error);
    }
  }

  /**
   * Get user role for display
   */
  private async getUserRole(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return 'User';
      }

      // Map role to display name
      const roleMap: Record<string, string> = {
        admin: 'Administrator',
        project_manager: 'Project Manager',
        team_lead: 'Team Lead',
        developer: 'Developer',
        designer: 'Designer',
        tester: 'Tester',
        user: 'User',
      };

      return roleMap[data.role] || 'User';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'User';
    }
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Get comment count for a task
   */
  async getCommentCount(taskId: string): Promise<number> {
    try {
      const result = await this.getTaskComments(taskId);
      return result.success && result.comments ? result.comments.length : 0;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const taskCommentsService = new TaskCommentsService();
