import React, { useState } from 'react';
import { ChatBubbleLeftIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import TaskCommentsTab from './TaskCommentsTab';
import TaskHistoryTab from './TaskHistoryTab';

const TaskCommentsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [isDemoMode, setIsDemoMode] = useState(true);

  const demoTaskId = 'demo-task-123';
  const demoProjectId = 'demo-project-456';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Task Comments & History Demo
              </h1>
              <p className="text-gray-600 mt-1">
                Threaded comments and automatic change history for Programme Manager v2
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Demo Mode Active</span>
            </div>
          </div>
        </div>

        {/* Demo Info */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">i</span>
              </div>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Demo Features:</p>
              <ul className="space-y-1">
                <li>• <strong>Comments:</strong> Max 5 comments per task, threaded replies, edit/delete own comments</li>
                <li>• <strong>History:</strong> Automatic logging of task changes, last 3 changes shown in demo</li>
                <li>• <strong>Permissions:</strong> Role-based access control for viewing/creating comments</li>
                <li>• <strong>Supabase:</strong> All data persisted in database with proper RLS policies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Comments
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'comments' && (
            <TaskCommentsTab
              taskId={demoTaskId}
              projectId={demoProjectId}
              isDemoMode={isDemoMode}
            />
          )}
          
          {activeTab === 'history' && (
            <TaskHistoryTab
              taskId={demoTaskId}
              projectId={demoProjectId}
              isDemoMode={isDemoMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Implementation Details:</p>
            <ul className="space-y-1 text-xs">
              <li>• Database tables: <code>programme_task_comments</code>, <code>programme_task_history</code></li>
              <li>• Service: <code>taskCommentsService</code> with Supabase integration</li>
              <li>• Components: <code>TaskCommentsTab</code>, <code>TaskHistoryTab</code></li>
              <li>• Integration: Added to <code>TaskModal</code> with new tabs</li>
              <li>• Permissions: <code>programme.comments.view</code>, <code>programme.comments.create</code>, <code>programme.audit.view</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCommentsDemo; 