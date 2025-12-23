import { useContext } from 'react';
import { ToastContext } from '@/components/ui/Toast';

/**
 * Hook to show toast notifications. Must be used within a `ToastProvider`.
 * Example:
 * const { addToast } = useToast();
 * addToast({ title: 'Success', message: 'Record created.', type: 'success' });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}