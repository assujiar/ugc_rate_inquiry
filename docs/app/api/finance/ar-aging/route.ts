import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns accounts receivable aging data per customer. Stub data provided.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const aging = [
    { customer: 'Acme Corp', bucket1: 0, bucket2: 0, bucket3: 0, bucket4: 0 }
  ];
  return NextResponse.json(aging);
}