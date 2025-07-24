import React, { useState, useEffect } from 'react';
import { 
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { multiProjectService, type ProjectInfo } from '../../services/multiProjectService';
import { toastService } from './ToastNotification';

interface MultiProjectControlsProps {
  className?: string;
  onModeChange?: (mode: 'single' | 'multi') => void;
  onProjectChange?: () => void;
}

const MultiProjectControls: React.FC<MultiProjectControlsProps> = ({
  onModeChange,
  onProjectChange,
  className = ''
}) => {
  const [timelineMode, setTimelineMode] = useState<'single' | 'multi'>('single');
  const [selectedProjects, setSelectedProjects] = useState<ProjectInfo[]>([]);
  const [accessibleProjects, setAccessibleProjects] = useState<ProjectInfo[]>([]);
  const [groupByProject, setGroupByProject] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(multiProjectService.isInDemoMode());
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load projects and preferences
  const loadData = async () => {
    const projects = await multiProjectService.getAccessibleProjects();
    setAccessibleProjects(projects);
    
    const preferences = multiProjectService.getPreferences();
    setTimelineMode(preferences.timelineMode);
    setGroupByProject(preferences.groupByProject);
    setIsDemoMode(multiProjectService.isInDemoMode());
    
    const selected = multiProjectService.getSelectedProjects();
    setSelectedProjects(selected);
  };

  // Handle timeline mode change
  const handleTimelineModeChange = async (mode: 'single' | 'multi') => {
    try {
      const success = await multiProjectService.setTimelineMode(mode);
      if (success) {
        setTimelineMode(mode);
        if (onModeChange) {
          onModeChange(mode);
        }
        toastService.success('Success', `Timeline mode changed to ${mode === 'multi' ? 'Multi-Project' : 'Single Project'}`);
      } else {
        toastService.error('Error', 'Failed to change timeline mode');
      }
    } catch (error) {
      console.error('Error changing timeline mode:', error);
      toastService.error('Error', 'Failed to change timeline mode');
    }
  };

  // Handle add project to comparison
  const handleAddProject = async (projectId: string) => {
    try {
      const success = await multiProjectService.addProjectToComparison(projectId);
      if (success) {
        await loadData();
        if (onProjectChange) {
          onProjectChange();
        }
        toastService.success('Success', 'Project added to comparison');
      } else {
        if (isDemoMode) {
          toastService.warning('Demo Mode', 'Maximum projects reached in demo mode');
        } else {
          toastService.error('Error', 'Failed to add project to comparison');
        }
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toastService.error('Error', 'Failed to add project to comparison');
    }
  };

  // Handle remove project from comparison
  const handleRemoveProject = async (projectId: string) => {
    try {
      const success = await multiProjectService.removeProjectFromComparison(projectId);
      if (success) {
        await loadData();
        if (onProjectChange) {
          onProjectChange();
        }
        toastService.success('Success', 'Project removed from comparison');
      } else {
        toastService.error('Error', 'Failed to remove project from comparison');
      }
    } catch (error) {
      console.error('Error removing project:', error);
      toastService.error('Error', 'Failed to remove project from comparison');
    }
  };

  // Handle toggle project visibility
  const handleToggleProjectVisibility = async (projectId: string) => {
    try {
      const success = await multiProjectService.toggleProjectVisibility(projectId);
      if (success) {
        await loadData();
        if (onProjectChange) {
          onProjectChange();
        }
        toastService.success('Success', 'Project visibility toggled');
      } else {
        toastService.error('Error', 'Failed to toggle project visibility');
      }
    } catch (error) {
      console.error('Error toggling project visibility:', error);
      toastService.error('Error', 'Failed to toggle project visibility');
    }
  };

  // Handle toggle group by project
  const handleToggleGroupByProject = async () => {
    try {
      const success = await multiProjectService.toggleGroupByProject();
      if (success) {
        setGroupByProject(!groupByProject);
        if (onProjectChange) {
          onProjectChange();
        }
        toastService.success('Success', `Group by project ${!groupByProject ? 'enabled' : 'disabled'}`);
      } else {
        toastService.error('Error', 'Failed to toggle group by project');
      }
    } catch (error) {
      console.error('Error toggling group by project:', error);
      toastService.error('Error', 'Failed to toggle group by project');
    }
  };

  // Get demo mode configuration
  const demoConfig = multiProjectService.getDemoModeConfig();

  // Check if can add more projects
  const canAddProject = multiProjectService.canAddProject();

  // Get available projects (not already selected)
  const availableProjects = accessibleProjects.filter(
    project => !selectedProjects.some(selected => selected.id === project.id)
  );

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Timeline Mode Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Timeline Mode
        </label>
        <select
          value={timelineMode}
          onChange={(e) => handleTimelineModeChange(e.target.value as 'single' | 'multi')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="single">Current Project</option>
          <option value="multi">Multi-Project View</option>
        </select>
      </div>

      {/* Multi-Project Controls (only show when in multi mode) */}
      {timelineMode === 'multi' && (
        <>
          {/* Compare With Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Compare With
            </label>
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                disabled={!canAddProject}
                className={`flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 ${
                  !canAddProject ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title={!canAddProject ? demoConfig.tooltipMessage : 'Select projects to compare'}
              >
                <GlobeAltIcon className="w-4 h-4 mr-2" />
                <span>Add Project</span>
                <ChevronDownIcon className="w-4 h-4 ml-2" />
                {isDemoMode && (
                  <ExclamationTriangleIcon className="w-3 h-3 text-orange-500 ml-2" />
                )}
              </button>

              {/* Project Dropdown */}
              {showProjectDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Available Projects
                    </div>
                    {availableProjects.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                        No more projects available
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {availableProjects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => {
                              handleAddProject(project.id);
                              setShowProjectDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: project.color }}
                              />
                              <div>
                                <div className="font-medium">{project.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {project.client} • {project.status}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group by Project Toggle */}
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group by Project
            </label>
            <button
              onClick={handleToggleGroupByProject}
              className={`ml-2 px-3 py-1 rounded text-sm transition-colors ${
                groupByProject
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {groupByProject ? 'On' : 'Off'}
            </button>
          </div>
        </>
      )}

      {/* Selected Projects Display */}
      {timelineMode === 'multi' && selectedProjects.length > 0 && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected:
          </label>
          <div className="flex items-center space-x-2">
            {selectedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
              >
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {project.name}
                </span>
                
                {/* Visibility Toggle */}
                <button
                  onClick={() => handleToggleProjectVisibility(project.id)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  title={multiProjectService.isProjectVisible(project.id) ? 'Hide project' : 'Show project'}
                >
                  {multiProjectService.isProjectVisible(project.id) ? (
                    <EyeIcon className="w-3 h-3" />
                  ) : (
                    <EyeSlashIcon className="w-3 h-3" />
                  )}
                </button>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveProject(project.id)}
                  className="ml-1 text-red-500 hover:text-red-700"
                  title="Remove from comparison"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Mode Indicator */}
      {isDemoMode && timelineMode === 'multi' && (
        <div className="flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-300">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Demo: Max {demoConfig.maxProjectsViewable} projects
        </div>
      )}
    </div>
  );
};

export default MultiProjectControls; 