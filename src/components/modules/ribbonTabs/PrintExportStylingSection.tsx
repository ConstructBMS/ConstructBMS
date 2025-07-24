import React from 'react';
import PageLayoutDropdown from './PageLayoutDropdown';
import ExportThemeDropdown from './ExportThemeDropdown';
import ExportPreviewButton from './ExportPreviewButton';

export type PageLayout = 'A4P' | 'A4L' | 'A3L';
export type ExportTheme = 'default' | 'monochrome' | 'light' | 'dark' | 'custom';

interface PrintExportStylingSectionProps {
  disabled?: boolean;
  exportTheme: ExportTheme;
  loading?: {
    layout?: boolean;
    preview?: boolean;
    theme?: boolean;
  };
  onExportThemeChange: (theme: ExportTheme) => void;
  onPageLayoutChange: (layout: PageLayout) => void;
  onPreviewExport: () => void;
  pageLayout: PageLayout;
}

const PrintExportStylingSection: React.FC<PrintExportStylingSectionProps> = ({
  pageLayout,
  onPageLayoutChange,
  exportTheme,
  onExportThemeChange,
  onPreviewExport,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <PageLayoutDropdown
          currentLayout={pageLayout}
          onLayoutChange={onPageLayoutChange}
          disabled={disabled || loading.layout}
        />
        <ExportThemeDropdown
          currentTheme={exportTheme}
          onThemeChange={onExportThemeChange}
          disabled={disabled || loading.theme}
        />
        <ExportPreviewButton
          onPreview={onPreviewExport}
          disabled={disabled}
          loading={loading.preview}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Print/Export Styling
      </div>
    </section>
  );
};

export default PrintExportStylingSection; 