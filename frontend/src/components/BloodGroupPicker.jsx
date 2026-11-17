import { BLOOD_GROUPS } from '../constants';

const GROUP_HINTS = {
  'O-': 'Universal donor',
  'AB+': 'Universal recipient',
};

export default function BloodGroupPicker({ value, onChange, label = 'Blood Group', required = false }) {
  return (
    <div>
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {required ? <span className="text-red-600" aria-hidden="true">*</span> : null}
      </span>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-4 gap-2"
      >
        {BLOOD_GROUPS.map((group) => {
          const active = value === group;
          const hint = GROUP_HINTS[group];
          return (
            <button
              key={group}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(group)}
              title={hint ? `${group} (${hint})` : group}
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-2 py-2 font-mono text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${
                active
                  ? 'border-red-600 bg-red-600 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-red-300 hover:bg-red-50/60 hover:text-red-700'
              }`}
            >
              <span>{group}</span>
            </button>
          );
        })}
      </div>
      {GROUP_HINTS[value] ? (
        <p className="mt-1.5 text-xs text-slate-500">
          Selected: <span className="font-mono font-semibold text-red-700">{value}</span> · {GROUP_HINTS[value]}
        </p>
      ) : null}
    </div>
  );
}
