import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { taskTagsService, type ProgrammeTag } from '../../services/taskTagsService';
import { usePermissions } from '../../hooks/usePermissions';
import TagPill from './TagPill';

interface TagFilterProps {
  className?: string;
  onTagFilterChange: (tagIds: string[]) => void;
  projectId: string;
  selectedTagIds: string[];
}

const TagFilter: React.FC<TagFilterProps> = ({
  projectId,
  selectedTagIds,
  onTagFilterChange,
  className = ''
}) => {
  const { canAccess } = usePermissions();
  const [tags, setTags] = useState<ProgrammeTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const canViewTags = canAccess('programme.tag.view');

  useEffect(() => {
    loadTags();
  }, [projectId]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const projectTags = await taskTagsService.getProjectTags(projectId);
      setTags(projectTags);
    } catch (error) {
      console.error('Error loading tags for filter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    const newSelectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    
    onTagFilterChange(newSelectedTagIds);
  };

  const handleClearAll = () => {
    onTagFilterChange([]);
  };

  const getSelectedTags = () => {
    return tags.filter(tag => selectedTagIds.includes(tag.id));
  };

  const getUnselectedTags = () => {
    return tags.filter(tag => !selectedTagIds.includes(tag.id));
  };

  if (!canViewTags) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
          selectedTagIds.length > 0
            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <FunnelIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {selectedTagIds.length > 0 ? `Tags (${selectedTagIds.length})` : 'Filter by Tags'}
        </span>
      </button>

      {/* Selected Tags Display */}
      {selectedTagIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {getSelectedTags().map((tag) => (
            <TagPill
              key={tag.id}
              tag={tag}
              size="sm"
              onClick={() => handleTagToggle(tag.id)}
            />
          ))}
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Filter by Tags
              </h4>
              {selectedTagIds.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-xs text-gray-500">Loading tags...</p>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500">No tags available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getUnselectedTags().map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {tag.label}
                      {tag.demo && (
                        <span className="ml-1 text-xs text-gray-500">(Demo)</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default TagFilter; 