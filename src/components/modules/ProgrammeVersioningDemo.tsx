import React, { useState, useEffect } from 'react';
import { 
  DocumentDuplicateIcon,
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';
import { 
  programmeVersioningService, 
  ProgrammeVersion,
  VersionComparison,
  TaskDifference
} from '../../services/programmeVersioningService';
import VersionManagerModal from './VersionManagerModal';
import VersionCompareModal from './VersionCompareModal';

const ProgrammeVersioningDemo: React.FC = () => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [versions, setVersions] = useState<ProgrammeVersion[]>([]);
  const [currentTasks, setCurrentTasks] = useState<Array<{ [key: string]: any, id: string; }>>([]);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showVersionCompare, setShowVersionCompare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [activeVersion, setActiveVersion] = useState<ProgrammeVersion | null>(null);

  const canView = canAccess('programme.version.view');
  const canCreate = canAccess('programme.version.create');
  const canCompare = canAccess('programme.version.compare');
  const canRestore = canAccess('programme.version.restore');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load versions and create sample data
  useEffect(() => {
    loadVersions();
    createSampleTasks();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const projectVersions = await programmeVersioningService.getProjectVersions('demo-project');
      setVersions(projectVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleTasks = () => {
    const sampleTasks = [
      {
        id: 'task-1',
        name: 'Project Planning',
        start_date: '2024-01-15',
        finish_date: '2024-01-30',
        percent_complete: 100,
        status: 'completed',
        priority: 'high',
        assigned_to: 'John Smith',
        description: 'Initial project planning and setup',
        notes: 'Completed ahead of schedule',
        is_milestone: false,
        duration: 15,
        work: 120,
        cost: 15000,
        level: 0,
        wbs_number: '1.0'
      },
      {
        id: 'task-2',
        name: 'Design Phase',
        start_date: '2024-02-01',
        finish_date: '2024-02-28',
        percent_complete: 75,
        status: 'in-progress',
        priority: 'high',
        assigned_to: 'Sarah Johnson',
        description: 'Detailed design and specifications',
        notes: 'Design reviews in progress',
        is_milestone: false,
        duration: 28,
        work: 200,
        cost: 25000,
        level: 0,
        wbs_number: '2.0'
      },
      {
        id: 'task-3',
        name: 'Development Phase',
        start_date: '2024-03-01',
        finish_date: '2024-05-31',
        percent_complete: 25,
        status: 'in-progress',
        priority: 'medium',
        assigned_to: 'Mike Davis',
        description: 'Core development and implementation',
        notes: 'Sprint 1 completed successfully',
        is_milestone: false,
        duration: 92,
        work: 800,
        cost: 100000,
        level: 0,
        wbs_number: '3.0'
      },
      {
        id: 'task-4',
        name: 'Testing Phase',
        start_date: '2024-06-01',
        finish_date: '2024-06-30',
        percent_complete: 0,
        status: 'not-started',
        priority: 'medium',
        assigned_to: 'Lisa Chen',
        description: 'Comprehensive testing and QA',
        notes: 'Test plan prepared',
        is_milestone: false,
        duration: 30,
        work: 150,
        cost: 20000,
        level: 0,
        wbs_number: '4.0'
      },
      {
        id: 'task-5',
        name: 'Project Completion',
        start_date: '2024-07-01',
        finish_date: '2024-07-01',
        percent_complete: 0,
        status: 'not-started',
        priority: 'high',
        assigned_to: 'Project Manager',
        description: 'Final delivery and handover',
        notes: 'Milestone for project completion',
        is_milestone: true,
        duration: 1,
        work: 8,
        cost: 1000,
        level: 0,
        wbs_number: '5.0'
      }
    ];

    setCurrentTasks(sampleTasks);
  };

  const handleCreateSnapshot = async () => {
    try {
      setCreatingSnapshot(true);
      const result = await programmeVersioningService.createVersion(
        'demo-project',
        `Snapshot ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        currentTasks,
        'Manual snapshot from demo',
        false
      );

      if (result) {
        setVersions(prev => [result, ...prev]);
        setActiveVersion(result);
      }
    } catch (error: any) {
      console.error('Error creating snapshot:', error);
      alert(error.message || 'Failed to create snapshot');
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleVersionChange = (version: ProgrammeVersion | null) => {
    setActiveVersion(version);
    loadVersions(); // Refresh the list
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will replace all current task data.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await programmeVersioningService.restoreVersion(versionId, 'demo-project');
      if (result) {
        const version = versions.find(v => v.id === versionId);
        setActiveVersion(version || null);
        alert('Version restored successfully!');
      }
    } catch (error: any) {
      console.error('Error restoring version:', error);
      alert(error.message || 'Failed to restore version');
    } finally {
      setLoading(false);
    }
  };

  const getDemoModeConfig = () => {
    return programmeVersioningService.getDemoModeConfig();
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

  if (!canView) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to view programme versions.
          </p>
        </div>
      </div>
    );
  }

  const demoConfig = getDemoModeConfig();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Programme Versioning Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Experience full version control for programme management with snapshots, comparisons, and restore capabilities.
        </p>
      </div>

      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <span className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                Demo Mode Active
              </span>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                Maximum {demoConfig.maxVersionsPerProject} versions allowed. Version restore is disabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={handleCreateSnapshot}
          disabled={!canCreate || creatingSnapshot || (isDemoMode && versions.length >= demoConfig.maxVersionsPerProject)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            !canCreate || creatingSnapshot || (isDemoMode && versions.length >= demoConfig.maxVersionsPerProject)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title={
            isDemoMode && versions.length >= demoConfig.maxVersionsPerProject
              ? demoConfig.tooltipMessage
              : 'Create new version snapshot'
          }
        >
          {creatingSnapshot ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <DocumentDuplicateIcon className="w-4 h-4" />
          )}
          Save Snapshot
        </button>

        <button
          onClick={() => setShowVersionCompare(true)}
          disabled={!canCompare || versions.length < 2}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            !canCompare || versions.length < 2
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          title="Compare two versions"
        >
          <EyeIcon className="w-4 h-4" />
          Compare Versions
        </button>

        <button
          onClick={() => setShowVersionManager(true)}
          disabled={!canView}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            !canView
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
          title="Manage versions"
        >
          <PlusIcon className="w-4 h-4" />
          Version Manager
        </button>
      </div>

      {/* Current Tasks Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Current Programme State
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {task.name}
                </h3>
                {task.is_milestone && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                    Milestone
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>Status: <span className="font-medium">{task.status}</span></div>
                <div>Progress: <span className="font-medium">{task.percent_complete}%</span></div>
                <div>Duration: <span className="font-medium">{task.duration} days</span></div>
                <div>Assigned: <span className="font-medium">{task.assigned_to}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Versions List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Saved Versions ({versions.length})
          </h2>
          {isDemoMode && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{versions.length}/{demoConfig.maxVersionsPerProject} versions used</span>
            </div>
          )}
        </div>

        {loading ? (
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
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {version.label}
                      </h3>
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
                  
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version Manager Modal */}
      <VersionManagerModal
        isOpen={showVersionManager}
        onClose={() => setShowVersionManager(false)}
        projectId="demo-project"
        currentTasks={currentTasks}
        onVersionChange={handleVersionChange}
      />

      {/* Version Compare Modal */}
      <VersionCompareModal
        isOpen={showVersionCompare}
        onClose={() => setShowVersionCompare(false)}
        projectId="demo-project"
        versions={versions}
      />
    </div>
  );
};

export default ProgrammeVersioningDemo; 