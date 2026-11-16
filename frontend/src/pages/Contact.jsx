import { useState } from 'react';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import { HOSPITALS } from '../constants';
import { CheckCircleIcon, MailIcon, MapPinIcon, PhoneIcon } from '../components/Icons';

const empty = { fullName: '', phoneNumber: '', email: '', hospital: HOSPITALS[0], message: '' };

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = 'Phone number is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!form.message.trim()) nextErrors.message = 'Message is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const result = await api.sendMessage(form);
      setStatus({ type: 'success', message: result.message || 'Message sent successfully' });
      setForm(empty);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to send message' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-red-600">Hospital & Donor Support</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Contact Blood Share</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Reach out to coordinate a blood drive, check hospital blood bank hours, or escalate an urgent inquiry.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7"
          noValidate
        >
          <h2 className="text-lg font-semibold text-slate-900">Send Us a Message</h2>

          {status.message ? (
            <div
              className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
              role="status"
            >
              {status.type === 'success' ? <CheckCircleIcon className="h-4 w-4 shrink-0" /> : null}
              <span>{status.message}</span>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" required error={errors.fullName}>
              <input
                className={inputClass}
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="e.g., Dr. Kavitha Ratnasiri"
              />
            </FormField>
            <FormField label="Phone Number" required error={errors.phoneNumber}>
              <input
                className={inputClass}
                value={form.phoneNumber}
                onChange={(e) => update('phoneNumber', e.target.value)}
                placeholder="e.g., 077 123 4567"
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email Address" required error={errors.email}>
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="name@hospital.lk"
              />
            </FormField>
            <FormField label="Target Hospital">
              <select
                className={inputClass}
                value={form.hospital}
                onChange={(e) => update('hospital', e.target.value)}
              >
                {HOSPITALS.map((hospital) => (
                  <option key={hospital}>{hospital}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Message" required error={errors.message}>
            <textarea
              className={inputClass}
              rows="4"
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Describe your inquiry, blood drive request, or hospital transfer question..."
            />
          </FormField>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <aside className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Regional Coordination Desk</h2>
            <p className="mt-2 text-sm text-slate-600">
              Available Monday through Sunday for emergency blood stock coordination and donor support.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <MapPinIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Address</p>
                  <p className="text-sm font-medium text-slate-900">Hospital Road, Jaffna</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <PhoneIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Helpline</p>
                  <p className="font-mono text-sm font-medium text-slate-900 tabular-nums">0762971306</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <MailIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">thushakarant@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
