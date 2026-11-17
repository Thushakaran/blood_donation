import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField, { inputClass } from '../components/FormField';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DropletFillIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldCheckIcon,
} from '../components/Icons';

const PORTAL_CAPABILITIES = [
  'Review & activate incoming volunteer donor registrations',
  'Manage hospital blood unit reserves and stock adjustments',
  'Coordinate urgent patient requests and donor matching',
  'Role-scoped access for Super Admins and hospital coordinators',
];

export default function AdminLogin() {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Enter both your staff username and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid staff credentials. Please check and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-12">
        {/* Left Clinical Access Context */}
        <div className="flex flex-col justify-between border-b border-slate-200 bg-slate-50/80 p-7 sm:p-9 lg:col-span-5 lg:border-b-0 lg:border-r">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Authorized Hospital Access</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              Hospital Coordinator Portal
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Sign in with your assigned blood bank coordinator credentials to manage regional inventory and donor verification.
            </p>

            <ul className="mt-6 space-y-3">
              {PORTAL_CAPABILITIES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-900">
              Are you a blood donor or patient?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              No coordinator account is required to donate or request blood.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
              <Link
                to="/register"
                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <span>Register as Donor</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/need-blood"
                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"
              >
                <span>Request Blood</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sign-In Form */}
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <DropletFillIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Coordinator Sign In</h2>
              <p className="text-xs text-slate-500">Encrypted JWT session · Role-based access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <FormField label="Staff Username" required>
              <input
                className={inputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your staff username"
                autoComplete="username"
                autoFocus
              />
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <input
                  className={`${inputClass} pr-11`}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              <LockIcon className="h-4 w-4" />
              <span>{submitting ? 'Verifying credentials...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <p className="mt-6 border-t border-slate-100 pt-5 text-xs leading-relaxed text-slate-500">
            Forgot your password or need hospital staff access? Contact your regional{' '}
            <span className="font-medium text-slate-700">Super Administrator</span> or reach the coordination desk via the{' '}
            <Link to="/contact" className="font-semibold text-red-600 hover:underline">
              Contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
