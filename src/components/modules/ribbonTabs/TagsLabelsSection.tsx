import React, { useState } from 'react';
import { TagIcon, SwatchIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface TagsLabelsSectionProps {
  currentColorPalette: string;
  disabled?: boolean;
  loading?: {
    manage?: boolean;
    palette?: boolean;
  };
  onColorPaletteChange: (color: string) => void;
  onOpenManageTags: () => void;
}

const TagsLabelsSection: React.FC<TagsLabelsSectionProps> = ({
  onOpenManageTags,
  onColorPaletteChange,
  currentColorPalette,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const canManage = canAccess('programme.admin.manage');
  const isDisabled = disabled || !canManage;

  const colorPaletteOptions = [
    { value: 'default', label: 'Default', color: '#3B82F6', description: 'Standard blue palette' },
    { value: 'warm', label: 'Warm', color: '#F59E0B', description: 'Orange and red tones' },
    { value: 'cool', label: 'Cool', color: '#10B981', description: 'Green and blue tones' },
    { value: 'neutral', label: 'Neutral', color: '#6B7280', description: 'Gray and black tones' },
    { value: 'vibrant', label: 'Vibrant', color: '#8B5CF6', description: 'Purple and pink tones' }
  ];

  const currentPalette = colorPaletteOptions.find(option => option.value === currentColorPalette) || colorPaletteOptions[0];

  const handlePaletteChange = (color: string) => {
    onColorPaletteChange(color);
    setIsPaletteOpen(false);
  };

  const handlePaletteToggle = () => {
    if (!isDisabled) {
      setIsPaletteOpen(!isPaletteOpen);
    }
  };

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <button
          onClick={onOpenManageTags}
          disabled={isDisabled || loading.manage}
          className={`
            flex flex-col items-center justify-center w-12 h-12
            border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700 rounded
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isDisabled || loading.manage
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
            }
          `}
          title="Manage global tags and labels"
        >
          <TagIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.manage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        <div className="relative">
          <button
            onClick={handlePaletteToggle}
            disabled={isDisabled || loading.palette}
            className={`
              flex flex-col items-center justify-center w-12 h-12
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 rounded
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${isDisabled || loading.palette
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            title="Select color palette for tags"
          >
            <SwatchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div
              className="w-3 h-3 rounded-full mt-1"
              style={{ backgroundColor: currentPalette.color }}
            />
            <ChevronDownIcon className="w-3 h-3 text-gray-400 mt-1" />
            {loading.palette && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>

          {isPaletteOpen && !isDisabled && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
              <div className="py-1">
                {colorPaletteOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePaletteChange(option.value)}
                    className={`
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                      ${option.value === currentColorPalette
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                    title={option.description}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Tags & Labels
      </div>
    </section>
  );
};

export default TagsLabelsSection; 