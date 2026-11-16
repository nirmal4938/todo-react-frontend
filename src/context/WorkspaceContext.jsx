import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WorkspaceContext } from "./workspaceContextValue";
import {
  createWorkspaceApi,
  fetchWorkspacesApi,
  inviteWorkspaceMemberApi,
  updateWorkspaceMemberRoleApi,
} from "../api/workspaceApi";
import { setActiveWorkspaceId } from "../api/authApi";

const LAST_WORKSPACE_KEY_PREFIX = "todo_active_workspace:";

const workspaceIdOf = (workspace) => String(workspace?._id || workspace?.id || "");
const normalizeId = (value) =>
  String(value?._id || value?.id || value || "");

const getMemberRole = (workspace, userId) =>
  workspace?.members?.find(
    (member) => String(member.userId?._id || member.userId) === String(userId),
  )?.role || null;

const describeWorkspaceError = (error) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 401) {
    return serverMessage || "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return serverMessage || "You do not have permission to access these workspaces.";
  }
  if (status >= 500) {
    return serverMessage || "The server could not load your workspaces. Please retry.";
  }
  if (!error.response) {
    return "Could not reach the server. Check your connection or API CORS settings, then retry.";
  }
  return serverMessage || `Unable to load workspaces (HTTP ${status}). Please retry.`;
};

export function WorkspaceProvider({ user, accessToken, children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUserId = String(user?.id || user?._id || "");
  const defaultWorkspaceId = normalizeId(user?.defaultWorkspaceId);
  const lastWorkspaceKey = currentUserId
    ? `${LAST_WORKSPACE_KEY_PREFIX}${currentUserId}`
    : "";
  const credentialsReady = Boolean(currentUserId && accessToken);

  const selectWorkspace = useCallback((workspace) => {
    setActiveWorkspace(workspace);
    const id = workspaceIdOf(workspace);
    setActiveWorkspaceId(id);
    if (!lastWorkspaceKey) return;
    if (id) localStorage.setItem(lastWorkspaceKey, id);
    else localStorage.removeItem(lastWorkspaceKey);
  }, [lastWorkspaceKey]);

  const refreshWorkspaces = useCallback(
    async (preferredId) => {
      if (!credentialsReady) {
        setLoading(true);
        return false;
      }

      setLoading(true);
      try {
        const nextWorkspaces = await fetchWorkspacesApi();
        setError("");
        setWorkspaces(nextWorkspaces);
        const rememberedId =
          preferredId ||
          (lastWorkspaceKey && localStorage.getItem(lastWorkspaceKey)) ||
          defaultWorkspaceId;
        const selected =
          nextWorkspaces.find(
            (workspace) => workspaceIdOf(workspace) === normalizeId(rememberedId),
          ) || nextWorkspaces[0] || null;
        selectWorkspace(selected);
        return true;
      } catch (requestError) {
        const status = requestError.response?.status;
        console.error("Failed to load workspaces", {
          status: status ?? null,
          code: requestError.code ?? null,
          message: requestError.message,
          response: requestError.response?.data ?? null,
        });
        setError(describeWorkspaceError(requestError));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [credentialsReady, defaultWorkspaceId, lastWorkspaceKey, selectWorkspace],
  );

  useEffect(() => {
    if (!credentialsReady) return undefined;
    const timer = window.setTimeout(() => {
      void refreshWorkspaces();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [credentialsReady, refreshWorkspaces]);

  const switchWorkspace = useCallback(
    (workspaceId) => {
      const workspace = workspaces.find(
        (item) => workspaceIdOf(item) === String(workspaceId),
      );
      if (workspace) selectWorkspace(workspace);
    },
    [selectWorkspace, workspaces],
  );

  const createWorkspace = useCallback(
    async (name) => {
      const workspace = await createWorkspaceApi(name);
      await refreshWorkspaces(workspaceIdOf(workspace));
      return workspace;
    },
    [refreshWorkspaces],
  );

  const inviteMember = useCallback(
    async (email, role) => {
      if (!activeWorkspace) throw new Error("Select a workspace first.");
      await inviteWorkspaceMemberApi(workspaceIdOf(activeWorkspace), {
        email,
        role,
      });
      await refreshWorkspaces(workspaceIdOf(activeWorkspace));
    },
    [activeWorkspace, refreshWorkspaces],
  );

  const changeMemberRole = useCallback(
    async (userId, role) => {
      if (!activeWorkspace) throw new Error("Select a workspace first.");
      await updateWorkspaceMemberRoleApi(
        workspaceIdOf(activeWorkspace),
        userId,
        role,
      );
      await refreshWorkspaces(workspaceIdOf(activeWorkspace));
    },
    [activeWorkspace, refreshWorkspaces],
  );

  const role = getMemberRole(activeWorkspace, currentUserId);
  const value = useMemo(
    () => ({
      workspaces,
      activeWorkspace,
      activeWorkspaceId: workspaceIdOf(activeWorkspace),
      role,
      loading,
      error,
      isViewer: role === "VIEWER",
      selectWorkspace: switchWorkspace,
      refreshWorkspaces,
      createWorkspace,
      inviteMember,
      changeMemberRole,
    }),
    [
      workspaces,
      activeWorkspace,
      role,
      loading,
      error,
      switchWorkspace,
      refreshWorkspaces,
      createWorkspace,
      inviteMember,
      changeMemberRole,
    ],
  );
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
