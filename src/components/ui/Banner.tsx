import type { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface BannerProps {
  children: ReactNode;
  className?: string;
  dismissible?: boolean;
  onClose?: () => void;
  title?: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const Banner = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  dismissible = false
}: BannerProps) => {
  const typeClasses = {
    success: 'banner-success',
    warning: 'banner-warning',
    error: 'banner-error',
    info: 'banner-info',
    neutral: 'banner-neutral'
  };

  const bannerClasses = [
    'banner',
    typeClasses[type],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={bannerClasses} role="alert">
      <div className="flex items-start">
        <div className="flex-1">
          {title && (
            <h3 className="text-heading-6 mb-1">{title}</h3>
          )}
          <div className="text-body">
            {children}
          </div>
        </div>
        
        {(dismissible || onClose) && (
          <button
            onClick={onClose}
            className="ml-4 text-current hover:opacity-75 transition-opacity"
            aria-label="Dismiss banner"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Banner; 
