import { redirect } from "next/navigation";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { serverFetch } from "@/lib/http/serverFetch";

type MarketingOverview = {
  ok: boolean;
  from: string;
  to: string;
  metrics: {
    campaigns_active: number;
    offline_events: number;
    offline_leads: number;
    seo_sem: { impressions: number; clicks: number; conversions: number; cost: number };
    website: { pageviews: number; sessions: number; users: number };
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

export default async function MarketingDashboardPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/marketing");
  if (!hasPermission(me, "read_marketing_data")) redirect("/app/no-access");

  const dr = defaultRange();
  const from = searchParams.from ?? dr.from;
  const to = searchParams.to ?? dr.to;

  const res = await serverFetch("/app/api/marketing/overview", { from, to });
  if (res.status === 401) redirect("/login?redirectTo=/app/dashboard/marketing");
  if (res.status === 403) redirect("/app/no-access");

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Marketing Dashboard</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load /app/api/marketing/overview. HTTP {res.status}
          <pre className="mt-2 whitespace-pre-wrap text-xs">{txt}</pre>
        </div>
      </div>
    );
  }

  const data = (await res.json()) as MarketingOverview;
  const m = data.metrics;

  const seo = m?.seo_sem ?? { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
  const web = m?.website ?? { pageviews: 0, sessions: 0, users: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Marketing Dashboard</h1>
          <div className="mt-1 text-sm text-gray-600">Campaigns, SEO/SEM, website, offline events</div>
        </div>
        <DateRangeFilter storageKey="ugc_filters:marketing" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard title="Active Campaigns" value={(m?.campaigns_active ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Offline Events" value={(m?.offline_events ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Offline Leads" value={(m?.offline_leads ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Clicks" value={(seo.clicks ?? 0).toLocaleString()} subtitle="SEO/SEM total" />
        <MetricCard title="Conversions" value={(seo.conversions ?? 0).toLocaleString()} subtitle="SEO/SEM total" />
        <MetricCard title="Cost" value={(seo.cost ?? 0).toLocaleString()} subtitle="SEO/SEM total" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard title="Sessions" value={(web.sessions ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Users" value={(web.users ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
        <MetricCard title="Pageviews" value={(web.pageviews ?? 0).toLocaleString()} subtitle={`${data.from} to ${data.to}`} />
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
