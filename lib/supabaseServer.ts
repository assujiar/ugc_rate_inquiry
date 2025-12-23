import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

/**
 * Creates a Supabase client using service role. This should only be used
 * in server-side contexts (e.g. API routes, server actions) and never
 * exposed to the browser. The service role key is read from the
 * environment variable SUPABASE_SERVICE_ROLE_KEY.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase service environment variables are missing');
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });
}