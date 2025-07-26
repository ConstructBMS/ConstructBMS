import React, { useState, useEffect } from 'react';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { undoRedoService } from '../services/undoRedoService';

interface UndoRedoControlsProps {
  onActionRedone?: (action: any) => void;
  onActionUndone?: (action: any) => void;
  projectId: string;
}

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  projectId,
  onActionUndone,
  onActionRedone,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const canEdit = canAccess('programme.task.edit');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load undo/redo state
  useEffect(() => {
    const loadUndoRedoState = async () => {
      try {
        setLoading(true);

        const [undoAvailable, redoAvailable, undoCountValue, redoCountValue] =
          await Promise.all([
            undoRedoService.canUndo(projectId),
            undoRedoService.canRedo(projectId),
            undoRedoService.getUndoCount(projectId),
            undoRedoService.getRedoCount(projectId),
          ]);

        setCanUndo(undoAvailable);
        setCanRedo(redoAvailable);
        setUndoCount(undoCountValue);
        setRedoCount(redoCountValue);
      } catch (error) {
        console.error('Error loading undo/redo state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUndoRedoState();
  }, [projectId]);

  // Handle undo
  const handleUndo = async () => {
    if (!canEdit || !canUndo || loading) return;

    try {
      setLoading(true);

      const result = await undoRedoService.undo(projectId);

      if (result.success && result.action) {
        // Update state
        const [newUndoAvailable, newRedoAvailable, newUndoCount, newRedoCount] =
          await Promise.all([
            undoRedoService.canUndo(projectId),
            undoRedoService.canRedo(projectId),
            undoRedoService.getUndoCount(projectId),
            undoRedoService.getRedoCount(projectId),
          ]);

        setCanUndo(newUndoAvailable);
        setCanRedo(newRedoAvailable);
        setUndoCount(newUndoCount);
        setRedoCount(newRedoCount);

        onActionUndone?.(result.action);
      } else {
        alert(result.error || 'Failed to undo action');
      }
    } catch (error) {
      console.error('Error undoing action:', error);
      alert('Failed to undo action');
    } finally {
      setLoading(false);
    }
  };

  // Handle redo
  const handleRedo = async () => {
    if (!canEdit || !canRedo || loading || isDemoMode) return;

    try {
      setLoading(true);

      const result = await undoRedoService.redo(projectId);

      if (result.success && result.action) {
        // Update state
        const [newUndoAvailable, newRedoAvailable, newUndoCount, newRedoCount] =
          await Promise.all([
            undoRedoService.canUndo(projectId),
            undoRedoService.canRedo(projectId),
            undoRedoService.getUndoCount(projectId),
            undoRedoService.getRedoCount(projectId),
          ]);

        setCanUndo(newUndoAvailable);
        setCanRedo(newRedoAvailable);
        setUndoCount(newUndoCount);
        setRedoCount(newRedoCount);

        onActionRedone?.(result.action);
      } else {
        alert(result.error || 'Failed to redo action');
      }
    } catch (error) {
      console.error('Error redoing action:', error);
      alert('Failed to redo action');
    } finally {
      setLoading(false);
    }
  };

  // Get undo tooltip text
  const getUndoTooltip = (): string => {
    if (!canEdit) return 'Insufficient permissions';
    if (!canUndo) return 'No actions to undo';
    if (isDemoMode)
      return `Undo last timeline action (${undoCount}/5 demo steps)`;
    return `Undo last timeline action (${undoCount} steps available)`;
  };

  // Get redo tooltip text
  const getRedoTooltip = (): string => {
    if (!canEdit) return 'Insufficient permissions';
    if (isDemoMode) return 'Redo not available in demo mode';
    if (!canRedo) return 'No actions to redo';
    return `Redo last undone action (${redoCount} steps available)`;
  };

  // Get undo button class
  const getUndoButtonClass = (): string => {
    const baseClass =
      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200';

    if (!canEdit || !canUndo || loading) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }

    return `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
  };

  // Get redo button class
  const getRedoButtonClass = (): string => {
    const baseClass =
      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200';

    if (!canEdit || !canRedo || loading || isDemoMode) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }

    return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
  };

  return (
    <div className='flex items-center space-x-2'>
      {/* Undo Button */}
      <button
        onClick={handleUndo}
        disabled={!canEdit || !canUndo || loading}
        className={getUndoButtonClass()}
        title={getUndoTooltip()}
      >
        <ArrowUturnLeftIcon className='w-4 h-4' />
        <span>Undo</span>
        {isDemoMode && canUndo && (
          <span className='ml-1 px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded'>
            DEMO
          </span>
        )}
        {undoCount > 0 && (
          <span className='ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded'>
            {undoCount}
          </span>
        )}
      </button>

      {/* Redo Button */}
      <button
        onClick={handleRedo}
        disabled={!canEdit || !canRedo || loading || isDemoMode}
        className={getRedoButtonClass()}
        title={getRedoTooltip()}
      >
        <ArrowUturnRightIcon className='w-4 h-4' />
        <span>Redo</span>
        {redoCount > 0 && !isDemoMode && (
          <span className='ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded'>
            {redoCount}
          </span>
        )}
      </button>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className='px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-md'>
          Demo: Max 5 undo steps
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className='flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md'>
          <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current'></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default UndoRedoControls;
