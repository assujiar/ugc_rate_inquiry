import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns a list of permissions for the current user. This is used
 * client-side to hide or show UI elements based on what the user
 * can do. The example implementation returns a static set of
 * permissions; a real implementation would look up permissions via
 * joins to the `roles` and `role_permissions` tables in Supabase.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json([], { status: 401 });
  }
  // TODO: fetch real permissions based on the user's role
  const permissions = ['read_sales', 'read_marketing', 'read_ops', 'read_finance'];
  return NextResponse.json(permissions);
}