import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type PageLayout = 'A4P' | 'A4L' | 'A3L';
export type ExportTheme = 'default' | 'monochrome' | 'light' | 'dark' | 'custom';

interface ExportPreviewModalProps {
  exportTheme: ExportTheme;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'png' | 'jpg') => void;
  pageLayout: PageLayout;
  projectName: string;
}

const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  pageLayout,
  exportTheme,
  projectName,
  onExport,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [previewScale, setPreviewScale] = useState(0.5);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const canExport = canAccess('programme.export.view');

  useEffect(() => {
    if (isOpen) {
      setIsGeneratingPreview(true);
      // Simulate preview generation
      setTimeout(() => setIsGeneratingPreview(false), 1000);
    }
  }, [isOpen, pageLayout, exportTheme]);

  const getLayoutDimensions = () => {
    switch (pageLayout) {
      case 'A4P':
        return { width: 210, height: 297, orientation: 'Portrait' };
      case 'A4L':
        return { width: 297, height: 210, orientation: 'Landscape' };
      case 'A3L':
        return { width: 420, height: 297, orientation: 'Landscape' };
      default:
        return { width: 210, height: 297, orientation: 'Portrait' };
    }
  };

  const getThemeStyles = () => {
    switch (exportTheme) {
      case 'monochrome':
        return {
          background: '#ffffff',
          text: '#000000',
          border: '#000000',
          accent: '#666666'
        };
      case 'light':
        return {
          background: '#ffffff',
          text: '#374151',
          border: '#e5e7eb',
          accent: '#3b82f6'
        };
      case 'dark':
        return {
          background: '#1f2937',
          text: '#f9fafb',
          border: '#4b5563',
          accent: '#60a5fa'
        };
      default:
        return {
          background: '#ffffff',
          text: '#374151',
          border: '#e5e7eb',
          accent: '#3b82f6'
        };
    }
  };

  const dimensions = getLayoutDimensions();
  const theme = getThemeStyles();

  const handleExport = (format: 'pdf' | 'png' | 'jpg') => {
    if (canExport && !loading) {
      onExport(format);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <DocumentIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Export Preview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* Preview Panel */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Layout: {dimensions.width} × {dimensions.height} mm ({dimensions.orientation})
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Theme: {exportTheme.charAt(0).toUpperCase() + exportTheme.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Scale:</label>
                <select
                  value={previewScale}
                  onChange={(e) => setPreviewScale(Number(e.target.value))}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                >
                  <option value={0.25}>25%</option>
                  <option value={0.5}>50%</option>
                  <option value={0.75}>75%</option>
                  <option value={1}>100%</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div
                className="border-2 border-gray-300 dark:border-gray-600 shadow-lg"
                style={{
                  width: `${dimensions.width * previewScale}px`,
                  height: `${dimensions.height * previewScale}px`,
                  backgroundColor: theme.background,
                  color: theme.text,
                  transform: 'scale(1)',
                  transformOrigin: 'top left'
                }}
              >
                {isGeneratingPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Generating preview...</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 h-full">
                    {/* Header */}
                    <div className="border-b mb-4 pb-2" style={{ borderColor: theme.border }}>
                      <h1 className="text-lg font-bold mb-1">{projectName}</h1>
                      <p className="text-sm opacity-75">Construction Programme</p>
                      <p className="text-xs opacity-50">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                    
                    {/* Timeline Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Timeline</span>
                        <span style={{ color: theme.accent }}>2024</span>
                      </div>
                      
                      {/* Sample Timeline Bars */}
                      <div className="space-y-1">
                        {['Site Preparation', 'Foundation Work', 'Structural Frame', 'MEP Installation'].map((task, index) => (
                          <div key={task} className="flex items-center space-x-2">
                            <div className="w-24 text-xs truncate">{task}</div>
                            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded relative">
                              <div
                                className="h-full rounded"
                                style={{
                                  backgroundColor: theme.accent,
                                  width: `${20 + (index * 15)}%`,
                                  position: 'absolute',
                                  left: `${index * 10}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="absolute bottom-4 left-4 right-4 text-xs opacity-50 text-center">
                      ConstructBMS - Professional Construction Management
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Export Options Panel */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Export Options
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Export Format
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={!canExport || loading}
                    className="w-full flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <DocumentIcon className="w-5 h-5 text-red-500" />
                    <div className="text-left">
                      <div className="font-medium">PDF Document</div>
                      <div className="text-xs text-gray-500">High quality, print-ready</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('png')}
                    disabled={!canExport || loading}
                    className="w-full flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">PNG Image</div>
                      <div className="text-xs text-gray-500">High resolution image</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('jpg')}
                    disabled={!canExport || loading}
                    className="w-full flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <PrinterIcon className="w-5 h-5 text-green-500" />
                    <div className="text-left">
                      <div className="font-medium">JPG Image</div>
                      <div className="text-xs text-gray-500">Compressed for sharing</div>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Current Settings
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Page Size:</span>
                    <span>{dimensions.width} × {dimensions.height} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orientation:</span>
                    <span>{dimensions.orientation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Theme:</span>
                    <span className="capitalize">{exportTheme}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPreviewModal; 