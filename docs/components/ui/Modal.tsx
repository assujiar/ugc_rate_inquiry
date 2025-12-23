import React from 'react';
import { Button } from './Button';
import clsx from 'clsx';

export interface ModalProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  size = 'md'
}) => {
  if (!open) return null;
  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className={clsx('w-full rounded-lg bg-white p-6 shadow-lg', sizes[size])}>
        {title && <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>}
        <div className="mb-6 text-sm text-gray-700">{children}</div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          {onConfirm && <Button onClick={onConfirm}>{confirmLabel}</Button>}
        </div>
      </div>
    </div>
  );
};