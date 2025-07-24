import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { filterService, type FilterState } from '../../services/filterService';
import FilterButton from './FilterButton';
import { toastService } from './ToastNotification';

// Sample task data
const sampleTasks = [
  {
    id: '1',
    name: 'Project Planning',
    status: 'completed',
    tags: ['critical', 'high_priority'],
    assignedTo: 'project_manager',
    parentPhaseId: 'planning',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    progress: 100,
    customFields: {
      priority: 'High',
      department: 'Engineering',
      location: 'HQ',
      budget: 5000
    }
  },
  {
    id: '2',
    name: 'UI Design',
    status: 'in_progress',
    tags: ['high_priority'],
    assignedTo: 'designer',
    parentPhaseId: 'design',
    startDate: '2024-01-16',
    endDate: '2024-02-15',
    progress: 60,
    customFields: {
      priority: 'Medium',
      department: 'Design',
      location: 'Remote',
      budget: 3000
    }
  },
  {
    id: '3',
    name: 'Backend Development',
    status: 'in_progress',
    tags: ['critical', 'blocked'],
    assignedTo: 'developer',
    parentPhaseId: 'development',
    startDate: '2024-01-20',
    endDate: '2024-03-15',
    progress: 40,
    customFields: {
      priority: 'Critical',
      department: 'Engineering',
      location: 'HQ',
      budget: 8000
    }
  },
  {
    id: '4',
    name: 'Frontend Development',
    status: 'not_started',
    tags: ['review_required'],
    assignedTo: 'developer',
    parentPhaseId: 'development',
    startDate: '2024-02-01',
    endDate: '2024-03-30',
    progress: 0,
    customFields: {
      priority: 'High',
      department: 'Engineering',
      location: 'Remote',
      budget: 6000
    }
  },
  {
    id: '5',
    name: 'Testing Phase',
    status: 'on_hold',
    tags: ['low_priority'],
    assignedTo: 'tester',
    parentPhaseId: 'testing',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    progress: 0,
    customFields: {
      priority: 'Low',
      department: 'Engineering',
      location: 'HQ',
      budget: 2000
    }
  },
  {
    id: '6',
    name: 'Deployment',
    status: 'not_started',
    tags: ['critical'],
    assignedTo: 'team_lead',
    parentPhaseId: 'deployment',
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    progress: 0,
    customFields: {
      priority: 'Critical',
      department: 'Engineering',
      location: 'HQ',
      budget: 1000
    }
  }
];

const TimelineFilterDemo: React.FC = () => {
  const [filterState, setFilterState] = useState<FilterState>(filterService.getFilterState());
  const [filteredTasks, setFilteredTasks] = useState(sampleTasks);
  const [isDemoMode, setIsDemoMode] = useState(filterService.isInDemoMode());

  // Apply filters when filter state changes
  useEffect(() => {
    const filtered = filterService.applyFilters(sampleTasks);
    setFilteredTasks(filtered);
  }, [filterState]);

  // Handle filter changes
  const handleFilterChange = (newFilterState: FilterState) => {
    setFilterState(newFilterState);
    setIsDemoMode(filterService.isInDemoMode());
  };

  // Toggle demo mode
  const toggleDemoMode = () => {
    // This would typically be controlled by user role or environment
    console.log('Demo mode toggle - would change user role in real app');
    setIsDemoMode(!isDemoMode);
  };

  // Get demo mode configuration
  const demoConfig = filterService.getDemoModeConfig();

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      case 'on_hold':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FunnelIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Timeline Filter Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>

          {/* Filter Button */}
          <FilterButton
            tasks={sampleTasks}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Demo Info */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Demo Mode Active
          </h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Maximum active filters: {demoConfig.maxActiveFilters}</li>
            <li>• Custom field filters: {demoConfig.customFieldsDisabled ? 'Disabled' : 'Enabled'}</li>
            <li>• Tooltip message: "{demoConfig.tooltipMessage}"</li>
            <li>• Filter state tagged: {demoConfig.filterStateTag}</li>
          </ul>
        </div>
      )}

      {/* Filter Stats */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Filter Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Tasks
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {sampleTasks.length}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtered Tasks
            </label>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredTasks.length}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active Filters
            </label>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filterState.activeFilters.length}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter Reduction
            </label>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {sampleTasks.length > 0 ? Math.round(((sampleTasks.length - filteredTasks.length) / sampleTasks.length) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Tasks {filterState.activeFilters.length > 0 && `(Filtered: ${filteredTasks.length}/${sampleTasks.length})`}
        </h2>
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FunnelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No tasks match your filters
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filter criteria or clear all filters to see all tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {task.name}
                      </h3>
                      {getStatusIcon(task.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span className="capitalize">{task.assignedTo.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-2" />
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {tag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Phase:</span> {task.parentPhaseId}
                      </div>
                    </div>

                    {/* Custom Fields */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">{task.customFields.priority}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Department:</span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">{task.customFields.department}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">{task.customFields.location}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">${task.customFields.budget}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Progress
                    </div>
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {task.progress}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Examples */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Try These Filter Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div>
            <h4 className="font-medium mb-1">Status Filters</h4>
            <ul className="space-y-1 text-xs">
              <li>• Status = In Progress</li>
              <li>• Status = Completed</li>
              <li>• Status = Not Started</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Role & Tag Filters</h4>
            <ul className="space-y-1 text-xs">
              <li>• Assigned To = Developer</li>
              <li>• Tags Contains Critical</li>
              <li>• Phase = Development</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Filter Features
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Multi-criteria filtering (Status, Tag, Role, Phase, Custom)</li>
          <li>• Performance-optimized filter logic with caching</li>
          <li>• Filter state sync across tabs</li>
          <li>• Demo mode limitations and safeguards</li>
          <li>• Supabase persistence of filter preferences</li>
          <li>• Real-time filter count updates</li>
          <li>• Interactive filter chips with remove functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default TimelineFilterDemo; 