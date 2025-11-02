import type { ReactNode } from 'react';
import { TableSkeleton } from '@/components/skeleton/table-skeleton';

interface Column<T> {
  id: string;
  header: ReactNode;
  accessor: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Array<Column<T>>;
  emptyMessage?: ReactNode;
  isLoading?: boolean;
  caption?: string;
}

export function DataTable<T>({
  data,
  columns,
  emptyMessage,
  isLoading,
  caption
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (!data.length) {
    return (
      <div
        className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
        role="status"
      >
        {emptyMessage ?? 'داده‌ای برای نمایش وجود ندارد.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm" role="table">
          {caption ? (
            <caption className="px-4 py-2 text-start text-xs text-slate-500">{caption}</caption>
          ) : null}
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="px-4 py-3 text-right font-medium"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((item, idx) => (
              <tr key={idx} className="transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-3">
                    {column.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

