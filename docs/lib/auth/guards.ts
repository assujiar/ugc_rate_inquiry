import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Requires that a user be authenticated. If not authenticated, redirects to
 * the login page with a `redirectTo` parameter preserving the intended path.
 * Should be called inside server components or server actions.
 */
export async function requireAuth(targetPath: string) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    redirect(`/login?redirectTo=${encodeURIComponent(targetPath)}`);
  }
  return session.user;
}