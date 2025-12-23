import type { ReactNode } from "react";

export function MetricCard({
  title,
  value,
  subtitle,
  right,
}: {
  title: string;
  value: ReactNode;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
