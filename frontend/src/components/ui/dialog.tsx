import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='fixed inset-0 bg-black/50'
        onClick={() => onOpenChange?.(false)}
      />
      <div className='relative z-50'>{children}</div>
    </div>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative bg-background p-6 shadow-lg rounded-lg border max-w-lg w-full mx-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  >
    {children}
  </p>
));
DialogDescription.displayName = 'DialogDescription';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
