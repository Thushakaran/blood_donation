import { Link } from 'react-router-dom';
import { DropletFillIcon, MailIcon, MapPinIcon, PhoneIcon } from './Icons';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 text-base font-bold text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white">
                <DropletFillIcon className="h-4 w-4" />
              </span>
              <span className="font-display">Blood Share</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              A clinical blood donor registry and hospital inventory coordination network connecting screened volunteer donors with 10 regional medical centers across Sri Lanka.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Platform</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="transition-colors hover:text-red-600">Donate Blood</Link>
              </li>
              <li>
                <Link to="/need-blood" className="transition-colors hover:text-red-600">Request Blood</Link>
              </li>
              <li>
                <Link to="/search" className="transition-colors hover:text-red-600">Search Donors</Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-red-600">About Network</Link>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-red-600">Coordinator Sign In</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Regional Helpline</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>Hospital Road, Jaffna</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-red-600" />
                <span className="tabular-nums">076 297 1306</span>
              </li>
              <li className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 shrink-0 text-red-600" />
                <span>thushakarant@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>Copyright © {CURRENT_YEAR} Blood Share. Online Blood Bank Management System.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-900">Hospital Support</Link>
            <Link to="/about" className="hover:text-slate-900">Safety Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
