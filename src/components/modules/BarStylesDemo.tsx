import React, { useState } from 'react';
import { PaintBrushIcon, PlusIcon } from '@heroicons/react/24/outline';
import BarStylesManagerModal from './BarStylesManagerModal';
import { useBarStyles } from '../../hooks/useBarStyles';

interface DemoTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  isCritical: boolean;
  type: string;
  status: string;
  tagId: string;
  assignee: string;
  priority: string;
}

const BarStylesDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const projectId = 'demo-project-123';
  
  // Sample demo tasks
  const demoTasks: DemoTask[] = [
    {
      id: '1',
      name: 'Foundation Work',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 15),
      progress: 75,
      isCritical: true,
      type: 'standard',
      status: 'in-progress',
      tagId: '',
      assignee: 'John Smith',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Milestone: Foundation Complete',
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 0, 15),
      progress: 100,
      isCritical: false,
      type: 'milestone',
      status: 'completed',
      tagId: '',
      assignee: '',
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Framing',
      startDate: new Date(2024, 0, 16),
      endDate: new Date(2024, 1, 15),
      progress: 30,
      isCritical: false,
      type: 'standard',
      status: 'in-progress',
      tagId: 'snagging',
      assignee: 'Mike Johnson',
      priority: 'medium'
    },
    {
      id: '4',
      name: 'Electrical Rough-in',
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 1, 20),
      progress: 0,
      isCritical: false,
      type: 'standard',
      status: 'not-started',
      tagId: '',
      assignee: 'Sarah Wilson',
      priority: 'low'
    },
    {
      id: '5',
      name: 'Snagging List Review',
      startDate: new Date(2024, 2, 1),
      endDate: new Date(2024, 2, 10),
      progress: 0,
      isCritical: false,
      type: 'standard',
      status: 'not-started',
      tagId: 'snagging',
      assignee: 'Project Manager',
      priority: 'high'
    }
  ];

  const { getBarStyleForTask, refreshRules } = useBarStyles({ 
    projectId, 
    enabled: true 
  });

  const handleStylesUpdated = () => {
    refreshRules();
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bar Styles Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize the appearance of timeline task bars based on task attributes
          </p>
        </div>

        {/* Demo Controls */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Bar Style Rules
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create custom rules to style task bars based on conditions
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PaintBrushIcon className="w-4 h-4 mr-2" />
              Manage Styles
            </button>
          </div>
        </div>

        {/* Demo Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sample Tasks with Applied Styles
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Task bars are styled based on your custom rules
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {demoTasks.map((task) => {
                const customStyle = getBarStyleForTask(task);
                
                // Determine bar styling
                let barStyle = {
                  backgroundColor: '#e5e7eb',
                  borderColor: '#d1d5db',
                  color: '#1f2937',
                  borderStyle: 'solid' as const
                };
                
                if (customStyle) {
                  barStyle = {
                    backgroundColor: customStyle.barColor,
                    borderColor: customStyle.borderColor,
                    color: customStyle.textColor,
                    borderStyle: customStyle.pattern === 'dashed' ? 'dashed' : 'solid'
                  };
                } else if (task.isCritical) {
                  barStyle = {
                    backgroundColor: '#fecaca',
                    borderColor: '#ef4444',
                    color: '#1f2937',
                    borderStyle: 'solid'
                  };
                }

                const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
                const progressWidth = (task.progress / 100) * 100;

                return (
                  <div key={task.id} className="flex items-center space-x-4">
                    {/* Task Info */}
                    <div className="w-64">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {task.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()} ({duration} days)
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {task.type} • {task.status} • {task.assignee || 'Unassigned'}
                        {task.tagId && ` • Tag: ${task.tagId}`}
                        {task.isCritical && ' • Critical'}
                      </div>
                    </div>

                    {/* Task Bar */}
                    <div className="flex-1">
                      <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
                        {/* Background Bar */}
                        <div
                          className="absolute inset-0 rounded transition-all duration-200"
                          style={{
                            backgroundColor: barStyle.backgroundColor,
                            borderColor: barStyle.borderColor,
                            borderStyle: barStyle.borderStyle,
                            borderWidth: '2px'
                          }}
                        />
                        
                        {/* Progress Bar */}
                        {task.progress > 0 && (
                          <div
                            className="absolute left-0 top-0 h-full rounded transition-all duration-300"
                            style={{
                              width: `${progressWidth}%`,
                              backgroundColor: customStyle ? customStyle.barColor : '#3b82f6',
                              opacity: 0.8
                            }}
                          />
                        )}
                        
                        {/* Task Name */}
                        <div
                          className="absolute inset-0 flex items-center px-3 text-sm font-medium"
                          style={{ color: barStyle.color }}
                        >
                          {task.name}
                        </div>
                        
                        {/* Progress Percentage */}
                        {task.progress > 0 && (
                          <div
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold"
                            style={{ color: barStyle.color }}
                          >
                            {task.progress}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Applied Rule Info */}
                    <div className="w-48 text-xs">
                      {customStyle ? (
                        <div className="text-green-600 dark:text-green-400">
                          ✓ Custom style applied
                        </div>
                      ) : task.isCritical ? (
                        <div className="text-red-600 dark:text-red-400">
                          ✓ Critical path style
                        </div>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                          Default style
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Demo Features
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Create custom bar style rules based on task attributes</li>
            <li>• Style bars by critical path, task type, status, tags, assignee, or priority</li>
            <li>• Customize bar color, border color, text color, and border pattern</li>
            <li>• Live preview of how rules will affect task bars</li>
            <li>• Demo mode limits: maximum 2 custom rules</li>
            <li>• Default styles for critical path and milestones are enforced</li>
          </ul>
        </div>
      </div>

      {/* Bar Styles Manager Modal */}
      <BarStylesManagerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId={projectId}
        onStylesUpdated={handleStylesUpdated}
      />
    </div>
  );
};

export default BarStylesDemo; 