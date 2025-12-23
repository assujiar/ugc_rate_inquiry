import type { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

/**
 * Generic form field wrapper. Displays a label and the provided input
 * elements. Associates the label with the input via `htmlFor` when
 * provided.
 */
export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}