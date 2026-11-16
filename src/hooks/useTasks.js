import { useCallback, useEffect, useState } from "react";
import {
  createTaskApi,
  deleteTaskApi,
  fetchWeeklySummary,
  updateTaskApi,
  updateTaskStatusApi,
} from "../api/taskApi";
import {
  getMondayOfWeek,
  isSameDay,
  parseLocalWeekStart,
} from "../utils/dateUtils";

const getTaskFromWeeks = (weeks, id) =>
  weeks.flatMap((week) => week.tasks).find((task) => task._id === id);

const updateTaskStatus = (weeks, id, status) =>
  weeks.map((week) => {
    const task = week.tasks.find((item) => item._id === id);
    if (!task || task.status === status) return week;

    const wasCompleted = task.status === "Completed";
    const isCompleted = status === "Completed";
    const completedDelta = Number(isCompleted) - Number(wasCompleted);
    return {
      ...week,
      tasks: week.tasks.map((item) =>
        item._id === id ? { ...item, status } : item,
      ),
      completedTasksCount: week.completedTasksCount + completedDelta,
      openTasksCount: week.openTasksCount - completedDelta,
    };
  });

const removeTask = (weeks, id) =>
  weeks.map((week) => {
    const task = week.tasks.find((item) => item._id === id);
    if (!task) return week;

    const wasCompleted = task.status === "Completed";
    return {
      ...week,
      tasks: week.tasks.filter((item) => item._id !== id),
      totalTasksCount: Math.max(0, week.totalTasksCount - 1),
      completedTasksCount: Math.max(
        0,
        week.completedTasksCount - Number(wasCompleted),
      ),
      openTasksCount: Math.max(
        0,
        week.openTasksCount - Number(!wasCompleted),
      ),
    };
  });

const addTask = (weeks, task) => {
  const weeksWithoutTask = removeTask(weeks, task._id);
  const taskMonday = getMondayOfWeek(new Date(task.scheduledAt || task.dateTime));
  const weekIndex = weeksWithoutTask.findIndex((week) =>
    isSameDay(getMondayOfWeek(parseLocalWeekStart(week.weekStart)), taskMonday),
  );
  const wasCompleted = task.status === "Completed";

  if (weekIndex === -1) {
    const pad = (value) => String(value).padStart(2, "0");
    const localWeekStart = `${taskMonday.getFullYear()}-${pad(
      taskMonday.getMonth() + 1,
    )}-${pad(taskMonday.getDate())}T00:00:00`;
    return [
      ...weeksWithoutTask,
      {
        weekStart: localWeekStart,
        totalTasksCount: 1,
        completedTasksCount: Number(wasCompleted),
        openTasksCount: Number(!wasCompleted),
        tasks: [task],
      },
    ];
  }

  return weeksWithoutTask.map((week, index) =>
    index === weekIndex
      ? {
          ...week,
          tasks: [...week.tasks, task],
          totalTasksCount: week.totalTasksCount + 1,
          completedTasksCount:
            week.completedTasksCount + Number(wasCompleted),
          openTasksCount: week.openTasksCount + Number(!wasCompleted),
        }
      : week,
  );
};

export default function useTasks(activeWorkspaceId) {
  const [weeksData, setWeeksData] = useState([]);
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingTaskIds, setPendingTaskIds] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = setTimeout(() => setShowColdStartMessage(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const loadWeeks = async () => {
      if (!activeWorkspaceId) {
        setWeeksData([]);
        setLoadedWorkspaceId(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const data = await fetchWeeklySummary(controller.signal);
        if (active) {
          setWeeksData(data || []);
          setLoadedWorkspaceId(activeWorkspaceId);
        }
      } catch {
        if (active) {
          setWeeksData([]);
          setError("Unable to reach the server. Please verify your API URL.");
          setLoadedWorkspaceId(activeWorkspaceId);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWeeks();
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeWorkspaceId, refreshTrigger]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const refresh = useCallback(() => {
    setRefreshTrigger((previous) => previous + 1);
  }, []);

  const retryLoadWeeks = useCallback(() => {
    setShowColdStartMessage(false);
    setLoading(true);
    refresh();
  }, [refresh]);

  const setTaskPending = useCallback((id, isPending) => {
    setPendingTaskIds((previous) => {
      const next = new Set(previous);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const saveTask = useCallback(
    async (payload, editingTask) => {
      const originalTask = editingTask
        ? getTaskFromWeeks(weeksData, editingTask._id) || editingTask
        : null;
      const optimisticId =
        originalTask?._id || `optimistic-${Date.now()}-${Math.random()}`;
      const optimisticTask = {
        ...(originalTask || {}),
        ...payload,
        scheduledAt: payload.dateTime,
        _id: optimisticId,
        status: originalTask?.status || "In Progress",
      };

      setWeeksData((previous) =>
        addTask(
          originalTask
            ? removeTask(previous, originalTask._id)
            : previous,
          optimisticTask,
        ),
      );

      try {
        const savedTask = originalTask
          ? await updateTaskApi(originalTask._id, payload)
          : await createTaskApi(payload);
        const resolvedTask = {
          ...optimisticTask,
          ...(savedTask || {}),
        };
        setWeeksData((previous) =>
          addTask(removeTask(previous, optimisticId), resolvedTask),
        );
        setActionError("");
        showToast(originalTask ? "Task updated" : "Task created");
        refresh();
        return new Date(payload.dateTime);
      } catch (requestError) {
        setWeeksData((previous) => {
          const withoutOptimistic = removeTask(previous, optimisticId);
          return originalTask ? addTask(withoutOptimistic, originalTask) : withoutOptimistic;
        });
        const message =
          typeof requestError?.response?.data?.message === "string"
            ? requestError.response.data.message
            : "Could not save this task. Please try again.";
        showToast(message, "error");
        throw requestError;
      }
    },
    [refresh, showToast, weeksData],
  );

  const toggleTaskStatus = useCallback(
    async (task) => {
      const previousStatus = task.status;
      const nextStatus =
        previousStatus === "Completed" ? "In Progress" : "Completed";
      setTaskPending(task._id, true);
      setWeeksData((previous) =>
        updateTaskStatus(previous, task._id, nextStatus),
      );
      try {
        await updateTaskStatusApi(task._id, nextStatus);
        setActionError("");
        showToast(
          nextStatus === "Completed"
            ? "Task completed"
            : "Task marked in progress",
        );
        refresh();
        return true;
      } catch {
        setWeeksData((previous) =>
          updateTaskStatus(previous, task._id, previousStatus),
        );
        const message = "Could not update this task. Please try again.";
        setActionError(message);
        showToast(message, "error");
        return false;
      } finally {
        setTaskPending(task._id, false);
      }
    },
    [refresh, setTaskPending, showToast],
  );

  const deleteTask = useCallback(
    async (id) => {
      const taskToDelete = getTaskFromWeeks(weeksData, id);
      setTaskPending(id, true);
      if (taskToDelete) {
        setWeeksData((previous) => removeTask(previous, id));
      }
      try {
        await deleteTaskApi(id);
        setActionError("");
        showToast("Task deleted");
        refresh();
        return true;
      } catch {
        if (taskToDelete) {
          setWeeksData((previous) => addTask(previous, taskToDelete));
        }
        const message = "Could not delete this task. Please try again.";
        setActionError(message);
        showToast(message, "error");
        return false;
      } finally {
        setTaskPending(id, false);
      }
    },
    [refresh, setTaskPending, showToast, weeksData],
  );

  return {
    weeksData:
      loadedWorkspaceId === activeWorkspaceId ? weeksData : [],
    loading: loading || loadedWorkspaceId !== activeWorkspaceId,
    error,
    actionError,
    pendingTaskIds,
    toast,
    showColdStartMessage,
    refreshTrigger,
    retryLoadWeeks,
    saveTask,
    toggleTaskStatus,
    deleteTask,
  };
}
