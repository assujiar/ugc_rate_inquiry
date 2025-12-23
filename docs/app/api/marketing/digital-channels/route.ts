import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns metrics across various digital channels (e.g., social, email).
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const channels = [
    { id: 'facebook', channel_name: 'Facebook', visits: 0, leads: 0, conversions: 0, cost: 0, report_date: new Date().toISOString().split('T')[0] },
    { id: 'instagram', channel_name: 'Instagram', visits: 0, leads: 0, conversions: 0, cost: 0, report_date: new Date().toISOString().split('T')[0] }
  ];
  return NextResponse.json(channels);
}