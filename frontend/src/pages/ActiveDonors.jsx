import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { inputClass } from '../components/FormField';
import { BLOOD_GROUPS } from '../constants';
import { MailIcon, MapPinIcon, PhoneIcon, SearchIcon, TrashIcon } from '../components/Icons';

export default function ActiveDonors() {
  const [query, setQuery] = useState('');
  const [bloodGroup, setBloodGroup] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load(search = '') {
    setLoading(true);
    try {
      setRows(await api.activeDonors(search));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (bloodGroup === 'All') return rows;
    return rows.filter((d) => d.bloodGroup === bloodGroup);
  }, [rows, bloodGroup]);

  async function toggleAvailability(donor) {
    try {
      const next = donor.available === false;
      const result = await api.toggleDonorAvailability(donor.id, next);
      setStatusMessage(result.message);
      await load(query);
    } catch (error) {
      setStatusMessage(error.message || 'Unable to update availability');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteDonor(deleteTarget.id);
      setStatusMessage(`${deleteTarget.name} removed from active registry.`);
      setDeleteTarget(null);
      await load(query);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Active Donors
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Verified blood donors eligible for hospital emergency matching and outreach.
          </p>
        </div>
        <div className="inline-flex self-start rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            load(query);
          }}
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} pl-10`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search active donors by name, district, province, or blood group..."
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {['All', ...BLOOD_GROUPS].map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setBloodGroup(group)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                bloodGroup === group
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {group === 'All' ? 'All Groups' : group}
            </button>
          ))}
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      {viewMode === 'table' ? (
        <DataTable
          rows={filtered}
          loading={loading}
          empty="No active donors found"
          emptyDetail="Approve pending registrations or adjust your blood group filter."
          columns={[
            { key: 'index', label: '#', render: (_, i) => <span className="font-mono text-xs text-slate-500">{i + 1}</span> },
            {
              key: 'name',
              label: 'Donor',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-900">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.email}</p>
                </div>
              ),
            },
            {
              key: 'bloodGroup',
              label: 'Group',
              render: (row) => (
                <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 font-mono text-xs font-bold text-red-700">
                  {row.bloodGroup}
                </span>
              ),
            },
            {
              key: 'availability',
              label: 'Status',
              render: (row) => (
                <button
                  type="button"
                  onClick={() => toggleAvailability(row)}
                  title="Click to toggle availability"
                >
                  <StatusBadge
                    variant={row.available === false ? 'warning' : 'success'}
                    label={row.available === false ? 'Rest Interval' : 'Available'}
                    showIcon
                  />
                </button>
              ),
            },
            {
              key: 'location',
              label: 'Location',
              render: (row) => (
                <span>
                  {row.district}, {row.province}
                </span>
              ),
            },
            { key: 'contactNumber', label: 'Contact', mono: true },
            {
              key: 'lastBloodDonatedDate',
              label: 'Last Donated',
              mono: true,
              render: (row) => row.lastBloodDonatedDate || 'First-time',
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'right',
              render: (row) => (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              ),
            },
          ]}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((donor) => (
            <article key={donor.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{donor.name}</h2>
                  <p className="text-xs text-slate-500">
                    {donor.gender === 'female' ? 'Female' : 'Male'} · {donor.bodyWeight} kg
                  </p>
                </div>
                <span className="rounded-lg bg-red-50 px-2.5 py-1 font-mono text-sm font-bold text-red-700">
                  {donor.bloodGroup}
                </span>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {donor.district}, {donor.province}
                  </span>
                </p>
                <p className="flex items-center gap-2 font-mono tabular-nums">
                  <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{donor.contactNumber}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <MailIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{donor.email}</span>
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                <button type="button" onClick={() => toggleAvailability(donor)}>
                  <StatusBadge
                    variant={donor.available === false ? 'warning' : 'success'}
                    label={donor.available === false ? 'Rest Interval' : 'Available'}
                    showIcon
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(donor)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove donor from registry?"
        message={`This will permanently delete ${deleteTarget?.name || 'this donor'} (${deleteTarget?.bloodGroup || ''}) from the Blood Share registry.`}
        confirmLabel="Delete Donor"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
