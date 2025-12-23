import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Administrative endpoint to list all defined permissions. In a
 * production system this would query the `permissions` table. Here
 * we return a static list.
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const permissions = [
    { id: 'read_sales', description: 'View sales data' },
    { id: 'create_sales', description: 'Create sales records' },
    { id: 'read_marketing', description: 'View marketing data' },
    { id: 'create_marketing', description: 'Create marketing records' }
  ];
  return NextResponse.json(permissions);
}