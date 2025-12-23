import { NextResponse } from "next/server";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function toIsoStart(d: string) {
  return `${d}T00:00:00.000Z`;
}
function toIsoEnd(d: string) {
  return `${d}T23:59:59.999Z`;
}
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
  if (!hasPermission(me, "read_sales_overview")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();const pipeline = await supabase
    .from("v_sales_pipeline_overview")
    .select("stage_id,stage_name,sequence,lead_count,total_expected_value")
    .order("sequence", { ascending: true });

  const leadsCreated = await supabase
    .from("sales_leads")
    .select("id, expected_value", { count: "exact" })
    .gte("created_at", toIsoStart(from))
    .lte("created_at", toIsoEnd(to));

  const activities = await supabase
    .from("sales_activities")
    .select("id", { count: "exact" })
    .gte("activity_date", from)
    .lte("activity_date", to);

  const expectedValueSum =
    (leadsCreated.data ?? []).reduce((acc: number, r: any) => acc + (Number(r.expected_value) || 0), 0);

  return NextResponse.json({
    ok: true,
    from,
    to,
    metrics: {
      leads_created: leadsCreated.count ?? 0,
      leads_expected_value_sum: expectedValueSum,
      activities_count: activities.count ?? 0,
      pipeline: pipeline.data ?? [],
    },
    errors: {
      pipeline: pipeline.error?.message ?? null,
      leads: leadsCreated.error?.message ?? null,
      activities: activities.error?.message ?? null,
    },
  });
}

