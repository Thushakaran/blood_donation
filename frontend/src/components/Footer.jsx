import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8">
        <nav className="flex gap-6 text-sm">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/contact" className="hover:text-white">Contact Us</Link>
        </nav>
        <p className="text-xs text-slate-400">
          Copyright © {new Date().getFullYear()}, Blood Share — Online Blood Bank Management System
        </p>
      </div>
    </footer>
  );
}
