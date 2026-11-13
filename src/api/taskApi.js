import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: `${API_URL}/tasks`,
  headers: { "Content-Type": "application/json" },
  timeout: 35000,
});

const retryReadRequest = async (request, signal) => {
  const maxRetries = 2;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const isCanceled =
        axios.isCancel(error) || error?.code === "ERR_CANCELED";
      const isTransient =
        !error?.response || error.response.status >= 500;
      if (isCanceled || !isTransient || attempt >= maxRetries) throw error;

      await new Promise((resolve, reject) => {
        const cleanup = () => signal?.removeEventListener("abort", cancel);
        const timer = setTimeout(() => {
          cleanup();
          resolve();
        }, 500 * 2 ** attempt);
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

export const fetchWeeklySummary = async (signal) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const { data } = await retryReadRequest(
    () => api.get("/weekly-summary", { params: { timezone }, signal }),
    signal,
  );
  return data.data;
};

export const searchTasksApi = async (search, signal) => {
  const { data } = await retryReadRequest(
    () => api.get("/", { params: { search }, signal }),
    signal,
  );
  return data.data;
};

export const createTaskApi = async (payload) => {
  const { data } = await api.post("/", payload);
  return data.data;
};

export const updateTaskApi = async (id, payload) => {
  const { data } = await api.patch(`/${id}`, payload);
  return data.data;
};

export const updateTaskStatusApi = async (id, status) => {
  const { data } = await api.patch(`/${id}/status`, { status });
  return data.data;
};

export const deleteTaskApi = async (id) => {
  const { data } = await api.delete(`/${id}`);
  return data;
};
