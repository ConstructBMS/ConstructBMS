import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, TagIcon, UserIcon, DocumentTextIcon, LinkIcon, TrashIcon, LockClosedIcon, FlagIcon, ChartBarIcon, FolderIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { taskService } from '../services/taskService';
import { adminTabService } from '../services/adminTabService';
import { programmeCustomFieldsService } from '../services/programmeCustomFieldsService';
import { dependenciesEngine, DependencyLink } from '../services/DependenciesEngine';
import { milestoneService } from '../services/milestoneService';
import { useProgrammeCollaboration } from '../../contexts/ProgrammeCollaborationContext';
import CustomFieldsSection from './CustomFieldsSection';
import TagSelector from './TagSelector';
import TaskLockConflictModal from './TaskLockConflictModal';
import TaskNotesTab from './TaskNotesTab';
import ProgressTab from './ribbonTabs/ProgressTab';
import StructureTab from './ribbonTabs/StructureTab';
import TaskConstraintsTab from './TaskConstraintsTab';
import TaskCommentsTab from './TaskCommentsTab';
import TaskHistoryTab from './TaskHistoryTab';

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
  onTaskSaved
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statusId: '',
    tagId: null as string | null,
    type: 'task' as 'task' | 'milestone' | 'phase' | 'summary',
    description: '',
    customFields: {} as Record<string, any>,
    parentId: null as string | null,
    collapsed: false,
    groupColor: null as string | null
  });

  // Milestone state
  const [milestoneCount, setMilestoneCount] = useState(0);

  // Available options
  const [availableStatuses, setAvailableStatuses] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  
  // Dependencies state
  const [predecessors, setPredecessors] = useState<DependencyLink[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Array<{ id: string; name: string }>>([]);
  const [showAddPredecessor, setShowAddPredecessor] = useState(false);
  const [newPredecessorTaskId, setNewPredecessorTaskId] = useState('');
  const [newPredecessorType, setNewPredecessorType] = useState<'FS' | 'SS' | 'FF' | 'SF'>('FS');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Collaboration state
  const { lockTask, unlockTask, getTaskLockInfo } = useProgrammeCollaboration();
  const [isLocked, setIsLocked] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [showLockConflictModal, setShowLockConflictModal] = useState(false);
  const [lockInfo, setLockInfo] = useState<any>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'general' | 'dependencies' | 'progress' | 'custom-fields' | 'notes' | 'constraints' | 'tags'>('general');

  const canEdit = canAccess('programme.task.edit');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      
      if (isDemo) {
        const count = await taskService.getTaskCount();
        setTaskCount(count);
        
        const milestoneCountValue = await milestoneService.getMilestoneCount();
        setMilestoneCount(milestoneCountValue);
      }
    };
    checkDemoMode();
  }, []);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load statuses, tags, and custom fields
      const statuses = await adminTabService.getTaskStatuses();
      setAvailableStatuses(statuses);
      
      const tags = await adminTabService.getTaskTags();
      setAvailableTags(tags);
      
      const fields = await adminTabService.getCustomFields();
      setCustomFields(fields);
      
      // Set default status if available
      if (statuses.length > 0 && !formData.statusId) {
        setFormData(prev => ({ ...prev, statusId: statuses[0].id }));
      }
      
      // Load available tasks for dependencies
      const tasks = await taskService.getProjectTasks(projectId);
      setAvailableTasks(tasks.map(task => ({ id: task.id, name: task.name })));
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load task data for edit mode
  const loadTaskData = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      
      // Try to lock the task first
      if (mode === 'edit' && taskId) {
        const lockResult = await lockTask(taskId);
        if (!lockResult.success) {
          setLockError(lockResult.error || 'Failed to lock task');
          setLockInfo(lockResult.error ? getTaskLockInfo(taskId) : null);
          setShowLockConflictModal(true);
          setLoading(false);
          return;
        }
        setIsLocked(true);
      }
      
      const task = await taskService.getTask(taskId);
      if (task) {
        setFormData({
          name: task.name,
          startDate: task.startDate.toISOString().split('T')[0],
          endDate: task.endDate.toISOString().split('T')[0],
          statusId: task.statusId,
          tags: task.tags,
          type: task.type,
          description: task.description || '',
          customFields: {},
          parentId: task.parentId || null,
          collapsed: task.collapsed || false,
          groupColor: task.groupColor || null
        });
        
        // Load custom fields
        const taskCustomFields = await programmeCustomFieldsService.getTaskCustomFieldValues(taskId);
        const customFieldValues: Record<string, any> = {};
        taskCustomFields.forEach(field => {
          customFieldValues[field.id] = field.value;
        });
        setFormData(prev => ({ ...prev, customFields: customFieldValues }));
        
        // Load dependencies
        const deps = await dependenciesEngine.getDependencies(taskId);
        setPredecessors(deps);
      }
    } catch (error) {
      console.error('Error loading task data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Handle milestone-specific logic
    if (field === 'type' && value === 'milestone') {
      // For milestones, set endDate to startDate
      setFormData(prev => ({ 
        ...prev, 
        type: value,
        endDate: prev.startDate 
      }));
    }
  };

  // Handle custom field changes
  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: { ...prev.customFields, [fieldId]: value }
    }));
  };

  // Handle tag toggle
  const handleTagToggle = (tagId: string) => {
    if (!canEdit) return;

    const newTags = formData.tags.includes(tagId)
      ? formData.tags.filter(id => id !== tagId)
      : [...formData.tags, tagId];

    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleTagsChange = (tagIds: string[]) => {
    setFormData(prev => ({ ...prev, tags: tagIds }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.type !== 'milestone' && !formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.type !== 'milestone' && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (!formData.statusId) {
      newErrors.statusId = 'Status is required';
    }
    
    // Demo mode restrictions
    if (isDemoMode) {
      if (formData.type === 'milestone' && milestoneCount >= 2) {
        newErrors.type = 'Maximum 2 milestones allowed in demo mode';
      }
      
      if (formData.tags.length > 1) {
        newErrors.tags = 'Maximum 1 tag allowed in demo mode';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const taskData = {
        name: formData.name.trim(),
        startDate: new Date(formData.startDate),
        endDate: formData.type === 'milestone' ? new Date(formData.startDate) : new Date(formData.endDate),
        statusId: formData.statusId,
        tags: formData.tags,
        type: formData.type,
        description: formData.description.trim(),
        projectId,
        parentId: formData.parentId,
        collapsed: formData.collapsed,
        groupColor: formData.groupColor
      };
      
      let savedTask: Task;
      
      if (mode === 'create') {
        // Check demo mode restrictions
        if (isDemoMode) {
          if (formData.type === 'milestone' && milestoneCount >= 2) {
            alert('Maximum 2 milestones allowed in demo mode');
            return;
          }
          
          if (taskCount >= 3) {
            alert('Maximum 3 tasks allowed in demo mode');
            return;
          }
        }
        
        const result = await taskService.createTask(taskData);
        if (!result.success) {
          alert(result.error || 'Failed to create task');
          return;
        }
        savedTask = result.task!;
      } else {
        const result = await taskService.updateTask(taskId!, taskData);
        if (!result.success) {
          alert(result.error || 'Failed to update task');
          return;
        }
        savedTask = result.task!;
      }
      
      // Save custom fields
      for (const [fieldId, value] of Object.entries(formData.customFields)) {
        await taskService.saveTaskCustomField(savedTask.id, fieldId, value);
      }
      
      onTaskSaved?.(savedTask);
      onClose();
      
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  // Handle close
  const handleClose = async () => {
    // Unlock task if it was locked
    if (isLocked && taskId) {
      try {
        await unlockTask(taskId);
      } catch (error) {
        console.error('Error unlocking task:', error);
      }
    }
    
    setFormData({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      statusId: '',
      tags: [],
      type: 'task',
      description: '',
      customFields: {}
    });
    setErrors({});
    setPredecessors([]);
    setIsLocked(false);
    setLockError(null);
    setLockInfo(null);
    onClose();
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return formData.type === 'milestone' ? 0 : diffDays;
  };

  // Get status color
  const getStatusColor = (statusId: string) => {
    const status = availableStatuses.find(s => s.id === statusId);
    return status?.color || '#6b7280';
  };

  // Handle dependency management
  const handleAddPredecessor = async () => {
    if (!newPredecessorTaskId || !taskId) return;
    
    try {
      const result = await dependenciesEngine.linkTasks(
        newPredecessorTaskId,
        taskId,
        newPredecessorType,
        projectId
      );
      
      if (result.success) {
        const deps = await dependenciesEngine.getDependencies(taskId);
        setPredecessors(deps);
        setNewPredecessorTaskId('');
        setShowAddPredecessor(false);
      } else {
        alert(result.error || 'Failed to add dependency');
      }
    } catch (error) {
      console.error('Error adding predecessor:', error);
      alert('Failed to add dependency');
    }
  };

  const handleUnlinkPredecessor = async (predecessorId: string) => {
    try {
      const result = await dependenciesEngine.unlinkTasks(predecessorId);
      if (result.success) {
        const deps = await dependenciesEngine.getDependencies(taskId!);
        setPredecessors(deps);
      } else {
        alert(result.error || 'Failed to remove dependency');
      }
    } catch (error) {
      console.error('Error unlinking predecessor:', error);
      alert('Failed to remove dependency');
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (mode === 'edit' && taskId) {
        loadTaskData();
      }
    }
  }, [isOpen, mode, taskId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700 p-3">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <div className="font-semibold">DEMO MODE</div>
              <div className="text-xs">
                Max 3 tasks, max 2 milestones, max 1 tag per item
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'general'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    General
                  </button>
                  {mode === 'edit' && taskId && (
                    <button
                      onClick={() => setActiveTab('dependencies')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'dependencies'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      Dependencies
                    </button>
                  )}
                  {mode === 'edit' && taskId && (
                    <button
                      onClick={() => setActiveTab('progress')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'progress'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>Progress</span>
                      </div>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('custom-fields')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'custom-fields'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Custom Fields
                  </button>
                  <button
                    onClick={() => setActiveTab('tags')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'tags'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <TagIcon className="w-4 h-4" />
                      <span>Tags</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('structure')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'structure'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <FolderIcon className="w-4 h-4" />
                      <span>Structure</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'notes'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <FlagIcon className="w-4 h-4" />
                      <span>Notes</span>
                    </div>
                  </button>
                  {mode === 'edit' && taskId && (
                    <button
                      onClick={() => setActiveTab('constraints')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'constraints'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <LockClosedIcon className="w-4 h-4" />
                        <span>Constraints</span>
                      </div>
                    </button>
                  )}
                  {mode === 'edit' && taskId && (
                    <button
                      onClick={() => setActiveTab('comments')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'comments'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span>Comments</span>
                      </div>
                    </button>
                  )}
                  {mode === 'edit' && taskId && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'history'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>History</span>
                      </div>
                    </button>
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'general' && (
                  <>
                    {/* Basic Information */}
                    <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
                
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter task name"
                    disabled={!canEdit}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Task Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={!canEdit}
                  >
                    <option value="task">Task</option>
                    <option value="milestone">Milestone</option>
                    <option value="phase">Phase</option>
                    <option value="summary">Summary</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
                  )}
                  {formData.type === 'milestone' && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Milestones are zero-duration tasks that mark key project dates
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className={`w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        disabled={!canEdit}
                      />
                      <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
                    )}
                  </div>

                  {/* End Date - Hidden for milestones */}
                  {formData.type !== 'milestone' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className={`w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          disabled={!canEdit}
                        />
                        <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                      </div>
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Duration - Calculated field */}
                {formData.type !== 'milestone' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.statusId}
                    onChange={(e) => handleInputChange('statusId', e.target.value)}
                    className={`w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.statusId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={!canEdit}
                  >
                    <option value="">Select status</option>
                    {availableStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  {errors.statusId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.statusId}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags {isDemoMode && <span className="text-yellow-600">(Max 1)</span>}
                  </label>
                  <TagSelector
                    availableTags={availableTags}
                    selectedTags={formData.tags}
                    onTagsChange={handleTagsChange}
                    isDemoMode={isDemoMode}
                    maxTags={1}
                    canEdit={canEdit}
                  />
                  {errors.tags && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task description"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              {/* Dependencies Section */}
              {mode === 'edit' && taskId && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dependencies</h3>
                  
                  {/* Current Predecessors */}
                  {predecessors.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Predecessors
                      </label>
                      <div className="space-y-2">
                        {predecessors.map(dep => {
                          const predecessorTask = availableTasks.find(t => t.id === dep.predecessorId);
                          return (
                            <div key={dep.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {predecessorTask?.name || 'Unknown Task'}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  ({dep.type})
                                </span>
                              </div>
                              <button
                                onClick={() => handleUnlinkPredecessor(dep.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                disabled={!canEdit}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add New Predecessor */}
                  <div>
                    <button
                      onClick={() => setShowAddPredecessor(!showAddPredecessor)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      disabled={!canEdit}
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Add Predecessor</span>
                    </button>
                    
                    {showAddPredecessor && (
                      <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-md space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Predecessor Task
                          </label>
                          <select
                            value={newPredecessorTaskId}
                            onChange={(e) => setNewPredecessorTaskId(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="">Select a task</option>
                            {availableTasks
                              .filter(task => task.id !== taskId)
                              .map(task => (
                                <option key={task.id} value={task.id}>
                                  {task.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dependency Type
                          </label>
                          <select
                            value={newPredecessorType}
                            onChange={(e) => setNewPredecessorType(e.target.value as any)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="FS">Finish-to-Start (FS)</option>
                            <option value="SS">Start-to-Start (SS)</option>
                            <option value="FF">Finish-to-Finish (FF)</option>
                            <option value="SF">Start-to-Finish (SF)</option>
                          </select>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={handleAddPredecessor}
                            disabled={!newPredecessorTaskId}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setShowAddPredecessor(false)}
                            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

                {activeTab === 'dependencies' && mode === 'edit' && taskId && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dependencies</h3>
                    
                    {/* Current Predecessors */}
                    {predecessors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Predecessors
                        </label>
                        <div className="space-y-2">
                          {predecessors.map(dep => {
                            const predecessorTask = availableTasks.find(t => t.id === dep.predecessorId);
                            return (
                              <div key={dep.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {predecessorTask?.name || 'Unknown Task'}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    ({dep.type})
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleUnlinkPredecessor(dep.id)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  disabled={!canEdit}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add New Predecessor */}
                    <div>
                      <button
                        onClick={() => setShowAddPredecessor(!showAddPredecessor)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        disabled={!canEdit}
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>Add Predecessor</span>
                      </button>
                      
                      {showAddPredecessor && (
                        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-md space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Predecessor Task
                            </label>
                            <select
                              value={newPredecessorTaskId}
                              onChange={(e) => setNewPredecessorTaskId(e.target.value)}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="">Select a task</option>
                              {availableTasks
                                .filter(task => task.id !== taskId)
                                .map(task => (
                                  <option key={task.id} value={task.id}>
                                    {task.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Dependency Type
                            </label>
                            <select
                              value={newPredecessorType}
                              onChange={(e) => setNewPredecessorType(e.target.value as any)}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="FS">Finish-to-Start (FS)</option>
                              <option value="SS">Start-to-Start (SS)</option>
                              <option value="FF">Finish-to-Finish (FF)</option>
                              <option value="SF">Start-to-Finish (SF)</option>
                            </select>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={handleAddPredecessor}
                              disabled={!newPredecessorTaskId}
                              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowAddPredecessor(false)}
                              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
                )}

                {activeTab === 'progress' && taskId && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Progress Tracking</h3>
                    <ProgressTab
                      taskId={taskId}
                      projectId={projectId}
                      isDemoMode={isDemoMode}
                      onProgressUpdate={(taskId, progress) => {
                        // Handle progress update if needed
                        console.log('Progress updated:', taskId, progress);
                      }}
                    />
                  </div>
                )}

                {activeTab === 'schedule' && taskId && (
                  <div className="space-y-4">
                    <TaskScheduleTab
                      taskId={taskId}
                      projectId={projectId}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}

                {activeTab === 'custom-fields' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom Fields</h3>
                    <CustomFieldsSection
                      taskId={taskId || undefined}
                      projectId={projectId}
                      onFieldChange={handleCustomFieldChange}
                    />
                  </div>
                )}

                {activeTab === 'tags' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Tags</h3>
                    <TagSelector
                      selectedTagId={formData.tagId}
                      projectId={projectId}
                      onTagChange={(tagId) => {
                        setFormData(prev => ({ ...prev, tagId }));
                      }}
                      disabled={!canEdit}
                    />
                  </div>
                )}

                {activeTab === 'structure' && (
                  <div className="space-y-4">
                    <StructureTab
                      taskId={taskId || undefined}
                      projectId={projectId}
                      currentParentId={formData.parentId}
                      onParentChange={(parentId) => {
                        setFormData(prev => ({ ...prev, parentId }));
                      }}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}

                {activeTab === 'notes' && taskId && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Notes & Flags</h3>
                    <TaskNotesTab
                      taskId={taskId}
                      projectId={projectId}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}

                {activeTab === 'constraints' && taskId && (
                  <div className="space-y-4">
                    <TaskConstraintsTab
                      taskId={taskId}
                      projectId={projectId}
                      isDemoMode={isDemoMode}
                      onConstraintChange={(constraint) => {
                        // Handle constraint change if needed
                        console.log('Constraint changed:', constraint);
                      }}
                    />
                  </div>
                )}

                {activeTab === 'comments' && taskId && (
                  <div className="space-y-4">
                    <TaskCommentsTab
                      taskId={taskId}
                      projectId={projectId}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}

                {activeTab === 'history' && taskId && (
                  <div className="space-y-4">
                    <TaskHistoryTab
                      taskId={taskId}
                      projectId={projectId}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canEdit || saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Task Lock Conflict Modal */}
      {showLockConflictModal && lockInfo && (
        <TaskLockConflictModal
          isOpen={showLockConflictModal}
          onClose={() => setShowLockConflictModal(false)}
          lockInfo={lockInfo}
          taskName={formData.name || 'Unknown Task'}
        />
      )}
    </div>
  );
};

export default TaskModal; 