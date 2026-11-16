import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import PlannerPage from "./components/PlannerPage";
import useTasks from "./hooks/useTasks";
import useCalendarNavigation from "./hooks/useCalendarNavigation";
import useTaskBoard from "./hooks/useTaskBoard";
import useTaskDialogs from "./hooks/useTaskDialogs";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/useAuth";
import { WorkspaceProvider } from "./context/WorkspaceContext.jsx";
import { useWorkspace } from "./context/useWorkspace";
import useUpcomingAlarms from "./hooks/useUpcomingAlarms";
import LandingPage from "./pages/LandingPage";
import GuestSandbox from "./pages/GuestSandbox";
import { createTaskApi } from "./api/taskApi";
import {
  GUEST_TASKS_IMPORTED_KEY,
  GUEST_TASKS_STORAGE_KEY,
} from "./context/guestSandboxStorage";

const isAuthPath = (path) => path === "/login" || path === "/register";
const isProtectedPath = (path) =>
  path === "/app" || path === "/dashboard" || path.startsWith("/app/");
const getPathname = () => window.location.pathname;
const subscribeToPathname = (listener) => {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
};

function ProtectedRoute({ session, children }) {
  return session ? children : null;
}

export default function App() {
  return (
    <AuthProvider>
      <ApplicationRouter />
    </AuthProvider>
  );
}

function ApplicationRouter() {
  const { session, loading } = useAuth();
  const pathname = useSyncExternalStore(
    subscribeToPathname,
    getPathname,
    getPathname,
  );

  const navigate = useCallback((path, replace = false) => {
    if (replace) window.history.replaceState({}, "", path);
    else window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (session && isAuthPath(pathname)) navigate("/app", true);
    if (!session && isProtectedPath(pathname)) navigate("/login", true);
    if (
      pathname !== "/" &&
      pathname !== "/demo" &&
      !isAuthPath(pathname) &&
      !isProtectedPath(pathname)
    ) {
      navigate(session ? "/app" : "/", true);
    }
  }, [loading, navigate, pathname, session]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Restoring your session...
      </main>
    );
  }

  if (pathname === "/") {
    return (
      <LandingPage
        isAuthenticated={Boolean(session)}
        onNavigate={navigate}
      />
    );
  }

  if (pathname === "/demo") {
    return <GuestSandbox onNavigate={navigate} />;
  }

  if (isAuthPath(pathname)) {
    if (session) return null;
    return (
      <AuthScreen
        mode={pathname === "/register" ? "register" : "login"}
        onNavigate={navigate}
      />
    );
  }

  if (!session) return null;

  return (
    <ProtectedRoute session={session}>
      <WorkspaceProvider
        user={session.user}
        accessToken={session.accessToken}
      >
        <WorkspaceGate onNavigate={navigate} />
      </WorkspaceProvider>
    </ProtectedRoute>
  );
}

function WorkspaceGate({ onNavigate }) {
  const workspace = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  if (workspace.loading && !workspace.activeWorkspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading your workspaces...
      </main>
    );
  }

  if (!workspace.activeWorkspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <p role="alert" className="text-sm text-rose-700">
            {workspace.error || "No workspace is available for this account."}
          </p>
          {workspace.activeWorkspace ? (
            <button
              type="button"
              onClick={() => void workspace.refreshWorkspaces()}
              className="mt-4 rounded-lg bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          ) : (
            <form
              className="mt-4 flex gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                setCreating(true);
                setCreateError("");
                try {
                  await workspace.createWorkspace(workspaceName.trim());
                } catch (error) {
                  setCreateError(
                    error.response?.data?.message ||
                      "Unable to create the workspace.",
                  );
                } finally {
                  setCreating(false);
                }
              }}
            >
              <input
                required
                maxLength={120}
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="Workspace name"
                aria-label="Workspace name"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-[#3B66F5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </form>
          )}
          {createError && (
            <p role="alert" className="mt-3 text-xs text-rose-600">
              {createError}
            </p>
          )}
          {workspace.error && !workspace.activeWorkspace && (
            <button
              type="button"
              onClick={() => void workspace.refreshWorkspaces()}
              className="mt-3 text-xs font-semibold text-[#3B66F5] hover:underline"
            >
              Retry loading workspaces
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <PlannerApplication onNavigate={onNavigate} />
  );
}

function PlannerApplication({ onNavigate }) {
  const {
    user,
    signOut,
    notificationSettings,
    saveNotificationSettings,
  } = useAuth();
  const workspace = useWorkspace();
  const [guestImportTasks, setGuestImportTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(GUEST_TASKS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [guestImportDismissed, setGuestImportDismissed] = useState(false);
  const [guestImporting, setGuestImporting] = useState(false);
  const [guestImportError, setGuestImportError] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("todo_onboarded"),
  );
  const tasks = useTasks(workspace.activeWorkspaceId);
  const alarm = useUpcomingAlarms({
    enabled: notificationSettings.notificationPreferences.mobileAlarm,
    leadTimeMinutes:
      notificationSettings.notificationPreferences.leadTimeMinutes,
    workspaceId: workspace.activeWorkspaceId,
    onMarkCompleted: tasks.toggleTaskStatus,
  });
  const calendar = useCalendarNavigation();
  const board = useTaskBoard({
    weeksData: tasks.weeksData,
    currentMonday: calendar.currentMonday,
    selectedDate: calendar.selectedDate,
    today: calendar.today,
    viewAllWeek: calendar.viewAllWeek,
  });
  const dialogs = useTaskDialogs();
  const openEditTask = dialogs.openEditTask;

  useEffect(() => {
    if (workspace.isViewer || tasks.loading) return;
    const url = new URL(window.location.href);
    const taskId = url.searchParams.get("task");
    if (!taskId) return;

    const task = tasks.weeksData
      .flatMap((week) => week.tasks)
      .find((item) => item._id === taskId);
    if (task) openEditTask(task, false, document.body);

    url.searchParams.delete("task");
    window.history.replaceState({}, "", url);
  }, [
    openEditTask,
    tasks.loading,
    tasks.weeksData,
    workspace.isViewer,
  ]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem("todo_onboarded", "true");
    setShowOnboarding(false);
  };
  const handleLogout = async () => {
    await signOut();
    onNavigate("/login", true);
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
      await tasks.saveTask(payload, dialogs.editingTask);
      dialogs.closeTaskModal();
    } catch (saveError) {
      calendar.restoreNavigation(previousView);
      board.restoreStatusFilter(previousView.selectedStatus);
      throw saveError;
    }
  };
  const handleImportGuestTasks = async () => {
    setGuestImporting(true);
    setGuestImportError("");
    try {
      let remainingTasks = [...guestImportTasks];
      const pendingTasks = [...remainingTasks];
      for (const task of pendingTasks) {
        await createTaskApi({
          title: task.title,
          description: task.description || "",
          dateTime: task.dateTime || task.scheduledAt,
          priority: task.priority || "Medium",
          status: task.status || "In Progress",
        });
        remainingTasks = remainingTasks.filter(
          (item) => item._id !== task._id,
        );
        if (remainingTasks.length > 0) {
          localStorage.setItem(
            GUEST_TASKS_STORAGE_KEY,
            JSON.stringify(remainingTasks),
          );
        } else {
          localStorage.removeItem(GUEST_TASKS_STORAGE_KEY);
          localStorage.setItem(GUEST_TASKS_IMPORTED_KEY, "true");
        }
        setGuestImportTasks(remainingTasks);
      }
      tasks.refresh();
    } catch (error) {
      setGuestImportError(
        error.response?.data?.message ||
          "Some tasks could not be imported. Your remaining demo tasks are still saved in this browser.",
      );
    } finally {
      setGuestImporting(false);
    }
  };

  return showOnboarding ? (
    <OnboardingScreen onGetStarted={handleCompleteOnboarding} />
  ) : (
    <PlannerPage
      tasks={tasks}
      calendar={calendar}
      board={board}
      dialogs={dialogs}
      user={user}
      workspace={workspace}
      onLogout={handleLogout}
      notificationSettings={notificationSettings}
      onSaveNotificationSettings={saveNotificationSettings}
      upcomingAlarm={{
        alarm: alarm.alarm,
        error: alarm.error,
        soundNeedsGesture: alarm.soundNeedsGesture,
        onEnableSound: alarm.enableSound,
        onSnooze: alarm.snooze,
        onComplete: alarm.markCompleted,
        onDismiss: alarm.dismiss,
      }}
      canCompleteAlarm={!workspace.isViewer}
      onSaveTask={handleSaveTask}
      guestImport={
        guestImportDismissed || guestImportTasks.length === 0
          ? null
          : {
              count: guestImportTasks.length,
              importing: guestImporting,
              error: guestImportError,
              onImport: handleImportGuestTasks,
              onDismiss: () => setGuestImportDismissed(true),
            }
      }
    />
  );
}
