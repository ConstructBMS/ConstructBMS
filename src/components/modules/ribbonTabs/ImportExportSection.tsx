import React from 'react';
import { ArrowUpTrayIcon, DocumentArrowDownIcon, TableCellsIcon, PhotoIcon, ChartBarIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ImportExportSectionProps {
  disabled?: boolean;
  loading?: {
    csv?: boolean;
    image?: boolean;
    import?: boolean;
    pdf?: boolean;
    print?: boolean;
    timeline?: boolean;
  };
  onExportCSV: () => void;
  onExportImage: () => void;
  onExportPDF: () => void;
  onExportTimeline?: () => void;
  onImportProject: () => void;
  onPrintTimeline?: () => void;
}

const ImportExportSection: React.FC<ImportExportSectionProps> = ({
  onImportProject,
  onExportPDF,
  onExportCSV,
  onExportImage,
  onExportTimeline,
  onPrintTimeline,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();

  const canSave = canAccess('programme.save');
  const canImport = canAccess('programme.import');
  const isDisabled = disabled || !canSave;

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <button
          onClick={onImportProject}
          disabled={isDisabled || !canImport || loading.import}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || !canImport || loading.import
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Import project from file (.pp, .xml)"
        >
          <ArrowUpTrayIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.import && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onExportPDF}
          disabled={isDisabled || loading.pdf}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.pdf
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Export project as PDF"
        >
          <DocumentArrowDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.pdf && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onExportCSV}
          disabled={isDisabled || loading.csv}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.csv
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Export project as CSV"
        >
          <TableCellsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.csv && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <button
          onClick={onExportImage}
          disabled={isDisabled || loading.image}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.image
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Export project as image"
        >
          <PhotoIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.image && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        {/* Timeline Export Button */}
        {onExportTimeline && (
          <button
            onClick={onExportTimeline}
            disabled={isDisabled || loading.timeline}
            className={`
              flex flex-col items-center justify-center w-12 h-12
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 rounded
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${isDisabled || loading.timeline
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            title="Export timeline as PDF/PNG"
          >
            <ChartBarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {loading.timeline && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        )}

        {/* Timeline Print Button */}
        {onPrintTimeline && (
          <button
            onClick={onPrintTimeline}
            disabled={isDisabled || loading.print}
            className={`
              flex flex-col items-center justify-center w-12 h-12
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 rounded
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${isDisabled || loading.print
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            title="Print timeline"
          >
            <PrinterIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {loading.print && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        )}
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Import & Export
      </div>
    </section>
  );
};

export default ImportExportSection; 