import type { ReactNode } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export interface WidgetBaseProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  contentHeight?: 'auto' | 'fixed' | 'scrollable';
  empty?: boolean;
  emptyMessage?: string;
  error?: string | null;
  headerClassName?: string;
  icon?: React.ComponentType<any>;
  loading?: boolean;
  onSettingsClick?: () => void;
  showSettings?: boolean;
  title: string;
}

const WidgetBase = ({
  title,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  contentHeight = 'auto',
  showSettings = false,
  onSettingsClick,
  icon: Icon,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No data available',
}: WidgetBaseProps) => {
  if (loading) {
    return (
      <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light dark:border-white/20 ${className}`}>
        <div className={`flex items-center justify-between px-4 py-2 silvery-fade-dark dark:silvery-fade-light ${headerClassName}`}>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {showSettings && onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className={`flex-1 flex items-center justify-center p-4 ${contentClassName}`}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light dark:border-white/20 ${className}`}>
        <div className={`flex items-center justify-between px-4 py-2 silvery-fade-dark dark:silvery-fade-light ${headerClassName}`}>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {showSettings && onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className={`flex-1 flex items-center justify-center p-4 ${contentClassName}`}>
          <div className="text-center text-red-500 dark:text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light dark:border-white/20 ${className}`}>
        <div className={`flex items-center justify-between px-4 py-2 silvery-fade-dark dark:silvery-fade-light ${headerClassName}`}>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {showSettings && onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className={`flex-1 flex items-center justify-center p-4 ${contentClassName}`}>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 shadow-md overflow-hidden silvery-fade-dark dark:silvery-fade-light dark:border-white/20 ${className}`}>
      <div className={`flex items-center justify-between px-4 py-2 silvery-fade-dark dark:silvery-fade-light ${headerClassName}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {showSettings && onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Cog6ToothIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className={`flex-1 p-4 ${contentClassName} ${contentHeight === 'scrollable' ? 'overflow-y-auto' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default WidgetBase; 
