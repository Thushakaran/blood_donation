import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { inputClass } from '../components/FormField';
import { BLOOD_GROUPS, DISTRICTS } from '../constants';
import { MailIcon, MapPinIcon, PhoneIcon, SearchIcon } from '../components/Icons';

const tableColumns = [
  { key: 'index', label: '#', render: (_, index) => <span className="font-mono text-xs text-slate-500">{index + 1}</span> },
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
    label: 'Blood Group',
    render: (row) => (
      <span className="inline-flex rounded-md bg-red-50 px-2.5 py-0.5 font-mono text-xs font-bold text-red-700">
        {row.bloodGroup}
      </span>
    ),
  },
  {
    key: 'availability',
    label: 'Availability',
    render: (row) => (
      <StatusBadge
        variant={row.available === false ? 'warning' : 'success'}
        label={row.available === false ? 'Rest Interval' : 'Available'}
      />
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
    render: (row) => row.lastBloodDonatedDate || 'First-time donor',
  },
];

export default function SearchDonors() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [bloodGroupFilter, setBloodGroupFilter] = useState(() => searchParams.get('bloodGroup') || 'All');
  const [districtFilter, setDistrictFilter] = useState(() => searchParams.get('district') || 'All');
  const [viewMode, setViewMode] = useState('cards');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(search = '') {
    setLoading(true);
    try {
      const data = await api.searchDonors(search);
      setRows(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load donors');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(query);
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((donor) => {
      if (bloodGroupFilter !== 'All' && donor.bloodGroup !== bloodGroupFilter) return false;
      if (districtFilter !== 'All' && donor.district !== districtFilter) return false;
      return true;
    });
  }, [rows, bloodGroupFilter, districtFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-red-600">Verified Registry</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Find Active Blood Donors
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Filter verified donors by blood group, district, or name to coordinate urgent donations.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <form
          className="grid gap-3 md:grid-cols-12"
          onSubmit={(event) => {
            event.preventDefault();
            load(query);
          }}
        >
          <div className="relative min-w-0 md:col-span-5">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} pl-10`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by donor name, district, province, or blood group..."
            />
          </div>

          <div className="min-w-0 md:col-span-3">
            <label htmlFor="donor-district-filter" className="sr-only">District</label>
            <select
              className={inputClass}
              id="donor-district-filter"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              aria-label="Filter by district"
            >
              <option value="All">All Districts</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap md:col-span-4">
            <button
              type="submit"
              className="min-h-[42px] flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Search
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
                Table
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-4">
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
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6">
        {viewMode === 'table' ? (
          <DataTable
            columns={tableColumns}
            rows={filteredRows}
            loading={loading}
            empty="No matching active donors found"
            emptyDetail="Try clearing the blood group or district filters."
          />
        ) : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-10 w-12 shrink-0 animate-pulse rounded-lg bg-red-50" />
                </div>
                <div className="mt-5 space-y-2.5">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No matching active donors found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search query, blood group, or district filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((donor) => (
              <article
                key={donor.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-slate-900">{donor.name}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {donor.gender === 'female' ? 'Female' : 'Male'} · {donor.bodyWeight} kg
                      </p>
                    </div>
                    <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 font-mono text-sm font-bold text-red-700 ring-1 ring-red-200/70">
                      {donor.bloodGroup}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>
                        {donor.district}, {donor.province}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 font-mono tabular-nums">
                      <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <a href={`tel:${donor.contactNumber}`} className="transition-colors hover:text-red-600">
                        {donor.contactNumber}
                      </a>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <MailIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <a href={`mailto:${donor.email}`} className="truncate transition-colors hover:text-red-600">
                        {donor.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
                  <StatusBadge
                    variant={donor.available === false ? 'warning' : 'success'}
                    label={donor.available === false ? 'Rest Interval' : 'Available'}
                    showIcon
                  />
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {donor.lastBloodDonatedDate ? `Last: ${donor.lastBloodDonatedDate}` : 'First-time'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
