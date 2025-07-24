import React from 'react';
import ProgrammeUndoRedoButtons from './ProgrammeUndoRedoButtons';

interface UndoRedoGroupProps {
  canRedo?: boolean;
  canUndo?: boolean;
  disabled?: boolean;
  onRedo?: () => void;
  onUndo?: () => void;
  projectId?: string;
}

const UndoRedoGroup: React.FC<UndoRedoGroupProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  disabled = false,
  projectId = 'default'
}) => {
  // Use the new ProgrammeUndoRedoButtons if projectId is provided
  if (projectId && projectId !== 'default') {
    return (
      <ProgrammeUndoRedoButtons
        projectId={projectId}
        onActionUndone={onUndo}
        onActionRedone={onRedo}
      />
    );
  }

  // Fallback to legacy implementation for backward compatibility
  return (
    <div className="flex border border-gray-300 rounded overflow-hidden">
      <button
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className={`
          flex flex-col items-center justify-center w-12 h-12 
          bg-white hover:bg-gray-50 transition-colors duration-200
          border-r border-gray-300
          ${disabled || !canUndo 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Undo last change"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span className="text-xs text-gray-600 mt-1 font-medium">Undo</span>
      </button>
      
      <button
        onClick={onRedo}
        disabled={disabled || !canRedo}
        className={`
          flex flex-col items-center justify-center w-12 h-12 
          bg-white hover:bg-gray-50 transition-colors duration-200
          ${disabled || !canRedo 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Redo last undone change"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
        <span className="text-xs text-gray-600 mt-1 font-medium">Redo</span>
      </button>
    </div>
  );
};

export default UndoRedoGroup; 