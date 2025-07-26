import React, { useState, useEffect } from 'react';
import {
  DocumentDuplicateIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { demoModeService } from '../../../services/demoModeService';
import {
  programmeVersioningService,
  ProgrammeVersion,
} from '../../../services/programmeVersioningService';
import VersionManagerModal from '../VersionManagerModal';
import VersionCompareModal from '../VersionCompareModal';

interface VersionControlsProps {
  currentTasks: Array<{ [key: string]: any; id: string }>;
  onVersionChange?: (version: ProgrammeVersion | null) => void;
  projectId: string;
}

const VersionControls: React.FC<VersionControlsProps> = ({
  projectId,
  currentTasks,
  onVersionChange,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [versions, setVersions] = useState<ProgrammeVersion[]>([]);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showVersionCompare, setShowVersionCompare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);

  const canView = canAccess('programme.version.view');
  const canCreate = canAccess('programme.version.create');
  const canCompare = canAccess('programme.version.compare');
  const canRestore = canAccess('programme.version.restore');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load versions
  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const projectVersions =
        await programmeVersioningService.getProjectVersions(projectId);
      setVersions(projectVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setCreatingSnapshot(true);
      const result = await programmeVersioningService.createVersion(
        projectId,
        `Snapshot ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        currentTasks,
        'Manual snapshot',
        false
      );

      if (result) {
        setVersions(prev => [result, ...prev]);
        onVersionChange?.(result);
      }
    } catch (error: any) {
      console.error('Error creating snapshot:', error);
      alert(error.message || 'Failed to create snapshot');
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleVersionChange = (version: ProgrammeVersion | null) => {
    onVersionChange?.(version);
    loadVersions(); // Refresh the list
  };

  const getDemoModeConfig = () => {
    return programmeVersioningService.getDemoModeConfig();
  };

  if (!canView) {
    return null;
  }

  const demoConfig = getDemoModeConfig();
  const canCreateSnapshot =
    canCreate &&
    (!isDemoMode || versions.length < demoConfig.maxVersionsPerProject);

  return (
    <>
      <div className='flex flex-col items-center min-w-fit'>
        <h3 className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide'>
          Versions
        </h3>
        <div className='flex items-center space-x-1'>
          {/* Save Snapshot Button */}
          <button
            onClick={handleCreateSnapshot}
            disabled={!canCreateSnapshot || creatingSnapshot}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              !canCreateSnapshot || creatingSnapshot
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/40'
            }`}
            title={
              !canCreateSnapshot
                ? isDemoMode
                  ? demoConfig.tooltipMessage
                  : 'No permission to create versions'
                : 'Save current state as snapshot'
            }
          >
            {creatingSnapshot ? (
              <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600'></div>
            ) : (
              <DocumentDuplicateIcon className='w-3 h-3' />
            )}
          </button>

          {/* Compare Versions Button */}
          <button
            onClick={() => setShowVersionCompare(true)}
            disabled={!canCompare || versions.length < 2}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              !canCompare || versions.length < 2
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/40'
            }`}
            title={
              !canCompare
                ? 'No permission to compare versions'
                : versions.length < 2
                  ? 'Need at least 2 versions to compare'
                  : 'Compare two versions'
            }
          >
            <EyeIcon className='w-3 h-3' />
          </button>

          {/* Restore Version Button */}
          <button
            onClick={() => setShowVersionManager(true)}
            disabled={!canRestore || isDemoMode}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              !canRestore || isDemoMode
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/40'
            }`}
            title={
              isDemoMode
                ? demoConfig.tooltipMessage
                : !canRestore
                  ? 'No permission to restore versions'
                  : 'Restore from previous version'
            }
          >
            <ArrowPathIcon className='w-3 h-3' />
          </button>

          {/* Version Manager Button */}
          <button
            onClick={() => setShowVersionManager(true)}
            disabled={!canView}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              !canView
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            title='Manage versions'
          >
            <PlusIcon className='w-3 h-3' />
          </button>
        </div>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className='mt-1 flex items-center gap-1'>
            <ExclamationTriangleIcon className='w-2 h-2 text-yellow-500' />
            <span className='text-xs text-yellow-600 dark:text-yellow-400'>
              {versions.length}/{demoConfig.maxVersionsPerProject}
            </span>
          </div>
        )}
      </div>

      {/* Version Manager Modal */}
      <VersionManagerModal
        isOpen={showVersionManager}
        onClose={() => setShowVersionManager(false)}
        projectId={projectId}
        currentTasks={currentTasks}
        onVersionChange={handleVersionChange}
      />

      {/* Version Compare Modal */}
      <VersionCompareModal
        isOpen={showVersionCompare}
        onClose={() => setShowVersionCompare(false)}
        projectId={projectId}
        versions={versions}
      />
    </>
  );
};

export default VersionControls;
