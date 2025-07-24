import React, { useState, useEffect } from 'react';
import { 
  FlagIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { programmeTaskFlagsService, type ProgrammeTaskFlag } from '../../services/programmeTaskFlagsService';
import { demoModeService } from '../../services/demoModeService';

interface TaskNotesTabProps {
  taskId: string;
  projectId: string;
  isDemoMode: boolean;
}

const TaskNotesTab: React.FC<TaskNotesTabProps> = ({
  taskId,
  projectId,
  isDemoMode
}) => {
  const { canAccess } = usePermissions();
  const [flag, setFlag] = useState<ProgrammeTaskFlag | null>(null);
  const [note, setNote] = useState('');
  const [flagColor, setFlagColor] = useState<'red' | 'yellow' | 'green' | 'blue'>('blue');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = canAccess('programme.flag.edit');
  const canView = canAccess('programme.flag.view');

  // Load existing flag on mount
  useEffect(() => {
    if (taskId && canView) {
      loadFlag();
    }
  }, [taskId, canView]);

  const loadFlag = async () => {
    try {
      setLoading(true);
      const existingFlag = await programmeTaskFlagsService.getFlagForTask(taskId);
      if (existingFlag) {
        setFlag(existingFlag);
        setNote(existingFlag.note);
        setFlagColor(existingFlag.flagColor);
      }
    } catch (error) {
      console.error('Error loading flag:', error);
      setError('Failed to load flag');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit || !note.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const result = await programmeTaskFlagsService.addOrUpdateFlag(
        taskId,
        projectId,
        flagColor,
        note.trim()
      );

      if (result.success && result.flag) {
        setFlag(result.flag);
        // Show success message or update UI
        console.log('Flag saved successfully');
      } else {
        setError(result.error || 'Failed to save flag');
      }
    } catch (error) {
      console.error('Error saving flag:', error);
      setError('Failed to save flag');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!canEdit) return;

    try {
      setSaving(true);
      const result = await programmeTaskFlagsService.removeFlag(taskId);
      
      if (result.success) {
        setFlag(null);
        setNote('');
        setFlagColor('blue');
        console.log('Flag removed successfully');
      } else {
        setError(result.error || 'Failed to remove flag');
      }
    } catch (error) {
      console.error('Error removing flag:', error);
      setError('Failed to remove flag');
    } finally {
      setSaving(false);
    }
  };

  const getFlagColorIcon = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    const icons = {
      red: ExclamationTriangleIcon,
      yellow: ClockIcon,
      green: CheckCircleIcon,
      blue: InformationCircleIcon
    };
    return icons[color];
  };

  const getFlagColorClass = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    const classes = {
      red: 'ring-red-500 bg-red-50 border-red-200',
      yellow: 'ring-yellow-500 bg-yellow-50 border-yellow-200',
      green: 'ring-green-500 bg-green-50 border-green-200',
      blue: 'ring-blue-500 bg-blue-50 border-blue-200'
    };
    return classes[color];
  };

  const getFlagColorTextClass = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    const classes = {
      red: 'text-red-700',
      yellow: 'text-yellow-700',
      green: 'text-green-700',
      blue: 'text-blue-700'
    };
    return classes[color];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading flag...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Demo Mode Restrictions:</p>
              <ul className="mt-1 space-y-1">
                {programmeTaskFlagsService.getDemoModeRestrictions().map((restriction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Current Flag Display */}
      {flag && (
        <div className={`border rounded-md p-4 ${getFlagColorClass(flag.flagColor)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full ring-2 ring-${flag.flagColor}-500 mt-1`} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`font-medium ${getFlagColorTextClass(flag.flagColor)}`}>
                    {programmeTaskFlagsService.getFlagColorDisplayName(flag.flagColor)} Flag
                  </span>
                  {flag.demo && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      DEMO
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{flag.note}</p>
                <div className="text-xs text-gray-500">
                  By {isDemoMode ? 'Demo User' : flag.createdBy} • {flag.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
            {canEdit && (
              <button
                onClick={handleRemove}
                disabled={saving}
                className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                title="Remove flag"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Flag Editor */}
      {canEdit && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">
            {flag ? 'Edit Flag' : 'Add Flag'}
          </h4>

          {/* Flag Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flag Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(['red', 'yellow', 'green', 'blue'] as const).map((color) => {
                const IconComponent = getFlagColorIcon(color);
                return (
                  <button
                    key={color}
                    onClick={() => setFlagColor(color)}
                    className={`flex items-center space-x-2 p-3 border rounded-md transition-colors ${
                      flagColor === color
                        ? `${getFlagColorClass(color)} border-2`
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ring-2 ring-${color}-500`} />
                    <IconComponent className={`w-4 h-4 text-${color}-600`} />
                    <span className="text-sm font-medium capitalize">{color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note {isDemoMode && <span className="text-yellow-600">(Max 100 characters)</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              maxLength={isDemoMode ? 100 : undefined}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : ''
              }`}
              placeholder="Enter your note here..."
              disabled={saving}
            />
            {isDemoMode && (
              <div className="text-xs text-gray-500 mt-1">
                {note.length}/100 characters
              </div>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={!note.trim() || saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : flag ? 'Update Flag' : 'Add Flag'}
            </button>
            {flag && (
              <button
                onClick={handleRemove}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Flag
              </button>
            )}
          </div>
        </div>
      )}

      {/* No Permission Message */}
      {!canView && (
        <div className="text-center py-8 text-gray-500">
          <FlagIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>You don't have permission to view flags and notes</p>
        </div>
      )}
    </div>
  );
};

export default TaskNotesTab; 