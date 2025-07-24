import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  FlagIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { type Milestone } from '../../services/milestoneService';
import { milestoneService } from '../../services/milestoneService';
import { demoModeService } from '../../services/demoModeService';
import { usePermissions } from '../../hooks/usePermissions';
import MilestoneModal from './MilestoneModal';
import MilestoneDisplay from './MilestoneDisplay';

interface MilestoneManagerProps {
  className?: string;
  dayWidth: number;
  onAddMilestone?: () => void;
  onDeleteMilestone?: () => void;
  onEditMilestone?: () => void;
  onMilestoneChange?: (milestones: Milestone[]) => void;
  projectId: string;
  projectStartDate: Date;
  rowHeight: number;
  selectedMilestonesCount?: number;
}

const MilestoneManager: React.FC<MilestoneManagerProps> = ({
  projectId,
  projectStartDate,
  dayWidth,
  rowHeight,
  onMilestoneChange,
  className = '',
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  selectedMilestonesCount = 0
}) => {
  const { canAccess } = usePermissions();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const canEdit = canAccess('programme.task.edit');
  const canView = canAccess('programme.task.view');

  // Load milestones on mount
  useEffect(() => {
    loadMilestones();
    checkDemoMode();
  }, [projectId]);

  // Check demo mode
  const checkDemoMode = async () => {
    const isDemo = await demoModeService.isDemoMode();
    setIsDemoMode(isDemo);
    
    if (isDemo) {
      const count = await milestoneService.getMilestoneCount(projectId);
      setMilestoneCount(count);
    }
  };

  // Load milestones from service
  const loadMilestones = async () => {
    try {
      setLoading(true);
      const projectMilestones = await milestoneService.getProjectMilestones(projectId);
      setMilestones(projectMilestones);
      
      if (onMilestoneChange) {
        onMilestoneChange(projectMilestones);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle milestone saved
  const handleMilestoneSaved = (milestone: Milestone) => {
    setMilestones(prev => {
      const existingIndex = prev.findIndex(m => m.id === milestone.id);
      if (existingIndex >= 0) {
        // Update existing milestone
        const updated = [...prev];
        updated[existingIndex] = milestone;
        return updated;
      } else {
        // Add new milestone
        return [...prev, milestone];
      }
    });

    // Update milestone count in demo mode
    if (isDemoMode && !editingMilestone) {
      setMilestoneCount(prev => prev + 1);
    }

    // Notify parent component
    if (onMilestoneChange) {
      const updatedMilestones = milestones.map(m => 
        m.id === milestone.id ? milestone : m
      );
      const existingIndex = milestones.findIndex(m => m.id === milestone.id);
      if (existingIndex === -1) {
        updatedMilestones.push(milestone);
      }
      onMilestoneChange(updatedMilestones);
    }
  };

  // Handle milestone click
  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
  };

  // Handle milestone edit
  const handleMilestoneEdit = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      setEditingMilestone(milestone);
      setIsModalOpen(true);
    }
  };

  // Handle milestone delete
  const handleMilestoneDelete = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) {
      return;
    }

    try {
      const result = await milestoneService.deleteMilestone(milestoneId);
      
      if (result.success) {
        setMilestones(prev => prev.filter(m => m.id !== milestoneId));
        
        // Update milestone count in demo mode
        if (isDemoMode) {
          setMilestoneCount(prev => Math.max(0, prev - 1));
        }

        // Notify parent component
        if (onMilestoneChange) {
          const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
          onMilestoneChange(updatedMilestones);
        }

        // Clear selection if deleted milestone was selected
        if (selectedMilestoneId === milestoneId) {
          setSelectedMilestoneId(null);
        }

        console.log(result.message);
      } else {
        console.error('Error deleting milestone:', result.message);
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  // Handle add milestone from ribbon
  const handleAddMilestone = () => {
    if (onAddMilestone) {
      onAddMilestone();
    } else {
      setEditingMilestone(undefined);
      setIsModalOpen(true);
    }
  };

  // Handle edit milestone from ribbon
  const handleEditMilestone = () => {
    if (onEditMilestone) {
      onEditMilestone();
    } else if (selectedMilestoneId) {
      handleMilestoneEdit(selectedMilestoneId);
    }
  };

  // Handle delete milestone from ribbon
  const handleDeleteMilestone = () => {
    if (onDeleteMilestone) {
      onDeleteMilestone();
    } else if (selectedMilestoneId) {
      handleMilestoneDelete(selectedMilestoneId);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMilestone(undefined);
  };

  // Get demo mode configuration
  const demoConfig = milestoneService.getDemoModeConfig();
  const isDemoLimitReached = isDemoMode && milestoneCount >= demoConfig.maxMilestonesPerProject;

  if (loading) {
    return (
      <div className={`milestone-manager ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading milestones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`milestone-manager ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FlagIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Milestones
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({milestones.length})
          </span>
        </div>

        {/* Demo mode indicator */}
        {isDemoMode && (
          <div className="flex items-center space-x-2 text-sm text-pink-600 dark:text-pink-400">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>Demo Mode: {milestoneCount}/{demoConfig.maxMilestonesPerProject}</span>
          </div>
        )}

        {/* Add button */}
        {canEdit && (
          <button
            onClick={handleAddMilestone}
            disabled={isDemoLimitReached}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isDemoLimitReached
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
            title={
              isDemoLimitReached 
                ? `Demo Mode: Maximum ${demoConfig.maxMilestonesPerProject} milestones reached`
                : 'Add new milestone'
            }
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        )}
      </div>

      {/* Milestone list */}
      <div className="space-y-2">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`milestone-item p-3 border rounded-lg transition-colors ${
              selectedMilestoneId === milestone.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <MilestoneDisplay
              milestone={milestone}
              dayWidth={dayWidth}
              projectStartDate={projectStartDate}
              rowHeight={rowHeight}
              isSelected={selectedMilestoneId === milestone.id}
              onMilestoneClick={handleMilestoneClick}
              onMilestoneEdit={handleMilestoneEdit}
              onMilestoneDelete={handleMilestoneDelete}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {milestones.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FlagIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No milestones created yet</p>
          <p className="text-xs mt-1">
            {canEdit 
              ? 'Click "Add Milestone" to create your first milestone'
              : 'Contact your project manager to add milestones'
            }
          </p>
        </div>
      )}

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isModalOpen}
        onClose={closeModal}
        projectId={projectId}
        milestone={editingMilestone}
        onMilestoneSaved={handleMilestoneSaved}
      />
    </div>
  );
};

export default MilestoneManager; 