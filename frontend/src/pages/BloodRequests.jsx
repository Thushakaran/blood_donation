import { useEffect, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';

export default function BloodRequests() {
  const [rows, setRows] = useState([]);

  async function load() {
    setRows(await api.listRequests());
  }

  useEffect(() => {
    load().catch(() => setRows([]));
  }, []);

  async function remove(id) {
    if (!window.confirm('Are you sure that this request was fulfilled?')) return;
    await api.deleteRequest(id);
    await load();
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-rose-800">Blood Requests</h1>
      <DataTable
        rows={rows}
        empty="No needs found"
        columns={[
          { key: 'index', label: 'No', render: (_, i) => i + 1 },
          { key: 'patientName', label: 'Patient Name' },
          { key: 'gender', label: 'Gender' },
          { key: 'bloodGroupType', label: 'Blood Group Type' },
          { key: 'units', label: 'Need Unit Of Blood' },
          { key: 'hospitalAddress', label: 'Hospital Address' },
          { key: 'doctorName', label: 'Doctor Name' },
          { key: 'requiredDate', label: 'Required Date' },
          { key: 'email', label: 'Email Id' },
          { key: 'contactNumber', label: 'Contact Number' },
          { key: 'reason', label: 'Reason For Blood' },
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
