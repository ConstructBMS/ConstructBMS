import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { activityTemplatesService } from '../../services/activityTemplatesService';
import type { TaskActivity } from '../../services/activityTemplatesService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui';
import ActivityTemplatesModal from './ActivityTemplatesModal';

interface TaskActivitiesProps {
  onActivitiesChange?: (activities: TaskActivity[]) => void;
  onActivityDelete?: (activityId: string) => void;
  onActivityUpdate?: (activityId: string, updates: Partial<TaskActivity>) => void;
  taskId: string;
  userId: string;
  userRole: string;
}

const TaskActivities: React.FC<TaskActivitiesProps> = ({
  taskId,
  userId,
  userRole,
  onActivityUpdate,
  onActivityDelete,
  onActivitiesChange
}) => {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);

  const canEdit = userRole !== 'viewer';

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [taskId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // For now, use demo data - in real implementation, fetch from service
      const demoActivities = getDemoActivities();
      setActivities(demoActivities);
      if (onActivitiesChange) {
        onActivitiesChange(demoActivities);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpansion = (activityId: string) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleApplyTemplate = (templateId: string) => {
    // This would be handled by the modal and service
    console.log('Template applied:', templateId);
    // Reload activities after template application
    loadActivities();
  };

  const handleActivityUpdate = async (activityId: string, updates: Partial<TaskActivity>) => {
    try {
      // Update local state
      const updatedActivities = activities.map(activity =>
        activity.id === activityId ? { ...activity, ...updates } : activity
      );
      setActivities(updatedActivities);

      if (onActivityUpdate) {
        onActivityUpdate(activityId, updates);
      }

      if (onActivitiesChange) {
        onActivitiesChange(updatedActivities);
      }

      setEditingActivity(null);
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const handleActivityDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const updatedActivities = activities.filter(activity => activity.id !== activityId);
      setActivities(updatedActivities);

      if (onActivityDelete) {
        onActivityDelete(activityId);
      }

      if (onActivitiesChange) {
        onActivitiesChange(updatedActivities);
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDemoActivities = (): TaskActivity[] => {
    return [
      {
        id: 'activity-1',
        task_id: taskId,
        template_id: 'template-1',
        label: 'Site Preparation',
        description: 'Clear and prepare the construction site',
        duration: 2,
        sequence: 1,
        is_milestone: false,
        status: 'completed',
        progress: 100,
        dependencies: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'activity-2',
        task_id: taskId,
        template_id: 'template-1',
        label: 'Excavation',
        description: 'Excavate foundation trenches',
        duration: 3,
        sequence: 2,
        is_milestone: false,
        status: 'in-progress',
        progress: 60,
        dependencies: ['activity-1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'activity-3',
        task_id: taskId,
        template_id: 'template-1',
        label: 'Foundation Complete',
        description: 'Foundation construction completed',
        duration: 0,
        sequence: 3,
        is_milestone: true,
        status: 'not-started',
        progress: 0,
        dependencies: ['activity-2'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Task Activities</h3>
        {canEdit && (
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            + Activities
          </button>
        )}
      </div>

      {/* Activities List */}
      <div className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No activities defined for this task.</p>
            {canEdit && (
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Add activities from template
              </button>
            )}
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-4">
              {/* Activity Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleExpansion(activity.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedActivities.has(activity.id) ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{activity.sequence}</span>
                    <span className="font-medium text-gray-900">{activity.label}</span>
                    {activity.is_milestone && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Milestone
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Status */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('-', ' ')}
                  </span>

                  {/* Progress */}
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(activity.progress)}`}
                        style={{ width: `${activity.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{activity.progress}%</span>
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingActivity(activity.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleActivityDelete(activity.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedActivities.has(activity.id) && (
                <div className="mt-4 ml-7 space-y-3">
                  {/* Description */}
                  {activity.description && (
                    <div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {activity.duration} day{activity.duration !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {activity.assigned_to && (
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Assigned</span>
                      </div>
                    )}

                    {activity.template_id && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">From Template</span>
                      </div>
                    )}

                    {activity.dependencies.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">
                          {activity.dependencies.length} dependenc{activity.dependencies.length === 1 ? 'y' : 'ies'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Update (if editing) */}
                  {editingActivity === activity.id && canEdit && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Progress (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={activity.progress}
                            onChange={(e) => {
                              const progress = parseInt(e.target.value) || 0;
                              handleActivityUpdate(activity.id, { progress });
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            value={activity.status}
                            onChange={(e) => handleActivityUpdate(activity.id, { status: e.target.value as any })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleActivityUpdate(activity.id, { progress: 100, status: 'completed' })}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => setEditingActivity(null)}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Templates Modal */}
      <ActivityTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onApplyTemplate={handleApplyTemplate}
        taskId={taskId}
        userId={userId}
      />
    </div>
  );
};

export default TaskActivities; 