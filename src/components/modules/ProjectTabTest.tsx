import React, { useState } from 'react';
import ProjectTab from './ribbonTabs/ProjectTab';
import type { ProjectOperation, ProjectCalendar, WBSNumbering } from './ribbonTabs/ProjectTab';

const ProjectTabTest: React.FC = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>(['task-1', 'task-2']);
  const [currentCalendar, setCurrentCalendar] = useState<ProjectCalendar | undefined>({
    id: 'standard',
    name: 'Standard Calendar',
    description: 'Monday-Friday, 8:00 AM - 5:00 PM',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: '08:00', end: '17:00' },
    holidays: []
  });
  const [currentWBS, setCurrentWBS] = useState<WBSNumbering | undefined>({
    enabled: true,
    format: 'n.n.n',
    separator: '.',
    autoUpdate: true
  });

  const handleProjectOperation = (operation: ProjectOperation) => {
    console.log('Project operation:', operation);
    
    // Handle operations here
    switch (operation.type) {
      case 'set-calendar':
        if (operation.data?.calendar) {
          setCurrentCalendar(operation.data.calendar);
          console.log(`Calendar set to: ${operation.data.calendar.name}`);
        }
        break;
      case 'set-constraint':
        if (operation.data?.constraint) {
          console.log(`Constraint '${operation.data.constraint}' set for tasks:`, operation.data.taskIds);
        } else if (operation.data?.action === 'clear') {
          console.log('Constraints cleared for tasks:', operation.data.taskIds);
        }
        break;
      case 'define-deadline':
        if (operation.data?.action === 'set') {
          console.log('Setting deadlines for tasks:', operation.data.taskIds);
        } else if (operation.data?.action === 'clear') {
          console.log('Deadlines cleared for tasks:', operation.data.taskIds);
        }
        break;
      case 'toggle-summary':
        console.log('Project summary toggled');
        break;
      case 'apply-wbs':
        if (operation.data?.enabled) {
          setCurrentWBS({
            enabled: true,
            format: operation.data.format || 'n.n.n',
            separator: operation.data.separator || '.',
            autoUpdate: operation.data.autoUpdate !== false
          });
          console.log(`WBS enabled with format: ${operation.data.format}`);
        } else {
          setCurrentWBS({
            enabled: false,
            format: 'n.n.n',
            separator: '.',
            autoUpdate: false
          });
          console.log('WBS disabled');
        }
        break;
      case 'update-task':
        console.log('Task update:', operation.data?.action);
        break;
    }
  };

  const projectTabConfig = ProjectTab(
    handleProjectOperation,
    'project_manager',
    selectedTasks,
    true,
    currentCalendar,
    currentWBS
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Project Tab Test</h2>
      
      {/* Current State Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current Project State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Selected Tasks:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{selectedTasks.length} tasks</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Calendar:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{currentCalendar?.name || 'None'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">WBS Enabled:</span>
            <span className={`ml-2 ${currentWBS?.enabled ? 'text-green-600' : 'text-red-600'}`}>
              {currentWBS?.enabled ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">WBS Format:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{currentWBS?.format || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Task Selection Controls */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Task Selection</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTasks(['task-1'])}
            className={`px-3 py-1 text-sm rounded ${
              selectedTasks.length === 1 && selectedTasks[0] === 'task-1'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Select Task 1
          </button>
          <button
            onClick={() => setSelectedTasks(['task-2'])}
            className={`px-3 py-1 text-sm rounded ${
              selectedTasks.length === 1 && selectedTasks[0] === 'task-2'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Select Task 2
          </button>
          <button
            onClick={() => setSelectedTasks(['task-1', 'task-2'])}
            className={`px-3 py-1 text-sm rounded ${
              selectedTasks.length === 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Select Both
          </button>
          <button
            onClick={() => setSelectedTasks([])}
            className={`px-3 py-1 text-sm rounded ${
              selectedTasks.length === 0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Project Tab Groups */}
      <div className="space-y-6">
        {projectTabConfig.groups.map((group, groupIndex) => (
          <div key={groupIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{group.title}</h3>
            <div className="flex flex-wrap gap-3">
              {group.buttons.map((button, buttonIndex) => (
                <button
                  key={buttonIndex}
                  onClick={button.action}
                  disabled={button.disabled}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    button.disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : button.isActive
                      ? 'bg-constructbms-blue text-white border border-constructbms-blue hover:bg-constructbms-blue/90'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={button.tooltip}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Operation Log */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Operation Log</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Check the browser console to see detailed operation logs when you click the buttons above.
        </p>
      </div>
    </div>
  );
};

export default ProjectTabTest; 