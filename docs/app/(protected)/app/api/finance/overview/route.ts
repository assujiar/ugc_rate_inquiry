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
function monthKey(d: string) {
  // d: YYYY-MM-DD -> YYYY-MM
  return d.slice(0, 7);
}
export async function GET(req: Request) {
  const url = new URL(req.url);
  const dr = defaultRange();
  const from = url.searchParams.get("from") ?? dr.from;
  const to = url.searchParams.get("to") ?? dr.to;

  const me = await getMeServer();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasPermission(me, "read_finance_data")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();const startM = monthKey(from);
  const endM = monthKey(to);

  const marginRows = await supabase
    .from("finance_margin")
    .select("period,revenue,cogs,margin")
    .gte("period", startM)
    .lte("period", endM);

  const totals = (marginRows.data ?? []).reduce(
    (acc: any, r: any) => {
      acc.revenue += Number(r.revenue) || 0;
      acc.cogs += Number(r.cogs) || 0;
      acc.margin += Number(r.margin) || 0;
      return acc;
    },
    { revenue: 0, cogs: 0, margin: 0 }
  );

  const ar = await supabase
    .from("ar_aging")
    .select("bucket, amount_due, due_date")
    .lte("due_date", to);

  const arByBucket: Record<string, number> = {};
  for (const r of ar.data ?? []) {
    const b = String((r as any).bucket ?? "unknown");
    arByBucket[b] = (arByBucket[b] ?? 0) + (Number((r as any).amount_due) || 0);
  }

  return NextResponse.json({
    ok: true,
    from,
    to,
    metrics: {
      margin: totals,
      ar_by_bucket: arByBucket,
      months_included: { start: startM, end: endM },
    },
    errors: {
      margin: marginRows.error?.message ?? null,
      ar: ar.error?.message ?? null,
    },
  });
}

