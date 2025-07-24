import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { taskCommentsService, TaskHistoryEntry } from '../../services/taskCommentsService';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';

interface TaskHistoryTabProps {
  taskId: string;
  projectId: string;
  isDemoMode?: boolean;
}

const TaskHistoryTab: React.FC<TaskHistoryTabProps> = ({
  taskId,
  projectId,
  isDemoMode: propIsDemoMode
}) => {
  const { canAccess } = usePermissions();
  const [historyEntries, setHistoryEntries] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const canView = canAccess('programme.audit.view');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      if (propIsDemoMode !== undefined) {
        setIsDemoMode(propIsDemoMode);
      } else {
        const isDemo = await demoModeService.isDemoMode();
        setIsDemoMode(isDemo);
      }
    };
    checkDemoMode();
  }, [propIsDemoMode]);

  // Load history on mount
  useEffect(() => {
    if (taskId && canView) {
      loadHistory();
    }
  }, [taskId, canView]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await taskCommentsService.getTaskHistory(taskId);
      
      if (result.success && result.entries) {
        setHistoryEntries(result.entries);
      } else {
        setError(result.error || 'Failed to load history');
      }
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatFieldName = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      'name': 'Task Name',
      'startDate': 'Start Date',
      'endDate': 'End Date',
      'statusId': 'Status',
      'description': 'Description',
      'progress': 'Progress',
      'percentComplete': 'Progress',
      'tags': 'Tags',
      'type': 'Task Type',
      'priority': 'Priority',
      'assignedTo': 'Assigned To',
      'constraintType': 'Constraint Type',
      'constraintDate': 'Constraint Date',
      'deadline': 'Deadline',
      'wbsNumber': 'WBS Number',
      'level': 'Level',
      'actualStartDate': 'Actual Start Date',
      'actualFinishDate': 'Actual Finish Date'
    };

    return fieldMap[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatValue = (value: string | undefined): string => {
    if (value === undefined || value === null) {
      return 'Not set';
    }

    // Try to parse dates
    if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        // If date parsing fails, return as is
      }
    }

    // Handle boolean values
    if (value === 'true') return 'Yes';
    if (value === 'false') return 'No';

    // Handle empty strings
    if (value === '') return 'Empty';

    return value;
  };

  const getChangeIcon = (fieldChanged: string): string => {
    const iconMap: Record<string, string> = {
      'name': '📝',
      'startDate': '📅',
      'endDate': '📅',
      'statusId': '🔄',
      'description': '📄',
      'progress': '📊',
      'percentComplete': '📊',
      'tags': '🏷️',
      'type': '📋',
      'priority': '⚡',
      'assignedTo': '👤',
      'constraintType': '🔒',
      'constraintDate': '📅',
      'deadline': '⏰',
      'wbsNumber': '🔢',
      'level': '📊',
      'actualStartDate': '▶️',
      'actualFinishDate': '🏁'
    };

    return iconMap[fieldChanged] || '🔄';
  };

  if (!canView) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">You don't have permission to view task history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Task History
        </h3>
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Demo Mode - Last 3 changes</span>
            </div>
          )}
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* History list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading history...</p>
        </div>
      ) : historyEntries.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No history available for this task</p>
          <p className="text-sm text-gray-400 mt-1">
            Changes to this task will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyEntries.map((entry) => (
            <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {/* Change Icon */}
                <div className="flex-shrink-0">
                  <span className="text-2xl">
                    {getChangeIcon(entry.fieldChanged)}
                  </span>
                </div>

                {/* Change Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {formatFieldName(entry.fieldChanged)} updated
                    </h4>
                    {entry.demo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        DEMO
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">"{formatValue(entry.previousValue)}"</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600">"{formatValue(entry.newValue)}"</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      By {isDemoMode ? 'Demo User' : 'Unknown User'}
                    </span>
                    <span>•</span>
                    <span>{taskCommentsService.formatTimestamp(entry.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo mode info */}
      {isDemoMode && historyEntries.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Demo Mode Active</p>
              <p className="mt-1">
                Only the last 3 changes are shown. Upgrade to see full audit history.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskHistoryTab; 