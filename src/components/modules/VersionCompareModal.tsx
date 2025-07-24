import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { 
  programmeVersioningService, 
  ProgrammeVersion,
  VersionComparison,
  TaskDifference
} from '../services/programmeVersioningService';

interface VersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  versions: ProgrammeVersion[];
  onCompare?: (comparison: VersionComparison) => void;
}

const VersionCompareModal: React.FC<VersionCompareModalProps> = ({
  isOpen,
  onClose,
  projectId,
  versions,
  onCompare
}) => {
  const { canAccess } = usePermissions();
  const [selectedVersionA, setSelectedVersionA] = useState<string>('');
  const [selectedVersionB, setSelectedVersionB] = useState<string>('');
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');

  const canCompare = canAccess('programme.version.compare');

  // Auto-select first two versions if available
  useEffect(() => {
    if (versions.length >= 2 && !selectedVersionA && !selectedVersionB) {
      setSelectedVersionA(versions[0].id);
      setSelectedVersionB(versions[1].id);
    }
  }, [versions, selectedVersionA, selectedVersionB]);

  // Run comparison when versions change
  useEffect(() => {
    if (selectedVersionA && selectedVersionB && selectedVersionA !== selectedVersionB) {
      runComparison();
    }
  }, [selectedVersionA, selectedVersionB]);

  const runComparison = async () => {
    if (!selectedVersionA || !selectedVersionB || selectedVersionA === selectedVersionB) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await programmeVersioningService.compareVersions(selectedVersionA, selectedVersionB);
      if (result) {
        setComparison(result);
        onCompare?.(result);
      } else {
        setError('Failed to compare versions');
      }
    } catch (error: any) {
      console.error('Error comparing versions:', error);
      setError(error.message || 'Failed to compare versions');
    } finally {
      setLoading(false);
    }
  };

  const getVersionById = (id: string): ProgrammeVersion | undefined => {
    return versions.find(v => v.id === id);
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

  const getDifferenceIcon = (type: TaskDifference['type']) => {
    switch (type) {
      case 'added':
        return <PlusIcon className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <MinusIcon className="w-4 h-4 text-red-600" />;
      case 'modified':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'unchanged':
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getDifferenceColor = (type: TaskDifference['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'removed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'modified':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'unchanged':
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return formatDate(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (!isOpen || !canCompare) {
    return null;
  }

  const versionA = getVersionById(selectedVersionA);
  const versionB = getVersionById(selectedVersionB);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Compare Versions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Side-by-side comparison of programme versions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
          </div>
        )}

        {/* Version Selection */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Version A (Left)
            </label>
            <select
              value={selectedVersionA}
              onChange={(e) => setSelectedVersionA(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
            >
              <option value="">Select Version A</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.label} ({formatDate(version.createdAt)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Version B (Right)
            </label>
            <select
              value={selectedVersionB}
              onChange={(e) => setSelectedVersionB(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
            >
              <option value="">Select Version B</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.label} ({formatDate(version.createdAt)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Comparing versions...</span>
          </div>
        )}

        {/* Comparison Results */}
        {comparison && !loading && (
          <div>
            {/* Version Headers */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {versionA?.label}
                </h3>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {versionA && formatDate(versionA.createdAt)}
                  </div>
                  <div>by {versionA?.createdBy}</div>
                  {versionA?.notes && (
                    <div className="mt-2 text-xs">{versionA.notes}</div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  {versionB?.label}
                </h3>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {versionB && formatDate(versionB.createdAt)}
                  </div>
                  <div>by {versionB?.createdBy}</div>
                  {versionB?.notes && (
                    <div className="mt-2 text-xs">{versionB.notes}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {comparison.summary.addedTasks}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Added</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {comparison.summary.removedTasks}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Removed</div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {comparison.summary.modifiedTasks}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Modified</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {comparison.summary.unchangedTasks}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Unchanged</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'summary'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Detailed Changes
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'summary' ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Task Summary
                </h3>
                {comparison.differences.map((difference) => (
                  <div
                    key={difference.taskId}
                    className={`p-3 border rounded-lg ${getDifferenceColor(difference.type)}`}
                  >
                    <div className="flex items-center gap-2">
                      {getDifferenceIcon(difference.type)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {difference.taskName}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        difference.type === 'added' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        difference.type === 'removed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        difference.type === 'modified' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {difference.type.charAt(0).toUpperCase() + difference.type.slice(1)}
                      </span>
                    </div>
                    {difference.changes.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Changes:</span> {difference.changes.length} field(s) modified
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detailed Changes
                </h3>
                {comparison.differences.map((difference) => (
                  <div
                    key={difference.taskId}
                    className={`p-4 border rounded-lg ${getDifferenceColor(difference.type)}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {getDifferenceIcon(difference.type)}
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {difference.taskName}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        difference.type === 'added' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        difference.type === 'removed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        difference.type === 'modified' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {difference.type.charAt(0).toUpperCase() + difference.type.slice(1)}
                      </span>
                    </div>
                    
                    {difference.changes.length > 0 ? (
                      <div className="space-y-2">
                        {difference.changes.map((change, index) => (
                          <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              {change.field}
                            </div>
                            <div className="text-red-600 dark:text-red-400">
                              {formatFieldValue(change.oldValue)}
                            </div>
                            <div className="text-green-600 dark:text-green-400">
                              {formatFieldValue(change.newValue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No field changes detected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Comparison State */}
        {!comparison && !loading && selectedVersionA && selectedVersionB && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Select two different versions to compare</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionCompareModal; 