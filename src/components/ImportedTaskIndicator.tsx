import React from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';

interface ImportedTaskIndicatorProps {
  demo?: boolean;
  importedAt?: string;
  isImported: boolean;
  sourceFileName?: string;
}

const ImportedTaskIndicator: React.FC<ImportedTaskIndicatorProps> = ({
  isImported,
  sourceFileName,
  importedAt,
  demo = false
}) => {
  if (!isImported) {
    return null;
  }

  const tooltipText = [
    'Imported from Asta PowerProject',
    sourceFileName && `Source: ${sourceFileName}`,
    importedAt && `Imported: ${new Date(importedAt).toLocaleDateString()}`,
    demo && 'Demo import'
  ].filter(Boolean).join('\n');

  return (
    <div 
      className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs"
      title={tooltipText}
    >
      <PaperClipIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
      <span className="text-blue-700 dark:text-blue-300 font-medium">Asta</span>
      {demo && (
        <span className="text-blue-500 dark:text-blue-400 text-xs">(demo)</span>
      )}
    </div>
  );
};

export default ImportedTaskIndicator; 