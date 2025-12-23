import { NextResponse } from "next/server";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function defaultRange() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dr = defaultRange();
  const from = url.searchParams.get("from") ?? dr.from;
  const to = url.searchParams.get("to") ?? dr.to;

  const me = await getMeServer();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasPermission(me, "read_marketing_data")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();// active campaign: start_date <= to AND (end_date is null OR end_date >= from)
  const campaignsActive = await supabase
    .from("marketing_campaigns")
    .select("id", { count: "exact", head: true })
    .lte("start_date", to)
    .or("end_date.is.null,end_date.gte." + from)
    .eq("status", "active");

  const offline = await supabase
    .from("offline_events")
    .select("id, leads_generated", { count: "exact" })
    .gte("event_date", from)
    .lte("event_date", to);

  const seoSem = await supabase
    .from("seo_sem_campaigns")
    .select("impressions, clicks, conversions, cost")
    .lte("start_date", to)
    .gte("end_date", from);

  const web = await supabase
    .from("website_analytics")
    .select("pageviews, sessions, users")
    .gte("date", from)
    .lte("date", to);

  const offlineLeadsSum =
    (offline.data ?? []).reduce((acc: number, r: any) => acc + (Number(r.leads_generated) || 0), 0);

  const seo = (seoSem.data ?? []).reduce(
    (acc: any, r: any) => {
      acc.impressions += Number(r.impressions) || 0;
      acc.clicks += Number(r.clicks) || 0;
      acc.conversions += Number(r.conversions) || 0;
      acc.cost += Number(r.cost) || 0;
      return acc;
    },
    { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
  );

  const webAgg = (web.data ?? []).reduce(
    (acc: any, r: any) => {
      acc.pageviews += Number(r.pageviews) || 0;
      acc.sessions += Number(r.sessions) || 0;
      acc.users += Number(r.users) || 0;
      return acc;
    },
    { pageviews: 0, sessions: 0, users: 0 }
  );

  return NextResponse.json({
    ok: true,
    from,
    to,
    metrics: {
      campaigns_active: campaignsActive.count ?? 0,
      offline_events: offline.count ?? 0,
      offline_leads: offlineLeadsSum,
      seo_sem: seo,
      website: webAgg,
    },
    errors: {
      campaigns: campaignsActive.error?.message ?? null,
      offline: offline.error?.message ?? null,
      seo_sem: seoSem.error?.message ?? null,
      website: web.error?.message ?? null,
    },
  });
}

