import React, { useState } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, options: ImportOptions) => void;
  loading?: boolean;
}

interface ImportOptions {
  overwriteExisting: boolean;
  importResources: boolean;
  importCalendars: boolean;
  importNotes: boolean;
}

const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  isOpen,
  onClose,
  onImport,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwriteExisting: false,
    importResources: true,
    importCalendars: true,
    importNotes: true
  });
  const [dragActive, setDragActive] = useState(false);

  const canImport = canAccess('programme.import');

  const handleFileSelect = (file: File) => {
    const validExtensions = ['.pp', '.xml', '.mpp', '.xer'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Please select a valid project file (.pp, .xml, .mpp, .xer)');
      return;
    }
    
    setSelectedFile(file);
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
    if (selectedFile) {
      onImport(selectedFile, importOptions);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportOptions({
      overwriteExisting: false,
      importResources: true,
      importCalendars: true,
      importNotes: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ArrowUpTrayIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Import Project
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* File Upload Area */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Select Project File
              </h3>
              
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
                  ${dragActive
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                  ${selectedFile
                    ? 'border-green-400 bg-green-50 dark:bg-green-900'
                    : ''
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <DocumentIcon className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Drop your project file here
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        or click to browse
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pp,.xml,.mpp,.xer"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                      disabled={!canImport}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`
                        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
                        ${canImport
                          ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Supported formats: Asta Powerproject (.pp), XML (.xml), Microsoft Project (.mpp), Primavera (.xer)
              </div>
            </div>
            
            {/* Import Options */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Import Options
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.overwriteExisting}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      overwriteExisting: e.target.checked
                    })}
                    disabled={!canImport}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Overwrite existing tasks and data
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.importResources}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      importResources: e.target.checked
                    })}
                    disabled={!canImport}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Import resources and assignments
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.importCalendars}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      importCalendars: e.target.checked
                    })}
                    disabled={!canImport}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Import calendars and working times
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.importNotes}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      importNotes: e.target.checked
                    })}
                    disabled={!canImport}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Import task notes and comments
                  </span>
                </label>
              </div>
            </div>
            
            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Import Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Importing will map external project data to ConstructBMS format. 
                      Some data may be transformed or simplified during import.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!canImport || !selectedFile || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Importing...' : 'Import Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportProjectModal; 