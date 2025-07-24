import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  CogIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import type { RibbonTab } from '../GanttRibbon';

// Types for allocation operations
export interface AllocationOperation {
  data?: any;
  type: 'assign-resource' | 'combine-work-rate' | 'set-delay' | 'load-profiles' | 'update-allocation';
}

// Resource interface
export interface Resource {
  availability: number;
  cost_per_unit: number;
  current_utilization: number;
  hourly_rate?: number;
  id: string;
  max_units: number;
  name: string;
  skills?: string[];
  type: 'work' | 'material' | 'cost';
}

// Task allocation interface
export interface TaskAllocation {
  allocation_rate: number;
  // percentage (0-100)
  delay: number;
  end_date?: Date;
  id: string; 
  resource_id: string; 
  // resource units
  start_date?: Date;
  task_id: string; 
  units: number;
  // days
  work_type: 'effort-driven' | 'fixed-units' | 'fixed-duration' | 'fixed-work';
}

// Work type options
export interface WorkType {
  description: string;
  icon: React.ComponentType<any>;
  id: string;
  label: string;
}

interface AllocationTabProps {
  availableResources?: Resource[];
  canEdit: boolean;
  currentAllocations?: TaskAllocation[];
  onAllocationOperation: (operation: AllocationOperation) => void;
  selectedTasks: string[];
  userRole: string;
}

const useAllocationTab = (
  onAllocationOperation: (operation: AllocationOperation) => void,
  userRole: string,
  selectedTasks: string[],
  canEdit: boolean,
  currentAllocations?: TaskAllocation[],
  availableResources?: Resource[]
): RibbonTab => {
  // Check if user can perform actions (not viewer)
  const isViewer = userRole === 'viewer';
  const hasSelection = selectedTasks.length > 0;
  const hasMultipleSelection = selectedTasks.length > 1;

  // Work type options
  const workTypes: WorkType[] = [
    {
      id: 'effort-driven',
      label: 'Effort Driven',
      description: 'Work varies with resource assignment',
      icon: ChartBarIcon
    },
    {
      id: 'fixed-units',
      label: 'Fixed Units',
      description: 'Resource units remain constant',
      icon: UserGroupIcon
    },
    {
      id: 'fixed-duration',
      label: 'Fixed Duration',
      description: 'Task duration remains constant',
      icon: ClockIcon
    },
    {
      id: 'fixed-work',
      label: 'Fixed Work',
      description: 'Total work remains constant',
      icon: CogIcon
    }
  ];

  // Create ribbon tab configuration
  const allocationTab: RibbonTab = {
    id: 'allocation',
    label: 'Allocation',
    icon: UserGroupIcon,
    groups: [
      // Resource Assignment Group
      {
        id: 'resource-assignment',
        title: 'Resource Assignment',
        buttons: [
          {
            id: 'assign-resource',
            label: 'Assign Resource',
            icon: UserGroupIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Assign resource to selected task(s)',
            dropdownItems: (availableResources || []).map(resource => ({
              id: resource.id,
              label: `${resource.name} (${resource.type})`,
              icon: resource.type === 'work' ? UserGroupIcon : 
                    resource.type === 'material' ? CogIcon : ChartBarIcon,
              action: () => {
                onAllocationOperation({ 
                  type: 'assign-resource', 
                  data: { 
                    resourceId: resource.id,
                    resourceName: resource.name,
                    taskIds: selectedTasks 
                  } 
                });
              },
              disabled: false,
              separator: false
            })) as any
          },
          {
            id: 'remove-resource',
            label: 'Remove Resource',
            icon: XMarkIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'assign-resource', 
              data: { 
                action: 'remove',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Remove resource from selected task(s)'
          },
          {
            id: 'resource-profiles',
            label: 'Load Profiles',
            icon: ChartBarIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'load-profiles', 
              data: { action: 'load' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Load resource availability profiles'
          }
        ]
      },

      // Work Rate Group
      {
        id: 'work-rate',
        title: 'Work Rate',
        buttons: [
          {
            id: 'combine-work-rate',
            label: 'Combine Work Rate',
            icon: PlusIcon,
            type: 'toggle',
            action: () => onAllocationOperation({ 
              type: 'combine-work-rate', 
              data: { action: 'toggle' } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Combine work rates for multiple resources',
            isActive: false // Default to false
          },
          {
            id: 'set-allocation-rate',
            label: 'Set Rate',
            icon: ChartBarIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'update-allocation', 
              data: { 
                action: 'set-rate',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set allocation rate for selected task(s)'
          },
          {
            id: 'work-type',
            label: 'Work Type',
            icon: CogIcon,
            type: 'dropdown',
            action: () => {},
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set work type for selected task(s)',
            dropdownItems: workTypes.map(workType => ({
              id: workType.id,
              label: workType.label,
              icon: workType.icon,
              action: () => {
                onAllocationOperation({ 
                  type: 'update-allocation', 
                  data: { 
                    workType: workType.id,
                    taskIds: selectedTasks 
                  } 
                });
              },
              disabled: false,
              separator: false
            })) as any
          }
        ]
      },

      // Timing Group
      {
        id: 'timing',
        title: 'Timing',
        buttons: [
          {
            id: 'set-delay',
            label: 'Set Delay',
            icon: ClockIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'set-delay', 
              data: { 
                action: 'set',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set delay for resource allocation'
          },
          {
            id: 'clear-delay',
            label: 'Clear Delay',
            icon: XMarkIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'set-delay', 
              data: { 
                action: 'clear',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Clear delay from resource allocation'
          },
          {
            id: 'allocation-schedule',
            label: 'Schedule',
            icon: ClockIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'update-allocation', 
              data: { 
                action: 'schedule',
                taskIds: selectedTasks 
              } 
            }),
            disabled: isViewer || !canEdit || !hasSelection,
            tooltip: 'Set allocation schedule'
          }
        ]
      },

      // Analysis Group
      {
        id: 'analysis',
        title: 'Analysis',
        buttons: [
          {
            id: 'resource-usage',
            label: 'Usage Report',
            icon: ChartBarIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'update-allocation', 
              data: { action: 'usage-report' } 
            }),
            disabled: isViewer,
            tooltip: 'View resource usage report'
          },
          {
            id: 'overallocation',
            label: 'Overallocation',
            icon: ExclamationTriangleIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'update-allocation', 
              data: { action: 'overallocation' } 
            }),
            disabled: isViewer,
            tooltip: 'Check for resource overallocation'
          },
          {
            id: 'resource-leveling',
            label: 'Level Resources',
            icon: ChartBarIcon,
            type: 'button',
            action: () => onAllocationOperation({ 
              type: 'update-allocation', 
              data: { action: 'level-resources' } 
            }),
            disabled: isViewer || !canEdit,
            tooltip: 'Automatically level resource allocation'
          }
        ]
      }
    ]
  };

  return allocationTab;
};

// Default export function that returns the tab configuration
const AllocationTab = (
  onAllocationOperation: (operation: AllocationOperation) => void,
  userRole: string,
  selectedTasks: string[],
  canEdit: boolean,
  currentAllocations?: TaskAllocation[],
  availableResources?: Resource[]
): RibbonTab => {
  return useAllocationTab(onAllocationOperation, userRole, selectedTasks, canEdit, currentAllocations, availableResources);
};

export default AllocationTab; 