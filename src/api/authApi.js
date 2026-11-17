import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
const API_ORIGIN = API_URL.replace(/\/api(?:\/v1)?$/, "");

const authClient = axios.create({
  baseURL: `${API_ORIGIN}/api/auth`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 35000,
});

let accessToken = null;
let activeWorkspaceId = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const setActiveWorkspaceId = (workspaceId) => {
  activeWorkspaceId = workspaceId ? String(workspaceId) : null;
};

const setSession = (session) => {
  const normalizedSession = session?.data ?? session;
  if (!normalizedSession?.accessToken || !normalizedSession?.user) {
    throw new Error("Authentication response did not include a valid session.");
  }

  setAccessToken(normalizedSession.accessToken);
  const userId = normalizedSession.user?.id || normalizedSession.user?._id;
  const lastWorkspaceId = userId
    ? localStorage.getItem(`todo_active_workspace:${userId}`)
    : null;
  setActiveWorkspaceId(
    lastWorkspaceId || normalizedSession.user?.defaultWorkspaceId,
  );
  return normalizedSession;
};

const clearAuth = () => {
  setAccessToken(null);
  setActiveWorkspaceId(null);
  localStorage.removeItem("todo_workspace_id");
  localStorage.removeItem("todo_active_workspace_id");
};

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = authClient
      .post("/refresh")
      .then(({ data }) => {
        return setSession(data.data);
      })
      .catch((error) => {
        clearAuth();
        window.dispatchEvent(new Event("auth:expired"));
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (activeWorkspaceId) {
    config.headers["x-workspace-id"] = activeWorkspaceId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const cacheStatus = response.headers["x-cache"]?.toUpperCase();
    if (
      import.meta.env.DEV &&
      (cacheStatus === "HIT" || cacheStatus === "MISS")
    ) {
      console.info(
        `[API cache] ${response.config.method?.toUpperCase()} ${response.config.url}: ${cacheStatus}`,
      );
    }
    return response;
  },
  async (error) => {
    const request = error.config;
    if (error.response?.status === 403) {
      window.dispatchEvent(
        new CustomEvent("api:forbidden", {
          detail: {
            message:
              error.response.data?.message ||
              "Your workspace role does not allow this action.",
          },
        }),
      );
    }
    if (error.response?.status !== 401 || !request || request._retry) {
      throw error;
    }

    request._retry = true;
    await refreshSession();
    return api(request);
  },
);

const submitCredentials = async (endpoint, credentials) => {
  const { data } = await authClient.post(endpoint, credentials);
  return setSession(data.data);
};

export const register = (credentials) =>
  submitCredentials("/register", credentials);

export const login = (credentials) => submitCredentials("/login", credentials);

export const restoreSession = refreshSession;

export const logout = async () => {
  try {
    await authClient.post("/logout");
  } finally {
    clearAuth();
  }
};

export const createAuthenticatedApiClient = () => api;
