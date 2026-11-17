import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  ClipboardListIcon,
  InboxIcon,
  UserCheckIcon,
  UserClockIcon,
} from '../components/Icons';

export default function Dashboard() {
  const { isSuperAdmin, hospitalName } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.stats(), api.analytics(), api.listRequests()])
      .then(([statsData, analyticsData, requestsData]) => {
        if (!active) return;
        setStats(statsData);
        setAnalytics(analyticsData);
        setRequests(requestsData);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load dashboard overview');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const kpis = [
    {
      label: 'Active Donors',
      value: stats?.activeDonors ?? '—',
      sub: 'Verified in donor registry',
      to: '/dashboard/active-donors',
      icon: UserCheckIcon,
      tone: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Pending Verification',
      value: stats?.inactiveDonors ?? '—',
      sub: 'Awaiting coordinator review',
      to: '/dashboard/inactive-donors',
      icon: UserClockIcon,
      tone: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Blood Requests',
      value: stats?.bloodRequests ?? '—',
      sub: 'Active & fulfilled queue',
      to: '/dashboard/requests',
      icon: ClipboardListIcon,
      tone: 'text-red-600 bg-red-50',
    },
    {
      label: 'Inbox Messages',
      value: stats?.inboxMessages ?? '—',
      sub: 'Hospital & public inquiries',
      to: '/dashboard/inbox',
      icon: InboxIcon,
      tone: 'text-slate-700 bg-slate-100',
    },
  ].filter((card) => isSuperAdmin || !['Active Donors', 'Pending Verification', 'Inbox Messages'].includes(card.label));

  const stockByGroup = analytics?.stockByGroup || [];
  const maxStock = Math.max(1, ...stockByGroup.map((g) => g.units));
  const monthly = analytics?.monthlyDonations || [];
  const maxMonthly = Math.max(1, ...monthly.map((m) => Math.max(m.donations, m.requests)));
  const notifications = (analytics?.notifications || []).filter((note) => note.active);
  const activities = analytics?.recentActivities || [];
  const donationHistory = analytics?.donationHistory || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Operations Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isSuperAdmin
              ? 'Network-wide donor registry, hospital blood reserves, and clinical requests.'
              : `Operations and blood reserves for ${hospitalName || 'your assigned hospital'}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard/stock"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ActivityIcon className="h-4 w-4 text-red-600" />
            <span>Manage Inventory</span>
          </Link>
          <Link
            to="/dashboard/requests"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <span>Review Requests</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                {loading ? '...' : card.value}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500 group-hover:text-slate-700">
                <span>{card.sub}</span>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">
                Network Blood Units by Group
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {isSuperAdmin ? 'Aggregate units across all hospitals' : `Available at ${hospitalName || 'your hospital'}`} ({analytics?.totalUnits ?? 0} total units)
              </p>
            </div>
            <Link to="/dashboard/stock" className="shrink-0 whitespace-nowrap text-xs font-semibold text-red-600 hover:text-red-700">
              Update stock →
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="h-52 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              stockByGroup.map((group) => {
                const widthPct = Math.max(6, Math.round((group.units / maxStock) * 100));
                const barColor =
                  group.status === 'Critical'
                    ? 'bg-red-600'
                    : group.status === 'Low Stock'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600';
                return (
                  <div key={group.bloodGroup} className="flex items-center gap-3">
                    <span className="w-9 shrink-0 font-mono text-xs font-bold text-slate-900">
                      {group.bloodGroup}
                    </span>
                    <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <div className="flex w-14 shrink-0 items-center justify-end gap-2 sm:w-28">
                      <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        {group.units}
                      </span>
                      <span
                        className={`hidden whitespace-nowrap text-[11px] font-medium sm:inline ${
                          group.status === 'Critical'
                            ? 'text-red-600'
                            : group.status === 'Low Stock'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                        }`}
                      >
                        {group.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Donations vs. Requests (6 Months)
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Monthly donation and request totals</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-600" />
              Donations
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" />
              Requests
            </span>
          </div>

          {monthly.length === 0 ? (
            <p className="mt-6 flex h-44 items-center justify-center border-b border-slate-100 text-center text-sm text-slate-500">
              Monthly totals will appear when dated donation and request history is available.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto pt-4">
              <div className="relative min-w-[270px]">
                {/* Horizontal gridlines */}
                <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
                  {[maxMonthly, Math.round(maxMonthly / 2), 0].map((tick, idx) => (
                    <div key={`${tick}-${idx}`} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-right font-mono text-[10px] text-slate-400 tabular-nums">
                        {tick}
                      </span>
                      <div className="h-px flex-1 border-b border-dashed border-slate-200/80" />
                    </div>
                  ))}
                </div>

                <div className="relative flex h-44 items-end justify-between gap-2 pl-8 pb-6">
                  {monthly.map((item) => {
                    const donH = Math.max(item.donations > 0 ? 6 : 0, Math.round((item.donations / maxMonthly) * 136));
                    const reqH = Math.max(item.requests > 0 ? 6 : 0, Math.round((item.requests / maxMonthly) * 136));
                    return (
                      <div key={item.month} className="group relative flex flex-1 flex-col items-center justify-end">
                        <div className="pointer-events-none absolute -top-6 z-10 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-white shadow-sm group-hover:block tabular-nums">
                          {item.donations}D · {item.requests}R
                        </div>
                        <div className="flex h-[136px] items-end gap-1">
                          <div
                            className="w-3 rounded-t-sm bg-red-600 transition-opacity duration-150 group-hover:opacity-90 sm:w-3.5"
                            style={{ height: `${donH}px` }}
                            title={`${item.donations} donations`}
                          />
                          <div
                            className="w-3 rounded-t-sm bg-slate-400 transition-opacity duration-150 group-hover:opacity-90 sm:w-3.5"
                            style={{ height: `${reqH}px` }}
                            title={`${item.requests} requests`}
                          />
                        </div>
                        <span className="absolute -bottom-6 font-mono text-xs text-slate-500">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Notifications + Blood Request Summary */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <h2 className="text-base font-semibold text-slate-900">Actionable Alerts</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Low-stock warnings, urgent requests, and pending donor approvals
          </p>

          <div className="mt-4 space-y-2.5">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No urgent alerts at this time.
              </p>
            ) : (
              notifications.slice(0, 5).map((note) => (
                <Link
                  key={note.id}
                  to={note.to}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
                >
                  <AlertTriangleIcon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      note.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900">{note.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{note.detail}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">Blood Request Summary</h2>
              <p className="mt-0.5 text-xs text-slate-500">Latest patient blood requests across hospitals</p>
            </div>
            <Link to="/dashboard/requests" className="shrink-0 whitespace-nowrap text-xs font-semibold text-red-600 hover:text-red-700">
              View all →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="whitespace-nowrap py-2.5 pr-4">Patient</th>
                  <th className="whitespace-nowrap py-2.5 pr-4">Group</th>
                  <th className="whitespace-nowrap py-2.5 pr-4">Hospital</th>
                  <th className="whitespace-nowrap py-2.5 pr-4">Status</th>
                  <th className="whitespace-nowrap py-2.5 text-right">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <Link
                        to={`/dashboard/requests/${req.id}`}
                        className="font-medium text-slate-900 hover:text-red-600"
                      >
                        {req.patientName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 font-mono text-xs font-bold text-red-700">
                      {req.bloodGroupType}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-slate-600">{req.hospitalAddress}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <StatusBadge
                        variant={
                          req.status === 'Fulfilled'
                            ? 'success'
                            : req.urgency === 'urgent'
                              ? 'danger'
                              : 'warning'
                        }
                        label={req.urgency === 'urgent' && req.status !== 'Fulfilled' ? `Urgent · ${req.status}` : req.status}
                      />
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      {req.units}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Recent Activities + Donation History */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-6">
          <h2 className="text-base font-semibold text-slate-900">Recent Activities</h2>
          <p className="mt-0.5 text-xs text-slate-500">Recent blood inventory adjustments {isSuperAdmin ? 'across hospitals' : `at ${hospitalName || 'your hospital'}`}</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {activities.length === 0 && <li className="py-8 text-center text-sm text-slate-500">No inventory adjustments have been recorded yet.</li>}
            {activities.slice(0, 5).map((act) => (
              <li key={act.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{act.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{act.detail}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                    {act.timestamp ? act.timestamp.slice(0, 10) : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {isSuperAdmin && (
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">Last Recorded Donation Dates</h2>
              <p className="mt-0.5 text-xs text-slate-500">Most recent donation dates saved on active donor profiles</p>
            </div>
            <Link to="/dashboard/active-donors" className="shrink-0 whitespace-nowrap text-xs font-semibold text-red-600 hover:text-red-700">
              All donors →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="whitespace-nowrap py-2 pr-3">Donor</th>
                  <th className="whitespace-nowrap py-2 pr-3">Group</th>
                  <th className="whitespace-nowrap py-2 pr-3">District</th>
                  <th className="whitespace-nowrap py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donationHistory.slice(0, 5).map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap py-2.5 pr-3 font-medium text-slate-900">{d.donorName}</td>
                    <td className="whitespace-nowrap py-2.5 pr-3 font-mono text-xs font-bold text-red-700">{d.bloodGroup}</td>
                    <td className="whitespace-nowrap py-2.5 pr-3 text-xs text-slate-600">{d.district}</td>
                    <td className="whitespace-nowrap py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums">{d.date}</td>
                  </tr>
                ))}
                {donationHistory.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-sm text-slate-500">No donor donation dates have been recorded.</td></tr>}
              </tbody>
            </table>
          </div>
          </section>
        )}
      </div>
    </div>
  );
}
