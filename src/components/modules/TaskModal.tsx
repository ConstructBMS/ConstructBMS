import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  statusId: string;
  tags: string[];
  type: 'task' | 'milestone' | 'phase' | 'summary';
  description?: string;
  projectId: string;
  userId: string;
  demo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCustomField {
  taskId: string;
  fieldId: string;
  value: any;
  demo?: boolean;
}

export interface CustomField {
  id: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'boolean';
  defaultValue?: any;
  required: boolean;
  options?: string[];
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string | null;
  projectId: string;
  mode: 'create' | 'edit';
  onTaskSaved?: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  projectId,
  mode,
  onTaskSaved,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    statusId: '',
    type: 'task' as const,
    parentId: null as string | null,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Initialize form data
      setFormData({
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        statusId: '',
        type: 'task',
        parentId: null,
      });
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save logic would go here
      console.log('Saving task:', formData);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {mode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>
            {loading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-2 text-gray-600 dark:text-gray-400'>
                  Loading...
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Task Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Task Name
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='Enter task name'
                  />
                </div>

                {/* Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='Enter task description'
                  />
                </div>

                {/* Task Type */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Task Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => handleInputChange('type', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value='task'>Task</option>
                    <option value='milestone'>Milestone</option>
                    <option value='phase'>Phase</option>
                    <option value='summary'>Summary</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700'>
            <button
              onClick={handleClose}
              className='px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canEdit || saving || loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Task'
                  : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskModal;
