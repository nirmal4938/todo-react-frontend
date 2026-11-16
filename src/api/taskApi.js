import axios from "axios";
import { createAuthenticatedApiClient } from "./authApi";

const api = createAuthenticatedApiClient();

const retryReadRequest = async (request, signal) => {
  const maxRetries = 2;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const isCanceled =
        axios.isCancel(error) || error?.code === "ERR_CANCELED";
      const isTransient = !error?.response || error.response.status >= 500;
      if (isCanceled || !isTransient || attempt >= maxRetries) throw error;

      await new Promise((resolve, reject) => {
        const cleanup = () => signal?.removeEventListener("abort", cancel);
        const timer = setTimeout(
          () => {
            cleanup();
            resolve();
          },
          500 * 2 ** attempt,
        );
        const cancel = () => {
          clearTimeout(timer);
          cleanup();
          reject(new axios.CanceledError("Request canceled"));
        };
        if (signal?.aborted) {
          cancel();
        } else {
          signal?.addEventListener("abort", cancel, { once: true });
        }
      });
    }
  }
};

const normalizeTask = (task) => ({
  ...task,
  scheduledAt: task.scheduledAt || task.dateTime,
  dateTime: task.dateTime || task.scheduledAt,
});

export const fetchWeeklySummary = async (signal) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const { data } = await retryReadRequest(
    () =>
      api.get("/api/tasks/weekly-summary", { params: { timezone }, signal }),
    signal,
  );
  return (data.data || []).map((week) => ({
    ...week,
    tasks: (week.tasks || []).map(normalizeTask),
  }));
};

export const searchTasksApi = async (search, signal) => {
  const { data } = await retryReadRequest(
    () => api.get("/tasks", { params: { search }, signal }),
    signal,
  );
  return (data.data || []).map(normalizeTask);
};

export const createTaskApi = async (payload) => {
  const { data } = await api.post("/api/tasks", payload);
  return data.data ? normalizeTask(data.data) : data.data;
};

export const updateTaskApi = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data.data ? normalizeTask(data.data) : data.data;
};

export const updateTaskStatusApi = async (id, status) => {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return data.data;
};

export const deleteTaskApi = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};
