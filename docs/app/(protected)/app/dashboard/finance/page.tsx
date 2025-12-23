import { redirect } from "next/navigation";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { serverFetch } from "@/lib/http/serverFetch";

type FinanceOverview = {
  ok: boolean;
  from: string;
  to: string;
  metrics: {
    margin: { revenue: number; cogs: number; margin: number };
    ar_by_bucket: Record<string, number>;
    months_included?: { start: string; end: string };
  };
  errors?: Record<string, string | null>;
};

function defaultRange() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

export default async function FinanceDashboardPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/finance");
  if (!hasPermission(me, "read_finance_data")) redirect("/app/no-access");

  const dr = defaultRange();
  const from = searchParams.from ?? dr.from;
  const to = searchParams.to ?? dr.to;

  const res = await serverFetch("/app/api/finance/overview", { from, to });
  if (res.status === 401) redirect("/login?redirectTo=/app/dashboard/finance");
  if (res.status === 403) redirect("/app/no-access");

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Finance Dashboard</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load /app/api/finance/overview. HTTP {res.status}
          <pre className="mt-2 whitespace-pre-wrap text-xs">{txt}</pre>
        </div>
      </div>
    );
  }

  const data = (await res.json()) as FinanceOverview;
  const m = data.metrics?.margin ?? { revenue: 0, cogs: 0, margin: 0 };
  const ar = data.metrics?.ar_by_bucket ?? {};

  const marginPct = m.revenue > 0 ? (m.margin / m.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Finance Dashboard</h1>
          <div className="mt-1 text-sm text-gray-600">Margin + AR aging buckets</div>
        </div>
        <DateRangeFilter storageKey="ugc_filters:finance" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Revenue" value={(m.revenue ?? 0).toLocaleString()} subtitle={`${data.metrics?.months_included?.start ?? ""} to ${data.metrics?.months_included?.end ?? ""}`} />
        <MetricCard title="COGS" value={(m.cogs ?? 0).toLocaleString()} subtitle="finance_margin total" />
        <MetricCard title="Margin" value={(m.margin ?? 0).toLocaleString()} subtitle={`Margin %: ${marginPct.toFixed(1)}%`} />
        <MetricCard title="AR Total" value={Object.values(ar).reduce((a, b) => a + (Number(b) || 0), 0).toLocaleString()} subtitle={`Up to ${data.to}`} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">AR by Bucket</div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Bucket</th>
                <th className="py-2 pr-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(ar).sort().map((k) => (
                <tr key={k} className="border-t border-gray-100">
                  <td className="py-2 pr-3 font-medium text-gray-900">{k}</td>
                  <td className="py-2 pr-3 text-gray-700">{(Number(ar[k]) || 0).toLocaleString()}</td>
                </tr>
              ))}
              {Object.keys(ar).length === 0 ? (
                <tr className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-500" colSpan={2}>No AR data.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Data Health</div>
        <div className="mt-2 text-sm text-gray-700">
          {data.errors ? (
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(data.errors).map(([k, v]) => (
                <li key={k}>
                  <span className="font-medium">{k}:</span>{" "}
                  {v ? <span className="text-red-700">{v}</span> : <span className="text-green-700">OK</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No error payload.</div>
          )}
        </div>
      </div>
    </div>
  );
}
