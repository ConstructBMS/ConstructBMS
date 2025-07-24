import React, { useState, useEffect } from 'react';
import { 
  ArrowUturnLeftIcon, 
  ArrowUturnRightIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProgrammeUndoRedo } from '../../../contexts/ProgrammeUndoRedoContext';
import { demoModeService } from '../../../services/demoModeService';

interface ProgrammeUndoRedoButtonsProps {
  className?: string;
  onActionRedone?: (action: any) => void;
  onActionUndone?: (action: any) => void;
  projectId: string;
}

const ProgrammeUndoRedoButtons: React.FC<ProgrammeUndoRedoButtonsProps> = ({
  projectId,
  onActionUndone,
  onActionRedone,
  className = ''
}) => {
  const { canAccess } = usePermissions();
  const { 
    canUndo, 
    canRedo, 
    undoCount, 
    redoCount, 
    isDemoMode, 
    undo, 
    redo 
  } = useProgrammeUndoRedo();
  
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const hasPermission = canAccess('programme.edit.undo-redo');
  const isDisabled = !hasPermission;

  // Handle undo
  const handleUndo = async () => {
    if (!hasPermission || !canUndo || loading) return;
    
    try {
      setLoading(true);
      
      const result = await undo();
      
      if (result.success && result.action) {
        setLastAction(result.action.description);
        onActionUndone?.(result.action);
        
        // Show success message
        console.log(`Undone: ${result.action.description}`);
      } else {
        console.error('Undo failed:', result.error);
        // Show error message to user
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
    if (!hasPermission || !canRedo || loading || isDemoMode) return;
    
    try {
      setLoading(true);
      
      const result = await redo();
      
      if (result.success && result.action) {
        setLastAction(result.action.description);
        onActionRedone?.(result.action);
        
        // Show success message
        console.log(`Redone: ${result.action.description}`);
      } else {
        console.error('Redo failed:', result.error);
        // Show error message to user
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
    if (!hasPermission) return 'Insufficient permissions (requires programme.edit.undo-redo)';
    if (!canUndo) return 'No actions to undo';
    if (loading) return 'Undoing...';
    if (isDemoMode) {
      const remaining = Math.max(0, 3 - undoCount);
      return `DEMO – Limited undo history (${remaining}/3 steps remaining)`;
    }
    return `Undo: ${lastAction || 'Last action'} (${undoCount} steps available)`;
  };

  // Get redo tooltip text
  const getRedoTooltip = (): string => {
    if (!hasPermission) return 'Insufficient permissions (requires programme.edit.undo-redo)';
    if (isDemoMode) return 'DEMO – Redo not available in demo mode';
    if (!canRedo) return 'No actions to redo';
    if (loading) return 'Redoing...';
    return `Redo: ${lastAction || 'Last undone action'} (${redoCount} steps available)`;
  };

  // Get button styles
  const getButtonStyles = (isUndo: boolean) => {
    const baseStyles = `
      flex flex-col items-center justify-center w-12 h-12 
      border border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-700 
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      ${loading ? 'animate-pulse' : ''}
    `;

    const isActionDisabled = isUndo ? !canUndo : !canRedo;
    const isButtonDisabled = isDisabled || isActionDisabled || loading;

    if (isButtonDisabled) {
      return `${baseStyles} opacity-50 cursor-not-allowed`;
    }

    return `${baseStyles} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500`;
  };

  return (
    <div className={`flex ${className}`}>
      {/* Undo Button */}
      <button
        onClick={handleUndo}
        disabled={isDisabled || !canUndo || loading}
        className={`${getButtonStyles(true)} border-r border-gray-300 dark:border-gray-600`}
        title={getUndoTooltip()}
      >
        <ArrowUturnLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
          Undo
        </span>
        {isDemoMode && undoCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
            {undoCount}
          </div>
        )}
      </button>
      
      {/* Redo Button */}
      <button
        onClick={handleRedo}
        disabled={isDisabled || !canRedo || loading || isDemoMode}
        className={getButtonStyles(false)}
        title={getRedoTooltip()}
      >
        <ArrowUturnRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
          Redo
        </span>
        {!isDemoMode && redoCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
            {redoCount}
          </div>
        )}
      </button>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-orange-600 dark:text-orange-400 font-medium">
          DEMO
        </div>
      )}
    </div>
  );
};

export default ProgrammeUndoRedoButtons; 