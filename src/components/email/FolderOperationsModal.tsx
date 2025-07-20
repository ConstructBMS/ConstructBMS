import React, { useState } from 'react';
import { X, Folder, Edit3, Settings, Trash2, Archive } from 'lucide-react';

interface FolderOperationsModalProps {
  folderName?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  operation: 'new' | 'rename' | 'properties' | 'delete' | 'empty';
}

const FolderOperationsModal: React.FC<FolderOperationsModalProps> = ({
  isOpen,
  onClose,
  operation,
  folderName = '',
  onConfirm,
}) => {
  const [formData, setFormData] = useState({
    name: folderName,
    description: '',
    color: '#3B82F6',
    autoArchive: false,
    archiveAfter: 30,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
    onClose();
  };

  const getOperationConfig = () => {
    switch (operation) {
      case 'new':
        return {
          title: 'Create New Folder',
          icon: Folder,
          description: 'Create a new email folder',
        };
      case 'rename':
        return {
          title: 'Rename Folder',
          icon: Edit3,
          description: `Rename folder "${folderName}"`,
        };
      case 'properties':
        return {
          title: 'Folder Properties',
          icon: Settings,
          description: `Properties for "${folderName}"`,
        };
      case 'delete':
        return {
          title: 'Delete Folder',
          icon: Trash2,
          description: `Delete folder "${folderName}" and all its contents`,
        };
      case 'empty':
        return {
          title: 'Empty Folder',
          icon: Archive,
          description: `Remove all emails from "${folderName}"`,
        };
      default:
        return {
          title: 'Folder Operation',
          icon: Folder,
          description: 'Perform folder operation',
        };
    }
  };

  const config = getOperationConfig();
  const IconComponent = config.icon;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-md mx-4'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <IconComponent className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                {config.title}
              </h2>
              <p className='text-sm text-gray-500'>{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {(operation === 'new' || operation === 'rename') && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Folder Name
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                placeholder='Enter folder name'
                required
              />
            </div>
          )}

          {operation === 'new' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                rows={3}
                placeholder='Enter folder description'
              />
            </div>
          )}

          {operation === 'properties' && (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Folder Name
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Folder Color
                </label>
                <input
                  type='color'
                  value={formData.color}
                  onChange={e =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className='w-full h-10 border border-gray-300 rounded-lg cursor-pointer'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='autoArchive'
                  checked={formData.autoArchive}
                  onChange={e =>
                    setFormData({ ...formData, autoArchive: e.target.checked })
                  }
                  className='rounded'
                />
                <label htmlFor='autoArchive' className='text-sm text-gray-700'>
                  Auto-archive old emails
                </label>
              </div>

              {formData.autoArchive && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Archive After (days)
                  </label>
                  <input
                    type='number'
                    value={formData.archiveAfter}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        archiveAfter: parseInt(e.target.value),
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                    min='1'
                    max='365'
                  />
                </div>
              )}
            </div>
          )}

          {(operation === 'delete' || operation === 'empty') && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-5 h-5 bg-red-100 rounded-full flex items-center justify-center'>
                  <IconComponent className='w-3 h-3 text-red-600' />
                </div>
                <span className='font-medium text-red-800'>
                  {operation === 'delete'
                    ? 'Warning: This action cannot be undone'
                    : 'Warning: This will remove all emails'}
                </span>
              </div>
              <p className='text-sm text-red-700'>
                {operation === 'delete'
                  ? `Are you sure you want to delete "${folderName}" and all its contents?`
                  : `Are you sure you want to remove all emails from "${folderName}"?`}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className='flex items-center justify-end space-x-3 pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                operation === 'delete' || operation === 'empty'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-constructbms-blue text-black hover:bg-constructbms-black hover:text-white'
              }`}
            >
              {operation === 'new' && 'Create Folder'}
              {operation === 'rename' && 'Rename'}
              {operation === 'properties' && 'Save Changes'}
              {operation === 'delete' && 'Delete Folder'}
              {operation === 'empty' && 'Empty Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderOperationsModal;
