import React, { useState } from 'react';
import { 
  PaintBrushIcon,
  ArrowPathIcon,
  ViewColumnsIcon,
  SwatchIcon,
  EyeIcon,
  EyeSlashIcon,
  MapPinIcon,
  DocumentTextIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

export const TabFormat: React.FC = () => {
  const { state, updateLayoutSettings } = useProjectView();
  const { layoutSettings } = state;
  const { canAccess } = usePermissions();
  
  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Format-specific state
  const [barStyle, setBarStyle] = useState<'default' | 'rounded' | 'flat' | 'gradient'>('default');
  const [barColor, setBarColor] = useState('#3b82f6');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(12);
  const [showLabels, setShowLabels] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);

  const can = (key: string) => canAccess(`gantt.format.${key}`);

  const handleFormatAction = (action: string, payload?: any) => {
    if (!can(action)) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for format action: ' + action
      });
      return;
    }

    try {
      switch (action) {
        case 'bar-style':
          setBarStyle(payload);
          console.log('Bar style changed to:', payload);
          setOperationStatus({
            type: 'success',
            message: `Bar style changed to ${payload}`
          });
          break;

        case 'reset-bars':
          setBarStyle('default');
          setBarColor('#3b82f6');
          console.log('Bar styles reset to default');
          setOperationStatus({
            type: 'success',
            message: 'Bar styles reset to default'
          });
          break;

        case 'row-height':
          updateLayoutSettings({ rowHeight: payload });
          setOperationStatus({
            type: 'success',
            message: `Row height changed to ${payload}px`
          });
          break;

        case 'change-colors':
          openModal('color-picker');
          break;

        case 'toggle-labels':
          const newShowLabels = !showLabels;
          setShowLabels(newShowLabels);
          updateLayoutSettings({ showBarLabels: newShowLabels });
          setOperationStatus({
            type: 'success',
            message: `Task labels ${newShowLabels ? 'enabled' : 'disabled'}`
          });
          break;

        case 'toggle-milestones':
          const newShowMilestones = !showMilestones;
          setShowMilestones(newShowMilestones);
          console.log('Milestone markers:', newShowMilestones ? 'enabled' : 'disabled');
          setOperationStatus({
            type: 'success',
            message: `Milestone markers ${newShowMilestones ? 'enabled' : 'disabled'}`
          });
          break;

        case 'change-font':
          openModal('font-settings');
          break;

        case 'bar-settings':
          openModal('bar-settings');
          break;

        case 'format-presets':
          openModal('format-presets');
          break;
      }
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: `Failed to apply format: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const openModal = (id: string) => setModal(id);

  // Clear status message after 3 seconds
  React.useEffect(() => {
    if (operationStatus) {
      const timer = setTimeout(() => setOperationStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Bar Styles Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleFormatAction('bar-style', 'default')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                barStyle === 'default' 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white hover:bg-blue-50'
              }`}
              title="Default Bar Style"
            >
              <PaintBrushIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Default</span>
            </button>
            <button
              onClick={() => handleFormatAction('bar-style', 'rounded')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                barStyle === 'rounded' 
                  ? 'bg-green-100 border-green-500 text-green-700' 
                  : 'bg-white hover:bg-green-50'
              }`}
              title="Rounded Bar Style"
            >
              <PaintBrushIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Rounded</span>
            </button>
            <button
              onClick={() => handleFormatAction('bar-settings')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Bar Settings"
            >
              <CogIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Settings</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Bars</div>
        </div>

        {/* Row Settings Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleFormatAction('row-height', 24)}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.rowHeight === 24 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white hover:bg-blue-50'
              }`}
              title="Small Row Height"
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Small</span>
            </button>
            <button
              onClick={() => handleFormatAction('row-height', 32)}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.rowHeight === 32 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white hover:bg-blue-50'
              }`}
              title="Medium Row Height"
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Medium</span>
            </button>
            <button
              onClick={() => handleFormatAction('row-height', 40)}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.rowHeight === 40 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white hover:bg-blue-50'
              }`}
              title="Large Row Height"
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Large</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Rows</div>
        </div>

        {/* Colors Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleFormatAction('change-colors')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-yellow-50 rounded transition-colors"
              title="Change Colors"
            >
              <SwatchIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Colors</span>
            </button>
            <button
              onClick={() => handleFormatAction('format-presets')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors"
              title="Format Presets"
            >
                             <Squares2X2Icon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Presets</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Colors</div>
        </div>

        {/* Labels Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleFormatAction('toggle-labels')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                showLabels 
                  ? 'bg-green-100 border-green-500 text-green-700' 
                  : 'bg-white hover:bg-green-50'
              }`}
              title="Toggle Task Labels"
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Labels</span>
            </button>
            <button
              onClick={() => handleFormatAction('toggle-milestones')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                showMilestones 
                  ? 'bg-purple-100 border-purple-500 text-purple-700' 
                  : 'bg-white hover:bg-purple-50'
              }`}
              title="Toggle Milestone Markers"
            >
              <MapPinIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Milestones</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Labels</div>
        </div>

        {/* Fonts Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleFormatAction('change-font')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-indigo-50 rounded transition-colors"
              title="Change Font"
            >
                             <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Font</span>
            </button>
            <button
              onClick={() => handleFormatAction('reset-bars')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors"
              title="Reset Bar Styles"
            >
              <ArrowPathIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Reset</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Fonts</div>
        </div>

        {/* Current Settings Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Bar Style: {barStyle.charAt(0).toUpperCase() + barStyle.slice(1)}
          </div>
          <div className="text-xs text-gray-500">
            Row Height: {layoutSettings.rowHeight}px
          </div>
          <div className="text-xs text-gray-500">
            Labels: {showLabels ? 'On' : 'Off'}
          </div>
          <div className="text-xs text-gray-500">
            Milestones: {showMilestones ? 'On' : 'Off'}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {operationStatus && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
          operationStatus.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          operationStatus.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            {operationStatus.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : operationStatus.type === 'error' ? (
              <ExclamationTriangleIcon className="h-5 w-5" />
            ) : (
              <InformationCircleIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{operationStatus.message}</span>
            <button
              onClick={() => setOperationStatus(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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

            {modal === 'color-picker' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Color Customization</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Bar Colors:</strong> Customize the appearance of task bars with different color schemes.</p>
                  <p><strong>Status Colors:</strong> Set colors for different task statuses (not started, in progress, completed).</p>
                  <p><strong>Critical Path:</strong> Highlight critical path tasks with distinctive colors.</p>
                  <p><strong>Theme Support:</strong> Choose from light, dark, or custom color themes.</p>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                                             onClick={() => {
                         setBarColor(color);
                         console.log('Bar color changed to:', color);
                         setOperationStatus({
                           type: 'success',
                           message: `Bar color changed to ${color}`
                         });
                         setModal(null);
                       }}
                      className="w-12 h-12 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={`Color: ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {modal === 'font-settings' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Font Settings</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Font Family:</strong> Choose from system fonts or custom web fonts.</p>
                  <p><strong>Font Size:</strong> Adjust text size for better readability.</p>
                  <p><strong>Font Weight:</strong> Set bold, normal, or light text weights.</p>
                  <p><strong>Text Color:</strong> Customize text color for different elements.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{fontSize}px</span>
                  </div>
                </div>
                <button
                                     onClick={() => {
                     console.log('Font changed to:', fontFamily, fontSize + 'px');
                     setOperationStatus({
                       type: 'success',
                       message: `Font changed to ${fontFamily} ${fontSize}px`
                     });
                     setModal(null);
                   }}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Apply Font Settings
                </button>
              </div>
            )}

            {modal === 'bar-settings' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Bar Style Settings</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Bar Shape:</strong> Choose between rectangular, rounded, or custom bar shapes.</p>
                  <p><strong>Bar Height:</strong> Adjust the height of task bars relative to row height.</p>
                  <p><strong>Progress Display:</strong> Show progress within bars using different visual styles.</p>
                  <p><strong>Border Styles:</strong> Add borders, shadows, or other visual effects to bars.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bar Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['default', 'rounded', 'flat', 'gradient'].map((style) => (
                        <button
                          key={style}
                          onClick={() => handleFormatAction('bar-style', style)}
                          className={`p-2 border rounded text-xs ${
                            barStyle === style 
                              ? 'bg-blue-100 border-blue-500 text-blue-700' 
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bar Height</label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      value={layoutSettings.rowHeight * 0.6}
                                             onChange={(e) => {
                         const barHeight = Number(e.target.value);
                         console.log('Bar height changed to:', barHeight + 'px');
                       }}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{Math.round(layoutSettings.rowHeight * 0.6)}px</span>
                  </div>
                </div>
              </div>
            )}

            {modal === 'format-presets' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Format Presets</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Quick Apply:</strong> Apply predefined formatting schemes for consistent appearance.</p>
                  <p><strong>Custom Presets:</strong> Save and reuse your own formatting configurations.</p>
                  <p><strong>Theme Integration:</strong> Presets work with light and dark themes.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Classic', desc: 'Traditional Gantt appearance' },
                    { name: 'Modern', desc: 'Clean, minimalist design' },
                    { name: 'Colorful', desc: 'Vibrant, high-contrast colors' },
                    { name: 'Professional', desc: 'Corporate, formal styling' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setOperationStatus({
                          type: 'success',
                          message: `${preset.name} preset applied`
                        });
                        setModal(null);
                      }}
                      className="p-3 border border-gray-300 rounded hover:bg-gray-50 text-left"
                    >
                      <div className="font-medium text-gray-800">{preset.name}</div>
                      <div className="text-xs text-gray-600">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 