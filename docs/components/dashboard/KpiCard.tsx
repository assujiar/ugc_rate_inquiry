import React from 'react';
import { formatNumber, formatCurrency } from '@/lib/utils/format';

export interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  target?: number | null;
  trend?: number | null;
  currency?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, target, trend, currency = false }) => {
  const formatted = currency ? formatCurrency(Number(value)) : formatNumber(Number(value));
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="mt-1 flex items-baseline space-x-1">
        <span className="text-2xl font-semibold text-gray-900">
          {formatted}
          {unit && !currency && <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>}
        </span>
        {trend !== undefined && trend !== null && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</span>
        )}
      </div>
      {target !== undefined && target !== null && (
        <div className="mt-1 text-xs text-gray-500">Target: {currency ? formatCurrency(target) : target}</div>
      )}
    </div>
  );
};