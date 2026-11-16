import { Link } from 'react-router-dom';
import { BLOOD_COMPATIBILITY } from '../constants';

const cards = [
  {
    title: 'Donor Registration',
    text: 'Join our blood donor community today. Your donation can save lives and keep hospitals supplied.',
    to: '/register',
    cta: 'Register Now',
  },
  {
    title: 'Need Blood',
    text: 'Request blood for a patient in need. Every request helps match donors with emergencies faster.',
    to: '/need-blood',
    cta: 'Request Now',
  },
  {
    title: 'Search Donor',
    text: 'Find active donors by name, blood group, province, or district and connect when it matters.',
    to: '/search',
    cta: 'Search Donor',
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-900 via-rose-700 to-red-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-100">Give blood</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
            Blood Share
            <span className="mt-2 block text-2xl font-normal text-rose-100 md:text-3xl">
              Give blood and save the world
            </span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-3xl font-bold text-rose-800">
          Online Blood Bank Management System
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl bg-white p-6 shadow">
              <h3 className="text-xl font-semibold text-rose-700">{card.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{card.text}</p>
              <Link
                to={card.to}
                className="mt-6 inline-block rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h3 className="mb-6 text-center text-2xl font-bold text-rose-800">Blood groups</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BLOOD_COMPATIBILITY.map((group) => (
            <div key={group.type} className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
              <h4 className="text-2xl font-bold text-rose-700">{group.type}</h4>
              <p className="mt-2 text-sm text-slate-600">Can give blood to: {group.give}</p>
              <p className="mt-1 text-sm text-slate-600">Can receive blood from: {group.receive}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
