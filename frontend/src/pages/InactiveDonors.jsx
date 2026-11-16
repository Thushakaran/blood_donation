import { useEffect, useState } from 'react';
import { api } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { CheckCircleIcon, TrashIcon } from '../components/Icons';

export default function InactiveDonors() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: '', donor: null });
  const [processing, setProcessing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setRows(await api.inactiveDonors());
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirm() {
    if (!dialog.donor) return;
    setProcessing(true);
    try {
      if (dialog.type === 'activate') {
        const res = await api.activateDonor(dialog.donor.id);
        setStatusMessage(`${dialog.donor.name} verified: ${res.message}`);
      } else {
        await api.deleteDonor(dialog.donor.id);
        setStatusMessage(`${dialog.donor.name} registration removed.`);
      }
      setDialog({ open: false, type: '', donor: null });
      await load();
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Pending Donor Approvals
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review newly registered donors, verify eligibility details, and activate profiles into the public search directory.
        </p>
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      <DataTable
        rows={rows}
        loading={loading}
        empty="No pending donor registrations"
        emptyDetail="All submitted donor applications have been reviewed."
        columns={[
          { key: 'index', label: '#', render: (_, i) => <span className="font-mono text-xs text-slate-500">{i + 1}</span> },
          {
            key: 'name',
            label: 'Applicant',
            render: (row) => (
              <div>
                <p className="font-semibold text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-500">Father: {row.fatherName}</p>
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
            key: 'status',
            label: 'Status',
            render: () => <StatusBadge variant="warning" label="Pending Review" showIcon />,
          },
          {
            key: 'bodyWeight',
            label: 'Weight',
            mono: true,
            render: (row) => `${row.bodyWeight} kg`,
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
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (row) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDialog({ open: true, type: 'activate', donor: row })}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  <span>Activate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDialog({ open: true, type: 'delete', donor: row })}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={dialog.open}
        tone={dialog.type === 'activate' ? 'success' : 'danger'}
        title={dialog.type === 'activate' ? 'Activate donor profile?' : 'Reject and delete registration?'}
        message={
          dialog.type === 'activate'
            ? `Approving ${dialog.donor?.name || 'this applicant'} (${dialog.donor?.bloodGroup || ''}) will publish their donor profile in the verified registry.`
            : `This will permanently delete ${dialog.donor?.name || 'this registration'} from the pending queue.`
        }
        confirmLabel={dialog.type === 'activate' ? 'Activate Donor' : 'Delete Registration'}
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={() => setDialog({ open: false, type: '', donor: null })}
      />
    </div>
  );
}
