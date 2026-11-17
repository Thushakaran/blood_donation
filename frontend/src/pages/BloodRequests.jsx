import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { EyeIcon, TrashIcon } from '../components/Icons';

const FILTERS = ['All', 'Urgent', 'Pending', 'In Progress', 'Fulfilled'];

export default function BloodRequests() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setRows(await api.listRequests());
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
    if (filter === 'All') return rows;
    if (filter === 'Urgent') return rows.filter((r) => r.urgency === 'urgent' && r.status !== 'Fulfilled');
    return rows.filter((r) => (r.status || 'Pending') === filter);
  }, [rows, filter]);

  async function handleStatusChange(id, nextStatus) {
    try {
      const result = await api.updateRequestStatus(id, nextStatus);
      setStatusMessage(result.message);
      await load();
    } catch (error) {
      setStatusMessage(error.message || 'Unable to update status');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteRequest(deleteTarget.id);
      setStatusMessage(`Request for ${deleteTarget.patientName} closed.`);
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
            Blood Request Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track urgent and normal patient blood requests, update fulfillment status, and match donors.
          </p>
        </div>
        <Link
          to="/need-blood"
          className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto sm:py-2"
        >
          New Blood Request
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:py-1.5 ${
              filter === item ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      <DataTable
        rows={filtered}
        loading={loading}
        empty="No blood requests match this filter"
        emptyDetail="Switch filter tabs or submit a new patient request."
        columns={[
          { key: 'index', label: '#', render: (_, i) => <span className="font-mono text-xs text-slate-500">{i + 1}</span> },
          {
            key: 'patientName',
            label: 'Patient & Doctor',
            render: (row) => (
              <div>
                <Link
                  to={`/dashboard/requests/${row.id}`}
                  className="font-semibold text-slate-900 hover:text-red-600"
                >
                  {row.patientName}
                </Link>
                <p className="text-xs text-slate-500">{row.doctorName}</p>
              </div>
            ),
          },
          {
            key: 'bloodGroupType',
            label: 'Group',
            render: (row) => (
              <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 font-mono text-xs font-bold text-red-700">
                {row.bloodGroupType}
              </span>
            ),
          },
          { key: 'units', label: 'Units', align: 'right', mono: true },
          { key: 'hospitalAddress', label: 'Hospital' },
          {
            key: 'priority',
            label: 'Priority',
            render: (row) => (
              <StatusBadge
                variant={row.urgency === 'urgent' ? 'danger' : 'neutral'}
                label={row.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                showIcon={row.urgency === 'urgent'}
              />
            ),
          },
          {
            key: 'status',
            label: 'Tracking Status',
            render: (row) => (
              <select
                value={row.status || 'Pending'}
                onChange={(e) => handleStatusChange(row.id, e.target.value)}
                aria-label={`Status for ${row.patientName}`}
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold focus:outline-none ${
                  row.status === 'Fulfilled'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : row.status === 'In Progress'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Fulfilled">Fulfilled</option>
              </select>
            ),
          },
          {
            key: 'requiredDate',
            label: 'Required Date',
            mono: true,
            render: (row) => row.requiredDate || 'ASAP',
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (row) => (
              <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                <Link
                  to={`/dashboard/requests/${row.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:py-1"
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  <span>Details</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 sm:py-1"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span>Close</span>
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Close and remove blood request?"
        message={`Confirm that the request for ${deleteTarget?.patientName || 'this patient'} (${deleteTarget?.bloodGroupType || ''}) at ${deleteTarget?.hospitalAddress || ''} can be removed from the queue.`}
        confirmLabel="Remove Request"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
