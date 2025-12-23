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
  if (!hasPermission(me, "read_ops_data")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();const created = await supabase
    .from("ops_tickets")
    .select("id", { count: "exact", head: true })
    .gte("created_at", toIsoStart(from))
    .lte("created_at", toIsoEnd(to));

  const open = await supabase
    .from("ops_tickets")
    .select("id", { count: "exact", head: true })
    .is("closed_at", null);

  const closed = await supabase
    .from("ops_tickets")
    .select("id, created_at, closed_at")
    .gte("closed_at", toIsoStart(from))
    .lte("closed_at", toIsoEnd(to));

  let avgResolutionHours = 0;
  if ((closed.data ?? []).length > 0) {
    const sum = (closed.data ?? []).reduce((acc: number, r: any) => {
      const a = r.created_at ? new Date(r.created_at).getTime() : 0;
      const b = r.closed_at ? new Date(r.closed_at).getTime() : 0;
      if (!a || !b || b < a) return acc;
      return acc + (b - a) / (1000 * 60 * 60);
    }, 0);
    avgResolutionHours = sum / (closed.data ?? []).length;
  }

  const byStatus = await supabase.from("v_ops_overview").select("status, ticket_count");

  return NextResponse.json({
    ok: true,
    from,
    to,
    metrics: {
      tickets_created: created.count ?? 0,
      tickets_open: open.count ?? 0,
      tickets_closed: (closed.data ?? []).length,
      avg_resolution_hours: avgResolutionHours,
      by_status: byStatus.data ?? [],
    },
    errors: {
      created: created.error?.message ?? null,
      open: open.error?.message ?? null,
      closed: closed.error?.message ?? null,
      by_status: byStatus.error?.message ?? null,
    },
  });
}

