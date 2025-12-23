'use client';

import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="glass-soft fixed top-0 z-40 w-full h-14 flex items-center justify-between px-4 backdrop-blur-md">
      <div className="text-lg font-bold text-text-strong">Rate Request</div>
      {session ? (
        <div className="flex items-center gap-4 text-sm">
          <Link href="/">Dashboard</Link>
          <Link href="/tickets/new">New Ticket</Link>
          {/* Additional role-based links could be rendered here */}
          <button
            onClick={handleLogout}
            className="text-sm text-primary-2 hover:text-primary"
          >
            Logout
          </button>
        </div>
      ) : null}
    </nav>
  );
}