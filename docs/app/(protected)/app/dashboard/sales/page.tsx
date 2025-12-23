import { redirect } from "next/navigation";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { serverFetch } from "@/lib/http/serverFetch";

type SalesOverview = {
  ok: boolean;
  from: string;
  to: string;
  metrics: {
    leads_created: number;
    leads_expected_value_sum: number;
    activities_count: number;
    pipeline: Array<{
      stage_id: string;
      stage_name: string;
      sequence: number;
      lead_count: number;
      total_expected_value: number;
    }>;
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

export default async function SalesDashboardPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/sales");
  if (!hasPermission(me, "read_sales_overview")) redirect("/app/no-access");

  const dr = defaultRange();
  const from = searchParams.from ?? dr.from;
  const to = searchParams.to ?? dr.to;

  const res = await serverFetch("/app/api/sales/overview", { from, to });
  if (res.status === 401) redirect("/login?redirectTo=/app/dashboard/sales");
  if (res.status === 403) redirect("/app/no-access");

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Sales Dashboard</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load /app/api/sales/overview. HTTP {res.status}
          <pre className="mt-2 whitespace-pre-wrap text-xs">{txt}</pre>
        </div>
      </div>
    );
  }

  const data = (await res.json()) as SalesOverview;
  const m = data.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sales Dashboard</h1>
          <div className="mt-1 text-sm text-gray-600">Overview pipeline & activity</div>
        </div>
        <DateRangeFilter storageKey="ugc_filters:sales" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard title="Leads Created" value={(m?.leads_created ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Expected Value (Sum)" value={(m?.leads_expected_value_sum ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Activities" value={(m?.activities_count ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Pipeline by Stage</div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Stage</th>
                <th className="py-2 pr-3">Leads</th>
                <th className="py-2 pr-3">Expected Value</th>
              </tr>
            </thead>
            <tbody>
              {(m?.pipeline ?? []).map((r) => (
                <tr key={r.stage_id} className="border-t border-gray-100">
                  <td className="py-2 pr-3 font-medium text-gray-900">{r.stage_name}</td>
                  <td className="py-2 pr-3 text-gray-700">{(Number(r.lead_count) || 0).toLocaleString()}</td>
                  <td className="py-2 pr-3 text-gray-700">{(Number(r.total_expected_value) || 0).toLocaleString()}</td>
                </tr>
              ))}
              {(m?.pipeline ?? []).length === 0 ? (
                <tr className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-500" colSpan={3}>No pipeline data.</td>
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
