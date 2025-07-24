import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface PlaybackSpeedDropdownProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const PlaybackSpeedDropdown: React.FC<PlaybackSpeedDropdownProps> = ({
  speed,
  onSpeedChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canView = canAccess('programme.4d.view');
  const isDisabled = disabled || !canView;

  const speedOptions = [
    { value: 0.5, label: '0.5x', description: 'Slow' },
    { value: 1, label: '1x', description: 'Normal' },
    { value: 2, label: '2x', description: 'Fast' },
    { value: 4, label: '4x', description: 'Very Fast' }
  ];

  const currentSpeed = speedOptions.find(option => option.value === speed) || speedOptions[1];

  const handleSpeedChange = (newSpeed: number) => {
    if (!isDisabled) {
      onSpeedChange(newSpeed);
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-16 h-12
          border border-gray-300 bg-white hover:bg-gray-50
          transition-colors duration-200 rounded
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Change simulation speed"
      >
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {currentSpeed.label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentSpeed.description}
        </div>
        <ChevronDownIcon
          className={`w-3 h-3 mt-0.5 ${
            isDisabled
              ? 'text-gray-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${
                  option.value === speed
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default PlaybackSpeedDropdown; 