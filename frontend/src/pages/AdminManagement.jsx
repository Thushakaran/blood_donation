import { useEffect, useState } from 'react';
import { api } from '../api';
import { inputClass } from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const emptyForm = { username: '', password: '', hospitalName: '' };

export default function AdminManagement() {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [adminRows, hospitalRows] = await Promise.all([api.admins(), api.hospitals()]);
    setAdmins(adminRows);
    setHospitals(hospitalRows);
    if (!form.hospitalName && hospitalRows.length) setForm((current) => ({ ...current, hospitalName: hospitalRows[0].hospitalName }));
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  async function submit(event) {
    event.preventDefault(); setError(''); setMessage('');
    try {
      await api.createAdmin(form);
      setForm({ ...emptyForm, hospitalName: form.hospitalName });
      setMessage('Hospital admin created. Share the credentials securely.');
      await load();
    } catch (err) { setError(err.message || 'Could not create admin'); }
  }

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <div className="space-y-6">
    <header><h1 className="text-2xl font-bold text-slate-900">Hospital Admins</h1><p className="mt-1 text-sm text-slate-600">Create accounts limited to one hospital.</p></header>
    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4">
      <label className="min-w-0 text-sm font-medium">Username<input required className={`${inputClass} mt-1`} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
      <label className="min-w-0 text-sm font-medium">Temporary password<input required minLength={8} type="password" className={`${inputClass} mt-1`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <label className="min-w-0 text-sm font-medium">Assigned hospital<select required className={`${inputClass} mt-1`} value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}>{hospitals.map((h) => <option key={h.id} value={h.hospitalName}>{h.hospitalName}</option>)}</select></label>
      <button className="self-end whitespace-nowrap rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 sm:col-span-2 xl:col-span-1">Add Hospital Admin</button>
    </form>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="whitespace-nowrap p-3 sm:px-4">Username</th><th className="whitespace-nowrap p-3 sm:px-4">Role</th><th className="whitespace-nowrap p-3 sm:px-4">Assigned hospital</th></tr></thead><tbody className="divide-y divide-slate-100">{admins.map((admin) => <tr key={admin.id}><td className="whitespace-nowrap p-3 font-medium text-slate-900 sm:px-4">{admin.username}</td><td className="whitespace-nowrap p-3 text-slate-600 sm:px-4">{admin.role}</td><td className="p-3 text-slate-700 sm:px-4">{admin.hospitalName || 'All hospitals'}</td></tr>)}</tbody></table></div>
  </div>;
}
