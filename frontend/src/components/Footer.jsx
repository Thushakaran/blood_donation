import { Link } from 'react-router-dom';
import { DropletFillIcon, MailIcon, MapPinIcon, PhoneIcon } from './Icons';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 text-base font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
                <DropletFillIcon className="h-4 w-4" />
              </span>
              <span className="font-display tracking-tight">Blood Share</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              A clinical blood donor registry and hospital inventory coordination network connecting screened volunteer donors with regional medical centers across Sri Lanka.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Platform</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="text-slate-300 transition-colors hover:text-white">Donate Blood</Link>
              </li>
              <li>
                <Link to="/need-blood" className="text-slate-300 transition-colors hover:text-white">Request Blood</Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-300 transition-colors hover:text-white">Search Donors</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 transition-colors hover:text-white">About Network</Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 transition-colors hover:text-white">Coordinator Sign In</Link>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">Regional Helpline</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>Hospital Road, Jaffna</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-red-400" />
                <span className="font-mono tabular-nums">076 297 1306</span>
              </li>
              <li className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 shrink-0 text-red-400" />
                <span className="break-all">thushakarant@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>Copyright © {CURRENT_YEAR} Blood Share. Online Blood Bank Management System.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="transition-colors hover:text-white">Hospital Support</Link>
            <Link to="/about" className="transition-colors hover:text-white">Safety Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
