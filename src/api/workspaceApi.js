import { createAuthenticatedApiClient } from "./authApi";

const api = createAuthenticatedApiClient();

export const fetchWorkspacesApi = async () => {
  const response = await api.get("/workspaces");
  const workspaces =
    response.data?.workspaces ?? response.data?.data ?? response.data;
  return Array.isArray(workspaces) ? workspaces : [];
};

export const createWorkspaceApi = async (name) => {
  const response = await api.post("/workspaces", { name });
  return response.data?.workspace ?? response.data?.data ?? response.data;
};

export const inviteWorkspaceMemberApi = async (workspaceId, payload) => {
  const { data } = await api.post(
    `/workspaces/${workspaceId}/members`,
    payload,
  );
  return data.data;
};

export const updateWorkspaceMemberRoleApi = async (
  workspaceId,
  userId,
  role,
) => {
  const { data } = await api.patch(
    `/workspaces/${workspaceId}/members/${userId}`,
    { role },
  );
  return data.data;
};
