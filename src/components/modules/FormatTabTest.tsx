import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import FormatTab from './ribbonTabs/FormatTab';
import { formatTabService } from '../../services/formatTabService';
import type { FormatOperation, FormatState } from './ribbonTabs/FormatTab';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FormatTabTest: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('project_manager');
  const [currentFormatState, setCurrentFormatState] = useState<FormatState>({
    barColoring: 'critical',
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    barHeight: 20,
    showMilestoneAsDiamond: true,
    showFloatAsTrail: false,
    customColors: {
      critical: '#ef4444',
      normal: '#3b82f6',
      completed: '#10b981',
      delayed: '#f59e0b',
      resource1: '#7c3aed',
      resource2: '#0891b2',
      resource3: '#16a34a'
    }
  });
  const [operationLog, setOperationLog] = useState<string[]>([]);

  useEffect(() => {
    // Load current format settings
    loadCurrentFormatSettings();
  }, []);

  const loadCurrentFormatSettings = async () => {
    try {
      const settings = await formatTabService.getCurrentFormatSettings();
      setCurrentFormatState(settings);
    } catch (error) {
      console.warn('Failed to load format settings:', error);
    }
  };

  const handleFormatOperation = async (operation: FormatOperation) => {
    try {
      // Log the operation
      const logEntry = `[${new Date().toLocaleTimeString()}] ${operation.type}: ${JSON.stringify(operation.data)}`;
      setOperationLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 entries

      // Handle the operation
      await formatTabService.handleFormatOperation(operation);

      // Update local state based on operation
      switch (operation.type) {
        case 'bar-coloring':
          if (operation.data?.scheme) {
            setCurrentFormatState(prev => ({
              ...prev,
              barColoring: operation.data.scheme,
              customColors: operation.data.colors || prev.customColors
            }));
          }
          break;

        case 'font-settings':
          if (operation.data?.family) {
            setCurrentFormatState(prev => ({
              ...prev,
              fontFamily: operation.data.family
            }));
          }
          if (operation.data?.size) {
            setCurrentFormatState(prev => ({
              ...prev,
              fontSize: operation.data.size
            }));
          }
          break;

        case 'bar-height':
          if (operation.data?.height) {
            setCurrentFormatState(prev => ({
              ...prev,
              barHeight: operation.data.height
            }));
          }
          break;

        case 'milestone-style':
          if (operation.data?.showAsDiamond !== undefined) {
            setCurrentFormatState(prev => ({
              ...prev,
              showMilestoneAsDiamond: operation.data.showAsDiamond
            }));
          }
          break;

        case 'float-style':
          if (operation.data?.showAsTrail !== undefined) {
            setCurrentFormatState(prev => ({
              ...prev,
              showFloatAsTrail: operation.data.showAsTrail
            }));
          }
          break;

        case 'save-preferences':
          if (operation.data?.action === 'reset-formatting') {
            const defaultSettings = await formatTabService.getCurrentFormatSettings();
            setCurrentFormatState(defaultSettings);
          }
          break;

        default:
          console.log('Operation handled:', operation);
      }
    } catch (error) {
      console.error('Format operation failed:', error);
      const errorLog = `[${new Date().toLocaleTimeString()}] ERROR: ${error}`;
      setOperationLog(prev => [errorLog, ...prev.slice(0, 9)]);
    }
  };

  const handleFormatStateChange = (newState: Partial<FormatState>) => {
    setCurrentFormatState(prev => ({ ...prev, ...newState }));
  };

  const formatTab = FormatTab(
    handleFormatOperation,
    userRole,
    currentFormatState,
    handleFormatStateChange
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Format Tab Test</h1>
            <p className="text-purple-100 mt-1">Test the Asta PowerProject Format ribbon tab</p>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="team_member">Team Member</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions
                </label>
                <div className="space-y-2">
                  <Button
                    onClick={() => loadCurrentFormatSettings()}
                    variant="outline"
                    size="sm"
                  >
                    Reload Settings
                  </Button>
                  <Button
                    onClick={() => formatTabService.applyFormatToGantt(currentFormatState)}
                    variant="outline"
                    size="sm"
                  >
                    Apply to Gantt
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Ribbon Tab */}
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Format Tab Configuration
              </h3>
              
              {/* Tab Header */}
              <div className="flex items-center space-x-2 mb-4">
                {formatTab.icon && <formatTab.icon className="w-5 h-5 text-purple-600" />}
                <span className="font-medium text-gray-700">{formatTab.label}</span>
              </div>

              {/* Tab Groups */}
              <div className="space-y-6">
                {formatTab.groups.map(group => (
                  <div key={group.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{group.title}</h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {group.buttons.map(button => (
                        <div key={button.id} className="relative">
                          <button
                            onClick={button.action}
                            disabled={button.disabled}
                            className={`
                              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                              transition-colors duration-200
                              ${button.disabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400'
                              }
                              ${button.isActive ? 'bg-purple-100 border-purple-500 text-purple-700' : ''}
                            `}
                            title={button.tooltip}
                          >
                            <button.icon className="w-4 h-4" />
                            <span>{button.label}</span>
                            {button.type === 'dropdown' && (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>

                          {/* Dropdown Menu */}
                          {button.type === 'dropdown' && button.dropdownItems && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10 hidden group-hover:block">
                              <div className="py-1">
                                {button.dropdownItems.map((item: any) => (
                                  <button
                                    key={item.id}
                                    onClick={item.action}
                                    disabled={item.disabled}
                                    className={`
                                      w-full text-left px-4 py-2 text-sm
                                      ${item.disabled
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                      }
                                    `}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <item.icon className="w-4 h-4" />
                                      <span>{item.label}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current State - Grouped Cards */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Format State</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Styling Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Bar Styling</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bar Coloring:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{currentFormatState.barColoring}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bar Height:</span>
                    <span className="text-sm font-medium text-gray-900">{currentFormatState.barHeight}px</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Milestone Diamond:</span>
                    <span className={`text-sm font-medium ${currentFormatState.showMilestoneAsDiamond ? 'text-green-600' : 'text-red-600'}`}>
                      {currentFormatState.showMilestoneAsDiamond ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Float Trail:</span>
                    <span className={`text-sm font-medium ${currentFormatState.showFloatAsTrail ? 'text-green-600' : 'text-red-600'}`}>
                      {currentFormatState.showFloatAsTrail ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Formatting Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Text Formatting</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Font Family:</span>
                    <span className="text-sm font-medium text-gray-900" style={{ fontFamily: currentFormatState.fontFamily }}>
                      {currentFormatState.fontFamily.split(',')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Font Size:</span>
                    <span className="text-sm font-medium text-gray-900">{currentFormatState.fontSize}pt</span>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <p 
                      className="text-gray-900"
                      style={{ 
                        fontFamily: currentFormatState.fontFamily, 
                        fontSize: `${currentFormatState.fontSize}px` 
                      }}
                    >
                      Sample text with current font settings
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Scheme Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Color Scheme</h4>
                <div className="space-y-3">
                  {currentFormatState.customColors && Object.entries(currentFormatState.customColors).map(([key, color]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{key}:</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-sm font-mono text-gray-900">{color}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gantt Preview Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Gantt Preview</h4>
                <div className="space-y-2">
                  {/* Sample Gantt bars */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-16">Critical:</span>
                    <div 
                      className="h-4 rounded"
                      style={{ 
                        backgroundColor: currentFormatState.customColors?.critical || '#ef4444',
                        width: '60px',
                        height: `${currentFormatState.barHeight}px`
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-16">Normal:</span>
                    <div 
                      className="h-4 rounded"
                      style={{ 
                        backgroundColor: currentFormatState.customColors?.normal || '#3b82f6',
                        width: '80px',
                        height: `${currentFormatState.barHeight}px`
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-16">Completed:</span>
                    <div 
                      className="h-4 rounded"
                      style={{ 
                        backgroundColor: currentFormatState.customColors?.completed || '#10b981',
                        width: '40px',
                        height: `${currentFormatState.barHeight}px`
                      }}
                    ></div>
                  </div>
                  {currentFormatState.showMilestoneAsDiamond && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 w-16">Milestone:</span>
                      <div 
                        className="w-4 h-4 transform rotate-45"
                        style={{ 
                          backgroundColor: currentFormatState.customColors?.critical || '#ef4444'
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Operation Log */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Operation Log</h3>
            <div className="bg-gray-900 text-purple-400 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-sm">
              {operationLog.length === 0 ? (
                <p className="text-gray-500">No operations logged yet</p>
              ) : (
                operationLog.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatTabTest; 