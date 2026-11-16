import { useEffect, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import FormField, { inputClass } from '../components/FormField';
import { BLOOD_GROUPS, HOSPITALS } from '../constants';

export default function BloodStock() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    hospitalName: HOSPITALS[0],
    bloodGroup: 'A+',
    action: 'increase',
    units: 1,
  });

  async function load() {
    setRows(await api.listStock());
  }

  useEffect(() => {
    load().catch(() => setRows([]));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const result = await api.updateStock({ ...form, units: Number(form.units) });
      setStatus(result.message);
      await load();
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-rose-800">Stock (Update)</h1>
      <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow md:grid-cols-5">
        <FormField label="Hospital">
          <select className={inputClass} value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}>
            {HOSPITALS.map((hospital) => <option key={hospital}>{hospital}</option>)}
          </select>
        </FormField>
        <FormField label="Blood Group">
          <select className={inputClass} value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
            {BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}
          </select>
        </FormField>
        <FormField label="Action">
          <select className={inputClass} value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </FormField>
        <FormField label="Units">
          <input className={inputClass} type="number" min="1" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
        </FormField>
        <div className="flex items-end">
          <button className="w-full rounded-lg bg-rose-700 px-4 py-2 text-white">Update</button>
        </div>
      </form>
      {status ? <p className="mb-4 text-sm text-rose-700">{status}</p> : null}
      <DataTable
        rows={rows}
        empty="No result found"
        columns={[
          { key: 'index', label: 'No', render: (_, i) => i + 1 },
          { key: 'hospitalName', label: 'Hospital' },
          { key: 'aPositive', label: 'A+' },
          { key: 'aNegative', label: 'A-' },
          { key: 'bPositive', label: 'B+' },
          { key: 'bNegative', label: 'B-' },
          { key: 'abPositive', label: 'AB+' },
          { key: 'abNegative', label: 'AB-' },
          { key: 'oPositive', label: 'O+' },
          { key: 'oNegative', label: 'O-' },
        ]}
      />
    </div>
  );
}
