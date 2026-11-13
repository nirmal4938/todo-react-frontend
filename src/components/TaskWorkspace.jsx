import TaskListPanel from "./TaskListPanel";

export default function TaskWorkspace({
  heading,
  viewAllWeek,
  onToggleWeekView,
  priorities,
  selectedPriority,
  onSelectPriority,
  selectedStatus,
  onClearStatus,
  taskListProps,
}) {
  return (
    <section
      aria-labelledby="task-board-heading"
      className="mt-7 flex min-h-0 flex-1 flex-col lg:col-span-7 lg:mt-0 lg:border-l lg:border-slate-100 lg:pl-10"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Your schedule
          </p>
          <h1
            id="task-board-heading"
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            {heading}
          </h1>
        </div>
        <button
          type="button"
          onClick={onToggleWeekView}
          className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-[#3B66F5] transition hover:bg-[#EEF3FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5]"
        >
          {viewAllWeek ? "Filter by day" : "View all"}
        </button>
      </div>

      <div
        aria-label="Filter tasks by priority"
        className="mb-4 flex gap-2 overflow-x-auto pb-1"
      >
        {priorities.map((priority) => (
          <button
            key={priority}
            type="button"
            aria-pressed={selectedPriority === priority}
            onClick={() => onSelectPriority(priority)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5] ${
              selectedPriority === priority
                ? "border-[#3B66F5] bg-[#3B66F5] text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-[#3B66F5]/40 hover:text-[#3B66F5]"
            }`}
          >
            {priority}
          </button>
        ))}
      </div>

      {selectedStatus !== "All" && (
        <button
          type="button"
          onClick={onClearStatus}
          className="mb-3 self-start rounded-lg px-2 py-1 text-xs font-semibold text-[#3B66F5] hover:bg-[#EEF3FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5]"
        >
          Clear status filter · Back to day
        </button>
      )}

      <TaskListPanel {...taskListProps} />
    </section>
  );
}
