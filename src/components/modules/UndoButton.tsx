import React, { useState, useEffect } from 'react';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { dragRescheduleService } from '../../services/dragRescheduleService';

interface UndoButtonProps {
  className?: string;
  disabled?: boolean;
  onUndo?: (message: string) => void;
}

const UndoButton: React.FC<UndoButtonProps> = ({
  className = '',
  onUndo,
  disabled = false
}) => {
  const [canUndo, setCanUndo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [undoCount, setUndoCount] = useState(0);

  // Check undo availability
  useEffect(() => {
    const checkUndoAvailability = () => {
      const available = dragRescheduleService.canUndo();
      setCanUndo(available);
      
      if (available) {
        const buffer = dragRescheduleService.getUndoBuffer();
        setUndoCount(buffer.length);
      } else {
        setUndoCount(0);
      }
    };

    // Check initially
    checkUndoAvailability();

    // Set up interval to check periodically
    const interval = setInterval(checkUndoAvailability, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUndo = async () => {
    if (!canUndo || isLoading || disabled) return;

    setIsLoading(true);
    
    try {
      const result = await dragRescheduleService.undoLastAction();
      
      if (result.success) {
        // Call the onUndo callback
        if (onUndo) {
          onUndo(result.message);
        }
        
        // Update undo count
        setUndoCount(prev => Math.max(0, prev - 1));
        setCanUndo(dragRescheduleService.canUndo());
      } else {
        // Show error message
        if (onUndo) {
          onUndo(`Error: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('Error during undo operation:', error);
      if (onUndo) {
        onUndo('Error: Failed to undo action');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || !canUndo || isLoading;

  return (
    <button
      onClick={handleUndo}
      disabled={isDisabled}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isDisabled
          ? 'text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
      } ${className}`}
      title={canUndo ? `Undo last action (${undoCount} available)` : 'No actions to undo'}
    >
      <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
      Undo
      {undoCount > 0 && (
        <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
          {undoCount}
        </span>
      )}
      {isLoading && (
        <div className="ml-2 w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      )}
    </button>
  );
};

export default UndoButton; 