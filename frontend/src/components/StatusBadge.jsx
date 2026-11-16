import { AlertTriangleIcon, CheckCircleIcon } from './Icons';

const VARIANTS = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
};

export default function StatusBadge({ variant = 'neutral', label, showIcon = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${VARIANTS[variant] || VARIANTS.neutral}`}
    >
      {showIcon && variant === 'success' ? <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" /> : null}
      {showIcon && (variant === 'warning' || variant === 'danger') ? (
        <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0" />
      ) : null}
      <span>{label}</span>
    </span>
  );
}
