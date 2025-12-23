"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = { storageKey: string };

export function DateRangeFilter({ storageKey }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const initial = useMemo(() => {
    const from = sp.get("from") ?? "";
    const to = sp.get("to") ?? "";
    return { from, to };
  }, [sp]);

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  useEffect(() => {
    // load saved filters only if URL empty
    const hasUrl = !!(initial.from || initial.to);
    if (hasUrl) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { from?: string; to?: string };
      if (saved.from) setFrom(saved.from);
      if (saved.to) setTo(saved.to);

      const next = new URLSearchParams(sp.toString());
      if (saved.from) next.set("from", saved.from);
      if (saved.to) next.set("to", saved.to);
      router.replace(`${pathname}?${next.toString()}`);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function apply() {
    const next = new URLSearchParams(sp.toString());
    if (from) next.set("from", from);
    else next.delete("from");
    if (to) next.set("to", to);
    else next.delete("to");

    try {
      localStorage.setItem(storageKey, JSON.stringify({ from, to }));
    } catch {}

    router.push(`${pathname}?${next.toString()}`);
  }

  function clear() {
    setFrom("");
    setTo("");
    const next = new URLSearchParams(sp.toString());
    next.delete("from");
    next.delete("to");
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <div className="text-xs font-medium text-gray-600">From</div>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="mt-1 h-9 rounded-xl border border-gray-200 px-3 text-sm"
        />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-600">To</div>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1 h-9 rounded-xl border border-gray-200 px-3 text-sm"
        />
      </div>
      <button
        onClick={apply}
        className="h-9 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white"
      >
        Apply
      </button>
      <button
        onClick={clear}
        className="h-9 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Reset
      </button>
    </div>
  );
}
