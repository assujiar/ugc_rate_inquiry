import React from 'react';
import clsx from 'clsx';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>(props: TableProps<T>) {
  const { data, columns, loading = false, error = null, className } = props;
  if (loading) {
    return <div className="py-4 text-center text-sm text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="py-4 text-center text-sm text-red-600">{error}</div>;
  }
  if (!data || data.length === 0) {
    return <div className="py-4 text-center text-sm text-gray-500">No data</div>;
  }
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, idx) => (
            <tr key={(row as any).id ?? idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {col.render ? col.render((row as any)[col.key], row) : (row as any)[col.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}