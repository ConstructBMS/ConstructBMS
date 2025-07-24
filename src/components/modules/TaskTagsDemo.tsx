import React, { useState, useEffect } from 'react';
import { PlusIcon, TagIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { taskTagsService, type ProgrammeTag } from '../../services/taskTagsService';
import { demoModeService } from '../../services/demoModeService';
import TagSelector from './TagSelector';
import TagPill from './TagPill';
import TagFilter from './TagFilter';
import TaskGridWithTags from './TaskGridWithTags';

interface DemoTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  progress: number;
  tagId?: string | null;
  demo?: boolean;
}

const TaskTagsDemo: React.FC = () => {
  const [tags, setTags] = useState<ProgrammeTag[]>([]);
  const [tasks, setTasks] = useState<DemoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showCreateTag, setShowCreateTag] = useState(false);

  useEffect(() => {
    loadDemoData();
    checkDemoMode();
  }, []);

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.isDemoMode();
    setIsDemoMode(isDemo);
  };

  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Load demo tags
      const demoTags = await taskTagsService.getDemoTags();
      setTags(demoTags);

      // Create demo tasks
      const demoTasks: DemoTask[] = [
        {
          id: 'task-1',
          name: 'Foundation Work',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-02-15'),
          status: 'in-progress',
          progress: 75,
          tagId: demoTags[0]?.id, // Client Hold
          demo: true
        },
        {
          id: 'task-2',
          name: 'Electrical Installation',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-03-01'),
          status: 'not-started',
          progress: 0,
          tagId: demoTags[2]?.id, // Procurement
          demo: true
        },
        {
          id: 'task-3',
          name: 'Plumbing Work',
          startDate: new Date('2024-01-20'),
          endDate: new Date('2024-02-20'),
          status: 'completed',
          progress: 100,
          tagId: demoTags[1]?.id, // Snagging
          demo: true
        },
        {
          id: 'task-4',
          name: 'Roof Installation',
          startDate: new Date('2024-02-10'),
          endDate: new Date('2024-03-10'),
          status: 'on-hold',
          progress: 25,
          tagId: null, // No tag
          demo: true
        }
      ];

      setTasks(demoTasks);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = (tag: ProgrammeTag) => {
    setTags(prev => [...prev, tag]);
    setShowCreateTag(false);
  };

  const handleTagFilterChange = (tagIds: string[]) => {
    setSelectedTagIds(tagIds);
  };

  const getFilteredTasks = () => {
    if (selectedTagIds.length === 0) {
      return tasks;
    }
    return tasks.filter(task => task.tagId && selectedTagIds.includes(task.tagId));
  };

  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId);
    // In a real app, this would open the task modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading demo...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Task Tags & Colour Coding Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Custom tags and colour-coded categorization for tasks in Programme Manager v2
        </p>
        {isDemoMode && (
          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Demo Mode: Limited to 3 tags, color selection disabled
            </p>
          </div>
        )}
      </div>

      {/* Tag Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Tags
            </h2>
            <button
              onClick={() => setShowCreateTag(true)}
              disabled={isDemoMode && tags.length >= 3}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isDemoMode && tags.length >= 3
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={isDemoMode && tags.length >= 3 ? 'Tag limit - Upgrade to add custom tags' : 'Add new tag'}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Tag</span>
            </button>
          </div>

          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <TagPill tag={tag} size="md" />
                  {tag.demo && (
                    <EyeIcon className="w-4 h-4 text-gray-400" title="Demo tag" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {tasks.filter(task => task.tagId === tag.id).length} tasks
                </span>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No tags available
              </p>
            )}
          </div>
        </div>

        {/* Tag Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filter by Tags
          </h2>
          <TagFilter
            projectId="demo"
            selectedTagIds={selectedTagIds}
            onTagFilterChange={handleTagFilterChange}
          />
          
          {selectedTagIds.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Showing {getFilteredTasks().length} of {tasks.length} tasks
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks with Tags
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Click on a task to view details
          </p>
        </div>
        <TaskGridWithTags
          projectId="demo"
          tasks={getFilteredTasks()}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Features Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <TagIcon className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Custom Tags</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create custom tags with labels and colors for task categorization
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <FunnelIcon className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Tag Filtering</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filter tasks by tags to focus on specific categories
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <EyeIcon className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Visual Cues</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Color-coded tags provide instant visual recognition
            </p>
          </div>
        </div>
      </div>

      {/* Create Tag Modal */}
      {showCreateTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Create New Tag
              </h3>
              <button
                onClick={() => setShowCreateTag(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <TagSelector
              selectedTagId={null}
              projectId="demo"
              onTagChange={() => {}}
              disabled={true}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tag creation is disabled in demo mode
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTagsDemo; 