export default function DataTable({
  columns,
  rows,
  empty = 'No records found',
  emptyDetail,
  emptyAction,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-100 p-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-4 py-3">
              <div className="h-3.5 w-8 animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-1/4 animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="ml-auto h-3.5 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">{empty}</p>
        {emptyDetail ? <p className="mt-1 text-sm text-slate-500">{emptyDetail}</p> : null}
        {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-3 py-2.5 sm:px-4 sm:py-3 ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={row.id || index} className="transition-colors hover:bg-slate-50/80">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2.5 align-middle text-slate-700 sm:px-4 sm:py-3 ${
                      column.align === 'right' ? 'text-right tabular-nums' : ''
                    } ${column.mono ? 'font-mono text-xs tabular-nums' : ''}`}
                  >
                    {column.render ? column.render(row, index) : row[column.key]}
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
