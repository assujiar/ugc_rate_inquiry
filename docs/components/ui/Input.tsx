import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <label className="block space-y-1">
      {label && <span className="block text-sm font-medium text-gray-700">{label}</span>}
      <input
        className={clsx(
          'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm',
          className
        )}
        {...props}
      />
    </label>
  );
};