import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import TaskTable from './TaskTable';
import { taskTableService } from '../../services/taskTableService';
import { ganttCanvasService } from '../../services/ganttCanvasService';
import type { GanttTask, GanttLink } from './GanttCanvas';

const TaskTableTest: React.FC = () => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [links, setLinks] = useState<GanttLink[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<string>('editor');
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showWBSGroups, setShowWBSGroups] = useState<boolean>(true);

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Load demo tasks and links
      const demoTasks = await ganttCanvasService.getProjectTasks('demo-project');
      const demoLinks = await ganttCanvasService.getProjectLinks('demo-project');
      
      // Generate WBS numbering
      const tasksWithWBS = taskTableService.generateWBSNumbering(demoTasks);
      
      setTasks(tasksWithWBS);
      setLinks(demoLinks);
      
    } catch (error) {
      console.error('Failed to load demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<GanttTask>) => {
    try {
      setLastUpdate(`Task ${taskId} updated: ${JSON.stringify(updates)}`);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      
      // Save to database with validation
      const result = await taskTableService.updateTask(taskId, updates);
      
      if (!result.success) {
        setValidationErrors(result.errors);
        console.warn('Task update validation failed:', result.errors);
      } else {
        setValidationErrors([]);
        console.log('Task updated successfully');
      }
      
    } catch (error) {
      console.error('Task update failed:', error);
      setValidationErrors(['Update operation failed']);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    console.log('Selected task:', taskId);
  };

  const handleToggleExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleScrollSync = (scrollTop: number) => {
    // This would sync with the Gantt canvas scroll
    console.log('Table scroll position:', scrollTop);
  };

  const handleRegenerateWBS = async () => {
    try {
      const tasksWithWBS = taskTableService.generateWBSNumbering(tasks);
      setTasks(tasksWithWBS);
      
      // Save to database
      await taskTableService.saveWBSNumbering(tasksWithWBS);
      
      setLastUpdate('WBS numbering regenerated and saved');
    } catch (error) {
      console.error('Failed to regenerate WBS:', error);
    }
  };

  const handleBatchUpdate = async () => {
    try {
      // Example batch update - update progress for all tasks
      const updates = tasks.map(task => ({
        taskId: task.id,
        updates: { progress: Math.min(task.progress + 10, 100) }
      }));

      const result = await taskTableService.batchUpdateTasks(updates);
      
      if (result.success) {
        setTasks(prevTasks => 
          prevTasks.map(task => ({
            ...task,
            progress: Math.min(task.progress + 10, 100)
          }))
        );
        setLastUpdate('Batch update completed successfully');
      } else {
        setValidationErrors(result.errors);
        setLastUpdate('Batch update failed');
      }
    } catch (error) {
      console.error('Batch update failed:', error);
    }
  };

  const selectedTask = tasks.find(task => task.id === selectedTaskId);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Table Test</h1>
          <p className="text-gray-600">Test the Task Table grid layout and interactive features</p>
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

            {/* WBS Grouping */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">WBS Grouping</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showWBSGroups}
                  onChange={(e) => setShowWBSGroups(e.target.checked)}
                  className="mr-2"
                />
                <EyeIcon className="w-4 h-4 mr-1" />
                Show WBS Groups
              </label>
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
                  onClick={handleRegenerateWBS}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <CogIcon className="w-4 h-4 inline mr-1" />
                  Regenerate WBS
                </button>
              </div>
            </div>

            {/* Batch Operations */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Batch Operations</label>
              <div className="space-y-1">
                <button
                  onClick={handleBatchUpdate}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  <CheckIcon className="w-4 h-4 inline mr-1" />
                  +10% Progress
                </button>
                <button
                  onClick={() => setSelectedTaskId(undefined)}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-1" />
                  Clear Selection
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
                Tasks: <span className="font-medium text-gray-900">{tasks.length}</span>
              </span>
              <span className="text-gray-600">
                Links: <span className="font-medium text-gray-900">{links.length}</span>
              </span>
              <span className="text-gray-600">
                Expanded: <span className="font-medium text-gray-900">{expandedTasks.size}</span>
              </span>
              {selectedTask && (
                <span className="text-gray-600">
                  Selected: <span className="font-medium text-blue-600">{selectedTask.name}</span>
                </span>
              )}
            </div>
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                Last: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              <span>Validation Errors:</span>
            </div>
            <ul className="mt-2 text-red-700 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Task Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <TaskTable
            tasks={tasks}
            links={links}
            selectedTaskId={selectedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={handleTaskUpdate}
            onScrollSync={handleScrollSync}
            userRole={userRole}
            expandedTasks={expandedTasks}
            onToggleExpansion={handleToggleExpansion}
          />
        </div>

        {/* Selected Task Details */}
        {selectedTask && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Task Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{selectedTask.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">WBS Number</label>
                <p className="text-gray-900">{selectedTask.wbsNumber || 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  selectedTask.status === 'delayed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTask.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress</label>
                <p className="text-gray-900">{selectedTask.progress}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <p className="text-gray-900">{taskTableService.formatDate(selectedTask.startDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <p className="text-gray-900">{taskTableService.formatDate(selectedTask.endDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <p className="text-gray-900">{taskTableService.calculateDuration(selectedTask.startDate, selectedTask.endDate)} days</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Float</label>
                <p className="text-gray-900">{selectedTask.float} days</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Critical Path</label>
                <p className="text-gray-900">
                  {selectedTask.isCritical ? (
                    <span className="text-red-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </p>
              </div>
              {selectedTask.assignedTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  <p className="text-gray-900">{selectedTask.assignedTo}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTableTest; 