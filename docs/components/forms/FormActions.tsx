import type { ReactNode } from 'react';

/**
 * Wrapper for action buttons at the bottom of a form. Aligns
 * buttons horizontally with consistent spacing.
 */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-3 mt-4">{children}</div>;
}