"use client";

import { useEffect, useState } from "react";

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch("/app/api/me", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as any;
      })
      .then((data) => {
        if (!mounted) return;
        setPermissions(Array.isArray(data?.permissions) ? data.permissions : []);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setPermissions([]);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { permissions, loading };
}
