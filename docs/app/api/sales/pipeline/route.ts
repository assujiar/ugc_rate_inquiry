import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns pipeline data for sales. This is stub data to illustrate
 * the API contract. Each stage includes the number of deals and
 * associated value.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const pipeline = [
    { stage: 'Prospecting', count: 0, value: 0 },
    { stage: 'Qualified', count: 0, value: 0 },
    { stage: 'Proposal', count: 0, value: 0 },
    { stage: 'Negotiation', count: 0, value: 0 },
    { stage: 'Closed Won', count: 0, value: 0 }
  ];
  return NextResponse.json(pipeline);
}