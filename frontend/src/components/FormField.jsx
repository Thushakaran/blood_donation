export default function FormField({ label, error, hint, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {required ? <span className="text-red-600" aria-hidden="true">*</span> : null}
      </span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15';
