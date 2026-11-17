import { AlertTriangleIcon, XIcon } from './Icons';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmStyle =
    tone === 'success'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
      : 'bg-red-600 hover:bg-red-700 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tone === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}
            >
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
                {title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto sm:py-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 sm:w-auto sm:py-2 ${confirmStyle}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
