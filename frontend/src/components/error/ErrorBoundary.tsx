import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('🚨 ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Example: Send to error reporting service
    // You can integrate with services like Sentry, LogRocket, etc.
    try {
      // Example error reporting
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'anonymous', // You can get this from your auth context
      };

      // Send to your error reporting service
      console.log('📊 Error report:', errorReport);
      
      // Example: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-full w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-900 dark:text-red-100">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                We encountered an unexpected error. Don't worry, we've been notified and are working on it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details */}
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Error Details
                </h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Message:</strong> {this.state.error?.message}</p>
                  <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {/* Development Error Stack */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Development Error Stack
                  </summary>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40 mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to catch errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('🚨 useErrorHandler caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // You can add error reporting logic here
    if (process.env.NODE_ENV === 'production') {
      // Report to error service
    }
  };
}
