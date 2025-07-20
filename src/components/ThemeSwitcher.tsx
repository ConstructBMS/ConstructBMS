import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeMode } from '../types/theme';

interface ThemeSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  showLabels = true,
  className = '',
}) => {
  const { themeSettings, setThemeMode } = useTheme();

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      name: 'Light',
      icon: Sun,
      description: 'Light mode with bright backgrounds',
    },
    {
      id: 'dark' as ThemeMode,
      name: 'Dark',
      icon: Moon,
      description: 'Dark mode with dark backgrounds',
    },
    {
      id: 'auto' as ThemeMode,
      name: 'Auto',
      icon: Monitor,
      description: 'Follow system preference',
    },
  ];

  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabels && (
        <div>
          <h3 className='text-lg font-medium text-constructbms-dark-1 dark:text-constructbms-light-1 mb-2'>
            Theme Preference
          </h3>
          <p className='text-sm text-constructbms-dark-2 dark:text-constructbms-light-3'>
            Choose your preferred theme or let the system decide automatically.
          </p>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        {themeOptions.map(option => {
          const Icon = option.icon;
          const isSelected = themeSettings.mode === option.id;
          const isEffective =
            themeSettings.effectiveMode === option.id ||
            (option.id === 'auto' && themeSettings.mode === 'auto');

          return (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${
                  isSelected
                    ? 'border-constructbms-primary bg-constructbms-primary/10 dark:bg-constructbms-primary/20'
                    : 'border-constructbms-light-3 dark:border-constructbms-dark-3 hover:border-constructbms-light-2 dark:hover:border-constructbms-dark-2'
                }
                ${isSelected ? 'ring-2 ring-constructbms-primary/20' : ''}
                bg-constructbms-light-1 dark:bg-constructbms-dark-2 hover:bg-constructbms-light-2 dark:hover:bg-constructbms-dark-3'
              `}
            >
              <div className='flex items-center space-x-3'>
                <div
                  className={`
                  p-2 rounded-lg
                  ${
                    isSelected
                      ? 'bg-constructbms-primary text-constructbms-dark-1 dark:text-constructbms-dark-1'
                      : 'bg-constructbms-light-2 dark:bg-constructbms-dark-3 text-constructbms-dark-2 dark:text-constructbms-light-3'
                  }
                `}
                >
                  <Icon className='h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`
                      font-medium
                      ${
                        isSelected
                          ? 'text-constructbms-primary dark:text-constructbms-primary'
                          : 'text-constructbms-dark-1 dark:text-constructbms-light-1'
                      }
                    `}
                    >
                      {option.name}
                    </span>
                    {isEffective && (
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-constructbms-primary/20 text-constructbms-primary'>
                        Active
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-constructbms-dark-2 dark:text-constructbms-light-3 mt-1'>
                    {option.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className='absolute top-3 right-3'>
                  <div className='w-2 h-2 bg-constructbms-primary rounded-full'></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {themeSettings.mode === 'auto' && (
        <div className='mt-4 p-3 bg-constructbms-accent-2/10 dark:bg-constructbms-accent-2/20 border border-constructbms-accent-2/40 dark:border-constructbms-accent-2/60 rounded-lg'>
          <div className='flex items-center space-x-2'>
            <Monitor className='h-4 w-4 text-constructbms-accent-2' />
            <span className='text-sm text-constructbms-accent-2'>
              Currently following system preference:
              <span className='font-medium ml-1 capitalize'>
                {themeSettings.effectiveMode}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
