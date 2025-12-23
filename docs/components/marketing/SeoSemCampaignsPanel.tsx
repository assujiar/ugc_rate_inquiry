"use client";
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import type { SeoSemCampaign } from '@/types/marketing';

/**
 * Panel showing SEO/SEM campaign performance. Data is fetched from
 * `/app/api/marketing/seo-sem-campaigns` and displayed in a table.
 */
export default function SeoSemCampaignsPanel() {
  const [campaigns, setCampaigns] = useState<SeoSemCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/marketing/seo-sem-campaigns');
        if (!res.ok) throw new Error('Failed to load campaigns');
        const data = await res.json();
        if (!cancelled) setCampaigns(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Error fetching campaigns');
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
    { header: 'Keyword', accessor: 'keyword' as const },
    { header: 'Impressions', accessor: 'impressions' as const },
    { header: 'Clicks', accessor: 'clicks' as const },
    { header: 'Conversions', accessor: 'conversions' as const },
    { header: 'Cost', accessor: 'cost' as const }
  ];

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading campaigns…</div>;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!campaigns || campaigns.length === 0) {
    return <EmptyState title="No Campaigns" description="No SEO/SEM campaigns found." />;
  }
  return <DataTable data={campaigns} columns={columns} />;
}