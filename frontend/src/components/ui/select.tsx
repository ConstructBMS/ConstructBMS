import React, { useEffect, useRef, useState } from 'react';

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  // Clone children and pass down the necessary props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === SelectTrigger) {
        return React.cloneElement(child, {
          isOpen,
          setIsOpen,
          selectedValue,
        });
      }
      if (child.type === SelectContent) {
        return React.cloneElement(child, {
          isOpen,
          handleSelect,
        });
      }
    }
    return child;
  });

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {childrenWithProps}
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = '',
  isOpen,
  setIsOpen,
}) => {
  return (
    <button
      type='button'
      onClick={() => setIsOpen?.(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-input/80 ${className}`}
    >
      {children}
      <svg
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M19 9l-7 7-7-7'
        />
      </svg>
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
  className?: string;
  selectedValue?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  className = '',
  selectedValue,
}) => {
  return (
    <span className={`text-sm ${className}`}>
      {selectedValue || placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  handleSelect?: (value: string) => void;
}

const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className = '',
  isOpen,
  handleSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-full left-0 right-0 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-input bg-popover shadow-lg ${className}`}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, {
            handleSelect,
          });
        }
        return child;
      })}
    </div>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  handleSelect?: (value: string) => void;
}

const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  className = '',
  handleSelect,
}) => {
  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={() => handleSelect?.(value)}
    >
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
