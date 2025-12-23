import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns SLA breakdown for the operations module. This stub
 * returns compliance percentages by priority level.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const sla = [
    { priority: 'Low', compliance: 0 },
    { priority: 'Medium', compliance: 0 },
    { priority: 'High', compliance: 0 }
  ];
  return NextResponse.json(sla);
}