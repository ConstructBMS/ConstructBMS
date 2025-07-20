import React, { useState, useEffect, useRef } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  LinkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import TaskLinkingCanvas from './TaskLinkingCanvas';
import { taskLinkingService } from '../../services/taskLinkingService';
import type { TaskLink, LinkType } from '../../services/taskLinkingService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui';

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: string;
  assignedTo?: string;
  float: number;
}

const TaskLinkingTest: React.FC = () => {
  const [projectId, setProjectId] = useState<string>('demo-project-1');
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [links, setLinks] = useState<TaskLink[]>([]);
  const [userRole, setUserRole] = useState<string>('editor');
  const [loading, setLoading] = useState<boolean>(true);
  const [showLinks, setShowLinks] = useState<boolean>(true);
  const [showLinkLabels, setShowLinkLabels] = useState<boolean>(true);
  const [selectedLink, setSelectedLink] = useState<TaskLink | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, [projectId]);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Load demo tasks
      const demoTasks = getDemoTasks();
      setTasks(demoTasks);
      
      // Load demo links
      const demoLinks = await taskLinkingService.getTaskLinks(projectId);
      setLinks(demoLinks);
      
      setLastUpdate('Demo data loaded');
    } catch (error) {
      console.error('Failed to load demo data:', error);
      setErrorMessage('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const getDemoTasks = (): GanttTask[] => {
    return [
      {
        id: 'task-1',
        name: 'Site Preparation',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
        progress: 100,
        status: 'completed',
        assignedTo: 'John Smith',
        float: 0
      },
      {
        id: 'task-2',
        name: 'Foundation Work',
        startDate: new Date('2024-01-21'),
        endDate: new Date('2024-02-05'),
        progress: 75,
        status: 'in-progress',
        assignedTo: 'Mike Johnson',
        float: 2
      },
      {
        id: 'task-3',
        name: 'Structural Steel',
        startDate: new Date('2024-02-06'),
        endDate: new Date('2024-02-25'),
        progress: 30,
        status: 'in-progress',
        assignedTo: 'Sarah Wilson',
        float: 0
      },
      {
        id: 'task-4',
        name: 'Electrical Rough-in',
        startDate: new Date('2024-01-25'),
        endDate: new Date('2024-02-15'),
        progress: 50,
        status: 'in-progress',
        assignedTo: 'David Brown',
        float: 5
      },
      {
        id: 'task-5',
        name: 'Plumbing Rough-in',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-20'),
        progress: 40,
        status: 'in-progress',
        assignedTo: 'Lisa Davis',
        float: 3
      },
      {
        id: 'task-6',
        name: 'Interior Finishing',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        progress: 0,
        status: 'not-started',
        assignedTo: 'Tom Miller',
        float: 10
      }
    ];
  };

  const handleLinkCreate = async (newLink: TaskLink) => {
    try {
      setLinks(prev => [...prev, newLink]);
      setLastUpdate(`Link created: ${newLink.source_task_id} → ${newLink.target_task_id}`);
      setInfoMessage('Link created successfully');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (error) {
      console.error('Link creation failed:', error);
      setErrorMessage('Failed to create link');
    }
  };

  const handleLinkUpdate = async (linkId: string, updates: Partial<TaskLink>) => {
    try {
      setLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      ));
      setLastUpdate(`Link updated: ${linkId}`);
      setInfoMessage('Link updated successfully');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (error) {
      console.error('Link update failed:', error);
      setErrorMessage('Failed to update link');
    }
  };

  const handleLinkDelete = async (linkId: string) => {
    try {
      setLinks(prev => prev.filter(link => link.id !== linkId));
      setLastUpdate(`Link deleted: ${linkId}`);
      setInfoMessage('Link deleted successfully');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (error) {
      console.error('Link deletion failed:', error);
      setErrorMessage('Failed to delete link');
    }
  };

  const handleCreateTestLink = async () => {
    try {
      const newLink = await taskLinkingService.createTaskLink({
        project_id: projectId,
        source_task_id: 'task-1',
        target_task_id: 'task-6',
        link_type: 'finish-to-start',
        lag_days: 5
      });

      if (newLink) {
        handleLinkCreate(newLink);
      }
    } catch (error) {
      console.error('Test link creation failed:', error);
      setErrorMessage('Failed to create test link');
    }
  };

  const handleDeleteAllLinks = async () => {
    if (!confirm('Are you sure you want to delete all links?')) return;

    try {
      for (const link of links) {
        await taskLinkingService.deleteTaskLink(link.id);
      }
      setLinks([]);
      setLastUpdate('All links deleted');
      setInfoMessage('All links deleted successfully');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (error) {
      console.error('Delete all links failed:', error);
      setErrorMessage('Failed to delete all links');
    }
  };

  const handleValidateLinks = async () => {
    try {
      const issues: string[] = [];

      // Check for circular dependencies
      for (const link of links) {
        const hasCircular = await taskLinkingService.checkCircularDependency(
          link.source_task_id,
          link.target_task_id,
          projectId
        );
        if (hasCircular) {
          issues.push(`Circular dependency detected: ${link.source_task_id} → ${link.target_task_id}`);
        }
      }

      // Check for orphaned links
      const taskIds = new Set(tasks.map(t => t.id));
      for (const link of links) {
        if (!taskIds.has(link.source_task_id)) {
          issues.push(`Orphaned link: Source task ${link.source_task_id} not found`);
        }
        if (!taskIds.has(link.target_task_id)) {
          issues.push(`Orphaned link: Target task ${link.target_task_id} not found`);
        }
      }

      if (issues.length === 0) {
        setInfoMessage('All links are valid');
      } else {
        setErrorMessage(`Validation issues found:\n${issues.join('\n')}`);
      }
      setTimeout(() => {
        setInfoMessage(null);
        setErrorMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Link validation failed:', error);
      setErrorMessage('Failed to validate links');
    }
  };

  const getLinkTypeStats = () => {
    const stats = {
      'finish-to-start': 0,
      'start-to-start': 0,
      'finish-to-finish': 0,
      'start-to-finish': 0
    };

    links.forEach(link => {
      stats[link.link_type]++;
    });

    return stats;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Linking Engine Test</h1>
          <p className="text-gray-600">Test the Task Linking system with drag-and-drop functionality and link management</p>
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

            {/* Project ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Project ID</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="demo-project-1">Demo Project 1</option>
                <option value="demo-project-2">Demo Project 2</option>
                <option value="demo-project-3">Demo Project 3</option>
              </select>
            </div>

            {/* Display Options */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Display Options</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showLinks}
                    onChange={(e) => setShowLinks(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show Links</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showLinkLabels}
                    onChange={(e) => setShowLinkLabels(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show Labels</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Actions</label>
              <div className="space-y-1">
                <button
                  onClick={loadDemoData}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                  Reload Data
                </button>
                <button
                  onClick={handleCreateTestLink}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Test Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Link Management */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Link Management</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleValidateLinks}
                className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
              >
                <CheckIcon className="w-4 h-4 inline mr-1" />
                Validate Links
              </button>
              <button
                onClick={handleDeleteAllLinks}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <TrashIcon className="w-4 h-4 inline mr-1" />
                Delete All
              </button>
            </div>
          </div>

          {/* Link Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(getLinkTypeStats()).map(([type, count]) => (
              <div key={type} className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700">
                  {taskLinkingService.getLinkTypeAbbreviation(type as LinkType)}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">
                  {taskLinkingService.getLinkTypeDescription(type as LinkType)}
                </div>
              </div>
            ))}
          </div>

          {/* Links List */}
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map(link => {
                  const sourceTask = tasks.find(t => t.id === link.source_task_id);
                  const targetTask = tasks.find(t => t.id === link.target_task_id);
                  
                  return (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sourceTask?.name || link.source_task_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {targetTask?.name || link.target_task_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {taskLinkingService.getLinkTypeAbbreviation(link.link_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.lag_days > 0 ? `+${link.lag_days}` : link.lag_days} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLink(link);
                              setEditMode(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLinkDelete(link.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Tasks: <span className="font-medium text-gray-900">{tasks.length}</span>
              </span>
              <span className="text-gray-600">
                Links: <span className="font-medium text-gray-900">{links.length}</span>
              </span>
              <span className="text-gray-600">
                Project: <span className="font-medium text-blue-600">{projectId}</span>
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

        {/* Linking Canvas */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Task Linking Canvas</h3>
            <p className="text-sm text-gray-600 mt-1">
              Drag from one task to another to create links. Click links to edit properties.
            </p>
          </div>
          
          <div 
            ref={containerRef}
            className="relative w-full h-96 bg-gray-100 overflow-auto"
          >
            {showLinks ? (
              <TaskLinkingCanvas
                projectId={projectId}
                tasks={tasks}
                links={links}
                onLinkCreate={handleLinkCreate}
                onLinkUpdate={handleLinkUpdate}
                onLinkDelete={handleLinkDelete}
                userRole={userRole}
                containerRef={containerRef}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <EyeSlashIcon className="w-8 h-8 mr-2" />
                Links are hidden
              </div>
            )}
          </div>
        </div>

        {/* Edit Link Modal */}
        {editMode && selectedLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Link</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Type
                  </label>
                  <select
                    value={selectedLink.link_type}
                    onChange={(e) => setSelectedLink(prev => prev ? { ...prev, link_type: e.target.value as LinkType } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="finish-to-start">Finish to Start (FS)</option>
                    <option value="start-to-start">Start to Start (SS)</option>
                    <option value="finish-to-finish">Finish to Finish (FF)</option>
                    <option value="start-to-finish">Start to Finish (SF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lag (days)
                  </label>
                  <input
                    type="number"
                    value={selectedLink.lag_days}
                    onChange={(e) => setSelectedLink(prev => prev ? { ...prev, lag_days: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="-365"
                    max="365"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => {
                      if (selectedLink) {
                        handleLinkUpdate(selectedLink.id, {
                          link_type: selectedLink.link_type,
                          lag_days: selectedLink.lag_days
                        });
                      }
                      setEditMode(false);
                      setSelectedLink(null);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setSelectedLink(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              <div className="whitespace-pre-line">{errorMessage}</div>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              {infoMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLinkingTest; 