import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns summary metrics for the sales dashboard. In a real
 * implementation this would aggregate data from the sales tables.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const metrics = {
    leads: 0,
    opportunities: 0,
    closedDeals: 0
  };
  return NextResponse.json(metrics);
}