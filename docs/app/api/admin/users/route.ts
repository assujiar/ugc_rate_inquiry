import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Administrative endpoint to list users. Requires authentication and
 * appropriate permission. Returns a static list for demonstration.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Example user list
  const users = [
    { id: '1', email: 'jane@example.com', role: 'admin' },
    { id: '2', email: 'john@example.com', role: 'manager' }
  ];
  return NextResponse.json(users);
}