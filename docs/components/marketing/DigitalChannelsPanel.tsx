"use client";
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import type { DigitalChannelMetrics } from '@/types/marketing';

/**
 * Panel summarising performance across digital channels. Data comes
 * from `/app/api/marketing/digital-channels` and is displayed in a table.
 */
export default function DigitalChannelsPanel() {
  const [channels, setChannels] = useState<DigitalChannelMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/marketing/digital-channels');
        if (!res.ok) throw new Error('Failed to load channels');
        const data = await res.json();
        if (!cancelled) setChannels(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Error fetching channels');
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
    { header: 'Channel', accessor: 'channel_name' as const },
    { header: 'Visits', accessor: 'visits' as const },
    { header: 'Leads', accessor: 'leads' as const },
    { header: 'Conversions', accessor: 'conversions' as const },
    { header: 'Cost', accessor: 'cost' as const }
  ];

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading channels…</div>;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!channels || channels.length === 0) {
    return <EmptyState title="No Channels" description="No digital channel data available." />;
  }
  return <DataTable data={channels} columns={columns} />;
}