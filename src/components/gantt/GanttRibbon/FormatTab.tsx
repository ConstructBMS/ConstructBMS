import React, { useState } from 'react';
import { 
  PaintBrushIcon,
  DocumentTextIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Task } from '../../../services/ganttTaskService';

export const FormatTab: React.FC = () => {
  const { state } = useProjectView();
  const { selectedTasks } = state;
  const { canAccess } = usePermissions();
  
  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [rowHeight, setRowHeight] = useState(32);
  const [tasks, setTasks] = useState<Task[]>([]);

  const can = (key: string) => canAccess(`gantt.format.${key}`);

  // Mock tasks data - in real implementation this would come from a service
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Sample Task 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 7,
      percentComplete: 0,
      status: 'not-started',
      level: 0,
      position: 0,
      taskType: 'normal',
      priority: 'medium',
      predecessors: [],
      successors: []
    }
  ];

  // Initialize tasks with mock data
  React.useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleFormatAction = (action: string, payload?: any) => {
    if (!can(action)) {
      console.log('Permission denied for format action:', action);
      return;
    }

    switch (action) {
      case 'bar-color-red':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              barColor: '#e53e3e'
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Applied red color to tasks:', selectedTasks);
        break;

      case 'bar-color-green':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              barColor: '#38a169'
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Applied green color to tasks:', selectedTasks);
        break;

      case 'bar-color-blue':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              barColor: '#3182ce'
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Applied blue color to tasks:', selectedTasks);
        break;

      case 'font-small':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              fontSize: 10
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Applied small font to tasks:', selectedTasks);
        break;

      case 'font-medium':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              fontSize: 12
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Applied medium font to tasks:', selectedTasks);
        break;

      case 'font-large':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              fontSize: 16
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Applied large font to tasks:', selectedTasks);
        break;
    }
  };

  const updateLayoutSettings = (settings: { rowHeight?: number; showGrid?: boolean }) => {
    if (settings.rowHeight !== undefined) {
      setRowHeight(settings.rowHeight);
      console.log('Updated row height to:', settings.rowHeight);
    }
    if (settings.showGrid !== undefined) {
      setShowGrid(settings.showGrid);
      console.log('Updated grid visibility to:', settings.showGrid);
    }
  };

  const openModal = (id: string) => setModal(id);

  const getFormatInfo = () => {
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    return {
      selectedCount: selectedTasks.length,
      barColor: selectedTask?.barColor || '#3182ce',
      fontSize: selectedTask?.fontSize || 12,
      rowHeight: rowHeight,
      showGrid: showGrid
    };
  };

  const formatInfo = getFormatInfo();

  const barColors = [
    { id: 'red', name: 'Red', color: '#e53e3e', description: 'Red bar color' },
    { id: 'green', name: 'Green', color: '#38a169', description: 'Green bar color' },
    { id: 'blue', name: 'Blue', color: '#3182ce', description: 'Blue bar color' },
    { id: 'yellow', name: 'Yellow', color: '#d69e2e', description: 'Yellow bar color' },
    { id: 'purple', name: 'Purple', color: '#805ad5', description: 'Purple bar color' },
    { id: 'orange', name: 'Orange', color: '#dd6b20', description: 'Orange bar color' }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', size: 10, description: 'Small font size (10px)' },
    { id: 'medium', name: 'Medium', size: 12, description: 'Medium font size (12px)' },
    { id: 'large', name: 'Large', size: 16, description: 'Large font size (16px)' }
  ];

  const rowHeights = [
    { id: 24, name: 'Small', height: 24, description: 'Small row height' },
    { id: 32, name: 'Medium', height: 32, description: 'Medium row height' },
    { id: 40, name: 'Large', height: 40, description: 'Large row height' }
  ];

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Bar Style Tools */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleFormatAction('bar-color-red')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Red Bar Color"
            >
              <PaintBrushIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Red</span>
            </button>
            <button
              onClick={() => handleFormatAction('bar-color-green')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Green Bar Color"
            >
              <PaintBrushIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Green</span>
            </button>
            <button
              onClick={() => handleFormatAction('bar-color-blue')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Blue Bar Color"
            >
              <PaintBrushIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Blue</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Bar Style</div>
        </div>

        {/* Font Settings */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleFormatAction('font-small')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Small Font"
            >
              <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Small</span>
            </button>
            <button
              onClick={() => handleFormatAction('font-medium')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Medium Font"
            >
              <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Medium</span>
            </button>
            <button
              onClick={() => handleFormatAction('font-large')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Large Font"
            >
              <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Large</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Font</div>
        </div>

        {/* Row Height */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => updateLayoutSettings({ rowHeight: 24 })}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Small Row Height"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Small</span>
            </button>
            <button
              onClick={() => updateLayoutSettings({ rowHeight: 32 })}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Medium Row Height"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Medium</span>
            </button>
            <button
              onClick={() => updateLayoutSettings({ rowHeight: 40 })}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Large Row Height"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Large</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Row Height</div>
        </div>

        {/* Grid Display */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => updateLayoutSettings({ showGrid: true })}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                showGrid 
                  ? 'border-green-300 bg-green-50 text-green-700' 
                  : 'border-gray-300 bg-white hover:bg-green-50'
              }`}
              title="Show Grid"
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Show</span>
            </button>
            <button
              onClick={() => updateLayoutSettings({ showGrid: false })}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                !showGrid 
                  ? 'border-red-300 bg-red-50 text-red-700' 
                  : 'border-gray-300 bg-white hover:bg-red-50'
              }`}
              title="Hide Grid"
            >
              <EyeSlashIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Hide</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Grid</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {formatInfo.selectedCount} task{formatInfo.selectedCount !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            Bar Color: {formatInfo.barColor}
          </div>
          <div className="text-xs text-gray-500">
            Font Size: {formatInfo.fontSize}
          </div>
          <div className="text-xs text-gray-500">
            Row Height: {formatInfo.rowHeight}px
          </div>
          <div className="text-xs text-gray-500">
            Grid: {formatInfo.showGrid ? 'Visible' : 'Hidden'}
          </div>
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace('-', ' ')} Manager
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {modal === 'format-manager' && (
              <div className="space-y-6">
                {/* Bar Color Selection */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Bar Color Selection</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {barColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => {
                          handleFormatAction(`bar-color-${color.id}`);
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div 
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: color.color }}
                        ></div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">{color.name}</div>
                          <div className="text-xs text-gray-500">{color.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Selection */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Font Size Selection</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {fontSizes.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => {
                          handleFormatAction(`font-${font.id}`);
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">{font.name}</div>
                          <div className="text-xs text-gray-500">{font.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row Height Selection */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Row Height Selection</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {rowHeights.map((row) => (
                      <button
                        key={row.id}
                        onClick={() => {
                          updateLayoutSettings({ rowHeight: row.height });
                          setModal(null);
                        }}
                        className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        <ArrowsPointingOutIcon className="h-4 w-4 mr-2 text-gray-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">{row.name}</div>
                          <div className="text-xs text-gray-500">{row.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {modal === 'format-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Format Management Information</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Bar Colors:</strong> Customize the visual appearance of task bars.</p>
                  <p><strong>Font Sizes:</strong> Adjust text size for better readability.</p>
                  <p><strong>Row Heights:</strong> Control the spacing between task rows.</p>
                  <p><strong>Grid Display:</strong> Show or hide grid lines for better organization.</p>
                  <p><strong>Visual Customization:</strong> Personalize the Gantt chart appearance.</p>
                  <p><strong>Layout Control:</strong> Manage overall chart layout and spacing.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 