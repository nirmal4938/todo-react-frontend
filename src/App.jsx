import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  createTaskApi,
  deleteTaskApi,
  fetchWeeklySummary,
  updateTaskApi,
  updateTaskStatusApi,
} from "./api/taskApi";
import { getMondayOfWeek, getWeekDays, isSameDay } from "./utils/dateUtils";
import OnboardingScreen from "./components/OnboardingScreen";
import TaskRowItem from "./components/TaskRowItem";
import TaskFormModal from "./components/TaskFormModal";
import SearchOverlay from "./components/SearchOverlay";
import WeekOverview from "./components/WeekOverview";

const PRIORITIES = ["All", "High", "Medium", "Low"];

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("todo_onboarded"),
  );
  const [weeksData, setWeeksData] = useState([]);
  const [currentMonday, setCurrentMonday] = useState(() =>
    getMondayOfWeek(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewAllWeek, setViewAllWeek] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;
    const loadWeeks = async () => {
      try {
        setError("");
        const data = await fetchWeeklySummary();
        if (active) setWeeksData(data || []);
      } catch {
        if (active) setError("Unable to reach the server. Please verify your API URL.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWeeks();
    return () => {
      active = false;
    };
  }, [refreshTick]);

  const triggerRefresh = () => setRefreshTick((prev) => prev + 1);
  const handleCompleteOnboarding = () => {
    localStorage.setItem("todo_onboarded", "true");
    setShowOnboarding(false);
  };
  const weekDays = useMemo(() => getWeekDays(currentMonday), [currentMonday]);
  const activeWeekSummary = useMemo(
    () =>
      weeksData.find((week) =>
        isSameDay(getMondayOfWeek(new Date(week.weekStart)), currentMonday),
      ) || {
        openTasksCount: 0,
        completedTasksCount: 0,
        totalTasksCount: 0,
        tasks: [],
      },
    [weeksData, currentMonday],
  );
  const displayedTasks = useMemo(() => {
    const tasks = viewAllWeek
      ? activeWeekSummary.tasks
      : activeWeekSummary.tasks.filter((task) =>
          isSameDay(task.scheduledAt, selectedDate),
        );
    return selectedPriority === "All"
      ? tasks
      : tasks.filter((task) => task.priority === selectedPriority);
  }, [activeWeekSummary, selectedDate, selectedPriority, viewAllWeek]);
  const progressPercent =
    activeWeekSummary.totalTasksCount > 0
      ? Math.round(
          (activeWeekSummary.completedTasksCount /
            activeWeekSummary.totalTasksCount) *
            100,
        )
      : 0;

  const shiftWeek = (offsetWeeks) => {
    const nextMonday = new Date(currentMonday);
    nextMonday.setDate(currentMonday.getDate() + offsetWeeks * 7);
    setCurrentMonday(nextMonday);
    setSelectedDate(nextMonday);
    setViewAllWeek(false);
  };

  const handleSaveTask = async (payload) => {
    if (editingTask) {
      await updateTaskApi(editingTask._id, payload);
    } else {
      await createTaskApi(payload);
    }

    const taskDate = new Date(payload.scheduledAt);
    setCurrentMonday(getMondayOfWeek(taskDate));
    setSelectedDate(taskDate);
    setViewAllWeek(false);
    setEditingTask(null);
    setActionError("");
    triggerRefresh();
  };

  const handleToggleStatus = async (task) => {
    try {
      const nextStatus =
        task.status === "Completed" ? "In Progress" : "Completed";
      await updateTaskStatusApi(task._id, nextStatus);
      setActionError("");
      triggerRefresh();
    } catch {
      setActionError("Could not update this task. Please try again.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTaskApi(id);
      setActionError("");
      triggerRefresh();
    } catch {
      setActionError("Could not delete this task. Please try again.");
    }
  };

  const openNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  if (showOnboarding) {
    return <OnboardingScreen onGetStarted={handleCompleteOnboarding} />;
  }

  const taskHeading = viewAllWeek
    ? "All Tasks This Week"
    : isSameDay(selectedDate, new Date())
      ? "Tasks Today"
      : `Tasks (${selectedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })})`;

  return (
    <main className="min-h-screen bg-slate-100 px-0 sm:px-4 sm:py-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex min-h-screen w-full flex-col bg-white px-5 pb-24 pt-5 shadow-xl sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:max-w-2xl sm:rounded-3xl sm:px-8 sm:pb-8 lg:my-0 lg:grid lg:h-[calc(100vh-5rem)] lg:min-h-[35rem] lg:max-w-6xl lg:grid-cols-12 lg:gap-10 lg:overflow-hidden lg:px-10 lg:py-10">
        <WeekOverview
          weekDays={weekDays}
          currentMonday={currentMonday}
          selectedDate={selectedDate}
          viewAllWeek={viewAllWeek}
          summary={activeWeekSummary}
          progressPercent={progressPercent}
          onShiftWeek={shiftWeek}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setViewAllWeek(false);
          }}
          onViewWeek={() => setViewAllWeek(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onAddTask={openNewTask}
        />

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
                {taskHeading}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setViewAllWeek((previous) => !previous)}
              className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-[#3B66F5] transition hover:bg-[#EEF3FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5]"
            >
              {viewAllWeek ? "Filter by day" : "View all"}
            </button>
          </div>

          <div
            aria-label="Filter tasks by priority"
            className="mb-4 flex gap-2 overflow-x-auto pb-1"
          >
            {PRIORITIES.map((priority) => (
              <button
                key={priority}
                type="button"
                aria-pressed={selectedPriority === priority}
                onClick={() => setSelectedPriority(priority)}
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
              <p className="py-12 text-center text-sm text-slate-400" role="status">
                Loading tasks…
              </p>
            ) : error ? (
              <div className="mt-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-8 text-center">
                <p className="text-sm text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={triggerRefresh}
                  className="mt-3 text-sm font-semibold text-[#3B66F5] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : displayedTasks.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No tasks {selectedPriority === "All" ? "scheduled" : `with ${selectedPriority.toLowerCase()} priority`} for this{" "}
                  {viewAllWeek ? "week" : "day"}.
                </p>
                <button
                  type="button"
                  onClick={openNewTask}
                  className="mt-3 text-sm font-semibold text-[#3B66F5] hover:underline"
                >
                  Add a task now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedTasks.map((task) => (
                  <TaskRowItem
                    key={task._id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(selectedTask) => {
                      setEditingTask(selectedTask);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <button
          type="button"
          onClick={openNewTask}
          aria-label="Add new task"
          className="fixed bottom-6 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#3B66F5] text-white shadow-lg shadow-blue-500/35 transition hover:bg-[#2F56D9] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B66F5] sm:bottom-10 lg:hidden"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <TaskFormModal
          key={`${isModalOpen ? "open" : "closed"}-${editingTask?._id || "new"}`}
          isOpen={isModalOpen}
          initialTask={editingTask}
          defaultDate={selectedDate}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />

        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onToggleStatus={handleToggleStatus}
          onEdit={(task) => {
            setIsSearchOpen(false);
            setEditingTask(task);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteTask}
          refreshTrigger={refreshTick}
          actionError={actionError}
        />
      </div>
    </main>
  );
}
