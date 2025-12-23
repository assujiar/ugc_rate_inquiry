import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns taxonomy of reasons why deals were lost. Used for analysis.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const reasons = [
    { id: 'price', description: 'Price too high' },
    { id: 'features', description: 'Missing features' },
    { id: 'competitor', description: 'Chose competitor' }
  ];
  return NextResponse.json(reasons);
}