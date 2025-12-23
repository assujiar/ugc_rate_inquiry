/**
 * Generic KPI representation used across dashboards. A KPI has a name, a value,
 * an optional target, and an optional trend indicator (percentage change).
 */
export interface Kpi {
  id: string;
  name: string;
  value: number;
  target?: number | null;
  trend?: number | null;
  unit?: string | null;
}

/**
 * Structure for chart data. Each entry in the series array represents a data point
 * keyed by the x-axis (e.g., date) and multiple y-values.
 */
export interface ChartDataPoint {
  x: string;
  [key: string]: number | string;
}

export interface ChartSeries {
  label: string;
  data: Array<{ x: string; y: number }>;
  color?: string;
}