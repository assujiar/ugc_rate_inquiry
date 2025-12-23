import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Permissions } from '@/lib/rbac/permissions';

function isValidISODate(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function toPeriod(d: string) {
  return d.slice(0, 7); // YYYY-MM-DD -> YYYY-MM
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerSupabaseClient({ cookies });

  const url = new URL(request.url);
  const from = url.searchParams.get('from') ?? '';
  const to = url.searchParams.get('to') ?? '';

  if (!isValidISODate(from) || !isValidISODate(to)) {
    return NextResponse.json(
      { error: 'Invalid date range. Use ?from=YYYY-MM-DD&to=YYYY-MM-DD' },
      { status: 400 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role_id, is_active, roles(name)')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  if (profile.is_active === false) return NextResponse.json({ error: 'Inactive' }, { status: 403 });

  const { data: rpRows, error: permError } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .eq('role_id', profile.role_id);

  if (permError) return NextResponse.json({ error: permError.message }, { status: 500 });

  const perms = (rpRows ?? []).map((r: any) => r?.permissions?.name).filter(Boolean);

  if (!perms.includes(Permissions.READ_DIRECTOR_OVERVIEW)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Finance summary
  const fromPeriod = toPeriod(from);
  const toPeriodStr = toPeriod(to);

  const fm = await supabase
    .from('finance_margin')
    .select('period, revenue, cogs, margin')
    .gte('period', fromPeriod)
    .lte('period', toPeriodStr);

  const finance = (fm.data ?? []).reduce(
    (acc: any, r: any) => {
      acc.revenue += Number(r.revenue ?? 0);
      acc.cogs += Number(r.cogs ?? 0);
      acc.margin += Number(r.margin ?? 0);
      return acc;
    },
    { revenue: 0, cogs: 0, margin: 0 },
  );

  // Sales
  const newLeadsRes = await supabase
    .from('sales_leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', from)
    .lte('created_at', to);

  const openLeadsRes = await supabase
    .from('sales_leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open');

  // Ops
  const openTicketsRes = await supabase
    .from('ops_tickets')
    .select('id', { count: 'exact', head: true })
    .is('closed_at', null);

  const newTicketsRes = await supabase
    .from('ops_tickets')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', from)
    .lte('created_at', to);

  // Marketing
  const activeCampaignsRes = await supabase
    .from('marketing_campaigns')
    .select('id', { count: 'exact', head: true })
    .lte('start_date', to)
    .or(`end_date.is.null,end_date.gte.${from}`)
    .eq('status', 'active');

  const offlineRes = await supabase
    .from('offline_events')
    .select('id, leads_generated')
    .gte('event_date', from)
    .lte('event_date', to);

  const offline = (offlineRes.data ?? []).reduce(
    (acc: any, r: any) => {
      acc.events += 1;
      acc.leads += Number(r.leads_generated ?? 0);
      return acc;
    },
    { events: 0, leads: 0 },
  );

  // AR (optional)
  const arRes = await supabase
    .from('ar_aging')
    .select('amount_due, bucket')
    .lte('due_date', to);

  const arBuckets: Record<string, number> = {};
  let arTotal = 0;
  for (const r of arRes.data ?? []) {
    const bucket = String((r as any).bucket ?? 'unknown');
    const amt = Number((r as any).amount_due ?? 0);
    arBuckets[bucket] = (arBuckets[bucket] ?? 0) + amt;
    arTotal += amt;
  }

  return NextResponse.json({
    range: { from, to },
    finance,
    sales: { new_leads: newLeadsRes.count ?? 0, open_leads: openLeadsRes.count ?? 0 },
    ops: { open_tickets: openTicketsRes.count ?? 0, new_tickets: newTicketsRes.count ?? 0 },
    marketing: {
      active_campaigns: activeCampaignsRes.count ?? 0,
      offline_events: offline.events,
      offline_leads: offline.leads,
    },
    ar: { total_due: arTotal, buckets: arBuckets },
  });
}