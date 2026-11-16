import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMondayOfWeek } from "../utils/dateUtils";
import {
  GUEST_TASKS_IMPORTED_KEY,
  GUEST_TASKS_STORAGE_KEY,
} from "./guestSandboxStorage";
import { GuestSandboxContext } from "./guestSandboxContextValue";


const localDateTime = (daysFromMonday, hour, minute = 0) => {
  const date = getMondayOfWeek(new Date());
  date.setDate(date.getDate() + daysFromMonday);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const makeSeedTasks = () => [
  {
    _id: "guest-weekly-review",
    title: "Plan the week ahead",
    description: "Choose the three priorities to focus on.",
    dateTime: localDateTime(-5, 9),
    scheduledAt: localDateTime(-5, 9),
    priority: "High",
    status: "Completed",
  },
  {
    _id: "guest-client-follow-up",
    title: "Send client project update",
    description: "Share milestones and next steps.",
    dateTime: localDateTime(-2, 14),
    scheduledAt: localDateTime(-2, 14),
    priority: "Medium",
    status: "In Progress",
  },
  {
    _id: "guest-design-review",
    title: "Review the new dashboard design",
    description: "Collect feedback before the handoff.",
    dateTime: localDateTime(0, 10),
    scheduledAt: localDateTime(0, 10),
    priority: "High",
    status: "In Progress",
  },
  {
    _id: "guest-grocery-list",
    title: "Pick up groceries",
    description: "Fruit, coffee, and ingredients for dinner.",
    dateTime: localDateTime(1, 17, 30),
    scheduledAt: localDateTime(1, 17, 30),
    priority: "Low",
    status: "Completed",
  },
  {
    _id: "guest-team-demo",
    title: "Prepare the team demo",
    description: "Polish the walkthrough and test each flow.",
    dateTime: localDateTime(3, 11),
    scheduledAt: localDateTime(3, 11),
    priority: "High",
    status: "In Progress",
  },
  {
    _id: "guest-weekend-run",
    title: "Go for a weekend run",
    description: "Take the river trail if the weather is nice.",
    dateTime: localDateTime(5, 8),
    scheduledAt: localDateTime(5, 8),
    priority: "Low",
    status: "In Progress",
  },
  {
    _id: "guest-weekly-wrap",
    title: "Review this week's wins",
    description: "Capture progress and choose one lesson to carry forward.",
    dateTime: localDateTime(6, 16),
    scheduledAt: localDateTime(6, 16),
    priority: "Low",
    status: "Completed",
  },
  {
    _id: "guest-next-week-budget",
    title: "Review next month's budget",
    description: "Check subscriptions and upcoming expenses.",
    dateTime: localDateTime(8, 13),
    scheduledAt: localDateTime(8, 13),
    priority: "Medium",
    status: "In Progress",
  },
];

const loadTasks = () => {
  try {
    const stored = localStorage.getItem(GUEST_TASKS_STORAGE_KEY);
    if (stored === null) {
      return localStorage.getItem(GUEST_TASKS_IMPORTED_KEY) === "true"
        ? []
        : makeSeedTasks();
    }
    const tasks = JSON.parse(stored);
    return Array.isArray(tasks) ? tasks : makeSeedTasks();
  } catch {
    return makeSeedTasks();
  }
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const groupTasksByWeek = (tasks) => {
  const groups = new Map();
  for (const task of tasks) {
    const taskDate = new Date(task.dateTime || task.scheduledAt);
    if (Number.isNaN(taskDate.getTime())) continue;
    const monday = getMondayOfWeek(taskDate);
    const weekStart = formatDate(monday);
    if (!groups.has(weekStart)) {
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      groups.set(weekStart, {
        weekStart,
        weekEnd: formatDate(sunday),
        tasks: [],
        openTasksCount: 0,
        completedTasksCount: 0,
        totalTasksCount: 0,
      });
    }

    const group = groups.get(weekStart);
    group.tasks.push(task);
    group.totalTasksCount += 1;
    if (task.status === "Completed") group.completedTasksCount += 1;
    else group.openTasksCount += 1;
  }

  return [...groups.values()]
    .map((week) => ({
      ...week,
      openCount: week.openTasksCount,
      completedCount: week.completedTasksCount,
      tasks: week.tasks.sort(
        (a, b) =>
          new Date(a.dateTime || a.scheduledAt) -
          new Date(b.dateTime || b.scheduledAt),
      ),
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
};

export function GuestSandboxProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks);
  const [toast, setToast] = useState(null);
  const weeksData = useMemo(() => groupTasksByWeek(tasks), [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      window.setTimeout(
        () =>
          window.dispatchEvent(
            new CustomEvent("guest:storage-error", {
              detail: {
                message:
                  error instanceof Error
                    ? error.message
                    : "Browser storage is unavailable.",
              },
            }),
          ),
        0,
      );
    }
  }, [tasks]);

  useEffect(() => {
    const handleStorageError = () =>
      setToast({
        message: "Browser storage is unavailable; demo changes may not persist.",
        type: "error",
      });
    window.addEventListener("guest:storage-error", handleStorageError);
    return () =>
      window.removeEventListener("guest:storage-error", handleStorageError);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const saveTask = useCallback(async (payload, editingTask) => {
    const existingId = editingTask?._id;
    const task = {
      ...(editingTask || {}),
      ...payload,
      _id: existingId || `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      dateTime: payload.dateTime,
      scheduledAt: payload.dateTime,
      status: editingTask?.status || "In Progress",
    };
    setTasks((current) =>
      existingId
        ? current.map((item) => (item._id === existingId ? task : item))
        : [...current, task],
    );
    setToast({
      message: existingId ? "Demo task updated" : "Demo task created",
      type: "success",
    });
    return new Date(payload.dateTime);
  }, []);

  const toggleTaskStatus = useCallback(async (task) => {
    const nextStatus =
      task.status === "Completed" ? "In Progress" : "Completed";
    setTasks((current) =>
      current.map((item) =>
        item._id === task._id ? { ...item, status: nextStatus } : item,
      ),
    );
    setToast({
      message:
        nextStatus === "Completed"
          ? "Demo task completed"
          : "Demo task marked in progress",
      type: "success",
    });
    return true;
  }, []);

  const deleteTask = useCallback(async (id) => {
    setTasks((current) => current.filter((task) => task._id !== id));
    setToast({ message: "Demo task deleted", type: "success" });
    return true;
  }, []);

  const resetTasks = useCallback(() => {
    localStorage.removeItem(GUEST_TASKS_IMPORTED_KEY);
    setTasks(makeSeedTasks());
    setToast({ message: "Demo data reset", type: "success" });
  }, []);

  const searchTasks = useCallback(
    async (query) => {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return tasks;
      return tasks.filter((task) =>
        `${task.title} ${task.description || ""}`
          .toLowerCase()
          .includes(normalizedQuery),
      );
    },
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      weeksData,
      toast,
      saveTask,
      toggleTaskStatus,
      deleteTask,
      resetTasks,
      searchTasks,
    }),
    [
      tasks,
      weeksData,
      toast,
      saveTask,
      toggleTaskStatus,
      deleteTask,
      resetTasks,
      searchTasks,
    ],
  );

  return (
    <GuestSandboxContext.Provider value={value}>
      {children}
    </GuestSandboxContext.Provider>
  );
}
