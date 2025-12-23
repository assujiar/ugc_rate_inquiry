import './globals.css';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Root layout for the application. This file is used by the Next.js App
 * Router to wrap all pages. It imports global CSS, sets up the
 * `<html>` and `<body>` elements, and provides context providers such
 * as the `ToastProvider` for notifications. You can add additional
 * providers here (e.g., theme provider) if needed.
 */
export const metadata = {
  title: 'UGC Dashboard',
  description: 'Unified dashboard for sales, marketing, operations and finance'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}