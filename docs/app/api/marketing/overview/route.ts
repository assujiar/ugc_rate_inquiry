import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns overview metrics for the marketing dashboard, such as total
 * leads generated and total spend. Stubbed data is returned here.
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
    spend: 0,
    campaigns: 0
  };
  return NextResponse.json(metrics);
}