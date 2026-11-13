import TaskRowItem from "./TaskRowItem";

export default function TaskListPanel({
  tasks,
  loading,
  error,
  actionError,
  showColdStartMessage,
  selectedStatus,
  selectedPriority,
  viewAllWeek,
  pendingTaskIds,
  onRetry,
  onAddTask,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <>
      {actionError && (
        <p
          role="alert"
          className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {actionError}
        </p>
      )}

      <div className="min-h-48 flex-1 overflow-y-auto lg:pr-1">
        {loading ? (
          <div role="status" aria-label="Loading tasks" className="space-y-4">
            <span className="sr-only">Loading tasks…</span>
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border-b border-slate-100 bg-slate-50 px-3 py-3"
              >
                <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-2/5 animate-pulse rounded bg-slate-200" />
                  <div className="h-2.5 w-3/5 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-5 w-10 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
            {showColdStartMessage && (
              <p className="py-2 text-center text-sm text-slate-500">
                Waking up server, this may take up to 30 seconds...
              </p>
            )}
          </div>
        ) : error ? (
          <div className="mt-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-8 text-center">
            <p className="text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-semibold text-[#3B66F5] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">
              No{" "}
              {selectedStatus === "All"
                ? "tasks"
                : `${selectedStatus.toLowerCase()} tasks`}
              {selectedPriority === "All"
                ? ""
                : ` with ${selectedPriority.toLowerCase()} priority`}{" "}
              scheduled for this {viewAllWeek ? "week" : "day"}.
            </p>
            <button
              type="button"
              onClick={onAddTask}
              className="mt-3 text-sm font-semibold text-[#3B66F5] hover:underline"
            >
              Add a task now
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRowItem
                key={task._id}
                task={task}
                isPending={pendingTaskIds.has(task._id)}
                onToggleStatus={onToggleStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
