import { useState } from 'react';
import { Link } from 'react-router-dom';
import bloodLabImg from '../assets/images/blood_bank_lab_1794828547381.jpg';
import { HOSPITALS } from '../constants';
import { BuildingIcon, CheckCircleIcon, HeartPulseIcon, ShieldCheckIcon } from '../components/Icons';

const PILLARS = [
  {
    title: 'Multi-Stage Pathogen & Compatibility Screening',
    detail: 'Every collected unit undergoes ABO/Rh typing and comprehensive serological testing before release to hospital wards.',
  },
  {
    title: 'Temperature-Controlled Component Storage',
    detail: 'Whole blood is separated into red cells, fresh frozen plasma, and platelets under strict cold-chain telemetry.',
  },
  {
    title: 'Inter-Hospital Rapid Dispatch',
    detail: 'Real-time visibility across 10 partner hospitals ensures rare blood types like O- and AB- reach emergencies quickly.',
  },
];

export default function About() {
  const [labImgFailed, setLabImgFailed] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-red-600">About Blood Share</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Clinical blood banking built on safety, transparency, and rapid coordination
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Our blood bank network is a cornerstone of lifesaving care, committed to providing a continuous and safe supply of blood and blood products across Sri Lanka.
        </p>
      </div>

      <div className="mt-10 grid items-stretch gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 lg:col-span-6">
          {labImgFailed ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center bg-slate-100 p-8 text-center">
              <HeartPulseIcon className="h-10 w-10 text-red-600" />
              <p className="mt-3 text-base font-semibold text-slate-900">Every donation is a lifeline.</p>
            </div>
          ) : (
            <img
              src={bloodLabImg}
              alt="Medical specialist inspecting organized blood bank storage units in a clinical facility"
              referrerPolicy="no-referrer"
              onError={() => setLabImgFailed(true)}
              className="h-full min-h-[280px] w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-center lg:col-span-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Every donation is a lifeline</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            We collect, test, and store donations with rigorous clinical oversight, ensuring blood is always available to patients in need. From red blood cells to plasma and platelets, our partner facilities prepare and distribute essential components supporting trauma surgery, maternity care, and chronic hematology treatments.
          </p>
          <ul className="mt-6 space-y-3">
            {PILLARS.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Become a Donor
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Contact Blood Bank
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Connected Partner Hospitals</h2>
            <p className="mt-1 text-sm text-slate-600">
              10 major regional and teaching hospitals sharing unified blood inventory visibility.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {HOSPITALS.map((hospital) => (
            <div
              key={hospital}
              className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
            >
              <BuildingIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span className="text-xs font-medium leading-snug text-slate-800">{hospital}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
