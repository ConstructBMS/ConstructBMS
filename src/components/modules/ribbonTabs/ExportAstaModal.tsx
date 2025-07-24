import React, { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface AstaExportSettings {
  fileType: 'pp' | 'xml' | 'csv';
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  includeConstraints: boolean;
  includeBaselines: boolean;
  includeNotes: boolean;
  includeResources: boolean;
  includeCalendars: boolean;
  demo?: boolean;
}

interface ExportAstaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: AstaExportSettings) => void;
  projectName?: string;
  isDemoMode?: boolean;
}

const ExportAstaModal: React.FC<ExportAstaModalProps> = ({
  isOpen,
  onClose,
  onExport,
  projectName = 'Project',
  isDemoMode = false
}) => {
  const [settings, setSettings] = useState<AstaExportSettings>({
    fileType: 'xml',
    dateFormat: 'dd/mm/yyyy',
    includeConstraints: true,
    includeBaselines: true,
    includeNotes: true,
    includeResources: true,
    includeCalendars: true,
    demo: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsLoading(true);
    try {
      const exportSettings = {
        ...settings,
        demo: isDemoMode
      };
      await onExport(exportSettings);
      onClose();
    } catch (error) {
      console.error('Failed to export to Asta:', error);
      alert('Failed to export the programme. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const updateSettings = (updates: Partial<AstaExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getFileExtension = () => {
    switch (settings.fileType) {
      case 'pp': return '.pp';
      case 'xml': return '.xml';
      case 'csv': return '.csv';
      default: return '.xml';
    }
  };

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    return `${projectName}_${date}${getFileExtension()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ArrowDownTrayIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export to Asta</h2>
              <p className="text-sm text-gray-500">Save programme as Asta-compatible file</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* File Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                File Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="fileType"
                    value="xml"
                    checked={settings.fileType === 'xml'}
                    onChange={(e) => updateSettings({ fileType: e.target.value as 'xml' })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">XML Export (.xml)</div>
                    <div className="text-sm text-gray-500">Most compatible with Asta PowerProject</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="fileType"
                    value="pp"
                    checked={settings.fileType === 'pp'}
                    onChange={(e) => updateSettings({ fileType: e.target.value as 'pp' })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">PowerProject (.pp)</div>
                    <div className="text-sm text-gray-500">Native Asta PowerProject format</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="fileType"
                    value="csv"
                    checked={settings.fileType === 'csv'}
                    onChange={(e) => updateSettings({ fileType: e.target.value as 'csv' })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">CSV Export (.csv)</div>
                    <div className="text-sm text-gray-500">Comma-separated values format</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
                disabled={!canEdit}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>

            {/* Include Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Include in Export
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeConstraints}
                    onChange={(e) => updateSettings({ includeConstraints: e.target.checked })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Constraints</div>
                    <div className="text-sm text-gray-500">Task constraints and deadlines</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeBaselines}
                    onChange={(e) => updateSettings({ includeBaselines: e.target.checked })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Baselines</div>
                    <div className="text-sm text-gray-500">Project baselines and snapshots</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeNotes}
                    onChange={(e) => updateSettings({ includeNotes: e.target.checked })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Notes</div>
                    <div className="text-sm text-gray-500">Task and project notes</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeResources}
                    onChange={(e) => updateSettings({ includeResources: e.target.checked })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Resources</div>
                    <div className="text-sm text-gray-500">Resource assignments and allocations</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeCalendars}
                    onChange={(e) => updateSettings({ includeCalendars: e.target.checked })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Calendars</div>
                    <div className="text-sm text-gray-500">Working calendars and holidays</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Export Preview */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Export Preview</h4>
              <div className="text-sm text-blue-800">
                <div className="font-mono bg-white px-2 py-1 rounded border">
                  {getFileName()}
                </div>
                <div className="mt-2">
                  <div>Format: {settings.fileType.toUpperCase()}</div>
                  <div>Date Format: {settings.dateFormat}</div>
                  <div>Generated by: ConstructBMS</div>
                </div>
              </div>
            </div>

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to export programmes.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Exporting...' : 'Export Programme'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportAstaModal; 