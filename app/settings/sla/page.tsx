'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';

interface SLAProfile {
  id: string;
  name: string;
  scope: string;
  service_type: string | null;
  target_frt_minutes: number | null;
  target_quote_minutes: number | null;
  at_risk_ratio: number | null;
}

const scopes = [
  { label: 'Domestics', value: 'DOM' },
  { label: 'Exim Import', value: 'EXIM_IMPORT' },
  { label: 'Exim Export', value: 'EXIM_EXPORT' },
  { label: 'Import DTD', value: 'IMPORT_DTD' },
];

export default function SLASettings() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<SLAProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    scope: 'DOM',
    service_type: '',
    target_frt_minutes: '',
    target_quote_minutes: '',
    at_risk_ratio: '0.8',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        const { data } = await supabase.from('sla_profiles').select('*');
        setProfiles(data as SLAProfile[]);
      }
      setLoading(false);
    }
    fetchData();
  }, [session, supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: insertError, data } = await supabase
      .from('sla_profiles')
      .insert({
        name: form.name,
        scope: form.scope,
        service_type: form.service_type || null,
        target_frt_minutes: form.target_frt_minutes ? Number(form.target_frt_minutes) : null,
        target_quote_minutes: form.target_quote_minutes ? Number(form.target_quote_minutes) : null,
        at_risk_ratio: form.at_risk_ratio ? Number(form.at_risk_ratio) : null,
      })
      .single();
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      setProfiles((prev) => (data ? [...prev, data] : prev));
      setForm({ name: '', scope: 'DOM', service_type: '', target_frt_minutes: '', target_quote_minutes: '', at_risk_ratio: '0.8' });
    }
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
        <h1 className="text-xl font-semibold">SLA Settings</h1>
        <GlassCard>
          <h2 className="text-lg font-medium mb-2">Tambah SLA Profile</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <label className="block mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-9 px-2 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block mb-1">Scope</label>
              <select
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                className="w-full h-9 px-2 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              >
                {scopes.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Service Type</label>
              <input
                type="text"
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full h-9 px-2 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block mb-1">Target FRT (min)</label>
              <input
                type="number"
                value={form.target_frt_minutes}
                onChange={(e) => setForm({ ...form, target_frt_minutes: e.target.value })}
                className="w-full h-9 px-2 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block mb-1">Target Quote (min)</label>
              <input
                type="number"
                value={form.target_quote_minutes}
                onChange={(e) => setForm({ ...form, target_quote_minutes: e.target.value })}
                className="w-full h-9 px-2 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block mb-1">At Risk Ratio</label>
              <input
                type="number"
                step="0.01"
                value={form.at_risk_ratio}
                onChange={(e) => setForm({ ...form, at_risk_ratio: e.target.value })}
                className="w-full h-9 px-2 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            {error && <p className="col-span-2 text-danger">{error}</p>}
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setForm({ name: '', scope: 'DOM', service_type: '', target_frt_minutes: '', target_quote_minutes: '', at_risk_ratio: '0.8' })}>Reset</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Tambah'}</Button>
            </div>
          </form>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-medium mb-2">Daftar SLA Profiles</h2>
          <div className="space-y-2 text-sm">
            {profiles.length === 0 && <p className="text-text-muted">Belum ada profil SLA.</p>}
            {profiles.map((p) => (
              <div key={p.id} className="flex justify-between items-center border-b border-border/10 pb-2">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-text-muted">{p.scope} • {p.service_type || 'All'}</div>
                </div>
                <div className="text-xs text-text-muted flex flex-col items-end">
                  <span>FRT: {p.target_frt_minutes ?? '-'}m</span>
                  <span>Quote: {p.target_quote_minutes ?? '-'}m</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </main>
    </>
  );
}