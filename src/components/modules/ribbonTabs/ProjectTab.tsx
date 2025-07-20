import React from 'react';
import {
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  DocumentTextIcon,
  ListBulletIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import type { RibbonTab } from '../GanttRibbon';

// Types for project operations
export interface ProjectOperation {
  type: 'set-calendar' | 'set-constraint' | 'define-deadline' | 'toggle-summary' | 'apply-wbs' | 'update-task';
  data?: any;
}

// Project calendar interface
export interface ProjectCalendar {
  id: string;
  name: string;
  description: string;
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  holidays: Date[];
}

// Task constraint interface
export interface TaskConstraint {
  id: string;
  type: 'asap' | 'start-no-earlier' | 'must-finish' | 'finish-no-later' | 'start-no-later' | 'must-start';
  date?: Date;
  description: string;
}

// WBS numbering interface
export interface WBSNumbering {
  enabled: boolean;
  format: string;
  separator: string;
  autoUpdate: boolean;
}

interface ProjectTabProps {
  onProjectOperation: (operation: ProjectOperation) => void;
  userRole: string;
  selectedTasks: string[];
  canEdit: boolean;
  currentCalendar?: ProjectCalendar;
  currentWBS?: WBSNumbering;
}

const useProjectTab = (
  onProjectOperation: (operation: ProjectOperation) => void,
  userRole: string,
  selectedTasks: string[],
  canEdit: boolean,
  currentCalendar?: ProjectCalendar,
  currentWBS?: WBSNumbering
): RibbonTab => {
  // Check if user can perform actions (not viewer)
  const isViewer = userRole === 'viewer';
  const hasSelection = selectedTasks.length > 0;
  const hasMultipleSelection = selectedTasks.length > 1;

  // Project calendars
  const projectCalendars: ProjectCalendar[] = [
    {
      id: 'standard',
      name: 'Standard Calendar',
      description: 'Monday-Friday, 8:00 AM - 5:00 PM',
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      workingHours: { start: '08:00', end: '17:00' },
      holidays: []
    },
    {
      id: '24-7',
      name: '24/7 Calendar',
      description: '7 days a week, 24 hours a day',
      workingDays: [1, 2, 3, 4, 5, 6, 7], // All days
      workingHours: { start: '00:00', end: '23:59' },
      holidays: []
    },
    {
      id: 'construction',
      name: 'Construction Calendar',
      description: 'Monday-Saturday, 6:00 AM - 6:00 PM',
      workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
      workingHours: { start: '06:00', end: '18:00' },
      holidays: []
    },
    {
      id: 'office',
      name: 'Office Calendar',
      description: 'Monday-Friday, 9:00 AM - 6:00 PM',
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      workingHours: { start: '09:00', end: '18:00' },
      holidays: []
    }
  ];

  // Task constraints
  const taskConstraints: TaskConstraint[] = [
    {
      id: 'asap',
      type: 'asap',
      description: 'As Soon As Possible'
    },
    {
      id: 'start-no-earlier',
      type: 'start-no-earlier',
      description: 'Start No Earlier Than'
    },
    {
      id: 'must-finish',
      type: 'must-finish',
      description: 'Must Finish On'
    },
    {
      id: 'finish-no-later',
      type: 'finish-no-later',
      description: 'Finish No Later Than'
    },
    {
      id: 'start-no-later',
      type: 'start-no-later',
      description: 'Start No Later Than'
    },
    {
      id: 'must-start',
      type: 'must-start',
      description: 'Must Start On'
    }
  ];

  // WBS numbering formats
  const wbsFormats = [
    { id: '1.1.1', label: '1.1.1', format: 'n.n.n' },
    { id: '1-1-1', label: '1-1-1', format: 'n-n-n' },
    { id: '1_1_1', label: '1_1_1', format: 'n_n_n' },
    { id: 'A.1.1', label: 'A.1.1', format: 'a.n.n' },
    { id: '1.1', label: '1.1', format: 'n.n' }
  ];

  // Create ribbon tab configuration
  const projectTab: RibbonTab = {
    id: 'project',
    label: 'Project',
    icon: CogIcon,
    groups: [
      // Calendar Group
      {
        id: 'calendar',
        title: 'Calendar',
        buttons: [
          {
            id: 'set-project-calendar',
            label: currentCalendar ? currentCalendar.name : 'Set Calendar',
            icon: CalendarIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Set project working calendar',
            dropdownItems: projectCalendars.map(calendar => ({
              id: calendar.id,
              label: calendar.name,
              icon: calendar.id === currentCalendar?.id ? CheckCircleIcon : undefined,
              action: () => {
                onProjectOperation({ 
                  type: 'set-calendar', 
                  data: { calendar } 
                });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'edit-calendar',
            label: 'Edit Calendar',
            icon: CogIcon,
            type: 'button',
            action: () => onProjectOperation({ 
              type: 'set-calendar', 
              data: { action: 'edit' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Edit project calendar settings'
          }
        ]
      },

      // Constraints Group
      {
        id: 'constraints',
        title: 'Constraints',
        buttons: [
          {
            id: 'set-task-constraint',
            label: 'Set Constraint',
            icon: FlagIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set constraint for selected task(s)',
            dropdownItems: taskConstraints.map(constraint => ({
              id: constraint.id,
              label: constraint.description,
              icon: ExclamationTriangleIcon,
              action: () => {
                onProjectOperation({ 
                  type: 'set-constraint', 
                  data: { 
                    constraint: constraint.type,
                    taskIds: selectedTasks 
                  } 
                });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'clear-constraints',
            label: 'Clear Constraints',
            icon: XMarkIcon,
            type: 'button',
            action: () => onProjectOperation({ 
              type: 'set-constraint', 
              data: { 
                action: 'clear',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Clear constraints from selected task(s)'
          }
        ]
      },

      // Deadlines Group
      {
        id: 'deadlines',
        title: 'Deadlines',
        buttons: [
          {
            id: 'define-deadline',
            label: 'Set Deadline',
            icon: ClockIcon,
            type: 'button',
            action: () => onProjectOperation({ 
              type: 'define-deadline', 
              data: { 
                action: 'set',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set deadline for selected task(s)'
          },
          {
            id: 'clear-deadlines',
            label: 'Clear Deadlines',
            icon: XMarkIcon,
            type: 'button',
            action: () => onProjectOperation({ 
              type: 'define-deadline', 
              data: { 
                action: 'clear',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Clear deadlines from selected task(s)'
          }
        ]
      },

      // Structure Group
      {
        id: 'structure',
        title: 'Structure',
        buttons: [
          {
            id: 'toggle-project-summary',
            label: 'Project Summary',
            icon: DocumentTextIcon,
            type: 'toggle',
            action: () => onProjectOperation({ 
              type: 'toggle-summary', 
              data: { action: 'toggle' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Show/hide project summary task',
            isActive: true // Default to showing project summary
          },
          {
            id: 'apply-wbs-numbering',
            label: currentWBS?.enabled ? 'WBS: ' + (currentWBS.format || '1.1.1') : 'Apply WBS',
            icon: ListBulletIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit,
            tooltip: 'Apply Work Breakdown Structure numbering',
            dropdownItems: [
              ...wbsFormats.map(format => ({
                id: format.id,
                label: format.label,
                icon: format.id === currentWBS?.format ? CheckCircleIcon : undefined,
                action: () => {
                  onProjectOperation({ 
                    type: 'apply-wbs', 
                    data: { 
                      format: format.format,
                      enabled: true 
                    } 
                  });
                },
                disabled: false,
                separator: false
              })),
              {
                id: 'separator1',
                label: '',
                action: () => {},
                separator: true
              },
              {
                id: 'disable-wbs',
                label: 'Disable WBS',
                icon: XMarkIcon,
                action: () => {
                  onProjectOperation({ 
                    type: 'apply-wbs', 
                    data: { enabled: false } 
                  });
                },
                disabled: false,
                separator: false
              }
            ] as any
          }
        ]
      },

      // Project Settings Group
      {
        id: 'project-settings',
        title: 'Project Settings',
        buttons: [
          {
            id: 'project-info',
            label: 'Project Info',
            icon: DocumentTextIcon,
            type: 'button',
            action: () => onProjectOperation({ 
              type: 'update-task', 
              data: { action: 'project-info' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Edit project information'
          },
          {
            id: 'project-options',
            label: 'Options',
            icon: CogIcon,
            type: 'button',
            action: () => onProjectOperation({ 
              type: 'update-task', 
              data: { action: 'project-options' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Project options and settings'
          }
        ]
      }
    ]
  };

  return projectTab;
};

// Default export function that returns the tab configuration
const ProjectTab = (
  onProjectOperation: (operation: ProjectOperation) => void,
  userRole: string,
  selectedTasks: string[],
  canEdit: boolean,
  currentCalendar?: ProjectCalendar,
  currentWBS?: WBSNumbering
): RibbonTab => {
  return useProjectTab(onProjectOperation, userRole, selectedTasks, canEdit, currentCalendar, currentWBS);
};

export default ProjectTab; 