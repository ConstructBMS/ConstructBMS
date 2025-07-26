import React, { useState, useRef, useEffect } from 'react';
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { demoModeService } from '../../../services/demoModeService';
import {
  astaImportExportService,
  ParsedAstaProgramme,
  AstaTask,
} from '../../../services/astaImportExportService';

interface AstaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsedData: ParsedAstaProgramme) => void;
  projectId?: string;
}

interface FieldMapping {
  [key: string]: string;
}

const AstaImportModal: React.FC<AstaImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  projectId = 'demo',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedAstaProgramme | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.import.asta');

  useEffect(() => {
    if (isOpen) {
      checkDemoMode();
    }
  }, [isOpen]);

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.getDemoMode();
    setIsDemoMode(isDemo);
  };

  const handleFileSelect = async (file: File) => {
    if (!canEdit) return;

    // Validate file type
    const validExtensions = ['.pp', '.xml', '.csv', '.mpx', '.json'];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      setError(
        'Please select a valid Asta file (.pp, .xml, .csv, .mpx, or .json)'
      );
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      // Parse the file
      const parsed = await astaImportExportService.parseAstaFile(file);

      // Apply demo mode restrictions
      if (isDemoMode && parsed.tasks.length > 10) {
        setValidationErrors([
          `Demo mode limited to 10 tasks. File contains ${parsed.tasks.length} tasks.`,
          'Only the first 10 tasks will be imported.',
        ]);
        parsed.tasks = parsed.tasks.slice(0, 10);
        parsed.taskCount = 10;
      }

      parsed.demo = isDemoMode;
      setParsedData(parsed);

      // Initialize field mapping
      initializeFieldMapping(parsed);
    } catch (error) {
      console.error('Failed to parse Asta file:', error);
      setError(
        "Failed to parse the selected file. Please ensure it's a valid Asta programme file."
      );
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFieldMapping = (data: ParsedAstaProgramme) => {
    if (data.tasks.length > 0) {
      const firstTask = data.tasks[0];
      const mapping: FieldMapping = {
        'Task ID': 'id',
        'Task Name': 'name',
        'Start Date': 'startDate',
        'Finish Date': 'finishDate',
        Duration: 'duration',
        Progress: 'percentComplete',
        'Is Milestone': 'isMilestone',
        Dependencies: 'dependencies',
        'Calendar ID': 'calendarId',
        'Structure Level': 'structureLevel',
      };
      setFieldMapping(mapping);
    }
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (parsedData) {
      onImport(parsedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedData(null);
    setShowPreview(false);
    setFieldMapping({});
    setError(null);
    setValidationErrors([]);
    onClose();
  };

  const updateFieldMapping = (field: string, value: string) => {
    setFieldMapping(prev => ({ ...prev, [field]: value }));
  };

  const getTaskPreview = () => {
    if (!parsedData || parsedData.tasks.length === 0) return [];
    return parsedData.tasks.slice(0, 5); // Show first 5 tasks
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <DocumentTextIcon className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Import from Asta PowerProject
            </h2>
            {isDemoMode && (
              <span className='px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md font-medium'>
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
          {!canEdit && (
            <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <ExclamationTriangleIcon className='w-5 h-5 text-red-500' />
                <span className='text-red-700 dark:text-red-300 font-medium'>
                  You don't have permission to import Asta files
                </span>
              </div>
            </div>
          )}

          {isDemoMode && (
            <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <InformationCircleIcon className='w-5 h-5 text-blue-500' />
                <span className='text-blue-700 dark:text-blue-300'>
                  Demo mode: Import limited to 10 tasks maximum
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <ExclamationTriangleIcon className='w-5 h-5 text-red-500' />
                <span className='text-red-700 dark:text-red-300'>{error}</span>
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className='mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
              <div className='space-y-2'>
                {validationErrors.map((error, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <ExclamationTriangleIcon className='w-4 h-4 text-yellow-500' />
                    <span className='text-yellow-700 dark:text-yellow-300 text-sm'>
                      {error}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Section */}
          {!parsedData && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                  Upload Asta File
                </h3>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {isLoading ? (
                    <div className='space-y-3'>
                      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Parsing Asta file...
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <ArrowUpTrayIcon className='w-12 h-12 text-gray-400 mx-auto' />
                      <div>
                        <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          Drop your Asta file here
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          or click to browse
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='.pp,.xml,.csv,.mpx,.json'
                        onChange={handleFileInput}
                        className='hidden'
                        disabled={!canEdit}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!canEdit}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                          canEdit
                            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                </div>

                <div className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
                  Supported formats: Asta PowerProject (.pp), XML (.xml), CSV
                  (.csv), MPX (.mpx), JSON (.json)
                </div>
              </div>
            </div>
          )}

          {/* Preview and Field Mapping Section */}
          {parsedData && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Import Preview
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className='flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                >
                  <EyeIcon className='w-4 h-4' />
                  <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                </button>
              </div>

              {/* File Information */}
              <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      File Name:
                    </span>
                    <span className='ml-2 text-gray-900 dark:text-white'>
                      {selectedFile?.name}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      Project Name:
                    </span>
                    <span className='ml-2 text-gray-900 dark:text-white'>
                      {parsedData.projectName}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      Total Tasks:
                    </span>
                    <span className='ml-2 text-gray-900 dark:text-white'>
                      {parsedData.taskCount}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      File Size:
                    </span>
                    <span className='ml-2 text-gray-900 dark:text-white'>
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Field Mapping */}
              <div>
                <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
                  Field Mapping
                </h4>
                <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    {Object.entries(fieldMapping).map(
                      ([field, mappedField]) => (
                        <div
                          key={field}
                          className='flex items-center justify-between'
                        >
                          <span className='font-medium text-gray-700 dark:text-gray-300'>
                            {field}:
                          </span>
                          <span className='text-gray-900 dark:text-white'>
                            {mappedField}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Task Preview */}
              {showPreview && (
                <div>
                  <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
                    Task Preview (First 5 tasks)
                  </h4>
                  <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'>
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                        <thead className='bg-gray-50 dark:bg-gray-700'>
                          <tr>
                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                              Task
                            </th>
                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                              Start Date
                            </th>
                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                              Duration
                            </th>
                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                              Progress
                            </th>
                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                              Milestone
                            </th>
                          </tr>
                        </thead>
                        <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                          {getTaskPreview().map((task, index) => (
                            <tr
                              key={index}
                              className='hover:bg-gray-50 dark:hover:bg-gray-700'
                            >
                              <td className='px-4 py-3 text-sm text-gray-900 dark:text-white'>
                                {task.name}
                              </td>
                              <td className='px-4 py-3 text-sm text-gray-900 dark:text-white'>
                                {new Date(task.startDate).toLocaleDateString()}
                              </td>
                              <td className='px-4 py-3 text-sm text-gray-900 dark:text-white'>
                                {task.duration} days
                              </td>
                              <td className='px-4 py-3 text-sm text-gray-900 dark:text-white'>
                                {task.percentComplete}%
                              </td>
                              <td className='px-4 py-3 text-sm text-gray-900 dark:text-white'>
                                {task.isMilestone ? (
                                  <CheckCircleIcon className='w-4 h-4 text-green-500' />
                                ) : (
                                  <span className='text-gray-400'>-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!parsedData || !canEdit}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              parsedData && canEdit
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Import Programme
          </button>
        </div>
      </div>
    </div>
  );
};

export default AstaImportModal;
