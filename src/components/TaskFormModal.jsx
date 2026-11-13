import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { toDateInputValue, toTimeInputValue } from "../utils/dateUtils";

const PRIORITIES = ["Low", "Medium", "High"];

export default function TaskFormModal({
  isOpen,
  initialTask,
  defaultDate,
  openerElement,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState(() => initialTask?.title || "");
  const [startTime, setStartTime] = useState(() =>
    initialTask
      ? toTimeInputValue(initialTask.scheduledAt)
      : "09:00",
  );
  const [dateStr, setDateStr] = useState(() =>
    initialTask
      ? toDateInputValue(initialTask.scheduledAt)
      : toDateInputValue(defaultDate || new Date()),
  );
  const [priority, setPriority] = useState(
    () => initialTask?.priority || "Medium",
  );
  const [description, setDescription] = useState(
    () => initialTask?.description || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    openerRef.current = openerElement || document.activeElement;
    titleInputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (openerRef.current?.isConnected) openerRef.current.focus();
    };
  }, [isOpen, onClose, openerElement]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextFieldErrors = {};
    if (!title.trim()) nextFieldErrors.title = "Task title is required.";
    if (!dateStr) nextFieldErrors.date = "Choose a task date.";
    if (!startTime) nextFieldErrors.time = "Choose a start time.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        scheduledAt: new Date(`${dateStr}T${startTime}:00`).toISOString(),
        priority,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl sm:rounded-2xl sm:px-8"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="task-form-title" className="text-base font-bold text-slate-900">
            {initialTask ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task form"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Task Title */}
          <div>
            <label htmlFor="task-title" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Task title
            </label>
            <input
              type="text"
              id="task-title"
              ref={titleInputRef}
              maxLength={150}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={
                fieldErrors.title
                  ? "task-title-error task-title-count"
                  : "task-title-count"
              }
              placeholder="Doing Homework"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((previous) => ({ ...previous, title: "" }));
              }}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B66F5]/15 ${
                fieldErrors.title
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-[#3B66F5]"
              }`}
            />
            {fieldErrors.title && (
              <p id="task-title-error" className="mt-1 text-[11px] text-rose-600">
                {fieldErrors.title}
              </p>
            )}
            <p
              id="task-title-count"
              aria-live="polite"
              className="mt-1 text-right text-[10px] text-slate-400"
            >
              {title.length} / 150
            </p>
          </div>

          {/* Set Time */}
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-400">
              Set time
            </span>
            <div
              className={`relative flex items-center rounded-xl border px-3 py-2 ${
                fieldErrors.time ? "border-rose-400" : "border-slate-200"
              }`}
            >
              <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="time"
                aria-label="Start time"
                aria-invalid={Boolean(fieldErrors.time)}
                aria-describedby={fieldErrors.time ? "task-time-error" : undefined}
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setFieldErrors((previous) => ({ ...previous, time: "" }));
                }}
                className="w-full text-xs text-slate-700 focus:outline-none"
              />
            </div>
            {fieldErrors.time && (
              <p id="task-time-error" className="mt-1 text-[11px] text-rose-600">
                {fieldErrors.time}
              </p>
            )}
          </div>

          {/* Set Date */}
          <div>
            <label htmlFor="task-date" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Set date
            </label>
            <div
              className={`relative flex items-center rounded-xl border px-3.5 py-2.5 ${
                fieldErrors.date ? "border-rose-400" : "border-slate-200"
              }`}
            >
              <input
                type="date"
                id="task-date"
                aria-invalid={Boolean(fieldErrors.date)}
                aria-describedby={fieldErrors.date ? "task-date-error" : undefined}
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  setFieldErrors((previous) => ({ ...previous, date: "" }));
                }}
                className="w-full text-xs text-slate-700 focus:outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-400 ml-2 pointer-events-none shrink-0" />
            </div>
            {fieldErrors.date && (
              <p id="task-date-error" className="mt-1 text-[11px] text-rose-600">
                {fieldErrors.date}
              </p>
            )}
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  aria-pressed={priority === p}
                  aria-label={`Set ${p} priority`}
                  className={`py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    priority === p
                      ? "bg-[#EEF3FF] border-[#3B66F5] text-[#3B66F5]"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              id="task-description"
              maxLength={1000}
              placeholder="Add Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B66F5]"
            />
            <p
              aria-live="polite"
              className="mt-1 text-right text-[10px] text-slate-400"
            >
              {description.length} / 1000
            </p>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-[#3B66F5] py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-[#2F56D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5] disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : initialTask
                ? "Save changes"
                : "Create task"}
          </button>
        </form>
      </div>
    </div>
  );
}
