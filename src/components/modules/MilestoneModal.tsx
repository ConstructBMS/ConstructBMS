import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  FlagIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { type Milestone } from '../../services/milestoneService';
import { milestoneService } from '../../services/milestoneService';
import { demoModeService } from '../../services/demoModeService';
import { usePermissions } from '../../hooks/usePermissions';

interface MilestoneModalProps {
  isOpen: boolean;
  milestone?: Milestone;
  onClose: () => void;
  onMilestoneSaved: (milestone: Milestone) => void;
  projectId: string;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  projectId,
  milestone,
  onMilestoneSaved
}) => {
  const { canAccess } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);

  const isEditMode = !!milestone;
  const canEdit = canAccess('programme.task.edit');
  const canView = canAccess('programme.task.view');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    milestoneDate: '',
    status: 'not-started' as 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled',
    tag: '',
    notes: '',
    isCritical: false
  });

  // Check demo mode and permissions on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      
      if (isDemo) {
        const count = await milestoneService.getMilestoneCount(projectId);
        setMilestoneCount(count);
      }
    };
    checkDemoMode();
  }, [projectId]);

  // Initialize form data when milestone changes
  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name,
        milestoneDate: milestone.startDate.toISOString().split('T')[0],
        status: milestone.status || 'not-started',
        tag: milestone.tag || '',
        notes: milestone.notes || '',
        isCritical: milestone.isCritical || milestone.critical || false
      });
    } else {
      setFormData({
        name: '',
        milestoneDate: new Date().toISOString().split('T')[0],
        status: 'not-started',
        tag: '',
        notes: '',
        isCritical: false
      });
    }
  }, [milestone]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Milestone name is required');
    }

    if (!formData.milestoneDate) {
      newErrors.push('Milestone date is required');
    }

    if (formData.name.length > 255) {
      newErrors.push('Milestone name must be less than 255 characters');
    }

    if (formData.tag && formData.tag.length > 100) {
      newErrors.push('Tag must be less than 100 characters');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const milestoneDate = new Date(formData.milestoneDate || new Date());
      let result;

      if (isEditMode && milestone) {
        // Update existing milestone
        const updateData: any = {
          name: formData.name,
          milestoneDate,
          status: formData.status,
          isCritical: formData.isCritical
        };
        if (formData.tag) updateData.tag = formData.tag;
        if (formData.notes) updateData.notes = formData.notes;
        
        result = await milestoneService.updateMilestone(milestone.id, updateData);
      } else {
        // Create new milestone
        const createOptions: any = {
          status: formData.status,
          isCritical: formData.isCritical
        };
        if (formData.tag) createOptions.tag = formData.tag;
        if (formData.notes) createOptions.notes = formData.notes;
        
        result = await milestoneService.createMilestone(
          formData.name,
          milestoneDate,
          projectId,
          createOptions
        );
      }

      if (result.success && result.milestone) {
        onMilestoneSaved(result.milestone);
        onClose();
        
        // Show success message
        if (result.demoMode) {
          // Use toast service if available
          console.log('DEMO MILESTONE:', result.message);
        } else {
          console.log('Milestone saved:', result.message);
        }
      } else {
        // Show error message
        if (result.constraintViolations && result.constraintViolations.length > 0) {
          setErrors(result.constraintViolations);
        } else {
          setErrors([result.message]);
        }
        
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Error saving milestone:', error);
      setErrors(['Failed to save milestone']);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Close modal
  const closeModal = () => {
    setErrors([]);
    setFormData({
      name: '',
      milestoneDate: new Date().toISOString().split('T')[0],
      status: 'not-started',
      tag: '',
      notes: '',
      isCritical: false
    });
    onClose();
  };

  if (!isOpen) return null;

  const demoConfig = milestoneService.getDemoModeConfig();
  const isDemoLimitReached = isDemoMode && milestoneCount >= demoConfig.maxMilestonesPerProject;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FlagIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Milestone' : 'Add Milestone'}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Demo mode indicator */}
        {isDemoMode && (
          <div className="bg-pink-50 dark:bg-pink-900/20 border-b border-pink-200 dark:border-pink-800 p-3">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-pink-600" />
              <span className="text-sm text-pink-800 dark:text-pink-200">
                Demo Mode: {milestoneCount}/{demoConfig.maxMilestonesPerProject} milestones used
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Please correct the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestone Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Milestone Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter milestone name"
              maxLength={255}
              disabled={!canEdit || isDemoLimitReached}
            />
          </div>

          {/* Milestone Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Milestone Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.milestoneDate}
              onChange={(e) => handleInputChange('milestoneDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={!canEdit || isDemoLimitReached}
            />
            {isDemoMode && (
              <p className="mt-1 text-xs text-pink-600 dark:text-pink-400">
                Date must be within ±{demoConfig.dateRangeDays} days of today
              </p>
            )}
          </div>

          {/* Tag */}
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <TagIcon className="w-4 h-4 inline mr-1" />
              Tag
            </label>
            <input
              type="text"
              id="tag"
              value={formData.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={isDemoMode ? demoConfig.fixedTag : "Enter tag (optional)"}
              maxLength={100}
              disabled={!canEdit || isDemoLimitReached || isDemoMode}
            />
            {isDemoMode && (
              <p className="mt-1 text-xs text-pink-600 dark:text-pink-400">
                Tag is fixed to "{demoConfig.fixedTag}" in demo mode
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={!canEdit || isDemoLimitReached}
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Critical Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCritical"
              checked={formData.isCritical}
              onChange={(e) => handleInputChange('isCritical', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              disabled={!canEdit || isDemoLimitReached || isDemoMode}
            />
            <label htmlFor="isCritical" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Critical Milestone
            </label>
            {isDemoMode && (
              <span className="ml-2 text-xs text-pink-600 dark:text-pink-400">
                (Disabled in demo mode)
              </span>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter additional notes (optional)"
              disabled={!canEdit || isDemoLimitReached}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canEdit || isDemoLimitReached || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (!canEdit || isDemoLimitReached || isLoading) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Milestone' : 'Create Milestone')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneModal; 