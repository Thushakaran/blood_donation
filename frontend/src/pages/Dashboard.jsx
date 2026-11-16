import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.stats().then(setStats).catch((err) => setError(err.message));
  }, []);

  const cards = stats
    ? [
        ['Active Donors', stats.activeDonors],
        ['Non Active Donors', stats.inactiveDonors],
        ['Inbox Messages', stats.inboxMessages],
        ['Need Blood', stats.bloodRequests],
      ]
    : [];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-rose-800">Dashboard</h1>
      <p className="mb-8 text-slate-600">Welcome admin</p>
      {error ? <p className="text-rose-600">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-rose-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
