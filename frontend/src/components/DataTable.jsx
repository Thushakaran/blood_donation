export default function DataTable({ columns, rows, empty = 'No records found' }) {
  if (!rows.length) {
    return <p className="rounded-lg bg-white p-6 text-center text-slate-500 shadow">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-rose-800 text-white">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 font-medium">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-t border-slate-100 odd:bg-rose-50/40">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2 align-top">
                  {column.render ? column.render(row, index) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
