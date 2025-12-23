import React from 'react';

export interface TrendChartProps {
  data: Array<{ x: string; y: number }>;
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Renders a simple line chart using SVG. This is a lightweight alternative to
 * third-party chart libraries and is suitable for small datasets.
 */
export const TrendChart: React.FC<TrendChartProps> = ({ data, width = 400, height = 120, color = '#ff4600' }) => {
  if (!data || data.length === 0) {
    return <div className="py-4 text-center text-sm text-gray-500">No data</div>;
  }
  // Normalize data
  const values = data.map((d) => d.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const yRange = maxY - minY || 1;
  const points = data.map((d, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((d.y - minY) / yRange) * height;
    return `${x},${y}`;
  });
  const dPath = 'M ' + points.join(' L ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={dPath} fill="none" stroke={color} strokeWidth="2" />
      {points.map((pt, idx) => {
        const [cx, cy] = pt.split(',').map(Number);
        return <circle key={idx} cx={cx} cy={cy} r={3} fill={color} />;
      })}
    </svg>
  );
};