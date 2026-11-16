import { useEffect, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';

export default function Inbox() {
  const [rows, setRows] = useState([]);

  async function load() {
    setRows(await api.listInbox());
  }

  useEffect(() => {
    load().catch(() => setRows([]));
  }, []);

  async function remove(id) {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    await api.deleteInbox(id);
    await load();
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-rose-800">Inbox</h1>
      <DataTable
        rows={rows}
        empty="No messages found"
        columns={[
          { key: 'index', label: 'No', render: (_, i) => i + 1 },
          { key: 'fullName', label: 'Name' },
          { key: 'phoneNumber', label: 'Phone Number' },
          { key: 'email', label: 'Email' },
          { key: 'hospital', label: 'Hospital' },
          { key: 'message', label: 'Message' },
          {
            key: 'actions',
            label: 'Delete',
            render: (row) => (
              <button className="text-rose-700 underline" onClick={() => remove(row.id)}>Delete</button>
            ),
          },
        ]}
      />
    </div>
  );
}
