import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='max-w-md w-full mx-auto p-6'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-4'>
            <svg
              className='h-6 w-6 text-destructive'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='text-lg font-semibold text-foreground mb-2'>
            Something went wrong
          </h1>
          <p className='text-sm text-muted-foreground mb-4'>
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {error && (
            <details className='text-left mb-4'>
              <summary className='text-sm text-muted-foreground cursor-pointer'>
                Error details
              </summary>
              <pre className='mt-2 text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto'>
                {error.message}
              </pre>
            </details>
          )}
          <div className='flex gap-2 justify-center'>
            <button
              onClick={resetError}
              className='px-4 py-2 text-sm font-medium text-primary hover:text-primary/80'
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
