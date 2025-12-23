'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';

interface TicketRow {
  id: string;
  scope: string;
  service_type: string;
  status: string;
  priority: string | null;
  origin: string | null;
  destination: string | null;
  created_at: string;
  ops_owner: string;
}

export default function OpsQueue() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    async function fetchTickets() {
      setLoading(true);
      // Determine ops owner filter based on role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      let ownerScopes: string[] = [];
      if (profile?.role === 'domestics_ops') ownerScopes = ['DOM'];
      if (profile?.role === 'exim_ops') ownerScopes = ['EXIM_IMPORT', 'EXIM_EXPORT'];
      if (profile?.role === 'import_dtd_ops') ownerScopes = ['IMPORT_DTD'];
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .in('ops_owner', ownerScopes);
      if (!error) setTickets(data as TicketRow[]);
      setLoading(false);
    }
    fetchTickets();
  }, [session, supabase, router]);

  if (!session) return null;

  return (
    <>
      <Navbar />
      <main className="pt-16 p-4 max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold">Ops Queue</h1>
        {loading ? (
          <p>Loading...</p>
        ) : tickets.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-text-muted">Tidak ada tiket di antrean Anda.</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <GlassCard key={t.id} className="p-3">
                <a href={`/tickets/${t.id}`} className="block">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium">{t.scope} - {t.service_type}</div>
                      <div className="text-xs text-text-muted">{t.origin || '-'} → {t.destination || '-'}</div>
                    </div>
                    <div className="text-xs text-text-muted">{t.status}</div>
                  </div>
                </a>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </>
  );
}