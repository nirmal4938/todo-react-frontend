import { useEffect, useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { toDateInputValue, toTimeInputValue } from "../utils/dateUtils";

const PRIORITIES = ["Low", "Medium", "High"];

export default function TaskFormModal({
  isOpen,
  initialTask,
  defaultDate,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState(() => initialTask?.title || "");
  const [startTime, setStartTime] = useState(() =>
    initialTask
      ? toTimeInputValue(initialTask.scheduledAt)
      : "09:00",
  );
  const [endTime, setEndTime] = useState("10:00");
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

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!dateStr || !startTime) {
      setError("Date and start time are required");
      return;
    }

    setSubmitting(true);
    setError("");
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
              required
              placeholder="Doing Homework"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#3B66F5] focus:outline-none focus:ring-2 focus:ring-[#3B66F5]/15"
            />
          </div>

          {/* Set Time (Start / Ends) */}
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-400">
              Set time
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative flex items-center rounded-xl border border-slate-200 px-3 py-2">
                <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="time"
                  aria-label="Start time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="relative flex items-center rounded-xl border border-slate-200 px-3 py-2">
                <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="time"
                  aria-label="End time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs text-slate-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Set Date */}
          <div>
            <label htmlFor="task-date" className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Set date
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 px-3.5 py-2.5">
              <input
                type="date"
                id="task-date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full text-xs text-slate-700 focus:outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-400 ml-2 pointer-events-none shrink-0" />
            </div>
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
              placeholder="Add Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B66F5]"
            />
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
