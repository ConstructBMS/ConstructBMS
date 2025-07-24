import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { structureService, type TaskStructure } from '../../services/structureService';
import { toastService } from './ToastNotification';

interface StructureControlsProps {
  className?: string;
  collapsed: boolean;
  hasChildren: boolean;
  level: number;
  onStructureChange?: () => void;
  onToggleCollapse?: () => void;
  taskId: string;
  taskName: string;
  taskType: 'task' | 'milestone' | 'phase';
}

const StructureControls: React.FC<StructureControlsProps> = ({
  taskId,
  taskName,
  taskType,
  level,
  collapsed,
  hasChildren,
  onToggleCollapse,
  onStructureChange,
  className = ''
}) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(structureService.isInDemoMode());

  // Handle collapse toggle
  const handleToggleCollapse = async () => {
    if (isToggling || taskType !== 'phase') return;

    setIsToggling(true);
    try {
      const success = await structureService.toggleCollapse(taskId);
      if (success) {
        toastService.success('Success', collapsed ? 'Phase expanded' : 'Phase collapsed');
        if (onToggleCollapse) {
          onToggleCollapse();
        }
        if (onStructureChange) {
          onStructureChange();
        }
      } else {
        if (isDemoMode) {
          toastService.warning('Demo Mode', 'Structure editing is limited in demo mode');
        } else {
          toastService.error('Error', 'Failed to toggle collapse state');
        }
      }
    } catch (error) {
      console.error('Error toggling collapse:', error);
      toastService.error('Error', 'Failed to toggle collapse state');
    } finally {
      setIsToggling(false);
    }
  };

  // Get demo mode configuration
  const demoConfig = structureService.getDemoModeConfig();

  // Render indentation
  const renderIndentation = () => {
    const indentWidth = level * 20; // 20px per level
    return (
      <div 
        className="flex-shrink-0"
        style={{ width: `${indentWidth}px` }}
      />
    );
  };

  // Render collapse/expand button
  const renderCollapseButton = () => {
    if (taskType !== 'phase' || !hasChildren) return null;

    return (
      <button
        onClick={handleToggleCollapse}
        disabled={isToggling}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title={collapsed ? 'Expand phase' : 'Collapse phase'}
      >
        {collapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    );
  };

  // Render phase icon
  const renderPhaseIcon = () => {
    if (taskType !== 'phase') return null;

    return (
      <div className="flex-shrink-0 mr-2">
        {collapsed ? (
          <FolderIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <FolderOpenIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        )}
      </div>
    );
  };

  // Render demo indicator
  const renderDemoIndicator = () => {
    if (!isDemoMode) return null;

    return (
      <div className="flex-shrink-0 ml-2">
        <ExclamationTriangleIcon 
          className="w-3 h-3 text-orange-500" 
          title={demoConfig.tooltipMessage}
        />
      </div>
    );
  };

  return (
    <div className={`flex items-center ${className}`}>
      {renderIndentation()}
      {renderCollapseButton()}
      {renderPhaseIcon()}
      <span className={`text-sm ${
        taskType === 'phase' 
          ? 'font-medium text-gray-900 dark:text-gray-100' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {taskName}
      </span>
      {renderDemoIndicator()}
    </div>
  );
};

export default StructureControls; 