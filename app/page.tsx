'use client';

import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 p-4 space-y-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        {/* Example KPI cards */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard>
            <h2 className="text-sm text-text-muted">Open Tickets</h2>
            <p className="text-3xl font-semibold">0</p>
          </GlassCard>
          <GlassCard>
            <h2 className="text-sm text-text-muted">Breached SLA</h2>
            <p className="text-3xl font-semibold">0</p>
          </GlassCard>
        </div>
        <GlassCard>
          <h2 className="text-lg font-medium mb-2">My Tickets</h2>
          <p className="text-sm text-text-muted">Belum ada tiket. Gunakan tombol New Ticket untuk membuat permintaan tarif baru.</p>
        </GlassCard>
      </main>
    </>
  );
}