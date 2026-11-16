import { useState } from 'react';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import { BLOOD_GROUPS, DISTRICTS, PROVINCES } from '../constants';

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

export default function RegisterDonor() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [eligible, setEligible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    ['name', 'fatherName', 'dateOfBirth', 'bodyWeight', 'email', 'address', 'contactNumber'].forEach((field) => {
      if (!form[field]) nextErrors[field] = 'This field is required';
    });
    if (!eligible || !consent) {
      nextErrors.terms = 'Please confirm eligibility and consent.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const payload = {
        ...form,
        lastBloodDonatedDate: form.lastBloodDonatedDate || null,
      };
      const result = await api.registerDonor(payload);
      setStatus(result.message);
      setForm(empty);
      setEligible(false);
      setConsent(false);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-center text-3xl font-bold text-rose-800">New Donor Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow">
        <h2 className="text-xl font-semibold text-rose-700">Join as blood donor</h2>
        {status ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{status}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Name" error={errors.name}>
            <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
          </FormField>
          <FormField label="Father Name" error={errors.fatherName}>
            <input className={inputClass} value={form.fatherName} onChange={(e) => update('fatherName', e.target.value)} />
          </FormField>
          <FormField label="Gender">
            <select className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </FormField>
          <FormField label="D.O.B" error={errors.dateOfBirth}>
            <input className={inputClass} type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
          </FormField>
          <FormField label="Blood Group">
            <select className={inputClass} value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)}>
              {BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}
            </select>
          </FormField>
          <FormField label="Body Weight" error={errors.bodyWeight}>
            <input className={inputClass} value={form.bodyWeight} onChange={(e) => update('bodyWeight', e.target.value)} placeholder="Weight in Kgs" />
          </FormField>
          <FormField label="Email ID" error={errors.email}>
            <input className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} />
          </FormField>
          <FormField label="Province">
            <select className={inputClass} value={form.province} onChange={(e) => update('province', e.target.value)}>
              {PROVINCES.map((province) => <option key={province}>{province}</option>)}
            </select>
          </FormField>
          <FormField label="District">
            <select className={inputClass} value={form.district} onChange={(e) => update('district', e.target.value)}>
              {DISTRICTS.map((district) => <option key={district}>{district}</option>)}
            </select>
          </FormField>
          <FormField label="Address" error={errors.address}>
            <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} />
          </FormField>
          <FormField label="Contact Number" error={errors.contactNumber}>
            <input className={inputClass} value={form.contactNumber} onChange={(e) => update('contactNumber', e.target.value)} />
          </FormField>
          <FormField label="Last Blood Donated Date">
            <input className={inputClass} type="date" value={form.lastBloodDonatedDate} onChange={(e) => update('lastBloodDonatedDate', e.target.value)} />
          </FormField>
          <FormField label="New Donor">
            <select className={inputClass} value={form.newDonor ? 'yes' : 'no'} onChange={(e) => update('newDonor', e.target.value === 'yes')}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </FormField>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={eligible} onChange={(e) => setEligible(e.target.checked)} className="mt-1" />
          I have read the eligibility criteria and confirm that I am eligible to donate blood.
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          I agree to the terms and conditions and consent to have my contact and donor information published to potential blood recipients.
        </label>
        {errors.terms ? <p className="text-sm text-rose-600">{errors.terms}</p> : null}
        <button type="submit" className="rounded-lg bg-rose-700 px-5 py-2 text-white hover:bg-rose-800">Register</button>
      </form>
    </div>
  );
}
