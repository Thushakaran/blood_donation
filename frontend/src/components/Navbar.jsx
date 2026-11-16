import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/admin', label: 'Admin' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-rose-800 text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-wide">
          Blood Share
        </Link>
        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          <span className="mb-1 block h-0.5 w-6 bg-white" />
          <span className="mb-1 block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-2 bg-rose-800 px-4 py-3 md:static md:flex md:flex-row md:gap-6 md:p-0`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-2 py-1 text-sm font-medium ${isActive ? 'bg-white/15' : 'hover:bg-white/10'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
