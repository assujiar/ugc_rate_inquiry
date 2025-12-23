import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns marketing content pieces such as blog posts or videos.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const pieces = [
    {
      id: '1',
      title: 'Placeholder Article',
      content_type: 'Article',
      publish_date: new Date().toISOString().split('T')[0],
      impressions: 0,
      leads_generated: 0
    }
  ];
  return NextResponse.json(pieces);
}