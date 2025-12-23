"use client";
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import type { ContentPiece } from '@/types/marketing';

/**
 * Panel listing marketing content pieces like articles, videos and
 * downloadable assets. Data is fetched from `/app/api/marketing/content-pieces`.
 */
export default function ContentPiecesPanel() {
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/marketing/content-pieces');
        if (!res.ok) throw new Error('Failed to load content');
        const data = await res.json();
        if (!cancelled) setPieces(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Error fetching content');
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
    { header: 'Title', accessor: 'title' as const },
    { header: 'Type', accessor: 'content_type' as const },
    { header: 'Publish Date', accessor: 'publish_date' as const },
    { header: 'Impressions', accessor: 'impressions' as const },
    { header: 'Leads', accessor: 'leads_generated' as const }
  ];

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading content…</div>;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!pieces || pieces.length === 0) {
    return <EmptyState title="No Content" description="No marketing content pieces found." />;
  }
  return <DataTable data={pieces} columns={columns} />;
}