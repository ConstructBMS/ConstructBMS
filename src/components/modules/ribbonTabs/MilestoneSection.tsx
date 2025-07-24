import React from 'react';
import { 
  PlusIcon, 
  FlagIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { milestoneService } from '../../../services/milestoneService';

interface MilestoneSectionProps {
  onAddMilestone: () => void;
  onEditMilestone: () => void;
  onDeleteMilestone: () => void;
  selectedMilestonesCount: number;
  isDemoMode?: boolean;
  milestoneCount?: number;
  maxMilestones?: number;
}

const MilestoneSection: React.FC<MilestoneSectionProps> = ({
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  selectedMilestonesCount,
  isDemoMode = false,
  milestoneCount = 0,
  maxMilestones = 3
}) => {
  const { canAccess } = usePermissions();
  
  const canEdit = canAccess('programme.task.edit');
  const canView = canAccess('programme.task.view');
  const hasSelection = selectedMilestonesCount > 0;
  const isDemoLimitReached = isDemoMode && milestoneCount >= maxMilestones;

  const demoConfig = milestoneService.getDemoModeConfig();

  return (
    <section className="ribbon-section">
      <div className="ribbon-section-header">
        <FlagIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Milestones</span>
      </div>
      
      <div className="ribbon-buttons flex space-x-2">
        {/* Add Milestone Button */}
        <button
          onClick={onAddMilestone}
          disabled={!canEdit || isDemoLimitReached}
          className={`ribbon-button flex items-center space-x-1 ${
            !canEdit || isDemoLimitReached
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          title={
            isDemoLimitReached 
              ? `Demo Mode: Maximum ${maxMilestones} milestones reached`
              : 'Add new milestone'
          }
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>

        {/* Edit Milestone Button */}
        <button
          onClick={onEditMilestone}
          disabled={!canEdit || !hasSelection}
          className={`ribbon-button flex items-center space-x-1 ${
            !canEdit || !hasSelection
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          title={
            !hasSelection 
              ? 'Select a milestone to edit'
              : `Edit ${selectedMilestonesCount} selected milestone(s)`
          }
        >
          <PencilIcon className="w-4 h-4" />
          <span>Edit</span>
        </button>

        {/* Delete Milestone Button */}
        <button
          onClick={onDeleteMilestone}
          disabled={!canEdit || !hasSelection}
          className={`ribbon-button flex items-center space-x-1 ${
            !canEdit || !hasSelection
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
          title={
            !hasSelection 
              ? 'Select a milestone to delete'
              : `Delete ${selectedMilestonesCount} selected milestone(s)`
          }
        >
          <TrashIcon className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Demo mode indicator */}
      {isDemoMode && (
        <div className="ribbon-info mt-2 p-2 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-pink-600" />
            <div className="text-xs">
              <div className="font-medium text-pink-800 dark:text-pink-200">
                Demo Mode Active
              </div>
              <div className="text-pink-600 dark:text-pink-300">
                {milestoneCount}/{maxMilestones} milestones used
              </div>
              <div className="text-pink-600 dark:text-pink-300">
                Tag: "{demoConfig.fixedTag}" • Critical: Disabled
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection info */}
      {hasSelection && (
        <div className="ribbon-info mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <div className="text-xs text-blue-800 dark:text-blue-200">
            {selectedMilestonesCount} milestone{selectedMilestonesCount !== 1 ? 's' : ''} selected
          </div>
        </div>
      )}

      {/* Permissions info */}
      {!canEdit && canView && (
        <div className="ribbon-info mt-2 p-2 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            View-only mode. Contact your administrator for edit permissions.
          </div>
        </div>
      )}
    </section>
  );
};

export default MilestoneSection; 