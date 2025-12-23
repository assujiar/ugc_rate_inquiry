import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './types';

// Helper to create a Supabase client in the browser. We strongly avoid storing
// the service role key in the browser; only the anon key is used here.
export function createClient() {
  return createBrowserSupabaseClient<Database>();
}

export const supabase = createClient();