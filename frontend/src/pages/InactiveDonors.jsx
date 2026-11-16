import { useEffect, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';

export default function InactiveDonors() {
  const [rows, setRows] = useState([]);

  async function load() {
    setRows(await api.inactiveDonors());
  }

  useEffect(() => {
    load().catch(() => setRows([]));
  }, []);

  async function activate(id) {
    if (!window.confirm('Are you sure you want to activate this donor?')) return;
    await api.activateDonor(id);
    await load();
  }

  async function remove(id) {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    await api.deleteDonor(id);
    await load();
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-rose-800">Non Active Donors</h1>
      <DataTable
        rows={rows}
        empty="No inactive donors found"
        columns={[
          { key: 'index', label: 'No', render: (_, i) => i + 1 },
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
            key: 'activate',
            label: 'Active',
            render: (row) => (
              <button className="text-emerald-700 underline" onClick={() => activate(row.id)}>Active</button>
            ),
          },
          {
            key: 'delete',
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
