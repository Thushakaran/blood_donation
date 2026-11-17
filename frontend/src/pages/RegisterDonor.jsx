import { useState } from 'react';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import { BLOOD_GROUPS, DISTRICTS, PROVINCES } from '../constants';
import { CheckCircleIcon, ShieldCheckIcon } from '../components/Icons';

const empty = {
  name: '',
  fatherName: '',
  gender: 'male',
  dateOfBirth: '',
  bloodGroup: 'O+',
  bodyWeight: '',
  email: '',
  province: 'Northern',
  district: 'Jaffna',
  address: '',
  contactNumber: '',
  lastBloodDonatedDate: '',
  newDonor: true,
};

export default function RegisterDonor({ adminMode = false }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [eligible, setEligible] = useState(false);
  const [consent, setConsent] = useState(false);
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
    ['name', 'fatherName', 'dateOfBirth', 'bodyWeight', 'email', 'address', 'contactNumber'].forEach((field) => {
      if (!String(form[field] || '').trim()) nextErrors[field] = 'This field is required';
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (form.bodyWeight && Number(form.bodyWeight) < 45) {
      nextErrors.bodyWeight = 'Minimum eligible donor weight is typically 50 kg';
    }
    if (!eligible || !consent) {
      nextErrors.terms = 'Please confirm both eligibility and donor registry consent.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const payload = {
        ...form,
        lastBloodDonatedDate: form.lastBloodDonatedDate || null,
      };
      const result = adminMode ? await api.addDonor(payload) : await api.registerDonor(payload);
      setStatus({
        type: 'success',
        message: adminMode ? result.message : `${result.message}. Your profile is queued for coordinator review and activation.`,
      });
      setForm(empty);
      setEligible(false);
      setConsent(false);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Registration failed' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={adminMode ? 'space-y-2' : 'mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'}>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-red-600">Volunteer Donor Registry</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {adminMode ? 'Add Donor to Registry' : 'Donor Registration'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {adminMode
            ? 'Create a verified donor record for the network. Make sure the donor has agreed to be contacted.'
            : 'Submit your donor profile for clinical verification. Once approved by a coordinator, hospitals and patients can match with you during blood shortages.'}
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
            <h2 className="text-base font-semibold text-slate-900">01. Personal Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" required error={errors.name}>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g., Kavinda Perera"
                />
              </FormField>
              <FormField label="Father / Guardian Name" required error={errors.fatherName}>
                <input
                  className={inputClass}
                  value={form.fatherName}
                  onChange={(e) => update('fatherName', e.target.value)}
                  placeholder="e.g., Nimal Perera"
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
              <FormField label="Date of Birth" required error={errors.dateOfBirth}>
                <input
                  className={inputClass}
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-slate-900">02. Medical & Blood Profile</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Blood Group">
                <select
                  className={inputClass}
                  value={form.bloodGroup}
                  onChange={(e) => update('bloodGroup', e.target.value)}
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Body Weight (kg)" required error={errors.bodyWeight}>
                <input
                  className={inputClass}
                  type="number"
                  min="40"
                  value={form.bodyWeight}
                  onChange={(e) => update('bodyWeight', e.target.value)}
                  placeholder="e.g., 65"
                />
              </FormField>
              <FormField label="First-Time Donor">
                <select
                  className={inputClass}
                  value={form.newDonor ? 'yes' : 'no'}
                  onChange={(e) => update('newDonor', e.target.value === 'yes')}
                >
                  <option value="yes">Yes, first time registering</option>
                  <option value="no">No, returning donor</option>
                </select>
              </FormField>
              <FormField label="Last Blood Donated Date" hint="Leave blank if first-time donor">
                <input
                  className={inputClass}
                  type="date"
                  value={form.lastBloodDonatedDate}
                  onChange={(e) => update('lastBloodDonatedDate', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-slate-900">03. Location & Contact Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Email Address" required error={errors.email}>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="donor@example.lk"
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
              <FormField label="Province">
                <select
                  className={inputClass}
                  value={form.province}
                  onChange={(e) => update('province', e.target.value)}
                >
                  {PROVINCES.map((province) => (
                    <option key={province}>{province}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="District">
                <select
                  className={inputClass}
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                >
                  {DISTRICTS.map((district) => (
                    <option key={district}>{district}</option>
                  ))}
                </select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Residential Address" required error={errors.address}>
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="Street address and locality"
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-6">
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={eligible}
                onChange={(e) => setEligible(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              <span>
                I have read the eligibility criteria and confirm that I am medically eligible to donate blood.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              <span>
                I consent to have my donor contact and blood group details listed in the verified registry for hospital matching.
              </span>
            </label>
            {errors.terms ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errors.terms}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:w-auto"
          >
            {submitting ? 'Submitting Registration...' : 'Submit Donor Registration'}
          </button>
        </form>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-semibold">Before You Donate</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Age 18–60 years and body weight 50 kg or above.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Eat a balanced meal and hydrate well 2 hours prior.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Wait at least 4 months between whole blood donations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>New registrations start as pending until verified by hospital staff.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
