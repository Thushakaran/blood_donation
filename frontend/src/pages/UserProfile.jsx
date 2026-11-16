import { useEffect, useState } from 'react';
import { api } from '../api';
import FormField, { inputClass } from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { BLOOD_GROUPS, HOSPITALS } from '../constants';
import coordinatorAvatar from '../assets/images/medical_coordinator_avatar_1794828548734.jpg';
import { CheckCircleIcon } from '../components/Icons';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              {avatarFailed ? (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-700">
                  {profile.fullName.slice(0, 1)}
                </div>
              ) : (
                <img
                  src={coordinatorAvatar}
                  alt={profile.fullName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-base font-semibold text-slate-900">{profile.fullName}</h2>
                <p className="text-xs text-slate-500">{profile.role}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">ID: {profile.donorId}</p>
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
              <div className="flex justify-between">
                <dt className="text-slate-500">Primary Facility</dt>
                <dd className="font-medium text-slate-900">{profile.hospital}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Last Donated</dt>
                <dd className="font-mono text-slate-900 tabular-nums">{profile.lastDonatedDate || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Logged Donations</dt>
                <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                  {profile.personalDonations?.length || 0}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Right Editable Form + History */}
        <div className="space-y-6 lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
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
                  {HOSPITALS.map((h) => (
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
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(profile.notifyUrgentRequests)}
                  onChange={(e) => setProfile({ ...profile, notifyUrgentRequests: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span>Notify immediately when an urgent blood request is submitted</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(profile.notifyLowStock)}
                  onChange={(e) => setProfile({ ...profile, notifyLowStock: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span>Show low-stock warnings when any blood group drops below threshold</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(profile.notifyNewDonors)}
                  onChange={(e) => setProfile({ ...profile, notifyNewDonors: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span>Alert when new volunteer donors await verification</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? 'Saving Changes...' : 'Save Account Settings'}
            </button>
          </form>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">Personal Donation History</h2>
            <p className="mt-0.5 text-xs text-slate-500">Verified donation sessions linked to your coordinator donor ID</p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th className="py-2.5 pr-4">Date</th>
                    <th className="py-2.5 pr-4">Donation Center</th>
                    <th className="py-2.5 pr-4">Component</th>
                    <th className="py-2.5 pr-4">Volume</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(profile.personalDonations || []).map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-700 tabular-nums">{item.date}</td>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{item.center}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{item.component}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-600 tabular-nums">{item.units}</td>
                      <td className="py-2.5 text-right">
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
