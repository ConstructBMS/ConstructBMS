import React, { useState } from 'react';
import { XMarkIcon, TagIcon, PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface ProjectTag {
  demo?: boolean;
  id: string;
  projectId: string;
  scope: 'global' | 'project';
  tagColor: string;
  tagName: string;
  userId: string;
}

interface ManageTagsModalProps {
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: () => void;
  onTagsChange: (tags: ProjectTag[]) => void;
  projectId: string;
  tags: ProjectTag[];
}

const ManageTagsModal: React.FC<ManageTagsModalProps> = ({
  isOpen,
  onClose,
  tags,
  onTagsChange,
  onSave,
  projectId,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [localTags, setLocalTags] = useState<ProjectTag[]>(tags);
  const [editingTag, setEditingTag] = useState<ProjectTag | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const canManage = canAccess('programme.admin.manage');

  // Update local tags when props change
  React.useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', bgColor: '#DBEAFE' },
    { value: '#10B981', label: 'Green', bgColor: '#D1FAE5' },
    { value: '#F59E0B', label: 'Orange', bgColor: '#FED7AA' },
    { value: '#EF4444', label: 'Red', bgColor: '#FEE2E2' },
    { value: '#8B5CF6', label: 'Purple', bgColor: '#EDE9FE' },
    { value: '#6B7280', label: 'Gray', bgColor: '#F3F4F6' },
    { value: '#F97316', label: 'Amber', bgColor: '#FED7AA' },
    { value: '#06B6D4', label: 'Cyan', bgColor: '#CFFAFE' }
  ];

  const scopeOptions = [
    { value: 'global', label: 'Global', description: 'Available across all projects' },
    { value: 'project', label: 'Project-only', description: 'Available only in this project' }
  ];

  const handleAddTag = () => {
    const newTag: Omit<ProjectTag, 'id' | 'userId'> = {
      projectId,
      tagName: '',
      tagColor: '#3B82F6',
      scope: 'project'
    };

    setEditingTag({
      ...newTag,
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current-user'
    });
    setShowAddForm(true);
  };

  const handleEditTag = (tag: ProjectTag) => {
    setEditingTag(tag);
    setShowAddForm(true);
  };

  const handleDeleteTag = (tagId: string) => {
    const updatedTags = localTags.filter(tag => tag.id !== tagId);
    setLocalTags(updatedTags);
  };

  const handleSaveTag = (tag: ProjectTag) => {
    if (!tag.tagName.trim()) {
      alert('Please enter a tag name');
      return;
    }

    const existingIndex = localTags.findIndex(t => t.id === tag.id);
    let updatedTags: ProjectTag[];

    if (existingIndex >= 0) {
      // Update existing tag
      updatedTags = [...localTags];
      updatedTags[existingIndex] = tag;
    } else {
      // Add new tag
      updatedTags = [...localTags, tag];
    }

    setLocalTags(updatedTags);
    setEditingTag(null);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    onTagsChange(localTags);
    onSave();
    onClose();
  };

  const handleCancel = () => {
    setLocalTags(tags); // Reset to original
    setEditingTag(null);
    setShowAddForm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TagIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Manage Tags & Labels
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* Tags List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Tags ({localTags.length})
              </h3>
              {canManage && (
                <button
                  onClick={handleAddTag}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Tag</span>
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {localTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    {/* Tag Preview */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                        style={{ backgroundColor: tag.tagColor }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {tag.tagName}
                      </span>
                    </div>
                    
                    {/* Tag Details */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tag.scope} • {tag.tagColor}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTag(tag)}
                      disabled={!canManage}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit tag"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {canManage && (
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={loading}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete tag"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {localTags.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tags created yet.</p>
                  <p className="text-sm">Click "Add Tag" to create your first tag.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Form */}
          {showAddForm && editingTag && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                {editingTag.id.startsWith('tag_') ? 'Add New Tag' : 'Edit Tag'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={editingTag.tagName}
                    onChange={(e) => setEditingTag({ ...editingTag, tagName: e.target.value })}
                    placeholder="Enter tag name..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canManage}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tag Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setEditingTag({ ...editingTag, tagColor: option.value })}
                        className={`
                          w-full h-10 rounded-md border-2 transition-all duration-200
                          ${editingTag.tagColor === option.value
                            ? 'border-gray-900 dark:border-gray-100 scale-105'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                          }
                        `}
                        style={{ backgroundColor: option.bgColor }}
                        disabled={!canManage}
                        title={option.label}
                      >
                        <div
                          className="w-4 h-4 rounded-full mx-auto"
                          style={{ backgroundColor: option.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scope
                  </label>
                  <select
                    value={editingTag.scope}
                    onChange={(e) => setEditingTag({ ...editingTag, scope: e.target.value as 'global' | 'project' })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canManage}
                  >
                    {scopeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Preview */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Preview
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                      style={{ backgroundColor: editingTag.tagColor }}
                    />
                    <div>
                      <div className="text-sm font-medium">{editingTag.tagName || 'Tag Name'}</div>
                      <div className="text-xs text-gray-500">
                        {editingTag.scope} • {editingTag.tagColor}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => handleSaveTag(editingTag)}
                    disabled={!canManage || loading || !editingTag.tagName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingTag.id.startsWith('tag_') ? 'Add Tag' : 'Update Tag'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !canManage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTagsModal; 