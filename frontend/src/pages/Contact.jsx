import { useState } from 'react';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import { HOSPITALS } from '../constants';

const empty = { fullName: '', phoneNumber: '', email: '', hospital: HOSPITALS[0], message: '' };

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.fullName) nextErrors.fullName = 'Name is required';
    if (!form.phoneNumber) nextErrors.phoneNumber = 'Phone number is required';
    if (!form.email) nextErrors.email = 'Email is required';
    if (!form.message) nextErrors.message = 'Message is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const result = await api.sendMessage(form);
      setStatus(result.message);
      setForm(empty);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-rose-800">Send Us a Message</h1>
        {status ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{status}</p> : null}
        <FormField label="Full Name" error={errors.fullName}>
          <input className={inputClass} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        </FormField>
        <FormField label="Phone Number" error={errors.phoneNumber}>
          <input className={inputClass} value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} />
        </FormField>
        <FormField label="Email Address" error={errors.email}>
          <input className={inputClass} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </FormField>
        <FormField label="Hospital">
          <select className={inputClass} value={form.hospital} onChange={(e) => update('hospital', e.target.value)}>
            {HOSPITALS.map((hospital) => (
              <option key={hospital}>{hospital}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Message" error={errors.message}>
          <textarea className={inputClass} rows="4" value={form.message} onChange={(e) => update('message', e.target.value)} />
        </FormField>
        <button type="submit" className="rounded-lg bg-rose-700 px-5 py-2 text-white hover:bg-rose-800">
          Send Message
        </button>
      </form>
      <aside className="rounded-3xl bg-rose-800 p-8 text-white shadow">
        <h2 className="text-2xl font-bold">Contact Details</h2>
        <p className="mt-6">Hospital Road, Jaffna.</p>
        <p className="mt-3">P: 0762971306</p>
        <p className="mt-3">E: thushakarant@gmail.com</p>
      </aside>
    </div>
  );
}
