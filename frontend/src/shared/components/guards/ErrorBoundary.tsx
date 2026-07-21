import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 transition-colors">
          <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#111111] p-8 rounded-2xl border border-neutral-200 dark:border-[#1F1F1F] shadow-xl">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                An unexpected error occurred in the application. Please try reloading or heading back to the home page.
              </p>
              {this.state.error?.message && (
                <div className="mt-4 p-3 bg-neutral-100 dark:bg-[#1A1A1A] rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#2A2A2A]">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button
                variant="primary"
                onClick={this.handleReset}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
