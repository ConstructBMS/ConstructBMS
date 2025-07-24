import React from 'react';
import ZoneButton from './ZoneButton';

interface CustomTimelineZonesSectionProps {
  disabled?: boolean;
  loading?: {
    add?: boolean;
    clear?: boolean;
    edit?: boolean;
  };
  onAddZone: () => void;
  onClearAllZones: () => void;
  onEditZones: () => void;
}

const CustomTimelineZonesSection: React.FC<CustomTimelineZonesSectionProps> = ({
  onAddZone,
  onEditZones,
  onClearAllZones,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex items-center space-x-2">
        <ZoneButton
          type="add"
          onClick={onAddZone}
          disabled={disabled}
          loading={loading.add || false}
        />
        <ZoneButton
          type="edit"
          onClick={onEditZones}
          disabled={disabled}
          loading={loading.edit || false}
        />
        <ZoneButton
          type="clear"
          onClick={onClearAllZones}
          disabled={disabled}
          loading={loading.clear || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Custom Timeline Zones
      </div>
    </section>
  );
};

export default CustomTimelineZonesSection; 