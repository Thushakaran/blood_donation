import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BloodGroupPicker from '../components/BloodGroupPicker';
import FormField, { inputClass } from '../components/FormField';
import { PROVINCES, PROVINCE_DISTRICTS } from '../constants';
import { ArrowRightIcon, CheckCircleIcon, ShieldCheckIcon } from '../components/Icons';

const TODAY_ISO = new Date().toISOString().slice(0, 10);

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

function calculateAge(dobString) {
  if (!dobString) return null;
  const [y, m, d] = dobString.split('-').map(Number);
  if (!y || !m || !d) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    age -= 1;
  }
  return age;
}

export default function RegisterDonor({ adminMode = false }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [eligible, setEligible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const availableDistricts = useMemo(
    () => PROVINCE_DISTRICTS[form.province] || PROVINCE_DISTRICTS.Northern,
    [form.province]
  );

  function update(field, value) {
    setForm((current) => {
      if (field === 'province') {
        const nextDistricts = PROVINCE_DISTRICTS[value] || [];
        const nextDistrict = nextDistricts.includes(current.district)
          ? current.district
          : nextDistricts[0] || current.district;
        return { ...current, province: value, district: nextDistrict };
      }
      if (field === 'newDonor') {
        return {
          ...current,
          newDonor: value,
          lastBloodDonatedDate: value ? '' : current.lastBloodDonatedDate,
        };
      }
      return { ...current, [field]: value };
    });

    if (errors[field] || (field === 'newDonor' && errors.lastBloodDonatedDate)) {
      setErrors((current) => ({
        ...current,
        [field]: '',
        ...(field === 'newDonor' ? { lastBloodDonatedDate: '' } : {}),
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    ['name', 'fatherName', 'dateOfBirth', 'bodyWeight', 'email', 'address', 'contactNumber'].forEach((field) => {
      if (!String(form[field] || '').trim()) nextErrors[field] = 'This field is required';
    });

    if (form.dateOfBirth) {
      const age = calculateAge(form.dateOfBirth);
      if (age === null || form.dateOfBirth > TODAY_ISO) {
        nextErrors.dateOfBirth = 'Enter a valid date of birth';
      } else if (age < 18 || age > 60) {
        nextErrors.dateOfBirth = 'Donors must be between 18 and 60 years old';
      }
    }

    if (form.bodyWeight) {
      const weight = Number(form.bodyWeight);
      if (!Number.isFinite(weight) || weight < 50) {
        nextErrors.bodyWeight = 'Minimum eligible donor weight is 50 kg';
      }
    }

    if (!form.newDonor && form.lastBloodDonatedDate && form.lastBloodDonatedDate > TODAY_ISO) {
      nextErrors.lastBloodDonatedDate = 'Last donation date cannot be in the future';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (form.contactNumber) {
      const digits = form.contactNumber.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 15) {
        nextErrors.contactNumber = 'Enter a valid phone number (9–15 digits)';
      }
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
        lastBloodDonatedDate: form.newDonor ? null : form.lastBloodDonatedDate || null,
      };
      const result = adminMode ? await api.addDonor(payload) : await api.registerDonor(payload);
      setStatus({
        type: 'success',
        message: adminMode
          ? result.message
          : `${result.message}. Your donor profile is queued for hospital coordinator verification.`,
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

  const step1Complete = Boolean(form.name.trim() && form.fatherName.trim() && form.dateOfBirth);
  const step2Complete = Boolean(form.bloodGroup && form.bodyWeight);
  const step3Complete = Boolean(form.email.trim() && form.contactNumber.trim() && form.address.trim());
  const completedSteps = [step1Complete, step2Complete, step3Complete].filter(Boolean).length;

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
            : 'Submit your donor profile for clinical verification—no separate login password required. Once activated by a hospital coordinator, teams can reach you during urgent blood needs.'}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:col-span-8"
          noValidate
        >
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
              <span>Registration Completion</span>
              <span className="font-mono tabular-nums text-slate-700">{completedSteps} / 3 sections</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '01. Personal', done: step1Complete },
                { label: '02. Medical', done: step2Complete },
                { label: '03. Contact', done: step3Complete },
              ].map((step) => (
                <div key={step.label} className="space-y-1.5">
                  <div className={`h-1.5 w-full rounded-full transition-colors duration-200 ${step.done ? 'bg-red-600' : 'bg-slate-200'}`} />
                  <p className={`truncate text-xs font-medium ${step.done ? 'text-red-700' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {status.message ? (
            <div
              className={`rounded-xl border px-4 py-3.5 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
              role="status"
            >
              <div className="flex items-start gap-2.5">
                {status.type === 'success' ? <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : null}
                <div>
                  <p className="font-medium">{status.message}</p>
                  {status.type === 'success' && !adminMode ? (
                    <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold">
                      <Link to="/search" className="inline-flex items-center gap-1 text-emerald-800 underline underline-offset-2 hover:text-emerald-950">
                        <span>Browse Active Registry</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                      <Link to="/" className="text-slate-700 hover:text-slate-900">
                        Return to Home
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
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
                  autoComplete="name"
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
              <FormField label="Date of Birth" required error={errors.dateOfBirth} hint="Eligible age range: 18–60 years">
                <input
                  className={inputClass}
                  type="date"
                  max={TODAY_ISO}
                  value={form.dateOfBirth}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-slate-900">02. Medical &amp; Blood Profile</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <BloodGroupPicker
                  label="Blood Group"
                  required
                  value={form.bloodGroup}
                  onChange={(group) => update('bloodGroup', group)}
                />
              </div>
              <FormField label="Body Weight (kg)" required error={errors.bodyWeight} hint="Minimum 50 kg required">
                <input
                  className={inputClass}
                  type="number"
                  min="50"
                  max="200"
                  value={form.bodyWeight}
                  onChange={(e) => update('bodyWeight', e.target.value)}
                  placeholder="e.g., 65"
                />
              </FormField>
              <FormField label="Donation Experience">
                <select
                  className={inputClass}
                  value={form.newDonor ? 'yes' : 'no'}
                  onChange={(e) => update('newDonor', e.target.value === 'yes')}
                >
                  <option value="yes">Yes, first time registering</option>
                  <option value="no">No, returning donor</option>
                </select>
              </FormField>
              <FormField
                label="Last Blood Donated Date"
                error={errors.lastBloodDonatedDate}
                hint={form.newDonor ? 'Not required for first-time donors' : 'Must be at least 4 months ago'}
              >
                <input
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                  type="date"
                  max={TODAY_ISO}
                  disabled={form.newDonor}
                  value={form.newDonor ? '' : form.lastBloodDonatedDate}
                  onChange={(e) => update('lastBloodDonatedDate', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-slate-900">03. Location &amp; Contact Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Email Address" required error={errors.email}>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="donor@example.lk"
                  autoComplete="email"
                />
              </FormField>
              <FormField label="Contact Number" required error={errors.contactNumber}>
                <input
                  className={inputClass}
                  type="tel"
                  value={form.contactNumber}
                  onChange={(e) => update('contactNumber', e.target.value)}
                  placeholder="077 123 4567"
                  autoComplete="tel"
                />
              </FormField>
              <FormField label="Province">
                <select
                  className={inputClass}
                  value={form.province}
                  onChange={(e) => update('province', e.target.value)}
                >
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="District">
                <select
                  className={inputClass}
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                >
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
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
                    autoComplete="street-address"
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
