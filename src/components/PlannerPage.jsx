import { Plus } from "lucide-react";
import TaskDialogLayer from "./TaskDialogLayer";
import TaskToast from "./TaskToast";
import TaskWorkspace from "./TaskWorkspace";
import WeekOverview from "./WeekOverview";

export default function PlannerPage({
  tasks,
  calendar,
  board,
  dialogs,
  onSaveTask,
}) {
  const openNewTask = () => dialogs.openNewTask(document.activeElement);
  const weekOverviewProps = {
    weekDays: calendar.weekDays,
    currentMonday: calendar.currentMonday,
    selectedDate: calendar.selectedDate,
    showToday: calendar.showToday,
    onToday: () => {
      calendar.jumpToToday();
      board.clearStatusFilter();
    },
    viewAllWeek: calendar.viewAllWeek,
    summary: board.activeWeekSummary,
    progressPercent: board.progressPercent,
    loading: tasks.loading,
    selectedStatus: board.selectedStatus,
    onShiftWeek: calendar.shiftWeek,
    onSelectDate: calendar.selectDate,
    onFilterStatus: (status) => {
      calendar.setViewAllWeek(true);
      board.toggleStatusFilter(status);
    },
    onOpenSearch: () => dialogs.openSearch(document.activeElement),
    onAddTask: openNewTask,
  };
  const taskWorkspaceProps = {
    heading: board.taskHeading,
    viewAllWeek: calendar.viewAllWeek,
    onToggleWeekView: () =>
      calendar.setViewAllWeek((previous) => !previous),
    priorities: board.priorities,
    selectedPriority: board.selectedPriority,
    onSelectPriority: board.setSelectedPriority,
    selectedStatus: board.selectedStatus,
    onClearStatus: () => {
      board.clearStatusFilter();
      calendar.setViewAllWeek(false);
    },
    taskListProps: {
      tasks: board.displayedTasks,
      loading: tasks.loading,
      error: tasks.error,
      actionError: tasks.actionError,
      showColdStartMessage: tasks.showColdStartMessage,
      selectedStatus: board.selectedStatus,
      selectedPriority: board.selectedPriority,
      viewAllWeek: calendar.viewAllWeek,
      pendingTaskIds: tasks.pendingTaskIds,
      onRetry: tasks.retryLoadWeeks,
      onAddTask: openNewTask,
      onToggleStatus: tasks.toggleTaskStatus,
      onEditTask: dialogs.openEditTask,
      onDeleteTask: tasks.deleteTask,
    },
  };
  const taskDialogProps = {
    dialogs,
    selectedDate: calendar.selectedDate,
    onSaveTask,
    onToggleStatus: tasks.toggleTaskStatus,
    onDeleteTask: tasks.deleteTask,
    pendingTaskIds: tasks.pendingTaskIds,
    refreshTrigger: tasks.refreshTrigger,
    actionError: tasks.actionError,
  };

  return (
    <main className="min-h-screen bg-slate-100 px-0 sm:px-4 sm:py-6 lg:px-8 lg:py-10">
      <TaskToast toast={tasks.toast} />
      <div className="mx-auto flex min-h-screen w-full flex-col bg-white px-5 pb-24 pt-5 shadow-xl sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:max-w-2xl sm:rounded-3xl sm:px-8 sm:pb-8 lg:my-0 lg:grid lg:h-[calc(100vh-5rem)] lg:min-h-[35rem] lg:max-w-6xl lg:grid-cols-12 lg:gap-10 lg:overflow-hidden lg:px-10 lg:py-10">
        <WeekOverview {...weekOverviewProps} />
        <TaskWorkspace {...taskWorkspaceProps} />

        <button
          type="button"
          onClick={openNewTask}
          aria-label="Add new task"
          className="fixed bottom-6 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#3B66F5] text-white shadow-lg shadow-blue-500/35 transition hover:bg-[#2F56D9] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B66F5] sm:bottom-10 lg:hidden"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <TaskDialogLayer {...taskDialogProps} />
      </div>
    </main>
  );
}
