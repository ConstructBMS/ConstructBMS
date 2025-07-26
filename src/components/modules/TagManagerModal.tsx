import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import {
  taskTagsService,
  ProjectTag,
  TagUsage,
} from '../services/taskTagsService';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface TagFormData {
  color: string;
  name: string;
}

const TagManagerModal: React.FC<TagManagerModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [tagUsage, setTagUsage] = useState<TagUsage[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<ProjectTag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: 'bg-blue-500',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess('programme.task.view');
  const canEdit = canAccess('programme.task.edit');
  const canManage = canAccess('programme.tags.manage');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load tags and usage data
  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen, projectId]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const [projectTags, usage] = await Promise.all([
        taskTagsService.getProjectTags(projectId),
        taskTagsService.getTagUsage(projectId),
      ]);
      setTags(projectTags);
      setTagUsage(usage);
    } catch (error) {
      console.error('Error loading tags:', error);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await taskTagsService.createTag({
        projectId,
        name: formData.name,
        color: formData.color,
      });

      if (result.success && result.tag) {
        setTags(prev => [...prev, result.tag!]);
        setFormData({ name: '', color: 'bg-blue-500' });
        setShowCreateForm(false);
        await loadTags(); // Refresh usage data
      } else {
        setError(result.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      setError('Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;

    try {
      setLoading(true);
      setError(null);

      const result = await taskTagsService.updateTag(editingTag.id, {
        name: formData.name,
        color: formData.color,
      });

      if (result.success && result.tag) {
        setTags(prev =>
          prev.map(tag => (tag.id === editingTag.id ? result.tag! : tag))
        );
        setFormData({ name: '', color: 'bg-blue-500' });
        setEditingTag(null);
        await loadTags(); // Refresh usage data
      } else {
        setError(result.error || 'Failed to update tag');
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      setError('Failed to update tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this tag? This will remove it from all tasks.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await taskTagsService.deleteTag(tagId);

      if (result.success) {
        setTags(prev => prev.filter(tag => tag.id !== tagId));
        await loadTags(); // Refresh usage data
      } else {
        setError(result.error || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError('Failed to delete tag');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = (tag: ProjectTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setFormData({ name: '', color: 'bg-blue-500' });
    setShowCreateForm(false);
    setError(null);
  };

  const getUsageCount = (tagId: string): number => {
    return tagUsage.find(usage => usage.tagId === tagId)?.usageCount || 0;
  };

  const getAvailableColors = () => {
    return taskTagsService.getAvailableTailwindColors();
  };

  if (!isOpen || !canView) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <TagIcon className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Tag Manager
            </h2>
            {isDemoMode && (
              <span className='px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md font-medium'>
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
          {/* Error Display */}
          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md'>
              <p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
            </div>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || editingTag) && (
            <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h3>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Tag Name
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, name: e.target.value }))
                    }
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    placeholder='Enter tag name'
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Color
                  </label>
                  <div className='grid grid-cols-6 gap-2'>
                    {getAvailableColors().map(colorGroup =>
                      colorGroup.shades.map(shade => {
                        const colorClass = `bg-${colorGroup.class}-${shade}`;
                        return (
                          <button
                            key={colorClass}
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                color: colorClass,
                              }))
                            }
                            className={`
                              w-8 h-8 rounded-md border-2 transition-all duration-200
                              ${colorClass}
                              ${
                                formData.color === colorClass
                                  ? 'border-gray-900 dark:border-white scale-110'
                                  : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                              }
                            `}
                            title={`${colorGroup.name} ${shade}`}
                            disabled={loading}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <button
                    onClick={editingTag ? handleUpdateTag : handleCreateTag}
                    disabled={loading || !formData.name.trim()}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                  >
                    {loading
                      ? 'Saving...'
                      : editingTag
                        ? 'Update Tag'
                        : 'Create Tag'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className='px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tags List */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Project Tags ({tags.length})
              </h3>
              {canManage && !showCreateForm && !editingTag && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={isDemoMode && tags.length >= 3}
                  className='flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                >
                  <PlusIcon className='w-4 h-4' />
                  <span>Add Tag</span>
                </button>
              )}
            </div>

            {loading && !tags.length ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-2 text-gray-500 dark:text-gray-400'>
                  Loading tags...
                </p>
              </div>
            ) : tags.length === 0 ? (
              <div className='text-center py-8'>
                <TagIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500 dark:text-gray-400'>
                  No tags created yet
                </p>
                {canManage && (
                  <p className='text-sm text-gray-400 dark:text-gray-500 mt-1'>
                    Create your first tag to get started
                  </p>
                )}
              </div>
            ) : (
              <div className='grid gap-4'>
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className='flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-4 h-4 rounded-full ${tag.color}`}
                        title={tag.name}
                      />
                      <div>
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          {tag.name}
                          {isDemoMode && tag.demo && (
                            <span className='ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded'>
                              DEMO
                            </span>
                          )}
                        </h4>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          Used by {getUsageCount(tag.id)} task
                          {getUsageCount(tag.id) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      {canManage && (
                        <>
                          <button
                            onClick={() => handleEditTag(tag)}
                            disabled={loading || (isDemoMode && !tag.demo)}
                            className='p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                            title='Edit tag'
                          >
                            <PencilIcon className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            disabled={loading || (isDemoMode && !tag.demo)}
                            className='p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                            title='Delete tag'
                          >
                            <TrashIcon className='w-4 h-4' />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demo Mode Restrictions */}
          {isDemoMode && (
            <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
              <div className='flex items-start space-x-2'>
                <TagIcon className='w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5' />
                <div className='text-sm text-yellow-800 dark:text-yellow-200'>
                  <p className='font-medium'>Demo Mode Restrictions:</p>
                  <ul className='mt-1 space-y-1'>
                    {taskTagsService
                      .getDemoModeRestrictions()
                      .map((restriction, index) => (
                        <li key={index} className='flex items-start space-x-2'>
                          <span className='text-yellow-600 dark:text-yellow-400 mt-1'>
                            •
                          </span>
                          <span>{restriction}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManagerModal;
