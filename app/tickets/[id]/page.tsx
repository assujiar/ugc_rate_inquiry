'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';

interface Ticket {
  id: string;
  scope: string;
  service_type: string;
  status: string;
  origin: string | null;
  destination: string | null;
  commodity: string | null;
  qty: number | null;
  weight: number | null;
  volume: number | null;
  pickup_date: string | null;
  notes: string | null;
  created_at: string;
}

interface Event {
  id: string;
  event_type: string;
  actor_role: string;
  created_at: string;
  payload_json: any;
}

export default function TicketDetail() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const params = useParams();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    async function fetchData() {
      setLoading(true);
      const { data: t, error: tErr } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (tErr) {
        setLoading(false);
        return;
      }
      setTicket(t as Ticket);
      // fetch events
      const { data: evts } = await supabase
        .from('ticket_events')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      setEvents(evts as Event[]);
      setLoading(false);
    }
    if (ticketId) {
      fetchData();
    }
  }, [session, supabase, ticketId, router]);

  if (!session) return null;

  return (
    <>
      <Navbar />
      <main className="pt-16 p-4 space-y-4 max-w-2xl mx-auto">
        {loading || !ticket ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Ticket Detail</h1>
            <GlassCard className="space-y-2">
              <h2 className="text-lg font-medium">Summary</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Scope:</span> {ticket.scope}</div>
                <div><span className="font-medium">Service:</span> {ticket.service_type}</div>
                <div><span className="font-medium">Status:</span> {ticket.status}</div>
                <div><span className="font-medium">Origin:</span> {ticket.origin || '-'}</div>
                <div><span className="font-medium">Destination:</span> {ticket.destination || '-'}</div>
                <div><span className="font-medium">Commodity:</span> {ticket.commodity || '-'}</div>
              </div>
              <div className="text-sm text-text-muted">Notes: {ticket.notes || '-'}</div>
            </GlassCard>
            <GlassCard className="space-y-2">
              <h2 className="text-lg font-medium">Timeline</h2>
              {events.length === 0 && <p className="text-sm text-text-muted">Belum ada event.</p>}
              <ul className="space-y-2">
                {events.map((evt) => (
                  <li key={evt.id} className="flex items-start gap-2 text-sm">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <div className="font-medium">{evt.event_type}</div>
                      <div className="text-xs text-text-muted">{new Date(evt.created_at).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </>
        )}
      </main>
    </>
  );
}