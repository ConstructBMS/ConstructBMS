import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckIcon, 
  ClockIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  PencilIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { 
  programmeVersioningService, 
  ProgrammeVersion,
  VersionPreferences 
} from '../services/programmeVersioningService';

interface VersionManagerModalProps {
  currentTasks: Array<{ [key: string]: any, id: string; }>;
  isOpen: boolean;
  onClose: () => void;
  onVersionChange?: (version: ProgrammeVersion | null) => void;
  projectId: string;
}

interface CreateVersionFormData {
  label: string;
  notes: string;
}

const VersionManagerModal: React.FC<VersionManagerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentTasks,
  onVersionChange
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [versions, setVersions] = useState<ProgrammeVersion[]>([]);
  const [preferences, setPreferences] = useState<VersionPreferences | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateVersionFormData>({ label: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ label: string; notes: string }>({ label: '', notes: '' });

  const canView = canAccess('programme.version.view');
  const canCreate = canAccess('programme.version.create');
  const canManage = canAccess('programme.version.manage');
  const canRestore = canAccess('programme.version.restore');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load versions and preferences
  useEffect(() => {
    if (isOpen) {
      loadVersions();
      loadPreferences();
    }
  }, [isOpen, projectId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const projectVersions = await programmeVersioningService.getProjectVersions(projectId);
      setVersions(projectVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
      setError('Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await programmeVersioningService.getVersionPreferences('current-user', projectId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleCreateVersion = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await programmeVersioningService.createVersion(
        projectId,
        formData.label.trim() || `Version ${new Date().toLocaleDateString()}`,
        currentTasks,
        formData.notes.trim() || undefined,
        false
      );

      if (result) {
        setVersions(prev => [result, ...prev]);
        setFormData({ label: '', notes: '' });
        setShowCreateForm(false);
        onVersionChange?.(result);
      } else {
        setError('Failed to create version');
      }
    } catch (error: any) {
      console.error('Error creating version:', error);
      setError(error.message || 'Failed to create version');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await programmeVersioningService.deleteVersion(versionId);
      if (result) {
        setVersions(prev => prev.filter(v => v.id !== versionId));
      } else {
        setError('Failed to delete version');
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      setError('Failed to delete version');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will replace all current task data.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await programmeVersioningService.restoreVersion(versionId, projectId);
      if (result) {
        const version = versions.find(v => v.id === versionId);
        onVersionChange?.(version || null);
        onClose();
      } else {
        setError('Failed to restore version');
      }
    } catch (error: any) {
      console.error('Error restoring version:', error);
      setError(error.message || 'Failed to restore version');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVersion = (version: ProgrammeVersion) => {
    setEditingVersion(version.id);
    setEditData({ label: version.label, notes: version.notes || '' });
  };

  const handleSaveEdit = async () => {
    if (!editingVersion) return;

    try {
      setLoading(true);
      setError(null);

      const result = await programmeVersioningService.updateVersion(editingVersion, editData);
      if (result) {
        setVersions(prev => prev.map(v => 
          v.id === editingVersion 
            ? { ...v, label: editData.label, notes: editData.notes }
            : v
        ));
        setEditingVersion(null);
        setEditData({ label: '', notes: '' });
      } else {
        setError('Failed to update version');
      }
    } catch (error) {
      console.error('Error updating version:', error);
      setError('Failed to update version');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingVersion(null);
    setEditData({ label: '', notes: '' });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({ label: '', notes: '' });
    setError(null);
  };

  const getDefaultVersionName = (): string => {
    return `Version ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDemoModeConfig = () => {
    return programmeVersioningService.getDemoModeConfig();
  };

  if (!isOpen || !canView) {
    return null;
  }

  const demoConfig = getDemoModeConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Version Manager
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage programme versions and snapshots
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                Demo Mode: Maximum {demoConfig.maxVersionsPerProject} versions allowed. Version restore is disabled.
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
          </div>
        )}

        {/* Create Version Button */}
        {canCreate && (
          <div className="mb-4">
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={isDemoMode && versions.length >= demoConfig.maxVersionsPerProject}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDemoMode && versions.length >= demoConfig.maxVersionsPerProject
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={
                isDemoMode && versions.length >= demoConfig.maxVersionsPerProject
                  ? demoConfig.tooltipMessage
                  : 'Create new version snapshot'
              }
            >
              <PlusIcon className="w-4 h-4" />
              Save Snapshot
            </button>
          </div>
        )}

        {/* Create Version Form */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Version
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Version Label
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder={getDefaultVersionName()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe what this version represents..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateVersion}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Version'}
                </button>
                <button
                  onClick={handleCancelCreate}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Versions List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Saved Versions ({versions.length})
          </h3>
          
          {loading && versions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <DocumentDuplicateIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No versions saved yet</p>
              <p className="text-sm">Create your first version snapshot to get started</p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingVersion === version.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editData.label}
                          onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        />
                        <textarea
                          value={editData.notes}
                          onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Notes..."
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={loading}
                            className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {version.label}
                          </h4>
                          {version.isAutoSnapshot && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                              Auto
                            </span>
                          )}
                          {version.demo && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                              Demo
                            </span>
                          )}
                        </div>
                        {version.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {version.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(version.createdAt)}
                          </span>
                          <span>by {version.createdBy}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {editingVersion !== version.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditVersion(version)}
                        disabled={!canManage}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Edit version"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestoreVersion(version.id)}
                        disabled={!canRestore || isDemoMode}
                        className={`p-2 transition-colors ${
                          isDemoMode
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                        }`}
                        title={isDemoMode ? demoConfig.tooltipMessage : 'Restore version'}
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        disabled={!canManage}
                        className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        title="Delete version"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionManagerModal; 