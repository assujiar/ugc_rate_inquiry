"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Me = {
  user: { id: string; email: string | null };
  profile: { full_name: string | null; role_name: string | null };
};

export function UserSidebar() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/app/api/me", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as Me;
      })
      .then((data) => {
        if (mounted && data?.user) setMe(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="px-3">
      <div className="text-xs text-gray-500">Signed in as</div>
      <div className="mt-1 text-sm font-medium text-gray-900">
        {me?.profile?.full_name ?? "User"}
      </div>
      <div className="text-xs text-gray-500">{me?.user?.email ?? ""}</div>
      <div className="mt-1 text-xs text-gray-500">
        Role: <span className="font-medium">{me?.profile?.role_name ?? "-"}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <a
          href="/logout"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Logout
        </a>
      </div>
    </div>
  );
}

