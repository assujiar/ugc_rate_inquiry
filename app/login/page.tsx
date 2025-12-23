'use client';

import { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) {
    router.push('/');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 p-4 flex flex-col items-center">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold mb-4">Masuk</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/60 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Memuat...' : 'Masuk'}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}