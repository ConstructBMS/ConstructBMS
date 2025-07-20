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
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { activityTemplatesService } from '../../services/activityTemplatesService';
import type { ActivityTemplate, TaskActivity } from '../../services/activityTemplatesService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui';
import ActivityTemplatesModal from './ActivityTemplatesModal';

const TaskActivitiesTest: React.FC = () => {
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('demo-task-1');
  const [userRole, setUserRole] = useState<string>('editor');
  const [userId, setUserId] = useState<string>('demo-user');
  const [loading, setLoading] = useState<boolean>(true);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [activities, setActivities] = useState<TaskActivity[]>([]);

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Load templates
      const demoTemplates = await activityTemplatesService.getTemplates(userId);
      setTemplates(demoTemplates);
      
      // Load demo activities
      const demoActivities = activityTemplatesService.getDemoTaskActivities(selectedTaskId);
      setActivities(demoActivities);
      
    } catch (error) {
      console.error('Failed to load demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityUpdate = async (activityId: string, updates: Partial<TaskActivity>) => {
    try {
      setLastUpdate(`Activity ${activityId} updated: ${JSON.stringify(updates)}`);
      
      // Update local state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId ? { ...activity, ...updates } : activity
        )
      );
      
      console.log('Activity updated successfully');
    } catch (error) {
      console.error('Activity update failed:', error);
    }
  };

  const handleActivityDelete = async (activityId: string) => {
    try {
      setLastUpdate(`Activity ${activityId} deleted`);
      
      // Update local state
      setActivities(prevActivities => 
        prevActivities.filter(activity => activity.id !== activityId)
      );
      
      console.log('Activity deleted successfully');
    } catch (error) {
      console.error('Activity delete failed:', error);
    }
  };

  const handleActivitiesChange = async (newActivities: TaskActivity[]) => {
    try {
      setLastUpdate(`Activities changed: ${newActivities.length} activities`);
      setActivities(newActivities);
      console.log('Activities changed successfully');
    } catch (error) {
      console.error('Activities change failed:', error);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    try {
      setLastUpdate(`Template ${templateId} applied to task`);
      
      // Simulate applying template
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const newActivities = await activityTemplatesService.applyTemplateToTask(templateId, selectedTaskId, userId);
        setActivities(prev => [...prev, ...newActivities]);
      }
      
      console.log('Template applied successfully');
    } catch (error) {
      console.error('Template application failed:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await activityTemplatesService.createTemplate({
        name: 'New Test Template',
        description: 'A test template created from the test interface',
        owner_id: userId,
        is_public: false,
        category: 'Test',
        tags: ['test', 'demo']
      });

      if (newTemplate) {
        setTemplates(prev => [...prev, newTemplate]);
        setLastUpdate('New template created');
      }
    } catch (error) {
      console.error('Template creation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Activities & Templates Test</h1>
          <p className="text-gray-600">Test the Task Activities system with template management and application</p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">User Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Task ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Task ID</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="demo-task-1">Demo Task 1</option>
                <option value="demo-task-2">Demo Task 2</option>
                <option value="demo-task-3">Demo Task 3</option>
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Actions</label>
              <div className="space-y-1">
                <button
                  onClick={loadDemoData}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ChevronRightIcon className="w-4 h-4 inline mr-1" />
                  Reload Data
                </button>
                <button
                  onClick={() => setShowTemplatesModal(true)}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <CogIcon className="w-4 h-4 inline mr-1" />
                  Manage Templates
                </button>
              </div>
            </div>

            {/* Template Operations */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Template Operations</label>
              <div className="space-y-1">
                <button
                  onClick={handleCreateTemplate}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Create Template
                </button>
                <button
                  onClick={() => handleApplyTemplate('template-1')}
                  className="w-full px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
                >
                  <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                  Apply Template 1
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Templates: <span className="font-medium text-gray-900">{templates.length}</span>
              </span>
              <span className="text-gray-600">
                Activities: <span className="font-medium text-gray-900">{activities.length}</span>
              </span>
              <span className="text-gray-600">
                Task ID: <span className="font-medium text-blue-600">{selectedTaskId}</span>
              </span>
              <span className="text-gray-600">
                User Role: <span className="font-medium text-gray-900">{userRole}</span>
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                Last: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Templates Overview */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <div className="flex items-center space-x-1">
                    {template.is_public ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {template.category && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {template.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {template.owner_id === userId ? 'You' : 'Other'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleApplyTemplate(template.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Activities */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* This component needs to be implemented or replaced with a real one */}
          {/* For now, it will just show a placeholder */}
          <div className="p-4 text-center text-gray-500">
            Task Activities component placeholder.
            The actual TaskActivities component needs to be integrated here.
          </div>
        </div>

        {/* Activities Details */}
        {activities.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dependencies
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map(activity => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.label}</div>
                          <div className="text-sm text-gray-500">{activity.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'delayed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                activity.progress >= 80 ? 'bg-green-500' :
                                activity.progress >= 60 ? 'bg-blue-500' :
                                activity.progress >= 40 ? 'bg-yellow-500' :
                                activity.progress >= 20 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${activity.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{activity.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.duration} day{activity.duration !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.dependencies.length > 0 ? (
                          <div className="flex items-center space-x-1">
                            {/* TagIcon is no longer imported, so this will cause an error */}
                            {/* <TagIcon className="w-4 h-4" /> */}
                            <span>{activity.dependencies.length}</span>
                          </div>
                        ) : (
                          'None'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        <ActivityTemplatesModal
          isOpen={showTemplatesModal}
          onClose={() => setShowTemplatesModal(false)}
          onApplyTemplate={handleApplyTemplate}
          taskId={selectedTaskId}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default TaskActivitiesTest; 