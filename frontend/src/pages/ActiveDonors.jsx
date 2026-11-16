import { useEffect, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import { inputClass } from '../components/FormField';

export default function ActiveDonors() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);

  async function load(search = '') {
    setRows(await api.activeDonors(search));
  }

  useEffect(() => {
    load().catch(() => setRows([]));
  }, []);

  async function remove(id) {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    await api.deleteDonor(id);
    await load(query);
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-rose-800">Active Donors</h1>
      <form
        className="mb-6 flex gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          load(query);
        }}
      >
        <input className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="rounded-lg bg-rose-700 px-4 py-2 text-white">Search</button>
      </form>
      <DataTable
        rows={rows}
        empty="No active donors found"
        columns={[
          { key: 'index', label: '#', render: (_, i) => i + 1 },
          { key: 'name', label: 'Name' },
          { key: 'fatherName', label: 'Father Name' },
          { key: 'gender', label: 'Gender' },
          { key: 'dateOfBirth', label: 'D.O.B' },
          { key: 'bloodGroup', label: 'Blood Group' },
          { key: 'bodyWeight', label: 'Body Weight' },
          { key: 'email', label: 'Email ID' },
          { key: 'province', label: 'Province' },
          { key: 'district', label: 'District' },
          { key: 'address', label: 'Address' },
          { key: 'contactNumber', label: 'Contact Number' },
          { key: 'lastBloodDonatedDate', label: 'Last Donated' },
          { key: 'newDonor', label: 'New Donor', render: (row) => (row.newDonor ? 'Yes' : 'No') },
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
