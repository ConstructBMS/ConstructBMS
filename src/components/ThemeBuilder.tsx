import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../config/themes';
import type { ThemeMode } from '../types/theme';
import type { ThemeId } from '../contexts/ThemeContext';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface ThemeBuilderProps {
  onClose?: () => void;
}

const ThemeBuilder: React.FC<ThemeBuilderProps> = ({ onClose }) => {
  const { themeSettings, setThemeId, setThemeMode } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);

  const handleThemeSelect = async (themeId: ThemeId) => {
    await setThemeId(themeId);
    setPreviewTheme(null);
  };

  const handleModeSelect = async (mode: ThemeMode) => {
    await setThemeMode(mode);
  };

  const handlePreview = (themeId: ThemeId) => {
    setPreviewTheme(themeId);
  };

  const handleCancelPreview = () => {
    setPreviewTheme(null);
  };

  const getModeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <SunIcon className="h-5 w-5" />;
      case 'dark':
        return <MoonIcon className="h-5 w-5" />;
      case 'auto':
        return <ComputerDesktopIcon className="h-5 w-5" />;
    }
  };

  const getModeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
    }
  };

  const getThemeId = (themeName: string): ThemeId => {
    return themeName.includes('Dark') ? 'constructbms-dark' : 'constructbms-light';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Theme Builder
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Choose from our carefully crafted themes. Each theme includes both light and dark variants.
        </p>
      </div>

      {/* Theme Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Display Mode
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeSelect(mode)}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                themeSettings.mode === mode
                  ? 'border-accent bg-accent text-white'
                  : 'border-gray-200 dark:border-gray-700 hover:border-accent hover:bg-accent/5'
              }`}
            >
              {getModeIcon(mode)}
              <span className="font-medium">{getModeLabel(mode)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Choose Theme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const themeId = getThemeId(theme.name);
            const isSelected = themeSettings.themeId === themeId;
            const isPreviewing = previewTheme === themeId;
            
            return (
              <div
                key={theme.name}
                className={`relative group cursor-pointer rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-accent/50'
                }`}
              >
                {/* Theme Preview */}
                <div
                  className="h-32 rounded-t-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.accent}20 100%)`,
                  }}
                >
                  {/* Preview Elements */}
                  <div className="absolute inset-0 p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <div
                        className="w-8 h-2 rounded"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div
                        className="h-1 rounded"
                        style={{ backgroundColor: theme.colors.accent, width: '60%' }}
                      />
                      <div
                        className="h-1 rounded"
                        style={{ backgroundColor: theme.colors.primary, width: '40%' }}
                      />
                    </div>
                  </div>
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {theme.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Professional Construction Theme
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {theme.name.includes('Dark') 
                      ? 'Deep navy background with blue accents for professional construction management.'
                      : 'Clean white background with blue accents for professional construction management.'
                    }
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleThemeSelect(themeId)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-accent hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                    
                    <button
                      onClick={() => handlePreview(themeId)}
                      className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
                      title="Preview theme"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Preview Overlay */}
                {isPreviewing && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm mx-4">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Preview Mode
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        You're previewing the {theme.name} theme. Click "Apply" to keep it or "Cancel" to revert.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleThemeSelect(themeId)}
                          className="flex-1 px-3 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90"
                        >
                          Apply
                        </button>
                        <button
                          onClick={handleCancelPreview}
                          className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Theme Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Current Theme
        </h3>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${themes.find(t => getThemeId(t.name) === themeSettings.themeId)?.colors.accent || '#3B82F6'} 0%, ${themes.find(t => getThemeId(t.name) === themeSettings.themeId)?.colors.primary || '#1A1A1A'} 100%)`,
            }}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {themes.find(t => getThemeId(t.name) === themeSettings.themeId)?.name || 'ConstructBMS Light'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getModeLabel(themeSettings.mode)} mode
            </p>
          </div>
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeBuilder; 
