import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import { inputClass } from '../components/FormField';
import { HOSPITALS } from '../constants';
import { TrashIcon } from '../components/Icons';

export default function Inbox() {
  const [rows, setRows] = useState([]);
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setRows(await api.listInbox());
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
    if (hospitalFilter === 'All') return rows;
    return rows.filter((m) => m.hospital === hospitalFilter);
  }, [rows, hospitalFilter]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteInbox(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Hospital & Donor Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Inquiries, campus blood drive proposals, and inter-hospital coordination messages.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <select
            className={inputClass}
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            aria-label="Filter inbox by hospital"
          >
            <option value="All">All Hospitals</option>
            {HOSPITALS.map((hospital) => (
              <option key={hospital} value={hospital}>
                {hospital}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        rows={filtered}
        loading={loading}
        empty="No messages found"
        emptyDetail="Messages submitted through the Contact page appear here."
        columns={[
          { key: 'index', label: '#', render: (_, i) => <span className="font-mono text-xs text-slate-500">{i + 1}</span> },
          {
            key: 'fullName',
            label: 'Sender',
            render: (row) => (
              <div>
                <p className="font-semibold text-slate-900">{row.fullName}</p>
                <p className="text-xs text-slate-500">{row.email}</p>
              </div>
            ),
          },
          { key: 'phoneNumber', label: 'Phone', mono: true },
          { key: 'hospital', label: 'Hospital' },
          {
            key: 'message',
            label: 'Message',
            render: (row) => <p className="min-w-[220px] max-w-md text-xs leading-relaxed text-slate-700">{row.message}</p>,
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete inbox message?"
        message={`Remove the message from ${deleteTarget?.fullName || 'this sender'} regarding ${deleteTarget?.hospital || 'this hospital'}?`}
        confirmLabel="Delete Message"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
