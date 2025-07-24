import React, { useEffect, useRef } from 'react';
import { undoRedoService, ActionPayload } from '../services/undoRedoService';
import { demoModeService } from '../services/demoModeService';

interface ActionTrackerProps {
  onActionRecorded?: (action: ActionPayload) => void;
  projectId: string;
}

interface TaskUpdateData {
  description?: string;
  endDate?: Date;
  name?: string;
  startDate?: Date;
  statusId?: string;
  tags?: string[];
}

interface DependencyData {
  predecessorId: string;
  projectId: string;
  successorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
}

interface ConstraintData {
  constraintDate: Date;
  type: 'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP';
}

class ActionTracker {
  private projectId: string;
  private isDemoMode: boolean = false;
  private onActionRecorded?: (action: ActionPayload) => void;

  constructor(projectId: string, onActionRecorded?: (action: ActionPayload) => void) {
    this.projectId = projectId;
    this.onActionRecorded = onActionRecorded;
    this.checkDemoMode();
  }

  private async checkDemoMode() {
    this.isDemoMode = await demoModeService.isDemoMode();
  }

  /**
   * Track task update action
   */
  async trackTaskUpdate(taskId: string, before: TaskUpdateData, after: TaskUpdateData): Promise<void> {
    const action: ActionPayload = {
      type: 'update_task',
      taskId,
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track task create action
   */
  async trackTaskCreate(before: null, after: any): Promise<void> {
    const action: ActionPayload = {
      type: 'create_task',
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track task delete action
   */
  async trackTaskDelete(taskId: string, before: any, after: null): Promise<void> {
    const action: ActionPayload = {
      type: 'delete_task',
      taskId,
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track dependency create action
   */
  async trackDependencyCreate(before: null, after: DependencyData): Promise<void> {
    const action: ActionPayload = {
      type: 'create_dependency',
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track dependency delete action
   */
  async trackDependencyDelete(dependencyId: string, before: DependencyData, after: null): Promise<void> {
    const action: ActionPayload = {
      type: 'delete_dependency',
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track constraint update action
   */
  async trackConstraintUpdate(taskId: string, before: ConstraintData | null, after: ConstraintData | null): Promise<void> {
    const action: ActionPayload = {
      type: 'update_constraint',
      taskId,
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track milestone create action
   */
  async trackMilestoneCreate(before: null, after: any): Promise<void> {
    const action: ActionPayload = {
      type: 'create_milestone',
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track milestone update action
   */
  async trackMilestoneUpdate(taskId: string, before: any, after: any): Promise<void> {
    const action: ActionPayload = {
      type: 'update_milestone',
      taskId,
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track status update action
   */
  async trackStatusUpdate(taskId: string, before: { statusId: string }, after: { statusId: string }): Promise<void> {
    const action: ActionPayload = {
      type: 'update_status',
      taskId,
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Track tags update action
   */
  async trackTagsUpdate(taskId: string, before: { tags: string[] }, after: { tags: string[] }): Promise<void> {
    const action: ActionPayload = {
      type: 'update_tags',
      taskId,
      projectId: this.projectId,
      before,
      after
    };

    await this.recordAction(action);
  }

  /**
   * Record action in undo/redo system
   */
  private async recordAction(action: ActionPayload): Promise<void> {
    try {
      const result = await undoRedoService.recordAction(action);
      
      if (result.success) {
        this.onActionRecorded?.(action);
        console.log('Action tracked:', action.type, action.taskId);
      } else {
        console.error('Failed to record action:', result.error);
      }
    } catch (error) {
      console.error('Error recording action:', error);
    }
  }

  /**
   * Get action description for display
   */
  getActionDescription(action: ActionPayload): string {
    switch (action.type) {
      case 'update_task':
        return `Updated task: ${action.taskId}`;
      case 'create_task':
        return `Created task: ${action.after.name}`;
      case 'delete_task':
        return `Deleted task: ${action.before.name}`;
      case 'create_dependency':
        return `Created dependency: ${action.after.predecessorId} → ${action.after.successorId}`;
      case 'delete_dependency':
        return `Deleted dependency: ${action.before.predecessorId} → ${action.before.successorId}`;
      case 'update_constraint':
        return `Updated constraint for task: ${action.taskId}`;
      case 'create_milestone':
        return `Created milestone: ${action.after.name}`;
      case 'update_milestone':
        return `Updated milestone: ${action.taskId}`;
      case 'update_status':
        return `Updated status for task: ${action.taskId}`;
      case 'update_tags':
        return `Updated tags for task: ${action.taskId}`;
      default:
        return `Unknown action: ${action.type}`;
    }
  }

  /**
   * Check if action should be tracked in demo mode
   */
  shouldTrackInDemoMode(action: ActionPayload): boolean {
    if (!this.isDemoMode) return true;
    
    // Demo mode: only track certain action types
    const demoAllowedActions = [
      'update_task',
      'create_task',
      'delete_task',
      'create_dependency',
      'delete_dependency'
    ];
    
    return demoAllowedActions.includes(action.type);
  }
}

const ActionTrackerComponent: React.FC<ActionTrackerProps> = ({
  projectId,
  onActionRecorded
}) => {
  const actionTrackerRef = useRef<ActionTracker | null>(null);

  useEffect(() => {
    // Initialize action tracker
    actionTrackerRef.current = new ActionTracker(projectId, onActionRecorded);

    // Make action tracker available globally for other components
    (window as any).actionTracker = actionTrackerRef.current;

    return () => {
      // Cleanup
      delete (window as any).actionTracker;
    };
  }, [projectId, onActionRecorded]);

  // This component doesn't render anything, it just provides the action tracking service
  return null;
};

export default ActionTrackerComponent;
export { ActionTracker }; 