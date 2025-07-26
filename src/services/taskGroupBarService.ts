import { taskService, type Task } from './taskService';
import { demoModeService } from './demoModeService';

export interface GroupBarInfo {
  childCount: number;
  duration: number;
  endDate: Date;
  groupColor: string | null;
  isDemo: boolean;
  startDate: Date;
  taskId: string;
  taskName: string;
  tooltip: string;
}

export interface GroupBarStyle {
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  opacity: number;
}

class TaskGroupBarService {
  private isDemoMode = false;

  constructor() {
    this.checkDemoMode();
  }

  private async checkDemoMode() {
    this.isDemoMode = await demoModeService.getDemoMode();
  }

  /**
   * Get group bar information for a parent task
   */
  async getGroupBarInfo(parentTaskId: string): Promise<GroupBarInfo | null> {
    try {
      const parentTask = await taskService.getTask(parentTaskId);
      if (!parentTask || parentTask.type !== 'phase') {
        return null;
      }

      const children = await taskService.getChildTasks(parentTaskId);
      if (children.length === 0) {
        return null;
      }

      const groupDuration =
        await taskService.calculateGroupDuration(parentTaskId);
      if (!groupDuration.startDate || !groupDuration.endDate) {
        return null;
      }

      const tooltip = this.generateTooltip(parentTask, children, groupDuration);
      const groupColor = this.getGroupColor(parentTask, children);

      return {
        taskId: parentTask.id,
        taskName: parentTask.name,
        startDate: groupDuration.startDate,
        endDate: groupDuration.endDate,
        duration: groupDuration.duration,
        childCount: children.length,
        groupColor,
        isDemo: this.isDemoMode,
        tooltip,
      };
    } catch (error) {
      console.error('Error getting group bar info:', error);
      return null;
    }
  }

  /**
   * Get group bar information for all parent tasks in a project
   */
  async getProjectGroupBars(projectId: string): Promise<GroupBarInfo[]> {
    try {
      const tasks = await taskService.getProjectTasks(projectId);
      const parentTasks = tasks.filter(task => task.type === 'phase');

      const groupBars: GroupBarInfo[] = [];

      for (const parentTask of parentTasks) {
        const groupBar = await this.getGroupBarInfo(parentTask.id);
        if (groupBar) {
          groupBars.push(groupBar);
        }
      }

      return groupBars;
    } catch (error) {
      console.error('Error getting project group bars:', error);
      return [];
    }
  }

  /**
   * Generate tooltip text for group bar
   */
  private generateTooltip(
    parentTask: Task,
    children: Task[],
    groupDuration: {
      duration: number;
      endDate: Date | null;
      startDate: Date | null;
    }
  ): string {
    const childCount = children.length;
    const startDate = groupDuration.startDate?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
    const endDate = groupDuration.endDate?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });

    let tooltip = `Group: ${childCount} sub-task${childCount !== 1 ? 's' : ''}`;

    if (startDate && endDate) {
      tooltip += `, Span: ${startDate}–${endDate}`;
    }

    if (this.isDemoMode) {
      tooltip += ' (Demo mode – Task nesting limited)';
    }

    return tooltip;
  }

  /**
   * Get group bar color based on task and demo mode
   */
  private getGroupColor(parentTask: Task, children: Task[]): string | null {
    // Demo mode restrictions
    if (this.isDemoMode) {
      return '#6B7280'; // Grey color for demo mode
    }

    // Use parent task's group color if set
    if (parentTask.groupColor) {
      return parentTask.groupColor;
    }

    // Default color based on task type
    switch (parentTask.type) {
      case 'phase':
        return '#3B82F6'; // Blue
      case 'summary':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Grey
    }
  }

  /**
   * Get group bar styling
   */
  getGroupBarStyle(groupBar: GroupBarInfo): GroupBarStyle {
    const baseStyle: GroupBarStyle = {
      backgroundColor: groupBar.groupColor || '#3B82F6',
      opacity: 0.3,
    };

    // Demo mode styling
    if (groupBar.isDemo) {
      return {
        ...baseStyle,
        backgroundColor: '#6B7280',
        opacity: 0.4,
        borderColor: '#9CA3AF',
        borderWidth: 1,
      };
    }

    return baseStyle;
  }

  /**
   * Check if a task should show a group bar
   */
  async shouldShowGroupBar(taskId: string): Promise<boolean> {
    try {
      const task = await taskService.getTask(taskId);
      if (!task || task.type !== 'phase') {
        return false;
      }

      const children = await taskService.getChildTasks(taskId);
      return children.length > 0;
    } catch (error) {
      console.error('Error checking if should show group bar:', error);
      return false;
    }
  }

  /**
   * Get child tasks that should be shown under a parent
   */
  async getVisibleChildTasks(parentId: string): Promise<Task[]> {
    try {
      const children = await taskService.getChildTasks(parentId);
      const visibleChildren: Task[] = [];

      for (const child of children) {
        const isVisible = await taskService.isTaskVisible(child.id);
        if (isVisible) {
          visibleChildren.push(child);
        }
      }

      return visibleChildren;
    } catch (error) {
      console.error('Error getting visible child tasks:', error);
      return [];
    }
  }

  /**
   * Calculate group progress based on child task progress
   */
  async calculateGroupProgress(parentId: string): Promise<number> {
    try {
      const children = await taskService.getChildTasks(parentId);
      if (children.length === 0) {
        return 0;
      }

      const totalProgress = children.reduce(
        (sum, child) => sum + (child.progress || 0),
        0
      );
      return Math.round(totalProgress / children.length);
    } catch (error) {
      console.error('Error calculating group progress:', error);
      return 0;
    }
  }

  /**
   * Get demo mode configuration for group bars
   */
  getDemoModeConfig() {
    return {
      maxNestingLevel: 1,
      groupBarColor: '#6B7280',
      tooltipSuffix: ' (Demo mode – Task nesting limited)',
      isActive: this.isDemoMode,
    };
  }

  /**
   * Validate group bar creation (demo mode restrictions)
   */
  async validateGroupBarCreation(
    parentId: string
  ): Promise<{ reason?: string; valid: boolean }> {
    if (!this.isDemoMode) {
      return { valid: true };
    }

    try {
      const parentTask = await taskService.getTask(parentId);
      if (!parentTask) {
        return { valid: false, reason: 'Parent task not found' };
      }

      const children = await taskService.getChildTasks(parentId);

      // Demo mode: max 3 tasks per phase
      if (children.length >= 3) {
        return {
          valid: false,
          reason: 'Demo mode - Maximum 3 tasks per phase allowed',
        };
      }

      // Demo mode: max 1 level of nesting
      const parentLevel = await taskService.getTaskLevel(parentId);
      if (parentLevel >= 1) {
        return {
          valid: false,
          reason: 'Demo mode - Maximum 1 level of nesting allowed',
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating group bar creation:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }
}

// Export singleton instance
export const taskGroupBarService = new TaskGroupBarService();
