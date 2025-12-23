import { useEffect, useState } from 'react';
import type { Profile } from '@/types/auth';

interface MeResult {
  user: Profile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Client-side hook to fetch the current user's profile from `/app/api/me`.
 * Returns the profile, loading state, and any error message.
 */
export function useMe(): MeResult {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchMe() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/me');
        if (!res.ok) {
          throw new Error(`Failed to fetch user: ${res.statusText}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setUser(null);
          setError(err?.message ?? 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchMe();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, error };
}