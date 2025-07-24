import React, { useState, useRef } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface ParsedProgramme {
  calendars: any[];
  constraints: any[];
  demo?: boolean;
  importedFrom: 'asta';
  projectName: string;
  resources: any[];
  sampleTasks: any[];
  taskCount: number;
}

interface ImportAstaModalProps {
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsedData: ParsedProgramme) => void;
}

const ImportAstaModal: React.FC<ImportAstaModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isDemoMode = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProgramme | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  const handleFileSelect = async (file: File) => {
    if (!canEdit) return;

    // Validate file type
    const validExtensions = ['.pp', '.xml', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Please select a valid Asta file (.pp, .xml, or .csv)');
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      // Parse the file (this would be implemented in the service)
      const parsed = await parseAstaFile(file);
      setParsedData(parsed);
    } catch (error) {
      console.error('Failed to parse Asta file:', error);
      alert('Failed to parse the selected file. Please ensure it\'s a valid Asta programme file.');
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const parseAstaFile = async (file: File): Promise<ParsedProgramme> => {
    // This is a placeholder implementation
    // In a real app, this would parse the actual Asta file format
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        // Simulate parsing (replace with actual Asta parser)
        const mockParsedData: ParsedProgramme = {
          projectName: file.name.replace(/\.[^/.]+$/, ''),
          taskCount: Math.floor(Math.random() * 50) + 10,
          sampleTasks: [
            { id: '1', name: 'Project Setup', duration: 5, startDate: '2024-01-01' },
            { id: '2', name: 'Design Phase', duration: 15, startDate: '2024-01-06' },
            { id: '3', name: 'Construction', duration: 30, startDate: '2024-01-21' }
          ],
          constraints: [
            { type: 'start', taskId: '1', date: '2024-01-01' }
          ],
          calendars: [
            { id: '1', name: 'Standard Calendar', workingDays: [1, 2, 3, 4, 5] }
          ],
          resources: [
            { id: '1', name: 'Project Manager', type: 'labor' }
          ],
          importedFrom: 'asta',
          demo: isDemoMode
        };
        
        resolve(mockParsedData);
      };
      reader.readAsText(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !canEdit) return;

    setIsLoading(true);
    try {
      await onImport(parsedData);
      onClose();
    } catch (error) {
      console.error('Failed to import Asta data:', error);
      alert('Failed to import the programme data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setParsedData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ArrowUpTrayIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import from Asta</h2>
              <p className="text-sm text-gray-500">Upload and convert Asta programme file</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!canEdit ? (
            <div className="text-center text-gray-500">
              <p className="text-sm">You don't have permission to import programmes.</p>
            </div>
          ) : !selectedFile ? (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your Asta file here
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pp,.xml,.csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Supported Formats */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Formats</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Asta PowerProject (.pp)</div>
                  <div>• XML Export (.xml)</div>
                  <div>• CSV Export (.csv)</div>
                </div>
              </div>

              {/* Demo Mode Warning */}
              {isDemoMode && (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">Demo Mode</h4>
                  <p className="text-sm text-yellow-800">
                    You're currently in demo mode. Imported data will be tagged as demo and cleared when switching to live mode.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Preview */}
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">{selectedFile.name}</h4>
                    <p className="text-sm text-blue-800">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>

              {/* Parsed Data Preview */}
              {parsedData && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Import Preview</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm font-medium text-gray-900">Project Name</div>
                      <div className="text-sm text-gray-600">{parsedData.projectName}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm font-medium text-gray-900">Tasks</div>
                      <div className="text-sm text-gray-600">{parsedData.taskCount} tasks</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm font-medium text-gray-900 mb-2">Sample Tasks</div>
                    <div className="space-y-2">
                      {parsedData.sampleTasks.map((task, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {task.id}. {task.name} ({task.duration} days)
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <div className="text-sm font-medium text-gray-900">{parsedData.constraints.length}</div>
                      <div className="text-xs text-gray-600">Constraints</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <div className="text-sm font-medium text-gray-900">{parsedData.calendars.length}</div>
                      <div className="text-xs text-gray-600">Calendars</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <div className="text-sm font-medium text-gray-900">{parsedData.resources.length}</div>
                      <div className="text-xs text-gray-600">Resources</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            {canEdit && parsedData && (
              <button
                onClick={handleImport}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Importing...' : 'Import Programme'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportAstaModal; 