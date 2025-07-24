import React from 'react';
import PlaybackButton from './PlaybackButton';
import PlaybackSlider from './PlaybackSlider';
import PlaybackSpeedDropdown from './PlaybackSpeedDropdown';

interface FourDPlaybackControlsSectionProps {
  isPlaying: boolean;
  currentDate: Date;
  startDate: Date;
  endDate: Date;
  speed: number;
  onTogglePlayback: () => void;
  onDateChange: (date: Date) => void;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

const FourDPlaybackControlsSection: React.FC<FourDPlaybackControlsSectionProps> = ({
  isPlaying,
  currentDate,
  startDate,
  endDate,
  speed,
  onTogglePlayback,
  onDateChange,
  onSpeedChange,
  disabled = false,
  loading = false
}) => {
  return (
    <section className="ribbon-section w-72">
      <div className="ribbon-buttons flex items-center space-x-2">
        <PlaybackButton
          isPlaying={isPlaying}
          onToggle={onTogglePlayback}
          disabled={disabled}
          loading={loading}
        />
        <PlaybackSlider
          currentDate={currentDate}
          startDate={startDate}
          endDate={endDate}
          onDateChange={onDateChange}
          disabled={disabled}
        />
        <PlaybackSpeedDropdown
          speed={speed}
          onSpeedChange={onSpeedChange}
          disabled={disabled}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        4D Playback Controls
      </div>
    </section>
  );
};

export default FourDPlaybackControlsSection; 