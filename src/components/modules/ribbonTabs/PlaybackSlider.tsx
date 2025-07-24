import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../../hooks/usePermissions';

interface PlaybackSliderProps {
  currentDate: Date;
  disabled?: boolean;
  endDate: Date;
  onDateChange: (date: Date) => void;
  startDate: Date;
}

const PlaybackSlider: React.FC<PlaybackSliderProps> = ({
  currentDate,
  startDate,
  endDate,
  onDateChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(0);

  const canView = canAccess('programme.4d.view');
  const isDisabled = disabled || !canView;

  // Calculate slider value (0-100)
  const calculateSliderValue = (date: Date) => {
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const currentDays = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (currentDays / totalDays) * 100));
  };

  // Calculate date from slider value
  const calculateDateFromValue = (value: number) => {
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const currentDays = (value / 100) * totalDays;
    const newDate = new Date(startDate.getTime() + (currentDays * 24 * 60 * 60 * 1000));
    return newDate;
  };

  useEffect(() => {
    setLocalValue(calculateSliderValue(currentDate));
  }, [currentDate, startDate, endDate]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLocalValue(value);
    
    if (!isDragging) {
      const newDate = calculateDateFromValue(value);
      onDateChange(newDate);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const newDate = calculateDateFromValue(localValue);
    onDateChange(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTickMarks = () => {
    const ticks = [];
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const tickInterval = Math.ceil(totalDays / 10); // Show ~10 tick marks

    for (let i = 0; i <= totalDays; i += tickInterval) {
      const tickDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const tickValue = (i / totalDays) * 100;
      
      if (tickValue <= 100) {
        ticks.push({
          value: tickValue,
          date: tickDate,
          label: formatDate(tickDate)
        });
      }
    }

    return ticks;
  };

  const ticks = getTickMarks();

  return (
    <div className="flex-1 min-w-0">
      <div className="relative">
        {/* Slider */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={localValue}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={isDisabled}
          className={`
            w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-blue-600
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:bg-blue-600
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:cursor-pointer
          `}
          title="Drag to simulate a specific date"
        />

        {/* Tick marks */}
        <div className="absolute top-2 left-0 right-0 pointer-events-none">
          {ticks.map((tick, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${tick.value}%` }}
            >
              <div className="w-1 h-2 bg-gray-400 dark:bg-gray-500"></div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                {tick.label}
              </div>
            </div>
          ))}
        </div>

        {/* Current date indicator */}
        <div className="mt-4 text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDate(currentDate)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Day {Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} of {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybackSlider; 