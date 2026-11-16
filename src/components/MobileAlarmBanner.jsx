import { useState } from "react";
import { BellRing, Check, Clock3, Volume2, X } from "lucide-react";

export default function MobileAlarmBanner({
  alarm,
  soundNeedsGesture,
  onEnableSound,
  onSnooze,
  onComplete,
  onDismiss,
  canComplete = true,
}) {
  const [completing, setCompleting] = useState(false);
  if (!alarm) return null;

  const dueAt = new Date(alarm.dateTime || alarm.scheduledAt);
  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete();
    } finally {
      setCompleting(false);
    }
  };

  return (
    <section
      role="alertdialog"
      aria-modal="false"
      aria-labelledby="mobile-alarm-title"
      className="fixed inset-x-3 bottom-4 z-[90] mx-auto max-w-lg rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:w-[min(32rem,calc(100vw-2rem))]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <BellRing className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Upcoming task alarm
              </p>
              <h2
                id="mobile-alarm-title"
                className="mt-1 break-words text-base font-bold text-slate-900"
              >
                {alarm.title}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                Due at{" "}
                {dueAt.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss task alarm"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {soundNeedsGesture && (
            <button
              type="button"
              onClick={onEnableSound}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#3B66F5]"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Tap to enable alarm sound
            </button>
          )}
          <div
            className={`mt-3 grid gap-2 ${
              canComplete ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            <button
              type="button"
              onClick={onSnooze}
              className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Snooze 5m
            </button>
            {canComplete && (
              <button
                type="button"
                onClick={() => void handleComplete()}
                disabled={completing}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                {completing ? "Saving" : "Mark Completed"}
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg bg-amber-100 px-2 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
