import { Plus } from "lucide-react";
import TaskDialogLayer from "./TaskDialogLayer";
import TaskToast from "./TaskToast";
import TaskWorkspace from "./TaskWorkspace";
import WeekOverview from "./WeekOverview";
import WorkspaceHeader from "./WorkspaceHeader";
import MobileAlarmBanner from "./MobileAlarmBanner";

export default function PlannerPage({
  tasks,
  calendar,
  board,
  dialogs,
  user,
  workspace,
  onLogout,
  notificationSettings,
  onSaveNotificationSettings,
  upcomingAlarm,
  canCompleteAlarm,
  onSaveTask,
  guestMode = false,
  onNavigate,
  onResetDemo,
  searchTasks,
  guestImport,
}) {
  const isViewer = workspace.isViewer;
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
    isViewer,
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
      isViewer,
      guestMode,
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
    isViewer,
    workspaceId: workspace.activeWorkspaceId,
    guestMode,
    searchTasks,
    notificationPreferences: notificationSettings.notificationPreferences,
    notificationPhoneNumber: notificationSettings.phoneNumber,
    reminderLeadTimeMinutes:
      notificationSettings.notificationPreferences.leadTimeMinutes,
  };

  return (
    <>
      {guestMode && (
        <div className="sticky top-0 z-40 border-b border-blue-200 bg-[#EEF3FF] px-4 py-3 shadow-sm sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-slate-700 sm:text-sm">
              <span aria-hidden="true">👋 </span>
              You&apos;re exploring Guest Sandbox Mode (saved locally).{" "}
              <button
                type="button"
                onClick={() => onNavigate("/register")}
                className="font-bold text-[#3B66F5] underline underline-offset-2"
              >
                Create a free account
              </button>{" "}
              to unlock Cloud Sync, Team RBAC &amp; WhatsApp/Phone Alarms.
            </p>
            <button
              type="button"
              onClick={onResetDemo}
              className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-[#3B66F5]/50 hover:text-[#3B66F5]"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-slate-100 px-0 sm:px-4 sm:py-6 lg:px-8 lg:py-10">
        <TaskToast
          toast={
            upcomingAlarm.error
              ? { message: upcomingAlarm.error, type: "error" }
              : tasks.toast
          }
        />
        <div className="mx-auto flex min-h-screen w-full flex-col bg-white px-5 pb-24 pt-5 shadow-xl sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:max-w-2xl sm:rounded-3xl sm:px-8 sm:pb-8 lg:my-0 lg:grid lg:h-[calc(100vh-5rem)] lg:min-h-[35rem] lg:max-w-6xl lg:grid-cols-12 lg:gap-10 lg:overflow-hidden lg:px-10 lg:py-10">
          {guestMode ? (
            <header className="mb-5 flex items-center justify-between gap-3 lg:col-span-12 lg:mb-1">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Interactive preview
                </p>
                <p className="text-sm font-bold text-slate-800">
                  Your local demo workspace
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("/")}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Back to home
              </button>
            </header>
          ) : (
            <WorkspaceHeader
              workspace={workspace}
              user={user}
              onLogout={onLogout}
              notificationSettings={notificationSettings}
              onSaveNotificationSettings={onSaveNotificationSettings}
            />
          )}
          {guestImport?.count > 0 && (
            <section className="mb-4 rounded-xl border border-blue-100 bg-[#EEF3FF] px-4 py-3 lg:col-span-12">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Bring your demo tasks to your new workspace?
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {guestImport.count} locally saved task
                    {guestImport.count === 1 ? "" : "s"} ready to sync.
                  </p>
                  {guestImport.error && (
                    <p role="alert" className="mt-2 text-xs text-rose-700">
                      {guestImport.error}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={guestImport.onDismiss}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white"
                  >
                    Not now
                  </button>
                  <button
                    type="button"
                    onClick={() => void guestImport.onImport()}
                    disabled={guestImport.importing}
                    className="rounded-lg bg-[#3B66F5] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {guestImport.importing
                      ? "Importing..."
                      : `Import ${guestImport.count} Demo Task${guestImport.count === 1 ? "" : "s"}`}
                  </button>
                </div>
              </div>
            </section>
          )}
          {workspace.error && (
            <div
              role="alert"
              className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700 lg:col-span-12"
            >
              <span>{workspace.error}</span>
              <button
                type="button"
                onClick={() => void workspace.refreshWorkspaces()}
                className="shrink-0 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
          {isViewer && (
            <div className="mb-4 rounded-xl border border-blue-100 bg-[#EEF3FF] px-4 py-3 text-xs font-medium text-[#3B66F5] lg:col-span-12">
              Read-only Viewer access — you can view tasks but can’t change them.
            </div>
          )}
          <WeekOverview {...weekOverviewProps} />
          <TaskWorkspace {...taskWorkspaceProps} />

          {!isViewer && (
            <button
              type="button"
              onClick={openNewTask}
              aria-label="Add new task"
              className="fixed bottom-6 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#3B66F5] text-white shadow-lg shadow-blue-500/35 transition hover:bg-[#2F56D9] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B66F5] sm:bottom-10 lg:hidden"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
          )}

          <TaskDialogLayer {...taskDialogProps} />
        </div>
        {!guestMode && (
          <MobileAlarmBanner {...upcomingAlarm} canComplete={canCompleteAlarm} />
        )}
      </main>
    </>
  );
}
