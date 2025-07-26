import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  auditTrailService,
  AuditLogEntry,
  AuditLogFilter,
  AuditLogStats,
} from '../../services/auditTrailService';
import { demoModeService } from '../../services/demoModeService';
import { usePermissions } from '../../hooks/usePermissions';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
}

interface FilterPanelProps {
  filter: AuditLogFilter;
  isDemoMode: boolean;
  onClearFilters: () => void;
  onFilterChange: (filter: AuditLogFilter) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onFilterChange,
  onClearFilters,
  isDemoMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actionTypes = [
    'task_create',
    'task_update',
    'task_delete',
    'task_move',
    'task_resize',
    'dependency_create',
    'dependency_delete',
    'milestone_create',
    'milestone_update',
    'flag_create',
    'flag_update',
    'flag_delete',
    'constraint_set',
    'constraint_clear',
    'status_change',
    'progress_update',
    'resource_assign',
    'resource_unassign',
    'structure_change',
    'calendar_update',
  ];

  return (
    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900'
        >
          <FunnelIcon className='w-4 h-4' />
          Filters
          {isExpanded ? (
            <ChevronDownIcon className='w-4 h-4' />
          ) : (
            <ChevronRightIcon className='w-4 h-4' />
          )}
        </button>
        <button
          onClick={onClearFilters}
          className='text-sm text-blue-600 hover:text-blue-800'
        >
          Clear all
        </button>
      </div>

      {isExpanded && (
        <div className='space-y-4'>
          {/* Search */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <div className='relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search in descriptions...'
                value={filter.searchKeyword || ''}
                onChange={e =>
                  onFilterChange({ ...filter, searchKeyword: e.target.value })
                }
                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Action Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Action Type
            </label>
            <select
              value={filter.actionType || ''}
              onChange={e =>
                onFilterChange({
                  ...filter,
                  actionType: e.target.value || undefined,
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>All actions</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>
                  {auditTrailService.getActionTypeDisplayName(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                From Date
              </label>
              <input
                type='date'
                value={
                  filter.dateFrom
                    ? filter.dateFrom.toISOString().split('T')[0]
                    : ''
                }
                onChange={e =>
                  onFilterChange({
                    ...filter,
                    dateFrom: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                To Date
              </label>
              <input
                type='date'
                value={
                  filter.dateTo ? filter.dateTo.toISOString().split('T')[0] : ''
                }
                onChange={e =>
                  onFilterChange({
                    ...filter,
                    dateTo: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Demo Mode Note */}
          {isDemoMode && (
            <div className='text-xs text-yellow-600 bg-yellow-50 p-2 rounded'>
              Note: User filtering is disabled in demo mode
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface DiffViewProps {
  after: any;
  before: any;
  isDemoMode: boolean;
}

const DiffView: React.FC<DiffViewProps> = ({ before, after, isDemoMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isDemoMode) {
    return (
      <div className='text-sm text-gray-500 italic'>
        Demo redacted - Upgrade for full audit history
      </div>
    );
  }

  if (!before && !after) {
    return (
      <div className='text-sm text-gray-500 italic'>No changes recorded</div>
    );
  }

  const renderDiff = () => {
    const changes: string[] = [];

    if (before && after) {
      const allKeys = new Set([
        ...Object.keys(before || {}),
        ...Object.keys(after || {}),
      ]);

      allKeys.forEach(key => {
        const beforeVal = before?.[key];
        const afterVal = after?.[key];

        if (beforeVal !== afterVal) {
          if (beforeVal === undefined) {
            changes.push(
              `<span class="text-green-600">+ ${key}: ${afterVal}</span>`
            );
          } else if (afterVal === undefined) {
            changes.push(
              `<span class="text-red-600">- ${key}: ${beforeVal}</span>`
            );
          } else {
            changes.push(
              `<span class="text-red-600">- ${key}: ${beforeVal}</span>`
            );
            changes.push(
              `<span class="text-green-600">+ ${key}: ${afterVal}</span>`
            );
          }
        }
      });
    } else if (before) {
      changes.push(
        `<span class="text-red-600">- Removed: ${JSON.stringify(before)}</span>`
      );
    } else if (after) {
      changes.push(
        `<span class="text-green-600">+ Added: ${JSON.stringify(after)}</span>`
      );
    }

    return changes;
  };

  const changes = renderDiff();

  if (changes.length === 0) {
    return (
      <div className='text-sm text-gray-500 italic'>No changes detected</div>
    );
  }

  return (
    <div className='space-y-2'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900'
      >
        {isExpanded ? (
          <ChevronDownIcon className='w-4 h-4' />
        ) : (
          <ChevronRightIcon className='w-4 h-4' />
        )}
        {isExpanded ? 'Hide' : 'Show'} Changes ({changes.length})
      </button>

      {isExpanded && (
        <div className='bg-gray-50 rounded-md p-3 space-y-1'>
          {changes.map((change, index) => (
            <div
              key={index}
              className='text-sm font-mono'
              dangerouslySetInnerHTML={{ __html: change }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filter, setFilter] = useState<AuditLogFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { canAccess } = usePermissions();

  useEffect(() => {
    if (isOpen) {
      loadAuditData();
    }
  }, [isOpen, projectId, filter, currentPage]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check permissions
      if (!canAccess('programme.audit.view-all')) {
        setError('You do not have permission to view the full audit trail');
        return;
      }

      // Check demo mode
      const demoMode = await demoModeService.getDemoMode();
      setIsDemoMode(demoMode);

      // Load audit logs with pagination
      const offset = (currentPage - 1) * 50;
      const result = await auditTrailService.getAuditLogs({
        ...filter,
        projectId,
        limit: 50,
        offset,
      });

      if (result.success && result.logs) {
        setLogs(result.logs);
      } else {
        setError(result.error || 'Failed to load audit logs');
      }

      // Load statistics
      const statsResult = await auditTrailService.getAuditStats(projectId);
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (err) {
      console.error('Error loading audit data:', err);
      setError('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const clearFilters = () => {
    setFilter({});
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Project Audit Trail
            </h2>
            {projectName && (
              <p className='text-sm text-gray-600 mt-1'>{projectName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className='bg-yellow-50 border-b border-yellow-200 p-4'>
            <div className='flex items-start space-x-2'>
              <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600 mt-0.5' />
              <div className='text-sm text-yellow-800'>
                <p className='font-medium'>Demo Mode Restrictions:</p>
                <ul className='mt-1 space-y-1'>
                  {auditTrailService
                    .getDemoModeRestrictions()
                    .map((restriction, index) => (
                      <li key={index} className='flex items-start space-x-2'>
                        <span className='text-yellow-600 mt-1'>•</span>
                        <span>{restriction}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className='flex-1 overflow-hidden'>
          <div className='h-full flex'>
            {/* Sidebar */}
            <div className='w-80 border-r border-gray-200 p-4 overflow-y-auto'>
              {/* Statistics */}
              {stats && (
                <div className='mb-6'>
                  <h3 className='text-lg font-medium text-gray-900 mb-3'>
                    Statistics
                  </h3>
                  <div className='space-y-3'>
                    <div className='bg-blue-50 p-3 rounded-lg'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {stats.totalActions}
                      </div>
                      <div className='text-sm text-blue-800'>Total Actions</div>
                    </div>

                    <div className='bg-green-50 p-3 rounded-lg'>
                      <div className='text-sm font-medium text-gray-900 mb-2'>
                        Actions by Type
                      </div>
                      <div className='space-y-1'>
                        {Object.entries(stats.actionsByType)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([type, count]) => (
                            <div
                              key={type}
                              className='flex justify-between text-sm'
                            >
                              <span className='text-gray-600'>
                                {auditTrailService.getActionTypeDisplayName(
                                  type
                                )}
                              </span>
                              <span className='font-medium'>{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <FilterPanel
                filter={filter}
                onFilterChange={setFilter}
                onClearFilters={clearFilters}
                isDemoMode={isDemoMode}
              />
            </div>

            {/* Main Content */}
            <div className='flex-1 flex flex-col'>
              {/* Toolbar */}
              <div className='p-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-gray-600'>
                      {logs.length} log{logs.length !== 1 ? 's' : ''} shown
                    </span>
                    {Object.keys(filter).length > 0 && (
                      <span className='text-sm text-blue-600'>
                        Filtered results
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
                    >
                      Previous
                    </button>
                    <span className='text-sm text-gray-600'>
                      Page {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={logs.length < 50}
                      className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs */}
              <div className='flex-1 overflow-y-auto p-4'>
                {loading ? (
                  <div className='flex items-center justify-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    <span className='ml-2 text-gray-600'>
                      Loading audit logs...
                    </span>
                  </div>
                ) : error ? (
                  <div className='flex items-center justify-center py-8'>
                    <div className='text-center'>
                      <ExclamationTriangleIcon className='w-12 h-12 text-red-500 mx-auto mb-4' />
                      <p className='text-red-600 font-medium'>{error}</p>
                      <button
                        onClick={loadAuditData}
                        className='mt-2 text-blue-600 hover:text-blue-800 text-sm'
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                ) : logs.length === 0 ? (
                  <div className='text-center py-8'>
                    <DocumentTextIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                    <p className='text-gray-500'>No audit logs found</p>
                    <p className='text-sm text-gray-400 mt-1'>
                      {Object.keys(filter).length > 0
                        ? 'Try adjusting your filters'
                        : 'Project changes will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {logs.map(log => (
                      <div
                        key={log.id}
                        className='bg-white border border-gray-200 rounded-lg p-4'
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start space-x-3 flex-1'>
                            {/* Action Icon */}
                            <div className='flex-shrink-0'>
                              <span className='text-2xl'>
                                {auditTrailService.getActionTypeIcon(
                                  log.actionType
                                )}
                              </span>
                            </div>

                            {/* Action Details */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2'>
                                <h4 className='text-sm font-medium text-gray-900'>
                                  {auditTrailService.getActionTypeDisplayName(
                                    log.actionType
                                  )}
                                </h4>
                                {log.demo && (
                                  <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800'>
                                    DEMO
                                  </span>
                                )}
                              </div>

                              <p className='text-sm text-gray-600 mt-1'>
                                {auditTrailService.formatAuditDescription(
                                  log,
                                  isDemoMode
                                )}
                              </p>

                              <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
                                <span>
                                  By {isDemoMode ? 'Demo User' : 'Unknown User'}
                                </span>
                                <span>•</span>
                                <span>{formatTimestamp(log.createdAt)}</span>
                                {log.taskId && (
                                  <>
                                    <span>•</span>
                                    <span className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                                      Task {log.taskId}
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Diff View */}
                              <div className='mt-3'>
                                <DiffView
                                  before={log.before}
                                  after={log.after}
                                  isDemoMode={isDemoMode}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailModal;
