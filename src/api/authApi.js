import axios from "axios";

const LOCAL_API_URL = "http://localhost:5000/api";
const normalizeApiUrl = (value) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return LOCAL_API_URL;

  if (trimmedValue.startsWith("/")) {
    const relativePath = `/${trimmedValue.replace(/^\/+|\/+$/g, "")}`;
    if (relativePath === "/") return "/api";
    const normalizedRelativePath = relativePath
      .replace(/\/api\/v\d+$/i, "/api")
      .replace(/\/+$/, "");
    if (/\/api$/i.test(normalizedRelativePath)) return normalizedRelativePath;
    return `${normalizedRelativePath}/api`;
  }

  const absoluteUrl = trimmedValue.replace(/\/+$/, "");
  if (/\/api\/v\d+$/i.test(absoluteUrl)) {
    return absoluteUrl.replace(/\/api\/v\d+$/i, "/api");
  }
  return /\/api$/i.test(absoluteUrl) ? absoluteUrl : `${absoluteUrl}/api`;
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);
const API_ORIGIN = API_URL.startsWith("/")
  ? ""
  : API_URL.replace(/\/api$/i, "");

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

  if (normalizedSession.refreshToken) {
    localStorage.setItem("todo_refresh_token", normalizedSession.refreshToken);
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
  localStorage.removeItem("todo_refresh_token");
};

const refreshSession = () => {
  if (!refreshPromise) {
    const storedRefreshToken = localStorage.getItem("todo_refresh_token");
    refreshPromise = authClient
      .post("/refresh", storedRefreshToken ? { refreshToken: storedRefreshToken } : {})
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

export const forgotPasswordApi = async (email) => {
  const { data } = await authClient.post("/forgot-password", { email });
  return data;
};

export const verifyResetTokenApi = async (token) => {
  const { data } = await authClient.get("/reset-password/verify", {
    params: { token },
  });
  return data;
};

export const resetPasswordApi = async ({ token, password }) => {
  const { data } = await authClient.post("/reset-password", {
    token,
    password,
  });
  return data;
};

export const restoreSession = refreshSession;

export const logout = async () => {
  try {
    const storedRefreshToken = localStorage.getItem("todo_refresh_token");
    await authClient.post("/logout", { refreshToken: storedRefreshToken });
  } finally {
    clearAuth();
  }
};

export const createAuthenticatedApiClient = () => api;
