import React, { useState } from 'react';
import { SwatchIcon, Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ThemeConfigSectionProps {
  currentThemePreset: string;
  disabled?: boolean;
  loading?: {
    manage?: boolean;
    preset?: boolean;
  };
  onOpenManageTheme: () => void;
  onThemePresetChange: (preset: string) => void;
}

const ThemeConfigSection: React.FC<ThemeConfigSectionProps> = ({
  onThemePresetChange,
  onOpenManageTheme,
  currentThemePreset,
  disabled = false,
  loading = {}
}) => {
  const { canAccess } = usePermissions();
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);

  const canManage = canAccess('programme.admin.manage');
  const isDisabled = disabled || !canManage;

  const themePresetOptions = [
    { value: 'default', label: 'Default', description: 'Standard ConstructBMS theme', preview: 'Blue and gray' },
    { value: 'dark', label: 'Dark', description: 'Dark mode theme', preview: 'Dark backgrounds' },
    { value: 'light', label: 'Light', description: 'Light mode theme', preview: 'Light backgrounds' },
    { value: 'high-contrast', label: 'High Contrast', description: 'Accessibility theme', preview: 'High contrast' },
    { value: 'custom', label: 'Custom', description: 'User-defined theme', preview: 'Custom colors' }
  ];

  const currentPreset = themePresetOptions.find(option => option.value === currentThemePreset) || themePresetOptions[0];

  const handlePresetChange = (preset: string) => {
    onThemePresetChange(preset);
    setIsPresetDropdownOpen(false);
  };

  const handlePresetDropdownToggle = () => {
    if (!isDisabled) {
      setIsPresetDropdownOpen(!isPresetDropdownOpen);
    }
  };

  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <div className="relative">
          <button
            onClick={handlePresetDropdownToggle}
            disabled={isDisabled || loading.preset}
            className={`
              flex flex-col items-center justify-center w-12 h-12
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 rounded
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${isDisabled || loading.preset
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            title="Select theme preset"
          >
            <SwatchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
              {currentPreset.label}
            </span>
            <ChevronDownIcon className="w-3 h-3 text-gray-400 mt-1" />
            {loading.preset && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>

          {isPresetDropdownOpen && !isDisabled && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
              <div className="py-1">
                {themePresetOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePresetChange(option.value)}
                    className={`
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                      ${option.value === currentThemePreset
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                    title={option.description}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {option.preview}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onOpenManageTheme}
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
          title="Manage theme styling configuration"
        >
          <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {loading.manage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Theme Config
      </div>
    </section>
  );
};

export default ThemeConfigSection; 