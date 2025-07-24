import React, { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  FlagIcon,
  LinkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  PencilIcon,
  LockClosedIcon,
  LockOpenIcon,
  CalendarIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import type { RibbonTab, RibbonGroup, RibbonButton, RibbonDropdownItem } from '../GanttRibbon';
import ClipboardSection from './ClipboardSection';
import TaskSection from './TaskSection';
import StructureSection from './StructureSection';
import LinkSection from './LinkSection';
import ToolsSection from './ToolsSection';
import GroupingSection from './GroupingSection';
import FieldsSection from './FieldsSection';
import SecondaryToolsSection from './SecondaryToolsSection';
import ValidationResultsModal from './ValidationResultsModal';
import TaskEditModal from './TaskEditModal';
import type { TaskData } from './TaskEditModal';
import TaskPropertiesModal from './TaskPropertiesModal';
import LagTimeModal from './LagTimeModal';
import type { TaskDependency } from './LagTimeModal';
import type { FieldConfig } from './FieldsDropdown';
import type { ValidationIssue } from './ValidationResultsModal';
import { useClipboard } from '../../../contexts/ClipboardContext';
import { useUndoRedo } from '../../../contexts/UndoRedoContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { persistentStorage } from '../../../services/persistentStorage';
import { TaskStructureService } from '../../../services/taskStructureService';
import { TaskDependencyService } from '../../../services/taskDependencyService';
import { RescheduleService } from '../../../services/rescheduleService';
import { ProgressLineService } from '../../../services/progressLineService';
import { GroupingService } from '../../../services/groupingService';
import { FieldsService } from '../../../services/fieldsService';
import { SecondaryToolsService } from '../../../services/secondaryToolsService';

// Types for task operations
export interface TaskOperation {
  data?: any;
  type: 'add' | 'delete' | 'milestone' | 'link' | 'unlink' | 'indent' | 'outdent' | 'progress' | 'cut' | 'copy' | 'paste';
}

// Link types for task dependencies
export interface LinkType {
  abbreviation: string;
  description: string;
  id: string;
  label: string;
}

// Progress options
export interface ProgressOption {
  icon: React.ComponentType<any>;
  id: string;
  label: string;
  value: number;
}

// Link types for task dependencies
const LINK_TYPES: LinkType[] = [
  {
    id: 'fs',
    label: 'Finish to Start',
    description: 'Task B cannot start until Task A finishes',
    abbreviation: 'FS'
  },
  {
    id: 'ss',
    label: 'Start to Start',
    description: 'Task B cannot start until Task A starts',
    abbreviation: 'SS'
  },
  {
    id: 'ff',
    label: 'Finish to Finish',
    description: 'Task B cannot finish until Task A finishes',
    abbreviation: 'FF'
  },
  {
    id: 'sf',
    label: 'Start to Finish',
    description: 'Task B cannot finish until Task A starts',
    abbreviation: 'SF'
  }
];

// Progress options
const PROGRESS_OPTIONS: ProgressOption[] = [
  {
    id: '25',
    label: '25% Complete',
    value: 25,
    icon: ClockIcon
  },
  {
    id: '50',
    label: '50% Complete',
    value: 50,
    icon: ChartBarIcon
  },
  {
    id: '100',
    label: '100% Complete',
    value: 100,
    icon: CheckCircleIcon
  }
];

interface HomeTabWithClipboardProps {
  canEdit: boolean;
  onTaskOperation: (operation: TaskOperation) => void;
  selectedTasks: string[];
  userRole: string;
  activeRibbonTab: string;
  tasks?: TaskData[];
  onTasksUpdate?: (tasks: TaskData[]) => void;
  projectId?: string;
}

const HomeTabWithClipboard: React.FC<HomeTabWithClipboardProps> = ({
  canEdit,
  onTaskOperation,
  selectedTasks,
  userRole,
  activeRibbonTab,
  tasks = [],
  onTasksUpdate,
  projectId = 'default'
}) => {
  const { cutTasks, copyTasks, pasteTasks } = useClipboard();
  const { canAccess } = usePermissions();

  // Check if user can perform actions (not viewer)
  const isViewer = userRole === 'viewer';
  const hasSelection = selectedTasks.length > 0;
  const hasMultipleSelection = selectedTasks.length > 1;

  // Task modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLagTimeModalOpen, setIsLagTimeModalOpen] = useState(false);
  const [isProgressLineVisible, setIsProgressLineVisible] = useState(false);
  const [isSummaryBarsVisible, setIsSummaryBarsVisible] = useState(true);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [secondaryToolsLoading, setSecondaryToolsLoading] = useState({
    recalculateSlack: false,
    clearConstraints: false,
    validateLogic: false
  });

  // Clipboard handlers
  const handleCut = () => {
    if (hasSelection) {
      // Mock tasks for now - in real implementation, get from task service
      const mockTasks = selectedTasks.map(id => ({
        id,
        name: `Task ${id}`,
        startDate: new Date(),
        endDate: new Date(),
        duration: 1,
        progress: 0,
        status: 'not-started' as const,
        level: 0
      }));
      
      cutTasks(mockTasks);
      onTaskOperation({ type: 'cut', data: { taskIds: selectedTasks } });
    }
  };

  const handleCopy = () => {
    if (hasSelection) {
      // Mock tasks for now - in real implementation, get from task service
      const mockTasks = selectedTasks.map(id => ({
        id,
        name: `Task ${id}`,
        startDate: new Date(),
        endDate: new Date(),
        duration: 1,
        progress: 0,
        status: 'not-started' as const,
        level: 0
      }));
      
      copyTasks(mockTasks);
      onTaskOperation({ type: 'copy', data: { taskIds: selectedTasks } });
    }
  };

  const handlePaste = () => {
    const pastedTasks = pasteTasks();
    if (pastedTasks.length > 0) {
      onTaskOperation({ type: 'paste', data: { tasks: pastedTasks } });
    }
  };

  // Task handlers
  const handleNewTask = async () => {
    const newTask: TaskData = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Task (demo)',
      duration: 1,
      startDate: new Date(),
      endDate: new Date(),
      notes: '',
      demo: true
    };

    // Save to persistent storage
    try {
      await persistentStorage.setSetting(`task_${newTask.id}`, newTask, 'tasks');
      console.log('Demo task created:', newTask.id);
      
      // Update local state
      if (onTasksUpdate) {
        onTasksUpdate([...tasks, newTask]);
      }
      
      // Add to undo stack
      addAction({
        type: 'task_create',
        data: { task: newTask },
        description: `Create task "${newTask.name}"`,
        demo: true
      });
      
      // Dispatch operation
      onTaskOperation({ type: 'add', data: { task: newTask } });
    } catch (error) {
      console.error('Failed to create new task:', error);
    }
  };

  const handleDelete = () => {
    if (hasSelection) {
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const tasksToDelete = tasks.filter(task => selectedTasks.includes(task.id));
      
      // Add to undo stack before deletion
      addAction({
        type: 'task_delete',
        data: { tasks: tasksToDelete },
        description: `Delete ${tasksToDelete.length} task(s)`,
        demo: true
      });
      
      // Remove from persistent storage
      for (const task of tasksToDelete) {
        await persistentStorage.removeSetting(`task_${task.id}`, 'tasks');
      }
      
      // Update local state
      if (onTasksUpdate) {
        onTasksUpdate(tasks.filter(task => !selectedTasks.includes(task.id)));
      }
      
      // Clear selection
      setSelectedTasks([]);
      setIsDeleteConfirmOpen(false);
      
      // Dispatch operation
      onTaskOperation({ type: 'delete', data: { taskIds: selectedTasks } });
      
      console.log('Demo tasks deleted:', tasksToDelete.map(t => t.id));
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  };

  const handleEdit = () => {
    if (hasSelection) {
      setIsEditModalOpen(true);
    }
  };

  const handleEditSave = async (updatedTask: TaskData) => {
    try {
      await persistentStorage.setSetting(`task_${updatedTask.id}`, updatedTask, 'tasks');
      
      // Update local state
      if (onTasksUpdate) {
        const updatedTasks = tasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
        onTasksUpdate(updatedTasks);
      }
      
      // Dispatch operation
      onTaskOperation({ type: 'add', data: { task: updatedTask } });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleProperties = () => {
    if (hasSelection) {
      setIsPropertiesModalOpen(true);
    }
  };

  // Structure handlers
  const handleIndent = async () => {
    if (hasSelection) {
      try {
        const updatedTasks = TaskStructureService.indentTasks(tasks, selectedTasks);
        
        // Update persistent storage for affected tasks
        for (const task of updatedTasks) {
          if (selectedTasks.includes(task.id) || task.children?.some(id => selectedTasks.includes(id))) {
            await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
            if (task.demo) {
              console.log('Demo task structure updated (indent):', task.id);
            }
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'indent', data: { taskIds: selectedTasks } });
      } catch (error) {
        console.error('Failed to indent tasks:', error);
      }
    }
  };

  const handleOutdent = async () => {
    if (hasSelection) {
      try {
        const updatedTasks = TaskStructureService.outdentTasks(tasks, selectedTasks);
        
        // Update persistent storage for affected tasks
        for (const task of updatedTasks) {
          if (selectedTasks.includes(task.id) || task.children?.some(id => selectedTasks.includes(id))) {
            await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
            if (task.demo) {
              console.log('Demo task structure updated (outdent):', task.id);
            }
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'outdent', data: { taskIds: selectedTasks } });
      } catch (error) {
        console.error('Failed to outdent tasks:', error);
      }
    }
  };

  const handleMakeSummary = async () => {
    if (hasSelection) {
      try {
        const updatedTasks = TaskStructureService.makeSummaryTasks(tasks, selectedTasks);
        
        // Update persistent storage for affected tasks
        for (const task of updatedTasks) {
          if (selectedTasks.includes(task.id) || task.children?.some(id => selectedTasks.includes(id))) {
            await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
            if (task.demo) {
              console.log('Demo task structure updated (summary):', task.id);
            }
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'summary', taskIds: selectedTasks } });
      } catch (error) {
        console.error('Failed to make summary tasks:', error);
      }
    }
  };

  // Check structure operation availability
  const canIndent = TaskStructureService.canIndentTasks(tasks, selectedTasks);
  const canOutdent = TaskStructureService.canOutdentTasks(tasks, selectedTasks);
  const canMakeSummary = TaskStructureService.canMakeSummaryTasks(tasks, selectedTasks);

  // Link handlers
  const handleLink = async () => {
    if (selectedTasks.length >= 2) {
      try {
        const { tasks: updatedTasks, dependencies } = TaskDependencyService.linkTasks(tasks, selectedTasks);
        
        // Update persistent storage for affected tasks
        for (const task of updatedTasks) {
          if (selectedTasks.includes(task.id)) {
            await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
            if (task.demo) {
              console.log('Demo task dependencies updated (link):', task.id);
            }
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'link', data: { taskIds: selectedTasks, dependencies } });
      } catch (error) {
        console.error('Failed to link tasks:', error);
      }
    }
  };

  const handleUnlink = async () => {
    if (selectedTasks.length >= 2) {
      try {
        const { tasks: updatedTasks, removedDependencies } = TaskDependencyService.unlinkTasks(tasks, selectedTasks);
        
        // Update persistent storage for affected tasks
        for (const task of updatedTasks) {
          if (selectedTasks.includes(task.id)) {
            await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
            if (task.demo) {
              console.log('Demo task dependencies updated (unlink):', task.id);
            }
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'unlink', data: { taskIds: selectedTasks, removedDependencies } });
      } catch (error) {
        console.error('Failed to unlink tasks:', error);
      }
    }
  };

  const handleLag = () => {
    if (selectedTasks.length === 2) {
      setIsLagTimeModalOpen(true);
    }
  };

  const handleLagSave = async (dependency: TaskDependency) => {
    try {
      const { tasks: updatedTasks } = TaskDependencyService.updateLagTime(tasks, dependency);
      
      // Update persistent storage for affected tasks
      const predecessor = updatedTasks.find(t => t.id === dependency.id);
      const successor = updatedTasks.find(t => t.id === dependency.targetId);
      
      if (predecessor) {
        await persistentStorage.setSetting(`task_${predecessor.id}`, predecessor, 'tasks');
        if (predecessor.demo) {
          console.log('Demo task lag updated (predecessor):', predecessor.id);
        }
      }
      
      if (successor) {
        await persistentStorage.setSetting(`task_${successor.id}`, successor, 'tasks');
        if (successor.demo) {
          console.log('Demo task lag updated (successor):', successor.id);
        }
      }
      
      // Update local state
      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }
      
      // Dispatch operation
      onTaskOperation({ type: 'add', data: { action: 'lag', dependency } });
    } catch (error) {
      console.error('Failed to update lag time:', error);
    }
  };

  // Check link operation availability
  const canLink = TaskDependencyService.canLinkTasks(tasks, selectedTasks);
  const canUnlink = TaskDependencyService.canUnlinkTasks(tasks, selectedTasks);
  const canLag = TaskDependencyService.canManageLagTime(tasks, selectedTasks);

  // Get all dependencies for lag modal
  const allDependencies: TaskDependency[] = [];
  tasks.forEach(task => {
    if (task.dependencies) {
      allDependencies.push(...task.dependencies);
    }
  });

  // Tools handlers
  const { addAction, undo, redo, canUndo, canRedo, isRescheduling, setIsRescheduling } = useUndoRedo();

  const handleReschedule = async () => {
    try {
      setIsRescheduling(true);
      
      // Add to undo stack before rescheduling
      addAction({
        type: 'reschedule',
        data: { tasks: [...tasks], selectedTasks },
        description: `Reschedule ${selectedTasks.length > 0 ? selectedTasks.length : 'all'} task(s)`,
        demo: true
      });

      const result = await RescheduleService.rescheduleProgramme(tasks, selectedTasks.length > 0 ? selectedTasks : undefined);
      
      if (result.success) {
        // Update persistent storage for affected tasks
        for (const task of result.updatedTasks) {
          await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
          if (task.demo) {
            console.log('Demo task rescheduled:', task.id);
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(result.updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'reschedule', result } });
        
        // Show warnings if any
        if (result.warnings.length > 0) {
          console.warn('Reschedule warnings:', result.warnings);
        }
      } else {
        console.error('Reschedule failed:', result.errors);
        // Remove the action from undo stack since it failed
        // This would require a more sophisticated undo system
      }
    } catch (error) {
      console.error('Failed to reschedule:', error);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleProgressToggle = async () => {
    try {
      const success = await ProgressLineService.toggleProgressLine('demo');
      if (success) {
        const newState = !isProgressLineVisible;
        setIsProgressLineVisible(newState);
        
        // Add to undo stack
        addAction({
          type: 'progress_toggle',
          data: { isVisible: newState },
          description: `${newState ? 'Show' : 'Hide'} progress line`,
          demo: true
        });
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'progress_toggle', isVisible: newState } });
      }
    } catch (error) {
      console.error('Failed to toggle progress line:', error);
    }
  };

  const handleUndo = () => {
    undo();
    onTaskOperation({ type: 'add', data: { action: 'undo' } });
  };

  const handleRedo = () => {
    redo();
    onTaskOperation({ type: 'add', data: { action: 'redo' } });
  };

  // Handle undo/redo actions from ProgrammeUndoRedoButtons
  const handleActionUndone = (action: any) => {
    console.log('Action undone:', action);
    onTaskOperation({ type: 'add', data: { action: 'undo', actionDetails: action } });
  };

  const handleActionRedone = (action: any) => {
    console.log('Action redone:', action);
    onTaskOperation({ type: 'add', data: { action: 'redo', actionDetails: action } });
  };

  // Check if rescheduling is possible
  const canReschedule = RescheduleService.canReschedule(tasks, selectedTasks.length > 0 ? selectedTasks : undefined);

  // Grouping handlers
  const handleExpandAll = async () => {
    try {
      // Add to undo stack before expanding
      addAction({
        type: 'expand_all',
        data: { tasks: [...tasks] },
        description: 'Expand all summary groups',
        demo: true
      });

      const result = await GroupingService.expandAll(tasks, 'demo');
      
      if (result.success) {
        // Update persistent storage for affected tasks
        for (const task of result.updatedTasks) {
          if (task.isSummary) {
            await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
            if (task.demo) {
              console.log('Demo summary task expanded:', task.id);
            }
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(result.updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'expand_all', result } });
      } else {
        console.error('Expand all failed:', result.errors);
      }
    } catch (error) {
      console.error('Failed to expand all:', error);
    }
  };

  const handleCollapseAll = async () => {
    try {
      // Add to undo stack before collapsing
      addAction({
        type: 'collapse_all',
        data: { tasks: [...tasks] },
        description: 'Collapse all summary groups',
        demo: true
      });

      const result = await GroupingService.collapseAll(tasks, 'demo');
      
      if (result.success) {
        // Update persistent storage for affected tasks
        for (const task of result.updatedTasks) {
          if (task.isSummary) {
            await persistentStorage.setSetting(`task_${task.id}`, task, 'tasks');
            if (task.demo) {
              console.log('Demo summary task collapsed:', task.id);
            }
          }
        }
        
        // Update local state
        if (onTasksUpdate) {
          onTasksUpdate(result.updatedTasks);
        }
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'collapse_all', result } });
      } else {
        console.error('Collapse all failed:', result.errors);
      }
    } catch (error) {
      console.error('Failed to collapse all:', error);
    }
  };

  const handleToggleSummaryBars = async () => {
    try {
      const result = await GroupingService.toggleSummaryBars('demo');
      
      if (result.success) {
        setIsSummaryBarsVisible(result.showSummaryBars);
        
        // Add to undo stack
        addAction({
          type: 'toggle_summary_bars',
          data: { showSummaryBars: result.showSummaryBars },
          description: `${result.showSummaryBars ? 'Show' : 'Hide'} summary bars`,
          demo: true
        });
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'toggle_summary_bars', showSummaryBars: result.showSummaryBars } });
      }
    } catch (error) {
      console.error('Failed to toggle summary bars:', error);
    }
  };

  // Check if there are summary tasks
  const hasSummaryTasks = tasks.some(task => task.isSummary);

  // Fields handlers
  const handleToggleField = async (fieldId: string) => {
    try {
      const result = await FieldsService.toggleField(fieldId, 'demo');
      
      if (result.success) {
        setFields(result.fields);
        
        // Add to undo stack
        addAction({
          type: 'toggle_field',
          data: { fieldId, fields: result.fields },
          description: `Toggle field "${FieldsService.getFieldLabel(fieldId)}"`,
          demo: true
        });
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'toggle_field', fieldId, fields: result.fields } });
      }
    } catch (error) {
      console.error('Failed to toggle field:', error);
    }
  };

  // Load fields configuration on mount
  React.useEffect(() => {
    const loadFields = async () => {
      try {
        const fieldsConfig = await FieldsService.getFieldsConfig('demo');
        setFields(fieldsConfig);
      } catch (error) {
        console.error('Failed to load fields config:', error);
        // Fallback to default fields
        setFields(FieldsService.getDefaultFields());
      }
    };

    loadFields();
  }, []);

  // Secondary tools handlers
  const handleRecalculateSlack = async () => {
    setSecondaryToolsLoading(prev => ({ ...prev, recalculateSlack: true }));
    try {
      const result = await SecondaryToolsService.recalculateSlack('demo');
      
      if (result.success) {
        // Add to undo stack
        addAction({
          type: 'recalculate_slack',
          data: { tasks: result.tasks },
          description: 'Recalculate slack values',
          demo: true
        });
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'recalculate_slack', tasks: result.tasks } });
      }
    } catch (error) {
      console.error('Failed to recalculate slack:', error);
    } finally {
      setSecondaryToolsLoading(prev => ({ ...prev, recalculateSlack: false }));
    }
  };

  const handleClearConstraints = async () => {
    const confirmed = window.confirm('Remove all constraints from selected tasks?');
    if (!confirmed) return;

    setSecondaryToolsLoading(prev => ({ ...prev, clearConstraints: true }));
    try {
      const result = await SecondaryToolsService.clearConstraints(undefined, 'demo');
      
      if (result.success) {
        // Add to undo stack
        addAction({
          type: 'clear_constraints',
          data: { tasksCleared: result.tasksCleared },
          description: `Clear constraints from ${result.tasksCleared} tasks`,
          demo: true
        });
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'clear_constraints', tasksCleared: result.tasksCleared } });
      }
    } catch (error) {
      console.error('Failed to clear constraints:', error);
    } finally {
      setSecondaryToolsLoading(prev => ({ ...prev, clearConstraints: false }));
    }
  };

  const handleValidateLogic = async () => {
    setSecondaryToolsLoading(prev => ({ ...prev, validateLogic: true }));
    try {
      const result = await SecondaryToolsService.validateLogic('demo');
      
      if (result.success) {
        setValidationIssues(result.issues);
        setIsValidationModalOpen(true);
        
        // Add to undo stack
        addAction({
          type: 'validate_logic',
          data: { issues: result.issues },
          description: `Validate logic (${result.issues.length} issues found)`,
          demo: true
        });
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'validate_logic', issues: result.issues } });
      }
    } catch (error) {
      console.error('Failed to validate logic:', error);
    } finally {
      setSecondaryToolsLoading(prev => ({ ...prev, validateLogic: false }));
    }
  };

  const handleAutoFixIssues = async (issueIds: string[]) => {
    try {
      const result = await SecondaryToolsService.autoFixIssues(issueIds, 'demo');
      
      if (result.success) {
        // Add to undo stack
        addAction({
          type: 'auto_fix_issues',
          data: { issueIds, fixedCount: result.fixedCount },
          description: `Auto-fix ${result.fixedCount} issues`,
          demo: true
        });
        
        // Dispatch operation
        onTaskOperation({ type: 'add', data: { action: 'auto_fix_issues', issueIds, fixedCount: result.fixedCount } });
        
        // Refresh validation results
        const newValidationResult = await SecondaryToolsService.validateLogic('demo');
        if (newValidationResult.success) {
          setValidationIssues(newValidationResult.issues);
        }
      }
    } catch (error) {
      console.error('Failed to auto-fix issues:', error);
    }
  };

  // Only render when Home tab is active
  if (activeRibbonTab !== 'home') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto">
        
        {/* Clipboard Section */}
        <ClipboardSection
          selectedTasksCount={selectedTasks.length}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          projectId={projectId}
          onActionUndone={handleActionUndone}
          onActionRedone={handleActionRedone}
        />

        {/* Task Section */}
        <TaskSection
          selectedTasksCount={selectedTasks.length}
          onNewTask={handleNewTask}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onProperties={handleProperties}
        />

        {/* Structure Section */}
        <StructureSection
          selectedTasksCount={selectedTasks.length}
          onIndent={handleIndent}
          onOutdent={handleOutdent}
          onMakeSummary={handleMakeSummary}
          canIndent={canIndent}
          canOutdent={canOutdent}
          canMakeSummary={canMakeSummary}
        />

        {/* Link Section */}
        <LinkSection
          selectedTasksCount={selectedTasks.length}
          onLink={handleLink}
          onUnlink={handleUnlink}
          onLag={handleLag}
          canLink={canLink}
          canUnlink={canUnlink}
          canLag={canLag}
        />

        {/* Tools Section */}
        <ToolsSection
          onReschedule={handleReschedule}
          onProgressToggle={handleProgressToggle}
          onUndo={handleUndo}
          onRedo={handleRedo}
          isProgressLineVisible={isProgressLineVisible}
          canUndo={canUndo}
          canRedo={canRedo}
          isRescheduling={isRescheduling}
        />

        {/* Grouping Section */}
        <GroupingSection
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onToggleSummaryBars={handleToggleSummaryBars}
          isSummaryBarsVisible={isSummaryBarsVisible}
          hasSummaryTasks={hasSummaryTasks}
        />

        {/* Fields Section */}
        <FieldsSection
          fields={fields}
          onToggleField={handleToggleField}
        />

        {/* Secondary Tools Section */}
        <SecondaryToolsSection
          onRecalculateSlack={handleRecalculateSlack}
          onClearConstraints={handleClearConstraints}
          onValidateLogic={handleValidateLogic}
          loading={secondaryToolsLoading}
        />
      </div>

      {/* Task Modals */}
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        selectedTasks={tasks.filter(task => selectedTasks.includes(task.id))}
      />

      <TaskPropertiesModal
        isOpen={isPropertiesModalOpen}
        onClose={() => setIsPropertiesModalOpen(false)}
        selectedTasks={tasks.filter(task => selectedTasks.includes(task.id))}
      />

      <LagTimeModal
        isOpen={isLagTimeModalOpen}
        onClose={() => setIsLagTimeModalOpen(false)}
        onSave={handleLagSave}
        selectedTasks={tasks.filter(task => selectedTasks.includes(task.id))}
        dependencies={allDependencies}
      />

      {/* Validation Results Modal */}
      <ValidationResultsModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        issues={validationIssues}
        onAutoFix={handleAutoFixIssues}
        isDemoMode={true}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTabWithClipboard; 