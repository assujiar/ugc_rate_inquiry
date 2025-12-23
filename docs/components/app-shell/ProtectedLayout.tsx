"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/useMe';
import { AppShell } from './AppShell';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Client-side protected layout. This component ensures that only
 * authenticated users can access the wrapped content. It uses the
 * `useMe` hook to fetch the current user; while loading, a skeleton
 * is shown. If no user is returned, it redirects to `/login`.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="p-6">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}