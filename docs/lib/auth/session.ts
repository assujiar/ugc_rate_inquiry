import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

/**
 * Fetches the current user and session data on the server. Returns null
 * if no session exists.
 */
export async function getCurrentUser() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

/**
 * Fetches the current session from Supabase. Returns undefined if not authenticated.
 */
export async function getSession() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  return data.session;
}