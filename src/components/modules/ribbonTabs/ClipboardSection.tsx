import React from 'react';
import ClipboardButton from './ClipboardButton';
import ProgrammeUndoRedoButtons from './ProgrammeUndoRedoButtons';
import { useClipboard } from '../../../contexts/ClipboardContext';

interface ClipboardSectionProps {
  onActionRedone?: (action: any) => void;
  onActionUndone?: (action: any) => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  projectId?: string;
  selectedTasksCount: number;
}

const ClipboardSection: React.FC<ClipboardSectionProps> = ({
  selectedTasksCount,
  onCut,
  onCopy,
  onPaste,
  projectId = 'default',
  onActionUndone,
  onActionRedone
}) => {
  const { hasClipboardContent } = useClipboard();
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ClipboardButton 
          type="cut" 
          onClick={onCut}
          selectedTasksCount={selectedTasksCount}
        />
        <ClipboardButton 
          type="copy" 
          onClick={onCopy}
          selectedTasksCount={selectedTasksCount}
        />
        <ClipboardButton 
          type="paste" 
          onClick={onPaste}
          hasClipboardContent={hasClipboardContent()}
        />
        
        {/* Undo/Redo Buttons */}
        <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
          <ProgrammeUndoRedoButtons
            projectId={projectId}
            onActionUndone={onActionUndone}
            onActionRedone={onActionRedone}
            className=""
          />
        </div>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Clipboard
      </div>
    </section>
  );
};

export default ClipboardSection; 