'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';

export default function Analytics() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState<{ total: number; breached: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    async function fetchData() {
      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setIsAdmin(profile?.role === 'admin');
      if (profile?.role === 'admin') {
        // Example metrics: total tickets and total closed
        const { data: tickets } = await supabase.from('tickets').select('id, status');
        const total = tickets?.length || 0;
        const breached = 0; // compute at risk or breach if you have due dates
        setMetrics({ total, breached });
      }
      setLoading(false);
    }
    fetchData();
  }, [session, supabase, router]);

  if (!session) return null;
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 p-4">Loading...</main>
      </>
    );
  }
  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="pt-16 p-4">
          <p className="text-sm text-danger">Anda tidak memiliki akses ke halaman ini.</p>
        </main>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <main className="pt-16 p-4 space-y-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold">Analytics</h1>
        {metrics ? (
          <div className="grid grid-cols-2 gap-4">
            <GlassCard>
              <h2 className="text-sm text-text-muted">Total Tickets</h2>
              <p className="text-3xl font-semibold">{metrics.total}</p>
            </GlassCard>
            <GlassCard>
              <h2 className="text-sm text-text-muted">Breached SLA</h2>
              <p className="text-3xl font-semibold">{metrics.breached}</p>
            </GlassCard>
          </div>
        ) : (
          <p>Tidak ada data.</p>
        )}
      </main>
    </>
  );
}