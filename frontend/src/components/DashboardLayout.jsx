import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/inbox', label: 'Inbox' },
  { to: '/dashboard/active-donors', label: 'Active Donors' },
  { to: '/dashboard/inactive-donors', label: 'Not Active Donors' },
  { to: '/dashboard/requests', label: 'Need Blood' },
  { to: '/dashboard/stock', label: 'Blood Stock' },
];

export default function DashboardLayout() {
  const { isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-rose-800 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="font-semibold">Dashboard</Link>
          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle dashboard menu">
            Menu
          </button>
          <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-12 z-30 flex-col gap-2 bg-rose-800 px-4 py-3 md:static md:flex md:flex-row md:flex-wrap md:gap-4 md:p-0`}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded px-2 py-1 text-sm ${isActive ? 'bg-white/15' : 'hover:bg-white/10'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="rounded px-2 py-1 text-left text-sm hover:bg-white/10 md:text-center"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}
