import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import { BLOOD_GROUPS, HOSPITALS } from '../constants';
import { AlertTriangleIcon, CheckCircleIcon, PhoneIcon } from '../components/Icons';

const empty = {
  patientName: '',
  gender: 'male',
  bloodGroupType: 'O+',
  units: '',
  hospitalAddress: HOSPITALS[0],
  doctorName: '',
  requiredDate: '',
  email: '',
  contactNumber: '',
  reason: '',
  urgency: 'normal',
};

export default function NeedBlood() {
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
    ['patientName', 'units', 'doctorName', 'requiredDate', 'email', 'contactNumber', 'reason'].forEach((field) => {
      if (!String(form[field] || '').trim()) nextErrors[field] = 'This field is required';
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const result = await api.createRequest(form);
      setStatus({
        type: 'success',
        message: `${result.message}. Hospital blood bank coordinators have been notified.`,
      });
      setForm(empty);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to submit blood request' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-red-600">Emergency & Scheduled Transfusions</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Request Blood for a Patient
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Log an official blood request with attending physician and hospital details so coordinators can dispatch units or alert matching donors.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-8"
          noValidate
        >
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

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Priority Level</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => update('urgency', 'normal')}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                  form.urgency === 'normal'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Normal Request
              </button>
              <button
                type="button"
                onClick={() => update('urgency', 'urgent')}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                  form.urgency === 'urgent'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Urgent / Critical
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Patient Name" required error={errors.patientName}>
              <input
                className={inputClass}
                value={form.patientName}
                onChange={(e) => update('patientName', e.target.value)}
                placeholder="Patient full name"
              />
            </FormField>
            <FormField label="Gender">
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </FormField>
            <FormField label="Blood Group Required">
              <select
                className={inputClass}
                value={form.bloodGroupType}
                onChange={(e) => update('bloodGroupType', e.target.value)}
              >
                {BLOOD_GROUPS.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Units Required" required error={errors.units}>
              <input
                className={inputClass}
                type="number"
                min="1"
                value={form.units}
                onChange={(e) => update('units', e.target.value)}
                placeholder="e.g., 2"
              />
            </FormField>
            <FormField label="Admitting Hospital">
              <select
                className={inputClass}
                value={form.hospitalAddress}
                onChange={(e) => update('hospitalAddress', e.target.value)}
              >
                {HOSPITALS.map((hospital) => (
                  <option key={hospital}>{hospital}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Attending Doctor Name" required error={errors.doctorName}>
              <input
                className={inputClass}
                value={form.doctorName}
                onChange={(e) => update('doctorName', e.target.value)}
                placeholder="e.g., Dr. K. Senanayake"
              />
            </FormField>
            <FormField label="Required Date" required error={errors.requiredDate}>
              <input
                className={inputClass}
                type="date"
                value={form.requiredDate}
                onChange={(e) => update('requiredDate', e.target.value)}
              />
            </FormField>
            <FormField label="Contact Number" required error={errors.contactNumber}>
              <input
                className={inputClass}
                value={form.contactNumber}
                onChange={(e) => update('contactNumber', e.target.value)}
                placeholder="077 123 4567"
              />
            </FormField>
            <FormField label="Hospital / Guardian Email" required error={errors.email}>
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="ward@hospital.lk"
              />
            </FormField>
            <FormField label="Clinical Reason" required error={errors.reason}>
              <input
                className={inputClass}
                value={form.reason}
                onChange={(e) => update('reason', e.target.value)}
                placeholder="e.g., Emergency surgery, Thalassemia"
              />
            </FormField>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting Request...' : 'Submit Blood Request'}
          </button>
        </form>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangleIcon className="h-5 w-5" />
              <h3 className="text-base font-semibold text-slate-900">Emergency Protocol</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              For life-threatening hemorrhage or immediate ICU transfusions, also contact the hospital blood bank desk directly by phone after submitting this request.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900">
              <PhoneIcon className="h-4 w-4 text-red-600" />
              <span className="font-mono tabular-nums">0762971306</span>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <Link
                to="/search"
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Browse verified active donors →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
