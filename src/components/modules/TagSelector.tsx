import React, { useState, useEffect } from 'react';
import { TagIcon, PlusIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { taskTagsService, type ProgrammeTag, type CreateTagData } from '../../services/taskTagsService';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';

interface TagSelectorProps {
  className?: string;
  disabled?: boolean;
  onTagChange: (tagId: string | null) => void;
  projectId: string;
  selectedTagId?: string | null;
}

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagCreated: (tag: ProgrammeTag) => void;
  projectId: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagId,
  projectId,
  onTagChange,
  disabled = false,
  className = ''
}) => {
  const { canAccess } = usePermissions();
  const [tags, setTags] = useState<ProgrammeTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ProgrammeTag | null>(null);

  const canManageTags = canAccess('programme.tag.manage');
  const canViewTags = canAccess('programme.tag.view');

  useEffect(() => {
    loadTags();
    checkDemoMode();
  }, [projectId]);

  useEffect(() => {
    if (selectedTagId && tags.length > 0) {
      const tag = tags.find(t => t.id === selectedTagId);
      setSelectedTag(tag || null);
    } else {
      setSelectedTag(null);
    }
  }, [selectedTagId, tags]);

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.isDemoMode();
    setIsDemoMode(isDemo);
  };

  const loadTags = async () => {
    try {
      setLoading(true);
      const projectTags = await taskTagsService.getProjectTags(projectId);
      setTags(projectTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tagId: string | null) => {
    onTagChange(tagId);
  };

  const handleCreateTag = (tag: ProgrammeTag) => {
    setTags(prev => [...prev, tag]);
    setShowCreateModal(false);
  };

  const handleRemoveTag = () => {
    onTagChange(null);
  };

  if (!canViewTags) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No permission to view tags
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading tags...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected Tag Display */}
      {selectedTag && (
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedTag.color }}
            ></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedTag.label}
            </span>
            {selectedTag.demo && (
              <span className="text-xs text-gray-500">(Demo)</span>
            )}
          </div>
          {!disabled && (
            <button
              onClick={handleRemoveTag}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Tag Selection */}
      {!selectedTag && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Tag
          </label>
          
          {/* Available Tags */}
          <div className="grid grid-cols-1 gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                  disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
                title={tag.demo ? 'Demo tag - Upgrade for custom tags' : tag.label}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                ></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  {tag.label}
                </span>
                {tag.demo && (
                  <EyeIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ))}
          </div>

          {/* Create New Tag Button */}
          {canManageTags && !disabled && (
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isDemoMode && tags.length >= 3}
              className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                isDemoMode && tags.length >= 3
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
              title={isDemoMode && tags.length >= 3 ? 'Tag limit - Upgrade to add custom tags' : 'Add new tag'}
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Add New Tag
              </span>
            </button>
          )}

          {/* Demo Mode Warning */}
          {isDemoMode && tags.length >= 3 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              Tag limit reached. Upgrade to add custom tags.
            </div>
          )}
        </div>
      )}

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTagCreated={handleCreateTag}
        projectId={projectId}
      />
    </div>
  );
};

const CreateTagModal: React.FC<CreateTagModalProps> = ({
  isOpen,
  onClose,
  onTagCreated,
  projectId
}) => {
  const [formData, setFormData] = useState({
    label: '',
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const availableColors = taskTagsService.getAvailableColors();

  useEffect(() => {
    checkDemoMode();
  }, []);

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.isDemoMode();
    setIsDemoMode(isDemo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label.trim()) {
      setError('Tag label is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tagData: CreateTagData = {
        label: formData.label.trim(),
        color: formData.color,
        projectId
      };

      const newTag = await taskTagsService.createTag(tagData);
      
      if (newTag) {
        onTagCreated(newTag);
        setFormData({ label: '', color: '#3b82f6' });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Create New Tag
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tag Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tag Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Client Hold, Snagging"
              disabled={loading}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isDemoMode}
                  title={isDemoMode ? 'Color selection disabled in demo mode' : color}
                />
              ))}
            </div>
            {isDemoMode && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Color selection disabled in demo mode
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          {/* Demo Mode Warning */}
          {isDemoMode && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              Demo mode: Tag will be marked as demo and may have limitations.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.label.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagSelector; 