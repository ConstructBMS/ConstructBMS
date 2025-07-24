import React from 'react';
import {
  PlayCircleIcon,
  PauseCircleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface PlaybackButtonProps {
  disabled?: boolean;
  isPlaying: boolean;
  loading?: boolean;
  onToggle: () => void;
}

const PlaybackButton: React.FC<PlaybackButtonProps> = ({
  isPlaying,
  onToggle,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const canView = canAccess('programme.4d.view');
  const isDisabled = disabled || !canView || loading;

  const handleClick = () => {
    if (!isDisabled) {
      onToggle();
    }
  };

  const IconComponent = isPlaying ? PauseCircleIcon : PlayCircleIcon;
  const buttonColor = isPlaying ? 'text-red-600' : 'text-green-600';
  const tooltip = isPlaying ? 'Pause 4D timeline animation' : 'Play 4D timeline animation';

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12
        border border-gray-300 bg-white hover:bg-gray-50
        transition-colors duration-200 rounded
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-gray-400'
        }
        ${loading ? 'animate-pulse' : ''}
        ${isPlaying ? 'ring-2 ring-red-200' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={tooltip}
    >
      <IconComponent
        className={`w-6 h-6 ${
          isDisabled
            ? 'text-gray-400'
            : buttonColor
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isDisabled
          ? 'text-gray-400'
          : buttonColor
      }`}>
        {isPlaying ? 'Pause' : 'Play'}
      </span>
    </button>
  );
};

export default PlaybackButton; 