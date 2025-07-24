import { useState } from 'react';
import TimelinePane from './TimelinePane';

// Sample task data
const sampleTasks = [
  {
    id: 'task-1',
    name: 'Project Planning',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    progress: 100,
    color: '#3b82f6',
    type: 'task'
  },
  {
    id: 'task-2',
    name: 'Requirements Analysis',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-25'),
    progress: 75,
    color: '#10b981',
    type: 'task'
  },
  {
    id: 'task-3',
    name: 'Design Phase',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-10'),
    progress: 50,
    color: '#f59e0b',
    type: 'task'
  },
  {
    id: 'task-4',
    name: 'Development Phase',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-04-15'),
    progress: 25,
    color: '#8b5cf6',
    type: 'task'
  },
  {
    id: 'task-5',
    name: 'Testing Phase',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-05-01'),
    progress: 0,
    color: '#ef4444',
    type: 'task'
  },
  {
    id: 'milestone-1',
    name: 'Project Kickoff',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-01'),
    progress: 100,
    color: '#dc2626',
    type: 'milestone'
  },
  {
    id: 'milestone-2',
    name: 'Design Complete',
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-02-10'),
    progress: 0,
    color: '#dc2626',
    type: 'milestone'
  },
  {
    id: 'milestone-3',
    name: 'Development Complete',
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-04-15'),
    progress: 0,
    color: '#dc2626',
    type: 'milestone'
  },
  {
    id: 'milestone-4',
    name: 'Project Complete',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-05-01'),
    progress: 0,
    color: '#dc2626',
    type: 'milestone'
  }
];

const TimelinePaneDemo = () => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleTaskSelect = (taskId, isSelected) => {
    if (isSelected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TimelinePane Demo
          </h1>
          <p className="text-gray-600">
            Interactive Gantt timeline with scroll and zoom controls
          </p>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-900">How to Use:</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
                <ul className="space-y-1">
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Ctrl/Cmd + +</kbd> Zoom In</li>
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Ctrl/Cmd + -</kbd> Zoom Out</li>
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Shift + Scroll</kbd> Horizontal Scroll</li>
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Drag</kbd> Pan Timeline</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mouse/Touch Controls:</h4>
                <ul className="space-y-1">
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Click</kbd> Select Tasks</li>
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Drag</kbd> Pan timeline</li>
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Wheel</kbd> Vertical scroll</li>
                  <li>• <kbd className="px-2 py-1 bg-white rounded border">Shift + Wheel</kbd> Horizontal scroll</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Pane */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <TimelinePane
            projectId="demo-project"
            tasks={sampleTasks}
            startDate={new Date('2024-01-01')}
            endDate={new Date('2024-05-31')}
            onTaskSelect={handleTaskSelect}
            selectedTasks={selectedTasks}
            className="h-96"
          />
        </div>

        {/* Status Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Tasks</h3>
            <div className="text-sm text-gray-600">
              {selectedTasks.length === 0 ? (
                <span className="text-gray-400">No tasks selected</span>
              ) : (
                <ul className="space-y-1">
                  {selectedTasks.map(taskId => {
                    const task = sampleTasks.find(t => t.id === taskId);
                    return (
                      <li key={taskId} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: task?.color }}
                        />
                        <span>{task?.name}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Project Statistics</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total Tasks: {sampleTasks.length}</div>
              <div>Milestones: {sampleTasks.filter(t => t.type === 'milestone').length}</div>
              <div>Regular Tasks: {sampleTasks.filter(t => t.type === 'task').length}</div>
              <div>Project Duration: 5 months</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>✅ Scroll Synchronization</div>
              <div>✅ Zoom Controls</div>
              <div>✅ Task Selection</div>
              <div>✅ Progress Indicators</div>
              <div>✅ Today Marker</div>
              <div>✅ Responsive Design</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center space-x-4">
          <button
            onClick={() => setSelectedTasks([])}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Show Instructions
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelinePaneDemo; 