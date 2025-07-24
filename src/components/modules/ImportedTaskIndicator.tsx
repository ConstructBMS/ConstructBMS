import React from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';

interface ImportedTaskIndicatorProps {
  className?: string;
  importedAt?: string;
  isImported: boolean;
  sourceFileName?: string;
}

const ImportedTaskIndicator: React.FC<ImportedTaskIndicatorProps> = ({
  isImported,
  sourceFileName,
  importedAt,
  className = ''
}) => {
  if (!isImported) return null;

  const tooltipText = sourceFileName && importedAt 
    ? `Imported from: ${sourceFileName}\nDate: ${new Date(importedAt).toLocaleDateString()}`
    : 'Imported from Asta PowerProject';

  return (
    <div 
      className={`inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 ${className}`}
      title={tooltipText}
    >
      <PaperClipIcon className="w-3 h-3" />
      <span className="font-medium">Asta</span>
    </div>
  );
};

export default ImportedTaskIndicator; 