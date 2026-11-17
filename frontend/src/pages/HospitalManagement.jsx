import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { inputClass } from '../components/FormField';

const blank = { hospitalName: '', address: '', contactNumber: '' };

export default function HospitalManagement() {
  const { isSuperAdmin, hospitalName: assignedHospital } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function load() {
    const rows = await api.hospitals(); setHospitals(rows);
    if (!isSuperAdmin && rows[0]) setForm({ hospitalName: rows[0].hospitalName, address: rows[0].address || '', contactNumber: rows[0].contactNumber || '' });
  }
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  async function submit(event) {
    event.preventDefault(); setError(''); setMessage('');
    try {
      if (isSuperAdmin && !form.id) await api.createHospital(form);
      else await api.updateHospital(form.hospitalName, form);
      setMessage(isSuperAdmin && !form.id ? 'Hospital added.' : 'Hospital details updated.');
      if (isSuperAdmin) setForm(blank);
      await load();
    } catch (err) { setError(err.message || 'Could not save hospital'); }
  }
  function edit(hospital) { setForm({ ...hospital, id: hospital.id }); }
  return <div className="space-y-6">
    <header><h1 className="text-2xl font-bold text-slate-900">Hospital Management</h1><p className="mt-1 text-sm text-slate-600">{isSuperAdmin ? 'Add hospitals and update their contact details.' : `Update details for ${assignedHospital}.`}</p></header>
    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-4">
      {isSuperAdmin && <label className="text-sm font-medium">Hospital name<input required className={`${inputClass} mt-1`} value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value, id: form.id })} /></label>}
      <label className="text-sm font-medium">Address<input className={`${inputClass} mt-1`} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
      <label className="text-sm font-medium">Contact number<input className={`${inputClass} mt-1`} value={form.contactNumber || ''} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} /></label>
      <button className="self-end rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">{isSuperAdmin && !form.id ? 'Add Hospital' : 'Save Hospital Details'}</button>
      {isSuperAdmin && form.id && <button type="button" onClick={() => setForm(blank)} className="self-end rounded-lg border px-4 py-2.5 text-sm">Cancel edit</button>}
    </form>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Hospital</th><th className="p-3">Address</th><th className="p-3">Contact</th>{isSuperAdmin && <th className="p-3">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-100">{hospitals.map((hospital) => <tr key={hospital.id}><td className="p-3 font-medium">{hospital.hospitalName}</td><td className="p-3">{hospital.address || '—'}</td><td className="p-3">{hospital.contactNumber || '—'}</td>{isSuperAdmin && <td className="p-3"><button onClick={() => edit(hospital)} className="text-red-600 hover:underline">Edit</button></td>}</tr>)}</tbody></table></div>
  </div>;
}
