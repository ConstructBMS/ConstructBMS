import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  showLabels?: boolean;
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  showLabels = true,
  className = '',
}) => {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light' as Theme,
      name: 'Light',
      icon: Sun,
      description: 'Light mode with bright backgrounds',
    },
    {
      id: 'dark' as Theme,
      name: 'Dark',
      icon: Moon,
      description: 'Dark mode with dark backgrounds',
    },
    {
      id: 'auto' as Theme,
      name: 'Auto',
      icon: Monitor,
      description: 'Follow system preference',
    },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabels && (
        <div>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            Theme Preference
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Choose your preferred theme or let the system decide automatically.
          </p>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        {themeOptions.map(option => {
          const Icon = option.icon;
          const isSelected = theme === option.id;
          const isEffective =
            effectiveTheme === option.id ||
            (option.id === 'auto' && theme === 'auto');

          return (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${
                  isSelected
                    ? 'border-archer-green bg-archer-green/10 dark:bg-archer-green/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${isSelected ? 'ring-2 ring-archer-green/20' : ''}
                bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
              `}
            >
              <div className='flex items-center space-x-3'>
                <div
                  className={`
                  p-2 rounded-lg
                  ${
                    isSelected
                      ? 'bg-archer-green text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
                          ? 'text-archer-green dark:text-archer-green'
                          : 'text-gray-900 dark:text-white'
                      }
                    `}
                    >
                      {option.name}
                    </span>
                    {isEffective && (
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-archer-green/20 text-archer-green'>
                        Active
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    {option.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className='absolute top-3 right-3'>
                  <div className='w-2 h-2 bg-archer-green rounded-full'></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {theme === 'auto' && (
        <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <div className='flex items-center space-x-2'>
            <Monitor className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            <span className='text-sm text-blue-800 dark:text-blue-300'>
              Currently following system preference:
              <span className='font-medium ml-1 capitalize'>
                {effectiveTheme}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
