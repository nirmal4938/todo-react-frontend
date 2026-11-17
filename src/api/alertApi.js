import { createAuthenticatedApiClient } from "./authApi";

const api = createAuthenticatedApiClient();

export const saveNotificationSettingsApi = async (settings) => {
  const { data } = await api.patch("/api/auth/notifications", settings);
  return data.data;
};

export const fetchUpcomingAlarmsApi = async (signal) => {
  const { data } = await api.get("/api/tasks/upcoming-alarms", { signal });
  return data.data || [];
};

export const downloadTaskAlarmApi = async (taskId, title) => {
  const { data } = await api.get(`/api/tasks/${taskId}/alarm.ics`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `task-${taskId}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return title;
};

export const getCalendarFeedUrl = (userId) => {
  const baseURL = api.defaults.baseURL.replace(/\/+$/, "");
  const apiOrigin = baseURL.replace(/\/api(?:\/v1)?$/, "");
  return `${apiOrigin}/api/calendar/feed/${encodeURIComponent(userId)}.ics`;
};
