import React from 'react';
import { ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface TwoWaySyncSectionProps {
  disabled?: boolean;
  lastSyncTime?: string;
  loading?: {
    log?: boolean;
    sync?: boolean;
  };
  onSyncWithAsta: () => void;
  onViewSyncLog: () => void;
  syncStatus?: 'success' | 'error' | 'pending' | 'none';
}

const TwoWaySyncSection: React.FC<TwoWaySyncSectionProps> = ({
  onSyncWithAsta,
  onViewSyncLog,
  lastSyncTime,
  syncStatus = 'none',
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();

  const canImport = canAccess('programme.import');
  const isDisabled = disabled || !canImport;

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'pending':
        return '⟳';
      default:
        return '';
    }
  };

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <button
          onClick={onSyncWithAsta}
          disabled={isDisabled || loading.sync}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.sync
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Sync project with Asta Powerproject"
        >
          <ArrowPathIcon className={`w-5 h-5 ${getSyncStatusColor()}`} />
          {syncStatus !== 'none' && (
            <span className="text-xs font-bold mt-1">{getSyncStatusIcon()}</span>
          )}
          {loading.sync && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onViewSyncLog}
          disabled={isDisabled || loading.log}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.log
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="View recent sync attempts"
        >
          <DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {lastSyncTime && (
            <span className="text-xs text-gray-500 mt-1" title={lastSyncTime}>
              {new Date(lastSyncTime).toLocaleDateString()}
            </span>
          )}
          {loading.log && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        2-Way Sync
      </div>
    </section>
  );
};

export default TwoWaySyncSection; 