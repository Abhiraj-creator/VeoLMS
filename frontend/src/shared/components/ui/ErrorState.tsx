import React from 'react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load content',
  message = 'An unexpected network error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-center ${className}`}>
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
        !
      </div>
      <h4 className="text-base font-semibold text-red-900 dark:text-red-200">{title}</h4>
      <p className="mt-1 text-sm text-red-600 dark:text-red-300/80 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
