'use client';

import { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';

interface FieldOption {
  label: string;
  value: string;
}

const scopes: FieldOption[] = [
  { label: 'Domestics', value: 'DOM' },
  { label: 'Exim Import', value: 'EXIM_IMPORT' },
  { label: 'Exim Export', value: 'EXIM_EXPORT' },
  { label: 'Import DTD', value: 'IMPORT_DTD' },
];

// For demonstration, service types are not exhaustive.
const serviceTypes: Record<string, FieldOption[]> = {
  DOM: [
    { label: 'LTL', value: 'LTL' },
    { label: 'FTL', value: 'FTL' },
    { label: 'Warehousing', value: 'Warehousing' },
    { label: 'Fulfillment', value: 'Fulfillment' },
    { label: 'LCL (Domestic)', value: 'LCL (Domestic)' },
    { label: 'FCL (Domestic)', value: 'FCL (Domestic)' },
    { label: 'Air Freight', value: 'AF (Domestic)' },
  ],
  EXIM_IMPORT: [
    { label: 'LCL', value: 'LCL' },
    { label: 'FCL', value: 'FCL' },
    { label: 'Air Freight', value: 'AF' },
  ],
  EXIM_EXPORT: [
    { label: 'LCL', value: 'LCL' },
    { label: 'FCL', value: 'FCL' },
    { label: 'Air Freight', value: 'AF' },
  ],
  IMPORT_DTD: [
    { label: 'LCL', value: 'LCL' },
    { label: 'FCL', value: 'FCL' },
    { label: 'Air Freight', value: 'AF' },
  ],
};

export default function NewTicket() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [scope, setScope] = useState('DOM');
  const [serviceType, setServiceType] = useState('LTL');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [commodity, setCommodity] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [volume, setVolume] = useState<number | ''>('');
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!session) {
    router.push('/login');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Map ops_owner based on scope
    const opsOwner = scope;
    const { data, error: insertError } = await supabase
      .from('tickets')
      .insert({
        created_by: session.user.id,
        scope,
        service_type: serviceType,
        status: 'Submitted',
        ops_owner: opsOwner,
        origin,
        destination,
        commodity,
        qty: qty === '' ? null : Number(qty),
        weight: weight === '' ? null : Number(weight),
        volume: volume === '' ? null : Number(volume),
        pickup_date: pickupDate || null,
        notes,
        submitted_at: new Date().toISOString(),
      })
      .single();
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      router.push('/');
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 p-4 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-4">Buat Ticket Baru</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Scope</label>
            <select
              value={scope}
              onChange={(e) => {
                setScope(e.target.value);
                const firstService = serviceTypes[e.target.value as keyof typeof serviceTypes][0]?.value;
                setServiceType(firstService || '');
              }}
              className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
            >
              {scopes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
            >
              {(serviceTypes[scope] || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Commodity</label>
            <input
              type="text"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Qty</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Volume (CBM)</label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[96px] px-3 py-2 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => router.back()}>Batal</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Submit'}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}