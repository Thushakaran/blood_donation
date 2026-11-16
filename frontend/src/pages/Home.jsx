import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { BLOOD_COMPATIBILITY } from '../constants';
import heroClinicImg from '../assets/images/hero_blood_clinic_1794828546655.jpg';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  DropletFillIcon,
  HeartPulseIcon,
  ShieldCheckIcon,
} from '../components/Icons';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Register & Screen',
    description:
      'Complete a 2-minute donor profile with your blood group, district, and medical eligibility confirmation.',
  },
  {
    step: '02',
    title: 'Clinical Verification',
    description:
      'Hospital coordinators verify donor readiness and activate your profile for regional emergency matching.',
  },
  {
    step: '03',
    title: 'Donate & Save Lives',
    description:
      'Respond to urgent hospital blood requests or donate at any of our 10 connected medical centers.',
  },
];

const WHY_DONATE = [
  {
    title: 'Three Lives From One Donation',
    description:
      'Every 450 ml whole blood donation is separated into red blood cells, plasma, and platelets for surgical, trauma, and oncology patients.',
  },
  {
    title: 'Continuous Hospital Readiness',
    description:
      'Red cells have a 42-day shelf life and platelets last just 5 days, requiring steady daily replenishment across regional blood banks.',
  },
  {
    title: 'Complimentary Health Screening',
    description:
      'Each visit includes hemoglobin, blood pressure, pulse, and infectious-disease screening performed by certified hospital staff.',
  },
];

const ELIGIBILITY_RULES = [
  'Aged between 18 and 60 years old with valid national identification',
  'Minimum body weight of 50 kg and in good general health on donation day',
  'At least 4 months (120 days) since your previous whole blood donation',
  'Normal hemoglobin level and no active fever, infection, or recent major surgery',
];

const TESTIMONIALS = [
  {
    quote:
      'When our surgical ward faced a critical O- shortage before midnight, Blood Share matched two verified donors within 25 minutes.',
    name: 'Dr. K. Senanayake',
    role: 'Consultant Trauma Surgeon, National Hospital of Sri Lanka',
  },
  {
    quote:
      'Having clear donor intervals and hospital contact details makes regular donation effortless. I have donated four times through the Jaffna center.',
    name: 'Nirosha Sivalingam',
    role: 'Registered A+ Donor, Jaffna',
  },
  {
    quote:
      'Centralizing blood stock levels across all 10 partner hospitals reduced emergency inter-hospital transfer delays significantly.',
    name: 'Dr. P. Mahendran',
    role: 'Hematology Unit Lead, Jaffna Teaching Hospital',
  },
];

export default function Home() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .publicOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      label: 'Total Registered Donors',
      value: overview ? overview.totalDonors : '—',
      context: overview ? `${overview.activeDonors} verified active` : 'Across 8 provinces',
    },
    {
      label: 'Available Blood Units',
      value: overview ? overview.availableUnits : '—',
      context: 'Across 10 partner hospitals',
    },
    {
      label: 'Successful Donations',
      value: overview ? overview.successfulDonations : '—',
      context: 'Screened whole-blood units',
    },
    {
      label: 'Blood Requests Fulfilled',
      value: overview ? overview.requestsFulfilled : '—',
      context: 'Emergency & scheduled care',
    },
  ];

  const recentRequests = overview?.recentRequests || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-sm font-semibold text-red-600">
                Sri Lanka Hospital Blood Bank Network
              </p>
              <h1
                className="mt-3 max-w-xl font-bold tracking-tight text-slate-900"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', lineHeight: 1.1, textWrap: 'balance' }}
              >
                Give blood today. Keep every hospital ready.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Connect directly with verified donors, submit urgent hospital blood requests, and support safe transfusion reserves across 10 major Sri Lankan medical centers.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  <span>Donate Blood</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/need-blood"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <span>Request Blood</span>
                </Link>
                <Link
                  to="/search"
                  className="whitespace-nowrap px-2 py-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                >
                  Search active donors
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500">
                <span>10 Regional Hospitals</span>
                <span aria-hidden="true">·</span>
                <span>24/7 Emergency Coordination</span>
                <span aria-hidden="true">·</span>
                <span>Screened Donor Registry</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-96 lg:h-full lg:min-h-[420px]">
                {heroImgFailed ? (
                  <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-slate-100 p-8 text-center">
                    <HeartPulseIcon className="h-12 w-12 text-red-600" />
                    <p className="mt-4 text-lg font-semibold text-slate-900">Clinical Blood Donation Network</p>
                    <p className="mt-1 text-sm text-slate-600">Connecting donors and hospital transfusion units</p>
                  </div>
                ) : (
                  <img
                    src={heroClinicImg}
                    alt="Nurse assisting a volunteer blood donor in a modern sunlit blood donation clinic"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 4-Column KPI Strip */}
          <div className="mt-12 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {loading ? '...' : stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{stat.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-red-600">Donation Process</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            How Blood Share coordinates every donation
          </h2>
          <p className="mt-3 text-base text-slate-600">
            A structured three-step clinical workflow ensuring donor safety and rapid hospital matching.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <article
              key={item.step}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <p className="font-mono text-sm font-semibold text-red-600 tabular-nums">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Recent Blood Donation Requests */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-red-600">Active Hospital Demand</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Recent blood donation requests
              </h2>
            </div>
            <Link
              to="/need-blood"
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-red-600 hover:text-red-700"
            >
              <span>Submit a patient request</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[1, 2].map((skeleton) => (
                <div key={skeleton} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-900">No open blood requests right now</p>
              <p className="mt-1 text-sm text-slate-600">
                All current hospital transfusion requests have been fulfilled. You can still register as a donor for future needs.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Register as Donor
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {recentRequests.map((req) => (
                <article
                  key={req.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 font-mono text-base font-bold text-red-700">
                          {req.bloodGroupType}
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {req.hospitalAddress}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {req.units} unit(s) needed · {req.reason}
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        variant={req.urgency === 'urgent' ? 'danger' : 'warning'}
                        label={req.urgency === 'urgent' ? 'Urgent' : req.status}
                        showIcon={req.urgency === 'urgent'}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      Required by {req.requiredDate || 'ASAP'}
                    </span>
                    <Link
                      to="/register"
                      className="font-semibold text-red-600 hover:text-red-700"
                    >
                      Volunteer to donate →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Donate & Eligibility Criteria */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold text-red-600">Clinical Impact</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Why donate blood regularly
            </h2>
            <div className="mt-8 space-y-6">
              {WHY_DONATE.map((point) => (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <DropletFillIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex items-center gap-2.5 text-slate-900">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Donor Eligibility Criteria</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Before registering, review the standard medical screening requirements for safe donation.
              </p>
              <ul className="mt-5 space-y-3.5">
                {ELIGIBILITY_RULES.map((rule) => (
                  <li key={rule} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <Link
                  to="/register"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Check Eligibility & Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Compatibility Guide */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-red-600">Compatibility Reference</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Blood group donation matrix
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BLOOD_COMPATIBILITY.map((group) => (
              <div
                key={group.type}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-red-600">{group.type}</span>
                  <BuildingIcon className="h-4 w-4 text-slate-400" />
                </div>
                <dl className="mt-3 space-y-1.5 text-xs">
                  <div>
                    <dt className="font-medium text-slate-500">Can give to</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">{group.give}</dd>
                  </div>
                  <div className="pt-1">
                    <dt className="font-medium text-slate-500">Can receive from</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">{group.receive}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-red-600">Community & Hospital Voices</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Trusted by clinicians and volunteer donors
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <blockquote
                key={item.name}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
              >
                <p className="text-sm leading-relaxed text-slate-700">“{item.quote}”</p>
                <footer className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
