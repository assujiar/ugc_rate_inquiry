import React from 'react';

/**
 * Represents a column definition for the DataTable. The `accessor`
 * property should correspond to a key on the data objects passed in.
 */
export interface DataTableColumn<T> {
  header: string;
  accessor: keyof T;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
}

/**
 * Generic data table component used across dashboards. It accepts an
 * array of data objects and column definitions and renders a
 * responsive HTML table. You can extend this component to support
 * sorting, filtering, and pagination.
 */
export function DataTable<T extends Record<string, any>>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={String(col.accessor)} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {String(row[col.accessor] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}