import { CheckCircleIcon, CloseIcon, InfoIcon } from './icons.jsx';

// The live region is always mounted so screen readers announce new messages.
export default function Toast({ toast, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-20 md:bottom-6 z-[60] flex justify-center px-4 pointer-events-none"
    >
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 max-w-md w-full bg-white border border-[#4b583f]/30 shadow-lg rounded-xl px-4 py-3 text-sm text-stone-800"
        >
          {toast.tone === 'info' ? (
            <InfoIcon className="w-5 h-5 shrink-0 text-stone-500" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 shrink-0 text-[#4b583f]" />
          )}
          <p className="flex-1 leading-snug">{toast.message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="shrink-0 -m-1 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
