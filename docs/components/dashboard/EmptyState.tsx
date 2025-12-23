import React from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title = 'No data', description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="max-w-md text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};