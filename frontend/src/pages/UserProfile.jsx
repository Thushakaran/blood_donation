import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { BLOOD_GROUPS, HOSPITALS } from '../constants';
import coordinatorAvatar from '../assets/images/medical_coordinator_avatar_1794828548734.jpg';
import { CheckCircleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();
  const avatarStorageKey = `bloodShareAvatar:${user || 'default'}`;
  const [hospitals, setHospitals] = useState(HOSPITALS);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getProfile(),
      api.publicHospitals().catch(() => []),
    ])
      .then(([data, hospitalRows]) => {
        if (!active) return;
        const savedAvatar = localStorage.getItem(avatarStorageKey);
        setProfile({ ...data, avatarUrl: savedAvatar || data.avatarUrl || '' });
        if (Array.isArray(hospitalRows) && hospitalRows.length) {
          const names = hospitalRows.map((item) => (typeof item === 'string' ? item : item?.hospitalName)).filter(Boolean);
          if (names.length) setHospitals(names);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [avatarStorageKey]);

  async function handleSave(event) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await api.updateProfile(profile);
      setProfile(res.profile);
      setStatus({ type: 'success', message: res.message || 'Profile updated successfully' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Choose an image file.' });
      return;
    }
    if (file.size > 1024 * 1024) {
      setStatus({ type: 'error', message: 'Choose an image smaller than 1 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setStatus({ type: 'error', message: 'Could not read that image.' });
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      setSaving(true);
      setStatus({ type: '', message: '' });
      try {
        const result = await api.updateProfile({ ...profile, avatarUrl: reader.result });
        localStorage.setItem(avatarStorageKey, reader.result);
        setProfile(result.profile);
        setAvatarFailed(false);
        window.dispatchEvent(new CustomEvent('profile-avatar-changed', { detail: reader.result }));
        setStatus({ type: 'success', message: 'Profile photo updated.' });
      } catch (err) {
        setStatus({ type: 'error', message: err.message || 'Could not update profile photo.' });
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function resetAvatar() {
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const result = await api.updateProfile({ ...profile, avatarUrl: '' });
      localStorage.removeItem(avatarStorageKey);
      setProfile(result.profile);
      setAvatarFailed(false);
      window.dispatchEvent(new CustomEvent('profile-avatar-changed', { detail: '' }));
      setStatus({ type: 'success', message: 'Profile photo reset to the default.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not reset profile photo.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
        <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Profile & Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage coordinator contact details, blood donor profile, personal donation history, and alert preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Summary Card */}
        <aside className="min-w-0 space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              {avatarFailed ? (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-700">
                  {profile.fullName.slice(0, 1)}
                </div>
              ) : (
                <img
                  src={profile.avatarUrl || coordinatorAvatar}
                  alt={profile.fullName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-slate-900">{profile.fullName}</h2>
                <p className="truncate text-xs text-slate-500">{profile.role}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">ID: {profile.donorId}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className={`cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700 ${saving ? 'pointer-events-none opacity-60' : ''}`}>
                    {saving ? 'Saving photo…' : 'Change profile picture'}
                    <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} disabled={saving} />
                  </label>
                  {profile.avatarUrl && <button type="button" onClick={resetAvatar} disabled={saving} className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50">Reset</button>}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Image files up to 1 MB</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700">Blood Group</p>
                <p className="mt-1 font-mono text-2xl font-bold text-red-700">{profile.bloodGroup}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">Eligibility</p>
                <div className="mt-2">
                  <StatusBadge
                    variant={profile.eligibleToDonate ? 'success' : 'warning'}
                    label={profile.eligibleToDonate ? 'Eligible' : 'Rest Period'}
                    showIcon
                  />
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-xs">
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-slate-500">Primary Facility</dt>
                <dd className="text-right font-medium text-slate-900">{profile.hospital}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="shrink-0 text-slate-500">Last Donated</dt>
                <dd className="font-mono text-slate-900 tabular-nums">{profile.lastDonatedDate || 'N/A'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="shrink-0 text-slate-500">Total Logged Donations</dt>
                <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                  {profile.personalDonations?.length || 0}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Right Editable Form + History */}
        <div className="min-w-0 space-y-6 lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Personal & Facility Settings</h2>

            {status.message ? (
              <div
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
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
              <FormField label="Full Name">
                <input
                  className={inputClass}
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              </FormField>
              <FormField label="Clinical Role">
                <input
                  className={inputClass}
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                />
              </FormField>
              <FormField label="Assigned Hospital">
                <select
                  className={inputClass}
                  value={profile.hospital}
                  onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                >
                  {hospitals.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Personal Blood Group">
                <select
                  className={inputClass}
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Email Address">
                <input
                  className={inputClass}
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </FormField>
              <FormField label="Contact Phone">
                <input
                  className={inputClass}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </FormField>
            </div>

            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-900">Alert & Notification Preferences</p>
              <label className="flex items-start gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(profile.notifyUrgentRequests)}
                  onChange={(e) => setProfile({ ...profile, notifyUrgentRequests: e.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span>Notify immediately when an urgent blood request is submitted</span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(profile.notifyLowStock)}
                  onChange={(e) => setProfile({ ...profile, notifyLowStock: e.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span>Show low-stock warnings when any blood group drops below threshold</span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(profile.notifyNewDonors)}
                  onChange={(e) => setProfile({ ...profile, notifyNewDonors: e.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span>Alert when new volunteer donors await verification</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:w-auto"
            >
              {saving ? 'Saving Changes...' : 'Save Account Settings'}
            </button>
          </form>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Personal Donation History</h2>
            <p className="mt-0.5 text-xs text-slate-500">Verified donation sessions linked to your coordinator donor ID</p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th className="whitespace-nowrap py-2.5 pr-4">Date</th>
                    <th className="whitespace-nowrap py-2.5 pr-4">Donation Center</th>
                    <th className="whitespace-nowrap py-2.5 pr-4">Component</th>
                    <th className="whitespace-nowrap py-2.5 pr-4">Volume</th>
                    <th className="whitespace-nowrap py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(profile.personalDonations || []).map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap py-2.5 pr-4 font-mono text-xs text-slate-700 tabular-nums">{item.date}</td>
                      <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-slate-900">{item.center}</td>
                      <td className="whitespace-nowrap py-2.5 pr-4 text-slate-600">{item.component}</td>
                      <td className="whitespace-nowrap py-2.5 pr-4 font-mono text-xs text-slate-600 tabular-nums">{item.units}</td>
                      <td className="whitespace-nowrap py-2.5 text-right">
                        <StatusBadge variant="success" label={item.status} showIcon />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
