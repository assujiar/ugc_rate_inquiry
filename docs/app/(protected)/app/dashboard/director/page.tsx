import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Permissions } from "@/lib/rbac/permissions";

function isValidISODate(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function defaultRange() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

function toPeriod(d: string) {
  return d.slice(0, 7); // YYYY-MM
}

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function formatIDR(v: number) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
  } catch {
    return String(v);
  }
}

export default async function DirectorDashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const dr = defaultRange();
  const from = searchParams.from && isValidISODate(searchParams.from) ? searchParams.from : dr.from;
  const to = searchParams.to && isValidISODate(searchParams.to) ? searchParams.to : dr.to;

  const supabase = createServerComponentClient({ cookies });

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/login?redirectTo=/app/dashboard/director");

  const profRes = await supabase
    .from("profiles")
    .select("id, role_id, is_active, roles(name)")
    .eq("id", user.id)
    .maybeSingle<any>();

  if (profRes.error) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Director Dashboard</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Profile error: {profRes.error.message}
        </div>
      </div>
    );
  }

  const profile = profRes.data;
  if (!profile || profile.is_active === false) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Director Dashboard</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          Profile tidak ditemukan atau akun tidak aktif.
        </div>
      </div>
    );
  }

  const permRes = await supabase
    .from("role_permissions")
    .select("permissions(name)")
    .eq("role_id", profile.role_id);

  if (permRes.error) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Director Dashboard</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Permission error: {permRes.error.message}
        </div>
      </div>
    );
  }

  const perms = (permRes.data ?? []).map((r: any) => r?.permissions?.name).filter(Boolean);

  if (!perms.includes(Permissions.READ_DIRECTOR_OVERVIEW)) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Director Dashboard</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          Anda tidak memiliki akses ke dashboard Director.
        </div>
      </div>
    );
  }

  // ===== Aggregate metrics (minimal, safe defaults) =====
  const fromPeriod = toPeriod(from);
  const toPeriodStr = toPeriod(to);

  const fm = await supabase
    .from("finance_margin")
    .select("period, revenue, cogs, margin")
    .gte("period", fromPeriod)
    .lte("period", toPeriodStr);

  const financeAgg = (fm.data ?? []).reduce(
    (acc: any, r: any) => {
      acc.revenue += n(r.revenue);
      acc.cogs += n(r.cogs);
      acc.margin += n(r.margin);
      return acc;
    },
    { revenue: 0, cogs: 0, margin: 0 }
  );

  const newLeads = await supabase
    .from("sales_leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", from)
    .lte("created_at", to);

  const openTickets = await supabase
    .from("ops_tickets")
    .select("id", { count: "exact", head: true })
    .is("closed_at", null);

  const activeCampaigns = await supabase
    .from("marketing_campaigns")
    .select("id", { count: "exact", head: true })
    .lte("start_date", to)
    .or(`end_date.is.null,end_date.gte.${from}`)
    .eq("status", "active");

  const arRes = await supabase
    .from("ar_aging")
    .select("amount_due")
    .lte("due_date", to);

  const arTotal = (arRes.data ?? []).reduce((acc: number, r: any) => acc + n(r.amount_due), 0);

  const cards = [
    { title: "Revenue", value: formatIDR(financeAgg.revenue), sub: `${fromPeriod} to ${toPeriodStr}` },
    { title: "Margin", value: formatIDR(financeAgg.margin), sub: `${fromPeriod} to ${toPeriodStr}` },
    { title: "New Leads", value: String(newLeads.count ?? 0), sub: `${from} to ${to}` },
    { title: "Open Tickets", value: String(openTickets.count ?? 0), sub: "Current open" },
    { title: "Active Campaigns", value: String(activeCampaigns.count ?? 0), sub: "Marketing" },
    { title: "AR Total Due", value: formatIDR(arTotal), sub: `Up to ${to}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Director Dashboard</h1>
        <div className="mt-1 text-sm text-gray-600">Cross-function overview ({from} → {to})</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{c.title}</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">{c.value}</div>
            <div className="mt-1 text-xs text-gray-500">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Data Sources</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>finance_margin (period-based)</li>
          <li>sales_leads (created_at)</li>
          <li>ops_tickets (closed_at)</li>
          <li>marketing_campaigns (start_date/end_date/status)</li>
          <li>ar_aging (due_date/amount_due)</li>
        </ul>
      </div>
    </div>
  );
}