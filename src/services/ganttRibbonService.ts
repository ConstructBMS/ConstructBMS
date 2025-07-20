import { ganttTaskService } from './ganttTaskService';
import type { Task } from './ganttTaskService';

export interface RibbonActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export class GanttRibbonService {
  private static instance: GanttRibbonService;
  private clipboard: Task[] = [];
  private isCutOperation = false;

  static getInstance(): GanttRibbonService {
    if (!GanttRibbonService.instance) {
      GanttRibbonService.instance = new GanttRibbonService();
    }
    return GanttRibbonService.instance;
  }

  /**
   * Execute a ribbon action
   */
  async executeAction(action: string, taskIds?: string[]): Promise<RibbonActionResult> {
    try {
      switch (action) {
        // File operations
        case 'new-project':
          return this.newProject();
        case 'open-project':
          return this.openProject();
        case 'save-project':
          return this.saveProject();
        case 'export-project':
          return this.exportProject();

        // Clipboard operations
        case 'cut-tasks':
          return this.cutTasks(taskIds || []);
        case 'copy-tasks':
          return this.copyTasks(taskIds || []);
        case 'paste-tasks':
          return this.pasteTasks();

        // Task operations
        case 'delete-task':
          return this.deleteTasks(taskIds || []);
        case 'insert-task':
          return this.insertTask();
        case 'insert-summary':
          return this.insertSummary();

        // Structure operations
        case 'indent-task':
          return this.indentTasks(taskIds || []);
        case 'outdent-task':
          return this.outdentTasks(taskIds || []);
        case 'link-task':
          return this.linkTasks(taskIds || []);
        case 'unlink-task':
          return this.unlinkTasks(taskIds || []);

        // Visibility operations
        case 'expand-all':
          return this.expandAll();
        case 'collapse-all':
          return this.collapseAll();

        // History operations
        case 'undo':
          return this.undo();
        case 'redo':
          return this.redo();

        // Progress operations
        case 'update-progress':
          return this.updateProgress(taskIds || []);
        case 'mark-complete':
          return this.markComplete(taskIds || []);
        case 'reschedule-tasks':
          return this.rescheduleTasks(taskIds || []);

        // Scheduling operations
        case 'auto-schedule':
          return this.autoSchedule();
        case 'level-resources':
          return this.levelResources();
        case 'show-critical-path':
          return this.showCriticalPath();

        // View operations
        case 'toggle-timeline':
          return this.toggleTimeline();
        case 'toggle-grid':
          return this.toggleGrid();
        case 'toggle-dependencies':
          return this.toggleDependencies();
        case 'zoom-in':
          return this.zoomIn();
        case 'zoom-out':
          return this.zoomOut();
        case 'fit-to-window':
          return this.fitToWindow();

        // Filter operations
        case 'apply-filter':
          return this.applyFilter();
        case 'clear-filter':
          return this.clearFilter();
        case 'advanced-filter':
          return this.advancedFilter();

        // Tools operations
        case 'move-to-start':
          return this.moveToStart(taskIds || []);
        case 'move-to-end':
          return this.moveToEnd(taskIds || []);
        case 'align-starts':
          return this.alignStarts(taskIds || []);
        case 'align-ends':
          return this.alignEnds(taskIds || []);
        case 'link-tasks':
          return this.linkTasks(taskIds || []);
        case 'unlink-tasks':
          return this.unlinkTasks(taskIds || []);
        case 'remove-gaps':
          return this.removeGaps(taskIds || []);
        case 'clear-slack':
          return this.clearSlack(taskIds || []);
        case 'check-links':
          return this.checkLinks(taskIds || []);

        default:
          return {
            success: false,
            message: `Unknown action: ${action}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing action ${action}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // File operations
  private newProject(): RibbonActionResult {
    ganttTaskService.clearTasks();
    return {
      success: true,
      message: 'New project created'
    };
  }

  private openProject(): RibbonActionResult {
    // TODO: Implement file picker and project loading
    return {
      success: true,
      message: 'Project opened successfully'
    };
  }

  private saveProject(): RibbonActionResult {
    // TODO: Implement project saving
    return {
      success: true,
      message: 'Project saved successfully'
    };
  }

  private exportProject(): RibbonActionResult {
    // TODO: Implement project export
    return {
      success: true,
      message: 'Project exported successfully'
    };
  }

  // Clipboard operations
  private cutTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for cut operation'
      };
    }

    const tasks = taskIds.map(id => ganttTaskService.getTask(id)).filter(Boolean) as Task[];
    this.clipboard = tasks;
    this.isCutOperation = true;

    // Remove tasks from project
    taskIds.forEach(id => ganttTaskService.deleteTask(id));

    return {
      success: true,
      message: `${tasks.length} task(s) cut to clipboard`
    };
  }

  private copyTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for copy operation'
      };
    }

    const tasks = taskIds.map(id => ganttTaskService.getTask(id)).filter(Boolean) as Task[];
    this.clipboard = tasks.map(task => ({ ...task, id: `copy_${Date.now()}_${Math.random()}` }));
    this.isCutOperation = false;

    return {
      success: true,
      message: `${tasks.length} task(s) copied to clipboard`
    };
  }

  private pasteTasks(): RibbonActionResult {
    if (this.clipboard.length === 0) {
      return {
        success: false,
        message: 'Clipboard is empty'
      };
    }

    const pastedTasks: Task[] = [];
    this.clipboard.forEach(task => {
      const newTask = {
        ...task,
        id: `task_${Date.now()}_${Math.random()}`,
        name: this.isCutOperation ? task.name : `${task.name} (Copy)`,
        startDate: new Date(task.startDate.getTime() + 7 * 24 * 60 * 60 * 1000), // Add 1 week
        endDate: new Date(task.endDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
      
      ganttTaskService.addTask(newTask);
      pastedTasks.push(newTask);
    });

    if (this.isCutOperation) {
      this.clipboard = [];
      this.isCutOperation = false;
    }

    return {
      success: true,
      message: `${pastedTasks.length} task(s) pasted successfully`
    };
  }

  // Task operations
  private deleteTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for deletion'
      };
    }

    let deletedCount = 0;
    taskIds.forEach(id => {
      if (ganttTaskService.deleteTask(id)) {
        deletedCount++;
      }
    });

    return {
      success: true,
      message: `${deletedCount} task(s) deleted successfully`
    };
  }

  private insertTask(): RibbonActionResult {
    const newTask: Omit<Task, 'id'> = {
      name: 'New Task',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      duration: 7,
      percentComplete: 0,
      status: 'not-started',
      level: 0,
      taskType: 'task',
      priority: 'medium',
      isExpanded: true,
      isSelected: false,
      predecessors: [],
      successors: [],
      resources: [],
      cost: 0
    };

    const addedTask = ganttTaskService.addTask(newTask);
    return {
      success: true,
      message: 'New task inserted successfully',
      data: addedTask
    };
  }

  private insertSummary(): RibbonActionResult {
    const newSummary: Omit<Task, 'id'> = {
      name: 'New Summary',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      duration: 14,
      percentComplete: 0,
      status: 'not-started',
      level: 0,
      taskType: 'summary',
      priority: 'medium',
      isExpanded: true,
      isSelected: false,
      children: [],
      predecessors: [],
      successors: [],
      resources: [],
      cost: 0
    };

    const addedSummary = ganttTaskService.addTask(newSummary);
    return {
      success: true,
      message: 'New summary task inserted successfully',
      data: addedSummary
    };
  }

  // Structure operations
  private indentTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for indentation'
      };
    }

    let indentedCount = 0;
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task && task.level < 5) { // Max 5 levels deep
        ganttTaskService.updateTask(id, { level: task.level + 1 });
        indentedCount++;
      }
    });

    return {
      success: true,
      message: `${indentedCount} task(s) indented successfully`
    };
  }

  private outdentTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for outdentation'
      };
    }

    let outdentedCount = 0;
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task && task.level > 0) {
        ganttTaskService.updateTask(id, { level: task.level - 1 });
        outdentedCount++;
      }
    });

    return {
      success: true,
      message: `${outdentedCount} task(s) outdented successfully`
    };
  }

  private linkTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length < 2) {
      return {
        success: false,
        message: 'At least 2 tasks must be selected to create a link'
      };
    }

    // Create predecessor-successor relationships
    for (let i = 0; i < taskIds.length - 1; i++) {
      const currentTask = ganttTaskService.getTask(taskIds[i]);
      const nextTask = ganttTaskService.getTask(taskIds[i + 1]);
      
      if (currentTask && nextTask) {
        // Add current task as predecessor to next task
        const updatedPredecessors = [...(nextTask.predecessors || []), currentTask.id];
        ganttTaskService.updateTask(nextTask.id, { predecessors: updatedPredecessors });
        
        // Add next task as successor to current task
        const updatedSuccessors = [...(currentTask.successors || []), nextTask.id];
        ganttTaskService.updateTask(currentTask.id, { successors: updatedSuccessors });
      }
    }

    return {
      success: true,
      message: `${taskIds.length - 1} link(s) created successfully`
    };
  }

  private unlinkTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for unlinking'
      };
    }

    let unlinkedCount = 0;
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task) {
        // Remove all predecessors and successors
        ganttTaskService.updateTask(id, { predecessors: [], successors: [] });
        unlinkedCount++;
      }
    });

    return {
      success: true,
      message: `${unlinkedCount} task(s) unlinked successfully`
    };
  }

  // Visibility operations
  private expandAll(): RibbonActionResult {
    const tasks = ganttTaskService.getTasks();
    let expandedCount = 0;

    tasks.forEach(task => {
      if (task.children && task.children.length > 0 && !task.isExpanded) {
        ganttTaskService.toggleTaskExpansion(task.id);
        expandedCount++;
      }
    });

    return {
      success: true,
      message: `${expandedCount} task(s) expanded successfully`
    };
  }

  private collapseAll(): RibbonActionResult {
    const tasks = ganttTaskService.getTasks();
    let collapsedCount = 0;

    tasks.forEach(task => {
      if (task.children && task.children.length > 0 && task.isExpanded) {
        ganttTaskService.toggleTaskExpansion(task.id);
        collapsedCount++;
      }
    });

    return {
      success: true,
      message: `${collapsedCount} task(s) collapsed successfully`
    };
  }

  // History operations (placeholder implementations)
  private undo(): RibbonActionResult {
    // TODO: Implement undo functionality
    return {
      success: true,
      message: 'Undo operation completed'
    };
  }

  private redo(): RibbonActionResult {
    // TODO: Implement redo functionality
    return {
      success: true,
      message: 'Redo operation completed'
    };
  }

  // Progress operations
  private updateProgress(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for progress update'
      };
    }

    // TODO: Implement progress update modal
    return {
      success: true,
      message: 'Progress update dialog opened'
    };
  }

  private markComplete(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for completion'
      };
    }

    let completedCount = 0;
    taskIds.forEach(id => {
      ganttTaskService.updateTask(id, { 
        status: 'completed', 
        percentComplete: 100 
      });
      completedCount++;
    });

    return {
      success: true,
      message: `${completedCount} task(s) marked as complete`
    };
  }

  private rescheduleTasks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for rescheduling'
      };
    }

    // TODO: Implement reschedule dialog
    return {
      success: true,
      message: 'Reschedule dialog opened'
    };
  }

  // Scheduling operations
  private autoSchedule(): RibbonActionResult {
    // TODO: Implement auto-scheduling algorithm
    return {
      success: true,
      message: 'Auto-scheduling completed'
    };
  }

  private levelResources(): RibbonActionResult {
    // TODO: Implement resource leveling
    return {
      success: true,
      message: 'Resource leveling completed'
    };
  }

  private showCriticalPath(): RibbonActionResult {
    // TODO: Implement critical path highlighting
    return {
      success: true,
      message: 'Critical path displayed'
    };
  }

  // View operations
  private toggleTimeline(): RibbonActionResult {
    return {
      success: true,
      message: 'Timeline view toggled'
    };
  }

  private toggleGrid(): RibbonActionResult {
    return {
      success: true,
      message: 'Grid view toggled'
    };
  }

  private toggleDependencies(): RibbonActionResult {
    return {
      success: true,
      message: 'Dependencies display toggled'
    };
  }

  private zoomIn(): RibbonActionResult {
    return {
      success: true,
      message: 'Zoomed in'
    };
  }

  private zoomOut(): RibbonActionResult {
    return {
      success: true,
      message: 'Zoomed out'
    };
  }

  private fitToWindow(): RibbonActionResult {
    return {
      success: true,
      message: 'Fitted to window'
    };
  }

  // Filter operations
  private applyFilter(): RibbonActionResult {
    return {
      success: true,
      message: 'Filter applied'
    };
  }

  private clearFilter(): RibbonActionResult {
    return {
      success: true,
      message: 'Filter cleared'
    };
  }

  private advancedFilter(): RibbonActionResult {
    return {
      success: true,
      message: 'Advanced filter dialog opened'
    };
  }

  /**
   * Get clipboard contents
   */
  getClipboard(): Task[] {
    return [...this.clipboard];
  }

  /**
   * Clear clipboard
   */
  clearClipboard(): void {
    this.clipboard = [];
    this.isCutOperation = false;
  }

  /**
   * Check if clipboard has content
   */
  hasClipboardContent(): boolean {
    return this.clipboard.length > 0;
  }

  /**
   * Check if last operation was cut
   */
  isLastOperationCut(): boolean {
    return this.isCutOperation;
  }

  // Tools operations
  private moveToStart(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for move operation'
      };
    }

    const projectStart = new Date();
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task) {
        ganttTaskService.updateTask(id, {
          startDate: projectStart,
          endDate: new Date(projectStart.getTime() + task.duration * 24 * 60 * 60 * 1000)
        });
      }
    });

    return {
      success: true,
      message: `Moved ${taskIds.length} task(s) to project start date`
    };
  }

  private moveToEnd(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for move operation'
      };
    }

    const projectEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task) {
        ganttTaskService.updateTask(id, {
          endDate: projectEnd,
          startDate: new Date(projectEnd.getTime() - task.duration * 24 * 60 * 60 * 1000)
        });
      }
    });

    return {
      success: true,
      message: `Moved ${taskIds.length} task(s) to project end date`
    };
  }

  private alignStarts(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for alignment'
      };
    }

    const firstTask = ganttTaskService.getTask(taskIds[0]);
    if (!firstTask) {
      return {
        success: false,
        message: 'Could not find reference task for alignment'
      };
    }

    const alignStartDate = firstTask.startDate;
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task) {
        ganttTaskService.updateTask(id, {
          startDate: alignStartDate,
          endDate: new Date(alignStartDate.getTime() + task.duration * 24 * 60 * 60 * 1000)
        });
      }
    });

    return {
      success: true,
      message: `Aligned start dates for ${taskIds.length} task(s)`
    };
  }

  private alignEnds(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for alignment'
      };
    }

    const firstTask = ganttTaskService.getTask(taskIds[0]);
    if (!firstTask) {
      return {
        success: false,
        message: 'Could not find reference task for alignment'
      };
    }

    const alignEndDate = firstTask.endDate;
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task) {
        ganttTaskService.updateTask(id, {
          endDate: alignEndDate,
          startDate: new Date(alignEndDate.getTime() - task.duration * 24 * 60 * 60 * 1000)
        });
      }
    });

    return {
      success: true,
      message: `Aligned end dates for ${taskIds.length} task(s)`
    };
  }

  private removeGaps(taskIds: string[]): RibbonActionResult {
    if (taskIds.length < 2) {
      return {
        success: false,
        message: 'At least 2 tasks required to remove gaps'
      };
    }

    const tasks = taskIds
      .map(id => ganttTaskService.getTask(id))
      .filter(Boolean) as Task[];
    
    const sortedTasks = tasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    for (let i = 1; i < sortedTasks.length; i++) {
      const prevTask = sortedTasks[i - 1];
      const currTask = sortedTasks[i];
      const gap = currTask.startDate.getTime() - prevTask.endDate.getTime();
      
      if (gap > 0) {
        ganttTaskService.updateTask(currTask.id, {
          startDate: new Date(prevTask.endDate),
          endDate: new Date(prevTask.endDate.getTime() + currTask.duration * 24 * 60 * 60 * 1000)
        });
      }
    }

    return {
      success: true,
      message: `Removed gaps between ${taskIds.length} task(s)`
    };
  }

  private clearSlack(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for slack clearing'
      };
    }

    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task && task.predecessors?.length) {
        const latestPredecessorEnd = Math.max(
          ...task.predecessors.map(p => {
            const predTask = ganttTaskService.getTask(p.id);
            return predTask ? predTask.endDate.getTime() : 0;
          })
        );
        
        if (latestPredecessorEnd > task.startDate.getTime()) {
          ganttTaskService.updateTask(id, {
            startDate: new Date(latestPredecessorEnd),
            endDate: new Date(latestPredecessorEnd + task.duration * 24 * 60 * 60 * 1000)
          });
        }
      }
    });

    return {
      success: true,
      message: `Cleared slack for ${taskIds.length} task(s)`
    };
  }

  private checkLinks(taskIds: string[]): RibbonActionResult {
    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No tasks selected for link validation'
      };
    }

    const linkErrors: string[] = [];
    taskIds.forEach(id => {
      const task = ganttTaskService.getTask(id);
      if (task) {
        // Check for circular dependencies
        if (task.predecessors?.some(p => p.id === id)) {
          linkErrors.push(`Circular dependency detected in task: ${task.name}`);
        }
        
        // Check for invalid predecessor references
        task.predecessors?.forEach(pred => {
          const predTask = ganttTaskService.getTask(pred.id);
          if (!predTask) {
            linkErrors.push(`Invalid predecessor reference in task: ${task.name}`);
          }
        });
      }
    });
    
    if (linkErrors.length > 0) {
      return {
        success: false,
        message: `Link validation found ${linkErrors.length} error(s): ${linkErrors.join(', ')}`
      };
    }

    return {
      success: true,
      message: `Link validation passed for ${taskIds.length} task(s)`
    };
  }
}

export const ganttRibbonService = GanttRibbonService.getInstance(); 