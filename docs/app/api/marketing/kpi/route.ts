import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns marketing KPIs such as cost per lead or return on ad spend.
 * Stub data is returned. In a full implementation the KPIs would be
 * computed from underlying metrics.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const kpis = [
    { id: 'cpl', name: 'Cost per Lead', description: null, value: 0 },
    { id: 'roas', name: 'Return on Ad Spend', description: null, value: 0 }
  ];
  return NextResponse.json(kpis);
}