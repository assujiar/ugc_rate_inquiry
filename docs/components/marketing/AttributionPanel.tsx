"use client";
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import type { AttributionStats } from '@/types/marketing';

/**
 * Panel showing attribution metrics. Uses the `/app/api/marketing/attribution`
 * endpoint for data.
 */
export default function AttributionPanel() {
  const [stats, setStats] = useState<AttributionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/marketing/attribution');
        if (!res.ok) throw new Error('Failed to load attribution');
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Error fetching attribution');
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
    { header: 'Channel', accessor: 'channel' as const },
    { header: 'First Touch', accessor: 'first_touch_conversions' as const },
    { header: 'Last Touch', accessor: 'last_touch_conversions' as const },
    { header: 'Assisted', accessor: 'assisted_conversions' as const }
  ];

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading attribution…</div>;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!stats || stats.length === 0) {
    return <EmptyState title="No Attribution" description="No attribution data found." />;
  }
  return <DataTable data={stats} columns={columns} />;
}