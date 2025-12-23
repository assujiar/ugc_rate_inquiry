import React from 'react';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center">
      <h3 className="text-lg font-semibold text-red-600">{message}</h3>
      {onRetry && (
        <button
          type="button"
          className="rounded-md bg-red-600 px-4 py-2 text-sm text-white shadow hover:bg-red-500"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
};