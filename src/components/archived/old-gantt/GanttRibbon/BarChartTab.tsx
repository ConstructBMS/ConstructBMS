import React, { useState } from 'react';
import { 
  ChartBarIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProjectView } from '../../../contexts/ProjectViewContext';

export const BarChartTab: React.FC = () => {
  const { canAccess } = usePermissions();
  const { state } = useProjectView();
  const { selectedTasks } = state;
  
  // Mock tasks and updateTask for now - these should come from your task service
  const tasks: any[] = []; // Replace with actual task service
  const updateTask = (taskId: string, updates: any) => {
    console.log('Update task:', taskId, updates);
    // Replace with actual task update logic
  };
  
  // Modal and state management
  const [modal, setModal] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [selectedBarStyle, setSelectedBarStyle] = useState<'standard' | 'critical' | 'custom'>('standard');

  const can = (key: string) => canAccess(`gantt.barchart.${key}`);

  // Bar style definitions
  const barStyles = [
    { 
      id: 'standard', 
      name: 'Standard', 
      description: 'Default bar style with blue color',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      barColor: '#2563eb',
      preview: 'bg-blue-600'
    },
    { 
      id: 'critical', 
      name: 'Critical', 
      description: 'Critical path bars with red color',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      barColor: '#dc2626',
      preview: 'bg-red-600'
    },
    { 
      id: 'custom', 
      name: 'Custom', 
      description: 'User-defined bar style and color',
      icon: PaintBrushIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      barColor: '#9333ea',
      preview: 'bg-purple-600'
    }
  ];

  // Font size options
  const fontSizes = [
    { value: 10, label: '10px', preview: 'text-xs' },
    { value: 12, label: '12px', preview: 'text-sm' },
    { value: 14, label: '14px', preview: 'text-base' },
    { value: 16, label: '16px', preview: 'text-lg' },
    { value: 18, label: '18px', preview: 'text-xl' }
  ];

  // Color presets
  const colorPresets = [
    { name: 'Blue', value: '#2563eb', preview: 'bg-blue-600' },
    { name: 'Red', value: '#dc2626', preview: 'bg-red-600' },
    { name: 'Green', value: '#16a34a', preview: 'bg-green-600' },
    { name: 'Yellow', value: '#ca8a04', preview: 'bg-yellow-600' },
    { name: 'Purple', value: '#9333ea', preview: 'bg-purple-600' },
    { name: 'Orange', value: '#ea580c', preview: 'bg-orange-600' },
    { name: 'Teal', value: '#0d9488', preview: 'bg-teal-600' },
    { name: 'Pink', value: '#db2777', preview: 'bg-pink-600' }
  ];

  // Event handlers
  const handleBarChartAction = (action: string, payload?: any) => {
    if (!selectedTasks.length) {
      console.log('No tasks selected');
      return;
    }

    switch (action) {
      case 'bar-style-standard':
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { barStyle: 'standard', barColor: '#2563eb' });
        });
        setSelectedBarStyle('standard');
        break;
        
      case 'bar-style-critical':
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { barStyle: 'critical', barColor: '#dc2626' });
        });
        setSelectedBarStyle('critical');
        break;
        
      case 'bar-style-custom':
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { barStyle: 'custom' });
        });
        setSelectedBarStyle('custom');
        openModal('bar-style-custom');
        break;
        
      case 'bar-font-change':
        openModal('font-settings');
        break;
        
      case 'bar-colour-change':
        openModal('color-settings');
        break;
        
      case 'toggle-labels':
        const newLabelState = !showLabels;
        setShowLabels(newLabelState);
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { showLabel: newLabelState });
        });
        break;
        
      case 'apply-font-size':
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { fontSize: payload });
        });
        break;
        
      case 'apply-bar-color':
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { barColor: payload, barStyle: 'custom' });
        });
        break;
        
      case 'reset-bar-styles':
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { 
            barStyle: 'standard', 
            barColor: '#2563eb', 
            fontSize: 12, 
            showLabel: true 
          });
        });
        break;
    }
  };

  const openModal = (id: string) => setModal(id);

  const getBarChartInfo = () => {
    if (!selectedTasks.length) return null;
    
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    if (!selectedTask) return null;

    return {
      barStyle: selectedTask.barStyle || 'standard',
      barColor: selectedTask.barColor || '#2563eb',
      fontSize: selectedTask.fontSize || 12,
      showLabel: selectedTask.showLabel !== false
    };
  };

  const barChartInfo = getBarChartInfo();
  const currentBarStyle = barStyles.find(s => s.id === barChartInfo?.barStyle) || barStyles[0];

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Bar Styles */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {barStyles.map((barStyle) => (
              <button
                key={barStyle.id}
                onClick={() => handleBarChartAction(`bar-style-${barStyle.id}`)}
                className={`flex flex-col items-center justify-center px-3 py-2 w-20 h-16 border rounded transition-colors ${
                  barChartInfo?.barStyle === barStyle.id
                    ? `${barStyle.bgColor} ${barStyle.borderColor} ${barStyle.color}`
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                title={barStyle.description}
              >
                <barStyle.icon className="h-5 w-5 mb-1" />
                <span className="text-xs text-center leading-tight">{barStyle.name}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-600 font-medium">Bar Styles</div>
        </div>

        {/* Font & Color Controls */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleBarChartAction('bar-font-change')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Change Font Settings"
            >
              <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Font</span>
            </button>
            <button
              onClick={() => handleBarChartAction('bar-colour-change')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Change Bar Color"
            >
              <SwatchIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Color</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Font/Colour</div>
        </div>

        {/* Label Controls */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleBarChartAction('toggle-labels')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                showLabels 
                  ? 'border-green-300 bg-green-50 text-green-700' 
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
              title={showLabels ? 'Hide Labels' : 'Show Labels'}
            >
              {showLabels ? (
                <EyeIcon className="h-5 w-5 mb-1" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 mb-1 text-gray-700" />
              )}
              <span className="text-xs">{showLabels ? 'Hide' : 'Show'}</span>
            </button>
            <button
              onClick={() => handleBarChartAction('reset-bar-styles')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset Bar Styles"
            >
              <Cog6ToothIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Reset</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Labels</div>
        </div>

        {/* Bar Chart Management */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => openModal('bar-chart-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-indigo-50 rounded transition-colors"
              title="Manage Bar Chart"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manage</span>
            </button>
            <button
              onClick={() => openModal('bar-chart-info')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors"
              title="Bar Chart Information"
            >
              <InformationCircleIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Info</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Tools</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
          </div>
          {barChartInfo && (
            <>
              <div className="text-xs text-gray-500">
                Style: {currentBarStyle.name}
              </div>
              <div className="text-xs text-gray-500">
                Font: {barChartInfo.fontSize}px
              </div>
              <div className="text-xs text-gray-500">
                Labels: {barChartInfo.showLabel ? 'On' : 'Off'}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">Color:</span>
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ backgroundColor: barChartInfo.barColor }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace(/([A-Z])/g, ' $1').replace('-', ' ').trim()}
              </h2>
              <button
                onClick={() => setModal('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Custom Bar Style Modal */}
            {modal === 'bar-style-custom' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <PaintBrushIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">Custom Bar Style</h3>
                    <p className="text-sm text-purple-700">Define custom bar appearance</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bar Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleBarChartAction('apply-bar-color', color.value)}
                          className="flex flex-col items-center p-2 border rounded hover:bg-gray-50"
                        >
                          <div 
                            className={`w-8 h-8 rounded border border-gray-300 ${color.preview}`}
                          />
                          <span className="text-xs mt-1">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <div className="space-y-2">
                      {fontSizes.map((font) => (
                        <button
                          key={font.value}
                          onClick={() => handleBarChartAction('apply-font-size', font.value)}
                          className="flex items-center justify-between w-full p-2 border rounded hover:bg-gray-50"
                        >
                          <span className={`${font.preview}`}>{font.label}</span>
                          <span className="text-xs text-gray-500">Sample</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Font Settings Modal */}
            {modal === 'font-settings' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Font Settings</h3>
                    <p className="text-sm text-blue-700">Configure text appearance for bars</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
                  <div className="space-y-2">
                    {fontSizes.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => handleBarChartAction('apply-font-size', font.value)}
                        className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`${font.preview} font-medium`}>{font.label}</span>
                          <span className="text-xs text-gray-500">Sample text</span>
                        </div>
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Color Settings Modal */}
            {modal === 'color-settings' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <SwatchIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">Color Settings</h3>
                    <p className="text-sm text-purple-700">Choose bar colors</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color Presets</label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleBarChartAction('apply-bar-color', color.value)}
                        className="flex flex-col items-center p-3 border rounded hover:bg-gray-50"
                      >
                        <div 
                          className={`w-12 h-8 rounded border border-gray-300 ${color.preview}`}
                        />
                        <span className="text-xs mt-2 font-medium">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Bar Chart Manager Modal */}
            {modal === 'bar-chart-manager' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                  <AdjustmentsHorizontalIcon className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="font-medium text-indigo-900">Bar Chart Manager</h3>
                    <p className="text-sm text-indigo-700">Manage and view all bar chart settings</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Bar Styles</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tasks?.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-4 rounded border border-gray-300" 
                            style={{ backgroundColor: task.barColor || '#2563eb' }}
                          />
                          <div>
                            <div className="font-medium text-sm">{task.name}</div>
                            <div className="text-xs text-gray-500">
                              {barStyles.find(s => s.id === task.barStyle)?.name || 'Standard'} • {task.fontSize || 12}px
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateTask(task.id, { barStyle: 'standard', barColor: '#2563eb' })}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            Standard
                          </button>
                          <button
                            onClick={() => updateTask(task.id, { barStyle: 'critical', barColor: '#dc2626' })}
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Critical
                          </button>
                        </div>
                      </div>
                    ))}
                    {!tasks?.length && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        No tasks found in the project
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Bar Chart Information Modal */}
            {modal === 'bar-chart-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <InformationCircleIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Bar Chart Information</h3>
                    <p className="text-sm text-green-700">Learn about bar chart styling options</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {barStyles.map((barStyle) => (
                    <div key={barStyle.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded ${barStyle.bgColor}`}>
                        <div className={`w-8 h-4 rounded ${barStyle.preview}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{barStyle.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{barStyle.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Use cases:</strong>
                          {barStyle.id === 'standard' && ' Default appearance for normal tasks'}
                          {barStyle.id === 'critical' && ' Highlight critical path tasks'}
                          {barStyle.id === 'custom' && ' User-defined colors and styles'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Styling Tips</span>
                  </div>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Use critical style to highlight important tasks</li>
                    <li>• Custom colors help distinguish task types</li>
                    <li>• Font size affects readability on the timeline</li>
                    <li>• Labels can be toggled for cleaner views</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 