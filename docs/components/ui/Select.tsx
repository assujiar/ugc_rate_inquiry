import React from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <label className="block space-y-1">
      {label && <span className="block text-sm font-medium text-gray-700">{label}</span>}
      <select
        className={clsx(
          'mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-accent focus:ring-accent sm:text-sm',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};