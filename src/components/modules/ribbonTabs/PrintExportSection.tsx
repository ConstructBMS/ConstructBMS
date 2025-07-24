import React from 'react';
import { PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface PrintExportSectionProps {
  onPrintView: () => void;
  onExportPDF: () => void;
  disabled?: boolean;
  loading?: {
    print?: boolean;
    pdf?: boolean;
  };
}

const PrintExportSection: React.FC<PrintExportSectionProps> = ({
  onPrintView,
  onExportPDF,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();

  const canPrint = canAccess('programme.print');
  const canExportPDF = canAccess('programme.export.pdf');
  const isDisabled = disabled || (!canPrint && !canExportPDF);

  return (
    <section className="ribbon-section w-32">
      <div className="ribbon-buttons flex space-x-2">
        {/* Print View Button */}
        <button
          onClick={onPrintView}
          disabled={isDisabled || !canPrint || loading.print}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || !canPrint || loading.print
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Print View - Print-friendly rendering of current Gantt view"
        >
          <PrinterIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.print && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        {/* Export to PDF Button */}
        <button
          onClick={onExportPDF}
          disabled={isDisabled || !canExportPDF || loading.pdf}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || !canExportPDF || loading.pdf
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Export to PDF - High-quality PDF export with customisation options"
        >
          <DocumentArrowDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.pdf && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Print & Export
      </div>
    </section>
  );
};

export default PrintExportSection; 