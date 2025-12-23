import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Administrative endpoint to list roles. Returns a static set of roles
 * for demonstration. A full implementation would query the
 * `roles` table.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const roles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'director', name: 'Director' },
    { id: 'sales', name: 'Sales' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'ops', name: 'Operations' },
    { id: 'finance', name: 'Finance' }
  ];
  return NextResponse.json(roles);
}