import { useEffect, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import { inputClass } from '../components/FormField';

const columns = [
  { key: 'index', label: '#', render: (_, index) => index + 1 },
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
];

export default function SearchDonors() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  async function load(search = '') {
    try {
      setRows(await api.searchDonors(search));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-rose-800">Search Donors</h1>
      <form
        className="mb-6 flex gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          load(query);
        }}
      >
        <input className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, blood group, district..." />
        <button className="rounded-lg bg-rose-700 px-4 py-2 text-white">Search</button>
      </form>
      {error ? <p className="mb-4 text-rose-600">{error}</p> : null}
      <DataTable columns={columns} rows={rows} empty="No active donors found" />
    </div>
  );
}
