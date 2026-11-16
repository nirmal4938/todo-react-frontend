import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  XSquare,
} from "lucide-react";
import { isSameDay } from "../utils/dateUtils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekOverview({
  weekDays,
  currentMonday,
  selectedDate,
  showToday,
  viewAllWeek,
  summary,
  progressPercent,
  loading,
  selectedStatus,
  onShiftWeek,
  onToday,
  onSelectDate,
  onFilterStatus,
  onOpenSearch,
  onAddTask,
  isViewer = false,
}) {
  return (
    <aside className="lg:sticky lg:top-10 lg:col-span-5 lg:self-start">
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search tasks"
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 py-3 text-left text-sm text-slate-400 transition hover:border-[#3B66F5]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5]"
      >
        <span>Search for a task</span>
        <Search className="h-4 w-4 text-slate-600" />
      </button>

      <div className="mb-2 mt-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">
          {currentMonday.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex items-center gap-1">
          {showToday && (
            <button
              type="button"
              onClick={onToday}
              className="rounded-full bg-[#EEF3FF] px-3 py-1.5 text-xs font-semibold text-[#3B66F5] transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5]"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => onShiftWeek(-1)}
            aria-label="Previous week"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onShiftWeek(1)}
            aria-label="Next week"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        aria-label="Select a day"
        className="grid grid-cols-7 gap-1 text-center"
      >
        {weekDays.map((dayDate, index) => {
          const isSelected = !viewAllWeek && isSameDay(dayDate, selectedDate);
          const hasTasks = summary.tasks.some((task) =>
            isSameDay(task.scheduledAt, dayDate),
          );
          return (
            <button
              key={dayDate.toISOString()}
              type="button"
              aria-pressed={isSelected}
              aria-label={dayDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              onClick={() => onSelectDate(dayDate)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5] ${
                isSelected
                  ? "bg-[#3B66F5] text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  isSelected ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {DAY_LABELS[index]}
              </span>
              <span className="text-xs font-bold">{dayDate.getDate()}</span>
              <span
                className={`h-1 w-1 rounded-full ${
                  hasTasks
                    ? isSelected
                      ? "bg-white"
                      : "bg-[#3B66F5]"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {loading ? (
        <div
          aria-hidden="true"
          className="mt-5 grid grid-cols-2 gap-3"
        >
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-[6.25rem] animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onFilterStatus("Completed")}
          aria-pressed={selectedStatus === "Completed"}
          className={`rounded-2xl bg-[#EEF3FF] p-3.5 text-left transition hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5] sm:p-4 ${
            selectedStatus === "Completed" ? "ring-2 ring-[#3B66F5] ring-offset-2" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3B66F5] text-white">
              <CheckSquare className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Task Complete
            </span>
          </span>
          <span className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {String(summary.completedTasksCount).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-slate-500">This Week</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onFilterStatus("In Progress")}
          aria-pressed={selectedStatus === "In Progress"}
          className={`rounded-2xl bg-[#FFF0F0] p-3.5 text-left transition hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F45B69] sm:p-4 ${
            selectedStatus === "In Progress" ? "ring-2 ring-[#F45B69] ring-offset-2" : ""
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F45B69] text-white">
              <XSquare className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Task Pending
            </span>
          </span>
          <span className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {String(summary.openTasksCount).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-slate-500">This Week</span>
          </span>
        </button>
      </div>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Weekly Progress</h3>
          {loading ? (
            <span className="h-3 w-8 animate-pulse rounded bg-slate-100" />
          ) : (
            <span className="text-xs font-semibold text-[#3B66F5]">
              {progressPercent}%
            </span>
          )}
        </div>
        {loading ? (
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        ) : (
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[#E8EEFF]"
            role="progressbar"
            aria-label="Weekly task completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <div
              className="h-full rounded-full bg-[#3B66F5] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {!isViewer && (
        <button
          type="button"
          onClick={onAddTask}
          className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-[#3B66F5] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-[#2F56D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5] lg:flex"
        >
          <Plus className="h-4 w-4" />
          Add New Task
        </button>
      )}
    </aside>
  );
}
