import { useState } from 'react';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import { BLOOD_GROUPS, HOSPITALS } from '../constants';

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
};

export default function NeedBlood() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    ['patientName', 'units', 'doctorName', 'requiredDate', 'email', 'contactNumber', 'reason'].forEach((field) => {
      if (!form[field]) nextErrors[field] = 'This field is required';
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const result = await api.createRequest(form);
      setStatus(result.message);
      setForm(empty);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-center text-3xl font-bold text-rose-800">Need Blood</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow">
        <h2 className="text-xl font-semibold text-rose-700">Need blood to save life</h2>
        {status ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{status}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Patient Name" error={errors.patientName}>
            <input className={inputClass} value={form.patientName} onChange={(e) => update('patientName', e.target.value)} />
          </FormField>
          <FormField label="Gender">
            <select className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </FormField>
          <FormField label="Blood Group Type">
            <select className={inputClass} value={form.bloodGroupType} onChange={(e) => update('bloodGroupType', e.target.value)}>
              {BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}
            </select>
          </FormField>
          <FormField label="Need Unit Of Blood" error={errors.units}>
            <input className={inputClass} value={form.units} onChange={(e) => update('units', e.target.value)} />
          </FormField>
          <FormField label="Hospital">
            <select className={inputClass} value={form.hospitalAddress} onChange={(e) => update('hospitalAddress', e.target.value)}>
              {HOSPITALS.map((hospital) => <option key={hospital}>{hospital}</option>)}
            </select>
          </FormField>
          <FormField label="Doctor Name" error={errors.doctorName}>
            <input className={inputClass} value={form.doctorName} onChange={(e) => update('doctorName', e.target.value)} />
          </FormField>
          <FormField label="Required Date" error={errors.requiredDate}>
            <input className={inputClass} type="date" value={form.requiredDate} onChange={(e) => update('requiredDate', e.target.value)} />
          </FormField>
          <FormField label="Email Id" error={errors.email}>
            <input className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} />
          </FormField>
          <FormField label="Contact Number" error={errors.contactNumber}>
            <input className={inputClass} value={form.contactNumber} onChange={(e) => update('contactNumber', e.target.value)} />
          </FormField>
          <FormField label="Reason For Blood" error={errors.reason}>
            <input className={inputClass} value={form.reason} onChange={(e) => update('reason', e.target.value)} />
          </FormField>
        </div>
        <button type="submit" className="rounded-lg bg-rose-700 px-5 py-2 text-white hover:bg-rose-800">Submit</button>
      </form>
    </div>
  );
}
