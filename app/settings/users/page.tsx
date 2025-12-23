'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';

interface ProfileRow {
  id: string;
  display_name: string | null;
  role: string;
}

const roles = [
  'sales',
  'marketing',
  'domestics_ops',
  'exim_ops',
  'import_dtd_ops',
  'admin',
];

export default function UsersSettings() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    async function fetchData() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      const admin = profile?.role === 'admin';
      setIsAdmin(admin);
      if (admin) {
        const { data } = await supabase.from('profiles').select('*');
        setProfiles(data as ProfileRow[]);
      }
      setLoading(false);
    }
    fetchData();
  }, [session, supabase, router]);

  async function updateRole(id: string, newRole: string) {
    setSavingId(id);
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role: newRole } : p)));
    setSavingId(null);
  }

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
      <main className="pt-16 p-4 space-y-4 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold">User Management</h1>
        <GlassCard>
          <div className="space-y-2 text-sm">
            {profiles.map((p) => (
              <div key={p.id} className="flex justify-between items-center border-b border-border/10 pb-2">
                <div>
                  <div className="font-medium">{p.display_name || p.id}</div>
                  <div className="text-xs text-text-muted">{p.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={p.role}
                    onChange={(e) => updateRole(p.id, e.target.value)}
                    disabled={savingId === p.id}
                    className="h-8 rounded-md bg-white/60 backdrop-blur-sm border border-border px-2 focus:outline-none focus:ring-2 focus:ring-highlight"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </main>
    </>
  );
}