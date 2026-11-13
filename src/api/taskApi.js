import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: `${API_URL}/tasks`,
  headers: { "Content-Type": "application/json" },
});

export const fetchWeeklySummary = async () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const { data } = await api.get("/weekly-summary", { params: { timezone } });
  return data.data;
};

export const searchTasksApi = async (search) => {
  const { data } = await api.get("/", { params: { search } });
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
