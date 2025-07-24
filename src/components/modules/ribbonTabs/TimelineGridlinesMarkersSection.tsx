import React from 'react';
import TodayMarkerToggle from './TodayMarkerToggle';
import CustomDateMarkerButton from './CustomDateMarkerButton';
import GridlineStyleDropdown from './GridlineStyleDropdown';

export type GridlineStyle = 'none' | 'solid' | 'dotted' | 'dashed';

interface TimelineGridlinesMarkersSectionProps {
  disabled?: boolean;
  gridlineStyle: GridlineStyle;
  loading?: {
    customMarker?: boolean;
    gridlines?: boolean;
    todayMarker?: boolean;
  };
  onGridlineStyleChange: (style: GridlineStyle) => void;
  onOpenCustomMarkerModal: () => void;
  onToggleTodayMarker: () => void;
  showTodayMarker: boolean;
}

const TimelineGridlinesMarkersSection: React.FC<TimelineGridlinesMarkersSectionProps> = ({
  showTodayMarker,
  onToggleTodayMarker,
  gridlineStyle,
  onGridlineStyleChange,
  onOpenCustomMarkerModal,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <TodayMarkerToggle
          isEnabled={showTodayMarker}
          onToggle={onToggleTodayMarker}
          disabled={disabled || loading.todayMarker}
        />
        <CustomDateMarkerButton
          onOpenModal={onOpenCustomMarkerModal}
          disabled={disabled}
          loading={loading.customMarker}
        />
        <GridlineStyleDropdown
          currentStyle={gridlineStyle}
          onStyleChange={onGridlineStyleChange}
          disabled={disabled || loading.gridlines}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Timeline Gridlines & Markers
      </div>
    </section>
  );
};

export default TimelineGridlinesMarkersSection; 