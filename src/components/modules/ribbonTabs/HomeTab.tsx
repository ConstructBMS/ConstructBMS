import React from 'react';
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

// Types for task operations
export interface TaskOperation {
  type: 'add' | 'delete' | 'milestone' | 'link' | 'unlink' | 'indent' | 'outdent' | 'progress';
  data?: any;
}

export interface LinkType {
  id: string;
  label: string;
  description: string;
  abbreviation: string;
}

export interface ProgressOption {
  id: string;
  label: string;
  value: number;
  icon: React.ComponentType<any>;
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

interface HomeTabProps {
  onTaskOperation: (operation: TaskOperation) => void;
  userRole: string;
  selectedTasks: string[];
  canEdit: boolean;
}

const useHomeTab = (
  onTaskOperation: (operation: TaskOperation) => void,
  userRole: string,
  selectedTasks: string[],
  canEdit: boolean
): RibbonTab => {
  // Check if user can perform actions (not viewer)
  const isViewer = userRole === 'viewer';
  const hasSelection = selectedTasks.length > 0;
  const hasMultipleSelection = selectedTasks.length > 1;

  // Create ribbon tab configuration
  const homeTab: RibbonTab = {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    groups: [
      // Clipboard Group
      {
        id: 'clipboard',
        title: 'Clipboard',
        buttons: [
          {
            id: 'paste',
            label: 'Paste',
            icon: DocumentDuplicateIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'paste' } }),
            disabled: isViewer || !canEdit,
            tooltip: 'Paste task from clipboard'
          },
          {
            id: 'cut',
            label: 'Cut',
            icon: ScissorsIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'delete', data: { action: 'cut' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Cut selected task(s)'
          },
          {
            id: 'copy',
            label: 'Copy',
            icon: DocumentDuplicateIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'copy' } }),
            disabled: isViewer || !hasSelection,
            tooltip: 'Copy selected task(s)'
          }
        ]
      },

      // Tasks Group
      {
        id: 'tasks',
        title: 'Tasks',
        buttons: [
          {
            id: 'add-task',
            label: 'Add Task',
            icon: PlusIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'new' } }),
            disabled: isViewer || !canEdit,
            tooltip: 'Add new task to project'
          },
          {
            id: 'delete-task',
            label: 'Delete',
            icon: TrashIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'delete', data: { action: 'delete' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Delete selected task(s)'
          },
          {
            id: 'edit-task',
            label: 'Edit',
            icon: PencilIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'edit' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Edit selected task'
          },
          {
            id: 'toggle-milestone',
            label: 'Milestone',
            icon: FlagIcon,
            type: 'toggle',
            action: () => onTaskOperation({ type: 'milestone' }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Toggle milestone status for selected task'
          }
        ]
      },

      // Schedule Group
      {
        id: 'schedule',
        title: 'Schedule',
        buttons: [
          {
            id: 'link-tasks',
            label: 'Link Tasks',
            icon: LinkIcon,
            type: 'dropdown',
            action: () => onTaskOperation({ type: 'link', data: { linkType: 'fs' } }),
            disabled: isViewer || !canEdit || !hasMultipleSelection,
            tooltip: 'Link selected tasks with dependency',
            dropdownItems: LINK_TYPES.map(linkType => ({
              id: linkType.id,
              label: `${linkType.abbreviation} - ${linkType.label}`,
              action: () => onTaskOperation({ 
                type: 'link', 
                data: { linkType: linkType.id, description: linkType.description } 
              }),
              disabled: isViewer || !canEdit || !hasMultipleSelection
            }))
          },
          {
            id: 'unlink-tasks',
            label: 'Unlink',
            icon: LinkIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'unlink' }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Remove task dependencies'
          },
          {
            id: 'constraints',
            label: 'Constraints',
            icon: LockClosedIcon,
            type: 'dropdown',
            action: () => onTaskOperation({ type: 'add', data: { action: 'constraint' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set task constraints',
            dropdownItems: [
              {
                id: 'start-no-earlier',
                label: 'Start No Earlier Than',
                action: () => onTaskOperation({ 
                  type: 'add', 
                  data: { action: 'constraint', constraint: 'start-no-earlier' } 
                }),
                disabled: isViewer || !canEdit || !hasSelection
              },
              {
                id: 'finish-no-later',
                label: 'Finish No Later Than',
                action: () => onTaskOperation({ 
                  type: 'add', 
                  data: { action: 'constraint', constraint: 'finish-no-later' } 
                }),
                disabled: isViewer || !canEdit || !hasSelection
              },
              {
                id: 'separator1',
                label: '',
                action: () => {},
                separator: true
              },
              {
                id: 'as-soon-as-possible',
                label: 'As Soon As Possible',
                action: () => onTaskOperation({ 
                  type: 'add', 
                  data: { action: 'constraint', constraint: 'asap' } 
                }),
                disabled: isViewer || !canEdit || !hasSelection
              },
              {
                id: 'as-late-as-possible',
                label: 'As Late As Possible',
                action: () => onTaskOperation({ 
                  type: 'add', 
                  data: { action: 'constraint', constraint: 'alap' } 
                }),
                disabled: isViewer || !canEdit || !hasSelection
              }
            ]
          }
        ]
      },

      // Structure Group
      {
        id: 'structure',
        title: 'Structure',
        buttons: [
          {
            id: 'indent',
            label: 'Indent',
            icon: ChevronRightIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'indent' }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Indent task (make it a subtask)'
          },
          {
            id: 'outdent',
            label: 'Outdent',
            icon: ChevronLeftIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'outdent' }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Outdent task (make it a main task)'
          },
          {
            id: 'move-up',
            label: 'Move Up',
            icon: ChevronUpIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'move-up' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Move task up in the list'
          },
          {
            id: 'move-down',
            label: 'Move Down',
            icon: ChevronDownIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'move-down' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Move task down in the list'
          }
        ]
      },

      // Progress Group
      {
        id: 'progress',
        title: 'Progress',
        buttons: [
          {
            id: 'progress-25',
            label: '25%',
            icon: ClockIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'progress', data: { value: 25 } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set task progress to 25%'
          },
          {
            id: 'progress-50',
            label: '50%',
            icon: ChartBarIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'progress', data: { value: 50 } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set task progress to 50%'
          },
          {
            id: 'progress-100',
            label: '100%',
            icon: CheckCircleIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'progress', data: { value: 100 } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set task progress to 100%'
          },
          {
            id: 'progress-custom',
            label: 'Custom %',
            icon: CogIcon,
            type: 'dropdown',
            action: () => onTaskOperation({ type: 'progress', data: { value: 0 } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set custom progress percentage',
            dropdownItems: [
              { id: '0', label: '0%', action: () => onTaskOperation({ type: 'progress', data: { value: 0 } }) },
              { id: '10', label: '10%', action: () => onTaskOperation({ type: 'progress', data: { value: 10 } }) },
              { id: '20', label: '20%', action: () => onTaskOperation({ type: 'progress', data: { value: 20 } }) },
              { id: '30', label: '30%', action: () => onTaskOperation({ type: 'progress', data: { value: 30 } }) },
              { id: '40', label: '40%', action: () => onTaskOperation({ type: 'progress', data: { value: 40 } }) },
              { id: '60', label: '60%', action: () => onTaskOperation({ type: 'progress', data: { value: 60 } }) },
              { id: '70', label: '70%', action: () => onTaskOperation({ type: 'progress', data: { value: 70 } }) },
              { id: '80', label: '80%', action: () => onTaskOperation({ type: 'progress', data: { value: 80 } }) },
              { id: '90', label: '90%', action: () => onTaskOperation({ type: 'progress', data: { value: 90 } }) }
            ]
          }
        ]
      },

      // Properties Group
      {
        id: 'properties',
        title: 'Properties',
        buttons: [
          {
            id: 'task-info',
            label: 'Task Info',
            icon: InformationCircleIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'task-info' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'View/edit task information'
          },
          {
            id: 'assign-resource',
            label: 'Assign Resource',
            icon: UserIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'assign-resource' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Assign resources to task'
          },
          {
            id: 'set-duration',
            label: 'Set Duration',
            icon: ClockIcon,
            type: 'button',
            action: () => onTaskOperation({ type: 'add', data: { action: 'set-duration' } }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set task duration'
          }
        ]
      }
    ]
  };

  return homeTab;
};

// Export the hook
export { useHomeTab };

// Mock icons for missing ones
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default useHomeTab; 