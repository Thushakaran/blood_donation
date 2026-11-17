import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DropletFillIcon, MenuIcon, XIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Find Donors' },
  { to: '/need-blood', label: 'Request Blood' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-lg font-bold tracking-tight text-slate-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <DropletFillIcon className="h-4 w-4" />
          </span>
          <span className="font-display">Blood Share</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex lg:gap-6" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `shrink-0 whitespace-nowrap py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to={isAdmin ? '/dashboard' : '/login'}
            className="hidden shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex lg:px-4"
          >
            {isAdmin ? 'Dashboard' : 'Sign In'}
          </Link>
          <Link
            to="/register"
            className="hidden shrink-0 whitespace-nowrap rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:inline-flex lg:px-4"
          >
            Donate Blood
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
          >
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={isAdmin ? '/dashboard' : '/login'}
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {isAdmin ? 'Dashboard' : 'Sign In'}
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Donate Blood
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
