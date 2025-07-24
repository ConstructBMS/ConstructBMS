import React from 'react';
import ZoomInButton from './ZoomInButton';
import ZoomOutButton from './ZoomOutButton';
import TimeScaleDropdown from './TimeScaleDropdown';

export type TimeScaleOption = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface GanttZoomScaleSectionProps {
  disabled?: boolean;
  loading?: {
    timeScale?: boolean;
    zoomIn?: boolean;
    zoomOut?: boolean;
  };
  onTimeScaleChange: (scale: TimeScaleOption) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  timeScale: TimeScaleOption;
  zoomLevel: number;
}

const GanttZoomScaleSection: React.FC<GanttZoomScaleSectionProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  timeScale,
  onTimeScaleChange,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-48">
      <div className="ribbon-buttons flex items-center space-x-2">
        <ZoomInButton
          onZoomIn={onZoomIn}
          disabled={disabled}
          loading={loading.zoomIn}
        />
        <ZoomOutButton
          onZoomOut={onZoomOut}
          disabled={disabled}
          loading={loading.zoomOut}
        />
        <TimeScaleDropdown
          currentScale={timeScale}
          onScaleChange={onTimeScaleChange}
          disabled={disabled}
          loading={loading.timeScale}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Gantt Zoom & Scale
      </div>
    </section>
  );
};

export default GanttZoomScaleSection; 