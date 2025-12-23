import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns recent activity items for the sales dashboard. Activity
 * could include calls, emails, meetings, etc. Stubbed for now.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const activities = [
    { id: '1', type: 'call', subject: 'Follow up with client', date: new Date().toISOString() }
  ];
  return NextResponse.json(activities);
}