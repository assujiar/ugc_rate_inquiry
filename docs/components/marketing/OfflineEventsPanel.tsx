"use client";
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import type { OfflineEvent } from '@/types/marketing';

/**
 * Panel displaying a list of offline marketing events. Data is
 * fetched from the `/app/api/marketing/offline-events` endpoint. If
 * there are no events, an empty state is shown. Errors are
 * presented using the `ErrorState` component.
 */
export default function OfflineEventsPanel() {
  const [events, setEvents] = useState<OfflineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch('/app/api/marketing/offline-events');
        if (!res.ok) throw new Error('Failed to load events');
        const data = await res.json();
        if (!cancelled) {
          setEvents(data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Error fetching events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    { header: 'Event', accessor: 'event_name' as const },
    { header: 'Location', accessor: 'location' as const },
    { header: 'Date', accessor: 'event_date' as const },
    { header: 'Attendees', accessor: 'attendees' as const },
    { header: 'Leads', accessor: 'leads_generated' as const }
  ];

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading events…</div>;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!events || events.length === 0) {
    return <EmptyState title="No Events" description="No offline events have been recorded." />;
  }
  return <DataTable data={events} columns={columns} />;
}