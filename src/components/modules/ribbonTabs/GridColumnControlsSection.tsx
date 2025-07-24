import React from 'react';
import ManageColumnsButton from './ManageColumnsButton';
import ColumnPresetsDropdown from './ColumnPresetsDropdown';
import ResetColumnsButton from './ResetColumnsButton';

export type ColumnPresetType = 'default' | 'compact' | 'data-entry' | 'custom';

export interface ColumnPreset {
  id: string;
  name: string;
  type: ColumnPresetType;
  description: string;
  columns: string[];
}

interface GridColumnControlsSectionProps {
  currentPreset: string;
  presets: ColumnPreset[];
  onPresetChange: (presetId: string) => void;
  onOpenManageColumns: () => void;
  onResetColumns: () => void;
  onSavePreset?: () => void;
  disabled?: boolean;
  loading?: {
    manage?: boolean;
    presets?: boolean;
    reset?: boolean;
  };
}

const GridColumnControlsSection: React.FC<GridColumnControlsSectionProps> = ({
  currentPreset,
  presets,
  onPresetChange,
  onOpenManageColumns,
  onResetColumns,
  onSavePreset,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <ManageColumnsButton
          onOpenModal={onOpenManageColumns}
          disabled={disabled}
          loading={loading.manage}
        />
        <ColumnPresetsDropdown
          currentPreset={currentPreset}
          presets={presets}
          onPresetChange={onPresetChange}
          onSavePreset={onSavePreset}
          disabled={disabled}
          loading={loading.presets}
        />
        <ResetColumnsButton
          onReset={onResetColumns}
          disabled={disabled}
          loading={loading.reset}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Grid Column Controls
      </div>
    </section>
  );
};

export default GridColumnControlsSection; 