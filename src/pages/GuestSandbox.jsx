import { GuestSandboxProvider } from "../context/GuestSandboxContext";
import { useGuestSandbox } from "../context/useGuestSandbox";
import useCalendarNavigation from "../hooks/useCalendarNavigation";
import useTaskBoard from "../hooks/useTaskBoard";
import useTaskDialogs from "../hooks/useTaskDialogs";
import PlannerPage from "../components/PlannerPage";

const EMPTY_NOTIFICATION_SETTINGS = {
  phoneNumber: "",
  notificationPreferences: {
    email: false,
    whatsapp: false,
    mobileAlarm: false,
    leadTimeMinutes: 15,
  },
};

function GuestPlanner({ onNavigate }) {
  const guest = useGuestSandbox();
  const calendar = useCalendarNavigation();
  const board = useTaskBoard({
    weeksData: guest.weeksData,
    currentMonday: calendar.currentMonday,
    selectedDate: calendar.selectedDate,
    today: calendar.today,
    viewAllWeek: calendar.viewAllWeek,
  });
  const dialogs = useTaskDialogs();
  const tasks = {
    weeksData: guest.weeksData,
    loading: false,
    error: "",
    actionError: "",
    pendingTaskIds: new Set(),
    toast: guest.toast,
    showColdStartMessage: false,
    refreshTrigger: 0,
    retryLoadWeeks: () => {},
    saveTask: guest.saveTask,
    toggleTaskStatus: guest.toggleTaskStatus,
    deleteTask: guest.deleteTask,
    refresh: () => {},
  };
  const workspace = {
    activeWorkspace: { name: "Guest Sandbox" },
    activeWorkspaceId: "guest-sandbox",
    role: "GUEST",
    isViewer: false,
    error: "",
  };

  const handleSaveTask = async (payload) => {
    const previousView = {
      currentMonday: calendar.currentMonday,
      selectedDate: calendar.selectedDate,
      viewAllWeek: calendar.viewAllWeek,
      selectedStatus: board.selectedStatus,
    };
    calendar.navigateToTaskDate(new Date(payload.dateTime));
    board.clearStatusFilter();
    try {
      await guest.saveTask(payload, dialogs.editingTask);
      dialogs.closeTaskModal();
    } catch (error) {
      calendar.restoreNavigation(previousView);
      board.restoreStatusFilter(previousView.selectedStatus);
      throw error;
    }
  };

  return (
    <PlannerPage
      tasks={tasks}
      calendar={calendar}
      board={board}
      dialogs={dialogs}
      user={null}
      workspace={workspace}
      notificationSettings={EMPTY_NOTIFICATION_SETTINGS}
      onSaveNotificationSettings={async () => EMPTY_NOTIFICATION_SETTINGS}
      upcomingAlarm={{}}
      canCompleteAlarm
      onSaveTask={handleSaveTask}
      guestMode
      onNavigate={onNavigate}
      onResetDemo={guest.resetTasks}
      searchTasks={guest.searchTasks}
    />
  );
}

export default function GuestSandbox({ onNavigate }) {
  return (
    <GuestSandboxProvider>
      <GuestPlanner onNavigate={onNavigate} />
    </GuestSandboxProvider>
  );
}
