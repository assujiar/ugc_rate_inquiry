"use client";
import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';

interface MarketingKpiMetric {
  id: string;
  name: string;
  description: string | null;
  value: number;
}

/**
 * Panel displaying key marketing KPIs using the KpiCard component.
 * Data is fetched from `/app/api/marketing/kpi`. Each KPI is
 * rendered as a card with its current value.
 */
export default function MarketingKpiPanel() {
  const [kpis, setKpis] = useState<MarketingKpiMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/marketing/kpi');
        if (!res.ok) throw new Error('Failed to load KPIs');
        const data = await res.json();
        if (!cancelled) setKpis(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Error fetching KPIs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading KPIs…</div>;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!kpis || kpis.length === 0) {
    return <EmptyState title="No KPIs" description="No marketing KPIs found." />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} label={kpi.name} value={String(kpi.value)} trend={0} />
      ))}
    </div>
  );
}