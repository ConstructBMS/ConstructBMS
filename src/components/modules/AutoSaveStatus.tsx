import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAutoSave } from '../../contexts/AutoSaveContext';

interface AutoSaveStatusProps {
  className?: string;
  compact?: boolean;
  showError?: boolean;
  showTimestamp?: boolean;
}

const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
  className = '',
  showTimestamp = true,
  showError = true,
  compact = false
}) => {
  const { state } = useAutoSave();

  const formatTimestamp = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (state.isSaving) {
      return <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-600" />;
    }
    if (state.lastError) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
    }
    if (state.lastSaved) {
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    }
    return <ClockIcon className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (state.isSaving) {
      return 'Saving...';
    }
    if (state.lastError) {
      return 'Save failed';
    }
    if (state.isDirty) {
      return 'Unsaved changes';
    }
    if (state.lastSaved) {
      return 'All changes saved';
    }
    return 'No changes';
  };

  const getStatusColor = () => {
    if (state.isSaving) return 'text-blue-600';
    if (state.lastError) return 'text-red-600';
    if (state.isDirty) return 'text-yellow-600';
    if (state.lastSaved) return 'text-green-600';
    return 'text-gray-500';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-xs ${getStatusColor()} ${className}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {getStatusIcon()}
      
      <div className="flex flex-col">
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {showTimestamp && state.lastSaved && !state.isSaving && (
          <span className="text-xs text-gray-500">
            at {formatTimestamp(state.lastSaved)}
          </span>
        )}
        
        {showError && state.lastError && (
          <span className="text-xs text-red-600 max-w-xs truncate" title={state.lastError}>
            {state.lastError}
          </span>
        )}
      </div>

      {state.isDirty && !state.isSaving && (
        <div className="flex items-center gap-1 text-xs text-yellow-600">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          <span>{state.pendingChanges.size} pending</span>
        </div>
      )}
    </div>
  );
};

export default AutoSaveStatus; 