import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns SEO/SEM campaign metrics such as impressions, clicks and
 * conversions. Stub data is returned for demonstration.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const campaigns = [
    {
      id: '1',
      keyword: 'example keyword',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    }
  ];
  return NextResponse.json(campaigns);
}