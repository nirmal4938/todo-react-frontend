import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { searchTasksApi } from "../api/taskApi";
import TaskRowItem from "./TaskRowItem";

export default function SearchOverlay({
  isOpen,
  onClose,
  openerElement,
  onToggleStatus,
  onEdit,
  onDelete,
  refreshTrigger,
  actionError,
  pendingTaskIds,
  isViewer = false,
  workspaceId,
  reminderLeadTimeMinutes = 15,
  guestMode = false,
  searchTasks = searchTasksApi,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchAttempt, setSearchAttempt] = useState(0);
  const dialogRef = useRef(null);
  const searchInputRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const search = async () => {
        setLoading(true);
        setError("");
        try {
          const data = await searchTasks(query, controller.signal);
          if (active) setResults(data || []);
        } catch (requestError) {
          const wasCanceled =
            requestError?.name === "CanceledError" ||
            requestError?.code === "ERR_CANCELED";
          if (active && !wasCanceled) {
            setError("Search is unavailable right now. Please try again.");
          }
        } finally {
          if (active) setLoading(false);
        }
      };
      search();
    }, 200);

    return () => {
      clearTimeout(timer);
      active = false;
      controller.abort();
    };
  }, [query, isOpen, refreshTrigger, searchAttempt, searchTasks, workspaceId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    openerRef.current = openerElement || document.activeElement;
    searchInputRef.current?.focus();
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

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-search-title"
        ref={dialogRef}
        tabIndex={-1}
        className="flex h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[min(42rem,calc(100vh-2.5rem))] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 pb-3 pt-5 sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2
              id="task-search-title"
              className="text-base font-bold text-slate-900"
            >
              Search tasks
            </h2>
          </div>
          <div className="relative mt-3 flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 focus-within:border-[#3B66F5] focus-within:ring-2 focus-within:ring-[#3B66F5]/15">
            <input
              type="search"
              ref={searchInputRef}
              aria-label="Search for a task"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a task"
              className="w-full pr-7 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2 sm:px-7">
          {actionError && (
            <p
              role="alert"
              className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              {actionError}
            </p>
          )}
          {loading ? (
            <p role="status" className="py-8 text-center text-sm text-slate-400">
              Searching…
            </p>
          ) : error ? (
            <div className="py-8 text-center">
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setSearchAttempt((attempt) => attempt + 1)}
                className="mt-3 text-sm font-semibold text-[#3B66F5] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5]"
              >
                Retry
              </button>
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No tasks match &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((task) => (
                <TaskRowItem
                  key={task._id}
                  task={task}
                  isPending={pendingTaskIds.has(task._id)}
                  isViewer={isViewer}
                  guestMode={guestMode}
                  reminderLeadTimeMinutes={reminderLeadTimeMinutes}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
