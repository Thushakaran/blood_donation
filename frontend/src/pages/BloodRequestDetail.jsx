import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import { BuildingIcon, CalendarIcon, MailIcon, MapPinIcon, PhoneIcon } from '../components/Icons';

export default function BloodRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFeedback, setStatusFeedback] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getRequest(id), api.activeDonors()])
      .then(([data, donors]) => {
        if (active) setRequest({ ...data, matchingDonors: donors.filter((donor) => donor.bloodGroup === data.bloodGroupType && donor.available !== false) });
      })
      .catch((err) => {
        if (active) setError(err.message || 'Request not found');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function updateStatus(nextStatus) {
    try {
      const result = await api.updateRequestStatus(id, nextStatus);
      setRequest((prev) => ({ ...prev, status: nextStatus }));
      setStatusFeedback(result.message);
    } catch (err) {
      setStatusFeedback(err.message || 'Unable to update status');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-900">{error || 'Request not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/requests')}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Back to Blood Requests
        </button>
      </div>
    );
  }

  const matchingDonors = request.matchingDonors || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/dashboard/requests"
            className="text-xs font-semibold text-red-600 hover:text-red-700"
          >
            ← Back to Blood Requests
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {request.patientName}
            </h1>
            <StatusBadge
              variant={request.urgency === 'urgent' ? 'danger' : 'neutral'}
              label={request.urgency === 'urgent' ? 'Urgent Priority' : 'Normal Priority'}
              showIcon={request.urgency === 'urgent'}
            />
            <StatusBadge
              variant={
                request.status === 'Fulfilled'
                  ? 'success'
                  : request.status === 'In Progress'
                    ? 'warning'
                    : 'neutral'
              }
              label={request.status || 'Pending'}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['Pending', 'In Progress', 'Fulfilled'].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => updateStatus(step)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                (request.status || 'Pending') === step
                  ? step === 'Fulfilled'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-red-600 bg-red-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Mark {step}
            </button>
          ))}
        </div>
      </div>

      {statusFeedback ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {statusFeedback}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Required Blood Component</p>
              <p className="mt-1 font-mono text-3xl font-bold text-red-600">{request.bloodGroupType}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">Units Requested</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-slate-900 tabular-nums">
                {request.units}
              </p>
            </div>
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Admitting Hospital</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium text-slate-900">
                <BuildingIcon className="h-4 w-4 text-slate-400" />
                <span>{request.hospitalAddress}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Attending Physician</dt>
              <dd className="mt-1 font-medium text-slate-900">{request.doctorName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Required Date</dt>
              <dd className="mt-1 flex items-center gap-2 font-mono text-slate-900 tabular-nums">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                <span>{request.requiredDate || 'ASAP'}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Patient Gender</dt>
              <dd className="mt-1 capitalize text-slate-900">{request.gender}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Contact Phone</dt>
              <dd className="mt-1 flex items-center gap-2 font-mono text-slate-900 tabular-nums">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                <span>{request.contactNumber}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Ward / Contact Email</dt>
              <dd className="mt-1 flex items-center gap-2 text-slate-900">
                <MailIcon className="h-4 w-4 text-slate-400" />
                <span>{request.email}</span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500">Clinical Reason / Notes</dt>
              <dd className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-3 text-slate-700">
                {request.reason}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <h2 className="text-base font-semibold text-slate-900">
            Matching Active Donors ({request.bloodGroupType})
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Verified donors in the registry matching this exact blood group
          </p>

          <div className="mt-4 space-y-3">
            {matchingDonors.length === 0 ? (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 text-center text-xs text-slate-500">
                No exact {request.bloodGroupType} active donors found. Check compatible groups in Blood Inventory.
              </div>
            ) : (
              matchingDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="rounded-lg border border-slate-200 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{donor.name}</p>
                    <StatusBadge
                      variant={donor.available === false ? 'warning' : 'success'}
                      label={donor.available === false ? 'Rest Interval' : 'Available'}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                      {donor.district}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                      {donor.contactNumber}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
