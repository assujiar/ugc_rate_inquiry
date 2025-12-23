import { redirect } from "next/navigation";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { serverFetch } from "@/lib/http/serverFetch";

type OpsOverview = {
  ok: boolean;
  from: string;
  to: string;
  metrics: {
    tickets_created: number;
    tickets_open: number;
    tickets_closed: number;
    avg_resolution_hours: number;
    by_status: Array<{ status: string; ticket_count: number }>;
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

export default async function OpsDashboardPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/ops");
  if (!hasPermission(me, "read_ops_data")) redirect("/app/no-access");

  const dr = defaultRange();
  const from = searchParams.from ?? dr.from;
  const to = searchParams.to ?? dr.to;

  const res = await serverFetch("/app/api/ops/overview", { from, to });
  if (res.status === 401) redirect("/login?redirectTo=/app/dashboard/ops");
  if (res.status === 403) redirect("/app/no-access");

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Operations Dashboard</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load /app/api/ops/overview. HTTP {res.status}
          <pre className="mt-2 whitespace-pre-wrap text-xs">{txt}</pre>
        </div>
      </div>
    );
  }

  const data = (await res.json()) as OpsOverview;
  const m = data.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Operations Dashboard</h1>
          <div className="mt-1 text-sm text-gray-600">Ticketing health & SLA proxy metrics</div>
        </div>
        <DateRangeFilter storageKey="ugc_filters:ops" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Tickets Created" value={(m?.tickets_created ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Open Tickets" value={(m?.tickets_open ?? 0).toLocaleString()} subtitle="Current open" />
        <MetricCard title="Tickets Closed" value={(m?.tickets_closed ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Avg Resolution (hrs)" value={Number(m?.avg_resolution_hours ?? 0).toFixed(1)} subtitle={`${data.from} to ${data.to}`} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Tickets by Status</div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Count</th>
              </tr>
            </thead>
            <tbody>
              {(m?.by_status ?? []).map((r, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="py-2 pr-3 font-medium text-gray-900">{r.status}</td>
                  <td className="py-2 pr-3 text-gray-700">{(Number(r.ticket_count) || 0).toLocaleString()}</td>
                </tr>
              ))}
              {(m?.by_status ?? []).length === 0 ? (
                <tr className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-500" colSpan={2}>No status breakdown.</td>
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
