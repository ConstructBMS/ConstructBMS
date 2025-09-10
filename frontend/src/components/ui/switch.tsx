import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, onCheckedChange, checked, disabled, ...props }, ref) => {
    const handleClick = () => {
      if (onCheckedChange && !disabled) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div className='flex items-center space-x-2'>
        <button
          type='button'
          role='switch'
          aria-checked={checked}
          disabled={disabled}
          onClick={handleClick}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary' : 'bg-input',
            className
          )}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
        {label && (
          <span className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {label}
          </span>
        )}
      </div>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
