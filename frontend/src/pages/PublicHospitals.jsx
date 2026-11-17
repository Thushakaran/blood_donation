import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import { inputClass } from '../components/FormField';
import { BLOOD_GROUPS } from '../constants';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BuildingIcon,
  CheckCircleIcon,
  DropletFillIcon,
  MapPinIcon,
  PhoneIcon,
  SearchIcon,
} from '../components/Icons';

const GROUP_FIELD_MAP = {
  'O+': 'oPositive',
  'O-': 'oNegative',
  'A+': 'aPositive',
  'A-': 'aNegative',
  'B+': 'bPositive',
  'B-': 'bNegative',
  'AB+': 'abPositive',
  'AB-': 'abNegative',
};

function totalForHospital(row) {
  if (typeof row?.totalUnits === 'number') return row.totalUnits;
  return Object.values(GROUP_FIELD_MAP).reduce((sum, key) => sum + Number(row?.[key] || 0), 0);
}

function UnitTile({ group, units, isFocused, isDimmed, onToggle }) {
  const isCritical = units <= 2;
  const isLow = units > 2 && units <= 5;
  const pct = Math.min(100, Math.round((units / 30) * 100));

  const surfaceTone = isFocused
    ? 'bg-white ring-2 ring-red-500 shadow-xs'
    : isCritical
      ? 'bg-red-50/75 hover:bg-red-50'
      : isLow
        ? 'bg-amber-50/75 hover:bg-amber-50'
        : 'bg-slate-50/90 hover:bg-slate-100/80';

  const countColor = isCritical
    ? 'text-red-700'
    : isLow
      ? 'text-amber-700'
      : 'text-slate-900';

  const statusText = isCritical ? 'Critical' : isLow ? 'Low' : 'Ready';
  const statusColor = isCritical
    ? 'text-red-600'
    : isLow
      ? 'text-amber-600'
      : 'text-emerald-700';

  const barColor = isCritical
    ? 'bg-red-500'
    : isLow
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <button
      type="button"
      onClick={() => onToggle(group)}
      aria-pressed={isFocused}
      title={`Focus ${group} blood availability`}
      className={`rounded-xl px-3 py-2.5 text-left transition-all ${surfaceTone} ${
        isDimmed ? 'opacity-45 hover:opacity-100' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono text-xs font-bold text-slate-700">{group}</span>
        <span className={`text-[10px] font-semibold ${statusColor}`}>{statusText}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`font-mono text-lg font-bold leading-none tabular-nums ${countColor}`}>
          {units}
        </span>
        <span className="text-[11px] text-slate-500">u</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200/70">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(units > 0 ? 8 : 0, pct)}%` }}
        />
      </div>
    </button>
  );
}

export default function PublicHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [needsOnly, setNeedsOnly] = useState(false);
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => {
    let active = true;
    api
      .publicStock()
      .then((rows) => {
        if (!active) return;
        setHospitals(Array.isArray(rows) ? rows : []);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load hospital stock availability');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const networkTotals = useMemo(() => {
    const totalUnits = hospitals.reduce((sum, row) => sum + totalForHospital(row), 0);
    let criticalCells = 0;
    const groupTotals = BLOOD_GROUPS.map((group) => {
      const key = GROUP_FIELD_MAP[group];
      const units = hospitals.reduce((sum, row) => sum + Number(row[key] || 0), 0);
      hospitals.forEach((row) => {
        if (Number(row[key] || 0) <= 2) criticalCells += 1;
      });
      return { group, units };
    });
    const topGroup = [...groupTotals].sort((a, b) => b.units - a.units)[0];
    return {
      hospitalCount: hospitals.length,
      totalUnits,
      criticalCells,
      topGroup: topGroup ? `${topGroup.group} (${topGroup.units})` : '—',
    };
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = hospitals.filter((row) => {
      if (q) {
        const matchesQuery =
          String(row.hospitalName || '').toLowerCase().includes(q) ||
          String(row.address || '').toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (needsOnly) {
        if (bloodGroupFilter !== 'All') {
          return Number(row[GROUP_FIELD_MAP[bloodGroupFilter]] || 0) <= 5;
        }
        return Object.values(GROUP_FIELD_MAP).some((key) => Number(row[key] || 0) <= 5);
      }
      return true;
    });

    if (bloodGroupFilter === 'All') return list;
    const key = GROUP_FIELD_MAP[bloodGroupFilter];
    return [...list].sort((a, b) =>
      needsOnly
        ? Number(a[key] || 0) - Number(b[key] || 0)
        : Number(b[key] || 0) - Number(a[key] || 0)
    );
  }, [hospitals, query, bloodGroupFilter, needsOnly]);

  function toggleGroupFocus(group) {
    setBloodGroupFilter((current) => (current === group ? 'All' : group));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-red-600">Public Blood Bank Directory</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Hospitals &amp; Available Blood Units
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            View live blood unit counts across all participating hospital blood banks. Click any blood group to compare reserves or find hospitals needing donations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <span>Donate Blood</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            to="/need-blood"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            Request Blood
          </Link>
        </div>
      </div>

      {/* 4-Card Summary Strip */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500">Connected Hospitals</p>
            <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {loading ? '—' : networkTotals.hospitalCount}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <BuildingIcon className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Available Units</p>
            <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {loading ? '—' : networkTotals.totalUnits.toLocaleString()}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <DropletFillIcon className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500">Critical Group Alerts (≤2)</p>
            <p className="mt-2 font-mono text-2xl font-bold text-red-600 tabular-nums">
              {loading ? '—' : networkTotals.criticalCells}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangleIcon className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500">Highest Reserve Group</p>
            <p className="mt-2 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
              {loading ? '—' : networkTotals.topGroup}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircleIcon className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Filter & View Bar */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} pl-10`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hospital name or location..."
              aria-label="Search hospitals"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setNeedsOnly((prev) => !prev)}
              aria-pressed={needsOnly}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                needsOnly
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <AlertTriangleIcon className={`h-3.5 w-3.5 ${needsOnly ? 'text-red-600' : 'text-slate-400'}`} />
              <span>Needs Donations (≤5 units)</span>
            </button>

            <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Matrix Table
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-500">Focus blood group:</span>
            {['All', ...BLOOD_GROUPS].map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setBloodGroupFilter(group)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  bloodGroupFilter === group
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {group === 'All' ? 'All Groups' : group}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <StatusBadge variant="danger" label="≤2 Critical" />
            <StatusBadge variant="warning" label="3–5 Low" />
            <StatusBadge variant="success" label="6+ Ready" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {BLOOD_GROUPS.map((g) => (
                    <div key={g} className="h-[68px] animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No hospitals match your filters</p>
            <p className="mt-1 text-sm text-slate-500">
              Try clearing the search query or turning off the low-stock filter to view all partner hospitals.
            </p>
            {(query || needsOnly || bloodGroupFilter !== 'All') ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setNeedsOnly(false);
                  setBloodGroupFilter('All');
                }}
                className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="sticky left-0 z-10 whitespace-nowrap bg-slate-50 px-4 py-3 font-semibold">
                    Hospital
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">Contact</th>
                  {BLOOD_GROUPS.map((group) => (
                    <th
                      key={group}
                      className={`whitespace-nowrap px-3 py-3 text-center font-mono font-semibold ${
                        bloodGroupFilter === group ? 'bg-red-50 text-red-700' : ''
                      }`}
                    >
                      {group}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHospitals.map((row) => {
                  const total = totalForHospital(row);
                  return (
                    <tr key={row.id || row.hospitalName} className="group hover:bg-slate-50/70">
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 group-hover:bg-slate-50">
                        <p className="font-semibold text-slate-900">{row.hospitalName}</p>
                        {row.address ? (
                          <p className="text-xs text-slate-500">{row.address}</p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-600 tabular-nums">
                        {row.contactNumber || '—'}
                      </td>
                      {BLOOD_GROUPS.map((group) => {
                        const units = Number(row[GROUP_FIELD_MAP[group]] || 0);
                        const tone =
                          units <= 2
                            ? 'bg-red-50 text-red-700'
                            : units <= 5
                              ? 'bg-amber-50 text-amber-700'
                              : 'text-slate-800';
                        return (
                          <td
                            key={group}
                            className={`px-3 py-3 text-center ${
                              bloodGroupFilter === group ? 'bg-red-50/30' : ''
                            }`}
                          >
                            <span
                              className={`inline-block min-w-[2.25rem] rounded px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${tone}`}
                            >
                              {units}
                            </span>
                          </td>
                        );
                      })}
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredHospitals.map((row) => {
              const total = totalForHospital(row);
              const focusedUnits =
                bloodGroupFilter !== 'All'
                  ? Number(row[GROUP_FIELD_MAP[bloodGroupFilter]] || 0)
                  : null;
              const criticalCount = BLOOD_GROUPS.filter(
                (group) => Number(row[GROUP_FIELD_MAP[group]] || 0) <= 2
              ).length;

              return (
                <article
                  key={row.id || row.hospitalName}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <BuildingIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="text-base font-bold text-slate-900">
                            {row.hospitalName}
                          </h2>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            {row.address ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span>{row.address}</span>
                              </span>
                            ) : null}
                            {row.contactNumber ? (
                              <a
                                href={`tel:${row.contactNumber}`}
                                className="inline-flex items-center gap-1 font-mono tabular-nums transition-colors hover:text-red-600"
                              >
                                <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span>{row.contactNumber}</span>
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                          {total} units
                        </p>
                        {focusedUnits !== null ? (
                          <p
                            className={`text-xs font-semibold ${
                              focusedUnits <= 2
                                ? 'text-red-600'
                                : focusedUnits <= 5
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                            }`}
                          >
                            {bloodGroupFilter}: {focusedUnits} units
                          </p>
                        ) : criticalCount > 0 ? (
                          <p className="text-xs font-semibold text-red-600">
                            {criticalCount} critical {criticalCount === 1 ? 'group' : 'groups'}
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-emerald-700">Reserves steady</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {BLOOD_GROUPS.map((group) => (
                        <UnitTile
                          key={group}
                          group={group}
                          units={Number(row[GROUP_FIELD_MAP[group]] || 0)}
                          isFocused={bloodGroupFilter === group}
                          isDimmed={bloodGroupFilter !== 'All' && bloodGroupFilter !== group}
                          onToggle={toggleGroupFocus}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs">
                    <Link
                      to="/register"
                      className="font-semibold text-red-600 hover:text-red-700"
                    >
                      Donate to replenish stock →
                    </Link>
                    <Link
                      to="/need-blood"
                      className="font-medium text-slate-600 hover:text-slate-900"
                    >
                      Submit patient request
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
