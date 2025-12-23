"use client";
import { useMe } from '@/hooks/useMe';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

/**
 * Displays a summary of the current user along with a logout link.
 * In the future this component could include theme switching and
 * profile management options.
 */
export default function UserPanel() {
  const { user, loading } = useMe();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/logout');
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">
          {loading ? 'Loading...' : user?.email ?? 'Unknown'}
        </div>
        <div className="text-xs text-gray-500">{loading ? '' : user?.role ?? 'Guest'}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}