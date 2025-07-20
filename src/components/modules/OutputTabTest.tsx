import React, { useState, useEffect } from 'react';
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  EyeIcon,
  PhotoIcon,
  DocumentTextIcon,
  CogIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { outputTabService } from '../../services/outputTabService';
import type { OutputOperation, PrintProfile, OutputState } from './ribbonTabs/OutputTab';

const OutputTabTest: React.FC = () => {
  const [outputState, setOutputState] = useState<OutputState>({
    selectedProfile: 'default',
    exportFormat: 'pdf',
    pageRange: { start: 1, end: 1, custom: false },
    includeLegend: true,
    includeGrid: true,
    includeTimeline: true,
    quality: 'normal',
    showPreview: false
  });

  const [availableProfiles, setAvailableProfiles] = useState<PrintProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastOperation, setLastOperation] = useState<string>('');

  // Load available profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const profiles = await outputTabService.getAvailablePrintProfiles();
      setAvailableProfiles(profiles);
    } catch (error) {
      console.warn('Failed to load profiles:', error);
    }
  };

  const handleOutputOperation = async (operation: OutputOperation) => {
    setIsLoading(true);
    setLastOperation(`${operation.type}: ${JSON.stringify(operation.data)}`);
    
    try {
      await outputTabService.handleOutputOperation(operation);
      console.log('Output operation completed:', operation);
    } catch (error) {
      console.error('Output operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (newState: Partial<OutputState>) => {
    setOutputState(prev => ({ ...prev, ...newState }));
  };

  // Export format options
  const exportFormats = [
    { id: 'pdf', label: 'PDF', icon: DocumentTextIcon, description: 'Portable Document Format' },
    { id: 'png', label: 'PNG', icon: PhotoIcon, description: 'Portable Network Graphics' },
    { id: 'jpg', label: 'JPG', icon: PhotoIcon, description: 'JPEG Image Format' }
  ];

  // Quality options
  const qualityOptions = [
    { id: 'draft', label: 'Draft', description: 'Fast, lower quality' },
    { id: 'normal', label: 'Normal', description: 'Balanced quality and speed' },
    { id: 'high', label: 'High', description: 'Best quality, slower' }
  ];

  // Page range options
  const pageRangeOptions = [
    { id: 'all', label: 'All Pages', description: 'Export all pages' },
    { id: 'current', label: 'Current Page', description: 'Export current page only' },
    { id: 'custom', label: 'Custom Range', description: 'Specify custom page range' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Output Tab Test</h1>
          <p className="text-gray-600">Test the Output tab functionality for Asta PowerProject</p>
        </div>

        {/* Status Bar */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isLoading ? 'Processing...' : 'Ready'}
                </span>
              </div>
              {lastOperation && (
                <div className="text-sm text-gray-500">
                  Last: {lastOperation}
                </div>
              )}
            </div>
            <button
              onClick={loadProfiles}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Profiles
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Print Profiles Group */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PrinterIcon className="w-5 h-5 mr-2 text-blue-600" />
                Print Profiles
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Print Profile Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Print Profile
                </label>
                <select
                  value={outputState.selectedProfile}
                  onChange={(e) => handleStateChange({ selectedProfile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default Profile</option>
                  {availableProfiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Profile Button */}
              <button
                onClick={() => handleOutputOperation({ 
                  type: 'save-profile', 
                  data: { action: 'save' } 
                })}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Save Profile
              </button>

              {/* Manage Profiles Button */}
              <button
                onClick={() => handleOutputOperation({ 
                  type: 'save-profile', 
                  data: { action: 'manage' } 
                })}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                Manage Profiles
              </button>
            </div>
          </div>

          {/* Export Options Group */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentArrowDownIcon className="w-5 h-5 mr-2 text-blue-600" />
                Export Options
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {exportFormats.map(format => (
                    <button
                      key={format.id}
                      onClick={() => {
                        handleOutputOperation({ 
                          type: 'export-format', 
                          data: { format: format.id } 
                        });
                        handleStateChange({ exportFormat: format.id });
                      }}
                      className={`p-2 rounded-md border transition-colors ${
                        outputState.exportFormat === format.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <format.icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <select
                  value={outputState.quality}
                  onChange={(e) => {
                    handleOutputOperation({ 
                      type: 'export-format', 
                      data: { quality: e.target.value } 
                    });
                    handleStateChange({ quality: e.target.value as any });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {qualityOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show Preview Toggle */}
              <button
                onClick={() => {
                  const newValue = !outputState.showPreview;
                  handleOutputOperation({ 
                    type: 'show-preview', 
                    data: { show: newValue } 
                  });
                  handleStateChange({ showPreview: newValue });
                }}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  outputState.showPreview
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Show Preview
              </button>
            </div>
          </div>

          {/* Content Options Group */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Content Options
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Include Legend Toggle */}
              <button
                onClick={() => {
                  const newValue = !outputState.includeLegend;
                  handleOutputOperation({ 
                    type: 'include-legend', 
                    data: { include: newValue } 
                  });
                  handleStateChange({ includeLegend: newValue });
                }}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  outputState.includeLegend
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Include Legend
              </button>

              {/* Include Grid Toggle */}
              <button
                onClick={() => {
                  const newValue = !outputState.includeGrid;
                  handleOutputOperation({ 
                    type: 'include-legend', 
                    data: { includeGrid: newValue } 
                  });
                  handleStateChange({ includeGrid: newValue });
                }}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  outputState.includeGrid
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Include Grid
              </button>

              {/* Include Timeline Toggle */}
              <button
                onClick={() => {
                  const newValue = !outputState.includeTimeline;
                  handleOutputOperation({ 
                    type: 'include-legend', 
                    data: { includeTimeline: newValue } 
                  });
                  handleStateChange({ includeTimeline: newValue });
                }}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  outputState.includeTimeline
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Include Timeline
              </button>
            </div>
          </div>

          {/* Page Range Group */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                Page Range
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Page Range Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Range
                </label>
                <div className="space-y-2">
                  {pageRangeOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOutputOperation({ 
                        type: 'page-range', 
                        data: { range: option.id } 
                      })}
                      className="w-full text-left p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Setup Button */}
              <button
                onClick={() => handleOutputOperation({ 
                  type: 'page-range', 
                  data: { action: 'page-setup' } 
                })}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                Page Setup
              </button>
            </div>
          </div>

          {/* Export Actions Group */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentArrowDownIcon className="w-5 h-5 mr-2 text-blue-600" />
                Export Actions
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Export Now Button */}
              <button
                onClick={() => handleOutputOperation({ 
                  type: 'print-export', 
                  data: { action: 'export' } 
                })}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export Now
              </button>

              {/* Print Now Button */}
              <button
                onClick={() => handleOutputOperation({ 
                  type: 'print-export', 
                  data: { action: 'print' } 
                })}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print Now
              </button>

              {/* Batch Export Button */}
              <button
                onClick={() => handleOutputOperation({ 
                  type: 'print-export', 
                  data: { action: 'batch' } 
                })}
                className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Batch Export
              </button>
            </div>
          </div>

          {/* Current State Display */}
          <div className="bg-white rounded-lg shadow-sm border lg:col-span-2 xl:col-span-3">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Current Output State</h3>
            </div>
            <div className="p-4">
              <pre className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(outputState, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputTabTest; 