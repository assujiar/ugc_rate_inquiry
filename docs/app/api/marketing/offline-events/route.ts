import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns offline marketing events. Supports GET to list events and
 * POST to create a new event. In this simplified version we only
 * handle GET and return stub data. A full implementation would read
 * and write to the `marketing_offline_events` table.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const events = [
    {
      id: '1',
      event_name: 'Trade Show',
      location: 'Jakarta',
      event_date: new Date().toISOString().split('T')[0],
      attendees: 0,
      leads_generated: 0,
      notes: null
    }
  ];
  return NextResponse.json(events);
}