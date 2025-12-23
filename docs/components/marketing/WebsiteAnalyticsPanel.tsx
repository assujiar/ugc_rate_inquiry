"use client";
import { useEffect, useState } from 'react';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { DataTable } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import type { WebsiteAnalytics } from '@/types/marketing';

/**
 * Panel presenting website analytics over time. A line chart shows
 * pageviews trend, and a table lists the raw metrics. Data is
 * retrieved from `/app/api/marketing/website-analytics`.
 */
export default function WebsiteAnalyticsPanel() {
  const [metrics, setMetrics] = useState<WebsiteAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/marketing/website-analytics');
        if (!res.ok) throw new Error('Failed to load analytics');
        const data = await res.json();
        if (!cancelled) setMetrics(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Error fetching analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    { header: 'Date', accessor: 'date' as const },
    { header: 'Pageviews', accessor: 'pageviews' as const },
    { header: 'Sessions', accessor: 'sessions' as const },
    { header: 'Users', accessor: 'users' as const },
    { header: 'Bounce Rate', accessor: 'bounce_rate' as const },
    { header: 'Avg. Session Duration', accessor: 'avg_session_duration' as const }
  ];
  const chartData = metrics.map((m) => m.pageviews);

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading analytics…</div>;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!metrics || metrics.length === 0) {
    return <EmptyState title="No Analytics" description="No website analytics available." />;
  }
  return (
    <div className="space-y-4">
      <TrendChart data={chartData} />
      <DataTable data={metrics} columns={columns} />
    </div>
  );
}