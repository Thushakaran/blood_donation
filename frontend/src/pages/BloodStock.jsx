import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import FormField, { inputClass } from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { BLOOD_GROUPS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { AlertTriangleIcon, CheckCircleIcon } from '../components/Icons';

function StockCell({ value }) {
  const isCritical = value <= 2;
  const isLow = value > 2 && value <= 5;
  return (
    <span
      className={`inline-block min-w-[2.25rem] rounded px-1.5 py-0.5 text-center font-mono text-xs font-semibold tabular-nums ${
        isCritical
          ? 'bg-red-50 text-red-700'
          : isLow
            ? 'bg-amber-50 text-amber-700'
            : 'text-slate-800'
      }`}
    >
      {value}
    </span>
  );
}

export default function BloodStock() {
  const { isSuperAdmin, hospitalName } = useAuth();
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [matrixFilter, setMatrixFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    hospitalName: '',
    bloodGroup: 'A+',
    action: 'increase',
    units: 1,
  });

  async function load() {
    setLoading(true);
    try {
      const [stockData, analyticsData] = await Promise.all([api.listStock(), api.analytics()]);
      setRows(stockData);
      setHistory(analyticsData?.stockHistory || []);
      setForm((current) => ({
        ...current,
        hospitalName: stockData.some((row) => row.hospitalName === current.hospitalName)
          ? current.hospitalName
          : stockData[0]?.hospitalName || '',
      }));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const groupSummaries = useMemo(() => {
    const fieldMap = {
      'O+': 'oPositive',
      'O-': 'oNegative',
      'A+': 'aPositive',
      'A-': 'aNegative',
      'B+': 'bPositive',
      'B-': 'bNegative',
      'AB+': 'abPositive',
      'AB-': 'abNegative',
    };
    return BLOOD_GROUPS.map((group) => {
      const key = fieldMap[group];
      const total = rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
      const level = total < 25 ? 'Critical' : total < 50 ? 'Low Stock' : 'Optimal';
      return { group, total, level };
    });
  }, [rows]);

  const lowGroups = groupSummaries.filter((g) => g.level !== 'Optimal');

  const matrixRows = useMemo(() => {
    if (matrixFilter !== 'low') return rows;
    const stockKeys = ['aPositive', 'aNegative', 'bPositive', 'bNegative', 'abPositive', 'abNegative', 'oPositive', 'oNegative'];
    return rows.filter((row) => stockKeys.some((key) => Number(row[key] || 0) <= 5));
  }, [rows, matrixFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const result = await api.updateStock({ ...form, units: Number(form.units) });
      setStatus({ type: 'success', message: result.message || 'Stock updated successfully' });
      await load();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to update stock' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Blood Inventory Management
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {isSuperAdmin ? 'Monitor and adjust blood unit availability across all hospitals.' : `Monitor and adjust blood units at ${hospitalName || 'your assigned hospital'}.`}
        </p>
      </div>

      {lowGroups.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Low-Stock Advisory</p>
            <p className="mt-0.5 text-xs text-amber-800">
              {lowGroups.map((g) => `${g.group} (${g.total} units)`).join(' · ')} currently below optimal network reserve threshold (50 units).
            </p>
          </div>
        </div>
      ) : null}

      {/* Visual Blood Group Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groupSummaries.map((item) => {
          const pct = Math.min(100, Math.round((item.total / 250) * 100));
          const barColor =
            item.level === 'Critical'
              ? 'bg-red-600'
              : item.level === 'Low Stock'
                ? 'bg-amber-500'
                : 'bg-emerald-600';
          return (
            <div
              key={item.group}
              className={`rounded-xl border bg-white p-5 shadow-xs transition-colors ${
                item.level === 'Critical' ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-red-600">{item.group}</span>
                <StatusBadge
                  variant={
                    item.level === 'Critical'
                      ? 'danger'
                      : item.level === 'Low Stock'
                        ? 'warning'
                        : 'success'
                  }
                  label={item.level}
                  showIcon={item.level !== 'Optimal'}
                />
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                {loading ? '...' : `${item.total} units`}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Inventory Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <h2 className="text-base font-semibold text-slate-900">Adjust Hospital Blood Stock</h2>
        {status.message ? (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="min-w-0 sm:col-span-2">
            <FormField label="Hospital">
              <select
                className={inputClass}
                value={form.hospitalName}
                onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
              >
                {rows.map((row) => (
                  <option key={row.id} value={row.hospitalName}>{row.hospitalName}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="min-w-0">
            <FormField label="Blood Group">
              <select
                className={inputClass}
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              >
                {BLOOD_GROUPS.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="min-w-0">
            <FormField label="Action">
              <select
                className={inputClass}
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
              >
                <option value="increase">Increase (+)</option>
                <option value="decrease">Decrease (-)</option>
              </select>
            </FormField>
          </div>
          <div className="min-w-0 sm:col-span-2 xl:col-span-1">
            <FormField label="Units">
              <div className="flex gap-2">
                <input
                  className={`${inputClass} min-w-0 flex-1`}
                  type="number"
                  min="1"
                  value={form.units}
                  onChange={(e) => setForm({ ...form, units: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting ? '...' : 'Apply'}
                </button>
              </div>
            </FormField>
          </div>
        </div>
      </form>

      {/* Hospital Matrix Table */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Hospital Stock Matrix</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Red cells: critical (&le;2 units) · Amber cells: low (&le;5 units)
            </p>
          </div>
          <div className="inline-flex self-start rounded-lg border border-slate-200 bg-white p-1 sm:self-end">
            <button
              type="button"
              onClick={() => setMatrixFilter('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                matrixFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Hospitals ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => setMatrixFilter('low')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                matrixFilter === 'low' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low / Critical Only
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ) : matrixRows.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">
              {matrixFilter === 'low' ? 'No hospitals have low or critical stock' : 'No hospital stock records found'}
            </p>
            {matrixFilter === 'low' ? (
              <p className="mt-1 text-xs text-slate-500">All listed hospitals hold more than 5 units in every blood group.</p>
            ) : null}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="sticky left-0 z-10 whitespace-nowrap bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">Hospital</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">A+</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">A-</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">B+</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">B-</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">AB+</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">AB-</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">O+</th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">O-</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixRows.map((row) => (
                    <tr key={row.id} className="group transition-colors hover:bg-slate-50/90">
                      <td className="sticky left-0 z-10 max-w-[180px] truncate bg-white px-3 py-2.5 font-medium text-slate-900 group-hover:bg-slate-50 sm:max-w-none sm:px-4 sm:py-3">
                        {row.hospitalName}
                      </td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.aPositive} /></td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.aNegative} /></td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.bPositive} /></td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.bNegative} /></td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.abPositive} /></td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.abNegative} /></td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.oPositive} /></td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3"><StockCell value={row.oNegative} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Inventory Adjustment History */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Inventory Adjustment History</h2>
        <DataTable
          rows={history}
          loading={loading}
          empty="No stock adjustments logged yet"
          columns={[
            { key: 'hospitalName', label: 'Hospital', render: (r) => <span className="font-medium text-slate-900">{r.hospitalName}</span> },
            {
              key: 'bloodGroup',
              label: 'Blood Group',
              render: (r) => <span className="font-mono text-xs font-bold text-red-700">{r.bloodGroup}</span>,
            },
            {
              key: 'action',
              label: 'Change',
              render: (r) => (
                <StatusBadge
                  variant={r.action === 'increase' ? 'success' : 'warning'}
                  label={r.action === 'increase' ? `+${r.units} units added` : `-${r.units} units dispatched`}
                />
              ),
            },
            { key: 'performedBy', label: 'Updated By' },
            {
              key: 'timestamp',
              label: 'Date',
              align: 'right',
              mono: true,
              render: (r) => (r.timestamp ? r.timestamp.slice(0, 16).replace('T', ' ') : ''),
            },
          ]}
        />
      </section>
    </div>
  );
}
