import { supabase } from './supabase';
import { loggingService } from './loggingService';

// Enhanced Dependency interface
export interface Dependency {
  from: string; 
  // Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish
  lag: number; 
  // Task ID this dependency comes from
  type: 'FS' | 'SS' | 'FF' | 'SF'; // Lag/lead time in days (positive = lag, negative = lead)
}

// Enhanced Task interface
export interface Task {
  assignedTo?: string;
  barColor?: string;
  // e.g. BIM/IFC object ref
// Bar chart styling properties
  barStyle?: 'standard' | 'critical' | 'custom';
  // Order within its parent (0 = first, 1 = second, etc.)
  children?: string[];
  constraintDate?: Date;
  // Enhanced successors with type
  constraintType?: 'asap' | 'must-start-on' | 'must-finish-on' | 'finish-no-later';
  // Assigned resource IDs
  cost?: number;
  deadline?: Date; 
  dependencies?: Dependency[];
  duration: number; 
  effortType?: 'fixed-work' | 'fixed-duration' | 'fixed-units'; 
  endDate: Date;
  fontSize?: number;
  id: string;
  // 4D BIM properties
  ifcObjectId?: string;
  // Array of child task IDs
  isExpanded?: boolean;
  isSelected?: boolean; 
  level: number; 
  name: string; 
  notes?: string;
  // Hierarchy level (0 = root, 1 = child, etc.)
  parentId?: string;
  percentComplete: number;
  position: number; 
  // Enhanced dependencies with types and lag
  predecessors?: { id: string; type: 'FS' | 'SS' | 'FF' | 'SF' }[]; 
  priority?: 'low' | 'medium' | 'high' | 'critical';
  resources?: string[];
  showLabel?: boolean;
  startDate: Date;
  status: 'not-started' | 'in-progress' | 'completed';
  // Enhanced predecessors with type
  successors?: { id: string; type: 'FS' | 'SS' | 'FF' | 'SF' }[];
  taskType?: 'normal' | 'milestone' | 'summary' | 'hammock' | 'level-of-effort' | 'wbs' | 'deliverable';
  workHours?: number;
}

// Sample project data based on Asta screenshots
export const createSampleProjectData = (): Task[] => {
  const tasks: Task[] = [
    // Level 0 - Main Project
    {
      id: 'project-1',
      name: 'Site Establishment Project',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-04-04'),
      duration: 89,
      percentComplete: 0,
      status: 'not-started',
      level: 0,
      position: 0,
      taskType: 'summary',
      isExpanded: true,
      children: ['phase-1', 'phase-2', 'phase-3'],
      priority: 'high'
    },

    // Level 1 - Phases
    {
      id: 'phase-1',
      name: 'Site Preparation',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-02-11'),
      duration: 37,
      percentComplete: 0,
      status: 'not-started',
      level: 1,
      parentId: 'project-1',
      position: 0,
      taskType: 'summary',
      isExpanded: true,
      children: ['task-1', 'task-2'],
      priority: 'high'
    },
    {
      id: 'phase-2',
      name: 'Foundation Work',
      startDate: new Date('2025-02-12'),
      endDate: new Date('2025-02-25'),
      duration: 14,
      percentComplete: 0,
      status: 'not-started',
      level: 1,
      parentId: 'project-1',
      position: 1,
      taskType: 'summary',
      isExpanded: true,
      children: ['task-3'],
      priority: 'high'
    },
    {
      id: 'phase-3',
      name: 'Infrastructure',
      startDate: new Date('2025-02-25'),
      endDate: new Date('2025-04-04'),
      duration: 39,
      percentComplete: 0,
      status: 'not-started',
      level: 1,
      parentId: 'project-1',
      position: 2,
      taskType: 'summary',
      isExpanded: true,
      children: ['task-4'],
      priority: 'medium'
    },

    // Level 2 - Individual Tasks
    {
      id: 'task-1',
      name: 'Fencing',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-08'),
      duration: 3,
      percentComplete: 0,
      status: 'not-started',
      level: 2,
      parentId: 'phase-1',
      position: 0,
      taskType: 'normal',
      dependencies: [],
      predecessors: [],
      successors: [{ id: 'task-2', type: 'FS' }],
      priority: 'medium',
      assignedTo: 'Site Team',
      resources: ['resource-1', 'resource-2'],
      cost: 5000
    },
    {
      id: 'task-2',
      name: 'Demolition',
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-02-11'),
      duration: 31,
      percentComplete: 0,
      status: 'not-started',
      level: 2,
      parentId: 'phase-1',
      position: 1,
      taskType: 'normal',
      dependencies: [
        { from: 'task-1', type: 'FS', lag: 1 } // Finish-to-Start with 1 day lag
      ],
      predecessors: [{ id: 'task-1', type: 'FS' }],
      successors: [{ id: 'task-3', type: 'FS' }],
      priority: 'high',
      assignedTo: 'Demolition Team',
      resources: ['resource-3', 'resource-4', 'resource-5'],
      cost: 25000
    },
    {
      id: 'task-3',
      name: 'Excavate',
      startDate: new Date('2025-02-12'),
      endDate: new Date('2025-02-25'),
      duration: 14,
      percentComplete: 0,
      status: 'not-started',
      level: 2,
      parentId: 'phase-2',
      position: 0,
      taskType: 'normal',
      dependencies: [
        { from: 'task-2', type: 'FS', lag: 0 }, // Finish-to-Start with no lag
        { from: 'task-1', type: 'SS', lag: -2 } // Start-to-Start with 2 day lead
      ],
      predecessors: [{ id: 'task-2', type: 'FS' }],
      successors: [{ id: 'task-4', type: 'FS' }],
      priority: 'high',
      assignedTo: 'Excavation Team',
      resources: ['resource-6', 'resource-7'],
      cost: 15000
    },
    {
      id: 'task-4',
      name: 'Temporary Roads',
      startDate: new Date('2025-02-25'),
      endDate: new Date('2025-04-04'),
      duration: 39,
      percentComplete: 0,
      status: 'not-started',
      level: 2,
      parentId: 'phase-3',
      position: 0,
      taskType: 'normal',
      dependencies: [
        { from: 'task-3', type: 'FS', lag: 0 }, // Finish-to-Start with no lag
        { from: 'task-2', type: 'FF', lag: 3 } // Finish-to-Finish with 3 day lag
      ],
      predecessors: [{ id: 'task-3', type: 'FS' }],
      successors: [],
      priority: 'medium',
      assignedTo: 'Infrastructure Team',
      resources: ['resource-8', 'resource-9'],
      cost: 35000
    },

    // Milestone
    {
      id: 'milestone-1',
      name: 'Site Ready for Construction',
      startDate: new Date('2025-04-04'),
      endDate: new Date('2025-04-04'),
      duration: 1,
      percentComplete: 0,
      status: 'not-started',
      level: 2,
      parentId: 'project-1',
      position: 3,
      taskType: 'milestone',
      dependencies: [
        { from: 'task-4', type: 'FS', lag: 0 } // Finish-to-Start with no lag
      ],
      predecessors: [{ id: 'task-4', type: 'FS' }],
      successors: [],
      priority: 'critical'
    }
  ];

  return tasks;
};

// Task service functions
export class GanttTaskService {
  private tasks: Task[] = [];

  constructor() {
    this.tasks = createSampleProjectData();
  }

  // Get all tasks
  getTasks(): Task[] {
    return this.tasks;
  }

  // Get task by ID
  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  getTask(id: string): Task | undefined {
    return this.getTaskById(id);
  }

  // Update task
  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return null;

    const updatedTask = { ...this.tasks[taskIndex], ...updates } as Task;
    this.tasks[taskIndex] = updatedTask;

    // Update parent/child relationships if needed
    if (updates.parentId !== undefined) {
      this.updateParentChildRelationships(taskId, updates.parentId);
    }

    return updatedTask;
  }

  // Add new task
  addTask(task: Omit<Task, 'id'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isExpanded: false,
      isSelected: false
    } as Task;

    this.tasks.push(newTask);

    // Update parent/child relationships
    if (task.parentId) {
      this.updateParentChildRelationships(newTask.id, task.parentId);
    }

    return newTask;
  }

  // Delete task
  deleteTask(taskId: string): boolean {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return false;

    const task = this.tasks[taskIndex];
    if (!task) return false;

    // Remove from parent's children array
    if (task.parentId) {
      const parent = this.tasks.find(t => t.id === task.parentId);
      if (parent && parent.children) {
        parent.children = parent.children.filter(id => id !== taskId);
      }
    }

    // Remove all child tasks
    if (task.children) {
      task.children.forEach(childId => {
        this.deleteTask(childId);
      });
    }

    this.tasks.splice(taskIndex, 1);
    return true;
  }

  // Clear all tasks
  clearTasks(): void {
    this.tasks = [];
  }

  // Expand/collapse task
  toggleTaskExpansion(taskId: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    return this.updateTask(taskId, { isExpanded: !task.isExpanded });
  }

  // Select/deselect task
  toggleTaskSelection(taskId: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    return this.updateTask(taskId, { isSelected: !task.isSelected });
  }

  // Get visible tasks (respecting hierarchy)
  getVisibleTasks(): Task[] {
    const visible: Task[] = [];
    
    const addVisibleTask = (task: Task) => {
      visible.push(task);
      if (task.isExpanded && task.children) {
        task.children.forEach(childId => {
          const childTask = this.tasks.find(t => t.id === childId);
          if (childTask) {
            addVisibleTask(childTask);
          }
        });
      }
    };

    // Start with root tasks (level 0)
    const rootTasks = this.tasks.filter(task => task.level === 0);
    rootTasks.forEach(addVisibleTask);
    
    return visible;
  }

  // Calculate project progress
  calculateProjectProgress(): number {
    const tasks = this.getVisibleTasks().filter(task => task.taskType === 'normal');
    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce((sum, task) => sum + task.percentComplete, 0);
    return Math.round(totalProgress / tasks.length);
  }

  // Update parent/child relationships
  private updateParentChildRelationships(taskId: string, parentId: string): void {
    // Remove from old parent
    this.tasks.forEach(task => {
      if (task.children && task.children.includes(taskId)) {
        task.children = task.children.filter(id => id !== taskId);
      }
    });

    // Add to new parent
    const parent = this.tasks.find(t => t.id === parentId);
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(taskId);
    }
  }

  // Get task dependencies
  getTaskDependencies(taskId: string): { predecessors: Task[], successors: Task[] } {
    const task = this.getTaskById(taskId);
    if (!task) return { predecessors: [], successors: [] };

    const predecessors = (task.predecessors || [])
      .map(id => this.getTaskById(id))
      .filter((t): t is Task => t !== undefined);

    const successors = (task.successors || [])
      .map(id => this.getTaskById(id))
      .filter((t): t is Task => t !== undefined);

    return { predecessors, successors };
  }

  // Validate task dates
  validateTaskDates(taskId: string): { errors: string[], isValid: boolean; } {
    const task = this.getTaskById(taskId);
    if (!task) return { isValid: false, errors: ['Task not found'] };

    const errors: string[] = [];

    // Check if start date is before end date
    if (task.startDate >= task.endDate) {
      errors.push('Start date must be before end date');
    }

    // Check dependencies
    if (task.predecessors) {
      task.predecessors.forEach(predId => {
        const pred = this.getTaskById(predId);
        if (pred && task.startDate <= pred.endDate) {
          errors.push(`Task must start after predecessor "${pred.name}" ends`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Move task to new position
  moveTask(taskId: string, targetId: string): boolean {
    const task = this.getTaskById(taskId);
    const target = this.getTaskById(targetId);
    
    if (!task || !target) return false;

    // Don't allow moving a task to itself
    if (taskId === targetId) return false;

    // Don't allow moving a parent to its child
    if (this.isDescendant(taskId, targetId)) return false;

    // Get the target's parent and level
    const newParentId = target.parentId;
    const newLevel = target.level;

    // Update task's parent and level
    task.parentId = newParentId;
    task.level = newLevel;

    // Get siblings (tasks with same parent)
    const siblings = this.tasks.filter(t => 
      t.parentId === newParentId && 
      t.id !== taskId
    );

    // Find target's position in siblings
    const targetIndex = siblings.findIndex(t => t.id === targetId);
    
    // Insert task at the correct position
    if (targetIndex !== -1) {
      // Insert after the target
      siblings.splice(targetIndex + 1, 0, task);
    } else {
      // If target not found in siblings, add to end
      siblings.push(task);
    }

    // Update positions for all siblings
    siblings.forEach((sibling, index) => {
      sibling.position = index;
    });

    // Update parent/child relationships
    if (newParentId) {
      this.updateParentChildRelationships(taskId, newParentId);
    }

    return true;
  }

  // Check if task is descendant of another task
  private isDescendant(taskId: string, potentialAncestorId: string): boolean {
    const task = this.getTaskById(taskId);
    if (!task || !task.parentId) return false;
    
    if (task.parentId === potentialAncestorId) return true;
    
    return this.isDescendant(task.parentId, potentialAncestorId);
  }
}

// Export singleton instance
export const ganttTaskService = new GanttTaskService(); 