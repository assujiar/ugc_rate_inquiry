import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns daily website analytics metrics. Each record represents a day.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const analytics = [
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      pageviews: 0,
      sessions: 0,
      users: 0,
      bounce_rate: 0,
      avg_session_duration: 0
    }
  ];
  return NextResponse.json(analytics);
}