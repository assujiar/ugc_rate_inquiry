import React from 'react';
import clsx from 'clsx';

export interface CardProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, actions, children, className }) => {
  return (
    <div className={clsx('rounded-lg border border-gray-200 bg-white p-4 shadow-sm', className)}>
      {title && (
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {actions}
        </div>
      )}
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
};