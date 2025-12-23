import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns a list of operations tickets. Accepts optional query
 * parameters for filtering (not implemented). Stub data is returned.
 */
export async function GET(request: Request) {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const tickets = [
    { id: 'TKT-001', subject: 'Example issue', status: 'Open', created_at: new Date().toISOString() }
  ];
  return NextResponse.json(tickets);
}