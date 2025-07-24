import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, TagIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { BarLabelPreset } from '../../../services/barLabelService';

interface BarLabelDropdownProps {
  presets: BarLabelPreset[];
  activePreset: BarLabelPreset | null;
  onApplyPreset: (preset: BarLabelPreset) => void;
  disabled?: boolean;
  loading?: boolean;
}

const BarLabelDropdown: React.FC<BarLabelDropdownProps> = ({
  presets,
  activePreset,
  onApplyPreset,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');
  const isDisabled = disabled || !canEdit || loading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePresetSelect = (preset: BarLabelPreset) => {
    if (!isDisabled) {
      onApplyPreset(preset);
      setIsOpen(false);
    }
  };

  const getPresetDisplayName = () => {
    if (activePreset) {
      return activePreset.name;
    }
    return 'Label Presets';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12
          border border-gray-300 bg-white hover:bg-gray-50
          transition-colors duration-200 rounded
          ${activePreset ? 'bg-blue-50 border-blue-300' : ''}
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400'
          }
          ${loading ? 'animate-pulse' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Load a predefined bar label layout"
      >
        <TagIcon className={`w-5 h-5 ${activePreset ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`} />
        <div className="flex items-center">
          <span className={`text-xs font-medium mt-1 ${activePreset ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {getPresetDisplayName()}
          </span>
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${activePreset ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                  activePreset?.id === preset.id ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <div className="flex items-center">
                  <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium">{preset.name}</span>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {preset.demo && (
                    <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                      Demo
                    </span>
                  )}
                  {activePreset?.id === preset.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
            
            {presets.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500">
                No presets available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarLabelDropdown; 